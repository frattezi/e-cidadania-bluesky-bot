import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createFetchHtml } from "../src/http.ts";

const realFetch = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = realFetch;
});

const stubFetch = (...responses: (Response | Error)[]) => {
	const calls: { url: string; init?: RequestInit }[] = [];
	globalThis.fetch = (async (url: string, init?: RequestInit) => {
		calls.push({ url, init });
		const r = responses.shift();
		if (!r) throw new Error("unexpected extra fetch");
		if (r instanceof Error) throw r;
		return r;
	}) as typeof fetch;
	return calls;
};

test("retries network errors and 5xx, then succeeds with the default UA", async () => {
	const calls = stubFetch(
		new TypeError("fetch failed"),
		new Response("", { status: 503 }),
		new Response("<html>ok</html>"),
	);
	assert.equal(await createFetchHtml()("https://x.test/a"), "<html>ok</html>");
	assert.equal(calls.length, 3);
	const headers = calls[0]?.init?.headers as Record<string, string>;
	assert.match(
		headers["User-Agent"] ?? "",
		/^e-cidadania-bluesky-bot \(\+https:\/\/github\.com/,
	);
});

test("retries 429", async () => {
	const calls = stubFetch(
		new Response("", { status: 429 }),
		new Response("ok"),
	);
	assert.equal(await createFetchHtml()("https://x.test/a"), "ok");
	assert.equal(calls.length, 2);
});

test("throws on 404 without retrying", async () => {
	const calls = stubFetch(new Response("", { status: 404 }));
	await assert.rejects(createFetchHtml()("https://x.test/a"), /HTTP 404/);
	assert.equal(calls.length, 1);
});

test("gives up after the configured retries", async () => {
	const calls = stubFetch(
		...Array.from({ length: 2 }, () => new Response("", { status: 500 })),
	);
	await assert.rejects(
		createFetchHtml({ retries: 1 })("https://x.test/a"),
		/HTTP 500/,
	);
	assert.equal(calls.length, 2);
});
