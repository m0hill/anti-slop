import { defineRule } from "@oxlint/plugins";

import { isIoFile } from "../shared/io-file.ts";

/** Convert foreign exceptions to Result values once, inside `.io.ts` files. */
export const noTryCatchRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Disallow try statements outside `.io.ts` files.",
		},
		messages: {
			tryCatch:
				"Move this try statement into an `.io.ts` file that wraps the throwing API and returns a Result. Callers handle the Result instead of catching. For an awaited promise, convert the rejection inline instead: `await promise.then(ok, (cause: unknown) => err(...))`.",
		},
	},
	create(context) {
		if (isIoFile(context.filename)) return {};

		return {
			TryStatement(node) {
				context.report({ node, messageId: "tryCatch" });
			},
		};
	},
});
