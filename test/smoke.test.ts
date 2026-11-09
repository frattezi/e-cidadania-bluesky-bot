import assert from "node:assert/strict";
import { test } from "node:test";
import { consultaUrl } from "../src/consultas.ts";

test("consultaUrl builds the canonical e-Cidadania URL", () => {
	assert.equal(
		consultaUrl(173618),
		"https://www12.senado.leg.br/ecidadania/visualizacaomateria?id=173618",
	);
});
