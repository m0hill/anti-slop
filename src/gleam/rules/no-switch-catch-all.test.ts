import { RuleTester } from "oxlint/plugins-dev";

import { noSwitchCatchAllRule } from "./no-switch-catch-all.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const boundary = "src/clock.ffi.ts";

const error = { messageId: "catchAll" };

tester.run("anti-slop-gleam/no-switch-catch-all", noSwitchCatchAllRule, {
	valid: [
		"switch (status) { case \"active\": return 1; case \"suspended\": return 2; }",
		"switch (shape.kind) { case \"circle\": return 1; default: shape satisfies never; return 0; }",
		"switch (shape.kind) { case \"circle\": return 1; default: { shape satisfies never; return 0; } }",
		{ filename: boundary, code: "switch (code) { case 200: return ok(); default: return failure(code); }" },
	],
	invalid: [
		{ code: "switch (status) { case \"active\": return 1; default: return 0; }", errors: [error] },
		{ code: "switch (status) { default: }", errors: [error] },
		{ code: "switch (status) { case \"active\": return 1; default: log(status); status satisfies never; }", errors: [error] },
		{ code: "switch (status) { case \"active\": return 1; default: status satisfies string; }", errors: [error] },
	],
});
