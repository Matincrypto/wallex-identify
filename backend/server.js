// backend/server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001; // پورت ۳۰۰۱

app.use(cors());
app.use(express.json());
// پوشه آپلودها عمومی شود تا ادمین بتواند عکس‌ها را ببیند
app.use('/uploads', express.static('uploads'));

// تنظیمات ذخیره فایل
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // افزودن timestamp برای یکتا شدن نام فایل
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// دریافت لیست درخواست‌ها (برای پنل ادمین)
app.get('/api/submissions', (req, res) => {
    db.query('SELECT * FROM submissions ORDER BY submissionDate DESC', (err, results) => {
        if (err) return res.status(500).json(err);

        // تبدیل رشته‌های JSON فایل‌ها به آبجکت واقعی برای فرانت
        const parsedResults = results.map(row => {
            let files = {};
            try {
                // تلاش می‌کنیم ستون فایل‌ها را که به صورت متن ذخیره کردیم، دوباره به آبجکت تبدیل کنیم
                files = JSON.parse(row.filePaths || '{}');
            } catch (e) { console.error(e) }

            return {
                ...row,
                files: files,
                hasOldShenasname: !!row.hasOldShenasname // تبدیل عدد به بولین
            };
        });

        res.json(parsedResults);
    });
});

// ثبت درخواست جدید
// upload.any() یعنی هر فایلی با هر نامی آمد قبول کن
app.post('/api/submissions', upload.any(), (req, res) => {
    const { email, relationship, hasOldShenasname } = req.body;

    // تبدیل آرایه فایل‌های دریافتی به یک آبجکت ساده (نام فیلد -> مسیر فایل)
    const filePaths = {};
    if (req.files) {
        req.files.forEach(file => {
            // آدرس کامل فایل برای دسترسی از مرورگر
            filePaths[file.fieldname] = `http://localhost:${PORT}/${file.path.replace(/\\/g, '/')}`;
        });
    }

    const hasOldVal = (hasOldShenasname === 'true' || hasOldShenasname === '1') ? 1 : 0;
    const filesJson = JSON.stringify(filePaths); // فایل‌ها را به صورت متن JSON ذخیره می‌کنیم

    // نکته: ما ساختار جدول را کمی تغییر دادیم تا منعطف‌تر شود.
    // اگر جدول قبلی را دارید، بهتر است یک بار آن را پاک کنید و دوباره بسازید یا از این کوئری استفاده کنید.
    // اما برای اینکه با جدول فعلی شما کار کند، ما فایل‌ها را در ستون‌های موجود پخش می‌کنیم یا یک ستون جدید نیاز داریم.

    // بیایید فرض کنیم شما ستون idCardPath و shenasnamePath دارید.
    // ما همه فایل‌ها را در یک ستون جدید به نام `file_paths` ذخیره می‌کنیم.
    // *لطفا قبل از اجرا، یک بار جدول را Drop کنید و با کد جدیدی که در پایین پیام می‌دهم بسازید*

    const sql = `INSERT INTO submissions (email, relationship, hasOldShenasname, filePaths, status) VALUES (?, ?, ?, ?, 'Pending')`;

    db.query(sql, [email, relationship, hasOldVal, filesJson], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database Error' });
        }
        res.status(201).json({ message: 'Submission successful', id: result.insertId });
    });
});

// آپدیت وضعیت (تایید/رد)
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