import type { Consulta, PostDraft } from "./types.ts";

const MAX_GRAPHEMES = 300;
const segmenter = new Intl.Segmenter("pt", { granularity: "grapheme" });
const count = (s: string) => [...segmenter.segment(s)].length;

const compose = (identificacao: string, ementa: string) =>
	`Nova consulta pública no Senado: ${identificacao}\n\n${ementa}\n\nVote no e-Cidadania 👇`;

export function buildPost(consulta: Consulta): PostDraft {
	const { identificacao, ementa, url } = consulta;
	let text = compose(identificacao, ementa);
	if (count(text) > MAX_GRAPHEMES) {
		const words = ementa.split(" ");
		do {
			words.pop();
			text = compose(identificacao, `${words.join(" ")}…`);
		} while (words.length > 0 && count(text) > MAX_GRAPHEMES);
	}
	return {
		text,
		card: {
			uri: url,
			title: `${identificacao} — Consulta Pública`,
			description: ementa,
		},
	};
}
