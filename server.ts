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
      'role_permissions', 'users', 'recycle_bin'
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
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error saving key "${key}" to JSON DB file:`, err);
    throw err;
  }
}

/**
 * Backend API Endpoints
 */

// 1. Get entire dataset
app.get('/api/data', async (req, res) => {
  try {
    const data = await getAllData();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Synchronize entire payload
app.post('/api/sync', async (req, res) => {
  try {
    const payload = req.body;
    if (payload && typeof payload === 'object') {
      const promises = Object.keys(payload).map(key => setValue(key, payload[key]));
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
    await setValue(key, value);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Authenticate Users / Staff Logins
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Core default match from client logic
    if (email === 'jamiaarabiasirajululoomjabori@gmail.com' && password === 'jamiaarabiasirajululoomjabori') {
      return res.json({ success: true, user: { username: 'Admin', role: 'Admin' } });
    }

    // Check custom roles in users dataset
    const data = await getAllData();
    const users = data.users || [];
    const found = users.find((u: any) => u.email === email && u.password === password);
    
    if (found) {
      res.json({ success: true, user: { username: found.name || email, role: found.role || 'User' } });
    } else {
      res.status(401).json({ success: false, error: 'يوزر نیم یا پاسورڈ غلط ہے۔' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Save or create student
app.post('/api/add-student', async (req, res) => {
  try {
    const student = req.body;
    const data = await getAllData();
    const students = data.students || [];

    // Assign dynamic key-id if temporary or missing
    if (!student.id || String(student.id).startsWith('temp-')) {
      student.id = Date.now();
    }

    const idx = students.findIndex((s: any) => String(s.id) === String(student.id) || s.regNo === student.regNo);
    if (idx >= 0) {
      students[idx] = { ...students[idx], ...student };
    } else {
      students.push(student);
    }

    await setValue('students', students);
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
      const existing = data.students || [];
      const updated = [...existing];
      
      parsedRows.forEach((row: any) => {
        const student = {
          id: row.id || Date.now() + Math.floor(Math.random() * 10000),
          name: row.name || row['نام'] || '',
          fatherName: row.fatherName || row['ولدیت'] || '',
          regNo: String(row.regNo || row['رجسٹریشن نمبر'] || row.id || ''),
          rollNo: String(row.rollNo || row['رول نمبر'] || ''),
          class: row.class || row['درجہ'] || row['کلاس'] || '',
          fatherPhone: row.fatherPhone || row['رابطہ نمبر'] || '',
          dob: row.dob || '',
          address: row.address || row['پتہ'] || '',
          admissionDate: row.admissionDate || new Date().toLocaleDateString()
        };
        
        const idx = updated.findIndex(s => s.regNo === student.regNo);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], ...student };
        } else {
          updated.push(student);
        }
      });
      
      await setValue('students', updated);
    } else if (type === 'staff') {
      const existing = data.staff || [];
      const updated = [...existing];

      parsedRows.forEach((row: any) => {
        const staffMember = {
          id: row.id || Date.now() + Math.floor(Math.random() * 10000),
          name: row.name || row['نام'] || '',
          fatherName: row.fatherName || row['ولدیت'] || '',
          designation: row.designation || row['عہدہ'] || '',
          phone: row.phone || row['رابطہ نمبر'] || '',
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

      await setValue('staff', updated);
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
    const data = await getAllData();
    const existing = data.saved_salaries || [];
    
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

    await setValue('saved_salaries', updated);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Generate Fee Collection daily summaries
app.get('/api/fees-collection-report', async (req, res) => {
  try {
    const data = await getAllData();
    const savedFees = data.saved_fees || [];
    
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
    const data = await getAllData();
    const savedFees = data.saved_fees || [];
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
    if (!feeTransaction.id) {
      feeTransaction.id = Date.now();
    }
    if (!feeTransaction.date) {
      feeTransaction.date = new Date().toISOString();
    }

    const data = await getAllData();
    const existing = data.saved_fees || [];
    
    const updated = [...existing, feeTransaction];
    await setValue('saved_fees', updated);
    res.json({ success: true });
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
