const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 4000;

app.use(cors());

// serve images
// Maps http://localhost:4000/images/Folder/File -> server/SMI/Folder/File
app.use('/images', express.static(path.join(__dirname, 'SMI'), {
    maxAge: '30d', // Images change rarely, cache longer
    etag: true,
    lastModified: true
}));

const dbPath = path.resolve(__dirname, 'smi.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error connecting to database:', err.message);
    else console.log('Connected to the smi database.');
});

// --- APIs ---

// 1. Staff
app.get('/api/staff', (req, res) => {
    const role = req.query.role;
    let sql = 'SELECT * FROM staff';
    const params = [];
    if (role) {
        sql += ' WHERE role = ?';
        params.push(role);
    }
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', data: rows });
    });
});

// 2. Notices
app.get('/api/notices', (req, res) => {
    // Return latest first. Using ID desc as a proxy for recency if date parsing is complex in SQL
    db.all('SELECT * FROM notice ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', data: rows });
    });
});

// 3. Assets
app.get('/api/assets', (req, res) => {
    const category = req.query.category;
    let sql = 'SELECT * FROM assets';
    const params = [];
    if (category) {
        sql += ' WHERE category = ?';
        params.push(category);
    }
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', data: rows });
    });
});

// 4. Toppers
app.get('/api/toppers', (req, res) => {
    // Join with studentinfo to get details
    const sql = `
        SELECT t.position, s.name, s.class, s.section, s.img 
        FROM topper t
        JOIN studentinfo s ON t.stdId = s.stdId
        ORDER BY t.position ASC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'success', data: rows });
    });
});

// 5. Birthdays
app.get('/api/birthdays', (req, res) => {
    // Get all students and staff
    const sqlStaff = "SELECT name, designation as role, dob, img FROM staff";
    const sqlStudent = "SELECT name, class || ' - ' || section as role, dob, img FROM studentinfo";

    db.all(sqlStaff, [], (err, staffRows) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all(sqlStudent, [], (err, studentRows) => {
            if (err) return res.status(500).json({ error: err.message });

            const allPeople = [...staffRows, ...studentRows];
            const today = new Date();
            const todayMonth = today.getMonth() + 1; // 1-12
            const todayDay = today.getDate();

            // Helper to parse date
            const parseDate = (dateStr) => {
                if (!dateStr) return null;
                // Handle YYYY-MM-DD
                if (dateStr.includes('-')) {
                    const parts = dateStr.split('-');
                    return { m: parseInt(parts[1]), d: parseInt(parts[2]) };
                }
                // Handle DD/MM/YYYY
                if (dateStr.includes('/')) {
                    const parts = dateStr.split('/');
                    return { m: parseInt(parts[1]), d: parseInt(parts[0]) };
                }
                return null;
            };

            const birthdaysToday = [];
            const upcomingBirthdays = [];

            allPeople.forEach(p => {
                const parsed = parseDate(p.dob);
                if (!parsed) return;

                if (parsed.m === todayMonth && parsed.d === todayDay) {
                    birthdaysToday.push(p);
                }

                // Calc days until next birthday for upcoming logic
                let nextBday = new Date(today.getFullYear(), parsed.m - 1, parsed.d);
                if (nextBday < today) {
                    nextBday.setFullYear(today.getFullYear() + 1);
                }
                const diffTime = Math.abs(nextBday - today);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Only consider reasonable upcoming (e.g. within 30 days) or just collect all 
                // and sort later if we need "closest". 
                // Code asks for "closest upcoming birthday" if no birthday today.
                p.daysUntil = diffDays;
                upcomingBirthdays.push(p);
            });

            if (birthdaysToday.length > 0) {
                res.json({ message: 'success', type: 'today', data: birthdaysToday });
            } else {
                // Sort by daysUntil
                upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);
                // Return top 3
                const closest = upcomingBirthdays.slice(0, 3);
                res.json({ message: 'success', type: 'upcoming', data: closest });
            }
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
