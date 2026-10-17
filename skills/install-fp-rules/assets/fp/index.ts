import { eslintCompatPlugin } from "@oxlint/plugins";

import { noAmbientCapabilitiesRule } from "./rules/no-ambient-capabilities.ts";
import { noClassesRule } from "./rules/no-classes.ts";
import { noEnumsRule } from "./rules/no-enums.ts";
import { noLoopsRule } from "./rules/no-loops.ts";
import { noModuleMockingRule } from "./rules/no-module-mocking.ts";
import { noMutableBindingsRule } from "./rules/no-mutable-bindings.ts";
import { noNullRule } from "./rules/no-null.ts";
import { noSharedMutationRule } from "./rules/no-shared-mutation.ts";
import { noThrowRule } from "./rules/no-throw.ts";
import { noTryCatchRule } from "./rules/no-try-catch.ts";

/** Oxlint rules that keep TypeScript in a small, functional style. */
const fpPlugin = eslintCompatPlugin({
	meta: { name: "fp" },
	rules: {
		"no-ambient-capabilities": noAmbientCapabilitiesRule,
		"no-classes": noClassesRule,
		"no-enums": noEnumsRule,
		"no-loops": noLoopsRule,
		"no-module-mocking": noModuleMockingRule,
		"no-mutable-bindings": noMutableBindingsRule,
		"no-null": noNullRule,
		"no-shared-mutation": noSharedMutationRule,
		"no-throw": noThrowRule,
		"no-try-catch": noTryCatchRule,
	},
});

export default fpPlugin;
