import { RuleTester } from "oxlint/plugins-dev";

import { noTryCatchRule } from "./no-try-catch.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const boundary = "src/clock.ffi.ts";

tester.run("gleam/no-try-catch", noTryCatchRule, {
	valid: [
		"const result = parse(input); switch (result.ok) { case true: use(result.value); break; case false: report(result.error); break; }",
		{ filename: boundary, code: "export function parseJson(text: string) { try { return ok(JSON.parse(text)); } catch (cause) { return error(cause); } }" },
	],
	invalid: [
		{ code: "try { run(); } catch (error) { log(error); }", errors: [{ messageId: "tryCatch" }] },
		{ code: "try { run(); } finally { close(); }", errors: [{ messageId: "tryCatch" }] },
	],
});
