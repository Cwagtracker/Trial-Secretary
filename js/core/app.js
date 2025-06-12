/**
 * C-WAGS Main Application Controller
 * Coordinates all modules and handles navigation
 */

class CWAGSApp {
    static currentModule = 'dashboard';
    static modules = new Map();
    static initialized = false;

    /**
     * Initialize the application
     */
    static init() {
        if (this.initialized) {
            console.warn('⚠️ App already initialized');
            return;
        }

        console.log('🚀 Initializing C-WAGS Application...');
        
        try {
            // Initialize core systems
            DataManager.initializeDefaults();
            Auth.init();
            
            // Setup application event listeners
            this.setupEventListeners();
            
            // Register available modules
            this.registerModules();
            
            // Check authentication and load appropriate view
            this.checkAuthAndLoad();
            
            // Setup global error handling
            this.setupErrorHandling();
            
            this.initialized = true;
            console.log('✅ C-WAGS Application ready!');
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.showErrorMessage('Application failed to initialize. Please refresh the page.');
        }
    }

    /**
     * Setup event listeners for navigation and global actions
     */
    static setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const moduleName = e.target.dataset.module;
                if (moduleName) {
                    this.switchModule(moduleName);
                    this.updateActiveNavButton(e.target);
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            this.handleBeforeUnload();
        });

        window.addEventListener('online', () => {
            console.log('🌐 Connection restored');
            this.showNotification('Connection restored', 'success');
        });

        window.addEventListener('offline', () => {
            console.log('📡 Connection lost');
            this.showNotification('Working offline', 'warning');
        });
    }

    /**
     * Register available modules
     */
    static registerModules() {
        const moduleDefinitions = [
            { name: 'dashboard', class: 'Dashboard', title: 'Dashboard' },
            { name: 'trial-setup', class: 'TrialSetup', title: 'Trial Setup' },
            { name: 'entries', class: 'EntryManagement', title: 'Entry Management' },
            { name: 'paperwork', class: 'PaperworkGenerator', title: 'Paperwork Generation' },
            { name: 'scoring', class: 'ScoringSystem', title: 'Scoring & Results' },
            { name: 'admin', class: 'AdminPanel', title: 'Admin Panel' }
        ];

        moduleDefinitions.forEach(def => {
            this.modules.set(def.name, {
                className: def.class,
                title: def.title,
                loaded: false,
                instance: null
            });
        });

        console.log(`📦 Registered ${this.modules.size} modules`);
    }

    /**
     * Check authentication and load appropriate view
     */
    static checkAuthAndLoad() {
        if (Auth.isLoggedIn()) {
            Auth.showMainApp();
            Auth.updateUserDisplay();
            this.switchModule('dashboard');
        } else {
            Auth.showAuthModal();
        }
    }

    /**
     * Switch to a different module
     */
    static switchModule(moduleName) {
        try {
            console.log(`🔄 Switching to module: ${moduleName}`);
            
            // Check permissions
            if (!this.checkModulePermissions(moduleName)) {
                this.showErrorMessage('You do not have permission to access this module.');
                return;
            }

            // Update current module
            this.currentModule = moduleName;
            
            // Update URL hash (for browser back/forward)
            window.location.hash = moduleName;
            
            // Load the module
            this.loadModule(moduleName);
            
        } catch (error) {
            console.error(`❌ Error switching to module ${moduleName}:`, error);
            this.showErrorMessage('Failed to load module. Please try again.');
        }
    }

    /**
     * Load a specific module
     */
    static loadModule(moduleName) {
        const moduleInfo = this.modules.get(moduleName);
        
        if (!moduleInfo) {
            console.error(`❌ Unknown module: ${moduleName}`);
            this.loadFallbackContent(moduleName);
            return;
