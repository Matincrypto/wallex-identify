const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
// دسترسی عمومی به پوشه آپلودها (برای اینکه عکس‌ها لود شوند)
app.use('/uploads', express.static('uploads'));

// تنظیمات ذخیره فایل
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // نام فایل را یکتا می‌کنیم
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// دریافت لیست درخواست‌ها
app.get('/api/submissions', (req, res) => {
    db.query('SELECT * FROM submissions ORDER BY submissionDate DESC', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        const parsedResults = results.map(row => {
            let files = {};
            try {
                // تلاش برای تبدیل رشته JSON به آبجکت
                files = typeof row.filePaths === 'string' ? JSON.parse(row.filePaths) : row.filePaths;
            } catch (e) { files = {} }

            return {
                ...row,
                files: files,
                hasOldShenasname: !!row.hasOldShenasname
            };
        });

        res.json(parsedResults);
    });
});

// ثبت درخواست جدید
app.post('/api/submissions', upload.any(), (req, res) => {
    const { email, relationship, hasOldShenasname } = req.body;

    const filePaths = {};
    if (req.files) {
        req.files.forEach(file => {
            // اصلاح مهم: ذخیره به صورت آدرس نسبی
            // این باعث می‌شود عکس هم در لوکال و هم در سرور درست نمایش داده شود
            filePaths[file.fieldname] = `/uploads/${file.filename}`;
        });
    }

    const hasOldVal = (hasOldShenasname === 'true' || hasOldShenasname === '1') ? 1 : 0;
    const filesJson = JSON.stringify(filePaths);

    const sql = `INSERT INTO submissions (email, relationship, hasOldShenasname, filePaths, status) VALUES (?, ?, ?, ?, 'Pending')`;

    db.query(sql, [email, relationship, hasOldVal, filesJson], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database Error' });
        }
        res.status(201).json({ message: 'Submission successful', id: result.insertId });
    });
});

// تغییر وضعیت (تایید/رد)
app.put('/api/submissions/:id/status', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    db.query('UPDATE submissions SET status = ? WHERE id = ?', [status, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Status updated' });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});