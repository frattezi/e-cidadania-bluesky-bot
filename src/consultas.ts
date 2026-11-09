import * as cheerio from "cheerio";
import type { Consulta, FetchHtml } from "./types.ts";

export const BASE_URL = "https://www12.senado.leg.br/ecidadania";

export interface ListingPage {
	consultas: Consulta[];
	lastPage: number;
}

export function consultaUrl(id: number): string {
	return `${BASE_URL}/visualizacaomateria?id=${id}`;
}

export function parseListingPage(html: string): ListingPage {
	const $ = cheerio.load(html);

	const consultas = $(".resumo-materia")
		.map((_, el): Consulta => {
			const header = $(el).find("header a").first();
			const id = Number(header.attr("href")?.match(/[?&]id=(\d+)/)?.[1]);
			const identificacao = header.text().trim();
			if (!id || !identificacao) {
				throw new Error(
					`e-Cidadania markup changed: item without id/identificacao: ${$.html(el).slice(0, 200)}`,
				);
			}
			const ementa = $(el)
				.find("section a")
				.first()
				.text()
				.replace(/\s+/g, " ")
				.trim();
			return { id, identificacao, ementa, url: consultaUrl(id) };
		})
		.get();

	const pages = $("a[href*='pesquisamateria?p=']")
		.map((_, a) =>
			Number(
				$(a)
					.attr("href")
					?.match(/[?&]p=(\d+)/)?.[1],
			),
		)
		.get();

	return { consultas, lastPage: Math.max(1, ...pages) };
}

export async function fetchAllConsultas(
	fetchHtml: FetchHtml,
	{ concurrency = 4 }: { concurrency?: number } = {},
): Promise<Consulta[]> {
	const pageUrl = (p: number) => `${BASE_URL}/pesquisamateria?p=${p}`;
	const first = parseListingPage(await fetchHtml(pageUrl(1)));
	if (first.consultas.length === 0) {
		throw new Error(
			"e-Cidadania page 1 has no consultas: markup changed or portal down",
		);
	}

	const byId = new Map(first.consultas.map((c) => [c.id, c]));
	let next = 2;
	// Workers pull the next page number; JS is single-threaded so `next++` is safe.
	const worker = async () => {
		while (next <= first.lastPage) {
			const { consultas } = parseListingPage(await fetchHtml(pageUrl(next++)));
			for (const c of consultas) byId.set(c.id, c);
		}
	};
	await Promise.all(Array.from({ length: concurrency }, worker));
	return [...byId.values()];
}
