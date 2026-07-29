export class InMemoryAuthLogStore {
  constructor() {
    this.logs = [];
    this.seedDemoLogs();
  }

  seedDemoLogs() {
    const now = Date.now();
    const demoEntries = [
      {
        user_name: 'SuperAdmin',
        email: 'admin@superoffer.net',
        role: 'ADMIN',
        login_time: new Date(now - 1000 * 60 * 15).toISOString(),
        logout_time: null,
        session_duration_seconds: 900,
        browser: 'Chrome 126',
        device: 'Desktop',
        operating_system: 'macOS',
        ip_address: '192.168.1.100',
        status: 'SUCCESS'
      },
      {
        user_name: 'Dr. Elizabeth Warren',
        email: 'warren@stanford.edu',
        role: 'UNIVERSITY_OFFICER',
        login_time: new Date(now - 1000 * 60 * 120).toISOString(),
        logout_time: new Date(now - 1000 * 60 * 45).toISOString(),
        session_duration_seconds: 4500,
        browser: 'Safari 17.4',
        device: 'Desktop',
        operating_system: 'macOS',
        ip_address: '172.16.42.12',
        status: 'SUCCESS'
      },
      {
        user_name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        role: 'STUDENT',
        login_time: new Date(now - 1000 * 60 * 300).toISOString(),
        logout_time: new Date(now - 1000 * 60 * 210).toISOString(),
        session_duration_seconds: 5400,
        browser: 'Chrome 125',
        device: 'Mobile',
        operating_system: 'Android 14',
        ip_address: '49.207.198.44',
        status: 'SUCCESS'
      },
      {
        user_name: 'Unverified Consultancy',
        email: 'info@globaledu.com',
        role: 'CONSULTANT',
        login_time: new Date(now - 1000 * 60 * 600).toISOString(),
        logout_time: null,
        session_duration_seconds: 0,
        browser: 'Firefox 127',
        device: 'Desktop',
        operating_system: 'Windows 11',
        ip_address: '103.21.244.18',
        status: 'PENDING_APPROVAL'
      },
      {
        user_name: 'Unknown User',
        email: 'hacker@malicious.org',
        role: 'UNKNOWN',
        login_time: new Date(now - 1000 * 60 * 900).toISOString(),
        logout_time: null,
        session_duration_seconds: 0,
        browser: 'Edge 126',
        device: 'Desktop',
        operating_system: 'Windows 10',
        ip_address: '185.220.101.5',
        status: 'FAILED'
      }
    ];

    for (const item of demoEntries) {
      this.insert({
        id: crypto.randomUUID(),
        ...item
      });
    }
  }

  async insert(logEntry) {
    const record = {
      id: logEntry.id || crypto.randomUUID(),
      user_name: logEntry.user_name || 'Unknown',
      email: logEntry.email || '',
      role: logEntry.role || 'UNKNOWN',
      login_time: logEntry.login_time || new Date().toISOString(),
      logout_time: logEntry.logout_time || null,
      session_duration_seconds: logEntry.session_duration_seconds || 0,
      browser: logEntry.browser || 'Unknown Browser',
      device: logEntry.device || 'Desktop',
      operating_system: logEntry.operating_system || 'Unknown OS',
      ip_address: logEntry.ip_address || '127.0.0.1',
      status: logEntry.status || 'SUCCESS'
    };
    this.logs.unshift(record);
    return structuredClone(record);
  }

  async query({ search, role, status, dateFrom, dateTo, page = 1, limit = 10 } = {}) {
    let filtered = [...this.logs];

    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter(log =>
        log.user_name.toLowerCase().includes(s) ||
        log.email.toLowerCase().includes(s) ||
        log.ip_address.toLowerCase().includes(s)
      );
    }

    if (role && role !== 'ALL') {
      filtered = filtered.filter(log => log.role === role);
    }

    if (status && status !== 'ALL') {
      filtered = filtered.filter(log => log.status === status);
    }

    if (dateFrom) {
      const fromTime = new Date(dateFrom).getTime();
      if (!isNaN(fromTime)) {
        filtered = filtered.filter(log => new Date(log.login_time).getTime() >= fromTime);
      }
    }

    if (dateTo) {
      const toTime = new Date(dateTo).getTime();
      if (!isNaN(toTime)) {
        filtered = filtered.filter(log => new Date(log.login_time).getTime() <= toTime + 86400000);
      }
    }

    const total = filtered.length;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const startIndex = (pageNum - 1) * limitNum;
    const items = filtered.slice(startIndex, startIndex + limitNum);

    return {
      logs: items.map(x => structuredClone(x)),
      total,
      page: pageNum,
      limit: limitNum,
      total_pages: Math.ceil(total / limitNum) || 1
    };
  }
}
