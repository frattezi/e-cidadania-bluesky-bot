import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
	consultaUrl,
	fetchAllConsultas,
	parseListingPage,
} from "../src/consultas.ts";
import type { FetchHtml } from "../src/types.ts";

const fixture = readFileSync(
	new URL("./fixtures/listing-page.html", import.meta.url),
	"utf8",
);

const item = (id: number) =>
	`<div class="resumo-materia"><header><a href="visualizacaomateria?id=${id}">PL ${id}/2026</a></header><section><a href="visualizacaomateria?id=${id}">Ementa ${id}</a></section></div>`;
const page = (ids: number[], lastPage = 3) =>
	`<a href="https://www12.senado.leg.br/ecidadania/pesquisamateria?p=${lastPage}">x</a>${ids.map(item).join("")}`;

test("parses items, collapses ementa whitespace and reads lastPage", () => {
	const { consultas, lastPage } = parseListingPage(fixture);
	assert.equal(lastPage, 79);
	assert.equal(consultas.length, 2);
	assert.deepEqual(consultas[0], {
		id: 160575,
		identificacao: "PL 5064/2023",
		ementa:
			"Concede anistia aos acusados e condenados pelos crimes definidos nos arts. 359-L e 359-M do Código Penal.",
		url: consultaUrl(160575),
	});
});

test("lastPage defaults to 1 without pagination links", () => {
	assert.equal(parseListingPage(item(1)).lastPage, 1);
});

test("throws a clear error when an item lacks id or identificacao", () => {
	assert.throws(
		() =>
			parseListingPage(
				'<div class="resumo-materia"><header><a href="x">PL 1</a></header></div>',
			),
		/markup changed/,
	);
	assert.throws(
		() =>
			parseListingPage(
				'<div class="resumo-materia"><header><a href="visualizacaomateria?id=5"> </a></header></div>',
			),
		/markup changed/,
	);
});

test("fetchAllConsultas walks every page and dedups by id", async () => {
	const pages: Record<string, string> = {
		"1": page([1, 2]),
		"2": page([2, 3]),
		"3": page([4]),
	};
	const requested: string[] = [];
	const fetchHtml: FetchHtml = async (url) => {
		const p = new URL(url).searchParams.get("p") ?? "";
		requested.push(p);
		return pages[p] ?? "";
	};
	const all = await fetchAllConsultas(fetchHtml, { concurrency: 2 });
	assert.deepEqual(all.map((c) => c.id).sort(), [1, 2, 3, 4]);
	assert.deepEqual(requested.sort(), ["1", "2", "3"]);
});

test("fetchAllConsultas throws when page 1 is empty", async () => {
	await assert.rejects(
		fetchAllConsultas(async () => "<html></html>"),
		/no consultas/,
	);
});
