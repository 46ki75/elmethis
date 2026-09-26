import assert from "node:assert/strict";
import type { LookupAddress } from "node:dns";
import dns from "node:dns/promises";
import { getEventListeners, once } from "node:events";
import http from "node:http";
import https from "node:https";
import { test, type TestContext } from "node:test";
import { resolveCodexImage } from "./codex-images.ts";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
  "base64",
);
const inline = `data:image/png;base64,${png.toString("base64")}`;
const publicAddress = { address: "93.184.215.14", family: 4 };
const maxBytes = 5 * 1024 * 1024;
const signal = () => new AbortController().signal;

function noNetwork(t: TestContext) {
  const lookup = t.mock.method(dns, "lookup", (): Promise<LookupAddress[]> => {
    assert.fail("Unexpected DNS lookup");
  });
  const request = () => assert.fail("Unexpected network request");
  const httpRequest = t.mock.method(http, "request", request);
  const httpsRequest = t.mock.method(https, "request", request);
  t.after(() => {
    assert.equal(httpRequest.mock.callCount(), 0);
    assert.equal(httpsRequest.mock.callCount(), 0);
  });
  return lookup;
}

// Only this test transport can reach loopback. The production resolver still
// validates DNS and supplies the pinned lookup, which we exercise before
// substituting the loopback destination. No public connection is possible.
async function remote(
  t: TestContext,
  handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
) {
  const server = http.createServer(handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  );
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const lookup = t.mock.method(dns, "lookup", () =>
    Promise.resolve([publicAddress]),
  );
  const requests: http.ClientRequest[] = [];
  const responses: http.IncomingMessage[] = [];
  const urls: URL[] = [];
  const pins: (string | LookupAddress[])[] = [];
  const optionsSeen: http.RequestOptions[] = [];
  const realRequest = http.request;
  const request = (
    url: URL,
    options: Omit<http.RequestOptions, "headers"> & {
      autoSelectFamily: false;
      headers: http.OutgoingHttpHeaders;
    },
  ) => {
    urls.push(url);
    optionsSeen.push(options);
    assert.equal(options.agent, false);
    assert.equal(options.autoSelectFamily, false);
    assert.ok(options.lookup);
    assert.ok(!Array.isArray(options.headers));
    const pinnedLookup = options.lookup;
    const local = new URL(
      `http://offline.test:${address.port}${url.pathname}${url.search}`,
    );
    const req = realRequest(local, {
      ...options,
      family: 4,
      headers: { ...options.headers, host: url.host },
      lookup: (_hostname, lookupOptions, callback) => {
        pinnedLookup(url.hostname, lookupOptions, (error, pinned, family) => {
          assert.equal(error, null);
          assert.ok(family === 4 || family === 6);
          pins.push(pinned);
          callback(null, "127.0.0.1", 4);
        });
      },
    });
    requests.push(req);
    req.on("response", (res) => responses.push(res));
    return req;
  };
  t.mock.method(
    http,
    "request",
    (url: URL, options: Parameters<typeof request>[1]) => {
      assert.equal(url.protocol, "http:");
      return request(url, options);
    },
  );
  t.mock.method(
    https,
    "request",
    (url: URL, options: Parameters<typeof request>[1]) => {
      assert.equal(url.protocol, "https:");
      return request(url, options);
    },
  );
  return { lookup, requests, responses, urls, pins, optionsSeen };
}

void test("keeps supported inline data URLs unchanged without DNS or HTTP", async (t) => {
  noNetwork(t);
  for (const mime of ["png", "jpeg", "webp", "gif"]) {
    const value = inline.replace("image/png", `image/${mime}`);
    assert.equal(await resolveCodexImage(value, signal()), value);
  }
});

void test("enforces a reduced aggregate allowance for inline images", async (t) => {
  noNetwork(t);
  assert.equal(await resolveCodexImage(inline, signal(), png.length), inline);
  await assert.rejects(
    resolveCodexImage(inline, signal(), png.length - 1),
    /aggregate.*allowance/i,
  );
});

void test("rejects invalid inline MIME, empty/malformed base64, and oversized data", async (t) => {
  noNetwork(t);
  for (const value of [
    "data:text/html;base64,SGk=",
    "data:image/svg+xml;base64,PHN2Zy8+",
    "data:image/png;base64,",
    "data:image/png;base64,!bad!",
    "data:image/png;base64,A",
    "data:image/png;base64,AB==",
    "data:image/png;base64,AB",
    "data:image/png;base64,AAB=",
    "data:image/png;base64,AA=",
    "data:image/png;base64,AAAA===",
    "data:image/png;base64,AA==AA==",
    "data:image/png;base64,AA==\n",
    "data:image/png;base64, AA==",
    "data:image/png;base64,_w==",
    "data:image/png;base64,AA%3D%3D",
    "data:image/png;base64,AA==#fragment",
    "data:image/png;charset=utf-8;base64,AA==",
    `data:image/png;base64,${Buffer.alloc(maxBytes + 1).toString("base64")}`,
    `DATA:IMAGE/PNG;BASE64,${Buffer.alloc(maxBytes + 2)
      .toString("base64")
      .replace(/=+$/, "")}`,
  ]) {
    await assert.rejects(
      resolveCodexImage(value, signal()),
      /image|size|limit/i,
    );
  }
});

for (const value of [
  "file:///tmp/image.png",
  "/tmp/image.png",
  "./image.png",
  "C:\\image.png",
  "ftp://images.example/a.png",
  "blob:https://images.example/id",
  "javascript:alert(1)",
  "//images.example/a.png",
  "not a URL",
  "http://",
  "http://user:pass@images.example/a.png",
  "https://user@images.example/a.png",
  "https://@images.example/a.png",
  "http://[fe80::1%25en0]/a.png",
]) {
  void test(`rejects unsupported URL ${value}`, async (t) => {
    const lookup = noNetwork(t);
    await assert.rejects(resolveCodexImage(value, signal()));
    assert.equal(lookup.mock.callCount(), 0);
  });
}

const forbidden = [
  "0.0.0.0",
  "0.255.255.255",
  "10.0.0.1",
  "10.255.255.255",
  "100.64.0.1",
  "100.127.255.255",
  "127.0.0.1",
  "127.255.255.255",
  "169.254.169.254",
  "169.254.255.255",
  "172.16.0.1",
  "172.31.255.255",
  "192.0.0.9",
  "192.0.2.1",
  "192.88.99.1",
  "192.168.1.1",
  "198.18.0.1",
  "198.19.255.255",
  "198.51.100.1",
  "203.0.113.1",
  "224.0.0.1",
  "239.255.255.255",
  "240.0.0.1",
  "255.255.255.255",
  "::",
  "::1",
  "::127.0.0.1",
  "::ffff:127.0.0.1",
  "::ffff:7f00:1",
  "::ffff:192.168.1.1",
  "::ffff:93.184.215.14",
  "64:ff9b::7f00:1",
  "64:ff9b:1::1",
  "100::1",
  "2001::1",
  "2001:2::1",
  "2001:db8::1",
  "2002:7f00:1::1",
  "3ffe::1",
  "3fff::1",
  "5f00::1",
  "fc00::1",
  "fdff::1",
  "fe80::1",
  "febf::1",
  "fec0::1",
  "ff02::1",
];

for (const address of forbidden) {
  void test(`rejects forbidden literal and DNS address ${address}`, async (t) => {
    const lookup = noNetwork(t);
    const host = address.includes(":") ? `[${address}]` : address;
    await assert.rejects(
      resolveCodexImage(`http://${host}/a.png`, signal()),
      /public|address/i,
    );
    assert.equal(lookup.mock.callCount(), 0);
    lookup.mock.mockImplementation(() =>
      Promise.resolve([
        publicAddress,
        { address, family: address.includes(":") ? 6 : 4 },
      ]),
    );
    await assert.rejects(
      resolveCodexImage("https://images.example/a.png", signal()),
      /public|address/i,
    );
  });
}

void test("normalizes alternate IPv4 spellings before validation", async (t) => {
  noNetwork(t);
  for (const host of [
    "127.1",
    "2130706433",
    "0x7f000001",
    "0177.0.0.1",
    "%31%32%37.0.0.1",
  ]) {
    await assert.rejects(
      resolveCodexImage(`http://${host}/a.png`, signal()),
      /public|address/i,
    );
  }
});

void test("converts HTTP and HTTPS images, preserves host/path, pins DNS, and cleans up", async (t) => {
  const seen: string[] = [];
  const net = await remote(t, (req, res) => {
    seen.push(`${req.headers.host}${req.url}`);
    res.writeHead(200, { "Content-Type": "IMAGE/PNG; charset=binary" });
    res.end(png);
  });
  const abort = new AbortController();
  const setTimer = t.mock.method(globalThis, "setTimeout");
  const clearTimer = t.mock.method(globalThis, "clearTimeout");
  for (const protocol of ["http", "https"]) {
    assert.equal(
      await resolveCodexImage(
        `${protocol}://images.example/a.png?q=1#fragment`,
        abort.signal,
      ),
      inline,
    );
  }
  assert.deepEqual(seen, [
    "images.example/a.png?q=1",
    "images.example/a.png?q=1",
  ]);
  assert.deepEqual(net.pins, [publicAddress.address, publicAddress.address]);
  assert.equal(net.lookup.mock.callCount(), 2);
  assert.deepEqual(net.lookup.mock.calls[0]?.arguments, [
    "images.example",
    { all: true, verbatim: true },
  ]);
  for (const options of net.optionsSeen) {
    assert.equal(options.method, "GET");
    assert.equal(options.auth, undefined);
    assert.equal(options.socketPath, undefined);
    assert.deepEqual(options.headers, {
      Accept: "image/png, image/jpeg, image/webp, image/gif",
      "Accept-Encoding": "identity",
    });
  }
  assert.equal(getEventListeners(abort.signal, "abort").length, 0);
  assert.ok(net.requests.every((req) => req.destroyed));
  assert.ok(net.responses.every((res) => res.destroyed));
  const deadlines = setTimer.mock.calls.filter(
    (call) => call.arguments[1] === 10_000,
  );
  assert.equal(deadlines.length, 2);
  assert.ok(
    deadlines.every((call) =>
      clearTimer.mock.calls.some(
        (cleared) => cleared.arguments[0] === call.result,
      ),
    ),
  );
});

void test("supports public IPv4 and IPv6 literals without DNS and public IPv6 DNS", async (t) => {
  const net = await remote(t, (_req, res) => {
    res.writeHead(200, { "content-type": "image/png" });
    res.end(png);
  });
  for (const host of ["93.184.215.14", "[2606:4700:4700::1111]"]) {
    assert.equal(
      await resolveCodexImage(`https://${host}/a`, signal()),
      inline,
    );
  }
  assert.equal(net.lookup.mock.callCount(), 0);
  net.lookup.mock.mockImplementation(() =>
    Promise.resolve([{ address: "2606:4700:4700::1111", family: 6 }]),
  );
  assert.equal(
    await resolveCodexImage("https://images.example/a", signal()),
    inline,
  );
  assert.deepEqual(net.pins, [
    "93.184.215.14",
    "2606:4700:4700::1111",
    "2606:4700:4700::1111",
  ]);
});

void test("never re-resolves DNS when connecting (rebinding defense)", async (t) => {
  const net = await remote(t, (_req, res) => {
    res.writeHead(200, { "content-type": "image/png" });
    res.end(png);
  });
  net.lookup.mock.mockImplementationOnce(() =>
    Promise.resolve([publicAddress]),
  );
  net.lookup.mock.mockImplementation(() =>
    Promise.resolve([{ address: "127.0.0.1", family: 4 }]),
  );
  assert.equal(
    await resolveCodexImage("https://images.example/a", signal()),
    inline,
  );
  assert.equal(net.lookup.mock.callCount(), 1);
  assert.deepEqual(net.pins, [publicAddress.address]);
});

for (const location of [
  "http://127.0.0.1/secret",
  "//[::ffff:127.0.0.1]/secret",
  "file:///secret",
  "https://user:pass@images.example/a",
]) {
  void test(`rejects redirect SSRF to ${location} and destroys the unread response`, async (t) => {
    const net = await remote(t, (_req, res) => {
      res.writeHead(302, { location });
      res.write("body never ends");
    });
    await assert.rejects(
      resolveCodexImage("https://images.example/a", signal()),
    );
    assert.equal(net.requests.length, 1);
    assert.ok(net.requests[0].destroyed);
    assert.ok(net.responses[0].destroyed);
  });
}

void test("revalidates DNS on same-host redirects", async (t) => {
  const net = await remote(t, (_req, res) => {
    res.writeHead(302, { location: "/next" });
    res.end();
  });
  net.lookup.mock.mockImplementationOnce(() =>
    Promise.resolve([publicAddress]),
  );
  net.lookup.mock.mockImplementation(() =>
    Promise.resolve([{ address: "10.0.0.1", family: 4 }]),
  );
  await assert.rejects(
    resolveCodexImage("https://images.example/a", signal()),
    /public|address/i,
  );
  assert.equal(net.lookup.mock.callCount(), 2);
  assert.equal(net.requests.length, 1);
});

void test("follows at most three relative/cross-host redirects", async (t) => {
  const net = await remote(t, (req, res) => {
    const path = req.url;
    if (path === "/final") {
      res.writeHead(200, { "content-type": "image/png" });
      res.end(png);
    } else {
      res.writeHead(path === "/start" ? 301 : path === "/second" ? 307 : 308, {
        location:
          path === "/start"
            ? "/second"
            : path === "/second"
              ? "https://other.example/third"
              : "/final",
      });
      res.end();
    }
  });
  assert.equal(
    await resolveCodexImage("https://images.example/start", signal()),
    inline,
  );
  assert.equal(net.requests.length, 4);
  assert.deepEqual(
    net.urls.map((url) => url.hostname),
    ["images.example", "images.example", "other.example", "other.example"],
  );
});

void test("caps redirect loops", async (t) => {
  const net = await remote(t, (_req, res) => {
    res.writeHead(303, { location: "/again" });
    res.end();
  });
  await assert.rejects(
    resolveCodexImage("http://images.example/again", signal()),
    /redirect/i,
  );
  assert.equal(net.requests.length, 4);
  assert.ok(net.responses.every((res) => res.destroyed));
});

for (const [name, status, headers, body] of [
  ["unsupported MIME", 200, { "content-type": "image/svg+xml" }, "<svg/>"],
  ["missing MIME", 200, {}, png],
  ["empty image", 200, { "content-type": "image/png" }, ""],
  ["HTTP error", 404, { "content-type": "image/png" }, png],
  ["missing redirect target", 302, {}, ""],
  [
    "compressed body",
    200,
    { "content-type": "image/png", "content-encoding": "gzip" },
    png,
  ],
  [
    "oversized Content-Length",
    200,
    { "content-type": "image/png", "content-length": String(maxBytes + 1) },
    png,
  ],
] as const) {
  void test(`rejects ${name} and releases streams`, async (t) => {
    const net = await remote(t, (_req, res) => {
      res.writeHead(status, headers);
      res.end(body);
    });
    await assert.rejects(
      resolveCodexImage("https://images.example/a", signal()),
    );
    assert.ok(net.requests.every((req) => req.destroyed));
    assert.ok(net.responses.every((res) => res.destroyed));
  });
}

void test("enforces a reduced aggregate allowance for remote images", async (t) => {
  const net = await remote(t, (_req, res) => {
    res.writeHead(200, {
      "content-type": "image/png",
      "content-length": png.length,
    });
    res.end(png);
  });
  await assert.rejects(
    resolveCodexImage("https://images.example/a", signal(), png.length - 1),
    /aggregate.*allowance/i,
  );
  assert.ok(net.requests[0].destroyed);
  assert.ok(net.responses[0].destroyed);
});

void test("enforces the streaming size cap without Content-Length", async (t) => {
  const net = await remote(t, (_req, res) => {
    res.writeHead(200, { "content-type": "image/png" });
    res.write(Buffer.alloc(maxBytes + 1));
  });
  await assert.rejects(
    resolveCodexImage("https://images.example/a", signal()),
    /size|limit/i,
  );
  assert.ok(net.requests[0].destroyed);
  assert.ok(net.responses[0].destroyed);
});

void test("rejects truncated response bodies", async (t) => {
  const flushed = Promise.withResolvers<void>();
  let serverResponse: http.ServerResponse | undefined;
  const net = await remote(t, (_req, res) => {
    serverResponse = res;
    res.writeHead(200, {
      "content-type": "image/png",
      "content-length": png.length + 100,
    });
    res.write(png, () => flushed.resolve());
  });
  const pending = assert.rejects(
    resolveCodexImage("https://images.example/a", signal()),
  );
  await flushed.promise;
  serverResponse?.destroy();
  await pending;
  assert.ok(net.requests[0].destroyed);
});

void test("propagates cancellation before work, including inline images", async (t) => {
  noNetwork(t);
  const abort = new AbortController();
  const reason = new Error("caller canceled");
  abort.abort(reason);
  for (const url of [inline, "https://images.example/a"]) {
    await assert.rejects(
      resolveCodexImage(url, abort.signal),
      (error) => error === reason,
    );
  }
});

for (const phase of ["headers", "body"] as const) {
  for (const cause of ["abort", "timeout"] as const) {
    void test(`${cause} while waiting for ${phase} destroys network streams`, async (t) => {
      const ready = Promise.withResolvers<void>();
      const net = await remote(t, (_req, res) => {
        if (phase === "body") {
          res.writeHead(200, { "content-type": "image/png" });
          res.write(png);
        }
        ready.resolve();
      });
      const abort = new AbortController();
      const reason = new Error("caller canceled");
      t.mock.timers.enable({ apis: ["setTimeout"] });
      const pending = assert.rejects(
        resolveCodexImage("https://images.example/a", abort.signal),
        cause === "abort" ? (error) => error === reason : /timed out/i,
      );
      await ready.promise;
      if (phase === "body" && !net.responses.length) {
        await once(net.requests[0], "response");
      }
      const closed = Promise.all(
        net.requests.map(
          (req) => new Promise<void>((resolve) => req.once("close", resolve)),
        ),
      );
      if (cause === "abort") {
        abort.abort(reason);
      } else {
        t.mock.timers.tick(10_000);
      }
      await pending;
      await closed;
      assert.ok(net.requests.every((req) => req.destroyed));
      assert.ok(net.responses.every((res) => res.destroyed));
      assert.equal(getEventListeners(abort.signal, "abort").length, 0);
    });
  }
}

for (const cause of ["abort", "timeout"] as const) {
  void test(`${cause} during DNS rejects promptly and cannot start a late request`, async (t) => {
    const lookup = noNetwork(t);
    const answer = Promise.withResolvers<LookupAddress[]>();
    lookup.mock.mockImplementation(() => answer.promise);
    t.mock.timers.enable({ apis: ["setTimeout"] });
    const abort = new AbortController();
    const reason = new Error("caller canceled");
    const pending = assert.rejects(
      resolveCodexImage("https://images.example/a", abort.signal),
      cause === "abort" ? (error) => error === reason : /timed out/i,
    );
    assert.equal(lookup.mock.callCount(), 1);
    if (cause === "abort") {
      abort.abort(reason);
    } else {
      t.mock.timers.tick(10_000);
    }
    await pending;
    answer.resolve([publicAddress]);
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(getEventListeners(abort.signal, "abort").length, 0);
  });
}

void test("accepts supported remote MIME types", async (t) => {
  await remote(t, (req, res) => {
    res.writeHead(200, { "content-type": `image/${req.url?.slice(1)}` });
    res.end(png);
  });
  for (const mime of ["png", "jpeg", "webp", "gif"]) {
    assert.equal(
      await resolveCodexImage(`https://images.example/${mime}`, signal()),
      inline.replace("image/png", `image/${mime}`),
    );
  }
});

void test("allows the exact size limit for remote and inline data", async (t) => {
  const body = Buffer.alloc(maxBytes);
  body.set(png);
  const expected = `data:image/png;base64,${body.toString("base64")}`;
  await remote(t, (_req, res) => {
    res.writeHead(200, {
      "content-type": "image/png",
      "content-length": body.length,
    });
    res.end(body);
  });
  assert.equal(
    await resolveCodexImage("https://images.example/a", signal()),
    expected,
  );
  assert.equal(await resolveCodexImage(expected, signal()), expected);
  assert.equal(
    await resolveCodexImage(
      expected
        .replace("data:image/png;base64", "DATA:IMAGE/PNG;BASE64")
        .replace(/=+$/, ""),
      signal(),
    ),
    expected,
  );
});

for (const [name, value] of [
  ["unpadded base64", inline.replace(/=+$/, "")],
  ["uppercase MIME", inline.replace("image/png", "IMAGE/PNG")],
  ["uppercase scheme", inline.replace("data:", "DATA:")],
  ["uppercase encoding marker", inline.replace(";base64,", ";BASE64,")],
  [
    "mixed-case header and unpadded base64",
    inline
      .replace("data:image/png;base64", "DaTa:ImAgE/PnG;BaSe64")
      .replace(/=+$/, ""),
  ],
]) {
  void test(`canonicalizes inline ${name} without DNS or HTTP`, async (t) => {
    const lookup = noNetwork(t);
    assert.equal(await resolveCodexImage(value, signal()), inline);
    assert.equal(lookup.mock.callCount(), 0);
  });
}

void test("canonicalizes every supported MIME with zero, one, or two padding characters", async (t) => {
  noNetwork(t);
  for (const mime of ["png", "jpeg", "webp", "gif"]) {
    for (const encoded of ["AAAA", "AAA=", "AA=="]) {
      const expected = `data:image/${mime};base64,${encoded}`;
      for (const payload of [encoded, encoded.replace(/=+$/, "")]) {
        const value = `DATA:IMAGE/${mime.toUpperCase()};BASE64,${payload}`;
        assert.equal(await resolveCodexImage(value, signal()), expected);
      }
    }
  }
});

void test("does not overblock addresses adjacent to private CIDRs", async (t) => {
  const net = await remote(t, (_req, res) => {
    res.writeHead(200, { "content-type": "image/png" });
    res.end(png);
  });
  for (const host of [
    "100.63.255.255",
    "100.128.0.0",
    "172.15.255.255",
    "172.32.0.0",
    "192.167.255.255",
    "192.169.0.0",
    "198.17.255.255",
    "198.20.0.0",
    "[2001:200::1]",
    "[2001:4860:4860::8888]",
    "[2a00:1450::1]",
  ]) {
    assert.equal(await resolveCodexImage(`http://${host}/a`, signal()), inline);
  }
  assert.equal(net.lookup.mock.callCount(), 0);
});

void test("uses one deadline across DNS, redirects and the final body", async (t) => {
  const ready = Promise.withResolvers<void>();
  const net = await remote(t, (req, res) => {
    if (req.url === "/first") {
      t.mock.timers.tick(6_000);
      res.writeHead(302, { location: "/second" });
      res.end();
    } else {
      ready.resolve();
    }
  });
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const pending = assert.rejects(
    resolveCodexImage("https://images.example/first", signal()),
    /timed out/i,
  );
  await ready.promise;
  assert.equal(net.requests.length, 2);
  t.mock.timers.tick(4_000);
  await pending;
  assert.ok(net.requests.every((req) => req.destroyed));
});

void test("rejects HTTP upgrades and oversized headers", async (t) => {
  const net = await remote(t, (req, res) => {
    if (req.url === "/upgrade") {
      res.writeHead(101, { Connection: "Upgrade", Upgrade: "websocket" });
    } else {
      res.writeHead(200, {
        "content-type": "image/png",
        "x-large": "a".repeat(20_000),
      });
    }
    res.end();
  });
  await assert.rejects(
    resolveCodexImage("https://images.example/upgrade", signal()),
    /upgrade/i,
  );
  await assert.rejects(
    resolveCodexImage("https://images.example/headers", signal()),
    /header/i,
  );
  assert.ok(net.requests.every((req) => req.destroyed));
});

void test("cleans up when request creation throws", async (t) => {
  const lookup = noNetwork(t);
  lookup.mock.mockImplementation(() => Promise.resolve([publicAddress]));
  t.mock.method(https, "request", () => {
    throw new Error("request creation failed");
  });
  const abort = new AbortController();
  const setTimer = t.mock.method(globalThis, "setTimeout");
  const clearTimer = t.mock.method(globalThis, "clearTimeout");
  await assert.rejects(
    resolveCodexImage("https://images.example/a", abort.signal),
    /request creation failed/,
  );
  assert.equal(getEventListeners(abort.signal, "abort").length, 0);
  assert.ok(
    clearTimer.mock.calls.some(
      (call) => call.arguments[0] === setTimer.mock.calls[0]?.result,
    ),
  );
});

void test("preserves non-Error cancellation reasons", async (t) => {
  const lookup = noNetwork(t);
  lookup.mock.mockImplementation(() => new Promise<LookupAddress[]>(() => {}));
  const abort = new AbortController();
  const pending = assert.rejects(
    resolveCodexImage("https://images.example/a", abort.signal),
    (error) => error === "canceled",
  );
  abort.abort("canceled");
  await pending;
});

void test("rejects DNS failures, empty answers, invalid addresses, and family mismatches", async (t) => {
  const lookup = noNetwork(t);
  lookup.mock.mockImplementationOnce(() =>
    Promise.reject(new Error("DNS failed")),
  );
  await assert.rejects(
    resolveCodexImage("https://images.example/a", signal()),
    /DNS failed/,
  );
  for (const addresses of [
    [],
    [{ address: "not-an-ip", family: 4 }],
    [{ address: "127.0.0.1", family: 6 }],
  ]) {
    lookup.mock.mockImplementation(() => Promise.resolve(addresses));
    await assert.rejects(
      resolveCodexImage("https://images.example/a", signal()),
      /public|address/i,
    );
  }
});
