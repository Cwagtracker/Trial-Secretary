/**
 * C-WAGS Authentication Module
 * Handles user authentication, sessions, and permissions
 */

class Auth {
    static currentUser = null;
    static sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    static loginAttempts = {};
    static maxAttempts = 5;
    static lockoutTime = 15 * 60 * 1000; // 15 minutes

    /**
     * Initialize authentication system
     */
    static init() {
        console.log('🔐 Auth system initializing...');
        this.loadDefaultUsers();
        this.setupEventListeners();
        this.checkSession();
        this.startSessionMonitor();
        console.log('✅ Auth system ready');
    }

    /**
     * Create default users if none exist
     */
    static loadDefaultUsers() {
        let users = DataManager.getData('users', []);
        
        if (users.length === 0) {
            const defaultUsers = [
                {
                    id: 'admin-001',
                    email: 'admin@cwags.org',
                    password: 'admin123', // In production, hash this
                    firstName: 'System',
                    lastName: 'Administrator',
                    role: 'admin',
                    isActive: true,
                    permissions: ['all'],
                    createdAt: new Date().toISOString(),
                    lastLogin: null
                },
                {
                    id: 'demo-001',
                    email: 'demo@cwags.org',
                    password: 'demo123',
                    firstName: 'Demo',
                    lastName: 'User',
                    role: 'user',
                    isActive: true,
                    permissions: ['view', 'entry'],
                    createdAt: new Date().toISOString(),
                    lastLogin: null
                }
            ];
            
            DataManager.saveData('users', defaultUsers);
            console.log('👥 Default users created');
        }
    }

    /**
     * Setup event listeners for login/logout
     */
    static setupEventListeners() {
        const loginForm = document.getElementById('login-form-element');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Handle Enter key in password field
        const passwordField = document.getElementById('login-password');
        if (passwordField) {
            passwordField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleLogin();
                }
            });
        }
    }

    /**
     * Handle login attempt
     */
    static handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        console.log('🔑 Login attempt for:', email);

        // Validate input
        if (!email || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        // Check for account lockout
        if (this.isAccountLocked(email)) {
            const lockoutEnd = new Date(this.loginAttempts[email].lockoutUntil);
            const remainingTime = Math.ceil((lockoutEnd - Date.now()) / 60000);
            this.showMessage(`Account locked. Try again in ${remainingTime} minutes.`, 'error');
            return;
        }

        // Validate credentials
        const users = DataManager.getData('users', []);
        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password &&
            u.isActive !== false
        );

        if (user) {
            this.handleSuccessfulLogin(user, rememberMe);
        } else {
            this.handleFailedLogin(email);
        }
    }

    /**
     * Handle successful login
     */
    static handleSuccessfulLogin(user, rememberMe) {
        console.log('✅ Login successful for:', user.email);
        
        // Reset login attempts
        delete this.loginAttempts[user.email];
        
        // Update user's last login
        this.updateLastLogin(user.id);
        
        // Create session
        const session = {
            user: user,
            loginTime: new Date().toISOString(),
            rememberMe: rememberMe,
            expiresAt: rememberMe ? 
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 days
                new Date(Date.now() + this.sessionTimeout).toISOString()
        };
        
        this.currentUser = user;
        localStorage.setItem('cwags_session', JSON.stringify(session));
        
        this.showMessage('Login successful!', 'success');
        
        setTimeout(() => {
            this.showMainApp();
            this.updateUserDisplay();
            this.logActivity('login', user.id);
        }, 1000);
    }

    /**
     * Handle failed login
     */
    static handleFailedLogin(email) {
        console.log('❌ Login failed for:', email);
        
        // Track failed attempts
        if (!this.loginAttempts[email]) {
            this.loginAttempts[email] = { count: 0, attempts: [] };
        }
        
        this.loginAttempts[email].count++;
        this.loginAttempts[email].attempts.push(new Date().toISOString());
        
        // Lock account after max attempts
        if (this.loginAttempts[email].count >= this.maxAttempts) {
            this.loginAttempts[email].lockoutUntil = new Date(Date.now() + this.lockoutTime).toISOString();
            this.showMessage(`Too many failed attempts. Account locked for 15 minutes.`, 'error');
        } else {
            const remaining = this.maxAttempts - this.loginAttempts[email].count;
            this.showMessage(`Invalid credentials. ${remaining} attempts remaining.`, 'error');
        }
        
        this.logActivity('failed_login', email);
    }

    /**
     * Check if account is locked
     */
    static isAccountLocked(email) {
        const attempts = this.loginAttempts[email];
        if (!attempts || !attempts.lockoutUntil) return false;
        
        const lockoutEnd = new Date(attempts.lockoutUntil);
        if (Date.now() > lockoutEnd.getTime()) {
            // Lockout expired, reset attempts
            delete this.loginAttempts[email];
            return false;
        }
        
        return true;
    }

    /**
     * Update user's last login timestamp
     */
    static updateLastLogin(userId) {
        const users = DataManager.getData('users', []);
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex].lastLogin = new Date().toISOString();
            DataManager.saveData('users', users);
        }
    }

    /**
     * Logout user
     */
    static logout() {
        if (this.currentUser) {
            this.logActivity('logout', this.currentUser.id);
        }
        
        this.currentUser = null;
        localStorage.removeItem('cwags_session');
        this.showAuthModal();
        console.log('👋 User logged out');
    }

    /**
     * Check current session validity
     */
    static checkSession() {
        const sessionData = localStorage.getItem('cwags_session');
        if (!sessionData) return false;

        try {
            const session = JSON.parse(sessionData);
            const now = new Date();
            const expiresAt = new Date(session.expiresAt);

            if (now > expiresAt) {
                console.log('⏰ Session expired');
                this.logout();
                return false;
            }

            // Session is valid
            this.currentUser = session.user;
            return true;
        } catch (error) {
            console.error('❌ Session check error:', error);
            this.logout();
            return false;
        }
    }

    /**
     * Check if user is logged in
     */
    static isLoggedIn() {
        return this.currentUser !== null && this.checkSession();
    }

    /**
     * Get current user
     */
    static getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user has permission
     */
    static hasPermission(permission) {
        if (!this.currentUser) return false;
        
        const permissions = this.currentUser.permissions || [];
        return permissions.includes('all') || permissions.includes(permission);
    }

    /**
     * Check if user has role
     */
    static hasRole(role) {
        if (!this.currentUser) return false;
        return this.currentUser.role === role;
    }

    /**
     * Update user display in header
     */
    static updateUserDisplay() {
        const user = this.getCurrentUser();
        if (user) {
            const userNameEl = document.getElementById('user-name');
            if (userNameEl) {
                userNameEl.textContent = `${user.firstName} ${user.lastName}`;
                userNameEl.title = `Role: ${user.role} | Email: ${user.email}`;
            }
        }
    }

    /**
     * Show authentication modal
     */
    static showAuthModal() {
        const authModal = document.getElementById('auth-modal');
        const mainApp = document.getElementById('main-app');
        
        if (authModal) authModal.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
        
        // Clear form fields
        const emailField = document.getElementById('login-email');
        const passwordField = document.getElementById('login-password');
        if (passwordField) passwordField.value = '';
        if (emailField) emailField.focus();
    }

    /**
     * Show main application
     */
    static showMainApp() {
        const authModal = document.getElementById('auth-modal');
        const mainApp = document.getElementById('main-app');
        
        if (authModal) authModal.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
    }

    /**
     * Show message to user
     */
    static showMessage(message, type) {
        const messageArea = document.getElementById('message-area');
        if (messageArea) {
            const className = type === 'error' ? 'auth-error' : 'auth-success';
            messageArea.innerHTML = `<div class="${className}">${message}</div>`;
            
            if (type === 'success') {
                setTimeout(() => {
                    messageArea.innerHTML = '';
                }, 3000);
            }
        }
    }

    /**
     * Start session monitoring
     */
    static startSessionMonitor() {
        setInterval(() => {
            if (this.isLoggedIn()) {
                // Extend session if user is active
                this.extendSession();
            }
        }, 60000); // Check every minute
    }

    /**
     * Extend current session
     */
    static extendSession() {
        const sessionData = localStorage.getItem('cwags_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                if (!session.rememberMe) {
                    // Only extend if not "remember me"
                    session.expiresAt = new Date(Date.now() + this.sessionTimeout).toISOString();
                    localStorage.setItem('cwags_session', JSON.stringify(session));
                }
            } catch (error) {
                console.error('❌ Session extension error:', error);
            }
        }
    }

    /**
     * Log user activity
     */
    static logActivity(action, userId) {
        try {
            const activity = {
                id: 'activity-' + Date.now(),
                action: action,
                userId: userId,
                timestamp: new Date().toISOString(),
                ip: 'unknown', // In real app, get from server
                userAgent: navigator.userAgent
            };
            
            const activities = DataManager.getData('activities', []);
            activities.push(activity);
            
            // Keep only last 1000 activities
            if (activities.length > 1000) {
                activities.splice(0, activities.length - 1000);
            }
            
            DataManager.saveData('activities', activities);
        } catch (error) {
            console.error('❌ Activity logging error:', error);
        }
    }

    /**
     * Get user activities
     */
    static getUserActivities(userId, limit = 50) {
        const activities = DataManager.getData('activities', []);
        return activities
            .filter(a => a.userId === userId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    /**
     * Change user password
     */
    static changePassword(userId, oldPassword, newPassword) {
        try {
            const users = DataManager.getData('users', []);
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex === -1) {
                return { success: false, message: 'User not found' };
            }
            
            const user = users[userIndex];
            if (user.password !== oldPassword) {
                return { success: false, message: 'Current password is incorrect' };
            }
            
            if (newPassword.length < 6) {
                return { success: false, message: 'New password must be at least 6 characters' };
            }
            
            users[userIndex].password = newPassword;
            users[userIndex].passwordChangedAt = new Date().toISOString();
            DataManager.saveData('users', users);
            
            this.logActivity('password_change', userId);
            
            return { success: true, message: 'Password changed successfully' };
        } catch (error) {
            console.error('❌ Password change error:', error);
            return { success: false, message: 'Error changing password' };
        }
    }

    /**
     * Get login statistics
     */
    static getLoginStats() {
        const activities = DataManager.getData('activities', []);
        const logins = activities.filter(a => a.action === 'login');
        const failedLogins = activities.filter(a => a.action === 'failed_login');
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayLogins = logins.filter(l => new Date(l.timestamp) >= today);
        const todayFailedLogins = failedLogins.filter(l => new Date(l.timestamp) >= today);
        
        return {
            totalLogins: logins.length,
            totalFailedLogins: failedLogins.length,
            todayLogins: todayLogins.length,
            todayFailedLogins: todayFailedLogins.length,
            uniqueUsers: new Set(logins.map(l => l.userId)).size
        };
    }
}

// Make Auth globally available
window.Auth = Auth;
