import { RuleTester } from "oxlint/plugins-dev";

import { noMutableBindingsRule } from "./no-mutable-bindings.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const boundary = "src/clock.ffi.ts";

const declaration = (kind: string) => ({ messageId: "mutableDeclaration", data: { kind } });
const reassignment = { messageId: "reassignment" };

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
	],
});
