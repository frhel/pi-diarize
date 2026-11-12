/**
 * Loads the extension the way Pi loads it — call the default export with a host
 * object — without launching a Pi process.
 *
 * Run with `node --test test/index.test.ts`.
 */
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { test } from "node:test";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import piDiarize from "../src/index.ts";

test("the factory runs without registering anything", () => {
  const calls: string[] = [];

  // Spied rather than stubbed out: a fake that silently accepts every method
  // cannot tell us when the extension starts touching a new surface.
  const api = {
    registerTool: (tool: unknown) => calls.push(`registerTool(${typeof tool})`),
    on: (event: string) => calls.push(`on(${event})`),
  } as unknown as ExtensionAPI;

  piDiarize(api);

  assert.deepEqual(calls, []);
});

test("the audio fixtures are present and not empty", () => {
  for (const name of ["three-speakers-15s.wav", "three-speakers-60s.wav"]) {
    const file = new URL(`./fixtures/${name}`, import.meta.url);

    assert.ok(existsSync(file) && statSync(file).size > 0, `${name} is missing or empty`);
  }
});
