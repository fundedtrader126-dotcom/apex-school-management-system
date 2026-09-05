// 3D Animated Background Particle Engine
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2.5;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.fill();
    }
}

for (let i = 0; i < 75; i++) particles.push(new Particle());

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, index) => {
        p.update();
        p.draw();
        for (let j = index + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 120) {
                ctx.strokeStyle = `rgba(168, 85, 247, ${1 - dist / 120})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Audio synthesizer & popup handler for School Trip Notice
function playPopupSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5 note
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
        console.log("Audio autoplay prevented by browser policy until interaction.");
    }
}

// Trigger sound effect on page load simulation
window.addEventListener('load', () => {
    setTimeout(playPopupSound, 600);
});

function closeTripPopup() {
    const popup = document.getElementById('tripPopup');
    popup.style.opacity = '0';
    popup.style.transition = 'opacity 0.3s ease';
    setTimeout(() => { popup.style.display = 'none'; }, 300);
}

// Section Switcher with Fade In
function switchSection(targetId) {
    const sections = document.querySelectorAll('.section-view');
    sections.forEach(sec => sec.classList.remove('active'));

    const target = document.getElementById(targetId);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// LocalStorage Initialization & State
if (!localStorage.getItem('apex_attendance')) {
    localStorage.setItem('apex_attendance', 'Present');
}
if (!localStorage.getItem('apex_homework')) {
    localStorage.setItem('apex_homework', JSON.stringify([
        { subject: 'Mathematics', details: 'Complete Exercise 4.2 questions 1 to 10.' }
    ]));
}
if (!localStorage.getItem('apex_users')) {
    localStorage.setItem('apex_users', JSON.stringify([
        { name: 'Alex Student', email: 'student@apex.edu', pass: 'student123', role: 'student' },
        { name: 'Parent Guardian', email: 'parent@apex.edu', pass: 'parent123', role: 'parent' },
        { name: 'Prof. Robert', email: 'teacher@apex.edu', pass: 'teacher123', role: 'teacher' },
        { name: 'System Admin', email: 'admin@apex.edu', pass: 'admin123', role: 'admin' }
    ]));
}

function refreshDashboards() {
    const att = localStorage.getItem('apex_attendance');
    const badge = document.getElementById('currentStatusBadge');
    if (badge) badge.innerText = att;
    
    const studAtt = document.getElementById('studentAttendanceDisplay');
    if (studAtt) {
        studAtt.innerHTML = `<span>Status: ${att}</span> <i class="fa-solid fa-circle-check text-xl"></i>`;
    }

    const hwList = JSON.parse(localStorage.getItem('apex_homework'));
    const studHw = document.getElementById('studentHomeworkList');
    if (studHw) {
        studHw.innerHTML = hwList.map(h => `<div class="p-3 rounded-xl bg-white/5 border border-white/10 text-sm"><span class="font-bold text-purple-300">${h.subject}:</span> ${h.details}</div>`).join('');
    }
}

// Quick Demo Fill Helper
function fillDemo(role, email, pass) {
    document.getElementById('loginRole').value = role;
    document.getElementById('loginUser').value = email;
    document.getElementById('loginPass').value = pass;
}

// Signup Logic
function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('sgnName').value;
    const role = document.getElementById('sgnRole').value;
    const email = document.getElementById('sgnEmail').value;
    const pass = document.getElementById('sgnPass').value;

    let users = JSON.parse(localStorage.getItem('apex_users'));
    if(users.some(u => u.email === email)) {
        alert('An account with this email already exists! Please login.');
        return;
    }

    users.push({ name, email, pass, role });
    localStorage.setItem('apex_users', JSON.stringify(users));

    alert(`Account successfully created for ${name} as ${role}! You can now login.`);
    switchSection('sec-login');
    fillDemo(role, email, pass);
}

// Login Logic
function handleLogin(e) {
    e.preventDefault();
    const role = document.getElementById('loginRole').value;
    const userEmail = document.getElementById('loginUser').value.trim();
    const userPass = document.getElementById('loginPass').value;

    let users = JSON.parse(localStorage.getItem('apex_users'));
    const foundUser = users.find(u => u.email === userEmail && u.pass === userPass && u.role === role);

    if (foundUser) {
        alert(`Welcome back, ${foundUser.name}! Opening ${role} dashboard.`);
        switchSection('dash-' + role);
        refreshDashboards();
        
        if(role === 'student') {
            document.getElementById('studentNameDisplay').innerText = foundUser.name;
        }
    } else {
        alert('Invalid credentials or mismatched role selection! Please use the demo click-to-fill buttons above.');
    }
}

function logout() {
    switchSection('sec-home');
}

function changeAttendance(status) {
    localStorage.setItem('apex_attendance', status);
    refreshDashboards();
    alert('Attendance status successfully updated to: ' + status);
}

function publishHomework(e) {
    e.preventDefault();
    const subject = document.getElementById('hwSubject').value;
    const details = document.getElementById('hwDetails').value;
    
    let hwList = JSON.parse(localStorage.getItem('apex_homework'));
    hwList.unshift({ subject, details });
    localStorage.setItem('apex_homework', JSON.stringify(hwList));
    
    document.getElementById('hwSubject').value = '';
    document.getElementById('hwDetails').value = '';
    refreshDashboards();
    alert('Homework published instantly to all students and parents!');
}

function submitComplaint(e) {
    e.preventDefault();
    const text = document.getElementById('complaintText').value;
    alert('Complaint ticket successfully submitted: ' + text);
    document.getElementById('complaintText').value = '';
}

refreshDashboards();