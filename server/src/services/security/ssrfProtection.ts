import { isIP } from 'net';
import { lookup } from 'dns/promises';

/**
 * Basic SSRF protection for the source fetcher. This blocks the obvious
 * targets (loopback, private ranges, link-local/cloud-metadata, non-HTTP
 * schemes) and re-validates every redirect hop before following it.
 *
 * Known limitation (documented, not hidden): the pre-check resolves DNS
 * separately from the actual fetch() call, which itself resolves DNS again.
 * A sophisticated DNS-rebinding attack could theoretically change the
 * answer between the two lookups. Fully closing that gap requires pinning
 * the connection to the pre-validated IP (e.g. a custom Undici Agent) —
 * that's real hardening work planned for the dedicated Privacy Gateway
 * phase, not implemented here. This is basic, MVP-appropriate protection.
 */

const BLOCKED_HOSTNAMES = new Set(['localhost', 'localhost.localdomain', 'metadata.google.internal']);

function ipv4Parts(ip: string): number[] {
  return ip.split('.').map(Number);
}

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ipv4Parts(ip);
  if (Number.isNaN(a)) return true;
  if (a === 127) return true; // loopback
  if (a === 10) return true; // RFC1918
  if (a === 0) return true; // "this network"
  if (a === 169 && b === 254) return true; // link-local, incl. 169.254.169.254 cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
  if (a === 192 && b === 168) return true; // RFC1918
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT (RFC6598)
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true; // loopback / unspecified
  if (lower.startsWith('fe80:')) return true; // link-local
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique local (fc00::/7)
  if (lower.startsWith('::ffff:')) {
    // IPv4-mapped IPv6 address — check the embedded IPv4 part too.
    const v4 = lower.split(':').pop();
    if (v4 && v4.includes('.')) return isPrivateIPv4(v4);
  }
  return false;
}

export function isDisallowedIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) return isPrivateIPv6(ip);
  return true; // not a recognizable IP — fail closed
}

/**
 * Validates a URL is safe to fetch: HTTP(S) only, not a blocked hostname,
 * and — after DNS resolution — not pointing at a private/internal address.
 * Throws with a generic, safe-to-surface message on any failure.
 */
export async function assertUrlIsSafe(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Unsupported URL scheme: ${url.protocol}`);
  }

  const hostname = url.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local')) {
    throw new Error('This host is not allowed.');
  }

  // Node's URL.hostname keeps brackets around IPv6 literals (e.g. "[::1]"),
  // but net.isIP() doesn't accept them — strip before checking, or a
  // bracketed IPv6 literal falls through to the DNS-lookup branch below,
  // which can never resolve it (always blocked, but for the wrong reason,
  // and it would also wrongly block legitimate public IPv6 literal URLs).
  const bareHost = hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname;

  // Literal IP in the URL — check it directly, no DNS involved.
  if (isIP(bareHost)) {
    if (isDisallowedIp(bareHost)) throw new Error('This address is not allowed.');
    return url;
  }

  // Resolve DNS and check every returned address so a public hostname that
  // resolves to a private IP (DNS rebinding / misconfiguration) is caught.
  let addresses: { address: string }[];
  try {
    addresses = await lookup(hostname, { all: true });
  } catch {
    throw new Error('Could not resolve host.');
  }
  if (addresses.length === 0) throw new Error('Could not resolve host.');
  for (const { address } of addresses) {
    if (isDisallowedIp(address)) throw new Error('This address is not allowed.');
  }

  return url;
}