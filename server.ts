import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import * as XLSX from 'xlsx';
import multer from 'multer';

const app = express();
const PORT = 3000;

// Setup in-memory file uploads
const upload = multer();

// Ensure db directory is writeable and open database via JSON
const DB_PATH = path.join(process.cwd(), 'madrassa.db');

// Initialize database file with valid JSON structure if it doesn't exist
// or if it was partially corrupted or empty
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({}), 'utf-8');
} else {
  try {
    const existingContent = fs.readFileSync(DB_PATH, 'utf-8').trim();
    if (!existingContent || (!existingContent.startsWith('{') && !existingContent.startsWith('['))) {
      fs.writeFileSync(DB_PATH, JSON.stringify({}), 'utf-8');
    }
  } catch (e) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}), 'utf-8');
  }
}

// Configure Express middlewares
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

/**
 * Helper to get all database records as a merged object
 */
async function getAllData(): Promise<any> {
  try {
    let raw = '{}';
    if (fs.existsSync(DB_PATH)) {
      raw = fs.readFileSync(DB_PATH, 'utf-8');
    }
    const data = JSON.parse(raw || '{}');

    // Maintain guaranteed fallback collections
    const SYNC_KEYS = [
      'students', 'staff', 'system_settings', 'website_settings',
      'website_fatawa', 'website_gallery', 'website_gallery_categories',
      'books', 'grades', 'results', 'saved_salaries', 'saved_fees',
      'role_permissions', 'users', 'recycle_bin', 'licensed_madrasas'
    ];
    SYNC_KEYS.forEach(k => {
      if (data[k] === undefined) {
        data[k] = (k === 'system_settings' || k === 'website_settings') ? {} : [];
      }
    });

    return data;
  } catch (err) {
    console.error('Error reading JSON DB file:', err);
    return {};
  }
}

/**
 * Helper to set a specific key-value in database
 */
async function setValue(key: string, value: any): Promise<void> {
  try {
    const data = await getAllData();
    data[key] = value;
    const tempPath = DB_PATH + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_PATH);
  } catch (err) {
    console.error(`Error saving key "${key}" to JSON DB file:`, err);
    throw err;
  }
}

/**
 * Backend API Endpoints
 */

// 1. Get entire dataset with tenant-aware isolation
app.get('/api/data', async (req, res) => {
  try {
    const data = await getAllData();
    const madrassaId = req.headers['x-madrassa-id'] as string | undefined;

    if (!madrassaId || madrassaId === 'master' || madrassaId === 'undefined') {
      res.json(data);
    } else {
      // Build tenant specific isolated data subset
      const tenantData: Record<string, any> = {};
      const prefix = `${madrassaId}_`;

      const SYNC_KEYS = [
        'students', 'staff', 'system_settings', 'website_settings',
        'website_fatawa', 'website_gallery', 'website_gallery_categories',
        'books', 'grades', 'results', 'saved_salaries', 'saved_fees',
        'role_permissions', 'users', 'recycle_bin'
      ];

      SYNC_KEYS.forEach(k => {
        const tenantKey = prefix + k;
        if (data[tenantKey] !== undefined) {
          tenantData[k] = data[tenantKey];
        } else {
          // Robust fallback structures for brand new madrasas
          if (k === 'system_settings') {
            tenantData[k] = {
              jamiaName: 'جامعہ نئی رجسٹرڈ',
              registrationPrefix: 'JAMIA-',
              contactNumber: '',
              academicYear: '1445',
              passingMarks: 40,
              minAttendance: 75,
              monogram: ''
            };
          } else if (k === 'website_settings') {
            tenantData[k] = {};
          } else {
            tenantData[k] = [];
          }
        }
      });

      // Keep licensed_madrasas list available to tenant's own reference if needed,
      // but only empty list to maintain compatibility or empty users
      tenantData['licensed_madrasas'] = [];
      res.json(tenantData);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Synchronize entire payload
app.post('/api/sync', async (req, res) => {
  try {
    const payload = req.body;
    if (payload && typeof payload === 'object') {
      const madrassaId = req.headers['x-madrassa-id'] as string | undefined;
      const prefix = madrassaId && madrassaId !== 'master' && madrassaId !== 'undefined' ? `${madrassaId}_` : '';

      const promises = Object.keys(payload).map(key => {
        // licensed_madrasas is super-admin global and cannot be isolated/prefixed
        if (key === 'licensed_madrasas') {
          return setValue(key, payload[key]);
        }
        return setValue(prefix + key, payload[key]);
      });
      await Promise.all(promises);
      res.json({ success: true, message: 'Sync completed successfully' });
    } else {
      res.status(400).json({ error: 'Invalid sync payload' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Save single key
app.post('/api/save-key', async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'Missing core "key"' });
    
    const madrassaId = req.headers['x-madrassa-id'] as string | undefined;
    const prefix = madrassaId && madrassaId !== 'master' && madrassaId !== 'undefined' ? `${madrassaId}_` : '';
    
    // licensed_madrasas is a global collection
    const targetKey = key === 'licensed_madrasas' ? key : (prefix + key);
    await setValue(targetKey, value);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Authenticate Users / Staff Logins with custom License integration
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Core default match from client logic (Super Admin)
    if (email === 'abdulrehmanhabib.com@gmail.com' && (password === 'abdulrehmanadmin' || password === 'abdulrehmanhabib')) {
      return res.json({ success: true, user: { username: 'Admin', role: 'Admin', isSuperAdmin: true } });
    }

    // Check custom roles in users dataset and all tenant _users datasets
    const data = await getAllData();
    let foundSubUser: any = null;
    let foundMadrassaId: string | null = null;

    // Check global/master users key
    const globalUsers = data.users || [];
    const foundGlobal = globalUsers.find((u: any) => 
      (u.email === email || u.username === email) && u.password === password
    );

    if (foundGlobal) {
      foundSubUser = foundGlobal;
    } else {
      // Look through all keys ending with '_users'
      for (const key of Object.keys(data)) {
        if (key.endsWith('_users')) {
          const tenantUsers = data[key] || [];
          const matched = tenantUsers.find((u: any) => 
            (u.email === email || u.username === email) && u.password === password
          );
          if (matched) {
            foundSubUser = matched;
            foundMadrassaId = key.replace('_users', '');
            break;
          }
        }
      }
    }

    if (foundSubUser) {
      if (foundSubUser.status === 'rejected') {
        return res.status(403).json({ success: false, error: 'آپ کا اکاؤنٹ مسترد کر دیا گیا ہے۔' });
      }
      if (foundSubUser.status !== 'accepted') {
        return res.status(403).json({ success: false, error: 'آپ کا اکاؤنٹ ابھی ایڈمن کی منظوری کا منتظر ہے۔' });
      }

      let jamiaName = 'جامعہ عربیہ سراج العلوم';
      let expiryDate = '';
      let allowedModules = ['dashboard', 'students', 'all_students', 'attendance', 'academics', 'exams', 'paper_maker', 'paper_uploader', 'finance', 'staff', 'settings'];

      if (foundMadrassaId) {
        // Fetch specific madrassa name and details
        const tenantSettings = data[`${foundMadrassaId}_system_settings`];
        if (tenantSettings && tenantSettings.jamiaName) {
          jamiaName = tenantSettings.jamiaName;
        }

        const madrasas = data.licensed_madrasas || [];
        const m = madrasas.find((x: any) => x.id === foundMadrassaId);
        if (m) {
          if (m.status === 'inactive') {
            return res.status(403).json({ success: false, error: 'یہ اکاؤنٹ معطل یا غیر فعال ہے۔ براہ کرم سپر ایڈمن سے رابطہ کریں۔' });
          }
          if (m.madrassaName && !tenantSettings?.jamiaName) {
            jamiaName = m.madrassaName;
          }
          expiryDate = m.expiryDate;
          allowedModules = m.allowedModules || allowedModules;
        }
      }

      return res.json({ 
        success: true, 
        user: { 
          username: foundSubUser.username || foundSubUser.email || foundSubUser.name || email, 
          role: foundSubUser.role || 'Teacher',
          status: foundSubUser.status || 'pending',
          paymentStatus: foundSubUser.paymentStatus || 'unpaid',
          madrassaId: foundMadrassaId || undefined,
          jamiaName,
          expiryDate,
          allowedModules
        } 
      });
    }

    // Check in licensed_madrasas (SaaS Multi-tenant License)
    const madrasas = data.licensed_madrasas || [];
    const foundMadrassa = madrasas.find((m: any) => m.email === email && m.password === password);
    if (foundMadrassa) {
      if (foundMadrassa.status === 'inactive') {
        return res.status(403).json({ success: false, error: 'یہ اکاؤنٹ معطل یا غیر فعال ہے۔ براہ کرم سپر ایڈمن سے رابطہ کریں۔' });
      }
      const expiry = new Date(foundMadrassa.expiryDate);
      if (expiry < new Date()) {
        return res.status(403).json({ success: false, error: 'آپ کا سالانہ سافٹ ویئر لائسنس ختم ہو چکا ہے۔ برائے مہربانی تجدید کے لیے رابطہ کریں۔' });
      }
      return res.json({
        success: true,
        user: {
          username: foundMadrassa.madrassaName,
          role: 'Admin',
          madrassaId: foundMadrassa.id,
          jamiaName: foundMadrassa.madrassaName,
          expiryDate: foundMadrassa.expiryDate,
          allowedModules: foundMadrassa.allowedModules
        }
      });
    }

    res.status(401).json({ success: false, error: 'یوزر نیم یا پاسورڈ غلط ہے۔' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Save or create student with robust indexing and tenant safety
app.post('/api/add-student', async (req, res) => {
  try {
    const student = req.body;
    const madrassaId = req.headers['x-madrassa-id'] as string | undefined;
    const prefix = madrassaId && madrassaId !== 'master' && madrassaId !== 'undefined' ? `${madrassaId}_` : '';

    const data = await getAllData();
    const studentsKey = `${prefix}students`;
    const students = data[studentsKey] || [];

    // Assign dynamic key-id if temporary or missing
    if (!student.id || String(student.id).startsWith('temp-')) {
      student.id = Date.now();
    }

    const idx = students.findIndex((s: any) => {
      const matchId = String(s.id) === String(student.id);
      const hasRegNo = student.regNo && String(student.regNo).trim() !== '';
      const matchRegNo = hasRegNo && s.regNo && String(s.regNo).trim() === String(student.regNo).trim();
      return matchId || matchRegNo;
    });

    if (idx >= 0) {
      students[idx] = { ...students[idx], ...student };
    } else {
      students.push(student);
    }

    await setValue(studentsKey, students);
    res.json({ success: true, id: student.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Excel Data Uploader
app.post('/api/upload-excel', async (req, res) => {
  try {
    const { fileData, type } = req.body;
    if (!fileData) return res.status(400).json({ error: 'No Excel file data found' });

    const madrassaId = req.headers['x-madrassa-id'] as string | undefined;
    const prefix = madrassaId && madrassaId !== 'master' && madrassaId !== 'undefined' ? `${madrassaId}_` : '';

    // Extract Base64 binary
    const base64Index = fileData.indexOf(';base64,');
    const base64Clean = base64Index >= 0 ? fileData.slice(base64Index + 8) : fileData;
    const buffer = Buffer.from(base64Clean, 'base64');

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetRaw = workbook.Sheets[sheetName];
    const parsedRows: any[] = XLSX.utils.sheet_to_json(sheetRaw);

    const data = await getAllData();

    if (type === 'student') {
      const studentsKey = `${prefix}students`;
      const existing = data[studentsKey] || [];
      const updated = [...existing];
      
      parsedRows.forEach((row: any, index: number) => {
        const randomSalt = Math.floor(Math.random() * 1000000);
        const stId = row.id || `${Date.now()}-${index}-${randomSalt}`;
        
        let fileRegNo = row.regNo || row['رجسٹریشن نمبر'] || row['رجسٹریشن'] || row.id || '';
        const isGenerated = !fileRegNo;
        if (!fileRegNo) {
          fileRegNo = `REG-${stId}`;
        }

        const student = {
          id: stId,
          name: row.name || row['نام'] || '',
          fatherName: row.fatherName || row['ولدیت'] || '',
          regNo: String(fileRegNo),
          rollNo: String(row.rollNo || row['رول نمبر'] || ''),
          class: row.class || row['درجہ'] || row['کلاس'] || '',
          fatherPhone: row.fatherPhone || row['رابطہ نمبر'] || row.phone || row['فون'] || '',
          dob: row.dob || '',
          address: row.address || row['پتہ'] || row.district || row['ضلع'] || '',
          admissionDate: row.admissionDate || new Date().toLocaleDateString()
        };
        
        const idx = !isGenerated ? updated.findIndex(s => String(s.regNo) === String(student.regNo)) : -1;
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], ...student };
        } else {
          updated.push(student);
        }
      });
      
      await setValue(studentsKey, updated);
    } else if (type === 'staff') {
      const staffKey = `${prefix}staff`;
      const existing = data[staffKey] || [];
      const updated = [...existing];

      parsedRows.forEach((row: any, index: number) => {
        const randomSalt = Math.floor(Math.random() * 1000000);
        const staffId = row.id || `${Date.now()}-${index}-${randomSalt}`;
        const staffMember = {
          id: staffId,
          name: row.name || row['نام'] || '',
          fatherName: row.fatherName || row['ولدیت'] || '',
          designation: row.designation || row['عہدہ'] || '',
          phone: row.phone || row['رابطہ نمبر'] || row.phone || row['فون'] || '',
          basicSalary: Number(row.basicSalary || row['بنیادی تنخواہ'] || 0),
          joiningDate: row.joiningDate || new Date().toLocaleDateString()
        };
        
        const idx = updated.findIndex(s => s.name === staffMember.name && s.fatherName === staffMember.fatherName);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], ...staffMember };
        } else {
          updated.push(staffMember);
        }
      });

      await setValue(staffKey, updated);
    }

    res.json({ success: true, message: 'فائل کامیابی سے اپلوڈ اور مرج کر دی گئی ہے۔' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Save calculated slip salaries
app.post('/api/save-salary', async (req, res) => {
  try {
    const salaries = req.body; // Can be a single slip or array
    const madrassaId = req.headers['x-madrassa-id'] as string | undefined;
    const prefix = madrassaId && madrassaId !== 'master' && madrassaId !== 'undefined' ? `${madrassaId}_` : '';

    const data = await getAllData();
    const salariesKey = `${prefix}saved_salaries`;
    const existing = data[salariesKey] || [];
    
    let updated = [...existing];
    if (Array.isArray(salaries)) {
      salaries.forEach(s => {
        if (!s.id) s.id = Date.now() + Math.floor(Math.random() * 1000);
        updated.push(s);
      });
    } else {
      if (!salaries.id) salaries.id = Date.now();
      updated.push(salaries);
    }

    await setValue(salariesKey, updated);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Generate Fee Collection daily summaries
app.get('/api/fees-collection-report', async (req, res) => {
  try {
    const madrassaId = req.headers['x-madrassa-id'] as string | undefined;
    const prefix = madrassaId && madrassaId !== 'master' && madrassaId !== 'undefined' ? `${madrassaId}_` : '';

    const data = await getAllData();
    const feesKey = `${prefix}saved_fees`;
    const savedFees = data[feesKey] || [];
    
    const todayStr = new Date().toLocaleDateString();
    
    // Filter matching today's fee collections
    const todayTransactions = savedFees.filter((f: any) => {
      if (!f.date) return false;
      const fDateStr = new Date(f.date).toLocaleDateString();
      return fDateStr === todayStr;
    });

    const sumTotal = todayTransactions.reduce((acc: number, f: any) => acc + (Number(f.totalPaid) || 0), 0);
    res.json({ dailyTotal: sumTotal, count: todayTransactions.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Fetch historic fees for a single registration number
app.get('/api/student-fees/:regNo', async (req, res) => {
  try {
    const { regNo } = req.params;
    const madrassaId = req.headers['x-madrassa-id'] as string | undefined;
    const prefix = madrassaId && madrassaId !== 'master' && madrassaId !== 'undefined' ? `${madrassaId}_` : '';

    const data = await getAllData();
    const feesKey = `${prefix}saved_fees`;
    const savedFees = data[feesKey] || [];
    const matching = savedFees.filter((f: any) => String(f.regNo) === String(regNo));
    res.json(matching);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Save individual fee payment
app.post('/api/save-fee', async (req, res) => {
  try {
    const feeTransaction = req.body;
    const madrassaId = req.headers['x-madrassa-id'] as string | undefined;
    const prefix = madrassaId && madrassaId !== 'master' && madrassaId !== 'undefined' ? `${madrassaId}_` : '';

    if (!feeTransaction.id) {
      feeTransaction.id = Date.now();
    }
    if (!feeTransaction.date) {
      feeTransaction.date = new Date().toISOString();
    }

    const data = await getAllData();
    const feesKey = `${prefix}saved_fees`;
    const existing = data[feesKey] || [];
    
    const updated = [...existing, feeTransaction];
    await setValue(feesKey, updated);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Trigger admission email alert
app.post('/api/trigger-admission-email', async (req, res) => {
  try {
    const { admissionData } = req.body;
    console.log('[NOTIFICATION] New admission request triggered by server action:', admissionData);
    
    // In a production app, use an email service SDK here (e.g., nodemailer with SMTP or SendGrid/Mailgun)
    res.json({ success: true, message: 'Email notification triggered.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Download copy of DB file (raw database.sqlite/madrassa.db)
app.get('/api/export-db', (req, res) => {
  res.download(DB_PATH, 'madrassa.db', (err) => {
    if (err) {
      console.error('File export failure:', err);
    }
  });
});

app.get('/api/backup', (req, res) => {
  res.download(DB_PATH, 'madrassa_backup.db');
});

// 12. Reset and Import DB File
app.post('/api/import-db', upload.single('db_file'), (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'کوئی فائل موصول نہیں ہوئی۔' });
    }

    fs.writeFile(DB_PATH, req.file.buffer, (writeErr) => {
      if (writeErr) {
        console.error('File write issues:', writeErr);
        return res.status(500).json({ success: false, error: 'فائل محفوظ کرنے میں خرابی پیش آئی۔' });
      }
      res.json({ success: true });
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Backdoor restore of JSON schema
app.post('/api/restore', upload.single('db_file'), (req, res) => {
  // Gracefully routes back to db restore
  res.redirect(307, '/api/import-db');
});

/**
 * Start Server with Vite Dev Server Middleware or Static Build Loading
 */
async function run() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FULLSTACK ENGINE] Server booted successfully on http://0.0.0.0:${PORT}`);
  });
}

run().catch(err => {
  console.error('[CRITICAL] Boot failed:', err);
});
