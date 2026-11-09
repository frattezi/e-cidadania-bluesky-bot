// Owned by spec 003. Signature is contract; body is a stub.
import type { Consulta, PostDraft, PublishPost } from "./types.ts";

export interface RunDeps {
	listConsultas: () => Promise<Consulta[]>;
	buildPost: (consulta: Consulta) => PostDraft;
	publish: PublishPost;
	statePath: string;
	maxPosts: number;
	dryRun: boolean;
	log: (message: string) => void;
}

export interface RunResult {
	seeded: boolean;
	posted: number;
	pending: number;
}

export async function run(_deps: RunDeps): Promise<RunResult> {
	throw new Error("not implemented: spec 003");
}
