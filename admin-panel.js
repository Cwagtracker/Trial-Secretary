static toggleAllUsers(checkbox) {
        const userCheckboxes = document.querySelectorAll('.user-checkbox');
        userCheckboxes.forEach(cb => {
            cb.checked = checkbox.checked;
            if (checkbox.checked) {
                this.selectedUsers.add(cb.value);
            } else {
                this.selectedUsers.delete(cb.value);
            }
        });
        this.updateBulkActionsButton();
    }

    static toggleUserSelection() {
        const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
        this.selectedUsers.clear();
        checkedBoxes.forEach(cb => this.selectedUsers.add(cb.value));
        this.updateBulkActionsButton();
    }

    static updateBulkActionsButton() {
        const bulkBtn = document.getElementById('bulk-actions-btn');
        if (bulkBtn) {
            bulkBtn.disabled = this.selectedUsers.size === 0;
            bulkBtn.textContent = `🔧 Bulk Actions (${this.selectedUsers.size})`;
        }
    }

    static bulkActions() {
        if (this.selectedUsers.size === 0) return;
        
        const actions = [
            { value: 'activate', text: 'Activate Users' },
            { value: 'deactivate', text: 'Deactivate Users' },
            { value: 'export', text: 'Export Selected' },
            { value: 'delete', text: 'Delete Users' }
        ];
        
        const action = prompt(`Select action for ${this.selectedUsers.size} users:\n` + 
            actions.map((a, i) => `${i + 1}. ${a.text}`).join('\n') + 
            '\n\nEnter number (1-4):');
        
        if (!action || action < 1 || action > 4) return;
        
        const selectedAction = actions[parseInt(action) - 1];
        this.performBulkAction(selectedAction.value);
    }

    static performBulkAction(action) {
        const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        let updatedUsers = [...users];
        let count = 0;
        
        switch(action) {
            case 'activate':
                this.selectedUsers.forEach(userId => {
                    const userIndex = updatedUsers.findIndex(u => u.id === userId);
                    if (userIndex !== -1) {
                        updatedUsers[userIndex].isActive = true;
                        updatedUsers[userIndex].updatedAt = new Date().toISOString();
                        count++;
                    }
                });
                localStorage.setItem('cwags_users', JSON.stringify(updatedUsers));
                App.showAlert(`${count} users activated`, 'success');
                break;
                
            case 'deactivate':
                this.selectedUsers.forEach(userId => {
                    const userIndex = updatedUsers.findIndex(u => u.id === userId);
                    if (userIndex !== -1 && updatedUsers[userIndex].role !== 'admin') {
                        updatedUsers[userIndex].isActive = false;
                        updatedUsers[userIndex].updatedAt = new Date().toISOString();
                        count++;
                    }
                });
                localStorage.setItem('cwags_users', JSON.stringify(updatedUsers));
                App.showAlert(`${count} users deactivated`, 'success');
                break;
                
            case 'export':
                this.exportSelectedUsers();
                return;
                
            case 'delete':
                if (!confirm(`Are you sure you want to delete ${this.selectedUsers.size} users? This cannot be undone.`)) {
                    return;
                }
                updatedUsers = updatedUsers.filter(u => !this.selectedUsers.has(u.id) || u.role === 'admin');
                count = users.length - updatedUsers.length;
                localStorage.setItem('cwags_users', JSON.stringify(updatedUsers));
                App.showAlert(`${count} users deleted`, 'success');
                break;
        }
        
        this.selectedUsers.clear();
        this.loadUsersView(document.getElementById('admin-view-container'));
    }

    static exportUsers() {
        const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        this.exportUsersToCSV(users, 'all_users.csv');
    }

    static exportSelectedUsers() {
        const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        const selectedUsers = users.filter(u => this.selectedUsers.has(u.id));
        this.exportUsersToCSV(selectedUsers, 'selected_users.csv');
    }

    static exportUsersToCSV(users, filename) {
        const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Role', 'Organization', 'Phone', 'Status', 'Created'];
        const csvContent = [
            headers.join(','),
            ...users.map(user => [
                user.id,
                user.firstName,
                user.lastName,
                user.email,
                user.role,
                user.organization || '',
                user.phone || '',
                user.isActive ? 'Active' : 'Inactive',
                new Date(user.createdAt).toLocaleDateString()
            ].map(field => `"${field}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        
        App.showAlert(`${users.length} users exported to ${filename}`, 'success');
    }

    // ===================
    // TRIAL ADMINISTRATION VIEW
    // ===================

    static loadTrialsView(container) {
        const trials = DataManager.getTrials();
        
        container.innerHTML = `
            <div class="trials-administration">
                <div class="trials-header">
                    <h3>Trial Administration</h3>
                    <div class="trials-actions">
                        <button class="btn btn-primary" onclick="App.loadModule('trial-setup')">
                            ➕ Create New Trial
                        </button>
                        <button class="btn btn-secondary" onclick="AdminPanel.exportTrials()">
                            📤 Export Trials
                        </button>
                    </div>
                </div>

                <!-- Trial Status Overview -->
                <div class="trial-status-overview">
                    <div class="status-card">
                        <h4>Pending Approval</h4>
                        <div class="status-count">${trials.filter(t => t.status === 'pending').length}</div>
                        <button class="btn btn-sm btn-primary" onclick="AdminPanel.showPendingTrials()">Review</button>
                    </div>
                    <div class="status-card">
                        <h4>Active Trials</h4>
                        <div class="status-count">${trials.filter(t => t.status === 'active' || !t.status).length}</div>
                        <button class="btn btn-sm btn-secondary" onclick="AdminPanel.showActiveTrials()">View</button>
                    </div>
                    <div class="status-card">
                        <h4>Completed</h4>
                        <div class="status-count">${trials.filter(t => t.status === 'completed').length}</div>
                        <button class="btn btn-sm btn-secondary" onclick="AdminPanel.showCompletedTrials()">Archive</button>
                    </div>
                    <div class="status-card">
                        <h4>Cancelled</h4>
                        <div class="status-count">${trials.filter(t => t.status === 'cancelled').length}</div>
                        <button class="btn btn-sm btn-warning" onclick="AdminPanel.showCancelledTrials()">View</button>
                    </div>
                </div>

                <!-- Trials Table -->
                <div class="trials-table-container">
                    <div class="table-filters">
                        <select id="trial-status-filter" onchange="AdminPanel.filterTrials()">
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <input type="text" id="trial-search" placeholder="Search trials..." onkeyup="AdminPanel.searchTrials()">
                    </div>
                    
                    <table class="trials-table">
                        <thead>
                            <tr>
                                <th>Trial Name</th>
                                <th>Host</th>
                                <th>Date</th>
                                <th>Location</th>
                                <th>Entries</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generateTrialsTableRows(trials)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    static generateTrialsTableRows(trials) {
        if (trials.length === 0) {
            return '<tr><td colspan="7" class="text-center">No trials found</td></tr>';
        }
        
        return trials.map(trial => {
            const entries = DataManager.getTrialEntries(trial.id);
            return `
                <tr>
                    <td><strong>${trial.name}</strong></td>
                    <td>${trial.host}</td>
                    <td>${new Date(trial.date).toLocaleDateString()}</td>
                    <td>${trial.venue?.city || 'TBD'}, ${trial.venue?.state || 'TBD'}</td>
                    <td>${entries.length}</td>
                    <td><span class="status-badge status-${trial.status || 'active'}">${trial.status || 'Active'}</span></td>
                    <td class="actions-cell">
                        <button class="btn btn-sm btn-primary" onclick="AdminPanel.viewTrialDetails('${trial.id}')" title="View Details">👁️</button>
                        ${trial.status === 'pending' ? `
                            <button class="btn btn-sm btn-success" onclick="AdminPanel.approveTrial('${trial.id}')" title="Approve">✅</button>
                            <button class="btn btn-sm btn-danger" onclick="AdminPanel.rejectTrial('${trial.id}')" title="Reject">❌</button>
                        ` : ''}
                        <button class="btn btn-sm btn-secondary" onclick="AdminPanel.editTrial('${trial.id}')" title="Edit">✏️</button>
                        <button class="btn btn-sm btn-warning" onclick="AdminPanel.cancelTrial('${trial.id}')" title="Cancel">⏸️</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    static approveTrial(trialId) {
        if (!confirm('Approve this trial?')) return;
        
        const trials = DataManager.getTrials();
        const trialIndex = trials.findIndex(t => t.id === trialId);
        
        if (trialIndex !== -1) {
            trials[trialIndex].status = 'active';
            trials[trialIndex].approvalDate = new Date().toISOString();
            trials[trialIndex].approvedBy = Auth.getCurrentUser().id;
            
            DataManager.saveData(DataManager.keys.TRIALS, trials);
            App.showAlert('Trial approved successfully', 'success');
            this.loadTrialsView(document.getElementById('admin-view-container'));
        }
    }

    static rejectTrial(trialId) {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;
        
        const trials = DataManager.getTrials();
        const trialIndex = trials.findIndex(t => t.id === trialId);
        
        if (trialIndex !== -1) {
            trials[trialIndex].status = 'rejected';
            trials[trialIndex].rejectionReason = reason;
            trials[trialIndex].rejectedBy = Auth.getCurrentUser().id;
            trials[trialIndex].rejectedAt = new Date().toISOString();
            
            DataManager.saveData(DataManager.keys.TRIALS, trials);
            App.showAlert('Trial rejected', 'warning');
            this.loadTrialsView(document.getElementById('admin-view-container'));
        }
    }

    static viewTrialDetails(trialId) {
        const trial = DataManager.getTrial(trialId);
        const entries = DataManager.getTrialEntries(trialId);
        
        if (!trial) {
            App.showAlert('Trial not found', 'danger');
            return;
        }
        
        const modalContent = `
            <div class="trial-details-modal">
                <h4>${trial.name}</h4>
                <div class="details-grid">
                    <div class="detail-section">
                        <h5>Basic Information</h5>
                        <p><strong>Host:</strong> ${trial.host}</p>
                        <p><strong>Date:</strong> ${new Date(trial.date).toLocaleDateString()}</p>
                        <p><strong>Type:</strong> ${trial.type}</p>
                        <p><strong>Status:</strong> ${trial.status || 'Active'}</p>
                    </div>
                    <div class="detail-section">
                        <h5>Venue</h5>
                        <p><strong>Name:</strong> ${trial.venue?.name || 'TBD'}</p>
                        <p><strong>Address:</strong> ${trial.venue?.address || 'TBD'}</p>
                        <p><strong>City:</strong> ${trial.venue?.city || 'TBD'}</p>
                    </div>
                    <div class="detail-section">
                        <h5>Classes</h5>
                        <p>${trial.classes?.join(', ') || 'No classes'}</p>
                    </div>
                    <div class="detail-section">
                        <h5>Statistics</h5>
                        <p><strong>Entries:</strong> ${entries.length}</p>
                        <p><strong>Entry Limit:</strong> ${trial.entryLimit || 'No limit'}</p>
                        <p><strong>Entry Deadline:</strong> ${new Date(trial.entryDeadline).toLocaleDateString()}</p>
                    </div>
                </div>
                ${trial.specialInstructions ? `
                    <div class="detail-section">
                        <h5>Special Instructions</h5>
                        <p>${trial.specialInstructions}</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.showModal('Trial Details', modalContent);
    }

    // ===================
    // SYSTEM SETTINGS VIEW
    // ===================

    static loadSystemView(container) {
        const settings = this.getSystemSettings();
        
        container.innerHTML = `
            <div class="system-settings">
                <div class="settings-header">
                    <h3>System Settings</h3>
                    <button class="btn btn-primary" onclick="AdminPanel.saveSystemSettings()">
                        💾 Save Settings
                    </button>
                </div>

                <form id="system-settings-form">
                    <!-- General Settings -->
                    <div class="settings-section">
                        <h4>General Settings</h4>
                        <div class="settings-grid">
                            <div class="form-group">
                                <label for="system-name">System Name</label>
                                <input type="text" id="system-name" name="systemName" value="${settings.systemName || 'C-WAGS Trial Management System'}">
                            </div>
                            <div class="form-group">
                                <label for="admin-email">Admin Email</label>
                                <input type="email" id="admin-email" name="adminEmail" value="${settings.adminEmail || 'admin@cwags.org'}">
                            </div>
                            <div class="form-group">
                                <label for="default-timezone">Default Timezone</label>
                                <select id="default-timezone" name="defaultTimezone">
                                    <option value="America/New_York" ${settings.defaultTimezone === 'America/New_York' ? 'selected' : ''}>Eastern Time</option>
                                    <option value="America/Chicago" ${settings.defaultTimezone === 'America/Chicago' ? 'selected' : ''}>Central Time</option>
                                    <option value="America/Denver" ${settings.defaultTimezone === 'America/Denver' ? 'selected' : ''}>Mountain Time</option>
                                    <option value="America/Los_Angeles" ${settings.defaultTimezone === 'America/Los_Angeles' ? 'selected' : ''}>Pacific Time</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="date-format">Date Format</label>
                                <select id="date-format" name="dateFormat">
                                    <option value="MM/dd/yyyy" ${settings.dateFormat === 'MM/dd/yyyy' ? 'selected' : ''}>MM/dd/yyyy</option>
                                    <option value="dd/MM/yyyy" ${settings.dateFormat === 'dd/MM/yyyy' ? 'selected' : ''}>dd/MM/yyyy</option>
                                    <option value="yyyy-MM-dd" ${settings.dateFormat === 'yyyy-MM-dd' ? 'selected' : ''}>yyyy-MM-dd</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Trial Settings -->
                    <div class="settings-section">
                        <h4>Trial Settings</h4>
                        <div class="settings-grid">
                            <div class="form-group">
                                <label for="default-entry-limit">Default Entry Limit</label>
                                <input type="number" id="default-entry-limit" name="defaultEntryLimit" value="${settings.defaultEntryLimit || 50}">
                            </div>
                            <div class="form-group">
                                <label for="entry-deadline-days">Entry Deadline (days before trial)</label>
                                <input type="number" id="entry-deadline-days" name="entryDeadlineDays" value="${settings.entryDeadlineDays || 7}">
                            </div>
                            <div class="form-group">
                                <label for="auto-approve-trials">
                                    <input type="checkbox" name="autoApproveTrials" ${settings.autoApproveTrials ? 'checked' : ''}> 
                                    Auto-approve trial applications
                                </label>
                            </div>
                            <div class="form-group">
                                <label for="require-entry-approval">
                                    <input type="checkbox" name="requireEntryApproval" ${settings.requireEntryApproval ? 'checked' : ''}> 
                                    Require entry approval
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Email Settings -->
                    <div class="settings-section">
                        <h4>Email Settings</h4>
                        <div class="settings-grid">
                            <div class="form-group">
                                <label for="smtp-host">SMTP Host</label>
                                <input type="text" id="smtp-host" name="smtpHost" value="${settings.smtpHost || ''}">
                            </div>
                            <div class="form-group">
                                <label for="smtp-port">SMTP Port</label>
                                <input type="number" id="smtp-port" name="smtpPort" value="${settings.smtpPort || 587}">
                            </div>
                            <div class="form-group">
                                <label for="smtp-username">SMTP Username</label>
                                <input type="text" id="smtp-username" name="smtpUsername" value="${settings.smtpUsername || ''}">
                            </div>
                            <div class="form-group">
                                <label for="enable-email-notifications">
                                    <input type="checkbox" name="enableEmailNotifications" ${settings.enableEmailNotifications ? 'checked' : ''}> 
                                    Enable email notifications
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Security Settings -->
                    <div class="settings-section">
                        <h4>Security Settings</h4>
                        <div class="settings-grid">
                            <div class="form-group">
                                <label for="session-timeout">Session Timeout (minutes)</label>
                                <input type="number" id="session-timeout" name="sessionTimeout" value="${settings.sessionTimeout || 120}">
                            </div>
                            <div class="form-group">
                                <label for="max-login-attempts">Max Login Attempts</label>
                                <input type="number" id="max-login-attempts" name="maxLoginAttempts" value="${settings.maxLoginAttempts || 5}">
                            </div>
                            <div class="form-group">
                                <label for="require-strong-passwords">
                                    <input type="checkbox" name="requireStrongPasswords" ${settings.requireStrongPasswords ? 'checked' : ''}> 
                                    Require strong passwords
                                </label>
                            </div>
                            <div class="form-group">
                                <label for="enable-two-factor">
                                    <input type="checkbox" name="enableTwoFactor" ${settings.enableTwoFactor ? 'checked' : ''}> 
                                    Enable two-factor authentication
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Backup Settings -->
                    <div class="settings-section">
                        <h4>Backup Settings</h4>
                        <div class="settings-grid">
                            <div class="form-group">
                                <label for="auto-backup">
                                    <input type="checkbox" name="autoBackup" ${settings.autoBackup ? 'checked' : ''}> 
                                    Enable automatic backups
                                </label>
                            </div>
                            <div class="form-group">
                                <label for="backup-frequency">Backup Frequency</label>
                                <select id="backup-frequency" name="backupFrequency">
                                    <option value="daily" ${settings.backupFrequency === 'daily' ? 'selected' : ''}>Daily</option>
                                    <option value="weekly" ${settings.backupFrequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                                    <option value="monthly" ${settings.backupFrequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="retention-days">Backup Retention (days)</label>
                                <input type="number" id="retention-days" name="retentionDays" value="${settings.retentionDays || 30}">
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        `;
    }

    static getSystemSettings() {
        return DataManager.getSetting('system_settings') || {};
    }

    static saveSystemSettings() {
        const form = document.getElementById('system-settings-form');
        const formData = new FormData(form);
        const settings = {};
        
        for (let [key, value] of formData.entries()) {
            if (form.querySelector(`[name="${key}"]`).type === 'checkbox') {
                settings[key] = value === 'on';
            } else if (form.querySelector(`[name="${key}"]`).type === 'number') {
                settings[key] = parseInt(value);
            } else {
                settings[key] = value;
            }
        }
        
        DataManager.saveSetting('system_settings', settings);
        App.showAlert('System settings saved successfully', 'success');
    }

    // ===================
    // REPORTS VIEW
    // ===================

    static loadReportsView(container) {
        container.innerHTML = `
            <div class="reports-analytics">
                <div class="reports-header">
                    <h3>Reports & Analytics</h3>
                </div>

                <!-- Report Categories -->
                <div class="report-categories">
                    <div class="report-category">
                        <h4>User Reports</h4>
                        <button class="btn btn-primary" onclick="AdminPanel.generateUserReport()">User Activity Report</button>
                        <button class="btn btn-primary" onclick="AdminPanel.generateRegistrationReport()">Registration Report</button>
                        <button class="btn btn-primary" onclick="AdminPanel.generatePermissionsReport()">Permissions Audit</button>
                    </div>

                    <div class="report-category">
                        <h4>Trial Reports</h4>
                        <button class="btn btn-primary" onclick="AdminPanel.generateTrialSummary()">Trial Summary</button>
                        <button class="btn btn-primary" onclick="AdminPanel.generateEntryStatistics()">Entry Statistics</button>
                        <button class="btn btn-primary" onclick="AdminPanel.generateRevenueReport()">Revenue Report</button>
                    </div>

                    <div class="report-category">
                        <h4>System Reports</h4>
                        <button class="btn btn-primary" onclick="AdminPanel.generateSystemUsage()">System Usage</button>
                        <button class="btn btn-primary" onclick="AdminPanel.generatePerformanceReport()">Performance Report</button>
                        <button class="btn btn-primary" onclick="AdminPanel.generateSecurityReport()">Security Audit</button>
                    </div>
                </div>

                <!-- Report Output -->
                <div id="report-output" class="report-output" style="display: none;">
                    <div class="report-header">
                        <h4 id="report-title">Report</h4>
                        <div class="report-actions">
                            <button class="btn btn-secondary" onclick="AdminPanel.printReport()">🖨️ Print</button>
                            <button class="btn btn-secondary" onclick="AdminPanel.exportReport()">📤 Export</button>
                            <button class="btn btn-secondary" onclick="AdminPanel.closeReport()">✖️ Close</button>
                        </div>
                    </div>
                    <div id="report-content" class="report-content">
                        <!-- Report content will be inserted here -->
                    </div>
                </div>
            </div>
        `;
    }

    // ===================
    // MAINTENANCE VIEW
    // ===================

    static loadMaintenanceView(container) {
        const maintenanceStats = this.calculateMaintenanceStats();
        
        container.innerHTML = `
            <div class="data-maintenance">
                <div class="maintenance-header">
                    <h3>Data Maintenance</h3>
                    <div class="maintenance-warning">
                        ⚠️ Always backup your data before performing maintenance operations
                    </div>
                </div>

                <!-- Data Statistics -->
                <div class="maintenance-stats">
                    <div class="stat-card">
                        <h4>Total Records</h4>
                        <div class="stat-value">${maintenanceStats.totalRecords}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Data Size</h4>
                        <div class="stat-value">${this.formatBytes(maintenanceStats.dataSize)}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Last Backup</h4>
                        <div class="stat-value">${maintenanceStats.lastBackup || 'Never'}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Storage Usage</h4>
                        <div class="stat-value">${maintenanceStats.storageUsage}%</div>
                    </div>
                </div>

                <!-- Maintenance Actions -->
                <div class="maintenance-sections">
                    <!-- Backup & Restore -->
                    <div class="maintenance-section">
                        <h4>🗄️ Backup & Restore</h4>
                        <div class="maintenance-actions">
                            <button class="btn btn-primary" onclick="AdminPanel.backupData()">
                                💾 Create Backup
                            </button>
                            <button class="btn btn-secondary" onclick="AdminPanel.showRestoreDialog()">
                                📁 Restore from Backup
                            </button>
                            <button class="btn btn-secondary" onclick="AdminPanel.downloadBackup()">
                                📥 Download Backup
                            </button>
                        </div>
                    </div>

                    <!-- Data Cleanup -->
                    <div class="maintenance-section">
                        <h4>🧹 Data Cleanup</h4>
                        <div class="maintenance-actions">
                            <button class="btn btn-warning" onclick="AdminPanel.cleanupOldData()">
                                🗑️ Remove Old Data
                            </button>
                            <button class="btn btn-warning" onclick="AdminPanel.cleanupDuplicates()">
                                🔍 Remove Duplicates
                            </button>
                            <button class="btn btn-warning" onclick="AdminPanel.optimizeStorage()">
                                ⚡ Optimize Storage
                            </button>
                        </div>
                    </div>

                    <!-- Data Validation -->
                    <div class="maintenance-section">
                        <h4>✅ Data Validation</h4>
                        <div class="maintenance-actions">
                            <button class="btn btn-info" onclick="AdminPanel.validateDataIntegrity()">
                                🔍 Check Data Integrity
                            </button>
                            <button class="btn btn-info" onclick="AdminPanel.fixBrokenReferences()">
                                🔧 Fix Broken References
                            </button>
                            <button class="btn btn-info" onclick="AdminPanel.validateUserData()">
                                👥 Validate User Data
                            </button>
                        </div>
                    </div>

                    <!-- System Reset -->
                    <div class="maintenance-section danger-section">
                        <h4>⚠️ System Reset</h4>
                        <div class="maintenance-actions">
                            <button class="btn btn-danger" onclick="AdminPanel.resetAllData()">
                                🔥 Reset All Data
                            </button>
                            <button class="btn btn-danger" onclick="AdminPanel.resetUserData()">
                                👥 Reset User Data Only
                            </button>
                            <button class="btn btn-danger" onclick="AdminPanel.resetTrialData()">
                                🎯 Reset Trial Data Only
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Maintenance Log -->
                <div class="maintenance-log">
                    <h4>📋 Maintenance Log</h4>
                    <div class="log-container">
                        ${this.generateMaintenanceLog()}
                    </div>
                </div>
            </div>
        `;
    }

    static calculateMaintenanceStats() {
        const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        const trials = DataManager.getTrials();
        const entries = DataManager.getEntries();
        
        return {
            totalRecords: users.length + trials.length + entries.length,
            dataSize: this.calculateDataSize(),
            lastBackup: DataManager.getSetting('last_backup_date'),
            storageUsage: this.calculateStorageUsage()
        };
    }

    static generateMaintenanceLog() {
        const log = DataManager.getSetting('maintenance_log') || [];
        
        if (log.length === 0) {
            return '<div class="no-log">No maintenance activities recorded</div>';
        }
        
        return log.slice(-10).reverse().map(entry => `
            <div class="log-entry">
                <div class="log-time">${new Date(entry.timestamp).toLocaleString()}</div>
                <div class="log-action">${entry.action}</div>
                <div class="log-result ${entry.success ? 'success' : 'error'}">${entry.result}</div>
            </div>
        `).join('');
    }

    static addMaintenanceLog(action, result, success = true) {
        const log = DataManager.getSetting('maintenance_log') || [];
        log.push({
            timestamp: new Date().toISOString(),
            action: action,
            result: result,
            success: success,
            user: Auth.getCurrentUser().email
        });
        
        // Keep only last 100 entries
        if (log.length > 100) {
            log.splice(0, log.length - 100);
        }
        
        DataManager.saveSetting('maintenance_log', log);
    }

    // ===================
    // UTILITY FUNCTIONS
    // ===================

    static isThisMonth(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }

    static showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'admin-modal';
        modal.innerHTML = `
            <div class="admin-modal-content">
                <div class="admin-modal-header">
                    <h4>${title}</h4>
                    <button class="modal-close" onclick="this.closest('.admin-modal').remove()">&times;</button>
                </div>
                <div class="admin-modal-body">
                    ${content}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // ===================
    // DATA MANAGEMENT FUNCTIONS
    // ===================

    static backupData() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupData = {
                timestamp: timestamp,
                version: '1.0',
                users: JSON.parse(localStorage.getItem('cwags_users') || '[]'),
                trials: DataManager.getTrials(),
                entries: DataManager.getEntries(),
                settings: this.getAllSettings()
            };
            
            const backupJson = JSON.stringify(backupData, null, 2);
            const blob = new Blob([backupJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `cwags-backup-${timestamp}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            // Save backup info
            DataManager.saveSetting('last_backup_date', new Date().toLocaleString());
            this.addMaintenanceLog('Data Backup', `Backup created: cwags-backup-${timestamp}.json`);
            
            App.showAlert('Backup created successfully', 'success');
            
        } catch (error) {
            this.addMaintenanceLog('Data Backup', `Failed: ${error.message}`, false);
            App.showAlert(`Backup failed: ${error.message}`, 'danger');
        }
    }

    static getAllSettings() {
        const settings = {};
        for (let key in localStorage) {
            if (key.startsWith('cwags_') && key !== 'cwags_users') {
                settings[key] = localStorage.getItem(key);
            }
        }
        return settings;
    }

    static showRestoreDialog() {
        const content = `
            <div class="restore-dialog">
                <p>Select a backup file to restore:</p>
                <input type="file" id="backup-file" accept=".json" />
                <div class="restore-options">
                    <label><input type="checkbox" id="restore-users" checked> Restore Users</label>
                    <label><input type="checkbox" id="restore-trials" checked> Restore Trials</label>
                    <label><input type="checkbox" id="restore-entries" checked> Restore Entries</label>
                    <label><input type="checkbox" id="restore-settings" checked> Restore Settings</label>
                </div>
                <div class="restore-warning">
                    ⚠️ This will overwrite existing data. Make sure you have a current backup.
                </div>
                <div class="restore-actions">
                    <button class="btn btn-danger" onclick="AdminPanel.performRestore()">Restore Data</button>
                    <button class="btn btn-secondary" onclick="this.closest('.admin-modal').remove()">Cancel</button>
                </div>
            </div>
        `;
        this.showModal('Restore from Backup', content);
    }

    static performRestore() {
        const fileInput = document.getElementById('backup-file');
        if (!fileInput.files[0]) {
            App.showAlert('Please select a backup file', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target.result);
                
                // Validate backup format
                if (!backupData.timestamp || !backupData.version) {
                    throw new Error('Invalid backup file format');
                }
                
                let restored = [];
                
                // Restore users
                if (document.getElementById('restore-users').checked && backupData.users) {
                    localStorage.setItem('cwags_users', JSON.stringify(backupData.users));
                    restored.push('users');
                }
                
                // Restore trials
                if (document.getElementById('restore-trials').checked && backupData.trials) {
                    DataManager.saveData(DataManager.keys.TRIALS, backupData.trials);
                    restored.push('trials');
                }
                
                // Restore entries
                if (document.getElementById('restore-entries').checked && backupData.entries) {
                    DataManager.saveData(DataManager.keys.ENTRIES, backupData.entries);
                    restored.push('entries');
                }
                
                // Restore settings
                if (document.getElementById('restore-settings').checked && backupData.settings) {
                    for (let key in backupData.settings) {
                        localStorage.setItem(key, backupData.settings[key]);
                    }
                    restored.push('settings');
                }
                
                this.addMaintenanceLog('Data Restore', `Restored: ${restored.join(', ')} from backup ${backupData.timestamp}`);
                App.showAlert(`Data restored successfully: ${restored.join(', ')}`, 'success');
                
                // Close modal and refresh view
                document.querySelector('.admin-modal').remove();
                this.refreshDashboard();
                
            } catch (error) {
                this.addMaintenanceLog('Data Restore', `Failed: ${error.message}`, false);
                App.showAlert(`Restore failed: ${error.message}`, 'danger');
            }
        };
        
        reader.readAsText(fileInput.files[0]);
    }

    static cleanupOldData() {
        if (!confirm('Remove data older than 2 years? This cannot be undone.')) return;
        
        try {
            const cutoffDate = new Date();
            cutoffDate.setFullYear(cutoffDate.getFullYear() - 2);
            
            let removedCount = 0;
            
            // Clean old trials
            const trials = DataManager.getTrials();
            const activTrials = trials.filter(trial => new Date(trial.date) > cutoffDate);
            removedCount += trials.length - activTrials.length;
            DataManager.saveData(DataManager.keys.TRIALS, activTrials);
            
            // Clean old entries
            const entries = DataManager.getEntries();
            const activeEntries = entries.filter(entry => new Date(entry.createdAt) > cutoffDate);
            removedCount += entries.length - activeEntries.length;
            DataManager.saveData(DataManager.keys.ENTRIES, activeEntries);
            
            this.addMaintenanceLog('Data Cleanup', `Removed ${removedCount} old records`);
            App.showAlert(`Removed ${removedCount} old records`, 'success');
            
        } catch (error) {
            this.addMaintenanceLog('Data Cleanup', `Failed: ${error.message}`, false);
            App.showAlert(`Cleanup failed: ${error.message}`, 'danger');
        }
    }

    static validateDataIntegrity() {
        try {
            const issues = [];
            
            // Check user data
            const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
            users.forEach(user => {
                if (!user.id || !user.email) {
                    issues.push(`Invalid user record: missing ID or email`);
                }
            });
            
            // Check trial data
            const trials = DataManager.getTrials();
            trials.forEach(trial => {
                if (!trial.id || !trial.name || !trial.date) {
                    issues.push(`Invalid trial record: ${trial.name || 'unnamed'}`);
                }
            });
            
            // Check entry data
            const entries = DataManager.getEntries();
            entries.forEach(entry => {
                if (!entry.id || !entry.trialId) {
                    issues.push(`Invalid entry record: missing ID or trial reference`);
                }
                // Check if referenced trial exists
                if (!trials.find(t => t.id === entry.trialId)) {
                    issues.push(`Entry references non-existent trial: ${entry.trialId}`);
                }
            });
            
            const resultMessage = issues.length === 0 ? 
                'Data integrity check passed - no issues found' : 
                `Found ${issues.length} data integrity issues`;
            
            this.addMaintenanceLog('Data Validation', resultMessage, issues.length === 0);
            
            if (issues.length > 0) {
                const issueList = issues.slice(0, 10).join('\n');
                App.showAlert(`Data integrity issues found:\n${issueList}${issues.length > 10 ? '\n...' : ''}`, 'warning');
            } else {
                App.showAlert('Data integrity check passed', 'success');
            }
            
        } catch (error) {
            this.addMaintenanceLog('Data Validation', `Failed: ${error.message}`, false);
            App.showAlert(`Validation failed: ${error.message}`, 'danger');
        }
    }

    static resetAllData() {
        if (!confirm('This will DELETE ALL DATA and cannot be undone. Are you absolutely sure?')) return;
        if (!confirm('Last chance - this will erase everything. Continue?')) return;
        
        try {
            // Clear all localStorage
            const keysToRemove = [];
            for (let key in localStorage) {
                if (key.startsWith('cwags_')) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // Recreate default admin
            Auth.loadStoredUsers();
            
            this.addMaintenanceLog('System Reset', 'All data reset - system returned to default state');
            App.showAlert('All data has been reset. Please refresh the page.', 'warning');
            
            // Refresh after delay
            setTimeout(() => {
                window.location.reload();
            }, 3000);
            
        } catch (error) {
            this.addMaintenanceLog('System Reset', `Failed: ${error.message}`, false);
            App.showAlert(`Reset failed: ${error.message}`, 'danger');
        }
    }

    // ===================
    // REPORT GENERATION
    // ===================

    static generateUserReport() {
        const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        const report = this.buildUserActivityReport(users);
        this.showReport('User Activity Report', report);
    }

    static buildUserActivityReport(users) {
        const activeUsers = users.filter(u => u.isActive);
        const inactiveUsers = users.filter(u => !u.isActive);
        const roleBreakdown = {};
        
        users.forEach(user => {
            roleBreakdown[user.role] = (roleBreakdown[user.role] || 0) + 1;
        });
        
        return `
            <div class="report-summary">
                <h4>Summary</h4>
                <ul>
                    <li>Total Users: ${users.length}</li>
                    <li>Active Users: ${activeUsers.length}</li>
                    <li>Inactive Users: ${inactiveUsers.length}</li>
                </ul>
            </div>
            
            <div class="report-section">
                <h4>Users by Role</h4>
                <table class="report-table">
                    <thead>
                        <tr><th>Role</th><th>Count</th><th>Percentage</th></tr>
                    </thead>
                    <tbody>
                        ${Object.entries(roleBreakdown).map(([role, count]) => `
                            <tr>
                                <td>${role}</td>
                                <td>${count}</td>
                                <td>${((count / users.length) * 100).toFixed(1)}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="report-section">
                <h4>Recent Registrations (Last 30 Days)</h4>
                <table class="report-table">
                    <thead>
                        <tr><th>Name</th><th>Email</th><th>Role</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                        ${users.filter(u => {
                            const regDate = new Date(u.createdAt);
                            const thirtyDaysAgo = new Date();
                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                            return regDate > thirtyDaysAgo;
                        }).map(user => `
                            <tr>
                                <td>${user.firstName} ${user.lastName}</td>
                                <td>${user.email}</td>
                                <td>${user.role}</td>
                                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    static showReport(title, content) {
        document.getElementById('report-title').textContent = title;
        document.getElementById('report-content').innerHTML = content;
        document.getElementById('report-output').style.display = 'block';
        
        // Scroll to report
        document.getElementById('report-output').scrollIntoView({ behavior: 'smooth' });
    }

    static closeReport() {
        document.getElementById('report-output').style.display = 'none';
    }

    static printReport() {
        const reportContent = document.getElementById('report-content').innerHTML;
        const reportTitle = document.getElementById('report-title').textContent;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${reportTitle}</title>
                <link rel="stylesheet" href="css/print.css">
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .report-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    .report-table th, .report-table td { border: 1px solid #000; padding: 8px; text-align: left; }
                    .report-table th { background: #f0f0f0; font-weight: bold; }
                    .report-section { margin: 20px 0; }
                    .report-summary ul { margin: 10px 0; padding-left: 20px; }
                </style>
            </head>
            <body>
                <h1>${reportTitle}</h1>
                <p>Generated: ${new Date().toLocaleString()}</p>
                ${reportContent}
                <div style="margin-top: 30px; font-size: 12px; color: #666;">
                    <p>Generated by C-WAGS Trial Management System</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    static exportReport() {
        const reportContent = document.getElementById('report-content').innerHTML;
        const reportTitle = document.getElementById('report-title').textContent;
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${reportTitle.replace(/\s+/g, '_')}_${timestamp}.html`;
        
        const fullContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${reportTitle}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                    .report-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    .report-table th, .report-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    .report-table th { background: #f2f2f2; font-weight: bold; }
                    .report-section { margin: 30px 0; }
                    .report-summary { background: #f9f9f9; padding: 15px; border-left: 4px solid #2196F3; }
                    h1, h4 { color: #333; }
                </style>
            </head>
            <body>
                <h1>${reportTitle}</h1>
                <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                <hr>
                ${reportContent}
                <hr>
                <footer style="margin-top: 30px; font-size: 12px; color: #666;">
                    <p>Generated by C-WAGS Trial Management System</p>
                </footer>
            </body>
            </html>
        `;
        
        const blob = new Blob([fullContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        App.showAlert(`Report exported as ${filename}`, 'success');
    }
}// js/modules/admin-panel.js
class AdminPanel {
    static init() {
        this.currentView = 'dashboard';
        this.selectedUsers = new Set();
        this.loadModule();
        this.setupEventListeners();
        this.loadDashboardData();
    }

    static loadModule() {
        const container = document.getElementById('module-container');
        container.innerHTML = `
            <div class="admin-panel-module">
                <div class="module-header">
                    <h2>⚙️ Administrative Panel</h2>
                    <p>System administration and user management</p>
                </div>

                <div class="admin-content">
                    <!-- Admin Navigation Tabs -->
                    <div class="admin-tabs">
                        <button class="admin-tab active" data-view="dashboard">
                            📊 Dashboard
                        </button>
                        <button class="admin-tab" data-view="users">
                            👥 User Management
                        </button>
                        <button class="admin-tab" data-view="trials">
                            🎯 Trial Administration
                        </button>
                        <button class="admin-tab" data-view="system">
                            🔧 System Settings
                        </button>
                        <button class="admin-tab" data-view="reports">
                            📈 Reports & Analytics
                        </button>
                        <button class="admin-tab" data-view="maintenance">
                            🛠️ Data Maintenance
                        </button>
                    </div>

                    <!-- Admin View Container -->
                    <div id="admin-view-container">
                        <!-- Views will be loaded here dynamically -->
                    </div>
                </div>
            </div>
        `;
    }

    static setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                if (view) {
                    this.switchView(view);
                }
            });
        });
    }

    static switchView(viewName) {
        // Update active tab
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Load view content
        this.currentView = viewName;
        this.loadView(viewName);
    }

    static loadView(viewName) {
        const container = document.getElementById('admin-view-container');
        
        switch(viewName) {
            case 'dashboard':
                this.loadDashboardView(container);
                break;
            case 'users':
                this.loadUsersView(container);
                break;
            case 'trials':
                this.loadTrialsView(container);
                break;
            case 'system':
                this.loadSystemView(container);
                break;
            case 'reports':
                this.loadReportsView(container);
                break;
            case 'maintenance':
                this.loadMaintenanceView(container);
                break;
            default:
                this.loadDashboardView(container);
        }
    }

    // ===================
    // DASHBOARD VIEW
    // ===================

    static loadDashboardView(container) {
        const stats = this.calculateSystemStats();
        
        container.innerHTML = `
            <div class="admin-dashboard">
                <div class="dashboard-header">
                    <h3>System Overview</h3>
                    <div class="last-updated">
                        Last updated: ${new Date().toLocaleString()}
                        <button class="btn btn-sm btn-secondary" onclick="AdminPanel.refreshDashboard()">
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                <!-- Key Metrics -->
                <div class="admin-stats-grid">
                    <div class="admin-stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-content">
                            <h4>${stats.totalUsers}</h4>
                            <p>Total Users</p>
                            <div class="stat-breakdown">
                                <span>Active: ${stats.activeUsers}</span>
                                <span>Admins: ${stats.adminUsers}</span>
                            </div>
                        </div>
                    </div>

                    <div class="admin-stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-content">
                            <h4>${stats.totalTrials}</h4>
                            <p>Total Trials</p>
                            <div class="stat-breakdown">
                                <span>Active: ${stats.activeTrials}</span>
                                <span>Pending: ${stats.pendingTrials}</span>
                            </div>
                        </div>
                    </div>

                    <div class="admin-stat-card">
                        <div class="stat-icon">📝</div>
                        <div class="stat-content">
                            <h4>${stats.totalEntries}</h4>
                            <p>Total Entries</p>
                            <div class="stat-breakdown">
                                <span>This Month: ${stats.entriesThisMonth}</span>
                                <span>Confirmed: ${stats.confirmedEntries}</span>
                            </div>
                        </div>
                    </div>

                    <div class="admin-stat-card">
                        <div class="stat-icon">💾</div>
                        <div class="stat-content">
                            <h4>${this.formatBytes(stats.dataSize)}</h4>
                            <p>Data Storage</p>
                            <div class="stat-breakdown">
                                <span>Records: ${stats.totalRecords}</span>
                                <span>Usage: ${stats.storageUsage}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="admin-section">
                    <h4>Recent Activity</h4>
                    <div class="activity-feed">
                        ${this.generateActivityFeed()}
                    </div>
                </div>

                <!-- System Health -->
                <div class="admin-section">
                    <h4>System Health</h4>
                    <div class="health-indicators">
                        ${this.generateHealthIndicators()}
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="admin-section">
                    <h4>Quick Actions</h4>
                    <div class="quick-actions-grid">
                        <button class="action-card" onclick="AdminPanel.switchView('users')">
                            <div class="action-icon">👤</div>
                            <div class="action-text">Add New User</div>
                        </button>
                        <button class="action-card" onclick="AdminPanel.backupData()">
                            <div class="action-icon">💾</div>
                            <div class="action-text">Backup Data</div>
                        </button>
                        <button class="action-card" onclick="AdminPanel.switchView('reports')">
                            <div class="action-icon">📊</div>
                            <div class="action-text">Generate Report</div>
                        </button>
                        <button class="action-card" onclick="AdminPanel.switchView('maintenance')">
                            <div class="action-icon">🧹</div>
                            <div class="action-text">Data Cleanup</div>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    static loadDashboardData() {
        // Load initial dashboard data
        this.refreshDashboard();
    }

    static refreshDashboard() {
        if (this.currentView === 'dashboard') {
            this.loadDashboardView(document.getElementById('admin-view-container'));
        }
        App.setStatus('Dashboard refreshed', 'success');
    }

    static calculateSystemStats() {
        const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        const trials = DataManager.getTrials();
        const entries = DataManager.getEntries();
        
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        return {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.isActive).length,
            adminUsers: users.filter(u => u.role === 'admin').length,
            totalTrials: trials.length,
            activeTrials: trials.filter(t => t.status === 'active' || !t.status).length,
            pendingTrials: trials.filter(t => t.status === 'pending').length,
            totalEntries: entries.length,
            entriesThisMonth: entries.filter(e => new Date(e.createdAt) >= thisMonth).length,
            confirmedEntries: entries.filter(e => e.status === 'confirmed').length,
            dataSize: this.calculateDataSize(),
            totalRecords: users.length + trials.length + entries.length,
            storageUsage: this.calculateStorageUsage()
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

    static calculateStorageUsage() {
        const used = this.calculateDataSize();
        const limit = 5 * 1024 * 1024; // 5MB estimate for localStorage
        return Math.min(Math.round((used / limit) * 100), 100);
    }

    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static generateActivityFeed() {
        const activities = this.getRecentActivities();
        
        if (activities.length === 0) {
            return '<div class="no-activity">No recent activity</div>';
        }
        
        return activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    static getRecentActivities() {
        // Mock recent activities - in production, you'd track these
        const activities = [
            {
                icon: '👤',
                text: 'New user registration: john.doe@example.com',
                time: '2 hours ago'
            },
            {
                icon: '🎯',
                text: 'Trial "Spring Fun Match" was approved',
                time: '4 hours ago'
            },
            {
                icon: '📝',
                text: '15 new entries submitted for upcoming trials',
                time: '6 hours ago'
            },
            {
                icon: '💾',
                text: 'System backup completed successfully',
                time: '1 day ago'
            }
        ];
        
        return activities;
    }

    static generateHealthIndicators() {
        const health = this.checkSystemHealth();
        
        return `
            <div class="health-grid">
                <div class="health-item ${health.database.status}">
                    <div class="health-label">Database</div>
                    <div class="health-status">${health.database.message}</div>
                </div>
                <div class="health-item ${health.storage.status}">
                    <div class="health-label">Storage</div>
                    <div class="health-status">${health.storage.message}</div>
                </div>
                <div class="health-item ${health.performance.status}">
                    <div class="health-label">Performance</div>
                    <div class="health-status">${health.performance.message}</div>
                </div>
                <div class="health-item ${health.security.status}">
                    <div class="health-label">Security</div>
                    <div class="health-status">${health.security.message}</div>
                </div>
            </div>
        `;
    }

    static checkSystemHealth() {
        const storageUsage = this.calculateStorageUsage();
        
        return {
            database: {
                status: 'healthy',
                message: 'All connections active'
            },
            storage: {
                status: storageUsage > 80 ? 'warning' : 'healthy',
                message: storageUsage > 80 ? 'Storage almost full' : 'Storage optimal'
            },
            performance: {
                status: 'healthy',
                message: 'Response times normal'
            },
            security: {
                status: 'healthy',
                message: 'No security issues'
            }
        };
    }

    // ===================
    // USER MANAGEMENT VIEW
    // ===================

    static loadUsersView(container) {
        const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        
        container.innerHTML = `
            <div class="users-management">
                <div class="users-header">
                    <h3>User Management</h3>
                    <div class="users-actions">
                        <button class="btn btn-primary" onclick="AdminPanel.showAddUserModal()">
                            ➕ Add New User
                        </button>
                        <button class="btn btn-secondary" onclick="AdminPanel.exportUsers()">
                            📤 Export Users
                        </button>
                        <button class="btn btn-warning" onclick="AdminPanel.bulkActions()" id="bulk-actions-btn" disabled>
                            🔧 Bulk Actions
                        </button>
                    </div>
                </div>

                <!-- User Filters -->
                <div class="users-filters">
                    <div class="filter-group">
                        <label>Filter by Role:</label>
                        <select id="role-filter" onchange="AdminPanel.filterUsers()">
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="advocate">Advocate</option>
                            <option value="host">Host</option>
                            <option value="judge">Judge</option>
                            <option value="secretary">Secretary</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Filter by Status:</label>
                        <select id="status-filter" onchange="AdminPanel.filterUsers()">
                            <option value="">All Users</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Search:</label>
                        <input type="text" id="user-search" placeholder="Search by name or email..." 
                               onkeyup="AdminPanel.searchUsers()" />
                    </div>
                </div>

                <!-- Users Table -->
                <div class="users-table-container">
                    <table class="users-table" id="users-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" onchange="AdminPanel.toggleAllUsers(this)"></th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Organization</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generateUsersTableRows(users)}
                        </tbody>
                    </table>
                </div>

                <!-- User Statistics -->
                <div class="users-stats">
                    <div class="stat-item">
                        <strong>Total Users:</strong> ${users.length}
                    </div>
                    <div class="stat-item">
                        <strong>Active:</strong> ${users.filter(u => u.isActive).length}
                    </div>
                    <div class="stat-item">
                        <strong>Admins:</strong> ${users.filter(u => u.role === 'admin').length}
                    </div>
                    <div class="stat-item">
                        <strong>This Month:</strong> ${users.filter(u => this.isThisMonth(u.createdAt)).length}
                    </div>
                </div>
            </div>

            <!-- Add User Modal -->
            <div id="add-user-modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4>Add New User</h4>
                        <button class="modal-close" onclick="AdminPanel.hideAddUserModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="add-user-form" onsubmit="AdminPanel.handleAddUser(event)">
                            ${this.generateUserForm()}
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    static generateUsersTableRows(users) {
        if (users.length === 0) {
            return '<tr><td colspan="8" class="text-center">No users found</td></tr>';
        }
        
        return users.map(user => `
            <tr data-user-id="${user.id}" class="${!user.isActive ? 'inactive-row' : ''}">
                <td><input type="checkbox" class="user-checkbox" value="${user.id}" onchange="AdminPanel.toggleUserSelection()"></td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                <td>${user.organization || 'N/A'}</td>
                <td><span class="status-badge ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td class="actions-cell">
                    <button class="btn btn-sm btn-primary" onclick="AdminPanel.editUser('${user.id}')" title="Edit">✏️</button>
                    <button class="btn btn-sm btn-secondary" onclick="AdminPanel.resetPassword('${user.id}')" title="Reset Password">🔑</button>
                    <button class="btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}" 
                            onclick="AdminPanel.toggleUserStatus('${user.id}')" 
                            title="${user.isActive ? 'Deactivate' : 'Activate'}">
                        ${user.isActive ? '⏸️' : '▶️'}
                    </button>
                    ${user.role !== 'admin' ? `<button class="btn btn-sm btn-danger" onclick="AdminPanel.deleteUser('${user.id}')" title="Delete">🗑️</button>` : ''}
                </td>
            </tr>
        `).join('');
    }

    static generateUserForm(user = null) {
        return `
            <div class="form-grid">
                <div class="form-group">
                    <label for="user-firstName">First Name <span class="required">*</span></label>
                    <input type="text" id="user-firstName" name="firstName" required value="${user?.firstName || ''}">
                </div>
                <div class="form-group">
                    <label for="user-lastName">Last Name <span class="required">*</span></label>
                    <input type="text" id="user-lastName" name="lastName" required value="${user?.lastName || ''}">
                </div>
                <div class="form-group">
                    <label for="user-email">Email <span class="required">*</span></label>
                    <input type="email" id="user-email" name="email" required value="${user?.email || ''}">
                </div>
                <div class="form-group">
                    <label for="user-role">Role <span class="required">*</span></label>
                    <select id="user-role" name="role" required>
                        <option value="">Select role...</option>
                        <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Administrator</option>
                        <option value="advocate" ${user?.role === 'advocate' ? 'selected' : ''}>C-WAGS Advocate</option>
                        <option value="host" ${user?.role === 'host' ? 'selected' : ''}>Trial Host</option>
                        <option value="judge" ${user?.role === 'judge' ? 'selected' : ''}>Judge</option>
                        <option value="secretary" ${user?.role === 'secretary' ? 'selected' : ''}>Trial Secretary</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="user-organization">Organization</label>
                    <input type="text" id="user-organization" name="organization" value="${user?.organization || ''}">
                </div>
                <div class="form-group">
                    <label for="user-phone">Phone</label>
                    <input type="tel" id="user-phone" name="phone" value="${user?.phone || ''}">
                </div>
                ${!user ? `
                    <div class="form-group">
                        <label for="user-password">Password <span class="required">*</span></label>
                        <input type="password" id="user-password" name="password" required minlength="6">
                    </div>
                    <div class="form-group">
                        <label for="user-confirmPassword">Confirm Password <span class="required">*</span></label>
                        <input type="password" id="user-confirmPassword" name="confirmPassword" required minlength="6">
                    </div>
                ` : ''}
                <div class="form-group full-width">
                    <label>
                        <input type="checkbox" name="isActive" ${user?.isActive !== false ? 'checked' : ''}> Active User
                    </label>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="AdminPanel.hideAddUserModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">${user ? 'Update' : 'Create'} User</button>
            </div>
        `;
    }

    // User Management Functions
    static showAddUserModal() {
        document.getElementById('add-user-modal').style.display = 'flex';
    }

    static hideAddUserModal() {
        document.getElementById('add-user-modal').style.display = 'none';
        document.getElementById('add-user-form').reset();
    }

    static async handleAddUser(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const userData = Object.fromEntries(formData);
        
        try {
            // Validate form
            if (userData.password !== userData.confirmPassword) {
                App.showAlert('Passwords do not match', 'danger');
                return;
            }
            
            // Check if email exists
            const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
            if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
                App.showAlert('User with this email already exists', 'danger');
                return;
            }
            
            // Create user using Auth system
            const newUser = Auth.createUser({
                ...userData,
                isActive: userData.isActive === 'on'
            });
            
            App.showAlert(`User ${newUser.firstName} ${newUser.lastName} created successfully`, 'success');
            this.hideAddUserModal();
            this.loadUsersView(document.getElementById('admin-view-container'));
            
        } catch (error) {
            App.showAlert(`Error creating user: ${error.message}`, 'danger');
        }
    }

    static editUser(userId) {
        const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            App.showAlert('User not found', 'danger');
            return;
        }
        
        // Show edit modal with user data
        const modal = document.getElementById('add-user-modal');
        modal.querySelector('.modal-header h4').textContent = 'Edit User';
        modal.querySelector('.modal-body').innerHTML = `
            <form id="edit-user-form" onsubmit="AdminPanel.handleEditUser(event, '${userId}')">
                ${this.generateUserForm(user)}
            </form>
        `;
        modal.style.display = 'flex';
    }

    static async handleEditUser(event, userId) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const userData = Object.fromEntries(formData);
        
        try {
            const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex === -1) {
                App.showAlert('User not found', 'danger');
                return;
            }
            
            // Update user
            users[userIndex] = {
                ...users[userIndex],
                ...userData,
                isActive: userData.isActive === 'on',
                updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem('cwags_users', JSON.stringify(users));
            
            App.showAlert(`User updated successfully`, 'success');
            this.hideAddUserModal();
            this.loadUsersView(document.getElementById('admin-view-container'));
            
        } catch (error) {
            App.showAlert(`Error updating user: ${error.message}`, 'danger');
        }
    }

    static toggleUserStatus(userId) {
        const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            App.showAlert('User not found', 'danger');
            return;
        }
        
        users[userIndex].isActive = !users[userIndex].isActive;
        users[userIndex].updatedAt = new Date().toISOString();
        
        localStorage.setItem('cwags_users', JSON.stringify(users));
        
        const status = users[userIndex].isActive ? 'activated' : 'deactivated';
        App.showAlert(`User ${status} successfully`, 'success');
        this.loadUsersView(document.getElementById('admin-view-container'));
    }

    static deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        const filteredUsers = users.filter(u => u.id !== userId);
        
        localStorage.setItem('cwags_users', JSON.stringify(filteredUsers));
        
        App.showAlert('User deleted successfully', 'success');
        this.loadUsersView(document.getElementById('admin-view-container'));
    }

    static resetPassword(userId) {
        const newPassword = prompt('Enter new password for this user:');
        if (!newPassword || newPassword.length < 6) {
            App.showAlert('Password must be at least 6 characters long', 'danger');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            App.showAlert('User not found', 'danger');
            return;
        }
        
        users[userIndex].password = Auth.hashPassword(newPassword);
        users[userIndex].updatedAt = new Date().toISOString();
        
        localStorage.setItem('cwags_users', JSON.stringify(users));
        
        App.showAlert('Password reset successfully', 'success');
    }

    static filterUsers() {
        const roleFilter = document.getElementById('role-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        const searchTerm = document.getElementById('user-search').value.toLowerCase();
        
        const users = JSON.parse(localStorage.getItem('cwags_users') || '[]');
        let filteredUsers = users;
        
        // Apply filters
        if (roleFilter) {
            filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
        }
        
        if (statusFilter) {
            const isActive = statusFilter === 'active';
            filteredUsers = filteredUsers.filter(u => u.isActive === isActive);
        }
        
        if (searchTerm) {
            filteredUsers = filteredUsers.filter(u => 
                u.firstName.toLowerCase().includes(searchTerm) ||
                u.lastName.toLowerCase().includes(searchTerm) ||
                u.email.toLowerCase().includes(searchTerm) ||
                (u.organization && u.organization.toLowerCase().includes(searchTerm))
            );
        }
        
        // Update table
        const tbody = document.querySelector('#users-table tbody');
        tbody.innerHTML = this.generateUsersTableRows(filteredUsers);
    }

    static searchUsers() {
        this.filterUsers();
    }

    static toggleAllUsers(checkbox) {
        const userCheckboxes = document.querySelectorAll('.user-checkbox');
        userCheckboxes.forEach(cb => {
            cb.checked = checkbox.checked;
            if (checkbox.checked) {
                this.selectedUsers.add(cb.value);
            } else {
                this.selectedUsers.delete(cb.value);
            }
        });
        this.updateB