import { RuleTester } from "oxlint/plugins-dev";

import { noEnumsRule } from "./no-enums.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const ioFile = "src/clock.io.ts";

tester.run("fp/no-enums", noEnumsRule, {
	valid: [
		"type Status = \"active\" | \"suspended\";",
		{ filename: ioFile, code: "export enum ForeignStatus { Active }" },
	],
	invalid: [
		{ code: "enum Status { Active, Suspended }", errors: [{ messageId: "enum" }] },
		{ code: "const enum Status { Active = \"active\" }", errors: [{ messageId: "enum" }] },
		{ code: "export declare enum Status { Active }", errors: [{ messageId: "enum" }] },
	],
});
