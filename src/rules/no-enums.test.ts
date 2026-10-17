import { RuleTester } from "oxlint/plugins-dev";

import { noEnumsRule } from "./no-enums.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const boundary = "src/clock.ffi.ts";

tester.run("gleam/no-enums", noEnumsRule, {
	valid: [
		"type Status = \"active\" | \"suspended\";",
		{ filename: boundary, code: "export enum ForeignStatus { Active }" },
	],
	invalid: [
		{ code: "enum Status { Active, Suspended }", errors: [{ messageId: "enum" }] },
		{ code: "const enum Status { Active = \"active\" }", errors: [{ messageId: "enum" }] },
		{ code: "export declare enum Status { Active }", errors: [{ messageId: "enum" }] },
	],
});
