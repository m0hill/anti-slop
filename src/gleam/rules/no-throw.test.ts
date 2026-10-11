import { RuleTester } from "oxlint/plugins-dev";

import { noThrowRule } from "./no-throw.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const boundary = "src/clock.ffi.ts";

tester.run("anti-slop-gleam/no-throw", noThrowRule, {
	valid: [
		"function find(id: string): Result<User, NotFound> { return { ok: false, error: { kind: \"NotFound\", id } }; }",
		{ filename: boundary, code: "export function panic(reason: string): never { throw new Error(reason); }" },
	],
	invalid: [
		{ code: "function find(id: string) { throw new Error(id); }", errors: [{ messageId: "throw" }] },
		{ code: "const fail = () => { throw \"failed\"; };", errors: [{ messageId: "throw" }] },
		{ filename: "src/clock.ts", code: "throw new Error();", errors: [{ messageId: "throw" }] },
	],
});
