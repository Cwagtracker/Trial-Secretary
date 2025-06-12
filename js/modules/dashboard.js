// js/modules/dashboard.js
class Dashboard {
    static init() {
        this.loadModule();
        this.loadDashboardData();
        this.setupEventListeners();
    }

    static loadModule() {
        const container = document.getElementById('module-container');
        container.innerHTML = `
            <div class="dashboard-module">
                <div class="module-header">
                    <h2>📊 Dashboard</h2>
                    <p>Welcome to the C-WAGS Trial Management System</p>
                </div>

                <div class="dashboard-content">
                    <!-- Quick Stats -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">🎯</div>
                            <div class="stat-content">
                                <h3 id="total-trials">0</h3>
                                <p>Total Trials</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">📝</div>
                            <div class="stat-content">
                                <h3 id="total-entries">0</h3>
                                <p>Total Entries</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🏆</div>
                            <div class="stat-content">
                                <h3 id="completed-trials">0</h3>
                                <p>Completed Trials</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">👥</div>
                            <div class="stat-content">
                                <h3 id="active-users">0</h3>
                                <p>Active Users</p>
                            </div>
                        </div>
                    </div>

                    <!-- Main Dashboard Grid -->
                    <div class="dashboard-grid">
                        <!-- Recent Trials -->
                        <div class="dashboard-card">
                            <div class="card-header">
                                <h3>Recent Trials</h3>
                                <button class="btn btn-primary btn-sm" onclick="App.loadModule('trial-setup')">
                                    Create New Trial
                                </button>
                            </div>
                            <div class="card-content">
                                <div id="recent-trials" class="item-list">
                                    <div class="loading">Loading recent trials...</div>
                                </div>
                            </div>
                        </div>

                        <!-- Pending Approvals (Admin Only) -->
                        <div class="dashboard-card admin-only" style="display: none;">
                            <div class="card-header">
                                <h3>Pending Approvals</h3>
                                <span class="badge" id="pending-count">0</span>
                            </div>
                            <div class="card-content">
                                <div id="pending-approvals" class="item-list">
                                    <div class="loading">Loading pending items...</div>
                                </div>
                            </div>
                        </div>

                        <!-- Recent Entries -->
                        <div class="dashboard-card">
                            <div class="card-header">
                                <h3>Recent Entries</h3>
                                <button class="btn btn-secondary btn-sm" onclick="App.loadModule('entries')">
                                    Manage Entries
                                </button>
                            </div>
                            <div class="card-content">
                                <div id="recent-entries" class="item-list">
                                    <div class="loading">Loading recent entries...</div>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="dashboard-card">
                            <div class="card-header">
                                <h3>Quick Actions</h3>
                            </div>
                            <div class="card-content">
                                <div class="quick-actions">
                                    <button class="action-btn" onclick="Dashboard.quickCreateTrial()">
                                        <div class="action-icon">🎯</div>
                                        <div class="action-text">Create Trial</div>
                                    </button>
                                    <button class="action-btn" onclick="Dashboard.generatePaperwork()">
                                        <div class="action-icon">📄</div>
                                        <div class="action-text">Generate Forms</div>
                                    </button>
                                    <button class="action-btn" onclick="Dashboard.viewScores()">
                                        <div class="action-icon">🏆</div>
                                        <div class="action-text">View Scores</div>
                                    </button>
                                    <button class="action-btn" onclick="Dashboard.exportData()">
                                        <div class="action-icon">💾</div>
                                        <div class="action-text">Export Data</div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- System Status -->
                        <div class="dashboard-card">
                            <div class="card-header">
                                <h3>System Status</h3>
                            </div>
                            <div class="card-content">
                                <div id="system-status" class="status-list">
                                    <div class="loading">Checking system status...</div>
                                </div>
                            </div>
                        </div>

                        <!-- Recent Activity -->
                        <div class="dashboard-card">
                            <div class="card-header">
                                <h3>Recent Activity</h3>
                            </div>
                            <div class="card-content">
                                <div id="recent-activity" class="activity-list">
                                    <div class="loading">Loading activity...</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Trial Calendar -->
                    <div class="calendar-section">
                        <div class="card-header">
                            <h3>Trial Calendar</h3>
                            <div class="calendar-controls">
                                <button class="btn btn-secondary btn-sm" onclick="Dashboard.previousMonth()">‹</button>
                                <span id="calendar-month">Loading...</span>
                                <button class="btn btn-secondary btn-sm" onclick="Dashboard.nextMonth()">›</button>
                            </div>
                        </div>
                        <div id="trial-calendar" class="calendar-grid">
                            <div class="loading">Loading calendar...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static setupEventListeners() {
        // Refresh button
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                this.refresh();
            }
        });

        // Auto-refresh every 5 minutes
        setInterval(() => {
            this.refresh();
        }, 5 * 60 * 1000);
    }

    static async loadDashboardData() {
        try {
            App.showLoading('Loading dashboard data...');
            
            // Load all data concurrently
            await Promise.all([
                this.loadStats(),
                this.loadRecentTrials(),
                this.loadPendingApprovals(),
                this.loadRecentEntries(),
                this.loadSystemStatus(),
                this.loadRecentActivity(),
                this.loadTrialCalendar()
            ]);
            
        } catch (error) {
            App.handleError(error, 'Dashboard');
        } finally {
            App.hideLoading();
        }
    }

    static async loadStats() {
        const trials = DataManager.getTrials();
        const entries = DataManager.getEntries();
        const users = DataManager.getData(DataManager.keys.USERS, []);
        
        const stats = {
            totalTrials: trials.length,
            totalEntries: entries.length,
            completedTrials: trials.filter(t => t.status === 'completed').length,
            activeUsers: users.filter(u => u.isActive).length
        };
        
        // Update UI
        document.getElementById('total-trials').textContent = stats.totalTrials;
        document.getElementById('total-entries').textContent = stats.totalEntries;
        document.getElementById('completed-trials').textContent = stats.completedTrials;
        document.getElementById('active-users').textContent = stats.activeUsers;
    }

    static async loadRecentTrials() {
        const trials = DataManager.getTrials()
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5);
        
        const container = document.getElementById('recent-trials');
        
        if (trials.length === 0) {
            container.innerHTML = '<div class="empty-state">No trials found. <a href="#" onclick="App.loadModule(\'trial-setup\')">Create your first trial</a></div>';
            return;
        }
        
        container.innerHTML = trials.map(trial => `
            <div class="item" onclick="Dashboard.viewTrial('${trial.id}')">
                <div class="item-content">
                    <div class="item-title">${trial.name}</div>
                    <div class="item-meta">
                        ${App.formatDate(trial.date)} • ${trial.host}
                    </div>
                </div>
                <div class="item-status">
                    <span class="status ${trial.status}">${trial.status}</span>
                </div>
            </div>
        `).join('');
    }

    static async loadPendingApprovals() {
        const user = Auth.getCurrentUser();
        if (!user || !App.hasPermission(user, 'approve_trials')) {
            return;
        }
        
        const pendingTrials = DataManager.getTrialsByStatus('pending');
        const container = document.getElementById('pending-approvals');
        const badge = document.getElementById('pending-count');
        
        badge.textContent = pendingTrials.length;
        
        if (pendingTrials.length === 0) {
            container.innerHTML = '<div class="empty-state">No pending approvals</div>';
            return;
        }
        
        container.innerHTML = pendingTrials.map(trial => `
            <div class="item pending-item">
                <div class="item-content">
                    <div class="item-title">${trial.name}</div>
                    <div class="item-meta">
                        Submitted ${App.formatDate(trial.createdAt)} by ${trial.host}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-success btn-xs" onclick="Dashboard.approveTrial('${trial.id}')">
                        Approve
                    </button>
                    <button class="btn btn-danger btn-xs" onclick="Dashboard.rejectTrial('${trial.id}')">
                        Reject
                    </button>
                </div>
            </div>
        `).join('');
    }

    static async loadRecentEntries() {
        const entries = DataManager.getEntries()
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5);
        
        const container = document.getElementById('recent-entries');
        
        if (entries.length === 0) {
            container.innerHTML = '<div class="empty-state">No entries found</div>';
            return;
        }
        
        container.innerHTML = entries.map(entry => {
            const trial = DataManager.getTrial(entry.trialId);
            return `
                <div class="item" onclick="Dashboard.viewEntry('${entry.id}')">
                    <div class="item-content">
                        <div class="item-title">${entry.handlerName} & ${entry.dogName}</div>
                        <div class="item-meta">
                            ${trial ? trial.name : 'Unknown Trial'} • ${App.formatDate(entry.createdAt)}
                        </div>
                    </div>
                    <div class="item-status">
                        <span class="badge">${entry.classes.length} classes</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    static async loadSystemStatus() {
        const container = document.getElementById('system-status');
        const storageInfo = DataManager.getStorageInfo();
        
        const statusItems = [
            {
                label: 'Data Storage',
                value: storageInfo.totalSizeFormatted,
                status: storageInfo.available === 'Available' ? 'good' : 'warning'
            },
            {
                label: 'Total Records',
                value: Object.values(storageInfo.usage).reduce((sum, item) => sum + item.records, 0),
                status: 'good'
            },
            {
                label: 'Last Backup',
                value: this.getLastBackupTime(),
                status: this.getBackupStatus()
            },
            {
                label: 'System Version',
                value: '1.0.0',
                status: 'good'
            }
        ];
        
        container.innerHTML = statusItems.map(item => `
            <div class="status-item">
                <div class="status-label">${item.label}</div>
                <div class="status-value">
                    <span class="status-indicator ${item.status}"></span>
                    ${item.value}
                </div>
            </div>
        `).join('');
    }

    static getLastBackupTime() {
        const backups = DataManager.getBackups();
        if (backups.length === 0) return 'Never';
        
        const lastBackup = backups[0];
        return App.formatDate(lastBackup.date, 'datetime');
    }

    static getBackupStatus() {
        const backups = DataManager.getBackups();
        if (backups.length === 0) return 'warning';
        
        const lastBackup = backups[0];
        const daysSinceBackup = (Date.now() - lastBackup.date.getTime()) / (1000 * 60 * 60 * 24);
        
        return daysSinceBackup > 7 ? 'warning' : 'good';
    }

    static async loadRecentActivity() {
        const container = document.getElementById('recent-activity');
        
        // This would typically come from an activity log
        // For now, we'll simulate recent activity
        const activities = this.generateRecentActivity();
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    static generateRecentActivity() {
        const trials = DataManager.getTrials().slice(-3);
        const entries = DataManager.getEntries().slice(-3);
        
        const activities = [];
        
        trials.forEach(trial => {
            activities.push({
                icon: '🎯',
                text: `Trial "${trial.name}" was ${trial.status}`,
                time: App.formatDate(trial.updatedAt, 'datetime')
            });
        });
        
        entries.forEach(entry => {
            activities.push({
                icon: '📝',
                text: `${entry.handlerName} entered ${entry.dogName}`,
                time: App.formatDate(entry.createdAt, 'datetime')
            });
        });
        
        return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
    }

    static currentCalendarDate = new Date();

    static async loadTrialCalendar() {
        const container = document.getElementById('trial-calendar');
        const monthEl = document.getElementById('calendar-month');
        
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        
        monthEl.textContent = this.currentCalendarDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        const trials = DataManager.getTrials().filter(trial => {
            const trialDate = new Date(trial.date);
            return trialDate.getFullYear() === year && trialDate.getMonth() === month;
        });
        
        const calendar = this.generateCalendarHTML(year, month, trials);
        container.innerHTML = calendar;
    }

    static generateCalendarHTML(year, month, trials) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        let html = `
            <div class="calendar-header">
                <div class="calendar-day-name">Sun</div>
                <div class="calendar-day-name">Mon</div>
                <div class="calendar-day-name">Tue</div>
                <div class="calendar-day-name">Wed</div>
                <div class="calendar-day-name">Thu</div>
                <div class="calendar-day-name">Fri</div>
                <div class="calendar-day-name">Sat</div>
            </div>
            <div class="calendar-days">
        `;
        
        // Empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayTrials = trials.filter(trial => {
                const trialDate = new Date(trial.date);
                return trialDate.getDate() === day;
            });
            
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${dayTrials.length > 0 ? 'has-trials' : ''}">
                    <div class="calendar-day-number">${day}</div>
                    ${dayTrials.map(trial => `
                        <div class="calendar-trial ${trial.status}" onclick="Dashboard.viewTrial('${trial.id}')" title="${trial.name}">
                            ${trial.name.substring(0, 10)}${trial.name.length > 10 ? '...' : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    // ===================
    // QUICK ACTIONS
    // ===================

    static quickCreateTrial() {
        App.loadModule('trial-setup');
    }

    static generatePaperwork() {
        App.loadModule('paperwork');
    }

    static viewScores() {
        App.loadModule('scoring');
    }

    static exportData() {
        const data = DataManager.exportAllData();
        const filename = `cwags-data-export-${new Date().toISOString().split('T')[0]}.json`;
        App.downloadFile(data, filename, 'application/json');
        App.showAlert('Data exported successfully', 'success');
    }

    // ===================
    // CALENDAR NAVIGATION
    // ===================

    static previousMonth() {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() - 1);
        this.loadTrialCalendar();
    }

    static nextMonth() {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + 1);
        this.loadTrialCalendar();
    }

    // ===================
    // ITEM ACTIONS
    // ===================

    static viewTrial(trialId) {
        // Store trial ID and switch to trial setup module
        sessionStorage.setItem('selectedTrialId', trialId);
        App.loadModule('trial-setup');
    }

    static viewEntry(entryId) {
        // Store entry ID and switch to entries module
        sessionStorage.setItem('selectedEntryId', entryId);
        App.loadModule('entries');
    }

    static async approveTrial(trialId) {
        if (!confirm('Are you sure you want to approve this trial?')) return;
        
        try {
            const trial = DataManager.getTrial(trialId);
            trial.status = 'approved';
            trial.approvedAt = new Date().toISOString();
            trial.approvedBy = Auth.getCurrentUser().id;
            
            DataManager.saveTrial(trial);
            App.showAlert('Trial approved successfully', 'success');
            this.loadPendingApprovals();
            this.loadStats();
        } catch (error) {
            App.handleError(error, 'Trial Approval');
        }
    }

    static async rejectTrial(trialId) {
        const reason = prompt('Please provide a reason for rejection:');
        if (!reason) return;
        
        try {
            const trial = DataManager.getTrial(trialId);
            trial.status = 'rejected';
            trial.rejectedAt = new Date().toISOString();
            trial.rejectedBy = Auth.getCurrentUser().id;
            trial.rejectionReason = reason;
            
            DataManager.saveTrial(trial);
            App.showAlert('Trial rejected', 'warning');
            this.loadPendingApprovals();
            this.loadStats();
        } catch (error) {
            App.handleError(error, 'Trial Rejection');
        }
    }

    // ===================
    // MODULE INTERFACE
    // ===================

    static refresh() {
        this.loadDashboardData();
    }

    static save() {
        // Dashboard doesn't have persistent state to save
        return Promise.resolve();
    }

    static createNew() {
        this.quickCreateTrial();
    }
}
