import { RuleTester } from "oxlint/plugins-dev";

import { noUnknownParametersRule } from "./no-unknown-parameters.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "unknownParameter" };

tester.run("anti-slop/no-unknown-parameters", noUnknownParametersRule, {
	valid: [
		"function enrich(cause: unknown): void {}",
		"function enrich(cause: Error | unknown): void {}",
		"function isString(value: unknown): value is string { return true; }",
		"const isString = (value: unknown): value is string => true;",
		"function assertString(value: unknown): asserts value is string {}",
		"type Guard = (value: unknown) => value is string;",
		"declare function isString(value: unknown): value is string;",
		"type Guards = { isString(value: unknown): value is string };",
		"function parse(value: string | number): void {}",
		"function fail(options: { cause: unknown }): void {}",
		"function fail(options: Readonly<{ message: string; cause?: unknown }>): void {}",
		"function parse(input: Readonly<{ value: string }>): void {}",
		"load().catch((error: unknown) => report(error));",
		"load().catch(function (error: unknown) { report(error); });",
		"load().then((value: string) => value, (error: unknown) => report(error));",
		"load()?.catch((error: unknown) => report(error));",
	],
	invalid: [
		{ code: "load().then((value: unknown) => value);", errors: [error] },
		{ code: "load().catch((error: unknown, extra: unknown) => error);", errors: [{ ...error, data: { parameter: "extra" } }] },
		{ code: "load().catch(handler((error: unknown) => error));", errors: [error] },
		{ code: "items.map((item: unknown) => item);", errors: [error] },
		{ code: "function parse(value: unknown): void {}", errors: [error] },
		{ code: "function parse(value: string | unknown): void {}", errors: [error] },
		{
			code: "function parse(value: string | (number | unknown)): void {}",
			errors: [error],
		},
		{
			code: "function isString(value: unknown, context: unknown): value is string { return true; }",
			errors: [{ ...error, data: { parameter: "context" } }],
		},
		{ code: "function decode(input: { value: unknown; index: number }): void {}", errors: [{ ...error, data: { parameter: "input" } }] },
		{ code: "function decode(input: Readonly<{ value: unknown }>): void {}", errors: [error] },
		{ code: "function decode({ value }: Partial<{ value: string | unknown }>): void {}", errors: [error] },
		{ code: "function decode(input: { nested: { value: unknown } }): void {}", errors: [error] },
		{ code: "const decode = (input: { index: number } & { value: unknown }) => input;", errors: [error] },
		{
			code: "export function parse({ value }: unknown = {}): void {}",
			errors: [{ ...error, data: { parameter: "{ value }" } }],
		},
	],
});
