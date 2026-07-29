import { Injectable } from '@angular/core';

export interface StudentCandidate {
  id: string;
  name: string;
  avatar: string;
  targetDegree: string;
  fieldOfStudy: string;
  gpa: number;
  gpaScale: string;
  testScore: string;
  currentLocation: string;
  preferredCountry: string;
  matchScore: number;
  isSaved: boolean;
  applicationStatus: 'None' | 'Shortlisted' | 'Offered' | 'Accepted' | 'Under Review';
  skills: string[];
  bio: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'alert';
}

@Injectable({
  providedIn: 'root'
})
export class UniversityDataService {
  currentStep = 1; // 1: Registration, 2: OTP Verification, 3: Profile, 4: Documents, 5: Pending Approval, 6: Dashboard

  // Screen 1 Data
  registration = {
    universityName: 'Stanford Global Institute',
    officialEmail: 'admissions@stanford.edu',
    password: '',
    confirmPassword: ''
  };

  // Screen 2 Data
  emailVerification = {
    otp: ['', '', '', '', '', ''],
    verified: false,
    resendCooldown: 30
  };

  // Screen 3 Data
  profile = {
    universityName: 'Stanford Global Institute',
    website: 'https://www.stanford.edu',
    country: 'United States',
    city: 'Stanford, California',
    universityType: 'Private Research',
    establishedYear: '1891',
    description: 'A leading global research institution dedicated to academic excellence, innovation, and technological advancement across diverse disciplines.',
    contactPerson: 'Dr. Elizabeth Vance',
    contactNumber: '+1 (650) 723-2300'
  };

  // Screen 4 Data
  documents = {
    accreditation: { file: 'Accreditation_Certificate_2026.pdf', progress: 100, uploaded: true, size: '2.4 MB' },
    authorization: { file: 'Authorization_Letter_SuperOffer.pdf', progress: 100, uploaded: true, size: '1.8 MB' },
    logo: { file: 'University_Official_Logo.png', progress: 100, uploaded: true, size: '512 KB', preview: 'https://api.dicebear.com/7.x/initials/svg?seed=SGI' }
  };

  // Screen 5 Data
  approvalState: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';
  rejectionReason = 'The official authorization letter requires an updated institutional seal and sign-off from the Dean of Admissions.';

  timelineSteps = [
    { title: 'University Registration', description: 'Account created & domain verified', completed: true, timestamp: 'Today, 10:14 AM' },
    { title: 'University Profile Details', description: 'Institutional data & contact information submitted', completed: true, timestamp: 'Today, 10:22 AM' },
    { title: 'Document Upload', description: 'Accreditation, authorization letter & logo attached', completed: true, timestamp: 'Today, 10:30 AM' },
    { title: 'Super Admin Review', description: 'Credentials and domain check in progress', completed: false, current: true, timestamp: 'In progress' },
    { title: 'Verified Portal Unlocked', description: 'Full access to Student Marketplace & Admissions', completed: false, current: false, timestamp: 'Pending' }
  ];

  // Screen 6 Data - Student Marketplace Candidates
  candidates: StudentCandidate[] = [
    {
      id: 'STU-101',
      name: 'Aarav Sharma',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
      targetDegree: 'Master of Science',
      fieldOfStudy: 'Computer Science & AI',
      gpa: 3.88,
      gpaScale: '4.0',
      testScore: 'GRE 328 · IELTS 8.0',
      currentLocation: 'Mumbai, India',
      preferredCountry: 'United States',
      matchScore: 96,
      isSaved: true,
      applicationStatus: 'Shortlisted',
      skills: ['Python', 'TensorFlow', 'Data Structures', 'Machine Learning'],
      bio: 'Final year Computer Engineering student with 2 research papers in deep learning and 1 industry internship at a Fortune 500 tech firm.'
    },
    {
      id: 'STU-102',
      name: 'Sophia Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
      targetDegree: 'Master of Science',
      fieldOfStudy: 'Data Science & Business Analytics',
      gpa: 3.92,
      gpaScale: '4.0',
      testScore: 'GRE 331 · TOEFL 114',
      currentLocation: 'Singapore',
      preferredCountry: 'United States',
      matchScore: 94,
      isSaved: true,
      applicationStatus: 'Offered',
      skills: ['SQL', 'R', 'PyTorch', 'Tableau', 'Big Data'],
      bio: 'Data Analyst with 2 years of experience at a fintech unicorn. Strong quantitative background in mathematical statistics.'
    },
    {
      id: 'STU-103',
      name: 'Rohan Patel',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
      targetDegree: 'Master of Engineering',
      fieldOfStudy: 'Robotics & Automation',
      gpa: 3.75,
      gpaScale: '4.0',
      testScore: 'GRE 322 · IELTS 7.5',
      currentLocation: 'Bengaluru, India',
      preferredCountry: 'United States',
      matchScore: 89,
      isSaved: false,
      applicationStatus: 'None',
      skills: ['ROS', 'C++', 'Embedded Systems', 'CAD', 'Control Systems'],
      bio: 'Mechatronics lead for university Autonomous Underwater Vehicle team. National robotics hackathon winner.'
    },
    {
      id: 'STU-104',
      name: 'Elena Rostova',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
      targetDegree: 'MBA',
      fieldOfStudy: 'International Finance & Tech',
      gpa: 3.84,
      gpaScale: '4.0',
      testScore: 'GMAT 720 · IELTS 8.5',
      currentLocation: 'Berlin, Germany',
      preferredCountry: 'United States',
      matchScore: 92,
      isSaved: true,
      applicationStatus: 'Accepted',
      skills: ['Financial Modeling', 'Venture Capital', 'Valuation', 'Strategy'],
      bio: 'Investment Analyst with 3 years of venture capital background focusing on early-stage European SaaS startups.'
    },
    {
      id: 'STU-105',
      name: 'David Kim',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      targetDegree: 'Master of Science',
      fieldOfStudy: 'Cybersecurity & Cloud Systems',
      gpa: 3.71,
      gpaScale: '4.0',
      testScore: 'GRE 318 · TOEFL 108',
      currentLocation: 'Seoul, South Korea',
      preferredCountry: 'United States',
      matchScore: 87,
      isSaved: false,
      applicationStatus: 'None',
      skills: ['Ethical Hacking', 'AWS', 'Network Security', 'Linux', 'Cryptography'],
      bio: 'Certified Information Systems Security Professional candidate with passion for zero-trust cloud architectures.'
    },
    {
      id: 'STU-106',
      name: 'Ananya Deshmukh',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
      targetDegree: 'Master of Science',
      fieldOfStudy: 'Bioinformatics & Computational Biology',
      gpa: 3.95,
      gpaScale: '4.0',
      testScore: 'GRE 335 · IELTS 8.0',
      currentLocation: 'Pune, India',
      preferredCountry: 'United States',
      matchScore: 97,
      isSaved: true,
      applicationStatus: 'Offered',
      skills: ['Genomics', 'Bio-Python', 'Statistical Genetics', 'R'],
      bio: 'Gold medalist in Biotechnology with published thesis on genomic sequence classification using transformer networks.'
    }
  ];

  // Dashboard Stats
  subscription = {
    planName: 'Enterprise Admissions Tier',
    status: 'ACTIVE',
    creditsTotal: 500,
    creditsUsed: 312,
    creditsRemaining: 188,
    renewalDate: 'October 15, 2026',
    features: [
      'Unlimited verified student profile searches',
      'AI-powered candidate match score calculation',
      'Direct invitation & scholarship offer issuance',
      'Dedicated institutional relationship manager',
      'Exportable analytics & funnel conversion reports'
    ]
  };

  notifications: NotificationItem[] = [
    {
      id: 'N-1',
      title: 'Offer Accepted!',
      message: 'Sophia Chen accepted your MSc Data Science scholarship offer.',
      time: '12 mins ago',
      read: false,
      type: 'success'
    },
    {
      id: 'N-2',
      title: 'New Student Match',
      message: 'Aarav Sharma scores 96% match with your Computer Science MSc profile.',
      time: '1 hour ago',
      read: false,
      type: 'info'
    },
    {
      id: 'N-3',
      title: 'Quota Reminder',
      message: 'You have 188 student invitations remaining in your Enterprise Tier cycle.',
      time: '3 hours ago',
      read: true,
      type: 'alert'
    }
  ];

  constructor() {
    this.loadState();
  }

  saveState() {
    const state = {
      currentStep: this.currentStep,
      registration: this.registration,
      emailVerification: this.emailVerification,
      profile: this.profile,
      documents: this.documents,
      approvalState: this.approvalState,
      candidates: this.candidates
    };
    localStorage.setItem('superoffer_university_module_state', JSON.stringify(state));
  }

  loadState() {
    const saved = localStorage.getItem('superoffer_university_module_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currentStep) this.currentStep = parsed.currentStep;
        if (parsed.registration) this.registration = parsed.registration;
        if (parsed.profile) this.profile = parsed.profile;
        if (parsed.approvalState) this.approvalState = parsed.approvalState;
      } catch (e) {
        console.warn('Could not restore university state', e);
      }
    }
  }

  toggleSaveStudent(candidateId: string) {
    const candidate = this.candidates.find(c => c.id === candidateId);
    if (candidate) {
      candidate.isSaved = !candidate.isSaved;
      if (candidate.isSaved && candidate.applicationStatus === 'None') {
        candidate.applicationStatus = 'Shortlisted';
      }
      this.saveState();
    }
  }

  sendOffer(candidateId: string) {
    const candidate = this.candidates.find(c => c.id === candidateId);
    if (candidate) {
      candidate.applicationStatus = 'Offered';
      this.notifications.unshift({
        id: 'N-' + Date.now(),
        title: 'Invitation Sent',
        message: `Official admission invitation sent to ${candidate.name}.`,
        time: 'Just now',
        read: false,
        type: 'success'
      });
      this.saveState();
    }
  }

  get overallUploadProgress(): number {
    const docs = [this.documents.accreditation, this.documents.authorization, this.documents.logo];
    const total = docs.reduce((acc, curr) => acc + (curr.uploaded ? 100 : curr.progress), 0);
    return Math.round(total / docs.length);
  }
}
