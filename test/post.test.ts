import assert from "node:assert/strict";
import { test } from "node:test";
import { buildPost } from "../src/post.ts";
import type { Consulta } from "../src/types.ts";

const base: Consulta = {
	id: 1,
	identificacao: "PL 1809/2026",
	ementa: "Altera a lei X.",
	url: "https://www12.senado.leg.br/ecidadania/visualizacaomateria?id=1",
};
const count = (s: string) =>
	[...new Intl.Segmenter("pt", { granularity: "grapheme" }).segment(s)].length;

test("short ementa passes through untouched", () => {
	const { text } = buildPost(base);
	assert.equal(
		text,
		"Nova consulta pública no Senado: PL 1809/2026\n\nAltera a lei X.\n\nVote no e-Cidadania 👇",
	);
});

test("long ementa is cut at a word boundary with an ellipsis, within 300 graphemes", () => {
	const ementa = Array.from({ length: 80 }, (_, i) => `palavra${i}`).join(" ");
	const { text, card } = buildPost({ ...base, ementa });
	assert.ok(count(text) <= 300);
	assert.ok(count(text) > 250);
	const cut = text.split("\n\n")[1] ?? "";
	assert.ok(cut.endsWith("…"));
	assert.ok(ementa.startsWith(cut.slice(0, -1)));
	assert.ok(ementa[cut.length - 1] === " ");
	assert.equal(card.description, ementa);
});

test("emoji count as one grapheme", () => {
	const ementa = "👨‍👩‍👧‍👦 ".repeat(150).trim();
	assert.ok(count(buildPost({ ...base, ementa }).text) <= 300);
});

test("card fields", () => {
	assert.deepEqual(buildPost(base).card, {
		uri: base.url,
		title: "PL 1809/2026 — Consulta Pública",
		description: "Altera a lei X.",
	});
});
