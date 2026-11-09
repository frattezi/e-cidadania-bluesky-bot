// Shared contract between modules. Changing it requires the main session's approval.

/** One open Consulta Pública listed at https://www12.senado.leg.br/ecidadania/pesquisamateria */
export interface Consulta {
	/** Senate matéria code, the `id` query param of visualizacaomateria. Higher means newer. */
	id: number;
	/** Bill identification as shown on the card, e.g. "PL 1809/2026". */
	identificacao: string;
	/** Bill summary (ementa), whitespace collapsed. */
	ementa: string;
	/** Canonical consulta URL: https://www12.senado.leg.br/ecidadania/visualizacaomateria?id=<id> */
	url: string;
}

/** GETs a URL and returns its body as text. Throws on a non-2xx after retries. */
export type FetchHtml = (url: string) => Promise<string>;

/** A Bluesky post ready to publish: text plus an external link card. */
export interface PostDraft {
	/** At most 300 graphemes (Bluesky limit). */
	text: string;
	card: {
		uri: string;
		title: string;
		description: string;
	};
}

/** Publishes one post. Throws on failure. */
export type PublishPost = (draft: PostDraft) => Promise<void>;
