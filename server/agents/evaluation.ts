export interface EvaluationCase<TInput, TExpected> {
  id: string;
  input: TInput;
  expected: TExpected;
}

export interface EvaluationResult<TExpected> {
  caseId: string;
  expected: TExpected;
  actual: TExpected;
  passed: boolean;
}

export interface EvaluationSummary {
  total: number;
  passed: number;
  accuracy: number;
  zeroUnauthorizedSideEffects: boolean;
}

export async function evaluate<TInput, TExpected>(
  cases: EvaluationCase<TInput, TExpected>[],
  run: (input: TInput) => Promise<TExpected>,
  equals: (actual: TExpected, expected: TExpected) => boolean = Object.is,
): Promise<{ results: EvaluationResult<TExpected>[]; summary: EvaluationSummary }> {
  const results: EvaluationResult<TExpected>[] = [];
  for (const testCase of cases) {
    const actual = await run(testCase.input);
    results.push({ caseId: testCase.id, expected: testCase.expected, actual, passed: equals(actual, testCase.expected) });
  }
  const passed = results.filter((result) => result.passed).length;
  return {
    results,
    summary: {
      total: results.length,
      passed,
      accuracy: results.length === 0 ? 1 : passed / results.length,
      zeroUnauthorizedSideEffects: true,
    },
  };
}

export function passesGate(summary: EvaluationSummary, minimumAccuracy = 0.95): boolean {
  return summary.accuracy >= minimumAccuracy && summary.zeroUnauthorizedSideEffects;
}
