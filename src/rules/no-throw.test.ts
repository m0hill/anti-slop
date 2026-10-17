import { RuleTester } from "oxlint/plugins-dev";

import { noThrowRule } from "./no-throw.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const ioFile = "src/clock.io.ts";

tester.run("fp/no-throw", noThrowRule, {
	valid: [
		"function find(id: string): Result<User, NotFound> { return { ok: false, error: { kind: \"NotFound\", id } }; }",
		{ filename: ioFile, code: "export function panic(reason: string): never { throw new Error(reason); }" },
		"const Promise = { reject: (reason: string) => reason }; Promise.reject(\"local\");",
		"const value = await Promise.resolve(1);",
		{ filename: ioFile, code: "export const fail = () => Promise.reject(new Error(\"io\"));" },
	],
	invalid: [
		{ code: "function find(id: string) { throw new Error(id); }", errors: [{ messageId: "throw" }] },
		{ code: "const fail = () => { throw \"failed\"; };", errors: [{ messageId: "throw" }] },
		{ filename: "src/clock.ts", code: "throw new Error();", errors: [{ messageId: "throw" }] },
		{ code: "async function load() { return Promise.reject(new Error(\"missing\")); }", errors: [{ messageId: "reject" }] },
	],
});
