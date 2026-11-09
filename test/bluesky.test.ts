import assert from "node:assert/strict";
import { test } from "node:test";
import { type BskyAgent, createPublisher } from "../src/bluesky.ts";

const draft = {
	text: "oi",
	card: { uri: "https://x.test", title: "T", description: "D" },
};

function fakeAgent() {
	const calls: {
		login: unknown[];
		post: Record<string, unknown>[];
		service?: string;
	} = {
		login: [],
		post: [],
	};
	const agent: BskyAgent = {
		login: async (o) => void calls.login.push(o),
		post: async (r) => void calls.post.push(r),
	};
	return {
		calls,
		factory: (service: string) => {
			calls.service = service;
			return agent;
		},
	};
}

test("logs in once and posts text, langs and external embed", async () => {
	const { calls, factory } = fakeAgent();
	const publish = await createPublisher(
		{ identifier: "a", password: "b" },
		factory,
	);
	await publish(draft);
	await publish(draft);
	assert.equal(calls.service, "https://bsky.social");
	assert.deepEqual(calls.login, [{ identifier: "a", password: "b" }]);
	assert.equal(calls.post.length, 2);
	const { createdAt, ...rest } = calls.post[0] as Record<string, unknown>;
	assert.ok(!Number.isNaN(Date.parse(createdAt as string)));
	assert.deepEqual(rest, {
		text: "oi",
		langs: ["pt"],
		embed: { $type: "app.bsky.embed.external", external: draft.card },
	});
});

test("post errors propagate", async () => {
	const agent: BskyAgent = {
		login: async () => {},
		post: async () => {
			throw new Error("boom");
		},
	};
	const publish = await createPublisher(
		{ identifier: "a", password: "b" },
		() => agent,
	);
	await assert.rejects(publish(draft), /boom/);
});
