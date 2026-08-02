import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '../../core/auth-api.service';

// ── Mock auth log data ──────────────────────────────────────────────────────
const MOCK_AUTH_LOGS: AuthLogEntry[] = [
  { id: 1, userName: 'Ananya Rajan', role: 'Student', email: 'ananya.rajan@example.com', loginTime: '2026-07-29 09:14:22', logoutTime: '2026-07-29 10:45:10', ip: '103.21.58.14', device: 'macOS 14', browser: 'Chrome 125', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-29 10:44:55' },
  { id: 2, userName: 'Mohammed Salim', role: 'Student', email: 'm.salim@example.com', loginTime: '2026-07-29 08:55:00', logoutTime: '2026-07-29 09:30:00', ip: '49.204.12.77', device: 'Windows 11', browser: 'Edge 124', status: 'Success', failedAttempts: 1, lastActivity: '2026-07-29 09:29:40' },
  { id: 3, userName: 'Oxford Brookes University', role: 'University Officer', email: 'admissions@ob.ac.uk', loginTime: '2026-07-29 07:30:00', logoutTime: '—', ip: '185.86.12.4', device: 'Windows 10', browser: 'Chrome 125', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-29 11:15:20' },
  { id: 4, userName: 'Riya Sharma', role: 'Student', email: 'riya.s@example.com', loginTime: '2026-07-28 22:10:44', logoutTime: '2026-07-28 22:55:00', ip: '106.51.88.92', device: 'iPhone 15', browser: 'Safari 17', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-28 22:54:38' },
  { id: 5, userName: 'Finance Corp Ltd', role: 'Loan Officer', email: 'officer@financecorp.com', loginTime: '2026-07-28 15:20:00', logoutTime: '2026-07-28 16:45:00', ip: '76.234.11.88', device: 'macOS 13', browser: 'Firefox 126', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-28 16:44:00' },
  { id: 6, userName: 'Priya Mehta', role: 'Student', email: 'priya.m@example.com', loginTime: '2026-07-28 13:00:00', logoutTime: '—', ip: '45.113.10.55', device: 'Android 14', browser: 'Chrome Mobile 125', status: 'Failed', failedAttempts: 3, lastActivity: '2026-07-28 13:02:10' },
  { id: 7, userName: 'Global Consultants', role: 'Consultant', email: 'info@globalconsult.com', loginTime: '2026-07-28 11:10:00', logoutTime: '2026-07-28 12:00:00', ip: '92.43.110.7', device: 'Windows 11', browser: 'Edge 124', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-28 11:59:00' },
  { id: 8, userName: 'Unknown User', role: 'Student', email: 'attack@test.com', loginTime: '2026-07-28 03:15:22', logoutTime: '—', ip: '185.220.101.45', device: 'Linux', browser: 'Unknown', status: 'Locked', failedAttempts: 7, lastActivity: '2026-07-28 03:16:00' },
  { id: 9, userName: 'Lucia Patel', role: 'Student', email: 'lucia.p@example.com', loginTime: '2026-07-27 18:30:00', logoutTime: '2026-07-27 19:10:00', ip: '117.98.32.11', device: 'macOS 14', browser: 'Safari 17', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-27 19:09:44' },
  { id: 10, userName: 'Cambridge Institute', role: 'University Officer', email: 'admissions@cambridge-inst.edu', loginTime: '2026-07-27 14:22:00', logoutTime: '2026-07-27 16:00:00', ip: '213.78.44.90', device: 'Windows 10', browser: 'Chrome 124', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-27 15:58:00' },
  { id: 11, userName: 'Rahul Verma', role: 'Student', email: 'rahul.v@example.com', loginTime: '2026-07-27 10:05:00', logoutTime: '2026-07-27 10:45:00', ip: '103.59.78.22', device: 'Windows 11', browser: 'Chrome 125', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-27 10:44:00' },
  { id: 12, userName: 'StudyPro Advisors', role: 'Consultant', email: 'admin@studypro.com', loginTime: '2026-07-27 09:00:00', logoutTime: '2026-07-27 12:30:00', ip: '41.77.55.88', device: 'macOS 13', browser: 'Firefox 126', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-27 12:28:00' },
  { id: 13, userName: 'EduBank Global', role: 'Loan Officer', email: 'loans@edubank.com', loginTime: '2026-07-26 16:10:00', logoutTime: '2026-07-26 17:00:00', ip: '62.210.88.14', device: 'Windows 10', browser: 'Edge 123', status: 'Failed', failedAttempts: 2, lastActivity: '2026-07-26 16:12:00' },
  { id: 14, userName: 'Shreya Nair', role: 'Student', email: 'shreya.n@example.com', loginTime: '2026-07-26 14:20:00', logoutTime: '2026-07-26 15:10:00', ip: '122.166.44.3', device: 'iPhone 14', browser: 'Safari 16', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-26 15:09:00' },
  { id: 15, userName: 'Imperial College Admin', role: 'University Officer', email: 'intl@imperial.ac.uk', loginTime: '2026-07-26 08:45:00', logoutTime: '2026-07-26 10:30:00', ip: '129.31.0.5', device: 'macOS 14', browser: 'Chrome 125', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-26 10:29:00' },
  { id: 16, userName: 'Aarav Joshi', role: 'Student', email: 'aarav.j@example.com', loginTime: '2026-07-25 21:00:00', logoutTime: '2026-07-25 21:40:00', ip: '49.206.55.77', device: 'Android 13', browser: 'Chrome Mobile 124', status: 'Success', failedAttempts: 1, lastActivity: '2026-07-25 21:39:00' },
  { id: 17, userName: 'Visa Assist Co.', role: 'Consultant', email: 'help@visaassist.com', loginTime: '2026-07-25 11:30:00', logoutTime: '2026-07-25 12:15:00', ip: '77.111.246.4', device: 'Windows 11', browser: 'Chrome 125', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-25 12:14:00' },
  { id: 18, userName: 'Unknown', role: 'Student', email: 'bot@test.invalid', loginTime: '2026-07-25 04:02:11', logoutTime: '—', ip: '178.17.165.33', device: 'Linux', browser: 'Python Requests', status: 'Locked', failedAttempts: 10, lastActivity: '2026-07-25 04:02:30' },
  { id: 19, userName: 'Kavya Reddy', role: 'Student', email: 'kavya.r@example.com', loginTime: '2026-07-24 16:40:00', logoutTime: '2026-07-24 17:20:00', ip: '110.227.88.14', device: 'macOS 13', browser: 'Safari 17', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-24 17:19:00' },
  { id: 20, userName: 'FinanceEdge Ltd', role: 'Loan Officer', email: 'officer@financeedge.com', loginTime: '2026-07-24 10:00:00', logoutTime: '2026-07-24 11:30:00', ip: '81.88.12.4', device: 'Windows 10', browser: 'Edge 124', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-24 11:28:00' },
  { id: 21, userName: 'Nikhil Bose', role: 'Student', email: 'nikhil.b@example.com', loginTime: '2026-07-23 20:15:00', logoutTime: '2026-07-23 21:00:00', ip: '103.101.44.9', device: 'Windows 11', browser: 'Firefox 126', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-23 20:59:00' },
  { id: 22, userName: 'Leeds Beckett Uni', role: 'University Officer', email: 'intl@leedsbeckett.ac.uk', loginTime: '2026-07-23 09:30:00', logoutTime: '2026-07-23 11:00:00', ip: '161.74.44.20', device: 'macOS 12', browser: 'Chrome 123', status: 'Failed', failedAttempts: 1, lastActivity: '2026-07-23 09:32:00' },
  { id: 23, userName: 'Asha Iyer', role: 'Student', email: 'asha.i@example.com', loginTime: '2026-07-22 15:30:00', logoutTime: '2026-07-22 16:10:00', ip: '117.200.33.77', device: 'iPhone 13', browser: 'Safari 16', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-22 16:09:00' },
  { id: 24, userName: 'PathFinders Consult', role: 'Consultant', email: 'info@pathfinders.com', loginTime: '2026-07-22 08:00:00', logoutTime: '2026-07-22 09:30:00', ip: '84.20.33.7', device: 'Windows 10', browser: 'Chrome 125', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-22 09:28:00' },
  { id: 25, userName: 'Rohan Gupta', role: 'Student', email: 'rohan.g@example.com', loginTime: '2026-07-21 19:00:00', logoutTime: '2026-07-21 19:45:00', ip: '59.88.114.25', device: 'Android 14', browser: 'Chrome Mobile 125', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-21 19:44:00' },
  { id: 26, userName: 'Aisha Chowdhury', role: 'Student', email: 'aisha.c@example.com', loginTime: '2026-07-21 12:20:00', logoutTime: '2026-07-21 13:00:00', ip: '103.21.44.88', device: 'Windows 11', browser: 'Edge 124', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-21 12:58:00' },
  { id: 27, userName: 'GlobalLend Finance', role: 'Loan Officer', email: 'admin@globallend.com', loginTime: '2026-07-20 10:15:00', logoutTime: '2026-07-20 11:45:00', ip: '77.66.14.3', device: 'macOS 13', browser: 'Chrome 124', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-20 11:44:00' },
  { id: 28, userName: 'Unknown', role: 'University Officer', email: 'probe@bot.invalid', loginTime: '2026-07-20 02:30:18', logoutTime: '—', ip: '195.144.107.198', device: 'Linux', browser: 'curl/7.88', status: 'Locked', failedAttempts: 8, lastActivity: '2026-07-20 02:30:40' },
  { id: 29, userName: 'Deepika Rao', role: 'Student', email: 'deepika.r@example.com', loginTime: '2026-07-19 17:45:00', logoutTime: '2026-07-19 18:30:00', ip: '122.167.88.5', device: 'iPhone 15 Pro', browser: 'Safari 17', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-19 18:29:00' },
  { id: 30, userName: 'Sussex International', role: 'University Officer', email: 'intl@sussex.ac.uk', loginTime: '2026-07-19 09:00:00', logoutTime: '2026-07-19 10:30:00', ip: '139.184.0.20', device: 'Windows 10', browser: 'Chrome 125', status: 'Success', failedAttempts: 0, lastActivity: '2026-07-19 10:28:00' },
];

interface AuthLogEntry {
  id: number; userName: string; role: string; email: string;
  loginTime: string; logoutTime: string; ip: string;
  device: string; browser: string; status: 'Success'|'Failed'|'Locked';
  failedAttempts: number; lastActivity: string;
}

@Component({
  selector:'app-admin-page', standalone:true, imports:[CommonModule,FormsModule,RouterLink],
  styles:[`
    :host{--navy:#0d2d42;--green:#087a50;--muted:#6b7b73;--line:#dce5e0;display:block;min-height:100vh;background:#f3f6f4;color:#17221c;font-family:"DM Sans",sans-serif}.admin-shell{min-height:100vh}.topbar{height:72px;padding:0 clamp(20px,4vw,58px);display:flex;align-items:center;border-bottom:1px solid var(--line);background:#fff}.brand{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:900}.brand span{width:32px;height:32px;display:grid;place-items:center;border-radius:9px;background:var(--navy);color:#6ad1b4}.topbar>small{margin-left:18px;padding-left:18px;border-left:1px solid var(--line);color:var(--muted)}.topbar button{margin-left:auto;border:0;background:transparent;font-weight:800;color:#65736c;cursor:pointer}
    .admin-login{width:min(520px,calc(100% - 40px));margin:10vh auto;padding:38px;background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:0 25px 70px #17332312}.admin-login h1{font-size:34px;margin:8px 0}.admin-login p{color:var(--muted)}label{display:flex;flex-direction:column;gap:7px;font-size:12px;font-weight:800}input,textarea{border:1px solid #cbd8d1;border-radius:9px;padding:12px;font:inherit}.primary,.secondary,.danger{border-radius:8px;padding:10px 14px;font-weight:900;cursor:pointer}.primary{border:1px solid var(--green);background:var(--green);color:#fff}.secondary{border:1px solid #cbd8d1;background:#fff}.danger{border:1px solid #dfb4ae;background:#fff2f0;color:#a33d31}.wide{width:100%;margin-top:18px}
    .admin-main{max-width:1480px;margin:auto;padding:34px 28px 70px}.page-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:25px}.page-head h1{font-size:40px;letter-spacing:-.04em;margin:5px 0}.page-head p{color:var(--muted);margin:0}.page-tabs{display:flex;gap:6px}.page-tabs button,.filters button{border:0;border-radius:8px;background:transparent;padding:9px 12px;font-weight:800;color:#6d7972;cursor:pointer}.page-tabs button.active,.filters button.active{background:var(--navy);color:#fff}
    .metrics{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:22px}.metric{padding:18px;background:#fff;border:1px solid var(--line);border-radius:12px}.metric small,.metric strong{display:block}.metric small{color:var(--muted);font-size:10px}.metric strong{font-size:26px;margin-top:5px}.metric.pending strong{color:#b47312}.metric.approved strong{color:var(--green)}.filters{display:flex;align-items:center;gap:5px;padding:12px;background:#fff;border:1px solid var(--line);border-radius:11px;margin-bottom:14px}.filters .separator{width:1px;height:25px;background:var(--line);margin:0 8px}.filters .refresh{margin-left:auto;color:var(--green)}
    .queue-layout{display:grid;grid-template-columns:minmax(0,1fr) 410px;gap:16px}.queue{display:grid;gap:10px}.request{width:100%;display:grid;grid-template-columns:52px 1fr auto;gap:14px;align-items:center;padding:18px;border:1px solid var(--line);border-radius:12px;background:#fff;text-align:left;cursor:pointer}.request.selected{border-color:#7db99d;box-shadow:0 0 0 2px #dff1e7}.org-icon{width:48px;height:48px;display:grid;place-items:center;border-radius:11px;background:#e8f5ef;color:var(--green);font-weight:900}.request small,.request strong,.request span{display:block}.request small{font-size:9px;color:var(--green);font-weight:900}.request strong{font-size:15px;margin:3px 0}.request span{font-size:10px;color:var(--muted)}.status{padding:6px 9px!important;border-radius:99px;background:#fff0d9;color:#93600f!important;font-size:9px!important;font-weight:900}.status.approved{background:#e5f5ed;color:var(--green)!important}.status.rejected{background:#ffebe8;color:#a43b2e!important}
    .detail{position:sticky;top:20px;align-self:start;padding:23px;background:#fff;border:1px solid var(--line);border-radius:13px}.detail-head{display:flex;gap:12px;align-items:center;padding-bottom:18px;border-bottom:1px solid var(--line)}.detail-head h2{font-size:19px;margin:3px 0}.detail-head p{font-size:11px;color:var(--muted);margin:0}.detail dl{display:grid;gap:0;margin:15px 0}.detail dl div{display:flex;justify-content:space-between;gap:15px;padding:11px 0;border-bottom:1px solid #edf1ef}.detail dt{font-size:10px;color:var(--muted)}.detail dd{font-size:11px;font-weight:800;text-align:right;margin:0;overflow-wrap:anywhere}.evidence{padding:13px;border-radius:9px;background:#f3f7f5}.evidence strong{font-size:11px}.evidence p{font-size:10px;color:var(--muted);margin:5px 0 0}.review-actions{display:grid;grid-template-columns:1fr 1.3fr;gap:8px;margin-top:17px}.review-form{margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}.review-form textarea{width:100%;min-height:90px;margin-top:7px}.review-form footer{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}.message{padding:11px;border-radius:8px;margin:10px 0}.error{background:#fff0ee;color:#a33d31}.empty{padding:60px;text-align:center;background:#fff;border:1px dashed #cbd7d0;border-radius:12px;color:var(--muted)}
    .audit-table{background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden}.audit-row{display:grid;grid-template-columns:180px 190px 1fr 160px;gap:14px;padding:15px 18px;border-bottom:1px solid var(--line);align-items:center;font-size:11px}.audit-row.header{background:#edf3f0;font-size:9px;color:var(--muted);font-weight:900}.audit-row b{color:var(--green)}.audit-row small{color:var(--muted)}

    /* ── Dashboard overview ── */
    .dash-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
    .dash-card{padding:20px 22px;background:#fff;border:1px solid var(--line);border-radius:13px}
    .dash-card>header{margin-bottom:14px}.dash-card>header h2{margin:0;font-size:16px}.dash-card>header small{color:var(--muted);font-size:10px}
    .health-row,.tier-row{display:grid;grid-template-columns:130px 1fr 70px;align-items:center;gap:10px;padding:8px 0}
    .health-row span,.tier-row span{font-size:11px;color:#3d4b44}
    .health-row i,.tier-row i{display:block;height:6px;border-radius:5px;background:#edf2ef;overflow:hidden}
    .health-row i b,.tier-row i b{display:block;height:100%;background:var(--green);border-radius:5px}
    .health-row strong,.tier-row strong{font-size:11px;text-align:right}
    .dash-card-footer{display:flex;gap:18px;margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}
    .dash-card-footer span{font-size:10px;color:var(--muted)}.dash-card-footer b{color:var(--green);font-size:13px;display:block;margin-bottom:2px}
    .feed-row{display:flex;align-items:center;gap:11px;padding:10px 0;border-bottom:1px solid #f1f5f2}.feed-row:last-of-type{border-bottom:0}
    .feed-row div{flex:1;min-width:0}.feed-row strong{display:block;font-size:11px}.feed-row small{display:block;margin-top:2px;color:var(--muted);font-size:9px}
    .feed-row .org-icon{width:32px;height:32px;font-size:12px}.feed-row .org-icon.warn{background:#fff0d9;color:#93600f}
    .feed-row .status{font-style:normal;padding:4px 8px;border-radius:99px;background:#fff0d9;color:#93600f;font-size:9px;font-weight:900;white-space:nowrap}.feed-row .status.approved{background:#e5f5ed;color:var(--green)}
    .dash-link{margin-top:12px;border:0;background:transparent;color:var(--green);font-weight:800;font-size:11px;cursor:pointer;padding:0}
    .quick-links-row{display:flex;gap:10px;flex-wrap:wrap}.quick-links-row button{border:1px solid var(--line);background:#fbfcfb;border-radius:9px;padding:11px 16px;font-weight:800;font-size:11px;color:#2c3a33;cursor:pointer}.quick-links-row button:hover{border-color:#7db99d;color:var(--green)}

    /* ── Auth Logs styles ── */
    .auth-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
    .auth-search{flex:1;min-width:200px;height:40px;border:1px solid var(--line);border-radius:9px;padding:0 14px;font:inherit;background:#fff;font-size:13px}
    .auth-search:focus{outline:none;border-color:#7db99d;box-shadow:0 0 0 2px #dff1e7}
    .auth-select{height:40px;border:1px solid var(--line);border-radius:9px;padding:0 12px;font:inherit;background:#fff;font-size:13px;cursor:pointer}
    .auth-export{height:40px;padding:0 18px;border-radius:9px;border:1px solid var(--green);background:#fff;color:var(--green);font-weight:800;font-size:13px;cursor:pointer;transition:background .15s,color .15s}
    .auth-export:hover{background:var(--green);color:#fff}
    .auth-export.exported{background:#e5f5ed;color:var(--green);border-color:var(--green)}
    .auth-table-wrap{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden}
    .auth-table{width:100%;border-collapse:collapse;font-size:12px}
    .auth-table th{padding:12px 14px;background:#edf3f0;font-size:10px;font-weight:900;color:var(--muted);text-align:left;white-space:nowrap;cursor:pointer;user-select:none;border-bottom:1px solid var(--line)}
    .auth-table th:hover{background:#e0ede7}
    .auth-table th .sort-icon{margin-left:4px;opacity:.4}
    .auth-table th.sorted .sort-icon{opacity:1;color:var(--green)}
    .auth-table td{padding:12px 14px;border-bottom:1px solid #f1f5f2;vertical-align:middle}
    .auth-table tr:last-child td{border-bottom:0}
    .auth-table tr:hover td{background:#f8faf8}
    .auth-status{display:inline-block;padding:4px 10px;border-radius:99px;font-size:10px;font-weight:900}
    .auth-status.success{background:#e5f5ed;color:var(--green)}
    .auth-status.failed{background:#fff0d9;color:#93600f}
    .auth-status.locked{background:#ffebe8;color:#a43b2e}
    .auth-role{display:inline-block;padding:3px 9px;border-radius:6px;font-size:10px;font-weight:700;background:#edf3f0;color:#3a5a48}
    .auth-ip{font-family:monospace;font-size:11px;color:var(--muted)}
    .auth-fail-badge{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;font-size:10px;font-weight:900}
    .auth-fail-badge.none{background:#f0f5f2;color:#8a9e94}
    .auth-fail-badge.some{background:#fff3d9;color:#93600f}
    .auth-fail-badge.many{background:#ffebe8;color:#a43b2e}
    .auth-pagination{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-top:1px solid var(--line);background:#fff}
    .auth-pagination-info{font-size:12px;color:var(--muted)}
    .auth-page-btns{display:flex;gap:6px}
    .auth-page-btn{width:32px;height:32px;border:1px solid var(--line);border-radius:7px;background:#fff;font-size:12px;font-weight:800;color:#5a6d76;cursor:pointer;display:grid;place-items:center;transition:all .15s}
    .auth-page-btn:hover{background:#edf3f0;border-color:#7db99d}
    .auth-page-btn.active{background:var(--navy);color:#fff;border-color:var(--navy)}
    .auth-page-btn:disabled{opacity:.35;cursor:not-allowed}
    .auth-toast{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:8px;background:#e5f5ed;color:var(--green);font-size:12px;font-weight:800;margin-left:auto}

    @media(max-width:1000px){.metrics{grid-template-columns:repeat(3,1fr)}.queue-layout{grid-template-columns:1fr}.detail{position:static}.dash-grid{grid-template-columns:1fr}}
    @media(max-width:650px){.metrics{grid-template-columns:1fr 1fr}.page-head{align-items:flex-start;flex-direction:column;gap:15px}.filters{overflow:auto}.queue-layout{display:block}.request{grid-template-columns:45px 1fr}.request>.status{grid-column:2}.audit-row{grid-template-columns:1fr}.audit-row.header{display:none}.auth-table th:nth-child(n+6){display:none}.auth-table td:nth-child(n+6){display:none}.health-row,.tier-row{grid-template-columns:100px 1fr 55px}}
  `],
  template:`
    <main class="admin-shell">
      <header class="topbar">
        <a class="brand" routerLink="/"><span>S</span>SuperOffer</a>
        <small>Platform administration</small>
        <button *ngIf="authenticated" (click)="signOut()">Sign out</button>
      </header>

      <section class="admin-login" *ngIf="!authenticated">
        <span class="eyebrow">RESTRICTED ACCESS</span>
        <h1>Super Admin panel</h1>
        <p>Connect using the protected approval key configured for platform operations.</p>
        <form (ngSubmit)="connect()">
          <label>Admin approval key<input type="password" name="key" [(ngModel)]="adminKey" required></label>
          <p class="message error" *ngIf="error">{{error}}</p>
          <button class="primary wide" [disabled]="loading">{{loading?'Connecting…':'Open verification queue'}}</button>
        </form>
      </section>

      <section class="admin-main" *ngIf="authenticated">
        <header class="page-head">
          <div>
            <span class="eyebrow">TRUST &amp; VERIFICATION</span>
            <h1>Institution registrations</h1>
            <p>Review universities, education lenders, and consultancies before unlocking login.</p>
          </div>
          <nav class="page-tabs">
            <button [class.active]="view==='dashboard'" (click)="view='dashboard'">Dashboard</button>
            <button [class.active]="view==='queue'" (click)="view='queue'">Verification queue</button>
            <button [class.active]="view==='audit'" (click)="openAudit()">Audit log</button>
            <button [class.active]="view==='auth-logs'" (click)="view='auth-logs'">Auth logs</button>
          </nav>
        </header>

        <!-- DASHBOARD -->
        <ng-container *ngIf="view==='dashboard'">
          <section class="metrics">
            <article class="metric"><small>Total students</small><strong>{{platformStats.students|number}}</strong></article>
            <article class="metric"><small>Verified universities</small><strong>{{platformStats.universities}}</strong></article>
            <article class="metric"><small>Verified banks</small><strong>{{platformStats.banks}}</strong></article>
            <article class="metric"><small>Verified consultancies</small><strong>{{platformStats.consultancies}}</strong></article>
            <article class="metric pending"><small>Pending verifications</small><strong>{{platformStats.pendingVerifications}}</strong></article>
            <article class="metric approved"><small>Monthly revenue</small><strong>{{platformStats.monthlyRevenue}}</strong></article>
          </section>

          <div class="dash-grid">
            <section class="dash-card">
              <header><h2>Platform health</h2><small>Active users by role · this cycle</small></header>
              <div class="health-row" *ngFor="let row of roleBreakdown">
                <span>{{row.label}}</span>
                <i><b [style.width.%]="row.percent"></b></i>
                <strong>{{row.count|number}}</strong>
              </div>
              <footer class="dash-card-footer">
                <span><b>{{platformStats.invitationVolume|number}}</b> invitations this cycle</span>
                <span><b>{{platformStats.acceptanceRate}}%</b> acceptance rate</span>
              </footer>
            </section>

            <section class="dash-card">
              <header><h2>Subscription overview</h2><small>Revenue &amp; tier distribution</small></header>
              <div class="tier-row" *ngFor="let tier of subscriptionOverview.tiers">
                <span>{{tier.name}}</span>
                <i><b [style.width.%]="tier.percent"></b></i>
                <strong>{{tier.orgs}} orgs</strong>
              </div>
              <footer class="dash-card-footer">
                <span><b>{{subscriptionOverview.revenue}}</b> this cycle</span>
                <span><b>{{subscriptionOverview.upcomingRenewals}}</b> renewals due in 7 days</span>
              </footer>
            </section>
          </div>

          <div class="dash-grid">
            <section class="dash-card">
              <header><h2>Recent verification submissions</h2><small>Latest organisation sign-ups</small></header>
              <div class="feed-row" *ngFor="let item of recentSubmissions">
                <span class="org-icon">{{item.initial}}</span>
                <div><strong>{{item.name}}</strong><small>{{item.type}} · submitted {{item.when}}</small></div>
                <em class="status" [class.approved]="item.status==='Verified'">{{item.status}}</em>
              </div>
              <button class="dash-link" (click)="view='queue'">Open verification queue →</button>
            </section>

            <section class="dash-card">
              <header><h2>Support &amp; moderation queue</h2><small>Flagged items awaiting review</small></header>
              <div class="feed-row" *ngFor="let item of moderationQueue">
                <span class="org-icon warn">!</span>
                <div><strong>{{item.title}}</strong><small>{{item.detail}}</small></div>
                <em class="status">{{item.age}}</em>
              </div>
              <button class="dash-link" (click)="view='audit'">Open audit log →</button>
            </section>
          </div>

          <section class="dash-card quick-links">
            <header><h2>Quick actions</h2></header>
            <div class="quick-links-row">
              <button (click)="view='queue'">Review verification queue</button>
              <button (click)="openAudit()">View audit log</button>
              <button (click)="view='auth-logs'">View auth logs</button>
            </div>
          </section>
        </ng-container>

        <!-- VERIFICATION QUEUE -->
        <ng-container *ngIf="view==='queue'">
          <section class="metrics">
            <article class="metric pending"><small>Pending review</small><strong>{{summary.pending||0}}</strong></article>
            <article class="metric approved"><small>Approved</small><strong>{{summary.approved||0}}</strong></article>
            <article class="metric"><small>Rejected</small><strong>{{summary.rejected||0}}</strong></article>
            <article class="metric"><small>Universities waiting</small><strong>{{summary.universities||0}}</strong></article>
            <article class="metric"><small>Banks waiting</small><strong>{{summary.banks||0}}</strong></article>
            <article class="metric"><small>Consultancies waiting</small><strong>{{summary.consultancies||0}}</strong></article>
          </section>
          <nav class="filters">
            <button *ngFor="let item of statuses" [class.active]="status===item" (click)="setStatus(item)">{{item}}</button>
            <span class="separator"></span>
            <button *ngFor="let item of types" [class.active]="orgType===item.value" (click)="setType(item.value)">{{item.label}}</button>
            <button class="refresh" (click)="load()">↻ Refresh</button>
          </nav>
          <p class="message error" *ngIf="error">{{error}}</p>
          <div class="queue-layout">
            <section class="queue">
              <div class="empty" *ngIf="!loading&&!registrations.length">No matching registration requests.</div>
              <button class="request" *ngFor="let item of registrations" [class.selected]="selected?.user_id===item.user_id" (click)="selected=item;decision=''">
                <span class="org-icon">{{orgInitial(item)}}</span>
                <div><small>{{roleLabel(item.role)}}</small><strong>{{item.organization?.name||item.full_name}}</strong><span>{{item.full_name}} · {{item.email}} · Submitted {{item.submitted_at|date:'mediumDate'}}</span></div>
                <span class="status" [class.approved]="item.approval_status==='APPROVED'" [class.rejected]="item.approval_status==='REJECTED'">{{item.approval_status}}</span>
              </button>
            </section>
            <aside class="detail" *ngIf="selected">
              <header class="detail-head">
                <span class="org-icon">{{orgInitial(selected)}}</span>
                <div><small>{{roleLabel(selected.role)}}</small><h2>{{selected.organization?.name}}</h2><p>{{selected.full_name}} · {{selected.email}}</p></div>
              </header>
              <dl>
                <div><dt>Organisation type</dt><dd>{{selected.organization?.organizationType||roleLabel(selected.role)}}</dd></div>
                <div><dt>Registration number</dt><dd>{{selected.organization?.registrationNumber||'Not provided'}}</dd></div>
                <div><dt>Accreditation / licence</dt><dd>{{selected.organization?.licenseReference||'Not provided'}}</dd></div>
                <div><dt>Website</dt><dd>{{selected.organization?.website||'Not provided'}}</dd></div>
                <div><dt>Location</dt><dd>{{location(selected)}}</dd></div>
                <div><dt>Phone</dt><dd>{{selected.phone||'Not provided'}}</dd></div>
                <div><dt>Submitted</dt><dd>{{selected.submitted_at|date:'medium'}}</dd></div>
              </dl>
              <section class="evidence"><strong>Verification evidence</strong><p>Confirm registration and accreditation/licence references against the appropriate official authority before approval.</p></section>
              <ng-container *ngIf="selected.approval_status==='PENDING'">
                <div class="review-actions">
                  <button class="danger" (click)="decision='reject'">Reject</button>
                  <button class="primary" (click)="decision='approve'">Approve &amp; unlock login</button>
                </div>
                <form class="review-form" *ngIf="decision" (ngSubmit)="submitReview()">
                  <label>{{decision==='reject'?'Rejection reason (required)':'Internal approval note (optional)'}}<textarea name="reason" [(ngModel)]="reviewReason" [required]="decision==='reject'"></textarea></label>
                  <footer>
                    <button type="button" class="secondary" (click)="decision=''">Cancel</button>
                    <button [class]="decision==='reject'?'danger':'primary'" [disabled]="reviewing||decision==='reject'&&!reviewReason.trim()">{{reviewing?'Saving…':decision==='reject'?'Confirm rejection':'Confirm approval'}}</button>
                  </footer>
                </form>
              </ng-container>
              <p class="message" *ngIf="selected.approval_status!=='PENDING'">Reviewed {{selected.reviewed_at|date:'medium'}}<br>{{selected.rejection_reason||'Organisation approved and login unlocked.'}}</p>
            </aside>
          </div>
        </ng-container>

        <!-- AUDIT LOG -->
        <section class="audit-table" *ngIf="view==='audit'">
          <div class="audit-row header"><span>Occurred</span><span>Action</span><span>Organisation</span><span>Actor</span></div>
          <div class="audit-row" *ngFor="let entry of auditEntries">
            <small>{{entry.occurredAt|date:'medium'}}</small>
            <b>{{entry.action}}</b>
            <span>{{entry.organizationName||entry.entityId}}<small *ngIf="entry.reason"> · {{entry.reason}}</small></span>
            <span>{{entry.actorUserId}}</span>
          </div>
          <div class="empty" *ngIf="!auditEntries.length">No verification actions recorded yet.</div>
        </section>

        <!-- AUTH LOGS -->
        <ng-container *ngIf="view==='auth-logs'">
          <div class="auth-toolbar">
            <input class="auth-search" type="search" placeholder="Search by name, email or IP address…"
              [(ngModel)]="authSearch" (ngModelChange)="authPage=1">

            <select class="auth-select" [(ngModel)]="authRoleFilter" (ngModelChange)="authPage=1">
              <option value="">All roles</option>
              <option value="Student">Student</option>
              <option value="University Officer">University Officer</option>
              <option value="Loan Officer">Loan Officer</option>
              <option value="Consultant">Consultant</option>
            </select>

            <select class="auth-select" [(ngModel)]="authStatusFilter" (ngModelChange)="authPage=1">
              <option value="">All statuses</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Locked">Locked</option>
            </select>

            <button class="auth-export" [class.exported]="exported" (click)="exportLogs()">
              {{ exported ? '✓ Exported' : '↓ Export CSV' }}
            </button>
          </div>

          <div class="auth-table-wrap">
            <table class="auth-table">
              <thead>
                <tr>
                  <th (click)="sortAuth('userName')" [class.sorted]="authSortCol==='userName'">Name <span class="sort-icon">{{ authSortDir==='asc'&&authSortCol==='userName' ? '▲' : '▼' }}</span></th>
                  <th (click)="sortAuth('role')" [class.sorted]="authSortCol==='role'">Role <span class="sort-icon">{{ authSortDir==='asc'&&authSortCol==='role' ? '▲' : '▼' }}</span></th>
                  <th (click)="sortAuth('email')" [class.sorted]="authSortCol==='email'">Email <span class="sort-icon">▼</span></th>
                  <th (click)="sortAuth('loginTime')" [class.sorted]="authSortCol==='loginTime'">Login time <span class="sort-icon">{{ authSortDir==='asc'&&authSortCol==='loginTime' ? '▲' : '▼' }}</span></th>
                  <th>Logout time</th>
                  <th>IP address</th>
                  <th>Device / Browser</th>
                  <th (click)="sortAuth('status')" [class.sorted]="authSortCol==='status'">Status <span class="sort-icon">▼</span></th>
                  <th (click)="sortAuth('failedAttempts')" [class.sorted]="authSortCol==='failedAttempts'">Fails <span class="sort-icon">▼</span></th>
                  <th>Last activity</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of pagedAuthLogs">
                  <td><strong style="font-size:12px">{{ row.userName }}</strong></td>
                  <td><span class="auth-role">{{ row.role }}</span></td>
                  <td style="color:#5a6d76;font-size:11px">{{ row.email }}</td>
                  <td style="font-size:11px">{{ row.loginTime }}</td>
                  <td style="font-size:11px;color:#8a9e94">{{ row.logoutTime }}</td>
                  <td><span class="auth-ip">{{ row.ip }}</span></td>
                  <td style="font-size:11px;color:#5a6d76">{{ row.device }}<br><span style="color:#8a9e94">{{ row.browser }}</span></td>
                  <td>
                    <span class="auth-status" [class.success]="row.status==='Success'" [class.failed]="row.status==='Failed'" [class.locked]="row.status==='Locked'">
                      {{ row.status }}
                    </span>
                  </td>
                  <td>
                    <span class="auth-fail-badge" [class.none]="row.failedAttempts===0" [class.some]="row.failedAttempts>0&&row.failedAttempts<5" [class.many]="row.failedAttempts>=5">
                      {{ row.failedAttempts }}
                    </span>
                  </td>
                  <td style="font-size:11px;color:#8a9e94">{{ row.lastActivity }}</td>
                </tr>
                <tr *ngIf="filteredAuthLogs.length===0">
                  <td colspan="10" style="text-align:center;padding:40px;color:#8a9e94">No records match your search criteria.</td>
                </tr>
              </tbody>
            </table>

            <div class="auth-pagination">
              <span class="auth-pagination-info">
                Showing {{ authPageStart }}–{{ authPageEnd }} of {{ filteredAuthLogs.length }} records
              </span>
              <div class="auth-page-btns">
                <button class="auth-page-btn" [disabled]="authPage===1" (click)="authPage=authPage-1">‹</button>
                <button class="auth-page-btn" *ngFor="let p of authPageNums" [class.active]="authPage===p" (click)="authPage=p">{{ p }}</button>
                <button class="auth-page-btn" [disabled]="authPage===authTotalPages" (click)="authPage=authPage+1">›</button>
              </div>
            </div>
          </div>
        </ng-container>

      </section>
    </main>
  `
})
export class AdminPageComponent implements OnInit, OnDestroy {
  private refreshTimer?: number;

  // Existing state
  adminKey=''; authenticated=false; loading=false; error=''; reviewing=false;
  view: 'dashboard'|'queue'|'audit'|'auth-logs' = 'dashboard';
  status='PENDING'; orgType='ALL'; registrations:any[]=[];
  selected:any=null; summary:any={}; decision:''|'approve'|'reject'='';
  reviewReason=''; auditEntries:any[]=[];
  statuses=['PENDING','APPROVED','REJECTED','ALL'];
  types=[{label:'All organisations',value:'ALL'},{label:'Universities',value:'UNIVERSITY'},{label:'Banks',value:'BANK'},{label:'Consultancies',value:'CONSULTANCY'}];

  // Dashboard overview (mock — platform-wide summary, independent of live registration data)
  platformStats={students:2480,universities:86,banks:24,consultancies:41,pendingVerifications:7,monthlyRevenue:'₹18.4L',invitationVolume:1240,acceptanceRate:23};
  roleBreakdown=[
    {label:'Students',count:2480,percent:100},
    {label:'University officers',count:186,percent:38},
    {label:'Loan officers',count:64,percent:20},
    {label:'Consultants',count:97,percent:26}
  ];
  subscriptionOverview={
    revenue:'₹18.4L',
    upcomingRenewals:9,
    tiers:[
      {name:'Basic',orgs:64,percent:43},
      {name:'Professional',orgs:52,percent:35},
      {name:'Enterprise',orgs:35,percent:24}
    ]
  };
  recentSubmissions=[
    {initial:'O',name:'Oxford Brookes University',type:'University',when:'2 hours ago',status:'Pending'},
    {initial:'F',name:'Finance Corp Ltd',type:'Education lender',when:'6 hours ago',status:'Verified'},
    {initial:'G',name:'Global Consultants',type:'Consultancy',when:'Yesterday',status:'Pending'},
    {initial:'C',name:'Cambridge Institute',type:'University',when:'2 days ago',status:'Verified'}
  ];
  moderationQueue=[
    {title:'Profile flagged for review',detail:'Reported by University officer · possible duplicate documents',age:'3h ago'},
    {title:'Disputed invitation',detail:'Student contests withdrawal of an accepted offer',age:'1d ago'}
  ];

  // Auth logs state
  authSearch = '';
  authRoleFilter = '';
  authStatusFilter = '';
  authSortCol: keyof AuthLogEntry = 'loginTime';
  authSortDir: 'asc'|'desc' = 'desc';
  authPage = 1;
  authPageSize = 10;
  exported = false;

  constructor(private api:AuthApiService, private cdr:ChangeDetectorRef){}

  ngOnInit(){ this.adminKey=sessionStorage.getItem('superoffer_admin_key')||''; if(this.adminKey) this.connect(); }
  ngOnDestroy(){ this.stopAutoRefresh(); }

  async connect(){
    this.loading=true; this.error='';
    try{ await this.load(); this.authenticated=true; sessionStorage.setItem('superoffer_admin_key',this.adminKey); this.startAutoRefresh(); }
    catch(e){ this.error=e instanceof Error?e.message:'Admin access failed.'; this.authenticated=false; }
    finally{ this.loading=false; this.cdr.detectChanges(); }
  }

  private startAutoRefresh(){ this.stopAutoRefresh(); this.refreshTimer=window.setInterval(()=>{ if(this.authenticated&&this.view==='queue'&&!this.reviewing) this.load().catch(()=>{}); },15000); }
  private stopAutoRefresh(){ if(this.refreshTimer){ window.clearInterval(this.refreshTimer); this.refreshTimer=undefined; } }

  async load(){
    const result=await this.api.adminRegistrations(this.adminKey,this.status,this.orgType);
    this.registrations=result.registrations||[]; this.summary=result.summary||{};
    if(this.selected) this.selected=this.registrations.find((x:any)=>x.user_id===this.selected.user_id)||null;
    this.cdr.detectChanges();
  }

  async setStatus(value:string){ this.status=value; this.selected=null; await this.refresh(); }
  async setType(value:string){ this.orgType=value; this.selected=null; await this.refresh(); }

  async refresh(){
    this.loading=true; this.error='';
    try{ await this.load(); }
    catch(e){ this.error=e instanceof Error?e.message:'Could not load registrations.'; }
    finally{ this.loading=false; this.cdr.detectChanges(); }
  }

  async submitReview(){
    if(!this.selected) return; this.reviewing=true; this.error='';
    try{
      const rejected=this.decision==='reject';
      await this.api.reviewRegistration(this.adminKey,this.selected.user_id,rejected?'REJECTED':'APPROVED',rejected?this.reviewReason:'',rejected?'':this.reviewReason);
      this.decision=''; this.reviewReason=''; await this.load();
    }catch(e){ this.error=e instanceof Error?e.message:'Review could not be saved.'; }
    finally{ this.reviewing=false; this.cdr.detectChanges(); }
  }

  async openAudit(){
    this.view='audit'; this.error='';
    try{ const result=await this.api.adminAuditLog(this.adminKey); this.auditEntries=result.entries||[]; }
    catch(e){ this.error=e instanceof Error?e.message:'Could not load audit log.'; }
    this.cdr.detectChanges();
  }

  signOut(){ this.stopAutoRefresh(); sessionStorage.removeItem('superoffer_admin_key'); this.adminKey=''; this.authenticated=false; this.registrations=[]; this.selected=null; }
  roleLabel(role:string){ return role==='UNIVERSITY_OFFICER'?'University':role==='LOAN_OFFICER'?'Education lender':'Study abroad consultancy'; }
  orgInitial(item:any){ return String(item.organization?.name||item.full_name||'?')[0].toUpperCase(); }
  location(item:any){ return [item.organization?.city,item.organization?.country].filter(Boolean).join(', ')||'Not provided'; }

  // ── Auth logs methods ────────────────────────────────────────────
  get filteredAuthLogs(): AuthLogEntry[] {
    const q = this.authSearch.toLowerCase();
    let rows = MOCK_AUTH_LOGS.filter(r =>
      (!q || r.userName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.ip.includes(q)) &&
      (!this.authRoleFilter || r.role === this.authRoleFilter) &&
      (!this.authStatusFilter || r.status === this.authStatusFilter)
    );
    const col = this.authSortCol;
    const dir = this.authSortDir === 'asc' ? 1 : -1;
    rows = [...rows].sort((a,b) => {
      const av = a[col], bv = b[col];
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
    });
    return rows;
  }

  get authTotalPages(): number { return Math.max(1, Math.ceil(this.filteredAuthLogs.length / this.authPageSize)); }
  get authPageStart(): number { return Math.min((this.authPage-1)*this.authPageSize+1, this.filteredAuthLogs.length); }
  get authPageEnd(): number { return Math.min(this.authPage*this.authPageSize, this.filteredAuthLogs.length); }
  get pagedAuthLogs(): AuthLogEntry[] { return this.filteredAuthLogs.slice((this.authPage-1)*this.authPageSize, this.authPage*this.authPageSize); }
  get authPageNums(): number[] { return Array.from({length: this.authTotalPages}, (_,i)=>i+1); }

  sortAuth(col: keyof AuthLogEntry) {
    if (this.authSortCol === col) { this.authSortDir = this.authSortDir === 'asc' ? 'desc' : 'asc'; }
    else { this.authSortCol = col; this.authSortDir = 'desc'; }
    this.authPage = 1;
  }

  exportLogs() {
    const headers = ['ID','Name','Role','Email','Login Time','Logout Time','IP','Device','Browser','Status','Failed Attempts','Last Activity'];
    const rows = this.filteredAuthLogs.map(r => [r.id,r.userName,r.role,r.email,r.loginTime,r.logoutTime,r.ip,r.device,r.browser,r.status,r.failedAttempts,r.lastActivity]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `superoffer_auth_logs_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    this.exported = true;
    setTimeout(() => { this.exported = false; this.cdr.detectChanges(); }, 3000);
  }
}
