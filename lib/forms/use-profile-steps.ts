'use client';

import { useEffect, useMemo, useState } from 'react';
import { STUDENT_PROFILE_STEPS, type StudentProfileStep } from '@/lib/models/student-portal';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import { loadFormSchema } from './use-form-schema';

/**
 * Sections that apply to some students and not others, and what decides it.
 *
 * Empty today — the co-applicant section that used to live here was pulled out
 * of the wizard entirely (it has no `route`, so it never reaches this list to
 * begin with) and lives on the dashboard's loan flow instead. Kept as a named
 * mechanism because a future conditional wizard section will need the same
 * hook, read by the wizard, the step guard and anything else that walks the
 * steps alike.
 */
export const SECTION_APPLIES: Record<string, (answers: { needsLoan: string }) => boolean> = {
  coApplicant: ({ needsLoan }) => needsLoan === 'yes'
};

export const sectionApplies = (sectionKey: string, needsLoan: string) =>
  SECTION_APPLIES[sectionKey] ? SECTION_APPLIES[sectionKey]({ needsLoan }) : true;

/**
 * The wizard's steps, taken from the published form.
 *
 * The sections an admin publishes *are* the steps — their order, their titles,
 * and whether they appear at all. Keeping a second list in code meant a new
 * section existed on the server and nowhere a student could reach it, and a
 * renamed section showed its old name in the rail.
 *
 * The coded list is the first paint and the fallback: the rail must not be empty
 * while the schema is in flight, or blank if it cannot be fetched.
 */
/**
 * Where Continue goes from a given step.
 *
 * Each step used to name its successor in its own file, which meant the order
 * lived in nine places and agreed with none of them: the co-applicant step was
 * skipped entirely because Financial pointed straight at Projects, and
 * reordering sections in the builder moved the rail without moving Continue.
 *
 * Reading the live list fixes both, and honours the rule that hides a step —
 * a student who needs no loan is carried past the co-applicant, not into it.
 */
/**
 * "STEP 7 OF 9", worked out rather than typed.
 *
 * Each step used to state its own number, which was fine while there were
 * exactly nine of them in a fixed order. Now the co-applicant appears only for
 * students taking a loan and an admin can reorder or disable sections in the
 * builder, so a written-in number is wrong for everyone it does not describe —
 * a borrower was told "step 7 of 9" while the rail beside it showed ten.
 *
 * Empty for anything not in the list, so nothing renders a stray badge.
 */
export function useStepBadge(currentPath: string): string {
  const steps = useProfileSteps();
  const index = steps.findIndex(step => step.path === currentPath);
  if (index < 0) return '';
  return `STEP ${index + 1} OF ${steps.length}`;
}

export function useNextStepPath(currentPath: string) {
  /** Unfiltered: which steps apply is decided when Continue is pressed. */
  const all = useAllProfileSteps();
  const profile = useStudentProfile();
  const storedNeedsLoan = profile.effectiveNeedsLoan;

  /**
   * Resolved on the click, not on the render.
   *
   * The step that answers "do you need a loan?" is also the step whose answer
   * decides what comes next, and the answer changes in the same action that
   * navigates. Reading it at render time meant Continue used whatever was true
   * when the page loaded — so a student who had just chosen "yes" was still
   * carried past the co-applicant.
   *
   * The caller passes the answer it has just written; anything it does not
   * mention falls back to what the server last told us.
   */
  return (answers?: { needsLoan?: string }): string => {
    const needsLoan = answers?.needsLoan ?? storedNeedsLoan;
    const applicable = all.filter(step => sectionApplies(step.completionKey || '', needsLoan));
    const index = applicable.findIndex(step => step.path === currentPath);
    /** An unknown step, or the last one, ends at review. */
    if (index < 0 || index >= applicable.length - 1) return '/student/review';
    return `/student/${applicable[index + 1].path}`;
  };
}

/** Every published step, before the rules about who each one applies to. */
export function useAllProfileSteps(): StudentProfileStep[] {
  const [steps, setSteps] = useState<StudentProfileStep[]>(STUDENT_PROFILE_STEPS);

  useEffect(() => {
    let cancelled = false;
    loadFormSchema()
      .then(schema => {
        if (cancelled) return;
        const sections = schema.sections
          .filter(section => section.enabled && section.route)
          .sort((a, b) => a.order - b.order)
          .map(section => ({
            path: section.route,
            title: section.label,
            description: section.description || '',
            icon: '',
            completionKey: section.key
          }));
        if (!sections.length) return;
        const review = STUDENT_PROFILE_STEPS[STUDENT_PROFILE_STEPS.length - 1];
        setSteps([...sections, { ...review, icon: '' }]);
      })
      .catch(() => {
        /** Keep the coded steps; a rail that works beats one that vanishes. */
      });
    return () => { cancelled = true; };
  }, []);

  return steps;
}

export function useProfileSteps(): StudentProfileStep[] {
  const [steps, setSteps] = useState<StudentProfileStep[]>(STUDENT_PROFILE_STEPS);
  const profile = useStudentProfile();
  const needsLoan = profile.effectiveNeedsLoan;

  useEffect(() => {
    let cancelled = false;

    loadFormSchema()
      .then(schema => {
        if (cancelled) return;

        const sections = schema.sections
          .filter(section => section.enabled && section.route)
          .sort((a, b) => a.order - b.order)
          .map(section => ({
            path: section.route,
            title: section.label,
            description: section.description || '',
            completionKey: section.key
          }));

        if (!sections.length) return;

        /** Review is not a section of the form; it is where the form ends. */
        const review = STUDENT_PROFILE_STEPS[STUDENT_PROFILE_STEPS.length - 1];
        setSteps([...sections.map(section => ({ ...section, icon: '' })), { ...review, icon: '' }]);
      })
      .catch(() => {
        /** Keep the coded steps; a rail that works beats one that vanishes. */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Numbered after filtering, so a student who skips the co-applicant sees
   * steps 1 to 8 rather than 1 to 9 with one missing.
   */
  return useMemo(
    () => steps
      .filter(step => sectionApplies(step.completionKey || '', needsLoan))
      .map((step, index) => ({ ...step, icon: String(index + 1).padStart(2, '0') })),
    [steps, needsLoan]
  );
}
