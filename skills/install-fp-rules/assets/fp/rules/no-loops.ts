import { defineRule } from "@oxlint/plugins";

import { isIoFile } from "../shared/io-file.ts";

import type { ESTree } from "@oxlint/plugins";

/** Allow iteration only through collection functions and `for...of`. */
export const noLoopsRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Disallow while, do-while, C-style for, and for-in loops outside `.io.ts` files.",
		},
		messages: {
			loop:
				"Replace this loop with `map`, `filter`, `flatMap`, `some`, `every`, `find`, or `for (const item of items)`. Use `Object.entries` instead of `for...in`. For repeat-until work such as retries, polling, or pagination, recurse with a counter parameter and return a failure at a named limit (`if (page >= MAX_PAGES) return err(...)`), so a service that never finishes cannot recurse forever.",
		},
	},
	create(context) {
		if (isIoFile(context.filename)) return {};

		const report = (node: ESTree.Node) => context.report({ node, messageId: "loop" });

		return {
			WhileStatement: report,
			DoWhileStatement: report,
			ForStatement: report,
			ForInStatement: report,
		};
	},
});
