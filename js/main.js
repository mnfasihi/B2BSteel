// وضعیت فعلی کاربر
let currentUser = null;

// نمایش مودال احراز هویت
function showAuthModal(type) {
    const modal = document.getElementById('authModal');
    const modalTitle = document.getElementById('modalTitle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    modal.classList.add('active');
    
    if (type === 'login') {
        modalTitle.textContent = 'ورود به حساب کاربری';
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        modalTitle.textContent = 'ثبت‌نام در B2BSteel';
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
}

// بستن مودال
function closeModal() {
    document.getElementById('authModal').classList.remove('active');
}

// نمایش فرم ثبت‌نام
function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'ثبت‌نام در B2BSteel';
}

// نمایش فرم ورود
function showLoginForm() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'ورود به حساب کاربری';
}

// عملیات ورود
function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        alert('لطفاً ایمیل و رمز عبور را وارد کنید');
        return;
    }
    
    // شبیه‌سازی ورود موفق
    currentUser = {
        email: email,
        type: 'buyer'
    };
    
    // ذخیره در localStorage
    localStorage.setItem('b2bsteel_user', JSON.stringify(currentUser));
    
    alert('با موفقیت وارد شدید!');
    closeModal();
    updateNavigation();
}

// عملیات ثبت‌نام
function register() {
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const userType = document.getElementById('userType').value;
    
    if (!email || !password || !confirmPassword) {
        alert('لطفاً تمام فیلدها را پر کنید');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('رمز عبور و تکرار آن مطابقت ندارند');
        return;
    }
    
    // شبیه‌سازی ثبت‌نام موفق
    currentUser = {
        email: email,
        type: userType
    };
    
    // ذخیره در localStorage
    localStorage.setItem('b2bsteel_user', JSON.stringify(currentUser));
    
    alert('ثبت‌نام با موفقیت انجام شد!');
    closeModal();
    updateNavigation();
}

// به‌روزرسانی ناوبری بر اساس وضعیت کاربر
function updateNavigation() {
    const authButtons = document.querySelector('.auth-buttons');
    
    if (currentUser) {
        authButtons.innerHTML = `
            <button class="btn btn-outline" onclick="logout()">خروج</button>
            <button class="btn btn-primary" onclick="showDashboard()">داشبورد</button>
        `;
    } else {
        authButtons.innerHTML = `
            <button class="btn btn-outline" onclick="showAuthModal('login')">ورود</button>
            <button class="btn btn-primary" onclick="showAuthModal('register')">ثبت‌نام</button>
        `;
    }
}

// خروج کاربر
function logout() {
    currentUser = null;
    localStorage.removeItem('b2bsteel_user');
    updateNavigation();
    alert('با موفقیت خارج شدید');
}

// نمایش داشبورد
function showDashboard() {
    alert('داشبورد کاربری - این بخش در حال توسعه است');
    // در آینده به صفحه داشبورد هدایت می‌شود
}

// بارگذاری کاربر از localStorage هنگام لود صفحه
function loadUser() {
    const savedUser = localStorage.getItem('b2bsteel_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    updateNavigation();
}

// بستن مودال با کلیک خارج
document.addEventListener('click', function(event) {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeModal();
    }
});

// بارگذاری اولیه
document.addEventListener('DOMContentLoaded', function() {
    loadUser();
    
    // اسکرول نرم برای لینک‌ها
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});
