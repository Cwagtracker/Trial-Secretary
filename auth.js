// js/core/auth.js
class Auth {
    static init() {
        this.setupEventListeners();
        this.loadStoredUsers();
    }

    static setupEventListeners() {
        // Login form
        document.getElementById('login-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Registration form
        document.getElementById('register-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    }

    static loadStoredUsers() {
        // Load users from localStorage or create default admin
        let users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        
        // Create default admin if no users exist
        if (users.length === 0) {
            const defaultAdmin = {
                id: 'admin-001',
                email: 'admin@cwags.org',
                password: this.hashPassword('admin123'), // In production, use proper hashing
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
            console.log('Default admin created - Email: admin@cwags.org, Password: admin123');
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
            const user = this.authenticateUser(email, password);
            if (user) {
                this.loginUser(user, rememberMe);
                showMainApp();
            } else {
                this.showError('Invalid email or password');
            }
        } catch (error) {
            this.showError('Login failed: ' + error.message);
        }
    }

    static async handleRegister() {
        const formData = {
            firstName: document.getElementById('reg-first-name').value.trim(),
            lastName: document.getElementById('reg-last-name').value.trim(),
            email: document.getElementById('reg-email').value.trim(),
            organization: document.getElementById('reg-organization').value.trim(),
            phone: document.getElementById('reg-phone').value.trim(),
            password: document.getElementById('reg-password').value,
            confirmPassword: document.getElementById('reg-confirm-password').value,
            role: document.getElementById('reg-role').value
        };

        // Validation
        if (!this.validateRegistration(formData)) {
            return;
        }

        try {
            const newUser = this.createUser(formData);
            this.showSuccess('Registration successful! Please login with your credentials.');
            showLoginForm();
            document.getElementById('register-form-element').reset();
        } catch (error) {
            this.showError('Registration failed: ' + error.message);
        }
    }

    static validateRegistration(data) {
        // Check required fields
        const required = ['firstName', 'lastName', 'email', 'organization', 'phone', 'password', 'role'];
        for (let field of required) {
            if (!data[field]) {
                this.showError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }

        // Check email format
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
            organization: data.organization,
            phone: data.phone,
            role: data.role,
            isActive: true,
            createdAt: new Date().toISOString(),
            permissions: this.getDefaultPermissions(data.role)
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
            rememberMe: rememberMe
        };

        // Store session
        if (rememberMe) {
            localStorage.setItem('cwags_session', JSON.stringify(session));
        } else {
            sessionStorage.setItem('cwags_session', JSON.stringify(session));
        }

        // Update user info in UI
        this.updateUserInterface(session.user);
    }

    static updateUserInterface(user) {
        document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('user-role').textContent = user.role.toUpperCase();

        // Show/hide admin features
        const adminElements = document.querySelectorAll('.admin-only');
        const isAdmin = user.role === 'admin' || user.permissions.includes('all');
        adminElements.forEach(el => {
            el.style.display = isAdmin ? 'block' : 'none';
        });
    }

    static logout() {
        localStorage.removeItem('cwags_session');
        sessionStorage.removeItem('cwags_session');
        showAuthModal();
        
        // Clear forms
        document.getElementById('login-form-element').reset();
        showLoginForm();
    }

    static isLoggedIn() {
        const session = this.getSession();
        return session && session.user;
    }

    static getCurrentUser() {
        const session = this.getSession();
        return session ? session.user : null;
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

    static hashPassword(password) {
        // Simple hash for demo - in production use bcrypt or similar
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

    static showError(message) {
        // Create or update error message
        this.showMessage(message, 'error');
    }

    static showSuccess(message) {
        this.showMessage(message, 'success');
    }

    static showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.auth-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageEl = document.createElement('div');
        messageEl.className = `auth-message auth-${type}`;
        messageEl.textContent = message;

        // Insert into current form
        const activeForm = document.querySelector('.auth-form:not([style*="display: none"])');
        if (activeForm) {
            activeForm.insertBefore(messageEl, activeForm.querySelector('form'));
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }
}

// Initialize authentication when script loads
Auth.init();