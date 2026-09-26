import assert from "node:assert/strict";
import { test } from "node:test";
import { createRunImageResolver } from "./codex-image-budget.ts";

void test("caches duplicate downloads but accounts each forwarded image", async () => {
  const controller = new AbortController();
  let downloads = 0;
  const resolve = createRunImageResolver(
    () => {
      downloads++;
      return Promise.resolve("data:image/png;base64,aW1hZ2U=");
    },
    controller.signal,
    { maxImages: 2, maxBytes: 9, maxConcurrentDownloads: 1 },
  );
  const results = await Promise.allSettled([
    resolve("https://example.com/same.png"),
    resolve("https://example.com/same.png"),
  ]);
  assert.equal(downloads, 1);
  assert.deepEqual(
    results.map((result) => result.status),
    ["fulfilled", "rejected"],
  );
  assert.match(
    String(results[1]?.status === "rejected" && results[1].reason),
    /aggregate per-run limit/,
  );
});

void test("abort rejects active and queued image resolutions", async () => {
  const controller = new AbortController();
  let started = 0;
  const resolve = createRunImageResolver(
    (_url, signal) => {
      started++;
      return new Promise((_resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- Match resolver cancellation by preserving AbortSignal.reason.
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      });
    },
    controller.signal,
    {
      maxImages: 5,
      maxImageBytes: 50,
      maxBytes: 100,
      maxConcurrentDownloads: 2,
    },
  );
  const pending = Array.from({ length: 5 }, (_, index) =>
    resolve(`https://example.com/${index}.png`),
  );
  await new Promise<void>((done) => setImmediate(done));
  assert.equal(started, 2);
  controller.abort(new Error("cancelled"));
  const results = await Promise.allSettled(pending);
  assert.equal(
    results.filter((result) => result.status === "rejected").length,
    5,
  );
});

void test("uses an exact final allowance for valid aggregate-boundary sets", async () => {
  const image = "data:image/png;base64,aW1hZw==";
  for (const cached of [false, true]) {
    let downloads = 0;
    const allowances: number[] = [];
    const resolve = createRunImageResolver(
      async (_url, _signal, allowance) => {
        downloads++;
        allowances.push(allowance);
        await new Promise<void>((done) => setImmediate(done));
        return image;
      },
      new AbortController().signal,
      {
        maxImages: 5,
        maxImageBytes: 5,
        maxBytes: 20,
        maxConcurrentDownloads: 4,
      },
    );
    const results = await Promise.allSettled(
      Array.from({ length: 5 }, (_, index) =>
        resolve(cached ? "same" : String(index)),
      ),
    );
    assert.ok(results.every((result) => result.status === "fulfilled"));
    assert.equal(downloads, cached ? 1 : 5);
    assert.deepEqual(allowances, cached ? [5] : [5, 5, 5, 5, 4]);
  }
});

void test("accounts completed bytes before admitting queued resolutions", async () => {
  const image = "data:image/png;base64,aW1hZ2U=";
  let started = 0;
  let completed = 0;
  const resolve = createRunImageResolver(
    async () => {
      started++;
      await new Promise<void>((done) => setImmediate(done));
      completed++;
      return image;
    },
    new AbortController().signal,
    {
      maxImages: 20,
      maxImageBytes: 5,
      maxBytes: 20,
      maxConcurrentDownloads: 4,
    },
  );
  const results = await Promise.allSettled(
    Array.from({ length: 20 }, (_, index) =>
      resolve(`https://example.com/${index}.png`),
    ),
  );
  assert.deepEqual({ started, completed }, { started: 4, completed: 4 });
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    4,
  );
});
