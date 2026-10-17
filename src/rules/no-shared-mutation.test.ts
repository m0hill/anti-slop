import { RuleTester } from "oxlint/plugins-dev";

import { noSharedMutationRule } from "./no-shared-mutation.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const boundary = "src/clock.ffi.ts";
const mutation = (name: string, owner: string) => ({ messageId: "sharedMutation", data: { name, owner } });

tester.run("gleam/no-shared-mutation", noSharedMutationRule, {
	valid: [
		"function collect(users: readonly User[]) { const emails: string[] = []; for (const user of users) emails.push(user.email); return emails; }",
		"function count(words: readonly string[]) { const counts = new Map<string, number>(); for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1); return counts; }",
		"function rename(user: User, name: string): User { return { ...user, name }; }",
		"function ordered(items: readonly number[]) { return items.toSorted(); }",
		"function merge(user: User, patch: Patch): User { return Object.assign({}, user, patch); }",
		"function build() { const draft = { name: \"\" }; draft.name = \"set\"; return draft; }",
		"const items: number[] = []; function local() { const items: number[] = []; items.push(1); return items; }",
		"function save(cache: Cache, key: string, value: string) { cache.set(key, value); }",
		"function log(logger: Logger) { logger.info(\"saved\"); }",
		"function f(Object: Assigner, user: User) { Object.assign(user, {}); }",
		{ filename: boundary, code: "export function reset(buffer: number[]) { buffer.length = 0; buffer.push(1); }" },
	],
	invalid: [
		{ code: "function rename(user: User, name: string) { user.name = name; }", errors: [mutation("user", "a parameter")] },
		{ code: "function move(user: User) { user.address.city = \"Oslo\"; }", errors: [mutation("user", "a parameter")] },
		{ code: "function bump(counter: Counter) { counter.value++; }", errors: [mutation("counter", "a parameter")] },
		{ code: "function bump(counter: Counter) { counter.value += 1; }", errors: [mutation("counter", "a parameter")] },
		{ code: "function drop(record: Rec, key: string) { delete record[key]; }", errors: [mutation("record", "a parameter")] },
		{ code: "function add(items: number[], item: number) { items.push(item); return items; }", errors: [mutation("items", "a parameter")] },
		{ code: "function order(items: number[]) { return items.sort(); }", errors: [mutation("items", "a parameter")] },
		{ code: "function add({ items }: Cart) { items.push(1); }", errors: [mutation("items", "a parameter")] },
		{ code: "users.forEach(user => { user.active = false; });", errors: [mutation("user", "a parameter")] },
		{ code: "items.reduce((acc, item) => { acc.push(item); return acc; }, []);", errors: [mutation("acc", "a parameter")] },
		{ code: "function patch(user: User, changes: Patch) { Object.assign(user, changes); }", errors: [mutation("user", "a parameter")] },
		{ code: "const registry: string[] = []; export function register(name: string) { registry.push(name); }", errors: [mutation("registry", "a module-level binding")] },
		{ code: "const state = { count: 0 }; export function increment() { state.count += 1; }", errors: [mutation("state", "a module-level binding")] },
		{ code: "import { config } from \"./config.ts\"; config.debug = true;", errors: [mutation("config", "an import")] },
		{ code: "function set(user: User) { user!.name = \"\"; }", errors: [mutation("user", "a parameter")] },
	],
});
