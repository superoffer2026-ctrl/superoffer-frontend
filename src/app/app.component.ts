import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Screen =
  | 'landing' | 'register' | 'status' | 'login' | 'plans' | 'dashboard'
  | 'campaign' | 'criteria' | 'matching' | 'students' | 'profile'
  | 'shortlist' | 'offer' | 'offers' | 'student-login' | 'student-portal';
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
  readonly apiBaseUrl = (window as Window & { SUPER_OFFER_API_URL?: string }).SUPER_OFFER_API_URL || '/api/v1';
  apiStatus: 'checking' | 'connected' | 'offline' = 'checking';
  apiError = '';
  authLoading = false;
  studentPortalLoading = false;
  studentProfile: any = null;
  studentOffers: any[] = [];
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

  universityRegistration = {
    email: 'maya.chen@northbridge.edu',
    password: 'password123'
  };

  universityLogin = {
    email: 'maya.chen@northbridge.edu',
    password: 'password123',
    remember: true
  };

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

  async apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      ...options,
      headers: { 'content-type': 'application/json', ...(options.headers || {}) }
    });
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : null;
    if (!response.ok) {
      throw new Error(body?.message || `API request failed with status ${response.status}`);
    }
    if (body === null) {
      throw new Error(
        `API returned a non-JSON response for ${path}. Check SUPER_OFFER_API_URL and the backend domain.`
      );
    }
    this.apiStatus = 'connected';
    this.apiError = '';
    return body as T;
  }

  async openStudentPortal(): Promise<void> {
    this.go('student-portal');
    this.studentPortalLoading = true;
    this.apiError = '';
    try {
      const [profile, offers] = await Promise.all([
        this.apiRequest<any>('/students/me'),
        this.apiRequest<{ results: any[] }>('/students/me/offers')
      ]);
      this.studentProfile = profile;
      this.studentOffers = offers.results;
    } catch (error) {
      this.apiStatus = 'offline';
      this.apiError = error instanceof Error ? error.message : 'Unable to connect to the API';
    } finally {
      this.studentPortalLoading = false;
    }
  }

  async nextRegistrationStep(): Promise<void> {
    if (this.registrationStep < 3) {
      this.registrationStep += 1;
      return;
    }

    this.authLoading = true;
    this.apiError = '';
    try {
      await this.apiRequest<{ user_id: string; otp_required: boolean }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: this.universityRegistration.email,
          password: this.universityRegistration.password,
          role: 'UNIVERSITY_OFFICER'
        })
      });
      this.go('status');
    } catch (error) {
      this.apiStatus = 'offline';
      this.apiError = error instanceof Error ? error.message : 'Registration failed';
    } finally {
      this.authLoading = false;
    }
  }

  async loginUniversity(): Promise<void> {
    this.authLoading = true;
    this.apiError = '';
    try {
      const session = await this.apiRequest<{
        access_token: string;
        refresh_token: string;
        role: string;
        expires_in: number;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: this.universityLogin.email,
          password: this.universityLogin.password
        })
      });
      sessionStorage.setItem('superoffer_access_token', session.access_token);
      const refreshStorage = this.universityLogin.remember ? localStorage : sessionStorage;
      refreshStorage.setItem('superoffer_refresh_token', session.refresh_token);
      this.go('plans');
    } catch (error) {
      this.apiStatus = 'offline';
      this.apiError = error instanceof Error ? error.message : 'Login failed';
    } finally {
      this.authLoading = false;
    }
  }

  selectStatus(status: RegistrationStatus): void {
    this.registrationStatus = status;
  }

  async beginMatching(): Promise<void> {
    this.screen = 'matching';
    this.matchingProgress = 8;
    try {
      const body = await this.apiRequest<{ results: Student[] }>('/university/search', {
        method: 'POST',
        body: JSON.stringify({ sort: 'MATCH_SCORE', page: 1, page_size: 25 })
      });
      this.students = body.results;
    } catch (error) {
      this.apiStatus = 'offline';
      this.apiError = error instanceof Error ? error.message : 'Matching API failed';
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
      await this.apiRequest(`/university/shortlists/students/${student.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ shortlisted: student.shortlisted })
      });
    } catch (error) {
      this.apiStatus = 'offline';
      student.shortlisted = !student.shortlisted;
      this.notify(error instanceof Error ? error.message : 'Shortlist API failed');
    }
  }

  async sendOffer(): Promise<void> {
    try {
      await this.apiRequest('/university/offers', {
        method: 'POST',
        body: JSON.stringify({
          student_id: this.selectedStudent.id,
          program: this.selectedStudent.program,
          offer_type: 'CONDITIONAL_ADMISSION',
          response_deadline: '2026-08-15',
          award: '30% Global Excellence Scholarship'
        })
      });
      this.offerSent = true;
      this.notify(`Offer sent to ${this.selectedStudent.name} through the API`);
      window.setTimeout(() => this.go('offers'), 900);
    } catch (error) {
      this.apiStatus = 'offline';
      this.notify(error instanceof Error ? error.message : 'Offer API failed');
    }
  }

  notify(message: string): void {
    this.toast = message;
    window.setTimeout(() => { if (this.toast === message) this.toast = ''; }, 2600);
  }
}
