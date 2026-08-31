import { assertUrlIsSafe } from '../security/ssrfProtection';
import { config } from '../../config';

export interface FetchedPage {
  requestedUrl: string;
  finalUrl: string;
  contentType: string;
  html: string;
}

/**
 * Fetches a URL with SSRF protection, a hard timeout, a redirect cap (every
 * hop is re-validated — no blind trust of Location headers), and a
 * download-size cap enforced while streaming (not just Content-Length,
 * which can be absent or wrong).
 */
export async function fetchUrlSafely(inputUrl: string): Promise<FetchedPage> {
  let currentUrl = inputUrl;

  for (let hop = 0; hop <= config.fetcher.maxRedirects; hop++) {
    const validated = await assertUrlIsSafe(currentUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.fetcher.timeoutMs);

    let res: Response;
    try {
      res = await fetch(validated.toString(), {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'CyberHackBot/0.1 (+source fetcher for AI citation content)',
          Accept: 'text/html,text/plain;q=0.9,*/*;q=0.1',
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) throw new Error('Redirect response had no Location header.');
      currentUrl = new URL(location, validated).toString();
      continue; // loop re-validates the new target before following it
    }

    if (!res.ok) {
      throw new Error(`Fetch failed with status ${res.status}.`);
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      throw new Error(`Unsupported content type: ${contentType || 'unknown'}.`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('Response had no body.');

    const decoder = new TextDecoder();
    let html = '';
    let bytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > config.fetcher.maxBytes) {
        await reader.cancel();
        throw new Error('Page exceeds the maximum allowed download size.');
      }
      html += decoder.decode(value, { stream: true });
    }

    return { requestedUrl: inputUrl, finalUrl: validated.toString(), contentType, html };
  }

  throw new Error('Too many redirects.');
}