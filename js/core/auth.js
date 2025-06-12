// js/core/auth.js - Enhanced Authentication System
class Auth {
    static currentUser = null;
    static sessionTimeout = 120; // minutes

    static init() {
        console.log('🔐 Auth system initialized');
        this.setupEventListeners();
        this.loadStoredUsers();
        this.startSessionCheck();
    }

    static setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form-element');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Registration form (if exists)
        const registerForm = document.getElementById('register-form-element');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    static loadStoredUsers() {
        let users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        
        // Create default admin if no users exist
        if (users.length === 0) {
            const defaultAdmin = {
                id: 'admin-001',
                email: 'admin@cwags.org',
                password: this.hashPassword('admin123'),
                firstName: 'System',
                lastName: 'Administrator',
                organization: 'C-WAGS',
                phone: '555-0000',
                role: 'admin',
                isActive: true,
                createdAt: new Date().toISOString(),
                permissions: ['all']
            };
            users.push(defaultAdmin);
            localStorage.setItem('cwags_users', JSON.stringify(users));
            console.log('✅ Default admin created - Email: admin@cwags.org, Password: admin123');
        }
    }

    static async handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        if (!email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        try {
            // Add loading state
            this.setLoginLoading(true);
            
            // Simulate network delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const user = this.authenticateUser(email, password);
            if (user) {
                this.loginUser(user, rememberMe);
                this.showSuccess('Login successful!');
                
                // Redirect after short delay
                setTimeout(() => {
                    if (typeof showMainApp === 'function') {
                        showMainApp();
                    }
                }, 1000);
            } else {
                this.showError('Invalid email or password');
            }
        } catch (error) {
            this.showError('Login failed. Please try again.');
            console.error('Login error:', error);
        } finally {
            this.setLoginLoading(false);
        }
    }

    static async handleRegister() {
        const formData = new FormData(document.getElementById('register-form-element'));
        const userData = Object.fromEntries(formData);

        if (!this.validateRegistrationData(userData)) {
            return;
        }

        try {
            this.setLoginLoading(true);
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const newUser = this.createUser(userData);
            this.showSuccess('Account created successfully! Please login.');
            
            // Switch to login form
            setTimeout(() => {
                if (typeof showLoginForm === 'function') {
                    showLoginForm();
                }
            }, 1500);
            
        } catch (error) {
            this.showError('Registration failed. Please try again.');
            console.error('Registration error:', error);
        } finally {
            this.setLoginLoading(false);
        }
    }

    static validateRegistrationData(data) {
        // Check required fields
        const required = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
        for (let field of required) {
            if (!data[field] || data[field].trim() === '') {
                this.showError(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
                return false;
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showError('Please enter a valid email address');
            return false;
        }

        // Check password strength
        if (data.password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return false;
        }

        // Check password match
        if (data.password !== data.confirmPassword) {
            this.showError('Passwords do not match');
            return false;
        }

        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        if (users.find(user => user.email.toLowerCase() === data.email.toLowerCase())) {
            this.showError('An account with this email already exists');
            return false;
        }

        return true;
    }

    static createUser(data) {
        const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        
        const newUser = {
            id: 'user-' + Date.now(),
            email: data.email.toLowerCase(),
            password: this.hashPassword(data.password),
            firstName: data.firstName,
            lastName: data.lastName,
            organization: data.organization || '',
            phone: data.phone || '',
            role: data.role || 'host',
            isActive: true,
            createdAt: new Date().toISOString(),
            permissions: this.getDefaultPermissions(data.role || 'host')
        };

        users.push(newUser);
        localStorage.setItem('cwags_users', JSON.stringify(users));
        return newUser;
    }

    static getDefaultPermissions(role) {
        const rolePermissions = {
            'admin': ['all'],
            'advocate': ['approve_trials', 'view_all_trials', 'generate_reports'],
            'host': ['create_trials', 'edit_own_trials', 'generate_paperwork'],
            'judge': ['view_assigned_trials', 'score_entries'],
            'secretary': ['manage_entries', 'generate_paperwork', 'score_entries']
        };
        return rolePermissions[role] || ['basic'];
    }

    static authenticateUser(email, password) {
        const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.isActive
        );

        if (user && this.verifyPassword(password, user.password)) {
            return user;
        }
        return null;
    }

    static loginUser(user, rememberMe) {
        const session = {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                organization: user.organization,
                role: user.role,
                permissions: user.permissions
            },
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe,
            expiresAt: new Date(Date.now() + (this.sessionTimeout * 60 * 1000)).toISOString()
        };

        // Store session
        if (rememberMe) {
            localStorage.setItem('cwags_session', JSON.stringify(session));
        } else {
            sessionStorage.setItem('cwags_session', JSON.stringify(session));
        }

        this.currentUser = session.user;
        this.updateUserInterface(session.user);
    }

    static updateUserInterface(user) {
        const userNameEl = document.getElementById('user-name');
        const userRoleEl = document.getElementById('user-role');
        
        if (userNameEl) {
            userNameEl.textContent = `${user.firstName} ${user.lastName}`;
        }
        
        if (userRoleEl) {
            userRoleEl.textContent = user.role.toUpperCase();
        }

        // Show/hide admin features
        const adminElements = document.querySelectorAll('.admin-only');
        const isAdmin = user.role === 'admin' || user.permissions.includes('all');
        adminElements.forEach(el => {
            el.style.display = isAdmin ? 'block' : 'none';
        });
    }

    static logout() {
        // Clear session data
        localStorage.removeItem('cwags_session');
        sessionStorage.removeItem('cwags_session');
        this.currentUser = null;
        
        // Show login modal
        if (typeof showAuthModal === 'function') {
            showAuthModal();
        }
        
        // Clear forms
        const loginForm = document.getElementById('login-form-element');
        if (loginForm) {
            loginForm.reset();
        }
    }

    static isLoggedIn() {
        if (this.currentUser) return true;
        
        const session = this.getSession();
        if (session && session.user) {
            // Check if session is expired
            if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
                this.logout();
                return false;
            }
            
            this.currentUser = session.user;
            return true;
        }
        return false;
    }

    static getCurrentUser() {
        if (!this.currentUser) {
            const session = this.getSession();
            if (session && session.user) {
                this.currentUser = session.user;
            }
        }
        return this.currentUser;
    }

    static getSession() {
        // Check sessionStorage first, then localStorage
        let session = sessionStorage.getItem('cwags_session');
        if (!session) {
            session = localStorage.getItem('cwags_session');
        }
        return session ? JSON.parse(session) : null;
    }

    static hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        return user.permissions.includes('all') || user.permissions.includes(permission);
    }

    static startSessionCheck() {
        // Check session validity every 5 minutes
        setInterval(() => {
            const session = this.getSession();
            if (session && session.expiresAt) {
                const timeLeft = new Date(session.expiresAt) - new Date();
                
                // Warn if less than 10 minutes left
                if (timeLeft < 10 * 60 * 1000 && timeLeft > 0) {
                    this.showSessionWarning();
                } else if (timeLeft <= 0) {
                    this.logout();
                    this.showError('Session expired. Please login again.');
                }
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    static showSessionWarning() {
        const extend = confirm('Your session will expire soon. Do you want to extend it?');
        if (extend) {
            this.extendSession();
        }
    }

    static extendSession() {
        const session = this.getSession();
        if (session) {
            session.expiresAt = new Date(Date.now() + (this.sessionTimeout * 60 * 1000)).toISOString();
            
            if (session.rememberMe) {
                localStorage.setItem('cwags_session', JSON.stringify(session));
            } else {
                sessionStorage.setItem('cwags_session', JSON.stringify(session));
            }
        }
    }

    // ===================
    // PASSWORD UTILITIES
    // ===================

    static hashPassword(password) {
        // Simple hash for demo - use proper hashing in production
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    static verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    // ===================
    // UI UTILITIES
    // ===================

    static setLoginLoading(loading) {
        const form = document.querySelector('.auth-form');
        const submitBtn = document.querySelector('.auth-form .btn');
        
        if (form) {
            if (loading) {
                form.classList.add('loading');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Logging in...';
                }
            } else {
                form.classList.remove('loading');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Login';
                }
            }
        }
    }

    static showError(message) {
        this.showMessage(message, 'error');
    }

    static showSuccess(message) {
        this.showMessage(message, 'success');
    }

    static showMessage(message, type) {
        const messageArea = document.getElementById('message-area');
        if (messageArea) {
            const className = type === 'error' ? 'auth-error' : 'auth-success';
            messageArea.innerHTML = `<div class="${className}">${message}</div>`;
            
            // Auto-clear success messages
            if (type === 'success') {
                setTimeout(() => {
                    messageArea.innerHTML = '';
                }, 3000);
            }
        }
    }

    static clearMessages() {
        const messageArea = document.getElementById('message-area');
        if (messageArea) {
            messageArea.innerHTML = '';
        }
    }
}
