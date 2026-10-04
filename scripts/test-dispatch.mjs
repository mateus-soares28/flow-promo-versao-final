import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../lib/validation/dispatch.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { parseDispatchSchedule } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

const now = new Date("2026-10-04T15:00:00.000Z");

test("blank schedule queues immediately", () => {
  assert.equal(parseDispatchSchedule("", now), now);
});

test("schedule uses Brasília time regardless of server timezone", () => {
  assert.equal(parseDispatchSchedule("2026-10-04T13:30", now)?.toISOString(), "2026-10-04T16:30:00.000Z");
});

test("past, malformed and impossible dates cannot enter the queue", () => {
  for (const input of ["2026-10-04T11:59", "2026-10-04T12:00", "invalid", "2027-02-30T12:00", "2027-13-01T12:00", "2027-01-01T24:00", "2027-01-01T12:00:00Z"]) {
    assert.equal(parseDispatchSchedule(input, now), null, input);
  }
});

test("valid leap-day schedules are accepted", () => {
  assert.equal(parseDispatchSchedule("2028-02-29T12:00", now)?.toISOString(), "2028-02-29T15:00:00.000Z");
});
