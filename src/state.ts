// Owned by spec 003. Signatures are contract; bodies are stubs.

/** IDs already posted, or null when the state file does not exist yet (first run). */
export async function loadPosted(_path: string): Promise<Set<number> | null> {
	throw new Error("not implemented: spec 003");
}

export async function savePosted(
	_path: string,
	_ids: Set<number>,
): Promise<void> {
	throw new Error("not implemented: spec 003");
}
