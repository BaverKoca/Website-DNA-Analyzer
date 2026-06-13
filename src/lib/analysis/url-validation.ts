export type UrlValidationResult =
  | {
      ok: true;
      url: string;
    }
  | {
      ok: false;
      error: string;
    };

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export function normalizeWebsiteUrl(input: string): UrlValidationResult {
  const candidate = input.trim();

  if (!candidate) {
    return { ok: false, error: "Enter a website URL to analyze." };
  }

  if (candidate.length > 2048) {
    return { ok: false, error: "That URL is too long to analyze safely." };
  }

  const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;

  try {
    const url = new URL(withProtocol);
    const hostname = url.hostname.toLowerCase();

    if (!["http:", "https:"].includes(url.protocol)) {
      return { ok: false, error: "Only http and https websites can be analyzed." };
    }

    if (url.username || url.password) {
      return { ok: false, error: "Remove credentials from the URL before analyzing it." };
    }

    if (BLOCKED_HOSTS.has(hostname) || isPrivateIp(hostname)) {
      return { ok: false, error: "Local and private network URLs are not supported in this analyzer." };
    }

    if (!hostname.includes(".") && hostname !== "localhost") {
      return { ok: false, error: "Enter a complete domain, such as example.com." };
    }

    url.hash = "";
    return { ok: true, url: url.toString() };
  } catch {
    return { ok: false, error: "Enter a valid website URL, such as https://example.com." };
  }
}

function isPrivateIp(hostname: string) {
  const parts = hostname.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [first, second] = parts;
  return (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254)
  );
}
