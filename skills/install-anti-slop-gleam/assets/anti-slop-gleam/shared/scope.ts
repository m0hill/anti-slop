import type { ESTree, Scope, SourceCode, Variable } from "@oxlint/plugins";

function lookup(scope: Scope, name: string): Variable | undefined {
	const variable = scope.set.get(name);
	if (variable !== undefined || scope.upper === null) return variable;
	return lookup(scope.upper, name);
}

/** Resolve an identifier to its binding by walking lexical scopes upward. */
export function resolveVariable(
	sourceCode: SourceCode,
	identifier: ESTree.IdentifierReference,
): Variable | undefined {
	return lookup(sourceCode.getScope(identifier), identifier.name);
}

/** Reports whether an expression names an unshadowed global binding. */
export function isGlobalIdentifier(
	sourceCode: SourceCode,
	expression: ESTree.Expression,
	name: string,
): expression is ESTree.IdentifierReference {
	if (expression.type !== "Identifier" || expression.name !== name) return false;
	if (sourceCode.isGlobalReference(expression)) return true;
	const variable = resolveVariable(sourceCode, expression);
	return variable === undefined || variable.defs.length === 0;
}
