import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniversityDataService, StudentCandidate } from './university-data.service';

@Component({
  selector: 'app-university-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dash-workspace">
      <!-- TOP NAVBAR -->
      <header class="dash-top-navbar">
        <div class="nav-left">
          <a class="brand light-brand">
            <span>S</span>SuperOffer
          </a>
          <span class="nav-portal-tag">University Workspace</span>
        </div>

        <div class="nav-right">
          <!-- Notification Bell Dropdown -->
          <div class="nav-notification-wrapper">
            <button
              type="button"
              class="nav-icon-btn"
              (click)="toggleNotifications()"
            >
              🔔
              <span class="unread-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
            </button>

            <!-- Notifications Dropdown Menu -->
            <div class="notifications-dropdown" *ngIf="showNotifications">
              <div class="dropdown-head">
                <strong>Notifications</strong>
                <button (click)="markAllRead()">Mark all read</button>
              </div>
              <div class="dropdown-list">
                <div
                  *ngFor="let item of dataService.notifications"
                  class="notification-item"
                  [class.unread]="!item.read"
                >
                  <div class="n-icon" [ngClass]="item.type">
                    {{ item.type === 'success' ? '✓' : item.type === 'alert' ? '!' : 'i' }}
                  </div>
                  <div class="n-content">
                    <strong>{{ item.title }}</strong>
                    <p>{{ item.message }}</p>
                    <small>{{ item.time }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- University Profile Pill -->
          <div class="profile-pill-container">
            <div class="profile-pill" (click)="toggleProfileMenu()">
              <div class="profile-avatar">
                🏛️
              </div>
              <div class="profile-info">
                <strong class="uni-name">{{ dataService.profile.universityName || 'Stanford Global' }}</strong>
                <small class="uni-status">✓ Verified Org</small>
              </div>
              <span class="dropdown-arrow">▼</span>
            </div>

            <!-- Profile Dropdown Menu -->
            <div class="profile-dropdown" *ngIf="showProfileMenu">
              <div class="p-dropdown-header">
                <strong>{{ dataService.profile.contactPerson }}</strong>
                <small>{{ dataService.registration.officialEmail }}</small>
              </div>
              <button (click)="activeTab = 'settings'; showProfileMenu = false">
                ⚙️ Institution Settings
              </button>
              <button (click)="activeTab = 'subscription'; showProfileMenu = false">
                💳 Subscription & Billing
              </button>
              <div class="p-dropdown-divider"></div>
              <button class="logout-btn" (click)="exitPortal()">
                🚪 Log Out Workspace
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- MAIN CONTAINER: SIDEBAR + CONTENT -->
      <div class="dash-body">
        <!-- SIDEBAR NAVIGATION -->
        <aside class="dash-sidebar">
          <nav class="sidebar-nav">
            <button
              [class.active]="activeTab === 'dashboard'"
              (click)="activeTab = 'dashboard'"
            >
              <span class="nav-icon">📊</span>
              Dashboard
            </button>

            <button
              [class.active]="activeTab === 'marketplace'"
              (click)="activeTab = 'marketplace'"
            >
              <span class="nav-icon">⌕</span>
              Student Marketplace
            </button>

            <button
              [class.active]="activeTab === 'saved'"
              (click)="activeTab = 'saved'"
            >
              <span class="nav-icon">🔖</span>
              Saved Students
              <span class="count-pill">{{ savedCandidatesCount }}</span>
            </button>

            <button
              [class.active]="activeTab === 'subscription'"
              (click)="activeTab = 'subscription'"
            >
              <span class="nav-icon">💳</span>
              Subscription
            </button>

            <button
              [class.active]="activeTab === 'analytics'"
              (click)="activeTab = 'analytics'"
            >
              <span class="nav-icon">📈</span>
              Analytics
            </button>

            <button
              [class.active]="activeTab === 'settings'"
              (click)="activeTab = 'settings'"
            >
              <span class="nav-icon">⚙️</span>
              Settings
            </button>
          </nav>

          <div class="sidebar-footer-card">
            <div class="quota-badge">Enterprise Tier</div>
            <p><strong>{{ dataService.subscription.creditsRemaining }}</strong> invitations available</p>
            <div class="quota-progress-track">
              <div
                class="quota-progress-bar"
                [style.width.%]="(dataService.subscription.creditsUsed / dataService.subscription.creditsTotal) * 100"
              ></div>
            </div>
          </div>
        </aside>

        <!-- MAIN VIEW CONTENT AREA -->
        <main class="dash-content">
          <!-- 1. DASHBOARD OVERVIEW VIEW -->
          <section *ngIf="activeTab === 'dashboard'">
            <div class="view-header">
              <div>
                <span class="eyebrow">OVERVIEW</span>
                <h2>University Admissions Dashboard</h2>
              </div>
              <button class="button primary" (click)="activeTab = 'marketplace'">
                Explore Student Marketplace →
              </button>
            </div>

            <!-- DASHBOARD 4 TOP CARDS -->
            <div class="dashboard-cards-grid">
              <!-- Card 1: Subscription -->
              <div class="dash-card">
                <div class="card-top">
                  <span class="card-icon blue">💳</span>
                  <span class="card-tag active">Active</span>
                </div>
                <h3>Subscription</h3>
                <strong class="card-main-stat">Enterprise Tier</strong>
                <p>{{ dataService.subscription.creditsRemaining }} credits remaining</p>
                <button class="card-link" (click)="activeTab = 'subscription'">Manage Plan →</button>
              </div>

              <!-- Card 2: Students Available -->
              <div class="dash-card">
                <div class="card-top">
                  <span class="card-icon green">🎓</span>
                  <span class="card-tag info">+128 today</span>
                </div>
                <h3>Students Available</h3>
                <strong class="card-main-stat">10,480</strong>
                <p>AI-matched candidate profiles</p>
                <button class="card-link" (click)="activeTab = 'marketplace'">Browse Marketplace →</button>
              </div>

              <!-- Card 3: Saved Students -->
              <div class="dash-card">
                <div class="card-top">
                  <span class="card-icon amber">🔖</span>
                  <span class="card-tag count">{{ savedCandidatesCount }}</span>
                </div>
                <h3>Saved Students</h3>
                <strong class="card-main-stat">{{ savedCandidatesCount }} candidates</strong>
                <p>Shortlisted for upcoming intakes</p>
                <button class="card-link" (click)="activeTab = 'saved'">View Shortlist →</button>
              </div>

              <!-- Card 4: Applications / Offers -->
              <div class="dash-card">
                <div class="card-top">
                  <span class="card-icon purple">✉</span>
                  <span class="card-tag success">37.5% Accepted</span>
                </div>
                <h3>Applications</h3>
                <strong class="card-main-stat">48 Total</strong>
                <p>18 Accepted • 14 Under Review</p>
                <button class="card-link" (click)="activeTab = 'analytics'">View Funnel →</button>
              </div>
            </div>

            <!-- Quick Action & Student Matches Preview -->
            <div class="dash-split-grid">
              <!-- Left: Top Matched Candidates -->
              <div class="content-box">
                <div class="box-header">
                  <h3>Top AI-Matched Candidates</h3>
                  <a (click)="activeTab = 'marketplace'">View all</a>
                </div>
                <div class="mini-candidate-list">
                  <div *ngFor="let candidate of dataService.candidates.slice(0, 3)" class="mini-c-item">
                    <img [src]="candidate.avatar" [alt]="candidate.name" class="c-avatar" />
                    <div class="c-info">
                      <strong>{{ candidate.name }}</strong>
                      <small>{{ candidate.targetDegree }} in {{ candidate.fieldOfStudy }}</small>
                      <span class="c-score">GPA {{ candidate.gpa }} • {{ candidate.testScore }}</span>
                    </div>
                    <div class="c-match">
                      <span class="match-badge">{{ candidate.matchScore }}% Match</span>
                      <button
                        class="button ghost compact"
                        (click)="dataService.toggleSaveStudent(candidate.id)"
                      >
                        {{ candidate.isSaved ? '★ Saved' : '☆ Save' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: Institutional Activity Stream -->
              <div class="content-box">
                <div class="box-header">
                  <h3>Admissions Activity Stream</h3>
                </div>
                <ul class="activity-list">
                  <li>
                    <span class="act-dot green"></span>
                    <div>
                      <strong>Sophia Chen</strong> accepted admission offer for MSc Data Science.
                      <small>12 minutes ago</small>
                    </div>
                  </li>
                  <li>
                    <span class="act-dot blue"></span>
                    <div>
                      Official accreditation documents verified by SuperAdmin.
                      <small>2 hours ago</small>
                    </div>
                  </li>
                  <li>
                    <span class="act-dot purple"></span>
                    <div>
                      Sent formal offer letter to <strong>Ananya Deshmukh</strong>.
                      <small>Yesterday, 4:30 PM</small>
                    </div>
                  </li>
                  <li>
                    <span class="act-dot amber"></span>
                    <div>
                      Saved <strong>Aarav Sharma</strong> to Fall 2026 Shortlist.
                      <small>Yesterday, 2:15 PM</small>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- 2. STUDENT MARKETPLACE VIEW -->
          <section *ngIf="activeTab === 'marketplace'">
            <div class="view-header">
              <div>
                <span class="eyebrow">DISCOVERY</span>
                <h2>Student Marketplace</h2>
              </div>
            </div>

            <!-- Filters Bar -->
            <div class="filters-card">
              <div class="search-input-box">
                🔍
                <input
                  type="text"
                  placeholder="Search by student name, field, or skills (e.g. Python, Data Science)..."
                  [(ngModel)]="searchQuery"
                />
              </div>

              <div class="filter-controls">
                <select [(ngModel)]="selectedDegree">
                  <option value="">All Degrees</option>
                  <option value="Master of Science">Master of Science</option>
                  <option value="MBA">MBA</option>
                  <option value="Master of Engineering">Master of Engineering</option>
                </select>

                <select [(ngModel)]="selectedCountry">
                  <option value="">All Preferred Countries</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                </select>

                <button class="button ghost" (click)="searchQuery = ''; selectedDegree = ''; selectedCountry = ''">
                  Reset Filters
                </button>
              </div>
            </div>

            <!-- Candidates Grid -->
            <div class="candidates-grid">
              <div *ngFor="let candidate of filteredCandidates" class="candidate-card">
                <div class="c-card-top">
                  <img [src]="candidate.avatar" [alt]="candidate.name" class="candidate-img" />
                  <div class="c-card-meta">
                    <h3>{{ candidate.name }}</h3>
                    <p>📍 {{ candidate.currentLocation }}</p>
                    <small>Prefers {{ candidate.preferredCountry }}</small>
                  </div>
                  <span class="match-circle">{{ candidate.matchScore }}%</span>
                </div>

                <div class="c-card-body">
                  <div class="academic-tag">
                    <strong>{{ candidate.targetDegree }}</strong> • {{ candidate.fieldOfStudy }}
                  </div>
                  <div class="scores-row">
                    <span>GPA: <strong>{{ candidate.gpa }}</strong></span>
                    <span>Test: <strong>{{ candidate.testScore }}</strong></span>
                  </div>
                  <p class="c-bio">{{ candidate.bio }}</p>

                  <div class="skills-chips">
                    <span *ngFor="let skill of candidate.skills" class="chip">{{ skill }}</span>
                  </div>
                </div>

                <div class="c-card-footer">
                  <button
                    class="button ghost"
                    [class.saved-active]="candidate.isSaved"
                    (click)="dataService.toggleSaveStudent(candidate.id)"
                  >
                    {{ candidate.isSaved ? '★ Shortlisted' : '☆ Shortlist' }}
                  </button>

                  <button
                    class="button primary"
                    [disabled]="candidate.applicationStatus === 'Offered' || candidate.applicationStatus === 'Accepted'"
                    (click)="sendOffer(candidate)"
                  >
                    {{ candidate.applicationStatus === 'Offered' ? 'Offer Sent' : candidate.applicationStatus === 'Accepted' ? 'Accepted' : 'Send Invitation' }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- 3. SAVED STUDENTS VIEW -->
          <section *ngIf="activeTab === 'saved'">
            <div class="view-header">
              <div>
                <span class="eyebrow">SHORTLIST</span>
                <h2>Saved Students</h2>
              </div>
            </div>

            <div class="content-box" *ngIf="savedCandidates.length > 0">
              <div class="shortlist-table">
                <div class="table-head">
                  <span>Candidate</span>
                  <span>Target Degree & Field</span>
                  <span>Academic Record</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                <div *ngFor="let item of savedCandidates" class="table-row">
                  <div class="t-candidate">
                    <img [src]="item.avatar" [alt]="item.name" class="t-img" />
                    <div>
                      <strong>{{ item.name }}</strong>
                      <small>{{ item.currentLocation }}</small>
                    </div>
                  </div>

                  <div>
                    <strong>{{ item.targetDegree }}</strong>
                    <small>{{ item.fieldOfStudy }}</small>
                  </div>

                  <div>
                    <strong>GPA {{ item.gpa }}</strong>
                    <small>{{ item.testScore }}</small>
                  </div>

                  <div>
                    <span class="status-tag" [ngClass]="item.applicationStatus.toLowerCase()">
                      {{ item.applicationStatus }}
                    </span>
                  </div>

                  <div class="t-actions">
                    <button class="button primary compact" (click)="sendOffer(item)">
                      Send Offer
                    </button>
                    <button class="button ghost compact" (click)="dataService.toggleSaveStudent(item.id)">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="empty-state" *ngIf="savedCandidates.length === 0">
              <div class="empty-icon">🔖</div>
              <h3>No Saved Candidates Yet</h3>
              <p>Shortlist qualified candidates from the Student Marketplace to review and send admission offers.</p>
              <button class="button primary" (click)="activeTab = 'marketplace'">
                Browse Marketplace →
              </button>
            </div>
          </section>

          <!-- 4. SUBSCRIPTION VIEW -->
          <section *ngIf="activeTab === 'subscription'">
            <div class="view-header">
              <div>
                <span class="eyebrow">PLAN & QUOTA</span>
                <h2>Subscription & Billing</h2>
              </div>
            </div>

            <div class="sub-overview-card">
              <div class="sub-header-row">
                <div>
                  <span class="sub-badge">CURRENT PLAN</span>
                  <h3>{{ dataService.subscription.planName }}</h3>
                  <p>Renews on {{ dataService.subscription.renewalDate }}</p>
                </div>
                <button class="button primary" (click)="showUpgradeModal = true">
                  Upgrade Tier
                </button>
              </div>

              <div class="quota-breakdown-grid">
                <div class="q-box">
                  <small>Total Quota</small>
                  <strong>{{ dataService.subscription.creditsTotal }}</strong>
                  <span>Invitations</span>
                </div>
                <div class="q-box">
                  <small>Used Quota</small>
                  <strong>{{ dataService.subscription.creditsUsed }}</strong>
                  <span>Sent to Students</span>
                </div>
                <div class="q-box highlight">
                  <small>Remaining Quota</small>
                  <strong>{{ dataService.subscription.creditsRemaining }}</strong>
                  <span>Credits Available</span>
                </div>
              </div>

              <div class="sub-features-list">
                <h4>Tier Privileges Included:</h4>
                <ul>
                  <li *ngFor="let feat of dataService.subscription.features">
                    ✓ {{ feat }}
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- 5. ANALYTICS VIEW -->
          <section *ngIf="activeTab === 'analytics'">
            <div class="view-header">
              <div>
                <span class="eyebrow">REPORTS</span>
                <h2>Admissions & Offer Analytics</h2>
              </div>
            </div>

            <div class="analytics-metrics-grid">
              <div class="a-metric-card">
                <small>Total Invitations Issued</small>
                <strong>48</strong>
                <span class="trend positive">↑ 14% vs last month</span>
              </div>
              <div class="a-metric-card">
                <small>Offers Viewed by Students</small>
                <strong>42</strong>
                <span class="trend positive">87.5% view rate</span>
              </div>
              <div class="a-metric-card">
                <small>Offers Accepted</small>
                <strong>18</strong>
                <span class="trend positive">37.5% conversion rate</span>
              </div>
              <div class="a-metric-card">
                <small>Average Match Score</small>
                <strong>93.2%</strong>
                <span class="trend positive">High alignment</span>
              </div>
            </div>

            <!-- Simulated Funnel Bar Chart -->
            <div class="content-box chart-box">
              <h3>Admissions Funnel Breakdown</h3>
              <div class="funnel-chart-container">
                <div class="funnel-bar-row">
                  <span class="f-label">Profiles Searched</span>
                  <div class="f-bar-track">
                    <div class="f-bar" style="width: 100%">312</div>
                  </div>
                </div>
                <div class="funnel-bar-row">
                  <span class="f-label">Shortlisted Candidates</span>
                  <div class="f-bar-track">
                    <div class="f-bar" style="width: 45%">142</div>
                  </div>
                </div>
                <div class="funnel-bar-row">
                  <span class="f-label">Formal Offers Sent</span>
                  <div class="f-bar-track">
                    <div class="f-bar" style="width: 25%">48</div>
                  </div>
                </div>
                <div class="funnel-bar-row">
                  <span class="f-label">Offers Accepted</span>
                  <div class="f-bar-track">
                    <div class="f-bar success" style="width: 12%">18</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 6. SETTINGS VIEW -->
          <section *ngIf="activeTab === 'settings'">
            <div class="view-header">
              <div>
                <span class="eyebrow">CONFIGURATION</span>
                <h2>Institutional Settings</h2>
              </div>
            </div>

            <div class="settings-grid">
              <div class="content-box">
                <h3>University Profile</h3>
                <div class="settings-form-group">
                  <label>University Name</label>
                  <input type="text" [(ngModel)]="dataService.profile.universityName" />
                </div>
                <div class="settings-form-group">
                  <label>Official Domain / Website</label>
                  <input type="text" [(ngModel)]="dataService.profile.website" />
                </div>
                <div class="settings-form-group">
                  <label>Contact Email</label>
                  <input type="text" [(ngModel)]="dataService.registration.officialEmail" />
                </div>
                <button class="button primary" (click)="saveSettings()">Save Changes</button>
              </div>

              <div class="content-box">
                <h3>Admissions Officers & Team</h3>
                <div class="team-list">
                  <div class="team-member">
                    <span>👤</span>
                    <div>
                      <strong>{{ dataService.profile.contactPerson }}</strong>
                      <small>Dean of Admissions • Primary Admin</small>
                    </div>
                    <span class="tag-badge">Admin</span>
                  </div>
                  <div class="team-member">
                    <span>👤</span>
                    <div>
                      <strong>Marcus Vance</strong>
                      <small>International Recruitment Officer</small>
                    </div>
                    <span class="tag-badge">Officer</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
      background: #f4f7f8;
    }
    .dash-workspace {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    /* TOP NAVBAR STYLES */
    .dash-top-navbar {
      height: 70px;
      background: #0d2d42;
      color: #fff;
      padding: 0 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .nav-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .nav-portal-tag {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background: rgba(121, 219, 193, 0.15);
      color: #79dbc1;
      padding: 4px 10px;
      border-radius: 99px;
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .nav-notification-wrapper {
      position: relative;
    }
    .nav-icon-btn {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 18px;
      cursor: pointer;
      position: relative;
    }
    .unread-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #e63946;
      color: #fff;
      font-size: 10px;
      font-weight: 900;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: grid;
      place-items: center;
    }
    .notifications-dropdown {
      position: absolute;
      right: 0;
      top: 50px;
      width: 340px;
      background: #fff;
      color: #10212c;
      border-radius: 14px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
      border: 1px solid #dfe6ea;
      overflow: hidden;
      z-index: 100;
    }
    .dropdown-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      border-bottom: 1px solid #dfe6ea;
      background: #f7fafb;
    }
    .dropdown-head button {
      border: none;
      background: none;
      color: #2467e8;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
    }
    .notification-item {
      display: flex;
      gap: 12px;
      padding: 14px 18px;
      border-bottom: 1px solid #f0f4f6;
    }
    .notification-item.unread {
      background: #f4f8fc;
    }
    .n-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-size: 12px;
      font-weight: 900;
    }
    .n-icon.success { background: #ddf7eb; color: #147557; }
    .n-icon.info { background: #eaf5ff; color: #2467e8; }
    .n-icon.alert { background: #fff2d8; color: #906000; }
    .n-content strong { font-size: 13px; display: block; }
    .n-content p { font-size: 12px; color: #637482; margin: 2px 0 4px; }
    .n-content small { font-size: 10px; color: #8b9aa4; }

    .profile-pill-container {
      position: relative;
    }
    .profile-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 14px 6px 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 99px;
      cursor: pointer;
    }
    .profile-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #79dbc1;
      color: #0d2d42;
      display: grid;
      place-items: center;
      font-size: 16px;
    }
    .profile-info {
      display: flex;
      flex-direction: column;
    }
    .uni-name {
      font-size: 13px;
      color: #fff;
    }
    .uni-status {
      font-size: 10px;
      color: #79dbc1;
      font-weight: 700;
    }
    .dropdown-arrow {
      font-size: 9px;
      color: #a8bdc8;
    }
    .profile-dropdown {
      position: absolute;
      right: 0;
      top: 52px;
      width: 240px;
      background: #fff;
      color: #10212c;
      border-radius: 14px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
      border: 1px solid #dfe6ea;
      padding: 8px 0;
      z-index: 100;
    }
    .p-dropdown-header {
      padding: 12px 18px;
      border-bottom: 1px solid #dfe6ea;
    }
    .p-dropdown-header strong { font-size: 14px; display: block; }
    .p-dropdown-header small { font-size: 11px; color: #637482; }
    .profile-dropdown button {
      width: 100%;
      text-align: left;
      padding: 10px 18px;
      border: none;
      background: none;
      font-size: 13px;
      color: #10212c;
      font-weight: 600;
      cursor: pointer;
    }
    .profile-dropdown button:hover {
      background: #f5f8f9;
    }
    .p-dropdown-divider {
      height: 1px;
      background: #dfe6ea;
      margin: 6px 0;
    }
    .logout-btn {
      color: #a1372c !important;
    }

    /* BODY & SIDEBAR STYLES */
    .dash-body {
      display: grid;
      grid-template-columns: 250px 1fr;
      flex: 1;
    }
    .dash-sidebar {
      background: #0d2d42;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      padding: 25px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .sidebar-nav button {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: #a9bfca;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }
    .sidebar-nav button:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #fff;
    }
    .sidebar-nav button.active {
      background: #2467e8;
      color: #fff;
    }
    .nav-icon {
      font-size: 18px;
    }
    .count-pill {
      margin-left: auto;
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 99px;
    }
    .sidebar-footer-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px;
      color: #fff;
    }
    .quota-badge {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #79dbc1;
      margin-bottom: 6px;
    }
    .sidebar-footer-card p {
      font-size: 12px;
      color: #bbced8;
      margin: 0 0 10px;
    }
    .quota-progress-track {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 99px;
      overflow: hidden;
    }
    .quota-progress-bar {
      height: 100%;
      background: #79dbc1;
      border-radius: 99px;
    }

    /* CONTENT AREA STYLES */
    .dash-content {
      padding: 35px 40px;
    }
    .view-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 30px;
    }
    .view-header h2 {
      font-family: "Libre Franklin", sans-serif;
      font-size: 30px;
      letter-spacing: -0.03em;
      margin: 4px 0 0;
    }

    /* DASHBOARD CARDS GRID */
    .dashboard-cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
      margin-bottom: 30px;
    }
    .dash-card {
      background: #fff;
      border: 1px solid #dfe6ea;
      border-radius: 16px;
      padding: 22px;
      box-shadow: 0 10px 25px rgba(16, 33, 44, 0.03);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .card-icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      font-size: 20px;
    }
    .card-icon.blue { background: #eaf5ff; color: #2467e8; }
    .card-icon.green { background: #e4f7f0; color: #14916d; }
    .card-icon.amber { background: #fff2d8; color: #906000; }
    .card-icon.purple { background: #f3ebfc; color: #7b2cbf; }

    .card-tag {
      font-size: 11px;
      font-weight: 800;
      padding: 3px 9px;
      border-radius: 99px;
    }
    .card-tag.active, .card-tag.success { background: #e5f7f0; color: #147254; }
    .card-tag.info { background: #eaf5ff; color: #2467e8; }
    .card-tag.count { background: #f0f4f6; color: #10212c; }

    .dash-card h3 {
      font-size: 13px;
      color: #637482;
      margin: 0 0 6px;
      font-weight: 700;
    }
    .card-main-stat {
      font-size: 22px;
      font-weight: 800;
      color: #10212c;
      display: block;
      margin-bottom: 4px;
    }
    .dash-card p {
      font-size: 12px;
      color: #637482;
      margin: 0 0 14px;
    }
    .card-link {
      border: none;
      background: none;
      color: #2467e8;
      font-size: 12px;
      font-weight: 800;
      padding: 0;
      cursor: pointer;
    }

    /* SPLIT GRID */
    .dash-split-grid {
      display: grid;
      grid-template-columns: 1.3fr 0.7fr;
      gap: 20px;
    }
    .content-box {
      background: #fff;
      border: 1px solid #dfe6ea;
      border-radius: 16px;
      padding: 25px;
    }
    .box-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .box-header h3 { font-size: 17px; margin: 0; }
    .box-header a { font-size: 12px; color: #2467e8; font-weight: 800; cursor: pointer; }

    .mini-candidate-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .mini-c-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px;
      border-radius: 12px;
      background: #f7fafb;
      border: 1px solid #eef3f6;
    }
    .c-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #e0ecef;
    }
    .c-info { flex: 1; }
    .c-info strong { font-size: 14px; display: block; }
    .c-info small { font-size: 12px; color: #637482; display: block; margin: 2px 0; }
    .c-score { font-size: 11px; color: #10212c; font-weight: 700; }
    .c-match { text-align: right; }
    .match-badge {
      display: block;
      font-size: 12px;
      font-weight: 800;
      color: #14916d;
      margin-bottom: 4px;
    }

    .activity-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .activity-list li {
      display: flex;
      gap: 12px;
      font-size: 13px;
      color: #10212c;
    }
    .act-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 5px;
    }
    .act-dot.green { background: #14916d; }
    .act-dot.blue { background: #2467e8; }
    .act-dot.purple { background: #7b2cbf; }
    .act-dot.amber { background: #906000; }
    .activity-list small { display: block; color: #8b9aa4; font-size: 11px; margin-top: 3px; }

    /* MARKETPLACE STYLES */
    .filters-card {
      background: #fff;
      border: 1px solid #dfe6ea;
      border-radius: 14px;
      padding: 18px 22px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .search-input-box {
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid #cad6dd;
      border-radius: 10px;
      padding: 0 16px;
      background: #fff;
    }
    .search-input-box input {
      width: 100%;
      height: 46px;
      border: none;
      outline: none;
      font-size: 14px;
    }
    .filter-controls {
      display: flex;
      gap: 12px;
    }
    .filter-controls select {
      padding: 10px 14px;
      border: 1px solid #cad6dd;
      border-radius: 8px;
      font-size: 13px;
      outline: none;
      background: #fff;
    }

    .candidates-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .candidate-card {
      background: #fff;
      border: 1px solid #dfe6ea;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .c-card-top {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
    }
    .candidate-img {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #e0ecef;
    }
    .c-card-meta { flex: 1; }
    .c-card-meta h3 { font-size: 16px; margin: 0 0 3px; }
    .c-card-meta p { font-size: 12px; color: #637482; margin: 0; }
    .c-card-meta small { font-size: 11px; color: #8b9aa4; }
    .match-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #e4f7f0;
      color: #14916d;
      font-size: 12px;
      font-weight: 900;
      display: grid;
      place-items: center;
    }
    .academic-tag {
      font-size: 13px;
      color: #0d2d42;
      margin-bottom: 8px;
    }
    .scores-row {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #637482;
      margin-bottom: 12px;
    }
    .c-bio {
      font-size: 12px;
      color: #4a5a66;
      line-height: 1.5;
      margin: 0 0 14px;
    }
    .skills-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 20px;
    }
    .chip {
      background: #f0f4f6;
      color: #10212c;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 99px;
    }
    .c-card-footer {
      display: flex;
      gap: 10px;
    }
    .c-card-footer button {
      flex: 1;
      padding: 10px;
      font-size: 12px;
      cursor: pointer;
    }

    /* SHORTLIST TABLE STYLES */
    .shortlist-table {
      display: flex;
      flex-direction: column;
    }
    .table-head, .table-row {
      display: grid;
      grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1.2fr;
      align-items: center;
      gap: 16px;
      padding: 14px 18px;
    }
    .table-head {
      background: #f7fafb;
      font-size: 11px;
      font-weight: 800;
      color: #637482;
      border-radius: 8px;
    }
    .table-row {
      border-bottom: 1px solid #dfe6ea;
    }
    .t-candidate { display: flex; align-items: center; gap: 12px; }
    .t-img { width: 38px; height: 38px; border-radius: 50%; }
    .t-actions { display: flex; gap: 6px; }
    .compact { padding: 6px 12px !important; font-size: 11px !important; }
    .status-tag {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 99px;
    }
    .status-tag.shortlisted { background: #fff2d8; color: #906000; }
    .status-tag.offered { background: #eaf5ff; color: #2467e8; }
    .status-tag.accepted { background: #ddf7eb; color: #147557; }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: #fff;
      border-radius: 16px;
      border: 1px dashed #cad6dd;
    }
    .empty-icon { font-size: 40px; margin-bottom: 12px; }

    /* SUBSCRIPTION PAGE STYLES */
    .sub-overview-card {
      background: #fff;
      border: 1px solid #dfe6ea;
      border-radius: 18px;
      padding: 35px;
    }
    .sub-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
    }
    .sub-badge {
      font-size: 11px;
      font-weight: 800;
      color: #14916d;
      letter-spacing: 0.1em;
    }
    .quota-breakdown-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }
    .q-box {
      background: #f7fafb;
      border: 1px solid #dfe6ea;
      border-radius: 12px;
      padding: 20px;
    }
    .q-box.highlight {
      background: #eaf5ff;
      border-color: #2467e8;
    }
    .q-box small { color: #637482; font-size: 12px; display: block; }
    .q-box strong { font-size: 28px; color: #10212c; display: block; margin: 4px 0; }
    .q-box span { font-size: 12px; color: #637482; }

    .sub-features-list ul {
      list-style: none;
      padding: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .sub-features-list li { font-size: 14px; color: #10212c; font-weight: 600; }

    /* ANALYTICS STYLES */
    .analytics-metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
      margin-bottom: 30px;
    }
    .a-metric-card {
      background: #fff;
      border: 1px solid #dfe6ea;
      border-radius: 14px;
      padding: 20px;
    }
    .a-metric-card small { font-size: 12px; color: #637482; display: block; }
    .a-metric-card strong { font-size: 26px; color: #10212c; display: block; margin: 4px 0; }
    .trend { font-size: 11px; font-weight: 800; }
    .trend.positive { color: #14916d; }

    .chart-box { padding: 30px; }
    .funnel-chart-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 20px;
    }
    .funnel-bar-row {
      display: grid;
      grid-template-columns: 180px 1fr;
      align-items: center;
      gap: 16px;
    }
    .f-label { font-size: 13px; font-weight: 700; color: #10212c; }
    .f-bar-track { height: 32px; background: #f0f4f6; border-radius: 8px; overflow: hidden; }
    .f-bar {
      height: 100%;
      background: #2467e8;
      color: #fff;
      font-size: 12px;
      font-weight: 800;
      display: flex;
      align-items: center;
      padding-left: 14px;
      border-radius: 8px;
    }
    .f-bar.success { background: #14916d; }

    /* SETTINGS STYLES */
    .settings-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .settings-form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
    }
    .settings-form-group label { font-size: 12px; font-weight: 800; }
    .settings-form-group input {
      padding: 10px 14px;
      border: 1px solid #cad6dd;
      border-radius: 8px;
    }
    .team-list { display: flex; flex-direction: column; gap: 12px; }
    .team-member {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f7fafb;
      border-radius: 10px;
    }
    .tag-badge { margin-left: auto; font-size: 11px; font-weight: 800; background: #eaf5ff; color: #2467e8; padding: 3px 8px; border-radius: 99px; }

    @media (max-width: 990px) {
      .dash-body { grid-template-columns: 1fr; }
      .dash-sidebar { display: none; }
      .dashboard-cards-grid, .candidates-grid, .analytics-metrics-grid, .sub-features-list ul, .settings-grid { grid-template-columns: 1fr; }
      .dash-split-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class UniversityDashboardComponent {
  @Output() logout = new EventEmitter<void>();

  activeTab: 'dashboard' | 'marketplace' | 'saved' | 'subscription' | 'analytics' | 'settings' = 'dashboard';
  showNotifications = false;
  showProfileMenu = false;
  showUpgradeModal = false;

  searchQuery = '';
  selectedDegree = '';
  selectedCountry = '';

  constructor(public dataService: UniversityDataService) {}

  get unreadCount(): number {
    return this.dataService.notifications.filter(n => !n.read).length;
  }

  get savedCandidates(): StudentCandidate[] {
    return this.dataService.candidates.filter(c => c.isSaved);
  }

  get savedCandidatesCount(): number {
    return this.savedCandidates.length;
  }

  get filteredCandidates(): StudentCandidate[] {
    return this.dataService.candidates.filter(c => {
      const q = this.searchQuery.toLowerCase();
      const matchesQuery = !q ||
        c.name.toLowerCase().includes(q) ||
        c.fieldOfStudy.toLowerCase().includes(q) ||
        c.skills.some(s => s.toLowerCase().includes(q));
      
      const matchesDegree = !this.selectedDegree || c.targetDegree === this.selectedDegree;
      const matchesCountry = !this.selectedCountry || c.preferredCountry === this.selectedCountry;

      return matchesQuery && matchesDegree && matchesCountry;
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
  }

  markAllRead() {
    this.dataService.notifications.forEach(n => n.read = true);
  }

  sendOffer(candidate: StudentCandidate) {
    this.dataService.sendOffer(candidate.id);
    alert(`Formal admission invitation issued to ${candidate.name}!`);
  }

  saveSettings() {
    this.dataService.saveState();
    alert('Institutional settings updated successfully.');
  }

  exitPortal() {
    this.dataService.currentStep = 1;
    this.dataService.saveState();
    this.logout.emit();
  }
}
