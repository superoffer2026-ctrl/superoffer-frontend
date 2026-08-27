import { redirect } from 'next/navigation';

/** No longer a wizard step — the parent/guardian details now live on the dashboard's loan flow. */
export default function CoApplicantPage() {
  redirect('/student/loan-eligibility');
}
