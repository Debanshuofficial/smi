// Early scroll reset and hash clearing to prevent browser native jumps
if (window.location.hash === '#home') {
    history.replaceState('', document.title, window.location.pathname + window.location.search);
}
window.scrollTo({ top: 0, behavior: 'instant' });

document.addEventListener('DOMContentLoaded', () => {
    try { initClock(); } catch (e) { console.error("Clock Error:", e); }
    try { initDayStatus(); } catch (e) { console.error("Day Status Error:", e); }
    try { initNavigation(); } catch (e) { console.error("Nav Error:", e); }
    try { initSlider(); } catch (e) { console.error("Slider Error:", e); }

    // Critical: Load content
    try { loadMockData(); } catch (e) { console.error("Mock Data Error:", e); }

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
            ticker.textContent = "Welcome to Suresh Memorial Institute! (Status Update Pending)";
        }
    }, 2000);

    // CRITICAL: Force scroll to top after ALL initializations are done
    // This overrides browser anchor jumping and layout shifts during loading
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    const forceTop = () => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    };

    // Call immediately and at intervals to ensure layout has settled
    forceTop();
    requestAnimationFrame(forceTop);
    [50, 100, 250, 500].forEach(delay => setTimeout(forceTop, delay));
});

function initImageErrorHandling() {
    window.addEventListener('error', function (e) {
        if (e.target.tagName === 'IMG') {
            e.target.onerror = null; // Prevent loops

            // Request: "fill with white color... but acquire the space"
            e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent 1x1
            e.target.style.backgroundColor = '#ffffff';
            e.target.style.objectFit = 'contain';

            // Ensure strict dimensions so it doesn't collapse
            // If no inline height/width, force a default to hold space
            if (!e.target.style.height && !e.target.getAttribute('height')) {
                e.target.style.height = '200px';
                e.target.style.width = '100%';
            }
            e.target.alt = 'Image unavailable';
        }
    }, true); // Capture phase
}

/* --- Image Slider --- */
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const intervalTime = 5000; // 5 seconds

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    if (slides.length > 0) {
        setInterval(nextSlide, intervalTime);
    }
}

/* --- Live Clock & Date --- */
function initClock() {
    const clockElement = document.getElementById('live-clock');

    function updateClock() {
        const now = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const dateString = now.toLocaleDateString('en-US', options);
        const timeString = now.toLocaleTimeString('en-US', { hour12: true });
        clockElement.innerHTML = `<span style="font-size:0.8em; opacity:0.8; margin-right:5px;">${dateString}</span> ${timeString}`;
    }

    setInterval(updateClock, 1000);
    updateClock();
}

/* --- Day Status Ticker --- */
function initDayStatus() {
    const ticker = document.getElementById('status-ticker');
    const now = new Date();
    const day = now.getDay();

    let statusMsg = "Welcome to Suresh Memorial Institute! ";

    if (day === 0) {
        statusMsg += "Today is Sunday - Holiday. ";
    } else {
        statusMsg += "Regular Classes are in session. ";
    }

    statusMsg += " | Upcoming: Annual Exams start in 15 days. | Admission Open for 2026 session. | Bus Service Route 5 Changed.";

    ticker.textContent = statusMsg;
}

/* --- Navigation & Mobile Menu --- */
function initNavigation() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('main section');

    // Prevent browser from restoring scroll position on refresh
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Function to show specific section
    function showSection(targetId, isInitial = false) {
        // Remove hash from ID if present
        const id = targetId.replace('#', '');

        // Hide all sections
        sections.forEach(sec => {
            sec.style.display = 'none';
            sec.classList.remove('active-section');
        });

        // Show target section
        const targetSection = document.getElementById(id);
        if (targetSection) {
            targetSection.style.display = 'block';
            setTimeout(() => targetSection.classList.add('active-section'), 10);

            // Scroll to top when switching sections
            // For initial load, we handle this globally at the end of script.js and window.onload
            // to avoid competing with browser native anchor jumping.
            if (!isInitial) {
                window.scrollTo(0, 0);
            }
        }

        // Update Nav Active State
        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
            }
        });

        // Update URL hash for persistence on refresh
        // 1. If it's the initial load of home and there was no hash, don't add one (keeps URL clean)
        if (isInitial && id === 'home' && !window.location.hash) {
            return;
        }

        // 2. Use replaceState for initial load to avoid back-button history loops
        if (isInitial) {
            if (history.replaceState) {
                history.replaceState(null, null, '#' + id);
            }
        } else {
            // 3. Normal pushState for manual clicks
            if (history.pushState) {
                history.pushState(null, null, '#' + id);
            } else {
                location.hash = '#' + id;
            }
        }
    }

    // Check for hash in URL on load, otherwise default to Home
    const initialSection = window.location.hash || '#home';
    showSection(initialSection, true);

    // Global Scroll Reset Failsafe - Catch any post-render shifts
    window.addEventListener('load', () => {
        if (!window.location.hash || window.location.hash === '#home') {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    });

    // Handle Link Clicks
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            showSection(targetId);

            // Close Mobile Menu
            if (window.innerWidth <= 768) {
                navLinksContainer.classList.remove('active');
                const icon = toggle ? toggle.querySelector('i') : null;
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });

    // Handle hashchange for back/forward browser buttons
    window.addEventListener('hashchange', () => {
        showSection(window.location.hash || '#home');
    });

    // Mobile Toggle - Redesigned Sidebar
    if (toggle) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinksContainer.classList.toggle('active');
            document.body.classList.toggle('no-scroll');

            // Change icon
            const icon = toggle.querySelector('i');
            if (icon) {
                if (navLinksContainer.classList.contains('active')) {
                    icon.classList.replace('fa-bars', 'fa-times');
                    icon.style.transform = 'rotate(90deg)';
                } else {
                    icon.classList.replace('fa-times', 'fa-bars');
                    icon.style.transform = 'rotate(0deg)';
                }
            }
        });

        // Click outside closes menu
        document.addEventListener('click', (e) => {
            if (navLinksContainer.classList.contains('active')) {
                const isSidebar = navLinksContainer.contains(e.target);
                const isToggle = toggle.contains(e.target);

                if (!isSidebar && !isToggle) {
                    navLinksContainer.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                    const icon = toggle.querySelector('i');
                    if (icon) {
                        icon.classList.replace('fa-times', 'fa-bars');
                        icon.style.transform = 'rotate(0deg)';
                    }
                }
            }
        });

        // Link clicks close menu
        const sidebarLinks = navLinksContainer.querySelectorAll('a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                navLinksContainer.classList.remove('active');
                document.body.classList.remove('no-scroll');
                const icon = toggle.querySelector('i');
                if (icon) {
                    icon.classList.replace('fa-times', 'fa-bars');
                    icon.style.transform = 'rotate(0deg)';
                }
            });
        });
    }
}

/* --- Tab Switching Logic (Resources) --- */
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

/* --- Mock Data Loader --- */
function loadMockData() {
    // Toppers Data
    const toppers = [
        { name: "Suman Das", class: "X", rank: "1st", img: "p1.jpg" },
        { name: "Priya Roy", class: "XII", rank: "1st", img: "p2.jpg" },
        { name: "Rahul Sen", class: "X", rank: "2nd", img: "p3.jpg" },
        { name: "Ananya Paul", class: "XII", rank: "2nd", img: "p4.jpg" },
        { name: "Vikram Singh", class: "IX", rank: "1st", img: "p1.jpg" },
        { name: "Megha Roy", class: "XI", rank: "1st", img: "p2.jpg" },
    ];

    const leaderboardList = document.getElementById('leaderboard-list');
    if (leaderboardList) {
        leaderboardList.innerHTML = '';
        const scrollWrapper = document.createElement('div');
        scrollWrapper.className = 'scroll-wrapper';

        // Clone items for infinite scroll effect
        const fullList = [...toppers, ...toppers];

        fullList.forEach(student => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:15px; width:100%;">
                    <img src="${student.img}" alt="${student.name}" class="leaderboard-img">
                    <div style="flex-grow:1;">
                        <strong style="color:var(--text-main); display:block; font-size:1rem;">${student.name}</strong>
                        <div style="font-size:0.8rem; color:var(--text-muted);">Class: ${student.class}</div>
                    </div>
                    <div class="rank-badge">${student.rank}</div>
                </div>
            `;
            scrollWrapper.appendChild(item);
        });
        leaderboardList.appendChild(scrollWrapper);
    }

    // Birthday Data
    const birthdays = [
        { name: "Mr. A. Roy", role: "Faculty", img: "p1.jpg" },
        { name: "Sneha Paul", role: "Student (Class VIII)", img: "p2.jpg" },
        { name: "Arjun Das", role: "Student (Class V)", img: "p3.jpg" },
    ];

    const birthdayContainer = document.getElementById('birthday-container');

    if (birthdayContainer) {
        birthdayContainer.innerHTML = '';
        const scrollWrapper = document.createElement('div');
        scrollWrapper.className = 'scroll-wrapper';

        if (birthdays.length > 0) {
            // Clone items for infinite scroll
            const fullList = [...birthdays, ...birthdays];
            fullList.forEach(person => {
                const card = document.createElement('div');
                card.className = 'birthday-card-item skyshot-card';
                card.innerHTML = `
                    <img src="${person.img}" alt="${person.name}" class="birthday-img" style="z-index: 2;">
                    <div style="z-index: 2; position: relative;">
                        <strong style="display:block; color:var(--text-main); font-size:1.1rem;">${person.name}</strong>
                        <div style="font-size:0.85rem; color:var(--text-muted); font-weight: 500;">
                            ${person.role} - <span style="color:var(--warning-accent)">Happy Birthday! 🎂</span>
                        </div>
                    </div>
                `;

                scrollWrapper.appendChild(card);
            });
            birthdayContainer.appendChild(scrollWrapper);

            const mainCard = document.getElementById('main-birthday-card');
            if (mainCard) {
                // initSkyshotBurst(mainCard, 80, 300, 100);
            }
        } else {
            birthdayContainer.innerHTML = `
                <p style="text-align:center; color:var(--text-muted); font-size:0.9rem; margin-bottom:1rem;">No birthdays today.</p>
                <div style="border-top:1px solid var(--glass-border); padding-top:0.5rem;">
                    <h5 style="color:var(--secondary-accent); margin-bottom:0.5rem;">Upcoming Birthdays:</h5>
                    <div class="birthday-card-item" style="opacity:0.8;">
                         <div class="birthday-icon-wrapper" style="background:none; border:1px solid var(--glass-border);">
                            <span style="font-size:0.8rem; font-weight:bold;">14</span>
                        </div>
                        <div>
                            <strong style="display:block; color:var(--text-main); font-size:0.9rem;">Sneha Das (Class VI)</strong>
                            <div style="font-size:0.75rem; opacity:0.8;">In 2 Days</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

/* --- Counter Animation --- */
function initCounters() {
    const counterCard = document.getElementById('counter-card');
    if (!counterCard) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = counterCard.querySelectorAll('.counter-value');
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000; // 2 seconds
                    const increment = target / (duration / 16); // 60 FPS

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
    }, { threshold: 0.5 }); // Start when 50% visible

    observer.observe(counterCard);
}

/* --- Academic Year Progress --- */
function initAcademicProgress() {
    const progressBarFill = document.getElementById('academic-progress-fill');
    const percentageText = document.getElementById('academic-year-percentage');
    const labelText = document.getElementById('academic-year-label');

    if (!progressBarFill || !percentageText) return;

    // --- CONFIGURATION: EDIT START/END DATES HERE ---
    const ACADEMIC_START_MONTH = 3; // April (Index starts from 0: Jan=0, Feb=1, Mar=2, Apr=3)
    const ACADEMIC_START_DAY = 1;
    const ACADEMIC_END_MONTH = 2; // March (Index 2)
    const ACADEMIC_END_DAY = 31;
    // ------------------------------------------------

    const now = new Date();
    const currentYear = now.getFullYear();
    let startYear = currentYear;

    // determine if we are currently in the current year's session or the previous one
    if (now.getMonth() < ACADEMIC_START_MONTH) {
        startYear = currentYear - 1;
    }

    const startDate = new Date(startYear, ACADEMIC_START_MONTH, ACADEMIC_START_DAY);
    const endDate = new Date(startYear + 1, ACADEMIC_END_MONTH, ACADEMIC_END_DAY);

    // Update Label with specific years/months
    // if (labelText) {
    //     const startMonthName = startDate.toLocaleString('default', { month: 'short' });
    //     const endMonthName = endDate.toLocaleString('default', { month: 'short' });
    //     labelText.innerText = `${startMonthName} ${startYear} - ${endMonthName} ${startYear + 1}`;
    // }

    const totalDuration = endDate - startDate;
    const elapsed = now - startDate;

    let percentage = (elapsed / totalDuration) * 100;
    percentage = Math.max(0, Math.min(100, percentage)); // Clamp 0-100

    const finalPercentage = percentage;

    // Animate display
    setTimeout(() => {
        progressBarFill.style.width = finalPercentage + '%';
        let current = 0;
        const updateNum = () => {
            current += finalPercentage / 50;
            if (current < finalPercentage) {
                percentageText.innerText = current.toFixed(1) + '%';
                requestAnimationFrame(updateNum);
            } else {
                percentageText.innerText = finalPercentage.toFixed(1) + '%';
            }
        };
        updateNum();
    }, 500);
}
