import { CoApplicantPanel } from '@/components/student/CoApplicantPanel';
import styles from '@/styles/student/Wizard.module.css';

export default function CoApplicantPage() {
  return (
    <div className={styles.host}>
      <CoApplicantPanel wizard />
    </div>
  );
}
