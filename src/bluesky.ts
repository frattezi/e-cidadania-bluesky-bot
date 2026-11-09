// Owned by spec 002. Signature is contract; body is a stub.
import type { PublishPost } from "./types.ts";

export interface PublisherOptions {
	identifier: string;
	password: string;
	service?: string;
}

export async function createPublisher(
	_opts: PublisherOptions,
): Promise<PublishPost> {
	throw new Error("not implemented: spec 002");
}
