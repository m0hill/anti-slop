import { RuleTester } from "oxlint/plugins-dev";

import { noIgnoredResultRule } from "./no-ignored-result.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const ioFile = "src/main.io.ts";
const save = "function save(user: User): Result<User, SaveError> { return ok(user); }";
const error = (name: string) => ({ messageId: "ignored", data: { name } });

tester.run("fp/no-ignored-result", noIgnoredResultRule, {
	valid: [
		`${save} const saved = save(user); if (!saved.ok) report(saved.error);`,
		`${save} function run(user: User) { return save(user); }`,
		`${save} void save(user);`,
		"function log(message: string): void { write(message); } log(\"hi\");",
		"function count(items: Item[]) { return items.length; } count(items);",
		// Imported functions cannot be seen from this file.
		"import { save } from \"./store.ts\"; save(user);",
		{ filename: ioFile, code: `${save} save(user);` },
	],
	invalid: [
		{ code: `${save} save(user);`, errors: [error("save")] },
		{ code: `save(user); ${save}`, errors: [error("save")] },
		{
			code: "async function load(id: string): Promise<Result<User, LoadError>> { return fetchUser(id); } await load(\"1\");",
			errors: [error("load")],
		},
		{ code: "type SaveResult = Result<User, SaveError>; function store(): SaveResult { return write(); } store();", errors: [error("store")] },
		// No annotation: the function builds a Result directly.
		{ code: "const parse = (text: string) => text.length > 0 ? ok(text) : err(\"empty\"); parse(input);", errors: [error("parse")] },
		{ code: "const parse = (text: string) => ({ ok: true, value: text }); parse(input);", errors: [error("parse")] },
		{ code: "function check(value: number) { if (value < 0) return err(\"negative\"); return ok(value); } check(1);", errors: [error("check")] },
	],
});
