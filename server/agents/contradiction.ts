export interface SourcedStatement {
  id: string;
  statement: string;
  sourceId: string;
  observedAt?: string;
}

export interface Contradiction {
  id: string;
  left: SourcedStatement;
  right: SourcedStatement;
  reason: "same-subject-different-value";
}

const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Conservative contradiction primitive. It only flags an explicit pair when
 * both statements share a subject key and differ in their normalized value.
 * It deliberately does not infer contradiction from arbitrary prose.
 */
export function detectContradictions(statements: SourcedStatement[]): Contradiction[] {
  const results: Contradiction[] = [];
  for (let i = 0; i < statements.length; i += 1) {
    for (let j = i + 1; j < statements.length; j += 1) {
      const left = statements[i];
      const right = statements[j];
      const leftParts = normalize(left.statement).split("=");
      const rightParts = normalize(right.statement).split("=");
      if (leftParts.length !== 2 || rightParts.length !== 2) continue;
      if (leftParts[0] !== rightParts[0] || leftParts[1] === rightParts[1]) continue;
      results.push({ id: `${left.id}:${right.id}`, left, right, reason: "same-subject-different-value" });
    }
  }
  return results;
}
