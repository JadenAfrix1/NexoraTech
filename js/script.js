document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status on protected pages
    checkAuth();
    
    // Initialize form handlers
    initForms();
    
    // Initialize payment handlers
    initPayment();
    
    // Initialize admin features
    initAdmin();
    
    // Initialize access code functionality
    initAccessCode();
    
    // Initialize course functionality
    initCourses();
    
    // Initialize localStorage with default data if empty
    initLocalStorage();
});

// Mobile-specific optimizations
function initMobileOptimizations() {
    // Add touch device detection with ontouchstart
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        document.body.classList.add('touch-device');
        
        // Prevent accidental zoom on double-tap
        document.addEventListener('click', function(e) {
            if (e.target.tagName === 'SELECT') {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // Add viewport-fit=cover for iOS safe areas
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.setAttribute('content', viewport.getAttribute('content') + ', viewport-fit=cover');
    }
    
    // Add mobile detection class
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.body.classList.add('mobile-device');
    }
}

// Responsive UI handling
function initResponsiveUI() {
    // Handle responsive admin layout
    const adminPages = [
        'admin/dashboard.html',
        'admin/manage-codes.html',
        'admin/manage-admins.html'
    ];
    
    if (adminPages.some(page => window.location.pathname.endsWith(page))) {
        // Initialize responsive admin components
        initResponsiveAdmin();
        
        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(initResponsiveAdmin, 250);
        });
    }
}

function initResponsiveAdmin() {
    // Mobile-friendly admin layout
    const isMobile = window.innerWidth < 768;
    
    // Handle sidebar on mobile
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        if (isMobile) {
            // Convert to mobile-friendly navigation
            sidebar.style.position = 'static';
            sidebar.style.width = '100%';
            
            // Add toggle button if not exists
            if (!document.getElementById('sidebar-toggle')) {
                const toggleBtn = document.createElement('button');
                toggleBtn.id = 'sidebar-toggle';
                toggleBtn.className = 'btn btn-outline';
                toggleBtn.innerHTML = '<i class="fas fa-bars"></i> Menu';
                toggleBtn.style.marginBottom = '1rem';
                
                toggleBtn.addEventListener('click', function() {
                    const nav = document.querySelector('.sidebar ul');
                    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
                    nav.style.flexDirection = 'column';
                    nav.style.gap = '0.5rem';
                });
                
                sidebar.parentNode.insertBefore(toggleBtn, sidebar);
            }
        } else {
            // Desktop layout
            sidebar.style.position = 'sticky';
            sidebar.style.top = '2rem';
            sidebar.style.maxHeight = 'calc(100vh - 4rem)';
            sidebar.style.overflowY = 'auto';
            
            // Remove mobile toggle if exists
            const toggleBtn = document.getElementById('sidebar-toggle');
            if (toggleBtn) toggleBtn.remove();
        }
    }
    
    // Handle tables on mobile
    const tables = document.querySelectorAll('.table');
    tables.forEach(table => {
        // Wrap table in responsive container if not already
        if (!table.closest('.table-container')) {
            const container = document.createElement('div');
            container.className = 'table-container';
            table.parentNode.insertBefore(container, table);
            container.appendChild(table);
        }
    });
    
    // Handle code display on mobile
    const codeDisplays = document.querySelectorAll('.code-display');
    codeDisplays.forEach(display => {
        const codeValue = display.querySelector('.code-value');
        if (codeValue) {
            // Add copy button if not exists
            if (!display.querySelector('.mobile-copy-btn')) {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'btn btn-outline mobile-copy-btn';
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Code';
                copyBtn.style.width = '100%';
                copyBtn.style.marginTop = '0.8rem';
                
                copyBtn.addEventListener('click', function() {
                    const code = codeValue.textContent;
                    copyToClipboard(code);
                });
                
                display.appendChild(copyBtn);
            }
        }
    });
}

// Authentication functions
function checkAuth() {
    const protectedPages = [
        'courses.html', 
        'youtube-automation.html', 
        'digital-marketing.html',
        'data-science.html', 
        'access-code.html', 
        'payment.html',
        'admin/dashboard.html', 
        'admin/manage-codes.html', 
        'admin/manage-admins.html'
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        // Handle localStorage errors (incognito mode)
        try {
            const user = localStorage.getItem('currentUser');
            if (!user) {
                // Redirect to login if not authenticated
                window.location.href = 'login.html';
            } else {
                // Update UI for authenticated user
                updateAuthUI(JSON.parse(user));
            }
        } catch (e) {
            showNotification('Private browsing detected. Some features may not work properly.', 'warning');
            window.location.href = 'login.html';
        }
    }
}

function updateAuthUI(user) {
    const authLinks = document.querySelector('.auth-links');
    if (authLinks) {
        authLinks.innerHTML = `
            <li><a href="courses.html"><i class="fas fa-book"></i> Courses</a></li>
            <li><a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
        `;
        
        document.getElementById('logout-btn').addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Check if admin and update UI accordingly
    if (user.isAdmin) {
        const adminLink = document.createElement('li');
        adminLink.innerHTML = `<a href="admin/dashboard.html"><i class="fas fa-cog"></i> Admin</a>`;
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.appendChild(adminLink);
        }
    }
}

// Form initialization with mobile optimizations
function initForms() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;
            
            loginUser(email, password, () => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
    
    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (password !== confirmPassword) {
                showNotification('Passwords do not match!', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            submitBtn.disabled = true;
            
            signupUser(name, email, password, () => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
}

// Login with error handling and mobile-friendly feedback
function loginUser(email, password, callback = () => {}) {
    try {
        // Check if user exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'courses.html';
        } else {
            // Check if it's the main admin
            if (email === 'tawandamahachi07@gmail.com' && password === 'mahachi2007') {
                const adminUser = {
                    id: 'admin',
                    name: 'Main Admin',
                    email: 'tawandamahachi07@gmail.com',
                    isAdmin: true,
                    courses: []
                };
                
                localStorage.setItem('currentUser', JSON.stringify(adminUser));
                window.location.href = 'admin/dashboard.html';
            } else {
                showNotification('Invalid email or password!', 'error');
                callback();
            }
        }
    } catch (e) {
        showNotification('Authentication error. Please try again.', 'error');
        callback();
    }
}

// Signup with mobile-friendly feedback
function signupUser(name, email, password, callback = () => {}) {
    try {
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.some(u => u.email === email)) {
            showNotification('Email already registered!', 'error');
            callback();
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            isAdmin: false,
            courses: []
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Log in the new user
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        showNotification('Account created successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'courses.html';
        }, 1000);
    } catch (e) {
        showNotification('Error creating account. Please try again.', 'error');
        callback();
    }
}

function logout() {
    try {
        localStorage.removeItem('currentUser');
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    } catch (e) {
        window.location.href = 'index.html';
    }
}

// Payment functions with mobile optimizations
function initPayment() {
    // WhatsApp payment buttons
    const usdBtn = document.getElementById('pay-usd');
    const nairaBtn = document.getElementById('pay-naira');
    const cryptoBtn = document.getElementById('pay-crypto');
    
    if (usdBtn) {
        usdBtn.addEventListener('click', function() {
            handlePaymentClick('USD');
        });
    }
    
    if (nairaBtn) {
        nairaBtn.addEventListener('click', function() {
            handlePaymentClick('Naira');
        });
    }
    
    if (cryptoBtn) {
        cryptoBtn.addEventListener('click', function() {
            handlePaymentClick('Cryptocurrency');
        });
    }
}

function handlePaymentClick(paymentMethod) {
    const course = localStorage.getItem('selectedCourse') || 'selected';
    const message = `Hello, I want to purchase the ${course} course using ${paymentMethod}.`;
    
    // Show confirmation on mobile
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        if (!confirm(`Open WhatsApp to contact support for ${paymentMethod} payment?`)) {
            return;
        }
    }
    
    let whatsappUrl;
    if (paymentMethod === 'USD') {
        whatsappUrl = `https://wa.me/263784812740?text=${encodeURIComponent(message)}`;
    } else {
        whatsappUrl = `https://wa.me/2347048929112?text=${encodeURIComponent(message)}`;
    }
    
    window.open(whatsappUrl, '_blank');
}

// Admin functions with mobile enhancements
function initAdmin() {
    // Admin dashboard
    if (window.location.pathname.includes('admin/dashboard.html')) {
        loadAdminDashboard();
    }
    
    // Manage codes
    if (window.location.pathname.includes('admin/manage-codes.html')) {
        loadManageCodes();
    }
    
    // Manage admins
    if (window.location.pathname.includes('admin/manage-admins.html')) {
        loadManageAdmins();
    }
    
    // Generate code button
    const generateCodeBtn = document.getElementById('generate-code-btn');
    if (generateCodeBtn) {
        generateCodeBtn.addEventListener('click', generateAccessCode);
    }
    
    // Add admin button
    const addAdminBtn = document.getElementById('add-admin-btn');
    if (addAdminBtn) {
        addAdminBtn.addEventListener('click', addAdmin);
    }
    
    // Initialize code display functionality
    initCodeDisplay();
}

function initCodeDisplay() {
    // Copy code functionality
    document.querySelectorAll('.copy-btn, #copy-code-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const codeElement = this.closest('.code-display')?.querySelector('.code-value') || 
                               this.parentElement.querySelector('.code-cell');
            if (codeElement) {
                const code = codeElement.textContent.trim().replace('Copy code', '');
                copyToClipboard(code);
            }
        });
    });
    
    // Delete code functionality
    document.querySelectorAll('#delete-code-btn, .action-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (this.id === 'delete-code-btn') {
                document.getElementById('code-display').style.display = 'none';
            } else {
                const row = this.closest('tr');
                if (confirm('Are you sure you want to delete this access code?')) {
                    showNotification('Code deleted successfully', 'success');
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(20px)';
                    setTimeout(() => {
                        row.remove();
                        if (document.querySelector('#codes-table tr') === null) {
                            document.querySelector('#codes-table').innerHTML = 
                                `<tr><td colspan="6" style="text-align: center; padding: 2rem;">No access codes generated yet</td></tr>`;
                        }
                    }, 300);
                }
            }
        });
    });
}

function copyToClipboard(text) {
    try {
        // Try modern Clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification('Code copied to clipboard!', 'success');
            }).catch(err => {
                fallbackCopyTextToClipboard(text);
            });
        } else {
            fallbackCopyTextToClipboard(text);
        }
    } catch (e) {
        fallbackCopyTextToClipboard(text);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Make it invisible
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showNotification('Code copied to clipboard!', 'success');
        } else {
            showNotification('Could not copy code. Please select and copy manually.', 'warning');
        }
    } catch (err) {
        showNotification('Could not copy code. Please select and copy manually.', 'warning');
    }
    
    document.body.removeChild(textArea);
}

function loadAdminDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || !user.isAdmin) {
        window.location.href = 'courses.html';
        return;
    }
    
    // Show loading state
    const stats = document.querySelectorAll('.stat-card .value');
    stats.forEach(stat => {
        stat.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    });
    
    // Simulate loading delay for better UX
    setTimeout(() => {
        try {
            // Update dashboard with stats
            const totalUsers = JSON.parse(localStorage.getItem('users') || '[]').length;
            const totalCodes = JSON.parse(localStorage.getItem('accessCodes') || '[]').length;
            const usedCodes = JSON.parse(localStorage.getItem('accessCodes') || '[]')
                .filter(code => code.status === 'used').length;
            
            document.getElementById('total-users').textContent = totalUsers;
            document.getElementById('total-codes').textContent = totalCodes;
            document.getElementById('used-codes').textContent = usedCodes;
        } catch (e) {
            showNotification('Error loading dashboard data', 'error');
        }
    }, 300);
}

function loadManageCodes() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || !user.isAdmin) {
        window.location.href = 'courses.html';
        return;
    }
    
    renderAccessCodes();
}

function renderAccessCodes() {
    const tableBody = document.querySelector('#codes-table tbody');
    if (!tableBody) return;
    
    // Show loading state
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-spin"></i> Loading access codes...
            </td>
        </tr>
    `;
    
    try {
        setTimeout(() => {
            const codes = JSON.parse(localStorage.getItem('accessCodes') || '[]');
            tableBody.innerHTML = '';
            
            if (codes.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 2rem;">No access codes generated yet</td>
                    </tr>
                `;
                return;
            }
            
            // Sort codes by date (newest first)
            codes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            codes.forEach(code => {
                const row = document.createElement('tr');
                const statusClass = code.status === 'active' ? 'status-active' : 
                                   code.status === 'pending' ? 'status-pending' : 'status-used';
                
                row.innerHTML = `
                    <td class="code-cell">
                        ${code.code}
                        <button class="copy-btn" title="Copy code">
                            <i class="fas fa-copy"></i>
                        </button>
                    </td>
                    <td>${code.course}</td>
                    <td>${code.userEmail || 'Not assigned'}</td>
                    <td><span class="status ${statusClass}">${formatStatus(code.status)}</span></td>
                    <td>${formatDate(code.createdAt)}</td>
                    <td class="action-cell">
                        <button class="action-btn" title="Delete code">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Initialize code display functionality again
            initCodeDisplay();
        }, 300);
    } catch (e) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #ff6b6b;">
                    Error loading access codes. Please try again.
                </td>
            </tr>
        `;
        showNotification('Error loading access codes', 'error');
    }
}

function generateAccessCode() {
    const courseSelect = document.getElementById('course-select');
    const course = courseSelect ? courseSelect.value : '';
    
    if (!course) {
        showNotification('Please select a course!', 'error');
        return;
    }
    
    // Show loading state
    const btn = document.getElementById('generate-code-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;
    
    setTimeout(() => {
        try {
            // Generate 8-character code (no prefixes or hyphens)
            const code = generateRandomCode(8);
            
            const newCode = {
                id: Date.now().toString(),
                code,
                course,
                status: 'active',
                createdAt: new Date().toISOString()
            };
            
            let codes = JSON.parse(localStorage.getItem('accessCodes') || '[]');
            codes.push(newCode);
            localStorage.setItem('accessCodes', JSON.stringify(codes));
            
            renderAccessCodes();
            
            // Show generated code
            const codeDisplay = document.getElementById('code-display');
            if (codeDisplay) {
                document.getElementById('generated-code').textContent = code;
                codeDisplay.style.display = 'block';
                
                // Scroll to code display on mobile
                if (window.innerWidth < 768) {
                    codeDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            
            showNotification(`Access code generated: ${code}`, 'success');
        } catch (e) {
            showNotification('Error generating access code', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }, 500);
}

function generateRandomCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function loadManageAdmins() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || !user.isAdmin) {
        window.location.href = 'courses.html';
        return;
    }
    
    renderAdmins();
}

function renderAdmins() {
    const tableBody = document.querySelector('#admins-table tbody');
    if (!tableBody) return;
    
    // Show loading state
    tableBody.innerHTML = `
        <tr>
            <td colspan="4" style="text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-spin"></i> Loading admins...
            </td>
        </tr>
    `;
    
    try {
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const admins = users.filter(user => user.isAdmin);
            tableBody.innerHTML = '';
            
            if (admins.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 2rem;">No admins found</td>
                    </tr>
                `;
                return;
            }
            
            admins.forEach(admin => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${admin.name}</td>
                    <td>${admin.email}</td>
                    <td>
                        <span class="status ${admin.email === 'tawandamahachi07@gmail.com' ? 'status-active' : 'status-pending'}">
                            ${admin.email === 'tawandamahachi07@gmail.com' ? 'Super Admin' : 'Admin'}
                        </span>
                    </td>
                    <td>
                        ${admin.email !== 'tawandamahachi07@gmail.com' ? 
                            `<button class="action-btn" title="Remove admin"><i class="fas fa-trash"></i></button>` : 
                            '<span style="color: #c0c0ff;">Cannot be removed</span>'}
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // Initialize delete functionality
            document.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const row = this.closest('tr');
                    const email = row.querySelector('td:nth-child(2)').textContent;
                    
                    if (confirm(`Are you sure you want to remove admin: ${email}?`)) {
                        const user = JSON.parse(localStorage.getItem('currentUser'));
                        if (user.email === email) {
                            showNotification("You cannot remove yourself as an admin", "error");
                            return;
                        }
                        
                        // Find user ID from row data or email
                        const users = JSON.parse(localStorage.getItem('users') || '[]');
                        const userIndex = users.findIndex(u => u.email === email);
                        
                        if (userIndex !== -1) {
                            users[userIndex].isAdmin = false;
                            localStorage.setItem('users', JSON.stringify(users));
                            showNotification(`Admin ${email} has been removed`, "success");
                            renderAdmins();
                        }
                    }
                });
            });
        }, 300);
    } catch (e) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem; color: #ff6b6b;">
                    Error loading admins. Please try again.
                </td>
            </tr>
        `;
        showNotification('Error loading admin data', 'error');
    }
}

function addAdmin() {
    const emailInput = document.getElementById('admin-email');
    const email = emailInput ? emailInput.value.trim() : '';
    
    if (!email) {
        showNotification('Please enter an email address!', 'error');
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address!', 'error');
        return;
    }
    
    // Show loading state
    const btn = document.getElementById('add-admin-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;
    
    setTimeout(() => {
        try {
            // Check if user exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (userIndex === -1) {
                showNotification('User not found!', 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }
            
            // Check if already admin
            if (users[userIndex].isAdmin) {
                showNotification('This user is already an admin!', 'warning');
                emailInput.value = '';
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }
            
            // Make user an admin
            users[userIndex].isAdmin = true;
            localStorage.setItem('users', JSON.stringify(users));
            
            renderAdmins();
            emailInput.value = '';
            showNotification(`User ${email} has been made an admin!`, 'success');
        } catch (e) {
            showNotification('Error adding admin. Please try again.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }, 400);
}

// Access code functions with mobile enhancements
function initAccessCode() {
    const verifyCodeBtn = document.getElementById('verify-code-btn');
    if (verifyCodeBtn) {
        verifyCodeBtn.addEventListener('click', verifyAccessCode);
    }
    
    // Initialize access code input fields with mobile optimizations
    const codeInputs = document.querySelectorAll('.code-input, .access-code-input input');
    codeInputs.forEach((input, index) => {
        // Make inputs larger for touch
        input.style.height = '50px';
        input.style.fontSize = '1.4rem';
        
        input.addEventListener('input', function() {
            if (this.value && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
        
        // Mobile-specific handling
        if ('ontouchstart' in window) {
            input.addEventListener('focus', function() {
                // Scroll input into view on focus for mobile
                setTimeout(() => {
                    const rect = this.getBoundingClientRect();
                    if (rect.top < 0 || rect.bottom > window.innerHeight) {
                        window.scrollBy(0, rect.top - 100);
                    }
                }, 100);
            });
        }
    });
}

function verifyAccessCode() {
    const codeInputs = document.querySelectorAll('.code-input, .access-code-input input');
    const code = Array.from(codeInputs).map(input => input.value).join('').toUpperCase();
    const course = localStorage.getItem('selectedCourse');
    
    if (code.length < 8) {
        showNotification('Please enter a valid access code!', 'error');
        return;
    }
    
    try {
        const codes = JSON.parse(localStorage.getItem('accessCodes') || '[]');
        const codeObj = codes.find(c => 
            c.code.replace(/-/g, '').toUpperCase() === code.replace(/-/g, '').toUpperCase() && 
            c.course === course
        );
        
        if (!codeObj) {
            showNotification('Invalid access code for this course!', 'error');
            return;
        }
        
        if (codeObj.status === 'used') {
            showNotification('This access code has already been used!', 'error');
            return;
        }
        
        // Show loading state
        const btn = document.getElementById('verify-code-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        btn.disabled = true;
        
        setTimeout(() => {
            // Update code status
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const updatedCodes = codes.map(c => 
                c.code.replace(/-/g, '').toUpperCase() === code.replace(/-/g, '').toUpperCase() ? 
                {...c, status: 'used', userEmail: user.email} : c
            );
            localStorage.setItem('accessCodes', JSON.stringify(updatedCodes));
            
            // Add course to user
            user.courses = user.courses || [];
            if (!user.courses.includes(course)) {
                user.courses.push(course);
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const userIndex = users.findIndex(u => u.id === user.id);
                if (userIndex !== -1) {
                    users[userIndex] = user;
                    localStorage.setItem('users', JSON.stringify(users));
                }
                localStorage.setItem('currentUser', JSON.stringify(user));
            }
            
            showNotification('Access code verified successfully!', 'success');
            
            // Redirect to course
            setTimeout(() => {
                if (course === 'YouTube Automation') {
                    window.location.href = 'youtube-automation.html';
                } else if (course === 'Digital Marketing') {
                    window.location.href = 'digital-marketing.html';
                } else if (course === 'Data Science Fundamentals') {
                    window.location.href = 'data-science.html';
                }
            }, 1000);
        }, 600);
    } catch (e) {
        showNotification('Error verifying access code. Please try again.', 'error');
        const btn = document.getElementById('verify-code-btn');
        if (btn) {
            btn.innerHTML = 'Verify Code';
            btn.disabled = false;
        }
    }
}

// Course functions with mobile optimizations
function initCourses() {
    // Course selection
    const courseCards = document.querySelectorAll('.course-card, .badge');
    courseCards.forEach(card => {
        card.addEventListener('click', function() {
            const courseName = this.getAttribute('data-course') || 
                              this.querySelector('h3')?.textContent?.trim();
            
            if (courseName) {
                localStorage.setItem('selectedCourse', courseName);
                
                // Check if user already has access to Data Science (it's free)
                if (courseName === 'Data Science Fundamentals') {
                    const user = JSON.parse(localStorage.getItem('currentUser'));
                    user.courses = user.courses || [];
                    if (!user.courses.includes(courseName)) {
                        user.courses.push(courseName);
                        const users = JSON.parse(localStorage.getItem('users') || '[]');
                        const userIndex = users.findIndex(u => u.id === user.id);
                        if (userIndex !== -1) {
                            users[userIndex] = user;
                            localStorage.setItem('users', JSON.stringify(users));
                        }
                        localStorage.setItem('currentUser', JSON.stringify(user));
                    }
                    showNotification('Access granted to Data Science course!', 'success');
                    setTimeout(() => {
                        window.location.href = 'data-science.html';
                    }, 500);
                } else {
                    window.location.href = 'access-code.html';
                }
            }
        });
    });
    
    // Check course access
    const protectedCourses = ['youtube-automation.html', 'digital-marketing.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedCourses.includes(currentPage)) {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const courseName = currentPage === 'youtube-automation.html' ? 
                'YouTube Automation' : 'Digital Marketing';
                
            if (!user.courses || !user.courses.includes(courseName)) {
                showNotification('You do not have access to this course. Please enter a valid access code.', 'error');
                setTimeout(() => {
                    window.location.href = 'access-code.html';
                }, 2000);
            }
        } catch (e) {
            showNotification('Error checking course access. Please try again.', 'error');
            setTimeout(() => {
                window.location.href = 'access-code.html';
            }, 2000);
        }
    }
}

// Utility functions
function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
        return `Today, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else if (new Date(now - 86400000).toDateString() === date.toDateString()) {
        return `Yesterday, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else {
        return date.toLocaleDateString([], {month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined});
    }
}

// Notification system for mobile-friendly feedback
function showNotification(message, type = 'info') {
    // Create notification element if doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.padding = '12px 24px';
        notification.style.borderRadius = '30px';
        notification.style.fontSize = '14px';
        notification.style.zIndex = '9999';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        notification.style.maxWidth = '90%';
        notification.style.textAlign = 'center';
        document.body.appendChild(notification);
    }
    
    // Set notification style based on type
    switch (type) {
        case 'success':
            notification.style.background = 'rgba(10, 150, 80, 0.9)';
            notification.style.color = '#00d2d3';
            break;
        case 'error':
            notification.style.background = 'rgba(179, 27, 27, 0.9)';
            notification.style.color = '#ff6b6b';
            break;
        case 'warning':
            notification.style.background = 'rgba(212, 160, 23, 0.9)';
            notification.style.color = '#f2a900';
            break;
        default:
            notification.style.background = 'rgba(30, 64, 175, 0.9)';
            notification.style.color = '#4facfe';
    }
    
    // Update and show notification
    notification.textContent = message;
    notification.style.opacity = '1';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.textContent = '';
        }, 300);
    }, 3000);
}

// Initialize localStorage with default data if empty
function initLocalStorage() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                isAdmin: false,
                courses: []
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    
    if (!localStorage.getItem('accessCodes')) {
        localStorage.setItem('accessCodes', JSON.stringify([]));
    }
}