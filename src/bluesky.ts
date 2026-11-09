import { AtpAgent } from "@atproto/api";
import type { PostDraft, PublishPost } from "./types.ts";

export interface PublisherOptions {
	identifier: string;
	password: string;
	service?: string;
}

/** The slice of AtpAgent the publisher uses; injectable for tests. */
export interface BskyAgent {
	login(opts: { identifier: string; password: string }): Promise<unknown>;
	post(record: Record<string, unknown>): Promise<unknown>;
}

export async function createPublisher(
	{ identifier, password, service = "https://bsky.social" }: PublisherOptions,
	createAgent: (service: string) => BskyAgent = (s) =>
		new AtpAgent({ service: s }) as unknown as BskyAgent,
): Promise<PublishPost> {
	const agent = createAgent(service);
	await agent.login({ identifier, password });
	return async ({ text, card }: PostDraft) => {
		await agent.post({
			text,
			langs: ["pt"],
			createdAt: new Date().toISOString(),
			embed: { $type: "app.bsky.embed.external", external: card },
		});
	};
}
