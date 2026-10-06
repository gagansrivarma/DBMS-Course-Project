/**
 * JurisCore - Full-Stack Express-compatible REST API Server & Static Host
 * Connects directly to local MySQL database: LegalCaseDB
 * Runs with Node.js standard libraries (zero npm dependencies required).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

// ── Load .env ────────────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '.env');
const env = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  }
}

const PORT = parseInt(process.env.PORT || env.PORT || '3000', 10);
const DB_HOST = process.env.DB_HOST || env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || env.DB_PASSWORD || 'Gagan@8856';
const DB_NAME = process.env.DB_NAME || env.DB_NAME || 'LegalCaseDB';
const DB_SOCKET = process.env.DB_SOCKET || env.DB_SOCKET || '/tmp/mysql.sock';
const STATIC_DIR = path.resolve(__dirname, '..');

// Find mysql binary path
const MYSQL_BIN = fs.existsSync('/usr/local/mysql-8.0.46-macos15-arm64/bin/mysql')
  ? '/usr/local/mysql-8.0.46-macos15-arm64/bin/mysql'
  : (fs.existsSync('/usr/local/mysql/bin/mysql') ? '/usr/local/mysql/bin/mysql' : 'mysql');

// ── SQL Escaping & Execution Engine ──────────────────────────────────────────
function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : 'NULL';
  if (typeof val === 'boolean') return val ? '1' : '0';
  const str = String(val);
  return "'" + str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z') + "'";
}

function formatSql(sql, params) {
  if (!params || !params.length) return sql;
  let idx = 0;
  return sql.replace(/\?/g, () => escapeSql(params[idx++]));
}

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const formatted = formatSql(sql, params);
    const args = [
      '-u', DB_USER,
      '-D', DB_NAME,
      '--batch',
      '--raw',
      '--default-character-set=utf8mb4'
    ];
    if (fs.existsSync(DB_SOCKET)) {
      args.push('-S', DB_SOCKET);
    } else if (DB_HOST) {
      args.push('-h', DB_HOST);
    }
    args.push('-e', formatted);

    execFile(MYSQL_BIN, args, {
      env: { ...process.env, MYSQL_PWD: DB_PASSWORD },
      maxBuffer: 10 * 1024 * 1024
    }, (err, stdout, stderr) => {
      if (err) {
        const msg = (stderr || err.message || '').replace(/mysql: \[Warning\][^\n]*\n?/g, '').trim();
        return reject(new Error(msg || 'MySQL execution error'));
      }
      const raw = stdout.replace(/mysql: \[Warning\][^\n]*\n?/g, '').trim();
      if (!raw) return resolve([]);
      const lines = raw.split('\n');
      if (lines.length === 0) return resolve([]);
      const headers = lines[0].split('\t');
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line && i === lines.length - 1) continue;
        const vals = line.split('\t');
        const row = {};
        for (let j = 0; j < headers.length; j++) {
          const col = headers[j];
          const val = vals[j];
          row[col] = (val === 'NULL' || val === undefined) ? null : val;
        }
        rows.push(row);
      }
      resolve(rows);
    });
  });
}

// ── Static MIME Types ────────────────────────────────────────────────────────
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf'
};

// ── HTTP Helpers ─────────────────────────────────────────────────────────────
function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(payload));
}

function ok(res, data) {
  sendJson(res, 200, { success: true, data });
}

function err(res, error, code = 500) {
  console.error('API Error:', error);
  sendJson(res, code, { success: false, error: error.message || String(error) });
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// ── Router & Handlers ────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;
  const searchParams = reqUrl.searchParams;
  const method = req.method;

  // ══════════════════════════════════════════════════════════════════════════
  // REST API ROUTES
  // ══════════════════════════════════════════════════════════════════════════
  if (pathname.startsWith('/api')) {
    try {
      // Health check
      if (pathname === '/api/health' && method === 'GET') {
        const test = await query('SELECT 1 AS ok');
        return ok(res, {
          status: 'online',
          database: DB_NAME,
          mysql: test.length > 0 ? 'connected' : 'error',
          timestamp: new Date().toISOString()
        });
      }

      // ── Dashboard Stats ────────────────────────────────────────────────────
      if (pathname === '/api/dashboard/stats' && method === 'GET') {
        const [
          clientsCount, lawyersCount, judgesCount, casesCount,
          activeCount, pendingCount, closedCount, hearingsCount,
          paymentsAgg, upcoming, recentPayments, recentCases
        ] = await Promise.all([
          query('SELECT COUNT(*) AS total FROM Client'),
          query('SELECT COUNT(*) AS total FROM Lawyer'),
          query('SELECT COUNT(*) AS total FROM Judge'),
          query('SELECT COUNT(*) AS total FROM LegalCase'),
          query("SELECT COUNT(*) AS total FROM LegalCase WHERE status='Ongoing'"),
          query("SELECT COUNT(*) AS total FROM LegalCase WHERE status='Pending'"),
          query("SELECT COUNT(*) AS total FROM LegalCase WHERE status='Closed'"),
          query('SELECT COUNT(*) AS total FROM Hearing'),
          query('SELECT COALESCE(SUM(amount), 0) AS total_revenue, COUNT(*) AS total_payments FROM Payment'),
          query(`
            SELECT h.*, c.title AS case_title, j.name AS judge_name
            FROM Hearing h
            JOIN LegalCase c ON h.case_id = c.case_id
            JOIN Judge     j ON h.judge_id = j.judge_id
            WHERE h.hearing_date >= CURDATE()
            ORDER BY h.hearing_date ASC, h.hearing_time ASC
            LIMIT 5
          `),
          query(`
            SELECT p.*, cl.name AS client_name, lc.title AS case_title
            FROM Payment p
            JOIN Client    cl ON p.client_id = cl.client_id
            JOIN LegalCase lc ON p.case_id   = lc.case_id
            ORDER BY p.payment_date DESC
            LIMIT 5
          `),
          query(`
            SELECT lc.*, cl.name AS client_name
            FROM LegalCase lc
            JOIN Client cl ON lc.client_id = cl.client_id
            ORDER BY lc.filing_date DESC
            LIMIT 5
          `)
        ]);

        return ok(res, {
          total_clients: parseInt(clientsCount[0]?.total || 0, 10),
          total_lawyers: parseInt(lawyersCount[0]?.total || 0, 10),
          total_judges:  parseInt(judgesCount[0]?.total || 0, 10),
          total_cases:   parseInt(casesCount[0]?.total || 0, 10),
          active_cases:  parseInt(activeCount[0]?.total || 0, 10),
          pending_cases: parseInt(pendingCount[0]?.total || 0, 10),
          closed_cases:  parseInt(closedCount[0]?.total || 0, 10),
          total_hearings:parseInt(hearingsCount[0]?.total || 0, 10),
          total_revenue: parseFloat(paymentsAgg[0]?.total_revenue || 0),
          total_payments:parseInt(paymentsAgg[0]?.total_payments || 0, 10),
          upcoming_hearings: upcoming,
          recent_payments: recentPayments,
          recent_cases: recentCases
        });
      }

      // ── Clients ────────────────────────────────────────────────────────────
      if (pathname === '/api/clients' && method === 'GET') {
        const rows = await query('SELECT * FROM Client ORDER BY name ASC');
        return ok(res, rows);
      }

      const clientMatch = pathname.match(/^\/api\/clients\/(\d+)$/);
      if (clientMatch && method === 'GET') {
        const clientId = clientMatch[1];
        const [clientRows, cases] = await Promise.all([
          query('SELECT * FROM Client WHERE client_id=?', [clientId]),
          query('SELECT * FROM LegalCase WHERE client_id=? ORDER BY filing_date DESC', [clientId])
        ]);
        if (!clientRows.length) return err(res, 'Client not found', 404);
        return ok(res, { ...clientRows[0], cases });
      }

      if (pathname === '/api/clients' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { name, phone, email, address, dob } = body;
        if (!name || !phone) return err(res, 'name and phone are required', 400);
        const created = await query(`
          INSERT INTO Client (name, phone, email, address, dob) VALUES (?, ?, ?, ?, ?);
          SELECT * FROM Client WHERE client_id = LAST_INSERT_ID();
        `, [name, phone, email || null, address || null, dob || null]);
        return ok(res, created[0] || {});
      }

      if (clientMatch && method === 'PUT') {
        const clientId = clientMatch[1];
        const body = await parseJsonBody(req);
        const { name, phone, email, address, dob } = body;
        await query(
          'UPDATE Client SET name=?, phone=?, email=?, address=?, dob=? WHERE client_id=?',
          [name, phone, email || null, address || null, dob || null, clientId]
        );
        const updated = await query('SELECT * FROM Client WHERE client_id=?', [clientId]);
        return ok(res, updated[0] || {});
      }

      if (clientMatch && method === 'DELETE') {
        const clientId = clientMatch[1];
        await query('DELETE FROM Client WHERE client_id=?', [clientId]);
        return ok(res, { deleted: true });
      }

      // ── Lawyers ────────────────────────────────────────────────────────────
      if (pathname === '/api/lawyers' && method === 'GET') {
        const rows = await query(`
          SELECT l.*, COUNT(wo.case_id) AS case_count
          FROM Lawyer l
          LEFT JOIN Works_On wo ON l.lawyer_id = wo.lawyer_id
          GROUP BY l.lawyer_id
          ORDER BY l.name ASC
        `);
        return ok(res, rows);
      }

      const lawyerMatch = pathname.match(/^\/api\/lawyers\/(\d+)$/);
      if (lawyerMatch && method === 'GET') {
        const lawyerId = lawyerMatch[1];
        const [lawyerRows, cases] = await Promise.all([
          query('SELECT * FROM Lawyer WHERE lawyer_id=?', [lawyerId]),
          query(`
            SELECT lc.* FROM LegalCase lc
            JOIN Works_On wo ON lc.case_id = wo.case_id
            WHERE wo.lawyer_id=? ORDER BY lc.filing_date DESC
          `, [lawyerId])
        ]);
        if (!lawyerRows.length) return err(res, 'Lawyer not found', 404);
        return ok(res, { ...lawyerRows[0], cases });
      }

      if (pathname === '/api/lawyers' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { name, phone, email, specialization } = body;
        if (!name || !phone) return err(res, 'name and phone are required', 400);
        const created = await query(`
          INSERT INTO Lawyer (name, phone, email, specialization) VALUES (?, ?, ?, ?);
          SELECT * FROM Lawyer WHERE lawyer_id = LAST_INSERT_ID();
        `, [name, phone, email || null, specialization || null]);
        return ok(res, created[0] || {});
      }

      if (lawyerMatch && method === 'PUT') {
        const lawyerId = lawyerMatch[1];
        const body = await parseJsonBody(req);
        const { name, phone, email, specialization } = body;
        await query(
          'UPDATE Lawyer SET name=?, phone=?, email=?, specialization=? WHERE lawyer_id=?',
          [name, phone, email || null, specialization || null, lawyerId]
        );
        const updated = await query('SELECT * FROM Lawyer WHERE lawyer_id=?', [lawyerId]);
        return ok(res, updated[0] || {});
      }

      if (lawyerMatch && method === 'DELETE') {
        const lawyerId = lawyerMatch[1];
        await query('DELETE FROM Lawyer WHERE lawyer_id=?', [lawyerId]);
        return ok(res, { deleted: true });
      }

      // ── Judges ─────────────────────────────────────────────────────────────
      if (pathname === '/api/judges' && method === 'GET') {
        const rows = await query(`
          SELECT j.*, COUNT(h.hearing_id) AS hearing_count
          FROM Judge j
          LEFT JOIN Hearing h ON j.judge_id = h.judge_id
          GROUP BY j.judge_id
          ORDER BY j.name ASC
        `);
        return ok(res, rows);
      }

      const judgeMatch = pathname.match(/^\/api\/judges\/(\d+)$/);
      if (judgeMatch && method === 'GET') {
        const judgeId = judgeMatch[1];
        const rows = await query('SELECT * FROM Judge WHERE judge_id=?', [judgeId]);
        if (!rows.length) return err(res, 'Judge not found', 404);
        return ok(res, rows[0]);
      }

      if (pathname === '/api/judges' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { name, court_name, phone, email } = body;
        if (!name || !court_name) return err(res, 'name and court_name are required', 400);
        const created = await query(`
          INSERT INTO Judge (name, court_name, phone, email) VALUES (?, ?, ?, ?);
          SELECT * FROM Judge WHERE judge_id = LAST_INSERT_ID();
        `, [name, court_name, phone || null, email || null]);
        return ok(res, created[0] || {});
      }

      if (judgeMatch && method === 'PUT') {
        const judgeId = judgeMatch[1];
        const body = await parseJsonBody(req);
        const { name, court_name, phone, email } = body;
        await query(
          'UPDATE Judge SET name=?, court_name=?, phone=?, email=? WHERE judge_id=?',
          [name, court_name, phone || null, email || null, judgeId]
        );
        const updated = await query('SELECT * FROM Judge WHERE judge_id=?', [judgeId]);
        return ok(res, updated[0] || {});
      }

      if (judgeMatch && method === 'DELETE') {
        const judgeId = judgeMatch[1];
        await query('DELETE FROM Judge WHERE judge_id=?', [judgeId]);
        return ok(res, { deleted: true });
      }

      // ── Cases ──────────────────────────────────────────────────────────────
      if (pathname === '/api/cases' && method === 'GET') {
        const rows = await query(`
          SELECT lc.*,
                 cl.name AS client_name,
                 GROUP_CONCAT(DISTINCT l.name ORDER BY l.name SEPARATOR ', ') AS lawyers
          FROM LegalCase lc
          JOIN Client cl ON lc.client_id = cl.client_id
          LEFT JOIN Works_On wo ON lc.case_id = wo.case_id
          LEFT JOIN Lawyer   l  ON wo.lawyer_id = l.lawyer_id
          GROUP BY lc.case_id
          ORDER BY lc.filing_date DESC
        `);
        return ok(res, rows);
      }

      const caseMatch = pathname.match(/^\/api\/cases\/(\d+)$/);
      if (caseMatch && method === 'GET') {
        const caseId = caseMatch[1];
        const [caseRows, lawyers, hearings, payments] = await Promise.all([
          query(`
            SELECT lc.*, cl.name AS client_name, cl.email AS client_email, cl.phone AS client_phone
            FROM LegalCase lc
            JOIN Client cl ON lc.client_id = cl.client_id
            WHERE lc.case_id=?
          `, [caseId]),
          query(`
            SELECT l.* FROM Lawyer l
            JOIN Works_On wo ON l.lawyer_id = wo.lawyer_id
            WHERE wo.case_id=?
          `, [caseId]),
          query(`
            SELECT h.*, j.name AS judge_name, j.court_name
            FROM Hearing h
            JOIN Judge j ON h.judge_id = j.judge_id
            WHERE h.case_id=?
            ORDER BY h.hearing_date ASC
          `, [caseId]),
          query(`
            SELECT p.*, cl.name AS client_name
            FROM Payment p
            JOIN Client cl ON p.client_id = cl.client_id
            WHERE p.case_id=?
            ORDER BY p.payment_date DESC
          `, [caseId])
        ]);

        if (!caseRows.length) return err(res, 'Case not found', 404);
        return ok(res, { ...caseRows[0], lawyers, hearings, payments });
      }

      if (pathname === '/api/cases' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { client_id, title, case_type, description, status, filing_date, court_name, lawyer_ids } = body;
        if (!client_id || !title) return err(res, 'client_id and title are required', 400);

        const lastCase = await query(`
          INSERT INTO LegalCase (client_id, title, case_type, description, status, filing_date, court_name) VALUES (?, ?, ?, ?, ?, ?, ?);
          SELECT LAST_INSERT_ID() AS case_id;
        `, [client_id, title, case_type || null, description || null, status || 'Pending', filing_date || null, court_name || null]);
        
        const newCaseId = lastCase[0]?.case_id;

        if (Array.isArray(lawyer_ids) && lawyer_ids.length && newCaseId) {
          for (const lid of lawyer_ids) {
            await query('INSERT IGNORE INTO Works_On (lawyer_id, case_id) VALUES (?, ?)', [lid, newCaseId]);
          }
        }

        const fullCase = await query(`
          SELECT lc.*, cl.name AS client_name
          FROM LegalCase lc
          JOIN Client cl ON lc.client_id = cl.client_id
          WHERE lc.case_id=?
        `, [newCaseId]);
        return ok(res, fullCase[0] || lastCase[0] || {});
      }

      if (caseMatch && method === 'PUT') {
        const caseId = caseMatch[1];
        const body = await parseJsonBody(req);
        const { client_id, title, case_type, description, status, filing_date, court_name, lawyer_ids } = body;

        await query(
          'UPDATE LegalCase SET client_id=?, title=?, case_type=?, description=?, status=?, filing_date=?, court_name=? WHERE case_id=?',
          [client_id, title, case_type || null, description || null, status || 'Pending', filing_date || null, court_name || null, caseId]
        );

        if (Array.isArray(lawyer_ids)) {
          await query('DELETE FROM Works_On WHERE case_id=?', [caseId]);
          for (const lid of lawyer_ids) {
            await query('INSERT IGNORE INTO Works_On (lawyer_id, case_id) VALUES (?, ?)', [lid, caseId]);
          }
        }

        const updated = await query(`
          SELECT lc.*, cl.name AS client_name
          FROM LegalCase lc
          JOIN Client cl ON lc.client_id = cl.client_id
          WHERE lc.case_id=?
        `, [caseId]);
        return ok(res, updated[0] || {});
      }

      if (caseMatch && method === 'DELETE') {
        const caseId = caseMatch[1];
        await query('DELETE FROM Works_On WHERE case_id=?', [caseId]);
        await query('DELETE FROM LegalCase WHERE case_id=?', [caseId]);
        return ok(res, { deleted: true });
      }

      // ── Hearings ───────────────────────────────────────────────────────────
      if (pathname === '/api/hearings' && method === 'GET') {
        const rows = await query(`
          SELECT h.*,
                 lc.title AS case_title, lc.case_type, lc.status AS case_status,
                 j.name AS judge_name, j.court_name,
                 cl.name AS client_name
          FROM Hearing h
          JOIN LegalCase lc ON h.case_id  = lc.case_id
          JOIN Judge     j  ON h.judge_id = j.judge_id
          JOIN Client    cl ON lc.client_id = cl.client_id
          ORDER BY h.hearing_date ASC, h.hearing_time ASC
        `);
        return ok(res, rows);
      }

      const hearingMatch = pathname.match(/^\/api\/hearings\/(\d+)$/);
      if (hearingMatch && method === 'GET') {
        const hearingId = hearingMatch[1];
        const rows = await query(`
          SELECT h.*, lc.title AS case_title, j.name AS judge_name, j.court_name
          FROM Hearing h
          JOIN LegalCase lc ON h.case_id  = lc.case_id
          JOIN Judge     j  ON h.judge_id = j.judge_id
          WHERE h.hearing_id=?
        `, [hearingId]);
        if (!rows.length) return err(res, 'Hearing not found', 404);
        return ok(res, rows[0]);
      }

      if (pathname === '/api/hearings' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { case_id, judge_id, hearing_date, hearing_time, location, notes } = body;
        if (!case_id || !judge_id || !hearing_date || !hearing_time) {
          return err(res, 'case_id, judge_id, hearing_date, hearing_time are required', 400);
        }
        const created = await query(`
          INSERT INTO Hearing (case_id, judge_id, hearing_date, hearing_time, location, notes) VALUES (?, ?, ?, ?, ?, ?);
          SELECT h.*, lc.title AS case_title, j.name AS judge_name, j.court_name
          FROM Hearing h
          JOIN LegalCase lc ON h.case_id  = lc.case_id
          JOIN Judge     j  ON h.judge_id = j.judge_id
          WHERE h.hearing_id = LAST_INSERT_ID();
        `, [case_id, judge_id, hearing_date, hearing_time, location || null, notes || null]);
        return ok(res, created[0] || {});
      }

      if (hearingMatch && method === 'PUT') {
        const hearingId = hearingMatch[1];
        const body = await parseJsonBody(req);
        const { case_id, judge_id, hearing_date, hearing_time, location, notes } = body;
        await query(
          'UPDATE Hearing SET case_id=?, judge_id=?, hearing_date=?, hearing_time=?, location=?, notes=? WHERE hearing_id=?',
          [case_id, judge_id, hearing_date, hearing_time, location || null, notes || null, hearingId]
        );
        const updated = await query(`
          SELECT h.*, lc.title AS case_title, j.name AS judge_name, j.court_name
          FROM Hearing h
          JOIN LegalCase lc ON h.case_id  = lc.case_id
          JOIN Judge     j  ON h.judge_id = j.judge_id
          WHERE h.hearing_id=?
        `, [hearingId]);
        return ok(res, updated[0] || {});
      }

      if (hearingMatch && method === 'DELETE') {
        const hearingId = hearingMatch[1];
        await query('DELETE FROM Hearing WHERE hearing_id=?', [hearingId]);
        return ok(res, { deleted: true });
      }

      // ── Payments ───────────────────────────────────────────────────────────
      if (pathname === '/api/payments' && method === 'GET') {
        const rows = await query(`
          SELECT p.*,
                 cl.name AS client_name,
                 lc.title AS case_title, lc.case_type
          FROM Payment p
          JOIN Client    cl ON p.client_id = cl.client_id
          JOIN LegalCase lc ON p.case_id   = lc.case_id
          ORDER BY p.payment_date DESC
        `);
        return ok(res, rows);
      }

      const paymentMatch = pathname.match(/^\/api\/payments\/(\d+)$/);
      if (pathname === '/api/payments' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { client_id, case_id, amount, payment_date, method: payMethod, remarks } = body;
        if (!client_id || !case_id || !amount || !payment_date) {
          return err(res, 'client_id, case_id, amount, payment_date are required', 400);
        }
        const created = await query(`
          INSERT INTO Payment (client_id, case_id, amount, payment_date, method, remarks) VALUES (?, ?, ?, ?, ?, ?);
          SELECT p.*, cl.name AS client_name, lc.title AS case_title, lc.case_type
          FROM Payment p
          JOIN Client    cl ON p.client_id = cl.client_id
          JOIN LegalCase lc ON p.case_id   = lc.case_id
          WHERE p.payment_id = LAST_INSERT_ID();
        `, [client_id, case_id, amount, payment_date, payMethod || null, remarks || null]);
        return ok(res, created[0] || {});
      }

      if (paymentMatch && method === 'PUT') {
        const paymentId = paymentMatch[1];
        const body = await parseJsonBody(req);
        const { client_id, case_id, amount, payment_date, method: payMethod, remarks } = body;
        await query(
          'UPDATE Payment SET client_id=?, case_id=?, amount=?, payment_date=?, method=?, remarks=? WHERE payment_id=?',
          [client_id, case_id, amount, payment_date, payMethod || null, remarks || null, paymentId]
        );
        const updated = await query(`
          SELECT p.*, cl.name AS client_name, lc.title AS case_title, lc.case_type
          FROM Payment p
          JOIN Client    cl ON p.client_id = cl.client_id
          JOIN LegalCase lc ON p.case_id   = lc.case_id
          WHERE p.payment_id=?
        `, [paymentId]);
        return ok(res, updated[0] || {});
      }

      if (paymentMatch && method === 'DELETE') {
        const paymentId = paymentMatch[1];
        await query('DELETE FROM Payment WHERE payment_id=?', [paymentId]);
        return ok(res, { deleted: true });
      }

      // ── Reports ────────────────────────────────────────────────────────────
      if (pathname === '/api/reports/cases' && method === 'GET') {
        const status = searchParams.get('status');
        const case_type = searchParams.get('case_type');
        let sql = `
          SELECT lc.*, cl.name AS client_name,
                 GROUP_CONCAT(DISTINCT l.name SEPARATOR ', ') AS lawyers
          FROM LegalCase lc
          JOIN Client cl ON lc.client_id = cl.client_id
          LEFT JOIN Works_On wo ON lc.case_id   = wo.case_id
          LEFT JOIN Lawyer   l  ON wo.lawyer_id = l.lawyer_id
          WHERE 1=1
        `;
        const params = [];
        if (status && status !== 'all') {
          sql += ' AND lc.status=?';
          params.push(status);
        }
        if (case_type && case_type !== 'all') {
          sql += ' AND lc.case_type=?';
          params.push(case_type);
        }
        sql += ' GROUP BY lc.case_id ORDER BY lc.filing_date DESC';
        const rows = await query(sql, params);
        return ok(res, rows);
      }

      if (pathname === '/api/reports/payments' && method === 'GET') {
        const payMethod = searchParams.get('method');
        let sql = `
          SELECT p.*, cl.name AS client_name, lc.title AS case_title
          FROM Payment p
          JOIN Client    cl ON p.client_id = cl.client_id
          JOIN LegalCase lc ON p.case_id   = lc.case_id
          WHERE 1=1
        `;
        const params = [];
        if (payMethod && payMethod !== 'all') {
          sql += ' AND p.method=?';
          params.push(payMethod);
        }
        sql += ' ORDER BY p.payment_date DESC';
        const rows = await query(sql, params);
        return ok(res, rows);
      }

      if (pathname === '/api/reports/hearings' && method === 'GET') {
        const rows = await query(`
          SELECT h.*, lc.title AS case_title, j.name AS judge_name, j.court_name, cl.name AS client_name
          FROM Hearing h
          JOIN LegalCase lc ON h.case_id  = lc.case_id
          JOIN Judge     j  ON h.judge_id = j.judge_id
          JOIN Client    cl ON lc.client_id = cl.client_id
          ORDER BY h.hearing_date DESC
        `);
        return ok(res, rows);
      }

      return err(res, 'Endpoint not found', 404);
    } catch (e) {
      return err(res, e);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STATIC FILE SERVING
  // ══════════════════════════════════════════════════════════════════════════
  if (method === 'GET' || method === 'HEAD') {
    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '') safePath = '/index.html';

    let filePath = path.join(STATIC_DIR, safePath);

    fs.stat(filePath, (statErr, stats) => {
      if (statErr || !stats.isFile()) {
        // Fallback to index.html for SPA client-side routes
        const fallbackIndex = path.join(STATIC_DIR, 'index.html');
        fs.readFile(fallbackIndex, (fbErr, content) => {
          if (fbErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('File not found');
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        });
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Cache-Control': 'no-cache',
      });

      if (method === 'HEAD') return res.end();
      fs.createReadStream(filePath).pipe(res);
    });
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/plain' });
  res.end('Method Not Allowed');
});

// ── Startup & Verification ───────────────────────────────────────────────────
(async () => {
  try {
    const test = await query('SELECT DATABASE() AS db, COUNT(*) AS client_count FROM Client');
    console.log(`✅ MySQL connected → Database: ${test[0]?.db || DB_NAME} (${test[0]?.client_count || 0} Clients found)`);
  } catch (e) {
    console.warn(`⚠️ MySQL startup check notice: ${e.message}`);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 JurisCore running on http://localhost:${PORT}`);
    console.log(`   API endpoints available at http://localhost:${PORT}/api/`);
    console.log(`   Live MySQL data source: ${DB_NAME}`);
  });
})();
