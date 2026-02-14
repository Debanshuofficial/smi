const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'smi.db');
const db = new sqlite3.Database(dbPath);

// Data Sources
const ASSETS_DIR = path.resolve(__dirname, 'SMI/smi');
const NOTICE_DIR = path.resolve(__dirname, 'SMI/notice');
const STUDENTS_DIR = path.resolve(__dirname, 'SMI/students');

// Helper to get files
function getFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(file => !file.startsWith('.'));
}

const assetsFiles = getFiles(ASSETS_DIR);
// If no assets found, use placeholders for logic verification, but prefer actual files if present
const studentFiles = getFiles(STUDENTS_DIR);
const noticeFiles = getFiles(NOTICE_DIR);

// Categories requested: 'science', 'computer', 'library', 'pg', 'transport', 'sp'
// Also 'slider' for home page
const ASSET_CATEGORIES = ['science', 'computer', 'library', 'pg', 'transport', 'sp'];

// Clear and Strings
db.serialize(() => {
    // 1. Drop existing tables to reset
    db.run("DROP TABLE IF EXISTS staff"); // Keep consistency if we are rebuilding
    db.run("DROP TABLE IF EXISTS notice");
    db.run("DROP TABLE IF EXISTS assets");
    db.run("DROP TABLE IF EXISTS studentinfo");
    db.run("DROP TABLE IF EXISTS topper");

    // 2. Create Tables
    db.run(`CREATE TABLE staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        designation TEXT,
        role TEXT,
        dob TEXT,
        img TEXT
    )`);

    db.run(`CREATE TABLE notice (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        date TEXT,
        content TEXT,
        file TEXT
    )`);

    db.run(`CREATE TABLE assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        category TEXT,
        img TEXT
    )`);

    db.run(`CREATE TABLE studentinfo (
        stdId TEXT PRIMARY KEY,
        name TEXT,
        class TEXT,
        section TEXT,
        dob TEXT,
        img TEXT
    )`);

    db.run(`CREATE TABLE topper (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stdId TEXT,
        position TEXT,
        FOREIGN KEY(stdId) REFERENCES studentinfo(stdId)
    )`);

    // 3. Populate Staff (Keep existing data)
    const staffData = [
        { name: 'Mr. A. Roy', designation: 'Senior Mathematics Teacher', role: 'ts', dob: '01/01/1980', img: 'staffs/p1.jpg' },
        { name: 'Mrs. B. Sen', designation: 'Head of Science Dept.', role: 'ts', dob: '15/05/1985', img: 'staffs/p2.jpg' },
        { name: 'Ms. K. Das', designation: 'English Literature', role: 'ts', dob: '20/11/1990', img: 'staffs/p3.jpg' },
        { name: 'Mr. R. Dutta', designation: 'History & Geography', role: 'ts', dob: '10/03/1988', img: 'staffs/p4.jpg' },
        { name: 'Mrs. S. Paul', designation: 'Bengali Language', role: 'ts', dob: '08/07/1982', img: 'staffs/p1.jpg' },
        { name: 'Mr. M. Khan', designation: 'Physical Education', role: 'ts', dob: '25/09/1992', img: 'staffs/p2.jpg' },
        { name: 'Mr. S. Biswas', designation: 'Lab Assistant', role: 'nts', dob: '08/07/1992', img: 'staffs/p3.jpg' },
        { name: 'Mrs. D. Kar', designation: 'Library Assistant', role: 'nts', dob: '25/09/1983', img: 'staffs/p4.jpg' },
        { name: 'Mr. R. Nath', designation: 'Security Head', role: 'nts', dob: '05/12/1975', img: 'staffs/p1.jpg' },
        { name: 'Mr. X. Ghosh', designation: 'Office Superintendent', role: 'adm', dob: '05/12/1975', img: 'staffs/p2.jpg' },
        { name: 'Mrs. Y. Mitra', designation: 'Accountant', role: 'adm', dob: '30/04/1982', img: 'staffs/p3.jpg' },
        { name: 'Mr. Z. Laskar', designation: 'Librarian', role: 'adm', dob: '08/08/1970', img: 'staffs/p4.jpg' },
        { name: 'Dr. S. Mukherjee', designation: 'President', role: 'bod', dob: '12/06/1960', img: 'staffs/p1.jpg' },
        { name: 'Mr. P. K. Das', designation: 'Secretary', role: 'bod', dob: '18/02/1965', img: 'staffs/p2.jpg' },
        { name: 'Mrs. R. Banerjee', designation: 'Treasurer', role: 'bod', dob: '08/08/1970', img: 'staffs/p3.jpg' },
        { name: 'Mr. S. Chatterjee', designation: 'Executive Member', role: 'bod', dob: '31/10/1950', img: 'staffs/p4.jpg' },
        { name: 'Mr. Tapan Kr. Nath', designation: 'Principal', role: 'p', dob: '01/01/1968', img: 'staffs/img1.jpeg' }
    ];

    const staffStmt = db.prepare("INSERT INTO staff (name, designation, role, dob, img) VALUES (?, ?, ?, ?, ?)");
    staffData.forEach(s => staffStmt.run(s.name, s.designation, s.role, s.dob, s.img));
    staffStmt.finalize();
    console.log("Staff populated.");

    // 4. Populate Notices
    // Create some dummy notices
    const notices = [
        { title: "Sports Day Registration", date: "12/02/2026", content: "Annual Sports Day Registration is now open for all classes.", file: "notice/sports_form.pdf" },
        { title: "Parent Teacher Meeting", date: "10/02/2026", content: "PTM for Class VI scheduled for this Saturday.", file: "" },
        { title: "Saraswati Puja Holiday", date: "05/02/2026", content: "School will remain closed on 14th Feb for Saraswati Puja.", file: "" },
        { title: "Annual Exam Schedule", date: "01/02/2026", content: "Annual Examination schedule has been published for Class V-VIII.", file: "notice/exam_schedule.pdf" },
        { title: "Debate Competition Win", date: "28/01/2026", content: "Debate team wins 1st prize at District Level!", file: "" }
    ];
    const noticeStmt = db.prepare("INSERT INTO notice (title, date, content, file) VALUES (?, ?, ?, ?)");
    notices.forEach(n => noticeStmt.run(n.title, n.date, n.content, n.file));
    noticeStmt.finalize();
    console.log("Notices populated.");

    // 5. Populate Assets
    // We use files from server/SMI/smi
    // We distribute them across categories.
    // Also assign some to 'slider'.
    const assetsStmt = db.prepare("INSERT INTO assets (title, category, img) VALUES (?, ?, ?)");

    if (assetsFiles.length > 0) {
        // Distribute files to categories
        assetsFiles.forEach((file, index) => {
            const category = ASSET_CATEGORIES[index % ASSET_CATEGORIES.length];
            const title = `Facility Image ${index + 1}`; // Generic title
            const imgPath = `smi/${file}`;

            assetsStmt.run(title, category, imgPath);

            // Also add some to slider (e.g., every 3rd image)
            if (index % 3 === 0) {
                assetsStmt.run(`Slide ${index}`, 'slider', imgPath);
            }
        });
    } else {
        // Fallback if folder empty: use placeholders
        const placeholderImgs = ['img1.jpeg', 'p1.jpg', 'p2.jpg', 'p3.jpg', 'p4.jpg'];
        placeholderImgs.forEach((img, index) => {
            ASSET_CATEGORIES.forEach(cat => {
                assetsStmt.run(`${cat} view`, cat, `smi/${img}`);
            });
            if (index < 3) assetsStmt.run(`Slider ${index}`, 'slider', `smi/${img}`);
        });
    }
    assetsStmt.finalize();
    console.log("Assets populated.");

    // 6. Populate Student Info
    const students = [
        { stdId: "S001", name: "Suman Das", class: "X", section: "A", dob: "14/02/2010" }, // Birthday today!
        { stdId: "S002", name: "Priya Roy", class: "XII", section: "B", dob: "15/02/2008" },
        { stdId: "S003", name: "Rahul Sen", class: "X", section: "A", dob: "20/05/2010" },
        { stdId: "S004", name: "Ananya Paul", class: "XII", section: "Science", dob: "10/08/2008" },
        { stdId: "S005", name: "Vikram Singh", class: "IX", section: "B", dob: "05/11/2011" },
        { stdId: "S006", name: "Megha Roy", class: "XI", section: "Arts", dob: "12/12/2009" },
        { stdId: "S007", name: "Sneha Das", class: "VI", section: "A", dob: "18/02/2014" },
        { stdId: "S008", name: "Arjun Das", class: "V", section: "C", dob: "14/02/2015" } // Another birthday today
    ];

    const studentStmt = db.prepare("INSERT INTO studentinfo (stdId, name, class, section, dob, img) VALUES (?, ?, ?, ?, ?, ?)");
    students.forEach((s, i) => {
        // Use available student images or fallback
        const imgFile = studentFiles.length > 0 ? studentFiles[i % studentFiles.length] : `p${(i % 4) + 1}.jpg`;
        // Note: p1-p4 are available in staffs/ folder in reality, but assuming mapped correctly or users will add files.
        // For safely, let's point to 'staffs/p...' if students folder is empty, just for demo?
        // No, user said "img source from students folder". I will stick to 'students/' path.
        // If file doesn't exist, the UI will just show alt text or broken image (which script.js handles).
        studentStmt.run(s.stdId, s.name, s.class, s.section, s.dob, `students/${imgFile}`);
    });
    studentStmt.finalize();
    console.log("Students populated.");

    // 7. Populate Toppers
    const topperStmt = db.prepare("INSERT INTO topper (stdId, position) VALUES (?, ?)");
    topperStmt.run("S001", "1st");
    topperStmt.run("S002", "1st");
    topperStmt.run("S003", "2nd");
    topperStmt.run("S004", "2nd");
    topperStmt.finalize();
    console.log("Toppers populated.");

});

db.close(() => console.log('Database population completed.'));
