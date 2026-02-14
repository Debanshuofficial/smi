// Early scroll reset and hash clearing to prevent browser native jumps
if (window.location.hash === '#home') {
    history.replaceState('', document.title, window.location.pathname + window.location.search);
}
window.scrollTo({ top: 0, behavior: 'instant' });

// Fetch Helper using CONFIG
async function fetchData(endpoint, returnFull = false) {
    try {
        const response = await fetch(CONFIG.getEndpoint(endpoint));
        if (!response.ok) {
            // If it's a 500 error, it's likely a database connection issue from server
            if (response.status === 500) {
                showDatabaseError();
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return returnFull ? result : (result.data || []);
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        // Show floating message box for any fetch/network/server errors
        showDatabaseError();
        return returnFull ? { data: [] } : [];
    }
}

// Global Helper for Database Errors
function showDatabaseError() {
    const errorMsg = document.getElementById('db-error-msg');
    if (errorMsg) {
        errorMsg.classList.add('show');
    }
}

// Staff Loading Functions (merged from staff_loader.js)
async function loadStaffData() {
    try {
        const staffList = await fetchData(CONFIG.ENDPOINTS.STAFF);
        if (staffList.length > 0) {
            renderStaff(staffList);
        }
    } catch (error) {
        console.error('Error loading staff:', error);
    }
}

function renderStaff(staffList) {
    const teachingContainer = document.getElementById('teaching-staff-grid');
    const nonTeachingContainer = document.getElementById('non-teaching-staff-grid');
    const adminContainer = document.getElementById('admin-staff-grid');
    const bodContainer = document.getElementById('bod-staff-grid');

    if (teachingContainer) teachingContainer.innerHTML = '';
    if (nonTeachingContainer) nonTeachingContainer.innerHTML = '';
    if (adminContainer) adminContainer.innerHTML = '';
    if (bodContainer) bodContainer.innerHTML = '';

    staffList.forEach(staff => {
        const role = staff.role.toLowerCase();
        const imgSrc = CONFIG.getImageUrl(staff.img);

        if (role === 'ts') {
            createStaffCard(staff, teachingContainer, imgSrc);
        } else if (role === 'nts') {
            createStaffCard(staff, nonTeachingContainer, imgSrc, 'secondary');
        } else if (role === 'adm') {
            createStaffCard(staff, adminContainer, imgSrc, 'neutral');
        } else if (role === 'bod') {
            createStaffCard(staff, bodContainer, imgSrc);
        } else if (role === 'p') {
            updatePrincipal(staff, imgSrc);
        } else if (role === 'f') {
            updateFounder(staff, imgSrc);
        }
    });
}

function createStaffCard(staff, container, imgSrc, variantClass = '') {
    if (!container) return;

    const card = document.createElement('div');
    card.className = `glass-card staff-card ${variantClass}`;

    card.innerHTML = `
        <img src="${imgSrc}" alt="${staff.name}" class="staff-img" width="220" height="280" loading="lazy" decoding="async" onerror="this.src='assets/img/placeholder.jpg'">
        <div class="staff-info">
            <h4>${staff.name}</h4>
            <p class="designation">${staff.designation}</p>
        </div>
    `;

    container.appendChild(card);
}

function updatePrincipal(staff, imgSrc) {
    const principalImg = document.querySelector('.principal-msg-card .principal-img');
    const principalName = document.querySelector('.principal-msg-card h4');

    if (principalImg) {
        principalImg.src = imgSrc;
        principalImg.onerror = () => { principalImg.src = CONFIG.getStaticImage('placeholder'); };
    }

    if (principalName) {
        principalName.textContent = staff.name;
    }
}

function updateFounder(staff, imgSrc) {
    const founderImg = document.querySelector('.founder-msg-card .founder-img');
    const founderName = document.getElementById('founder-name');
    const founderMsg = document.getElementById('founder-msg');

    if (founderImg) {
        founderImg.src = imgSrc;
        founderImg.onerror = () => { founderImg.src = CONFIG.getStaticImage('placeholder'); };
    }

    if (founderName) {
        founderName.textContent = staff.name;
    }

    if (founderMsg) {
        founderMsg.textContent = staff.designation || "Dedicated to excellence in education.";
    }
}

function initStaticImages() {
    // Update logo
    const logos = document.querySelectorAll('.site-logo, .loading-logo');
    logos.forEach(logo => {
        logo.src = CONFIG.getStaticImage('logo');
    });

    // Update highlights and broken images
    const highlightImg = document.querySelector('.todays-highlight img');
    if (highlightImg && highlightImg.getAttribute('src') === 'img1.jpeg') {
        highlightImg.src = CONFIG.getStaticImage('placeholder');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try { initClock(); } catch (e) { console.error("Clock Error:", e); }
    try { initDayStatus(); } catch (e) { console.error("Day Status Error:", e); }
    try { initNavigation(); } catch (e) { console.error("Nav Error:", e); }
    try { initStaticImages(); } catch (e) { console.error("Static Img Error:", e); }
    // Theme is now handled by theme.js but called here to ensure order if bundled. 
    // Assuming initTheme is globally available or imported.
    if (typeof initTheme === 'function') {
        try { initTheme(); } catch (e) { console.error("Theme Error:", e); }
    }

    // Async Data Loading
    (async () => {
        try { await initSlider(); } catch (e) { console.error("Slider Error:", e); }
        try { await loadRealData(); } catch (e) { console.error("Data Load Error:", e); }
        try { await loadStaffData(); } catch (e) { console.error("Staff Load Error:", e); }
        try { await initFacilityGallery(); } catch (e) { console.error("Gallery Error:", e); }

        // Hide loading screen after data loads
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 500);
    })();

    try { initCounters(); } catch (e) { console.error("Counter Error:", e); }
    try { initAcademicProgress(); } catch (e) { console.error("Progress Error:", e); }
    try { initImageErrorHandling(); } catch (e) { console.error("Img Error Handler Error:", e); }

    // Failsafe: Remove any remaining spinners after 2 seconds
    setTimeout(() => {
        const spinners = document.querySelectorAll('.loading-spinner');
        spinners.forEach(s => {
            s.style.display = 'none';
            if (s.parentElement.innerText.trim() === '') {
                s.parentElement.innerHTML = '<p class="text-muted">Content unavailable (Timeout)</p>';
            }
        });

        // Failsafe for ticker
        const ticker = document.getElementById('status-ticker');
        if (ticker && ticker.textContent.includes("Loading")) {
            ticker.textContent = "Welcome to Suresh Memorial Institute! (Data Loading...)";
        }
    }, 4000); // Increased timeout for fetch

    // CRITICAL: Force scroll to top after ALL initializations are done
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    const forceTop = () => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    };

    forceTop();
    requestAnimationFrame(forceTop);
    [50, 100, 250, 500].forEach(delay => setTimeout(forceTop, delay));
});

function initImageErrorHandling() {
    window.addEventListener('error', function (e) {
        if (e.target.tagName === 'IMG') {
            e.target.onerror = null;
            e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.target.style.backgroundColor = '#ffffff';
            e.target.style.objectFit = 'contain';
            if (!e.target.style.height && !e.target.getAttribute('height')) {
                e.target.style.height = '200px';
                e.target.style.width = '100%';
            }
            e.target.alt = 'Image unavailable';
        }
    }, true);
}

/* --- Image Slider --- */
async function initSlider() {
    const sliderWrapper = document.getElementById('image-slider');
    if (!sliderWrapper) return;

    // Fetch slider images from backend
    // Filter assets where category='slider' OR we can pick random ones if backend logic supported
    // For now, simpler to fetch all assets and filter, or ask backend for specific category.
    // My backend supports ?category=slider
    const slidesData = await fetchData('assets?category=slider');

    if (slidesData.length > 0) {
        sliderWrapper.innerHTML = '';
        slidesData.forEach((slide, index) => {
            const div = document.createElement('div');
            div.className = `slide ${index === 0 ? 'active' : ''}`;
            const imgUrl = CONFIG.getImageUrl(slide.img);
            div.style.backgroundImage = `url('${imgUrl}')`;

            div.innerHTML = `
                <div class="slide-content">
                    <h2>${slide.title || 'Excellence in Education'}</h2>
                    <p>Suresh Memorial Institute</p>
                </div>
            `;
            sliderWrapper.appendChild(div);
        });
    }

    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const intervalTime = 5000;

    function nextSlide() {
        if (slides.length === 0) return;
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    if (slides.length > 1) {
        setInterval(nextSlide, intervalTime);
    }
}

/* --- Live Clock & Date --- */
function initClock() {
    const clockElement = document.getElementById('live-clock');
    if (!clockElement) return;

    function updateClock() {
        const now = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', options);
        const timeString = now.toLocaleTimeString('en-US', { hour12: true });
        clockElement.innerHTML = `<div class="clock-time">${timeString}</div><div class="clock-date" style="font-size:0.75em; opacity:0.8;">${dateString}</div>`;
    }

    setInterval(updateClock, 1000);
    updateClock();
}

/* --- Day Status Ticker --- */
function initDayStatus() {
    const ticker = document.getElementById('status-ticker');
    if (!ticker) return;
    const now = new Date();
    const day = now.getDay();
    let statusMsg = "Welcome to Suresh Memorial Institute! ";
    if (day === 0) statusMsg += "Today is Sunday - Holiday. ";
    else statusMsg += "Regular Classes are in session. ";
    statusMsg += " | Upcoming: Annual Exams start in 15 days. | Admission Open. ";
    ticker.textContent = statusMsg;
}

/* --- Navigation --- */
function initNavigation() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('main section');

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    function showSection(targetId, isInitial = false) {
        const id = targetId.replace('#', '');
        sections.forEach(sec => {
            sec.style.display = 'none';
            sec.classList.remove('active-section');
        });
        const targetSection = document.getElementById(id);
        if (targetSection) {
            targetSection.style.display = 'block';
            setTimeout(() => targetSection.classList.add('active-section'), 10);
            if (!isInitial) window.scrollTo(0, 0);
        }
        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) link.classList.add('active');
        });
        if (isInitial && id === 'home' && !window.location.hash) return;

        if (isInitial) {
            if (history.replaceState) history.replaceState(null, null, '#' + id);
        } else {
            if (history.pushState) history.pushState(null, null, '#' + id);
            else location.hash = '#' + id;
        }
    }
    const initialSection = window.location.hash || '#home';
    showSection(initialSection, true);
    window.addEventListener('load', () => {
        if (!window.location.hash || window.location.hash === '#home') {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    });
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            showSection(targetId);
            if (window.innerWidth <= 768) {
                navLinksContainer.classList.remove('active');
                if (toggle) toggle.classList.remove('active');
            }
        });
    });
    window.addEventListener('hashchange', () => {
        showSection(window.location.hash || '#home');
    });
    if (toggle) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinksContainer.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
            if (navLinksContainer.classList.contains('active')) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        });
        document.addEventListener('click', (e) => {
            if (navLinksContainer.classList.contains('active')) {
                if (!navLinksContainer.contains(e.target) && !toggle.contains(e.target)) {
                    navLinksContainer.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                    toggle.classList.remove('active');
                }
            }
        });
    }
}

window.openTab = function (evt, tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
        tabContents[i].classList.remove("active");
    }
    const tabBtns = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabBtns.length; i++) {
        tabBtns[i].className = tabBtns[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    document.getElementById(tabName).classList.add("active");
}

/* --- Real Data Loader --- */
async function loadRealData() {
    // 1. Toppers
    const toppers = await fetchData('toppers');
    const leaderboardList = document.getElementById('leaderboard-list');
    if (leaderboardList) {
        leaderboardList.innerHTML = '';
        if (toppers.length === 0) {
            leaderboardList.innerHTML = '<p style="color:var(--text-muted); text-align:center;">No data available.</p>';
        } else {
            // Use infinite scroll if more than 3 items
            if (toppers.length > 3) {
                const scrollWrapper = document.createElement('div');
                scrollWrapper.className = 'scroll-wrapper';
                const displayList = [...toppers, ...toppers]; // Duplicate for seamless scroll

                displayList.forEach(student => {
                    const item = document.createElement('div');
                    item.className = 'leaderboard-item';
                    item.innerHTML = `
                        <div style="display:flex; align-items:center; gap:15px; width:100%;">
                            <img src="${CONFIG.getImageUrl(student.img)}" alt="${student.name}" class="leaderboard-img" width="70" height="70" loading="lazy" decoding="async">
                            <div style="flex-grow:1;">
                                <strong style="color:var(--text-main); display:block; font-size:1rem;">${student.name}</strong>
                                <div style="font-size:0.8rem; color:var(--text-muted);">Class: ${student.class}</div>
                            </div>
                            <div class="rank-badge">${student.position}</div>
                        </div>
                    `;
                    scrollWrapper.appendChild(item);
                });
                leaderboardList.appendChild(scrollWrapper);
            } else {
                // Regular list without scrolling
                toppers.forEach(student => {
                    const item = document.createElement('div');
                    item.className = 'leaderboard-item';
                    item.innerHTML = `
                        <div style="display:flex; align-items:center; gap:15px; width:100%;">
                            <img src="${CONFIG.getImageUrl(student.img)}" alt="${student.name}" class="leaderboard-img" width="70" height="70" loading="lazy" decoding="async">
                            <div style="flex-grow:1;">
                                <strong style="color:var(--text-main); display:block; font-size:1rem;">${student.name}</strong>
                                <div style="font-size:0.8rem; color:var(--text-muted);">Class: ${student.class}</div>
                            </div>
                            <div class="rank-badge">${student.position}</div>
                        </div>
                    `;
                    leaderboardList.appendChild(item);
                });
            }
        }
    }

    // 2. Birthdays
    const bdayResult = await fetchData('birthdays', true);
    // Format: { type: 'today'|'upcoming', data: [...] }
    const birthdayContainer = document.getElementById('birthday-container');
    if (birthdayContainer) {
        birthdayContainer.innerHTML = '';
        if (!bdayResult.data || bdayResult.data.length === 0) {
            birthdayContainer.innerHTML = '<p style="text-align:center; color:var(--text-muted);">No birthday data.</p>';
        } else {
            if (bdayResult.type === 'today') {
                // Show Today's birthdays with conditional infinite scroll
                if (bdayResult.data.length > 3) {
                    const scrollWrapper = document.createElement('div');
                    scrollWrapper.className = 'scroll-wrapper';
                    const list = [...bdayResult.data, ...bdayResult.data];

                    list.forEach(person => {
                        const card = document.createElement('div');
                        card.className = 'birthday-card-item skyshot-card';
                        card.innerHTML = `
                            <img src="${CONFIG.getImageUrl(person.img)}" alt="${person.name}" class="birthday-img" width="70" height="70" loading="lazy" decoding="async" style="z-index: 2;">
                            <div style="z-index: 2; position: relative;">
                                <div style="color: #ffd700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); font-weight: 700; font-size: 0.9rem; margin-bottom: 0.3rem;">
                                    Happy Birthday! <i class="fa-solid fa-cake-candles" style="color: #fff; filter: drop-shadow(0 0 5px #fff) drop-shadow(0 0 10px #ffd700);"></i> 🎂
                                </div>
                                <strong style="display:block; color:var(--text-main); font-size:1.1rem;">${person.name}</strong>
                                <div style="font-size:0.85rem; color:var(--text-muted); font-weight: 500; margin-top: 0.2rem;">
                                    ${person.role}
                                </div>
                            </div>
                        `;
                        scrollWrapper.appendChild(card);
                    });
                    birthdayContainer.appendChild(scrollWrapper);
                } else {
                    bdayResult.data.forEach(person => {
                        const card = document.createElement('div');
                        card.className = 'birthday-card-item skyshot-card';
                        card.innerHTML = `
                            <img src="${CONFIG.getImageUrl(person.img)}" alt="${person.name}" class="birthday-img" width="70" height="70" loading="lazy" decoding="async" style="z-index: 2;">
                            <div style="z-index: 2; position: relative;">
                                <div style="color: #ffd700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); font-weight: 700; font-size: 0.9rem; margin-bottom: 0.3rem;">
                                    Happy Birthday! <i class="fa-solid fa-cake-candles" style="color: #fff; filter: drop-shadow(0 0 5px #fff) drop-shadow(0 0 10px #ffd700);"></i> 🎂
                                </div>
                                <strong style="display:block; color:var(--text-main); font-size:1.1rem;">${person.name}</strong>
                                <div style="font-size:0.85rem; color:var(--text-muted); font-weight: 500; margin-top: 0.2rem;">
                                    ${person.role}
                                </div>
                            </div>
                        `;
                        birthdayContainer.appendChild(card);
                    });
                }
            } else {
                // Show upcoming
                birthdayContainer.innerHTML = `
                <p style="text-align:center; color:var(--text-muted); font-size:0.9rem; margin-bottom:1rem;">No birthdays today.</p>
                <div style="border-top:1px solid var(--glass-border); padding-top:0.5rem;">
                    <h5 style="color:var(--secondary-accent); margin-bottom:0.5rem;">Upcoming Birthdays:</h5>
                    <!-- Items inserted below -->
                </div>
                `;
                const listContainer = birthdayContainer.querySelector('div'); // the div we just added

                bdayResult.data.forEach(person => {
                    const item = document.createElement('div');
                    item.className = 'birthday-card-item';
                    item.style.opacity = '0.9';
                    // Parse date for display icon
                    let dayDisp = "??";
                    if (person.dob.includes('/')) dayDisp = person.dob.split('/')[0];
                    else if (person.dob.includes('-')) dayDisp = person.dob.split('-')[2];

                    item.innerHTML = `
                         <div class="birthday-icon-wrapper" style="background:none; border:1px solid var(--glass-border);">
                            <span style="font-size:0.8rem; font-weight:bold;">${dayDisp}</span>
                        </div>
                        <div>
                            <strong style="display:block; color:var(--text-main); font-size:0.9rem;">${person.name} (${person.role})</strong>
                            <div style="font-size:0.75rem; opacity:0.8;">In ${person.daysUntil} Days</div>
                        </div>
                    `;
                    listContainer.appendChild(item);
                });
            }
        }
    }

    // 3. Notices
    const notices = await fetchData('notices');
    const noticeList = document.getElementById('notice-list');
    if (noticeList) {
        noticeList.innerHTML = '';
        if (notices.length === 0) {
            noticeList.innerHTML = '<li>No notices available.</li>';
        } else {
            // Show latest first (assuming higher ID or naturally coming in order, reverse for safety)
            notices.reverse().slice(0, 10).forEach(n => {
                const li = document.createElement('li');
                // Extract DD Month from date "DD/MM/YYYY" or "YYYY-MM-DD"
                // Assuming stored as DD/MM/YYYY from populate_db
                let dateDisplay = n.date;
                // Try to make it look nicer e.g. "12 Feb"
                // Parse?
                // Simple regex for DD/MM/YYYY
                const parts = n.date.split('/');
                if (parts.length === 3) {
                    const dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
                    dateDisplay = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                }

                li.innerHTML = `
                    <div class="notice-item-wrapper">
                        <span class="date">${dateDisplay}</span>
                        <div class="notice-main-content">
                            <strong>${n.title}</strong>
                            <p>${n.content}</p>
                        </div>
                        <a href="${CONFIG.getImageUrl(n.file_path || 'assets/pdf/notice.pdf')}" class="notice-download-btn" download>
                            <i class="fa-solid fa-download"></i>
                            <span class="download-text">Download</span>
                        </a>
                    </div>
                `;

                noticeList.appendChild(li);
            });
        }
    }
}

/* --- Counters --- */
function initCounters() {
    const counterCard = document.getElementById('counter-card');
    if (!counterCard) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = counterCard.querySelectorAll('.counter-value');
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000;
                    const increment = target / (duration / 16);
                    let current = 0;
                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCounter();
                });
                observer.unobserve(counterCard);
            }
        });
    }, { threshold: 0.5 });
    observer.observe(counterCard);
}

/* --- Progress --- */
function initAcademicProgress() {
    const progressBarFill = document.getElementById('academic-progress-fill');
    const percentageText = document.getElementById('academic-year-percentage');
    if (!progressBarFill || !percentageText) return;
    const ACADEMIC_START_MONTH = 3;
    const ACADEMIC_START_DAY = 1;
    const ACADEMIC_END_MONTH = 2;
    const ACADEMIC_END_DAY = 31;
    const now = new Date();
    const currentYear = now.getFullYear();
    let startYear = currentYear;
    if (now.getMonth() < ACADEMIC_START_MONTH) {
        startYear = currentYear - 1;
    }
    const startDate = new Date(startYear, ACADEMIC_START_MONTH, ACADEMIC_START_DAY);
    const endDate = new Date(startYear + 1, ACADEMIC_END_MONTH, ACADEMIC_END_DAY);
    const totalDuration = endDate - startDate;
    const elapsed = now - startDate;
    let percentage = (elapsed / totalDuration) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    setTimeout(() => {
        progressBarFill.style.width = percentage + '%';
        let current = 0;
        const updateNum = () => {
            current += percentage / 50;
            if (current < percentage) {
                percentageText.innerText = current.toFixed(1) + '%';
                requestAnimationFrame(updateNum);
            } else {
                percentageText.innerText = percentage.toFixed(1) + '%';
            }
        };
        updateNum();
    }, 500);
}

/* --- Facility Gallery --- */
async function initFacilityGallery() {
    // Categories matching index in HTML
    const catsAndTitles = [
        { cat: 'science', title: 'Science Labs', icon: 'fa-flask', color: 'var(--secondary-accent)', desc: 'Physics, Chemistry, and Biology labs.' },
        { cat: 'computer', title: 'Computer Lab', icon: 'fa-computer', color: 'var(--primary-accent)', desc: 'High-tech computer lab.' },
        { cat: 'library', title: 'Library', icon: 'fa-book', color: 'gold', desc: 'Vast collection of books.' },
        { cat: 'pg', title: 'Playground', icon: 'fa-futbol', color: '#10b981', desc: 'Large playground for sports.' },
        { cat: 'transport', title: 'Transport', icon: 'fa-bus', color: '#f97316', desc: 'Safe and reliable bus service.' },
        { cat: 'sp', title: 'Swimming Pool', icon: 'fa-person-swimming', color: '#06b6d4', desc: 'Well-maintained swimming pool.' }
    ];

    // Fetch All Assets
    const allAssets = await fetchData('assets');

    // Group
    const FACILITY_DATA = catsAndTitles.map(ct => {
        // Filter assets by category
        // Note: DB category might match 'science', 'computer', etc.
        const matches = allAssets.filter(a => a.category === ct.cat);
        const images = matches.length > 0 ? matches.map(m => CONFIG.getImageUrl(m.img)) : ['assets/img/placeholder.jpg'];

        return {
            title: ct.title,
            icon: ct.icon,
            color: ct.color,
            desc: ct.desc,
            images: images
        };
    });

    const wrapper = document.querySelector('.facilities-wrapper');
    const bubbleSidebar = document.getElementById('gallery-bubbles');
    const closeBtn = document.querySelector('.close-gallery-btn-inline');
    const sliderBox = document.getElementById('gallery-slider');
    const titleEl = document.getElementById('gallery-title');
    const descEl = document.getElementById('gallery-desc');
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');

    let currentFacilityIdx = 0;
    let currentSlideIdx = 0;
    let autoTimer = null;

    function renderActiveCategory(skipScroll = false) {
        if (!sliderBox) return;
        const data = FACILITY_DATA[currentFacilityIdx];
        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.textContent = data.desc;
        sliderBox.innerHTML = '';
        data.images.forEach((img, i) => {
            const slide = document.createElement('div');
            slide.className = `gallery-slide ${i === currentSlideIdx ? 'active' : ''}`;
            slide.style.backgroundImage = `url('${img}')`;
            sliderBox.appendChild(slide);
        });
        updateBubbles(skipScroll);
    }

    function updateBubbles(skipScroll) {
        if (!bubbleSidebar) return;
        bubbleSidebar.innerHTML = '';
        FACILITY_DATA.forEach((data, i) => {
            const bubble = document.createElement('div');
            bubble.className = `gallery-bubble ${i === currentFacilityIdx ? 'active' : ''}`;
            bubble.innerHTML = `<i class="fa-solid ${data.icon}" style="color: ${data.color}"></i>`;
            bubble.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                jumpTo(i);
            });
            bubbleSidebar.appendChild(bubble);
        });

        if (!skipScroll) {
            setTimeout(() => {
                const active = bubbleSidebar.querySelector('.gallery-bubble.active');
                if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }, 100);
        }
    }

    function move(dir) {
        const images = FACILITY_DATA[currentFacilityIdx].images;
        let nextIdx = currentSlideIdx + dir;
        if (nextIdx >= images.length) {
            currentFacilityIdx = (currentFacilityIdx + 1) % FACILITY_DATA.length;
            currentSlideIdx = 0;
            renderActiveCategory();
        } else if (nextIdx < 0) {
            currentFacilityIdx = (currentFacilityIdx - 1 + FACILITY_DATA.length) % FACILITY_DATA.length;
            currentSlideIdx = FACILITY_DATA[currentFacilityIdx].images.length - 1;
            renderActiveCategory();
        } else {
            currentSlideIdx = nextIdx;
            syncSlideVisibility();
        }
    }

    function syncSlideVisibility() {
        if (!sliderBox) return;
        const slides = sliderBox.querySelectorAll('.gallery-slide');
        slides.forEach((s, i) => s.classList.toggle('active', i === currentSlideIdx));
    }

    function jumpTo(idx) {
        currentFacilityIdx = idx;
        currentSlideIdx = 0;
        renderActiveCategory();
        resetAutoTimer();
    }

    function startAuto() {
        stopAuto();
        autoTimer = setTimeout(autoStep, 5000);
    }

    function autoStep() {
        if (!wrapper || !wrapper.classList.contains('gallery-mode')) return;
        move(1);
        autoTimer = setTimeout(autoStep, 5000);
    }

    function stopAuto() {
        if (autoTimer) {
            clearTimeout(autoTimer);
            autoTimer = null;
        }
    }

    function resetAutoTimer() {
        stopAuto();
        startAuto();
    }

    function open(idx) {
        currentFacilityIdx = idx;
        currentSlideIdx = 0;
        if (wrapper) wrapper.classList.add('gallery-mode');
        renderActiveCategory();
        startAuto();

        // Use requestAnimationFrame or slight timeout to ensure visibility toggle is processed
        setTimeout(() => {
            const target = document.getElementById('facilities');
            if (target) {
                const offset = 80; // Offset for header/padding
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = target.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }

    function close() {
        if (wrapper) wrapper.classList.remove('gallery-mode');
        stopAuto();
    }

    document.querySelectorAll('.view-facility-btn').forEach((btn, i) => {
        btn.addEventListener('click', (e) => { e.preventDefault(); open(i); });
    });

    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); close(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); move(1); resetAutoTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); move(-1); resetAutoTimer(); });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopAuto();
        else if (wrapper && wrapper.classList.contains('gallery-mode')) startAuto();
    });
}


/* --- Theme Toggle Logic --- */


