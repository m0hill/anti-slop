import { defineRule } from "@oxlint/plugins";

import { isIoFile } from "../shared/io-file.ts";

/** Use string literal or discriminated unions, which are plain data and work with exhaustive switches. */
export const noEnumsRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Disallow TypeScript enums outside `.io.ts` files.",
		},
		messages: {
			enum:
				"Replace this enum with a union: `type Status = \"active\" | \"suspended\"`, or a discriminated union when variants carry data.",
		},
	},
	create(context) {
		if (isIoFile(context.filename)) return {};

		return {
			TSEnumDeclaration(node) {
				context.report({ node, messageId: "enum" });
			},
		};
	},
});
