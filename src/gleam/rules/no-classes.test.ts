import { RuleTester } from "oxlint/plugins-dev";

import { noClassesRule } from "./no-classes.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const boundary = "src/clock.ffi.ts";

tester.run("anti-slop-gleam/no-classes", noClassesRule, {
	valid: [
		"type User = { readonly name: string }; export function rename(user: User, name: string): User { return { ...user, name }; }",
		"type Fluent = { next(): this };",
		{ filename: boundary, code: "export class ClockError extends Error { constructor() { super(); this.name = \"ClockError\"; } }" },
	],
	invalid: [
		{ code: "class User { constructor(readonly name: string) {} }", errors: [{ messageId: "class" }] },
		{ code: "const User = class { name = \"\"; };", errors: [{ messageId: "class" }] },
		{ code: "class User { rename() { this.name = \"\"; } }", errors: [{ messageId: "class" }] },
		{ code: "function rename(name: string) { this.name = name; }", errors: [{ messageId: "this" }] },
		{ code: "const user = { name: \"\", rename() { return this.name; } };", errors: [{ messageId: "this" }] },
	],
});
