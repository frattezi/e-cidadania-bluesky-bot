import type { FetchHtml } from "./types.ts";

export interface FetchHtmlOptions {
	retries?: number;
	timeoutMs?: number;
	userAgent?: string;
}

const DEFAULT_UA =
	"e-cidadania-bluesky-bot (+https://github.com/frattezi/e-cidadania-bluesky-bot)";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createFetchHtml({
	retries = 3,
	timeoutMs = 30000,
	userAgent = DEFAULT_UA,
}: FetchHtmlOptions = {}): FetchHtml {
	return async (url) => {
		for (let attempt = 0; ; attempt++) {
			let failure: Error;
			let retryable = true;
			try {
				const res = await fetch(url, {
					headers: { "User-Agent": userAgent },
					signal: AbortSignal.timeout(timeoutMs),
				});
				if (res.ok) return await res.text();
				failure = new Error(`GET ${url} failed: HTTP ${res.status}`);
				retryable = res.status === 429 || res.status >= 500;
			} catch (err) {
				// Network error or timeout.
				failure = err instanceof Error ? err : new Error(String(err));
			}
			if (!retryable || attempt >= retries) throw failure;
			await sleep(500 * 2 ** attempt);
		}
	};
}
