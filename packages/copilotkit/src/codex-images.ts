import type { LookupAddress } from "node:dns";
import dns from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { BlockList, isIP } from "node:net";

export const MAX_CODEX_IMAGE_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;
const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const REDIRECTS = new Set([301, 302, 303, 307, 308]);

// Fail closed for special-purpose space, including globally reachable exceptions
// within these blocks. Sources (also cover documentation/benchmarking ranges):
// https://www.iana.org/assignments/iana-ipv4-special-registry/
// https://www.iana.org/assignments/iana-ipv6-special-registry/
const blockedV4 = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 3], // Multicast and reserved/broadcast space.
] as const) {
  blockedV4.addSubnet(address, prefix, "ipv4");
}
const globalV6 = new BlockList();
globalV6.addSubnet("2000::", 3, "ipv6");
const blockedV6 = new BlockList();
for (const [address, prefix] of [
  ["2001::", 23], // Includes Teredo and other protocol/transition assignments.
  ["2001:db8::", 32],
  ["2002::", 16], // 6to4 can embed a non-public IPv4 destination.
  ["3ffe::", 16], // Retired 6bone space.
  ["3fff::", 20],
] as const) {
  blockedV6.addSubnet(address, prefix, "ipv6");
}

function isPublicAddress({ address, family }: LookupAddress): boolean {
  if (isIP(address) !== family || address.includes("%")) {
    return false;
  }
  if (family === 4) {
    return !blockedV4.check(address, "ipv4");
  }
  // Only ordinary global unicast is eligible. This also excludes ALL mapped
  // IPv4 (both dotted and hex forms), NAT64, ULA, link-local and multicast IPv6.
  return (
    family === 6 &&
    globalV6.check(address, "ipv6") &&
    !blockedV6.check(address, "ipv6")
  );
}

function sizeLimitError(byteLimit: number): Error {
  return new Error(
    byteLimit < MAX_CODEX_IMAGE_BYTES
      ? "Image exceeds the remaining aggregate per-run byte allowance"
      : "Image exceeds the 5 MiB size limit",
  );
}

function validateInlineImage(url: string, byteLimit: number): string {
  const header = /^data:image\/(?:png|jpeg|webp|gif);base64,/i.exec(url)?.[0];
  if (!header) {
    throw new Error(
      "Unsupported inline image data URL; expected PNG, JPEG, WebP or GIF base64",
    );
  }
  const encoded = url.slice(header.length);
  if (encoded.length > 4 * Math.ceil(byteLimit / 3)) {
    throw sizeLimitError(byteLimit);
  }
  if (!encoded || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) {
    throw new Error("Invalid inline image base64");
  }
  const bytes = Buffer.from(encoded, "base64");
  const canonical = bytes.toString("base64");
  // Buffer's decoder alone silently ignores invalid characters and padding.
  if (
    !bytes.length ||
    (canonical !== encoded && canonical.replace(/=+$/, "") !== encoded)
  ) {
    throw new Error("Invalid inline image base64");
  }
  if (bytes.length > byteLimit) {
    throw sizeLimitError(byteLimit);
  }
  // Codex 0.157.1 accepts unpadded data at the RPC boundary but silently omits
  // the image from inference. Normalize only after strict validation above.
  return `${header.toLowerCase()}${canonical}`;
}

function parseRemoteUrl(value: string, base?: URL): URL {
  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    throw new Error("Invalid image URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Image URLs must use HTTP(S) or inline image data");
  }
  if (
    url.username ||
    url.password ||
    /^\w+:\/\/[^/?#]*@|^\/\/[^/?#]*@/.test(value.replaceAll("\\", "/"))
  ) {
    throw new Error("Image URL userinfo is not allowed");
  }
  return url;
}

// getaddrinfo cannot be canceled, but cancellation must settle immediately and
// its eventual result must never be allowed to initiate a request.
function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener("abort", onAbort);
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- Preserve AbortSignal's caller-supplied reason, which can be any value.
      reject(signal.reason);
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", onAbort);
        reject(
          error instanceof Error
            ? error
            : new Error("Image DNS lookup failed", { cause: error }),
        );
      },
    );
    if (signal.aborted) {
      onAbort();
    }
  });
}

async function publicDestination(
  url: URL,
  signal: AbortSignal,
): Promise<LookupAddress> {
  signal.throwIfAborted();
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const family = isIP(hostname);
  const addresses = family
    ? [{ address: hostname, family }]
    : await abortable(
        dns.lookup(hostname, { all: true, verbatim: true }),
        signal,
      );
  signal.throwIfAborted();
  // Reject mixed public/private answers rather than relying on resolver order.
  if (!addresses.length || !addresses.every(isPublicAddress)) {
    throw new Error(
      "Image host must resolve exclusively to public IP addresses",
    );
  }
  return addresses[0];
}

type Download = { data: string } | { location: string };

function download(
  url: URL,
  destination: LookupAddress,
  signal: AbortSignal,
  byteLimit: number,
): Promise<Download> {
  return new Promise((resolve, reject) => {
    let request: http.ClientRequest | undefined;
    let response: http.IncomingMessage | undefined;
    let settled = false;
    const finish = (settle: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      signal.removeEventListener("abort", onAbort);
      // Never drain an untrusted redirect/error body, nor keep pooled sockets.
      response?.destroy();
      request?.destroy();
      settle();
    };
    const fail = (error: unknown) =>
      finish(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- Cancellation must preserve even a non-Error AbortSignal reason.
        reject(error);
      });
    const succeed = (result: Download) => finish(() => resolve(result));
    const onAbort = () => fail(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    if (signal.aborted) {
      onAbort();
      return;
    }
    try {
      // Node forwards this net option, but @types/node omits it from RequestOptions.
      const options: http.RequestOptions & { autoSelectFamily: false } = {
        method: "GET",
        agent: false,
        autoSelectFamily: false,
        family: destination.family,
        // Retain the original URL for Host, SNI and certificate verification.
        // No second DNS lookup or proxy/global-agent socket can bypass this pin.
        lookup: (_hostname, options, callback) => {
          callback(
            null,
            options.all ? [destination] : destination.address,
            destination.family,
          );
        },
        headers: {
          Accept: [...IMAGE_TYPES].join(", "),
          "Accept-Encoding": "identity",
        },
        maxHeaderSize: 16 * 1024,
      };
      request = (url.protocol === "https:" ? https : http).request(
        url,
        options,
      );
      request.on("error", fail);
      request.on("close", () => {
        if (!response) {
          fail(new Error("Image connection closed before a response"));
        }
      });
      request.on("upgrade", (_response, socket) => {
        socket.destroy();
        fail(new Error("Image HTTP upgrades are not supported"));
      });
      request.on("response", (received) => {
        response = received;
        response.on("error", fail);
        response.on("close", () =>
          fail(new Error("Image response closed before completion")),
        );
        if (settled) {
          response.destroy();
          return;
        }
        const status = response.statusCode ?? 0;
        if (REDIRECTS.has(status)) {
          const location = response.headers.location;
          if (!location) {
            fail(new Error("Image redirect is missing a Location header"));
          } else {
            succeed({ location });
          }
          return;
        }
        if (status !== 200) {
          fail(new Error(`Image request failed with HTTP ${status}`));
          return;
        }
        const mime = response.headers["content-type"]
          ?.split(";", 1)[0]
          .trim()
          .toLowerCase();
        if (!mime || !IMAGE_TYPES.has(mime)) {
          fail(
            new Error(
              "Unsupported image MIME type; expected PNG, JPEG, WebP or GIF",
            ),
          );
          return;
        }
        const encoding = response.headers["content-encoding"];
        if (encoding && encoding.toLowerCase() !== "identity") {
          fail(new Error("Compressed image responses are not supported"));
          return;
        }
        const length = response.headers["content-length"];
        if (length && (!/^\d+$/.test(length) || Number(length) > byteLimit)) {
          fail(sizeLimitError(byteLimit));
          return;
        }
        let size = 0;
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => {
          if (settled) {
            return;
          }
          size += chunk.length;
          if (size > byteLimit) {
            fail(sizeLimitError(byteLimit));
          } else {
            chunks.push(chunk);
          }
        });
        response.on("end", () => {
          if (settled) {
            return;
          }
          if (!size || !received.complete) {
            fail(new Error("Empty or incomplete image response"));
          } else {
            succeed({
              data: `data:${mime};base64,${Buffer.concat(chunks, size).toString("base64")}`,
            });
          }
        });
      });
      request.end();
    } catch (error) {
      fail(error);
    }
  });
}

/**
 * Codex accepts inline images, not remote URLs. Fetch only public destinations;
 * enforce a 5 MiB image limit, three redirects and one 10s wall-clock deadline
 * covering DNS, connection/TLS, all redirects and the response body. A lower
 * caller allowance lets the run budget cap the resolver's fully buffered result.
 * Inline input must be a supported base64 data URL; validated input is returned
 * with a lowercase header and canonical padded base64 for Codex's image decoder.
 * MIME/encoding are validated, not the image decoder's pixel/dimension limits.
 */
export async function resolveCodexImage(
  url: string,
  signal: AbortSignal,
  maxBytes = MAX_CODEX_IMAGE_BYTES,
): Promise<string> {
  signal.throwIfAborted();
  if (!Number.isFinite(maxBytes) || maxBytes <= 0) {
    throw new Error("Image byte allowance must be a positive finite number");
  }
  const byteLimit = Math.min(MAX_CODEX_IMAGE_BYTES, Math.floor(maxBytes));
  if (/^data:/i.test(url)) {
    return validateInlineImage(url, byteLimit);
  }
  let current = parseRemoteUrl(url);
  const controller = new AbortController();
  const onAbort = () => controller.abort(signal.reason);
  signal.addEventListener("abort", onAbort, { once: true });
  const timer = setTimeout(() => {
    controller.abort(
      new Error(`Image request timed out after ${TIMEOUT_MS}ms`),
    );
  }, TIMEOUT_MS);
  try {
    for (let redirects = 0; ; redirects++) {
      const destination = await publicDestination(current, controller.signal);
      const result = await download(
        current,
        destination,
        controller.signal,
        byteLimit,
      );
      if ("data" in result) {
        return result.data;
      }
      if (redirects >= MAX_REDIRECTS) {
        throw new Error("Image redirect limit exceeded");
      }
      current = parseRemoteUrl(result.location, current);
    }
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", onAbort);
  }
}
