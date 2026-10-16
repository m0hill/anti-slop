import { RuleTester } from "oxlint/plugins-dev";

import { noMutableBindingsRule } from "./no-mutable-bindings.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const boundary = "src/clock.ffi.ts";

const declaration = (kind: string) => ({ messageId: "mutableDeclaration", data: { kind } });
const reassignment = { messageId: "reassignment" };
const captured = (names: string) => ({ messageId: "capturedState", data: { names } });

tester.run("anti-slop-gleam/no-mutable-bindings", noMutableBindingsRule, {
	valid: [
		"const total = items.length;",
		"for (const item of items) use(item);",
		"user.name = name;",
		"counts[key] += 1;",
		{ filename: boundary, code: "let attempts = 0; attempts++;" },
	],
	invalid: [
		{ code: "let total = 0;", errors: [declaration("let")] },
		{ code: "var total = 0;", errors: [declaration("var")] },
		{ code: "for (let item of items) use(item);", errors: [declaration("let")] },
		{ code: "function f(count: number) { count = count + 1; return count; }", errors: [reassignment] },
		{ code: "function f(count: number) { count++; return count; }", errors: [reassignment] },
		{ code: "function f(count: number) { count += 1; return count; }", errors: [reassignment] },
		{ code: "function f(a: number, b: number) { [a, b] = [b, a]; }", errors: [reassignment] },
		{ code: "function f(a: number) { ({ a } = source); }", errors: [reassignment] },
		{ code: "let a = 0, b = 1;", errors: [declaration("let"), declaration("let")] },
		{
			// Reassigned in the declaring function and in a callback: still a value computed in steps.
			code: "function f() { let total = 0; total += 1; items.forEach(() => { total += 1; }); return total; }",
			errors: [declaration("let"), reassignment, reassignment],
		},
		{
			code: "function setup(host: Host) { let current: Context | undefined; host.on(\"start\", (ctx) => { current = ctx; }); }",
			errors: [captured("current")],
		},
		{
			code: "let enabled = false; export function toggle() { enabled = !enabled; }",
			errors: [captured("enabled")],
		},
		{
			code: "function counter() { let next = 1; return () => next++; }",
			errors: [captured("next")],
		},
		{
			// All of one function's state is reported once, at its first declaration.
			code: "function setup(host: Host) { let active = false; let count = 0, label: string | undefined; host.on(\"start\", () => { active = true; count++; label = \"x\"; }); }",
			errors: [{ ...captured("active`, `count`, `label"), line: 1, column: 33 }],
		},
		{
			// Each function or module scope gets its own report.
			code: "let ready = false; export function init() { ready = true; } export function track(host: Host) { let seen = 0; host.on(\"tick\", () => { seen++; }); }",
			errors: [captured("ready"), captured("seen")],
		},
		{
			// A captured parameter has no declaration to group under, so each write is reported.
			code: "function watch(host: Host, last: number) { host.on(\"tick\", (n) => { last = n; }); }",
			errors: [captured("last")],
		},
		{
			// A destructured declaration that is only partly captured stays a plain mutable declaration.
			code: "function f(host: Host) { let [a, b] = pair; b = 2; host.on(\"x\", () => { a = 1; }); }",
			errors: [declaration("let"), reassignment, captured("a")],
		},
	],
});
