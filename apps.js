// js/core/app.js
class App {
    static init() {
        this.currentModule = null;
        this.setupEventListeners();
        this.initializeModules();
        console.log('C-WAGS Trial Management System initialized');
    }

    static setupEventListeners() {
        // Navigation event listeners
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const module = e.target.dataset.module;
                if (module) {
                    this.loadModule(module);
                    this.setActiveNavButton(e.target);
                }
            });
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveCurrentWork();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.createNew();
                        break;
                    case 'p':
                        e.preventDefault();
                        this.printCurrent();
                        break;
                }
            }
        });

        // Handle data changes from other tabs
        window.addEventListener('cwagsDataChanged', (e) => {
            this.handleDataChange(e.detail);
        });

        // Handle offline/online status
        window.addEventListener('online', () => {
            this.setStatus('Back online', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.setStatus('Working offline', 'warning');
        });
    }

    static initializeModules() {
        // Initialize core systems
        Auth.init();
        DataManager.init();
        
        // Load default module
        this.loadModule('dashboard');
    }

    static loadUserInterface() {
        const user = Auth.getCurrentUser();
        if (!user) {
            showAuthModal();
            return;
        }

        // Update user interface
        this.updateUserDisplay(user);
        this.setupUserPermissions(user);
        this.loadUserPreferences(user);
    }

    static updateUserDisplay(user) {
        document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('user-role').textContent = user.role.toUpperCase();
        
        // Show/hide admin features
        const adminElements = document.querySelectorAll('.admin-only');
        const isAdmin = user.role === 'admin' || user.permissions.includes('all');
        adminElements.forEach(el => {
            el.style.display = isAdmin ? 'block' : 'none';
        });
    }

    static setupUserPermissions(user) {
        // Configure interface based on user permissions
        const permissions = user.permissions || [];
        
        // Hide/show features based on permissions
        if (!this.hasPermission(user, 'approve_trials')) {
            document.querySelectorAll('[data-requires="approve_trials"]').forEach(el => {
                el.style.display = 'none';
            });
        }
        
        if (!this.hasPermission(user, 'create_trials')) {
            document.querySelectorAll('[data-requires="create_trials"]').forEach(el => {
                el.style.display = 'none';
            });
        }
    }

    static hasPermission(user, permission) {
        return user.permissions.includes('all') || user.permissions.includes(permission);
    }

    static loadUserPreferences(user) {
        const preferences = DataManager.getSetting(`user_preferences_${user.id}`) || {};
        
        // Apply user preferences
        if (preferences.defaultModule) {
            this.loadModule(preferences.defaultModule);
        }
        
        if (preferences.theme) {
            this.setTheme(preferences.theme);
        }
    }

    // ===================
    // MODULE MANAGEMENT
    // ===================

    static async loadModule(moduleName) {
        try {
            this.showLoading(`Loading ${moduleName}...`);
            
            // Save current work before switching
            if (this.currentModule && this.currentModule !== moduleName) {
                await this.saveCurrentWork();
            }
            
            // Load the module
            switch(moduleName) {
                case 'dashboard':
                    Dashboard.init();
                    break;
                case 'trial-setup':
                    TrialSetup.init();
                    break;
                case 'entries':
                    EntryManagement.init();
                    break;
                case 'paperwork':
                    PaperworkGenerator.init();
                    break;
                case 'scoring':
                    ScoringSystem.init();
                    break;
                case 'admin':
                    if (this.hasAdminAccess()) {
                        AdminPanel.init();
                    } else {
                        this.showAlert('Access denied. Admin privileges required.', 'danger');
                        return;
                    }
                    break;
                default:
                    this.showAlert(`Module ${moduleName} not found`, 'warning');
                    return;
            }
            
            this.currentModule = moduleName;
            this.updateBreadcrumb(moduleName);
            this.setStatus(`Loaded ${moduleName}`, 'success');
            
        } catch (error) {
            console.error('Error loading module:', error);
            this.showAlert(`Failed to load ${moduleName}: ${error.message}`, 'danger');
        } finally {
            this.hideLoading();
        }
    }

    static hasAdminAccess() {
        const user = Auth.getCurrentUser();
        return user && (user.role === 'admin' || user.permissions.includes('all'));
    }

    static setActiveNavButton(activeButton) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    static updateBreadcrumb(moduleName) {
        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb) {
            const moduleNames = {
                'dashboard': 'Dashboard',
                'trial-setup': 'Trial Setup',
                'entries': 'Entry Management',
                'paperwork': 'Paperwork Generation',
                'scoring': 'Scoring & Results',
                'admin': 'Admin Panel'
            };
            breadcrumb.textContent = `Home > ${moduleNames[moduleName] || moduleName}`;
        }
    }

    // ===================
    // USER INTERFACE HELPERS
    // ===================

    static showAlert(message, type = 'info') {
        // Remove existing alerts
        document.querySelectorAll('.app-alert').forEach(alert => alert.remove());
        
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} app-alert`;
        alertDiv.textContent = message;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'alert-close';
        closeBtn.onclick = () => alertDiv.remove();
        alertDiv.appendChild(closeBtn);
        
        // Insert after main nav
        const mainNav = document.querySelector('.main-nav');
        mainNav.parentNode.insertBefore(alertDiv, mainNav.nextSibling);
        
        // Auto-remove after 5 seconds for non-danger alerts
        if (type !== 'danger') {
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 5000);
        }
    }

    static showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        const text = document.querySelector('.loading-text');
        if (text) {
            text.textContent = message;
        }
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    static hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    static setStatus(message, type = 'info') {
        const statusEl = document.getElementById('status-message');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `status-${type}`;
        }
        
        // Update last saved time
        const lastSavedEl = document.getElementById('last-saved');
        if (lastSavedEl && type === 'success' && message.includes('saved')) {
            lastSavedEl.textContent = `Last saved: ${new Date().toLocaleTimeString()}`;
        }
    }

    static confirmAction(message, callback) {
        if (confirm(message)) {
            callback();
        }
    }

    static promptUser(message, defaultValue = '') {
        const result = prompt(message, defaultValue);
        return result ? result.trim() : null;
    }

    // ===================
    // DATA OPERATIONS
    // ===================

    static async saveCurrentWork() {
        try {
            // This would save any pending changes in the current module
            if (this.currentModule) {
                const moduleInstance = this.getModuleInstance(this.currentModule);
                if (moduleInstance && typeof moduleInstance.save === 'function') {
                    await moduleInstance.save();
                }
            }
            return true;
        } catch (error) {
            console.error('Error saving current work:', error);
            return false;
        }
    }

    static getModuleInstance(moduleName) {
        const moduleMap = {
            'dashboard': Dashboard,
            'trial-setup': TrialSetup,
            'entries': EntryManagement,
            'paperwork': PaperworkGenerator,
            'scoring': ScoringSystem,
            'admin': AdminPanel
        };
        return moduleMap[moduleName];
    }

    static createNew() {
        // Generic create new function - delegates to current module
        if (this.currentModule) {
            const moduleInstance = this.getModuleInstance(this.currentModule);
            if (moduleInstance && typeof moduleInstance.createNew === 'function') {
                moduleInstance.createNew();
            }
        }
    }

    static printCurrent() {
        // Generic print function
        window.print();
    }

    static handleDataChange(detail) {
        // Handle data changes from other browser tabs
        console.log('Data changed in another tab:', detail.key);
        
        // Refresh current module if needed
        if (this.currentModule) {
            const moduleInstance = this.getModuleInstance(this.currentModule);
            if (moduleInstance && typeof moduleInstance.refresh === 'function') {
                moduleInstance.refresh();
            }
        }
    }

    // ===================
    // THEME & PREFERENCES
    // ===================

    static setTheme(theme) {
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${theme}`);
        
        const user = Auth.getCurrentUser();
        if (user) {
            const preferences = DataManager.getSetting(`user_preferences_${user.id}`) || {};
            preferences.theme = theme;
            DataManager.saveSetting(`user_preferences_${user.id}`, preferences);
        }
    }

    static saveUserPreference(key, value) {
        const user = Auth.getCurrentUser();
        if (user) {
            const preferences = DataManager.getSetting(`user_preferences_${user.id}`) || {};
            preferences[key] = value;
            DataManager.saveSetting(`user_preferences_${user.id}`, preferences);
        }
    }

    // ===================
    // UTILITY FUNCTIONS
    // ===================

    static formatDate(date, format = 'short') {
        if (!date) return '';
        
        const d = new Date(date);
        const options = {
            'short': { month: 'short', day: 'numeric', year: 'numeric' },
            'long': { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
            'time': { hour: '2-digit', minute: '2-digit' },
            'datetime': { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        };
        
        return d.toLocaleDateString('en-US', options[format] || options.short);
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static generatePrintableReport(title, content) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <link rel="stylesheet" href="css/print.css">
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .report-header { text-align: center; margin-bottom: 30px; }
                    .report-footer { margin-top: 30px; font-size: 12px; color: #666; }
                    @media print { .no-print { display: none !important; } }
                </style>
            </head>
            <body>
                <div class="report-header">
                    <h1>${title}</h1>
                    <p>Generated: ${new Date().toLocaleString()}</p>
                </div>
                ${content}
                <div class="report-footer">
                    <p>Generated by C-WAGS Trial Management System</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        
        // Auto-print after a short delay
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    static downloadFile(content, filename, contentType = 'text/plain') {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    // ===================
    // ERROR HANDLING
    // ===================

    static handleError(error, context = 'Application') {
        console.error(`${context} Error:`, error);
        
        let message = 'An unexpected error occurred';
        if (error.message) {
            message = error.message;
        }
        
        this.showAlert(`${context}: ${message}`, 'danger');
        
        // Log error for debugging
        this.logError(error, context);
    }

    static logError(error, context) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            context: context,
            message: error.message,
            stack: error.stack,
            user: Auth.getCurrentUser()?.id,
            module: this.currentModule,
            url: window.location.href
        };
        
        // In a production environment, this would be sent to a logging service
        console.log('Error logged:', errorLog);
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    App.handleError(event.error, 'Global');
});

window.addEventListener('unhandledrejection', (event) => {
    App.handleError