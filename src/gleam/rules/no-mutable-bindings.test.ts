import { RuleTester } from "oxlint/plugins-dev";

import { noMutableBindingsRule } from "./no-mutable-bindings.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const boundary = "src/clock.ffi.ts";

const declaration = (kind: string) => ({ messageId: "mutableDeclaration", data: { kind } });
const reassignment = { messageId: "reassignment" };
const captured = (name: string) => ({ messageId: "capturedState", data: { name } });

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
			errors: [captured("current"), captured("current")],
		},
		{
			code: "let enabled = false; export function toggle() { enabled = !enabled; }",
			errors: [captured("enabled"), captured("enabled")],
		},
		{
			code: "function counter() { let next = 1; return () => next++; }",
			errors: [captured("next"), captured("next")],
		},
	],
});
