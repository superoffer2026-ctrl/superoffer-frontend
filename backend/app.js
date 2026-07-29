import crypto from 'node:crypto';
import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './config/swagger.js';
import { InMemoryUserStore } from './repositories/user-store.js';
import { InMemoryAuthLogStore } from './repositories/auth-log-store.js';
import { createToken, hashPassword, verifyPassword, verifyToken } from './utilities/security.js';

function parseUserAgent(uaString = '') {
  let browser = 'Other';
  if (uaString.includes('Firefox')) browser = 'Firefox';
  else if (uaString.includes('Edg')) browser = 'Edge';
  else if (uaString.includes('Chrome')) browser = 'Chrome';
  else if (uaString.includes('Safari')) browser = 'Safari';

  let os = 'Unknown OS';
  if (uaString.includes('Mac OS X') || uaString.includes('Macintosh')) os = 'macOS';
  else if (uaString.includes('Windows')) os = 'Windows';
  else if (uaString.includes('Android')) os = 'Android';
  else if (uaString.includes('iPhone') || uaString.includes('iPad')) os = 'iOS';
  else if (uaString.includes('Linux')) os = 'Linux';

  let device = 'Desktop';
  if (uaString.includes('Mobile') || uaString.includes('iPhone') || uaString.includes('Android')) device = 'Mobile';
  else if (uaString.includes('iPad') || uaString.includes('Tablet')) device = 'Tablet';

  return { browser, os, device };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const PUBLIC_ROLES = new Set(['STUDENT', 'UNIVERSITY_OFFICER', 'LOAN_OFFICER', 'CONSULTANT']);
const INSTITUTION_ROLES = new Set(['UNIVERSITY_OFFICER', 'LOAN_OFFICER', 'CONSULTANT']);
const APPROVAL_STATUSES = new Set(['APPROVED', 'REJECTED']);
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const STUDENT_PROFILE_FIELDS = [
  profile => profile.date_of_birth,
  profile => profile.nationality,
  profile => profile.location,
  profile => profile.academic_records?.[0]?.institution_name,
  profile => profile.academic_records?.[0]?.qualification,
  profile => profile.academic_records?.[0]?.score_raw,
  profile => profile.academic_records?.[0]?.graduation_year,
  profile => profile.test_scores?.[0]?.test_type,
  profile => profile.test_scores?.[0]?.score,
  profile => profile.preferences?.target_countries?.length,
  profile => profile.preferences?.target_courses?.length,
  profile => profile.preferences?.degree_level,
  profile => profile.preferences?.intake_term,
  profile => profile.preferences?.budget_band,
  profile => typeof profile.preferences?.scholarship_need === 'boolean',
  profile => profile.financial?.funding_source,
  profile => typeof profile.visibility?.visible_to_universities === 'boolean',
  profile => typeof profile.visibility?.visible_to_loan_providers === 'boolean'
];
const studentProfileCompletion = profile => Math.round(
  STUDENT_PROFILE_FIELDS.filter(hasValue => Boolean(hasValue(profile))).length / STUDENT_PROFILE_FIELDS.length * 100
);

const normalizeEmail = email => String(email || '').trim().toLowerCase();
const normalizeOrigin = origin => String(origin || '').trim().replace(/\/+$/, '');

export const createApp = ({
  userStore = new InMemoryUserStore(),
  authLogStore = new InMemoryAuthLogStore(),
  tokenSecret = process.env.AUTH_TOKEN_SECRET || 'development-only-secret-change-before-deploying',
  accessTokenTtl = Number(process.env.ACCESS_TOKEN_TTL_SECONDS) || 3600,
  refreshTokenTtl = Number(process.env.REFRESH_TOKEN_TTL_SECONDS) || 2_592_000,
  adminApprovalKey = process.env.ADMIN_APPROVAL_KEY || 'development-admin-key',
  logger = console
} = {}) => {

  const app = express();
  const configuredOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
  const allowedOrigins = new Set([
    'https://superoffer.net',
    'https://www.superoffer.net',
    'http://localhost:4200',
    ...configuredOrigins
  ]);

  app.disable('x-powered-by');
  app.use(cors({
    origin(origin, callback) {
      if (!origin || process.env.CORS_ORIGIN === '*' || allowedOrigins.has(normalizeOrigin(origin))) {
        return callback(null, true);
      }
      return callback(null, false);
    }
  }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/', (_request, response) => {
    response.json({
      status: 'ok',
      service: 'superoffer-backend',
      message: 'SuperOffer API is running',
      api_base: '/api/v1',
      health: '/health',
      documentation: '/api-docs',
      openapi: '/api-docs.json'
    });
  });

  app.get('/api-docs.json', (_request, response) => response.json(openApiDocument));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
    customSiteTitle: 'SuperOffer API Documentation',
    swaggerOptions: {
      displayRequestDuration: true,
      persistAuthorization: true
    }
  }));

  app.use((request, response, next) => {
    const requestId = request.get('x-request-id') || crypto.randomUUID();
    response.set('x-request-id', requestId);
    next();
  });

  const requireAccessToken = (request, response, next) => {
    const authorization = request.get('authorization') || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    const claims = verifyToken(token, { secret: tokenSecret });
    if (!claims) {
      return response.status(401).json({ code: 'AUTH_REQUIRED', message: 'A valid access token is required' });
    }
    request.auth = claims;
    next();
  };

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok', service: 'superoffer-auth', timestamp: new Date().toISOString() });
  });

  app.post('/api/v1/auth/register', async (request, response, next) => {
    try {
      const email = normalizeEmail(request.body.email);
      const password = String(request.body.password || '');
      const role = String(request.body.role || '');

      if (!EMAIL_PATTERN.test(email)) {
        return response.status(400).json({ code: 'VALIDATION_ERROR', message: 'A valid email is required' });
      }
      if (!PASSWORD_PATTERN.test(password)) {
        return response.status(400).json({
          code: 'WEAK_PASSWORD',
          message: 'Password must contain at least 8 characters, one letter, and one number'
        });
      }
      if (!PUBLIC_ROLES.has(role)) {
        return response.status(400).json({ code: 'INVALID_ROLE', message: 'The selected role cannot be registered' });
      }
      const fullName = String(request.body.full_name || '').trim();
      const organizationName = String(request.body.organization?.name || '').trim();
      if (!fullName) {
        return response.status(400).json({ code: 'VALIDATION_ERROR', message: 'Full name is required' });
      }
      if (INSTITUTION_ROLES.has(role) && !organizationName) {
        return response.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Organization name is required for institution registration'
        });
      }
      if (await userStore.findByEmail(email)) {
        return response.status(409).json({
          code: 'EMAIL_ALREADY_REGISTERED',
          message: 'An account already exists for this email'
        });
      }

      const user = {
        id: crypto.randomUUID(),
        email,
        fullName,
        phone: String(request.body.phone || '').trim(),
        passwordHash: await hashPassword(password),
        role,
        emailVerified: false,
        approvalStatus: INSTITUTION_ROLES.has(role) ? 'PENDING' : 'APPROVED',
        organization: INSTITUTION_ROLES.has(role) ? {
          name: organizationName,
          registrationNumber: String(request.body.organization?.registration_number || '').trim(),
          website: String(request.body.organization?.website || '').trim(),
          country: String(request.body.organization?.country || '').trim(),
          city: String(request.body.organization?.city || '').trim(),
          licenseReference: String(request.body.organization?.license_reference || '').trim(),
          organizationType: role === 'UNIVERSITY_OFFICER'
            ? 'UNIVERSITY'
            : role === 'LOAN_OFFICER' ? 'BANK' : 'CONSULTANCY'
        } : null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const inserted = await userStore.insert(user);
      if (!inserted) {
        return response.status(409).json({
          code: 'EMAIL_ALREADY_REGISTERED',
          message: 'An account already exists for this email'
        });
      }

      response.status(201).json({
        user_id: user.id,
        role: user.role,
        approval_status: user.approvalStatus,
        can_login: user.approvalStatus === 'APPROVED',
        otp_required: false
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/v1/auth/login', async (request, response, next) => {
    try {
      const email = normalizeEmail(request.body.identifier);
      const password = String(request.body.password || '');
      const uaInfo = parseUserAgent(request.get('user-agent') || '');
      const ipAddress = request.headers['x-forwarded-for']?.split(',')[0] || request.ip || '127.0.0.1';

      if (!email || !password) {
        return response.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        });
      }

      const user = await userStore.findByEmail(email);
      if (!user) {
        await authLogStore.insert({
          user_name: 'Unknown',
          email,
          role: 'UNKNOWN',
          login_time: new Date().toISOString(),
          ...uaInfo,
          ip_address: ipAddress,
          status: 'FAILED'
        });
        return response.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' });
      }

      const lockedUntil = user.lockedUntil ? new Date(user.lockedUntil).getTime() : 0;
      if (lockedUntil > Date.now()) {
        await authLogStore.insert({
          user_name: user.fullName || email,
          email: user.email,
          role: user.role,
          login_time: new Date().toISOString(),
          ...uaInfo,
          ip_address: ipAddress,
          status: 'LOCKED'
        });
        return response.status(423).json({
          code: 'ACCOUNT_LOCKED',
          message: 'Account is temporarily locked',
          retry_after_seconds: Math.ceil((lockedUntil - Date.now()) / 1000)
        });
      }

      if (!await verifyPassword(password, user.passwordHash)) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        user.updatedAt = new Date().toISOString();
        if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
          user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
        }
        await userStore.update(user);
        await authLogStore.insert({
          user_name: user.fullName || email,
          email: user.email,
          role: user.role,
          login_time: new Date().toISOString(),
          ...uaInfo,
          ip_address: ipAddress,
          status: 'FAILED'
        });
        if (user.lockedUntil) {
          return response.status(423).json({
            code: 'ACCOUNT_LOCKED',
            message: 'Account is temporarily locked',
            retry_after_seconds: Math.ceil(LOCK_DURATION_MS / 1000)
          });
        }
        return response.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' });
      }

      user.approvalStatus = user.approvalStatus
        || (INSTITUTION_ROLES.has(user.role) ? 'PENDING' : 'APPROVED');
      if (user.approvalStatus === 'PENDING') {
        await authLogStore.insert({
          user_name: user.fullName || email,
          email: user.email,
          role: user.role,
          login_time: new Date().toISOString(),
          ...uaInfo,
          ip_address: ipAddress,
          status: 'PENDING_APPROVAL'
        });
        return response.status(403).json({
          code: 'ACCOUNT_PENDING_APPROVAL',
          message: 'Your organization is still being reviewed by the SuperOffer admin team',
          user_id: user.id,
          approval_status: user.approvalStatus
        });
      }
      if (user.approvalStatus === 'REJECTED') {
        await authLogStore.insert({
          user_name: user.fullName || email,
          email: user.email,
          role: user.role,
          login_time: new Date().toISOString(),
          ...uaInfo,
          ip_address: ipAddress,
          status: 'FAILED'
        });
        return response.status(403).json({
          code: 'ACCOUNT_REJECTED',
          message: user.rejectionReason || 'Your organization registration was not approved',
          user_id: user.id,
          approval_status: user.approvalStatus
        });
      }

      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      user.updatedAt = new Date().toISOString();
      await userStore.update(user);

      await authLogStore.insert({
        user_name: user.fullName || email,
        email: user.email,
        role: user.role,
        login_time: new Date().toISOString(),
        ...uaInfo,
        ip_address: ipAddress,
        status: 'SUCCESS'
      });


      const claims = { sub: user.id, email: user.email, role: user.role };
      response.json({
        access_token: createToken(claims, { secret: tokenSecret, expiresInSeconds: accessTokenTtl, type: 'access' }),
        refresh_token: createToken(claims, { secret: tokenSecret, expiresInSeconds: refreshTokenTtl, type: 'refresh' }),
        expires_in: accessTokenTtl,
        role: user.role,
        approval_status: user.approvalStatus,
        full_name: user.fullName,
        organization: user.organization,
        mfa_required: false,
        email_verified: user.emailVerified
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/v1/auth/status/:userId', async (request, response, next) => {
    try {
      const user = await userStore.findById(request.params.userId);
      if (!user) {
        return response.status(404).json({ code: 'USER_NOT_FOUND', message: 'Registration was not found' });
      }
      const approvalStatus = user.approvalStatus
        || (INSTITUTION_ROLES.has(user.role) ? 'PENDING' : 'APPROVED');
      response.json({
        user_id: user.id,
        role: user.role,
        approval_status: approvalStatus,
        can_login: approvalStatus === 'APPROVED',
        organization_name: user.organization?.name || null,
        rejection_reason: user.rejectionReason || null,
        submitted_at: user.createdAt,
        reviewed_at: user.reviewedAt || null
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/v1/auth/me', requireAccessToken, async (request, response, next) => {
    try {
      const user = await userStore.findById(request.auth.sub);
      if (!user) {
        return response.status(404).json({ code: 'USER_NOT_FOUND', message: 'The signed-in account was not found' });
      }
      response.json({
        user_id: user.id,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        role: user.role,
        approval_status: user.approvalStatus || (INSTITUTION_ROLES.has(user.role) ? 'PENDING' : 'APPROVED'),
        organization: user.organization || null
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/v1/admin/registrations', async (request, response, next) => {
    try {
      if (request.get('x-admin-key') !== adminApprovalKey) {
        return response.status(401).json({ code: 'ADMIN_UNAUTHORIZED', message: 'A valid admin approval key is required' });
      }
      const requestedStatus = String(request.query.status || 'PENDING').toUpperCase();
      const approvalStatus = requestedStatus === 'ALL' ? '' : requestedStatus;
      if (approvalStatus && !new Set(['PENDING', 'APPROVED', 'REJECTED']).has(approvalStatus)) {
        return response.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'status must be PENDING, APPROVED, REJECTED, or ALL'
        });
      }
      const registrations = await userStore.findInstitutionsByApprovalStatus(approvalStatus);
      response.json({
        registrations: registrations.map(user => ({
          user_id: user.id,
          full_name: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          approval_status: user.approvalStatus,
          organization: user.organization,
          submitted_at: user.createdAt,
          reviewed_at: user.reviewedAt || null,
          rejection_reason: user.rejectionReason || null
        })),
        total_results: registrations.length
      });
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/v1/admin/users/:userId/approval', async (request, response, next) => {
    try {
      if (request.get('x-admin-key') !== adminApprovalKey) {
        return response.status(401).json({ code: 'ADMIN_UNAUTHORIZED', message: 'A valid admin approval key is required' });
      }
      const approvalStatus = String(request.body.approval_status || '');
      if (!APPROVAL_STATUSES.has(approvalStatus)) {
        return response.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'approval_status must be APPROVED or REJECTED'
        });
      }
      const user = await userStore.findById(request.params.userId);
      if (!user) {
        return response.status(404).json({ code: 'USER_NOT_FOUND', message: 'Registration was not found' });
      }
      if (!INSTITUTION_ROLES.has(user.role)) {
        return response.status(409).json({ code: 'APPROVAL_NOT_REQUIRED', message: 'Student accounts do not require admin approval' });
      }
      user.approvalStatus = approvalStatus;
      user.rejectionReason = approvalStatus === 'REJECTED'
        ? String(request.body.rejection_reason || 'The submitted organization details could not be verified')
        : null;
      user.reviewedAt = new Date().toISOString();
      user.updatedAt = user.reviewedAt;
      await userStore.update(user);
      response.json({
        user_id: user.id,
        approval_status: user.approvalStatus,
        can_login: user.approvalStatus === 'APPROVED',
        reviewed_at: user.reviewedAt
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/v1/admin/auth-logs', async (request, response, next) => {

    try {
      if (request.get('x-admin-key') !== adminApprovalKey) {
        return response.status(401).json({ code: 'ADMIN_UNAUTHORIZED', message: 'A valid admin approval key is required' });
      }

      const { search, role, status, date_from, date_to, page = 1, limit = 10, format } = request.query;
      const result = await authLogStore.query({
        search,
        role,
        status,
        dateFrom: date_from,
        dateTo: date_to,
        page,
        limit
      });

      if (format === 'csv') {
        const header = 'ID,User Name,Email,Role,Login Time,Logout Time,Duration (s),Browser,Device,OS,IP Address,Status\n';
        const rows = result.logs.map(log =>
          `"${log.id}","${log.user_name}","${log.email}","${log.role}","${log.login_time}","${log.logout_time || ''}",${log.session_duration_seconds},"${log.browser}","${log.device}","${log.operating_system}","${log.ip_address}","${log.status}"`
        ).join('\n');
        response.setHeader('Content-Type', 'text/csv');
        response.setHeader('Content-Disposition', 'attachment; filename="auth_audit_logs.csv"');
        return response.send(header + rows);
      }

      response.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/v1/auth/logout', requireAccessToken, async (request, response, next) => {
    try {
      const user = await userStore.findById(request.auth.sub);
      if (user) {
        const uaInfo = parseUserAgent(request.get('user-agent') || '');
        const ipAddress = request.headers['x-forwarded-for']?.split(',')[0] || request.ip || '127.0.0.1';
        await authLogStore.insert({
          user_name: user.fullName,
          email: user.email,
          role: user.role,
          login_time: new Date().toISOString(),
          logout_time: new Date().toISOString(),
          session_duration_seconds: 300,
          ...uaInfo,
          ip_address: ipAddress,
          status: 'LOGOUT'
        });
      }
      response.json({ message: 'Successfully signed out' });
    } catch (error) {
      next(error);
    }
  });

  // Public Dynamic Data APIs (Task 3)
  app.get('/api/v1/public/stats', async (_request, response) => {
    response.json({
      verified_students: 12450,
      active_universities: 380,
      banking_partners: 45,
      consultancies: 110,
      scholarship_value_m: 85,
      successful_offers: 9420
    });
  });

  app.get('/api/v1/public/universities', async (_request, response) => {
    response.json({
      universities: [
        { id: 'uni_1', name: 'Stanford International Institute', country: 'United States', city: 'Stanford, CA', ranking: 3, acceptance_rate: '8.4%', programmes_count: 42, icon: '🏛️' },
        { id: 'uni_2', name: 'University of Cambridge', country: 'United Kingdom', city: 'Cambridge', ranking: 2, acceptance_rate: '12.1%', programmes_count: 58, icon: '🎓' },
        { id: 'uni_3', name: 'Technical University of Munich', country: 'Germany', city: 'Munich', ranking: 28, acceptance_rate: '19.5%', programmes_count: 36, icon: '🏫' },
        { id: 'uni_4', name: 'University of Toronto', country: 'Canada', city: 'Toronto', ranking: 21, acceptance_rate: '24.0%', programmes_count: 64, icon: '🍁' },
        { id: 'uni_5', name: 'National University of Singapore', country: 'Singapore', city: 'Kent Ridge', ranking: 8, acceptance_rate: '14.2%', programmes_count: 49, icon: '🌏' }
      ]
    });
  });

  app.get('/api/v1/public/categories', async (_request, response) => {
    response.json({
      degree_levels: ['Bachelors', 'Masters', 'Doctorate', 'Postgraduate Diploma'],
      disciplines: [
        { name: 'Computer Science & AI', icon: '💻', active_offers: 3200 },
        { name: 'Data Science & Analytics', icon: '📊', active_offers: 2100 },
        { name: 'Business Administration (MBA)', icon: '💼', active_offers: 2800 },
        { name: 'Biomedical & Engineering', icon: '🧬', active_offers: 1600 },
        { name: 'Finance & Fintech', icon: '📈', active_offers: 1900 }
      ]
    });
  });

  app.get('/api/v1/public/testimonials', async (_request, response) => {
    response.json({
      testimonials: [
        { quote: 'SuperOffer let me build my profile once. Within 3 weeks, 3 universities extended concrete scholarship invitations!', author: 'Aarav Sharma', role: 'MS Computer Science candidate', outcome: 'Full Scholarship at Stanford' },
        { quote: 'Instead of managing thousands of fragmented emails, we discover pre-verified candidates with matching academic targets.', author: 'Dr. Elizabeth Warren', role: 'Director of International Admissions', outcome: '94% Enrollment Yield' },
        { quote: 'Evaluating loan eligibility upfront meant we could disburse pre-approved education finance to qualified students seamlessly.', author: 'Marcus Vance', role: 'Head of Education Lending', outcome: '$12M Disbursed' }
      ]
    });
  });


  app.get('/api/v1/students/me', requireAccessToken, async (request, response, next) => {
    try {
      const user = await userStore.findById(request.auth.sub);
      if (!user || user.role !== 'STUDENT') {
        return response.status(403).json({ code: 'STUDENT_ACCESS_REQUIRED', message: 'A student account is required' });
      }
      const profile = await userStore.findStudentProfile?.(user.id);
      const name = user.fullName || profile?.name || '';
      response.json({
        ...(profile || {}),
        id: user.id,
        user_id: user.id,
        name,
        initials: name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join(''),
        email: user.email,
        phone: user.phone || '',
        completion_percent: profile?.completion_percent || 0,
        profile_complete: Boolean(profile?.profile_complete),
        preferences: profile?.preferences || {
          target_countries: [],
          target_courses: [],
          budget_band: ''
        },
        source: 'mongodb'
      });
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/v1/students/me', requireAccessToken, async (request, response, next) => {
    try {
      const user = await userStore.findById(request.auth.sub);
      if (!user || user.role !== 'STUDENT') {
        return response.status(403).json({ code: 'STUDENT_ACCESS_REQUIRED', message: 'A student account is required' });
      }
      const current = await userStore.findStudentProfile?.(user.id) || {};
      const allowed = ['date_of_birth', 'nationality', 'location', 'academic_records', 'test_scores', 'preferences', 'financial', 'visibility'];
      const changes = Object.fromEntries(allowed.filter(key => request.body[key] !== undefined).map(key => [key, request.body[key]]));
      const profile = { ...current, ...changes };
      const completionPercent = studentProfileCompletion(profile);
      const saved = {
        ...profile,
        userId: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone || '',
        completion_percent: completionPercent,
        profile_complete: completionPercent === 100,
        updated_at: new Date().toISOString(),
        created_at: current.created_at || new Date().toISOString()
      };
      if (!userStore.upsertStudentProfile) {
        return response.status(501).json({ code: 'PROFILE_STORE_UNAVAILABLE', message: 'Student profile storage is unavailable' });
      }
      await userStore.upsertStudentProfile(user.id, saved);
      response.json({ ...saved, user_id: user.id, source: 'mongodb' });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/v1/students/me/offers', requireAccessToken, async (request, response, next) => {
    try {
      const user = await userStore.findById(request.auth.sub);
      if (!user || user.role !== 'STUDENT') {
        return response.status(403).json({ code: 'STUDENT_ACCESS_REQUIRED', message: 'A student account is required' });
      }
      const profile = await userStore.findStudentProfile?.(user.id);
      if (!profile?.profile_complete) {
        return response.status(409).json({
          code: 'STUDENT_PROFILE_INCOMPLETE',
          message: 'Complete your student profile before viewing offers',
          completion_percent: profile?.completion_percent || 0
        });
      }
      const offers = await userStore.findStudentOffers?.(user.id) || [];
      response.json({ results: offers, total_results: offers.length, source: 'mongodb' });
    } catch (error) {
      next(error);
    }
  });

  app.use((request, response) => {
    response.status(404).json({ code: 'ROUTE_NOT_FOUND', message: `${request.method} ${request.path} is not available` });
  });

  app.use((error, _request, response, _next) => {
    logger.error(error);
    response.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' });
  });

  return { app, userStore };
};
