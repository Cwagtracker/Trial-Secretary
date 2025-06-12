// js/core/data-manager.js
class DataManager {
    static init() {
        this.setupStorageKeys();
        this.setupEventListeners();
        this.migrateOldData();
    }

    static setupStorageKeys() {
        this.keys = {
            USERS: 'cwags_users',
            TRIALS: 'cwags_trials',
            ENTRIES: 'cwags_entries',
            SCORES: 'cwags_scores',
            SETTINGS: 'cwags_settings',
            SESSION: 'cwags_session',
            DOGS: 'cwags_dogs',
            HANDLERS: 'cwags_handlers'
        };
    }

    static setupEventListeners() {
        // Listen for storage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('cwags_')) {
                this.handleStorageChange(e);
            }
        });

        // Auto-save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveAllPendingData();
        });
    }

    static handleStorageChange(event) {
        // Handle data changes from other browser tabs
        console.log('Storage changed:', event.key);
        // Emit custom event for modules to listen to
        window.dispatchEvent(new CustomEvent('cwagsDataChanged', {
            detail: { key: event.key, newValue: event.newValue }
        }));
    }

    // ===================
    // TRIAL MANAGEMENT
    // ===================

    static getTrials() {
        return this.getData(this.keys.TRIALS, []);
    }

    static getTrial(trialId) {
        const trials = this.getTrials();
        return trials.find(trial => trial.id === trialId);
    }

    static saveTrial(trial) {
        const trials = this.getTrials();
        trial.updatedAt = new Date().toISOString();
        
        if (!trial.id) {
            trial.id = this.generateId('trial');
            trial.createdAt = trial.updatedAt;
            trials.push(trial);
        } else {
            const index = trials.findIndex(t => t.id === trial.id);
            if (index >= 0) {
                trials[index] = { ...trials[index], ...trial };
            } else {
                trials.push(trial);
            }
        }
        
        this.saveData(this.keys.TRIALS, trials);
        return trial;
    }

    static deleteTrial(trialId) {
        const trials = this.getTrials();
        const filteredTrials = trials.filter(trial => trial.id !== trialId);
        
        // Also delete related entries and scores
        this.deleteTrialEntries(trialId);
        this.deleteTrialScores(trialId);
        
        this.saveData(this.keys.TRIALS, filteredTrials);
        return true;
    }

    static getTrialsByStatus(status) {
        const trials = this.getTrials();
        return trials.filter(trial => trial.status === status);
    }

    static getTrialsByHost(hostId) {
        const trials = this.getTrials();
        return trials.filter(trial => trial.hostId === hostId);
    }

    // ===================
    // ENTRY MANAGEMENT
    // ===================

    static getEntries() {
        return this.getData(this.keys.ENTRIES, []);
    }

    static getEntry(entryId) {
        const entries = this.getEntries();
        return entries.find(entry => entry.id === entryId);
    }

    static getTrialEntries(trialId) {
        const entries = this.getEntries();
        return entries.filter(entry => entry.trialId === trialId);
    }

    static saveEntry(entry) {
        const entries = this.getEntries();
        entry.updatedAt = new Date().toISOString();
        
        if (!entry.id) {
            entry.id = this.generateId('entry');
            entry.createdAt = entry.updatedAt;
            entries.push(entry);
        } else {
            const index = entries.findIndex(e => e.id === entry.id);
            if (index >= 0) {
                entries[index] = { ...entries[index], ...entry };
            } else {
                entries.push(entry);
            }
        }
        
        this.saveData(this.keys.ENTRIES, entries);
        return entry;
    }

    static deleteEntry(entryId) {
        const entries = this.getEntries();
        const filteredEntries = entries.filter(entry => entry.id !== entryId);
        this.saveData(this.keys.ENTRIES, filteredEntries);
        return true;
    }

    static deleteTrialEntries(trialId) {
        const entries = this.getEntries();
        const filteredEntries = entries.filter(entry => entry.trialId !== trialId);
        this.saveData(this.keys.ENTRIES, filteredEntries);
        return true;
    }

    static getEntriesByHandler(handlerName) {
        const entries = this.getEntries();
        return entries.filter(entry => 
            entry.handlerName.toLowerCase().includes(handlerName.toLowerCase())
        );
    }

    static canEditEntry(entryId) {
        const entry = this.getEntry(entryId);
        if (!entry) return false;
        
        const trial = this.getTrial(entry.trialId);
        if (!trial) return false;
        
        const cutoffTime = new Date(trial.date);
        cutoffTime.setHours(cutoffTime.getHours() - 24); // 24 hours before
        
        return new Date() < cutoffTime;
    }

    // ===================
    // SCORING MANAGEMENT
    // ===================

    static getScores() {
        return this.getData(this.keys.SCORES, []);
    }

    static getTrialScores(trialId) {
        const scores = this.getScores();
        return scores.filter(score => score.trialId === trialId);
    }

    static getScoresForEntry(entryId) {
        const scores = this.getScores();
        return scores.filter(score => score.entryId === entryId);
    }

    static saveScore(score) {
        const scores = this.getScores();
        score.updatedAt = new Date().toISOString();
        
        if (!score.id) {
            score.id = this.generateId('score');
            score.createdAt = score.updatedAt;
            scores.push(score);
        } else {
            const index = scores.findIndex(s => s.id === score.id);
            if (index >= 0) {
                scores[index] = { ...scores[index], ...score };
            } else {
                scores.push(score);
            }
        }
        
        this.saveData(this.keys.SCORES, scores);
        return score;
    }

    static deleteTrialScores(trialId) {
        const scores = this.getScores();
        const filteredScores = scores.filter(score => score.trialId !== trialId);
        this.saveData(this.keys.SCORES, filteredScores);
        return true;
    }

    // ===================
    // DOG/HANDLER DATA
    // ===================

    static getDogs() {
        return this.getData(this.keys.DOGS, []);
    }

    static getDog(registrationNumber) {
        const dogs = this.getDogs();
        return dogs.find(dog => dog.registrationNumber === registrationNumber);
    }

    static saveDog(dog) {
        const dogs = this.getDogs();
        dog.updatedAt = new Date().toISOString();
        
        if (!dog.id) {
            dog.id = this.generateId('dog');
            dog.createdAt = dog.updatedAt;
            dogs.push(dog);
        } else {
            const index = dogs.findIndex(d => d.id === dog.id);
            if (index >= 0) {
                dogs[index] = { ...dogs[index], ...dog };
            } else {
                dogs.push(dog);
            }
        }
        
        this.saveData(this.keys.DOGS, dogs);
        return dog;
    }

    static getHandlers() {
        return this.getData(this.keys.HANDLERS, []);
    }

    static getHandler(handlerName) {
        const handlers = this.getHandlers();
        return handlers.find(handler => 
            handler.name.toLowerCase() === handlerName.toLowerCase()
        );
    }

    static saveHandler(handler) {
        const handlers = this.getHandlers();
        handler.updatedAt = new Date().toISOString();
        
        if (!handler.id) {
            handler.id = this.generateId('handler');
            handler.createdAt = handler.updatedAt;
            handlers.push(handler);
        } else {
            const index = handlers.findIndex(h => h.id === handler.id);
            if (index >= 0) {
                handlers[index] = { ...handlers[index], ...handler };
            } else {
                handlers.push(handler);
            }
        }
        
        this.saveData(this.keys.HANDLERS, handlers);
        return handler;
    }

    // ===================
    // SEARCH & FILTERING
    // ===================

    static searchTrials(query) {
        const trials = this.getTrials();
        const searchLower = query.toLowerCase();
        
        return trials.filter(trial => 
            trial.name.toLowerCase().includes(searchLower) ||
            trial.host.toLowerCase().includes(searchLower) ||
            trial.location.toLowerCase().includes(searchLower) ||
            trial.judges.some(judge => judge.toLowerCase().includes(searchLower))
        );
    }

    static searchEntries(query) {
        const entries = this.getEntries();
        const searchLower = query.toLowerCase();
        
        return entries.filter(entry => 
            entry.handlerName.toLowerCase().includes(searchLower) ||
            entry.dogName.toLowerCase().includes(searchLower) ||
            entry.registrationNumber.toLowerCase().includes(searchLower)
        );
    }

    static getTrialStatistics(trialId) {
        const entries = this.getTrialEntries(trialId);
        const scores = this.getTrialScores(trialId);
        
        return {
            totalEntries: entries.length,
            regularEntries: entries.filter(e => e.entryType !== 'feo').length,
            feoEntries: entries.filter(e => e.entryType === 'feo').length,
            uniqueHandlers: new Set(entries.map(e => e.handlerName)).size,
            uniqueDogs: new Set(entries.map(e => e.registrationNumber)).size,
            completedScores: scores.length,
            averageScore: this.calculateAverageScore(scores),
            qualificationRate: this.calculateQualificationRate(scores)
        };
    }

    static calculateAverageScore(scores) {
        const validScores = scores.filter(s => s.totalScore && !isNaN(s.totalScore));
        if (validScores.length === 0) return 0;
        
        const sum = validScores.reduce((acc, score) => acc + score.totalScore, 0);
        return Math.round(sum / validScores.length * 100) / 100;
    }

    static calculateQualificationRate(scores) {
        const validScores = scores.filter(s => s.qualified !== undefined);
        if (validScores.length === 0) return 0;
        
        const qualified = validScores.filter(s => s.qualified).length;
        return Math.round(qualified / validScores.length * 100);
    }

    // ===================
    // SETTINGS MANAGEMENT
    // ===================

    static getSettings() {
        return this.getData(this.keys.SETTINGS, this.getDefaultSettings());
    }

    static getSetting(key) {
        const settings = this.getSettings();
        return settings[key];
    }

    static saveSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        settings.updatedAt = new Date().toISOString();
        this.saveData(this.keys.SETTINGS, settings);
        return value;
    }

    static getDefaultSettings() {
        return {
            organization: 'C-WAGS',
            defaultJumpHeights: ['8', '12', '16', '20', '24'],
            defaultClasses: [
                { name: 'Level 1', rounds: ['CTH', 'FFF', 'WA'] },
                { name: 'Level 2', rounds: ['CTH2', 'FFF2', 'WA2'] },
                { name: 'Video Level 1', rounds: ['Video'] }
            ],
            scoringOptions: {
                qualifyingPercentage: 70,
                useColorCoding: true,
                autoCalculate: true
            },
            printOptions: {
                includeInstructions: true,
                autoNumbering: true,
                colorCoding: true
            },
            notifications: {
                entryConfirmations: true,
                scoreSubmissions: true,
                trialUpdates: true
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    // ===================
    // BACKUP & RESTORE
    // ===================

    static exportAllData() {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: {
                trials: this.getTrials(),
                entries: this.getEntries(),
                scores: this.getScores(),
                dogs: this.getDogs(),
                handlers: this.getHandlers(),
                settings: this.getSettings()
            }
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    static importData(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            
            if (!importData.version || !importData.data) {
                throw new Error('Invalid data format');
            }
            
            // Backup current data
            this.createBackup();
            
            // Import each data type
            if (importData.data.trials) {
                this.saveData(this.keys.TRIALS, importData.data.trials);
            }
            if (importData.data.entries) {
                this.saveData(this.keys.ENTRIES, importData.data.entries);
            }
            if (importData.data.scores) {
                this.saveData(this.keys.SCORES, importData.data.scores);
            }
            if (importData.data.dogs) {
                this.saveData(this.keys.DOGS, importData.data.dogs);
            }
            if (importData.data.handlers) {
                this.saveData(this.keys.HANDLERS, importData.data.handlers);
            }
            if (importData.data.settings) {
                this.saveData(this.keys.SETTINGS, importData.data.settings);
            }
            
            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            return { success: false, message: 'Import failed: ' + error.message };
        }
    }

    static createBackup() {
        const backupKey = `cwags_backup_${Date.now()}`;
        const backupData = this.exportAllData();
        localStorage.setItem(backupKey, backupData);
        
        // Keep only last 5 backups
        this.cleanupBackups();
        
        return backupKey;
    }

    static cleanupBackups() {
        const keys = Object.keys(localStorage);
        const backupKeys = keys.filter(key => key.startsWith('cwags_backup_'))
            .sort((a, b) => {
                const timeA = parseInt(a.split('_')[2]);
                const timeB = parseInt(b.split('_')[2]);
                return timeB - timeA; // Sort newest first
            });
        
        // Remove all but the 5 most recent backups
        backupKeys.slice(5).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    static getBackups() {
        const keys = Object.keys(localStorage);
        return keys.filter(key => key.startsWith('cwags_backup_'))
            .map(key => ({
                key: key,
                date: new Date(parseInt(key.split('_')[2])),
                size: localStorage.getItem(key).length
            }))
            .sort((a, b) => b.date - a.date);
    }

    static restoreBackup(backupKey) {
        const backupData = localStorage.getItem(backupKey);
        if (!backupData) {
            return { success: false, message: 'Backup not found' };
        }
        
        return this.importData(backupData);
    }

    // ===================
    // UTILITY METHODS
    // ===================

    static getData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error reading data:', error);
            return defaultValue;
        }
    }

    static saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    static generateId(prefix = 'item') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5);
        return `${prefix}_${timestamp}_${random}`;
    }

    static saveAllPendingData() {
        // Force save any pending data changes
        // This is called on page unload
        console.log('Saving all pending data...');
    }

    static migrateOldData() {
        // Handle migration from older versions of the system
        const version = this.getSetting('dataVersion');
        if (!version || version < '1.0') {
            this.performDataMigration();
        }
    }

    static performDataMigration() {
        console.log('Performing data migration...');
        // Migration logic would go here
        this.saveSetting('dataVersion', '1.0');
    }

    static clearAllData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            this.createBackup(); // Create backup before clearing
            
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            
            return true;
        }
        return false;
    }

    static getStorageInfo() {
        const usage = {};
        let totalSize = 0;
        
        Object.entries(this.keys).forEach(([name, key]) => {
            const data = localStorage.getItem(key);
            const size = data ? data.length : 0;
            usage[name] = {
                key: key,
                size: size,
                sizeFormatted: this.formatBytes(size),
                records: data ? JSON.parse(data).length || 1 : 0
            };
            totalSize += size;
        });
        
        return {
            usage: usage,
            totalSize: totalSize,
            totalSizeFormatted: this.formatBytes(totalSize),
            available: this.getAvailableStorage()
        };
    }

    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static getAvailableStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return 'Available';
        } catch (e) {
            return 'Storage Full';
        }
    }

    // ===================
    // VALIDATION METHODS
    // ===================

    static validateTrial(trial) {
        const errors = [];
        
        if (!trial.name || trial.name.trim().length < 3) {
            errors.push('Trial name must be at least 3 characters');
        }
        
        if (!trial.date || new Date(trial.date) < new Date()) {
            errors.push('Trial date must be in the future');
        }
        
        if (!trial.host || trial.host.trim().length < 2) {
            errors.push('Host name is required');
        }
        
        if (!trial.location || trial.location.trim().length < 3) {
            errors.push('Location is required');
        }
        
        if (!trial.judges || trial.judges.length === 0) {
            errors.push('At least one judge is required');
        }
        
        if (!trial.classes || trial.classes.length === 0) {
            errors.push('At least one class is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    static validateEntry(entry) {
        const errors = [];
        
        if (!entry.handlerName || entry.handlerName.trim().length < 2) {
            errors.push('Handler name is required');
        }
        
        if (!entry.dogName || entry.dogName.trim().length < 2) {
            errors.push('Dog name is required');
        }
        
        if (!entry.registrationNumber || entry.registrationNumber.trim().length < 3) {
            errors.push('Registration number is required');
        }
        
        if (!entry.classes || entry.classes.length === 0) {
            errors.push('At least one class must be selected');
        }
        
        if (!entry.jumpHeight) {
            errors.push('Jump height is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Initialize DataManager when script loads
DataManager.init();
