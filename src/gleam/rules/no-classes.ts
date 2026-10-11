import { defineRule } from "@oxlint/plugins";

import { isBoundaryFile } from "../shared/boundary.ts";

import type { ESTree } from "@oxlint/plugins";

function isInsideClass(node: ESTree.Node): boolean {
	for (let current = node.parent; current; current = current.parent) {
		if (current.type === "ClassBody") return true;
	}

	return false;
}

/** Model data with types and behavior with module functions, as Gleam does. */
export const noClassesRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Disallow classes and `this` outside `.ffi.ts` boundary modules.",
		},
		messages: {
			class:
				"Replace this class with a `type` for the data and exported functions that take it as their first argument. Variants become a discriminated union.",
			this: "Pass the value as an explicit parameter instead of reading `this`.",
		},
	},
	create(context) {
		if (isBoundaryFile(context.filename)) return {};

		return {
			ClassDeclaration(node) {
				context.report({ node, messageId: "class" });
			},
			ClassExpression(node) {
				context.report({ node, messageId: "class" });
			},
			ThisExpression(node) {
				if (!isInsideClass(node)) context.report({ node, messageId: "this" });
			},
		};
	},
});
