import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Screen =
  | 'landing' | 'register' | 'status' | 'login' | 'plans' | 'dashboard'
  | 'campaign' | 'criteria' | 'matching' | 'students' | 'profile'
  | 'shortlist' | 'offer' | 'offers';
type RegistrationStatus = 'pending' | 'accepted' | 'rejected';

interface Student {
  id: number;
  name: string;
  initials: string;
  location: string;
  program: string;
  education: string;
  gpa: string;
  exam: string;
  score: number;
  skills: string[];
  shortlisted: boolean;
  color: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  readonly apiBaseUrl = (window as Window & { SUPER_OFFER_API_URL?: string }).SUPER_OFFER_API_URL || 'http://localhost:3000/api/v1';
  apiStatus: 'checking' | 'connected' | 'offline' = 'checking';
  screen: Screen = 'landing';
  registrationStep = 1;
  registrationStatus: RegistrationStatus = 'pending';
  selectedPlan = 'Growth';
  selectedStudentId = 1;
  toast = '';
  menuOpen = false;
  studentSearch = '';
  studentFilter = 'All countries';
  sortBy = 'Match score';
  matchingProgress = 0;
  offerSent = false;

  campaign = {
    name: 'Fall 2027 — Data & AI Graduate Intake',
    program: 'MSc Data Science',
    intake: 'Fall 2027',
    seats: 45,
    deadline: '2027-02-15'
  };

  readonly steps: { key: Screen; label: string }[] = [
    { key: 'dashboard', label: 'Overview' },
    { key: 'campaign', label: 'Campaign' },
    { key: 'criteria', label: 'Criteria' },
    { key: 'students', label: 'Matches' },
    { key: 'shortlist', label: 'Shortlist' },
    { key: 'offers', label: 'Offers' }
  ];

  students: Student[] = [
    { id: 1, name: 'Aarav Mehta', initials: 'AM', location: 'Mumbai, India', program: 'MSc Data Science', education: 'B.Tech Computer Science', gpa: '8.8 / 10', exam: 'IELTS 8.0', score: 96, skills: ['Python', 'Machine Learning', 'SQL'], shortlisted: false, color: '#7457dc' },
    { id: 2, name: 'Sara Khan', initials: 'SK', location: 'Lahore, Pakistan', program: 'MSc Data Science', education: 'BSc Software Engineering', gpa: '3.7 / 4', exam: 'IELTS 7.5', score: 93, skills: ['Python', 'Data Analysis', 'Tableau'], shortlisted: true, color: '#e17955' },
    { id: 3, name: 'Daniel Okafor', initials: 'DO', location: 'Lagos, Nigeria', program: 'MSc Artificial Intelligence', education: 'BSc Computer Engineering', gpa: '4.5 / 5', exam: 'TOEFL 108', score: 91, skills: ['TensorFlow', 'Research', 'C++'], shortlisted: false, color: '#16836b' },
    { id: 4, name: 'Mei Lin', initials: 'ML', location: 'Shanghai, China', program: 'MSc Data Science', education: 'BEng Information Systems', gpa: '3.6 / 4', exam: 'IELTS 7.5', score: 89, skills: ['R', 'Statistics', 'Power BI'], shortlisted: true, color: '#3979b8' },
    { id: 5, name: 'Lucas Pereira', initials: 'LP', location: 'São Paulo, Brazil', program: 'MSc Artificial Intelligence', education: 'BSc Computer Science', gpa: '8.6 / 10', exam: 'TOEFL 103', score: 87, skills: ['Java', 'NLP', 'Cloud'], shortlisted: false, color: '#bc7650' }
  ];

  readonly sentOffers = [
    { student: 'Sara Khan', initials: 'SK', program: 'MSc Data Science', award: '30% scholarship', sent: '18 Jul 2026', status: 'Viewed', color: '#e17955' },
    { student: 'Mei Lin', initials: 'ML', program: 'MSc Data Science', award: '20% scholarship', sent: '15 Jul 2026', status: 'Accepted', color: '#3979b8' },
    { student: 'Daniel Okafor', initials: 'DO', program: 'MSc Artificial Intelligence', award: 'Priority admission', sent: '12 Jul 2026', status: 'Pending', color: '#16836b' }
  ];

  get selectedStudent(): Student {
    return this.students.find(student => student.id === this.selectedStudentId) || this.students[0];
  }

  get filteredStudents(): Student[] {
    const term = this.studentSearch.toLowerCase();
    return this.students
      .filter(student => !term || `${student.name} ${student.program} ${student.location}`.toLowerCase().includes(term))
      .filter(student => this.studentFilter === 'All countries' || student.location.includes(this.studentFilter))
      .slice()
      .sort((a, b) => this.sortBy === 'Name' ? a.name.localeCompare(b.name) : b.score - a.score);
  }

  get shortlistedStudents(): Student[] {
    return this.students.filter(student => student.shortlisted);
  }

  go(screen: Screen): void {
    this.screen = screen;
    this.menuOpen = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextRegistrationStep(): void {
    if (this.registrationStep < 3) this.registrationStep += 1;
    else this.go('status');
  }

  selectStatus(status: RegistrationStatus): void {
    this.registrationStatus = status;
  }

  async beginMatching(): Promise<void> {
    this.screen = 'matching';
    this.matchingProgress = 8;
    try {
      const response = await fetch(`${this.apiBaseUrl}/university/search`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sort: 'MATCH_SCORE', page: 1, page_size: 25 })
      });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const body = await response.json();
      this.students = body.results;
      this.apiStatus = 'connected';
    } catch {
      this.apiStatus = 'offline';
    }
    const timer = window.setInterval(() => {
      this.matchingProgress = Math.min(100, this.matchingProgress + 8);
      if (this.matchingProgress >= 100) window.clearInterval(timer);
    }, 140);
  }

  openProfile(id: number): void {
    this.selectedStudentId = id;
    this.go('profile');
  }

  async toggleShortlist(student: Student): Promise<void> {
    student.shortlisted = !student.shortlisted;
    this.notify(student.shortlisted ? `${student.name} added to shortlist` : `${student.name} removed from shortlist`);
    try {
      const response = await fetch(`${this.apiBaseUrl}/university/shortlists/students/${student.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ shortlisted: student.shortlisted })
      });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      this.apiStatus = 'connected';
    } catch {
      this.apiStatus = 'offline';
    }
  }

  async sendOffer(): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/university/offers`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          student_id: this.selectedStudent.id,
          program: this.selectedStudent.program,
          offer_type: 'CONDITIONAL_ADMISSION',
          response_deadline: '2026-08-15',
          award: '30% Global Excellence Scholarship'
        })
      });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      this.apiStatus = 'connected';
      this.offerSent = true;
      this.notify(`Offer sent to ${this.selectedStudent.name} through the API`);
      window.setTimeout(() => this.go('offers'), 900);
    } catch {
      this.apiStatus = 'offline';
      this.notify('Backend is offline — start the API and try again');
    }
  }

  notify(message: string): void {
    this.toast = message;
    window.setTimeout(() => { if (this.toast === message) this.toast = ''; }, 2600);
  }
}
