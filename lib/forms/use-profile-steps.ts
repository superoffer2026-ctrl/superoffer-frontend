'use client';

import { useEffect, useState } from 'react';
import { STUDENT_PROFILE_STEPS, type StudentProfileStep } from '@/lib/models/student-portal';
import { loadFormSchema } from './use-form-schema';

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
export function useProfileSteps(): StudentProfileStep[] {
  const [steps, setSteps] = useState<StudentProfileStep[]>(STUDENT_PROFILE_STEPS);

  useEffect(() => {
    let cancelled = false;

    loadFormSchema()
      .then(schema => {
        if (cancelled) return;

        const sections = schema.sections
          .filter(section => section.enabled && section.route)
          .sort((a, b) => a.order - b.order)
          .map((section, index) => ({
            path: section.route,
            title: section.label,
            description: section.description || '',
            icon: String(index + 1).padStart(2, '0'),
            completionKey: section.key
          }));

        if (!sections.length) return;

        /** Review is not a section of the form; it is where the form ends. */
        const review = STUDENT_PROFILE_STEPS[STUDENT_PROFILE_STEPS.length - 1];
        setSteps([...sections, { ...review, icon: String(sections.length + 1).padStart(2, '0') }]);
      })
      .catch(() => {
        /** Keep the coded steps; a rail that works beats one that vanishes. */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return steps;
}
