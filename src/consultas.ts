// Owned by spec 001. Signatures are contract; bodies are stubs.
import type { Consulta, FetchHtml } from "./types.ts";

export const BASE_URL = "https://www12.senado.leg.br/ecidadania";

export interface ListingPage {
	consultas: Consulta[];
	lastPage: number;
}

export function consultaUrl(id: number): string {
	return `${BASE_URL}/visualizacaomateria?id=${id}`;
}

export function parseListingPage(_html: string): ListingPage {
	throw new Error("not implemented: spec 001");
}

export async function fetchAllConsultas(
	_fetchHtml: FetchHtml,
	_opts: { concurrency?: number } = {},
): Promise<Consulta[]> {
	throw new Error("not implemented: spec 001");
}
