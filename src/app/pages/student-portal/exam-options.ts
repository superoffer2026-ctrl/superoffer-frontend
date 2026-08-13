/**
 * Exam name / status option lists used to live here as static data. They're now
 * served by the backend (`GET /api/v1/reference/english-exam` and
 * `/reference/competitive-exam`) as the single source of truth — see
 * english-exam.component.ts and competitive-exam.component.ts. Only the
 * status → required-score-fields mapping (pure UI logic, not reference data)
 * stays here.
 */
export interface ScoreFieldDescriptor {
  controlKey: 'score' | 'expectedScore' | 'currentScore';
  label: string;
  placeholder: string;
}

export function scoreFieldsForStatus(status: string): ScoreFieldDescriptor[] {
  if (status === 'I have the score') return [{ controlKey: 'score', label: 'Score', placeholder: 'e.g. 7.5' }];
  if (status === 'Awaiting Result' || status === 'Yet to be taken') {
    return [{ controlKey: 'expectedScore', label: 'Expected Score', placeholder: 'e.g. 7.5' }];
  }
  if (status === 'Retake') {
    return [
      { controlKey: 'currentScore', label: 'Current Score', placeholder: 'e.g. 6.5' },
      { controlKey: 'expectedScore', label: 'Expected Score', placeholder: 'e.g. 7.5' }
    ];
  }
  return [];
}
