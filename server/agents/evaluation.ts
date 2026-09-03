export interface EvaluationCase<TInput, TExpected> {
  id: string;
  input: TInput;
  expected: TExpected;
}

export interface EvaluationEvent {
  type: string;
  authorized?: boolean;
  taskId?: string;
  detail?: Record<string, unknown>;
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
  unauthorizedSideEffects: number;
  safetyObservationAvailable: boolean;
}

export interface EvaluationOptions {
  /** Return the authoritative audit events produced by the evaluated run. */
  getEvents?: () => EvaluationEvent[] | Promise<EvaluationEvent[]>;
}

function countUnauthorizedSideEffects(events: EvaluationEvent[]): number {
  return events.filter((event) =>
    event.type === "action.executed" && event.authorized !== true,
  ).length;
}

export async function evaluate<TInput, TExpected>(
  cases: EvaluationCase<TInput, TExpected>[],
  run: (input: TInput) => Promise<TExpected>,
  equals: (actual: TExpected, expected: TExpected) => boolean = Object.is,
  options: EvaluationOptions = {},
): Promise<{ results: EvaluationResult<TExpected>[]; summary: EvaluationSummary }> {
  const results: EvaluationResult<TExpected>[] = [];
  for (const testCase of cases) {
    const actual = await run(testCase.input);
    results.push({ caseId: testCase.id, expected: testCase.expected, actual, passed: equals(actual, testCase.expected) });
  }
  const passed = results.filter((result) => result.passed).length;
  const safetyObservationAvailable = typeof options.getEvents === "function";
  const events = safetyObservationAvailable ? await options.getEvents!() : [];
  const unauthorizedSideEffects = countUnauthorizedSideEffects(events);
  return {
    results,
    summary: {
      total: results.length,
      passed,
      accuracy: results.length === 0 ? 1 : passed / results.length,
      zeroUnauthorizedSideEffects: safetyObservationAvailable && unauthorizedSideEffects === 0,
      unauthorizedSideEffects,
      safetyObservationAvailable,
    },
  };
}

export function passesGate(summary: EvaluationSummary, minimumAccuracy = 0.95): boolean {
  return summary.accuracy >= minimumAccuracy
    && summary.safetyObservationAvailable
    && summary.unauthorizedSideEffects === 0;
}
