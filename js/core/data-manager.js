// js/core/data-manager.js
class DataManager {
    static keys = {
        TRIALS: 'cwags_trials',
        ENTRIES: 'cwags_entries',
        USERS: 'cwags_users',
        SETTINGS: 'cwags_settings'
    };

    static init() {
        console.log('🗄️ DataManager initialized');
        this.validateStorage();
    }

    static validateStorage() {
        try {
            const testKey = 'cwags_test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.error('LocalStorage not available:', error);
            return false;
        }
    }

    // ===================
    // CORE DATA OPERATIONS
    // ===================

    static saveData(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
            
            // Dispatch data change event
            window.dispatchEvent(new CustomEvent('cwagsDataChanged', {
                detail: { key, action: 'save', timestamp: new Date().toISOString() }
            }));
            
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    static getData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error loading data:', error);
            return defaultValue;
        }
    }

    static deleteData(key) {
        try {
            localStorage.removeItem(key);
            
            window.dispatchEvent(new CustomEvent('cwagsDataChanged', {
                detail: { key, action: 'delete', timestamp: new Date().toISOString() }
            }));
            
            return true;
        } catch (error) {
            console.error('Error deleting data:', error);
            return false;
        }
    }

    static generateId(prefix = 'cwags') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
            trial.status = trial.status || 'draft';
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
        
        // Also delete related entries
        this.deleteTrialEntries(trialId);
        
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
            entry.status = entry.status || 'draft';
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

    // ===================
    // SETTINGS MANAGEMENT
    // ===================

    static getSetting(key, defaultValue = null) {
        const settings = this.getData(this.keys.SETTINGS, {});
        return settings[key] !== undefined ? settings[key] : defaultValue;
    }

    static saveSetting(key, value) {
        const settings = this.getData(this.keys.SETTINGS, {});
        settings[key] = value;
        settings.updatedAt = new Date().toISOString();
        this.saveData(this.keys.SETTINGS, settings);
        return true;
    }

    static deleteSetting(key) {
        const settings = this.getData(this.keys.SETTINGS, {});
        delete settings[key];
        this.saveData(this.keys.SETTINGS, settings);
        return true;
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
            (trial.venue && trial.venue.city && trial.venue.city.toLowerCase().includes(searchLower)) ||
            (trial.judges && trial.judges.some(judge => judge.name && judge.name.toLowerCase().includes(searchLower)))
        );
    }

    static searchEntries(query) {
        const entries = this.getEntries();
        const searchLower = query.toLowerCase();
        
        return entries.filter(entry => 
            entry.handlerName.toLowerCase().includes(searchLower) ||
            entry.dogName.toLowerCase().includes(searchLower) ||
            entry.handlerEmail.toLowerCase().includes(searchLower)
        );
    }

    // ===================
    // STATISTICS & REPORTING
    // ===================

    static getSystemStats() {
        const trials = this.getTrials();
        const entries = this.getEntries();
        const users = this.getData(this.keys.USERS, []);
        
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisYear = new Date(now.getFullYear(), 0, 1);
        
        return {
            totalTrials: trials.length,
            activeTrials: trials.filter(t => t.status === 'active' || !t.status).length,
            pendingTrials: trials.filter(t => t.status === 'pending').length,
            completedTrials: trials.filter(t => t.status === 'completed').length,
            
            totalEntries: entries.length,
            entriesThisMonth: entries.filter(e => new Date(e.createdAt) >= thisMonth).length,
            entriesThisYear: entries.filter(e => new Date(e.createdAt) >= thisYear).length,
            confirmedEntries: entries.filter(e => e.status === 'confirmed').length,
            
            totalUsers: users.length,
            activeUsers: users.filter(u => u.isActive).length,
            
            dataSize: this.calculateDataSize(),
            lastBackup: this.getSetting('last_backup_date'),
            systemHealth: this.checkSystemHealth()
        };
    }

    static calculateDataSize() {
        let totalSize = 0;
        for (let key in localStorage) {
            if (key.startsWith('cwags_')) {
                totalSize += localStorage[key].length;
            }
        }
        return totalSize;
    }

    static checkSystemHealth() {
        const stats = {
            storage: 'healthy',
            data: 'healthy',
            performance: 'healthy'
        };
        
        const dataSize = this.calculateDataSize();
        const storageLimit = 5 * 1024 * 1024; // 5MB estimate
        
        if (dataSize > storageLimit * 0.8) {
            stats.storage = 'warning';
        }
        
        try {
            const trials = this.getTrials();
            const entries = this.getEntries();
            
            // Check for data integrity issues
            let hasIssues = false;
            entries.forEach(entry => {
                if (!trials.find(t => t.id === entry.trialId)) {
                    hasIssues = true;
                }
            });
            
            if (hasIssues) {
                stats.data = 'warning';
            }
        } catch (error) {
            stats.data = 'error';
        }
        
        return stats;
    }

    // ===================
    // BACKUP & RESTORE
    // ===================

    static exportData() {
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            trials: this.getTrials(),
            entries: this.getEntries(),
            settings: this.getData(this.keys.SETTINGS, {})
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    static importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.trials) {
                this.saveData(this.keys.TRIALS, data.trials);
            }
            
            if (data.entries) {
                this.saveData(this.keys.ENTRIES, data.entries);
            }
            
            if (data.settings) {
                this.saveData(this.keys.SETTINGS, data.settings);
            }
            
            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            return { success: false, message: `Import failed: ${error.message}` };
        }
    }

    // ===================
    // UTILITY FUNCTIONS
    // ===================

    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.trim().replace(/[<>]/g, '');
    }

    // ===================
    // DATA CLEANUP
    // ===================

    static cleanupOldData(daysOld = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        let removedCount = 0;
        
        // Clean old completed trials
        const trials = this.getTrials();
        const activTrials = trials.filter(trial => 
            trial.status !== 'completed' || 
            new Date(trial.date) > cutoffDate
        );
        removedCount += trials.length - activTrials.length;
        this.saveData(this.keys.TRIALS, activTrials);
        
        // Clean entries for removed trials
        const entries = this.getEntries();
        const activeEntries = entries.filter(entry => 
            activTrials.find(trial => trial.id === entry.trialId)
        );
        removedCount += entries.length - activeEntries.length;
        this.saveData(this.keys.ENTRIES, activeEntries);
        
        return removedCount;
    }

    static validateDataIntegrity() {
        const issues = [];
        
        try {
            const trials = this.getTrials();
            const entries = this.getEntries();
            
            // Check trial data
            trials.forEach(trial => {
                if (!trial.id || !trial.name) {
                    issues.push(`Invalid trial: missing ID or name`);
                }
            });
            
            // Check entry data and references
            entries.forEach(entry => {
                if (!entry.id || !entry.trialId) {
                    issues.push(`Invalid entry: missing ID or trial reference`);
                }
                
                if (!trials.find(t => t.id === entry.trialId)) {
                    issues.push(`Entry references non-existent trial: ${entry.trialId}`);
                }
            });
            
        } catch (error) {
            issues.push(`Data validation error: ${error.message}`);
        }
        
        return issues;
    }
}
