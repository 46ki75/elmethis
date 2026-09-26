import { AsyncLocalStorage } from "node:async_hooks";
import {
  createCopilotHonoHandler,
  type AgentRunner,
  type AgentRunnerRunRequest,
} from "@copilotkit/runtime/v2";
import { Hono } from "hono";
import { EMPTY, defer, tap } from "rxjs";

type HandlerOptions = Parameters<typeof createCopilotHonoHandler>[0];

class RunCancellation {
  enabled = false;
  cancelled = false;
  private finished = false;
  private target?: { threadId: string; runId: string };
  private stopping?: Promise<void>;
  private signals = new Set<AbortSignal>();
  closeBody?: () => void;

  private runner: AgentRunner;

  constructor(runner: AgentRunner) {
    this.runner = runner;
  }

  watch(signal: AbortSignal) {
    this.signals.add(signal);
    signal.addEventListener("abort", this.cancel, { once: true });
    if (signal.aborted) {
      this.cancel();
    }
  }

  dispose() {
    for (const signal of this.signals) {
      signal.removeEventListener("abort", this.cancel);
    }
    this.signals.clear();
  }

  cancel = () => {
    this.cancelled = true;
    this.dispose();
    this.closeBody?.();
    if (this.target && !this.finished && !this.stopping) {
      const target = this.target;
      // Never use thread-only stop: a delayed disconnect can outlive its run.
      this.stopping = Promise.resolve()
        .then(() => this.runner.stop(target))
        .then(() => {})
        .catch((error: unknown) => {
          console.error("Failed to stop disconnected CopilotKit run", error);
        });
    }
  };

  run(request: AgentRunnerRunRequest) {
    if (this.cancelled) {
      return EMPTY;
    }

    // AbstractAgent awaits onInitialize before subscribing. An abortRun in that
    // gap can be a no-op, so do not open the native connection afterward.
    request.agent.use((input, next) =>
      defer(() => (this.cancelled ? EMPTY : next.run(input))),
    );
    const events = this.runner.run(request);
    this.target = { threadId: request.threadId, runId: request.input.runId };
    // Also covers synchronous cancellation inside runner.run, before registration.
    if (this.cancelled) {
      this.cancel();
    }
    const finish = () => {
      this.finished = true;
      this.dispose();
    };
    return events.pipe(tap({ complete: finish, error: finish }));
  }

  wrap(response: Response): Response {
    if (
      !response.body ||
      !response.headers.get("Content-Type")?.startsWith("text/event-stream")
    ) {
      this.cancel();
      return response;
    }
    const reader = response.body.getReader();
    let closed = false;
    let pumping: Promise<void>;
    const body = new ReadableStream<Uint8Array>({
      start: (controller) => {
        this.closeBody = () => {
          if (!closed) {
            closed = true;
            controller.close();
          }
        };
        if (this.cancelled) {
          this.closeBody();
        }
        pumping = (async () => {
          try {
            for (;;) {
              const chunk = await reader.read();
              if (chunk.done) {
                break;
              }
              if (!closed) {
                controller.enqueue(chunk.value);
              }
            }
            this.closeBody?.();
          } catch (error) {
            if (!closed) {
              closed = true;
              controller.error(error);
            }
          } finally {
            // CopilotKit tees the response for afterRequestMiddleware. Cancelling
            // just one branch can hang forever. Stop the runner, then drain its
            // terminal frames unchanged to EOF, including after client disconnect.
            if (!this.finished) {
              this.cancel();
            } else {
              this.dispose();
            }
            reader.releaseLock();
            this.closeBody = undefined;
          }
        })();
      },
      cancel: () => {
        closed = true;
        this.cancel();
        return pumping;
      },
    });
    return new Response(body, response);
  }
}

/** Node/SSE runtime wrapper: only live agent/run requests own cancellation. */
export function createCancellableCopilotHonoHandler(options: HandlerOptions) {
  const requests = new AsyncLocalStorage<RunCancellation>();
  const runner = options.runtime.runner;
  // A facade, not a mutation: other handlers using this runtime retain their
  // replay/connect behavior. Async-local ownership also survives request hooks.
  const scopedRunner = new Proxy(runner, {
    get(target, key, receiver): unknown {
      if (key === "run") {
        return (request: AgentRunnerRunRequest) => {
          const cancellation = requests.getStore();
          return cancellation?.enabled
            ? cancellation.run(request)
            : runner.run(request);
        };
      }
      return Reflect.get(target, key, receiver) as unknown;
    },
  });
  const runtime = new Proxy(options.runtime, {
    get(target, key, receiver): unknown {
      return key === "runner"
        ? scopedRunner
        : (Reflect.get(target, key, receiver) as unknown);
    },
  });
  const handler = createCopilotHonoHandler({
    ...options,
    runtime,
    hooks: {
      ...options.hooks,
      async onBeforeHandler(context) {
        const request =
          (await options.hooks?.onBeforeHandler?.(context)) ?? context.request;
        const cancellation = requests.getStore();
        if (context.route.method !== "agent/run" || !cancellation) {
          return request;
        }
        cancellation.enabled = true;
        cancellation.watch(request.signal);
        // Upstream abort only unsubscribes SSE; it neither stops the runner nor
        // closes the writer. Keep that subscription alive through finalization.
        return new Request(request, { signal: new AbortController().signal });
      },
    },
  });
  const app = new Hono();
  app.use("*", async (context, next) => {
    const cancellation = new RunCancellation(runner);
    cancellation.watch(context.req.raw.signal);
    await requests.run(cancellation, async () => {
      try {
        await next();
        if (cancellation.enabled) {
          context.res = cancellation.wrap(context.res);
        }
      } catch (error) {
        cancellation.cancel();
        throw error;
      } finally {
        if (!cancellation.enabled) {
          cancellation.dispose();
        }
      }
    });
  });
  app.route("/", handler);
  return Object.assign(app, { channels: handler.channels });
}
