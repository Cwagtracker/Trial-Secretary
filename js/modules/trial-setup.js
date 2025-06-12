/**
 * C-WAGS Trial Setup Module
 * Full-featured trial creation and management
 */

class TrialSetup {
    static currentStep = 1;
    static trialData = {};

    /**
     * Load the Trial Setup module
     */
    static load() {
        console.log('🎯 Loading Trial Setup module');
        this.renderTrialSetup();
        this.setupEventListeners();
    }

    /**
     * Initialize the module
     */
    static init() {
        this.load();
    }

    /**
     * Render the main trial setup interface
     */
    static renderTrialSetup() {
        const container = document.getElementById('module-container');
        if (!container) return;

        const existingTrials = DataManager.getData('trials', []);
        
        container.innerHTML = `
            <div class="trial-setup-module">
                <div class="module-header">
                    <h2>🎯 Trial Setup</h2>
                    <p>Create and manage C-WAGS trials</p>
                </div>

                <div class="trial-setup-content">
                    <!-- Quick Actions -->
                    <div class="card" style="margin-bottom: 2rem;">
                        <div class="card-header">
                            <h3 class="card-title">🚀 Quick Actions</h3>
                        </div>
                        <div class="card-content">
                            <div class="grid grid-3">
                                <button class="btn btn-primary" onclick="TrialSetup.startNewTrial()">
                                    ➕ Create New Trial
                                </button>
                                <button class="btn btn-secondary" onclick="TrialSetup.manageTrial()">
                                    📋 Manage Existing Trial
                                </button>
                                <button class="btn btn-success" onclick="TrialSetup.duplicateTrial()">
                                    📄 Duplicate Trial
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Existing Trials -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">📊 Existing Trials (${existingTrials.length})</h3>
                        </div>
                        <div class="card-content">
                            <div id="trials-list">
                                ${this.renderTrialsList(existingTrials)}
                            </div>
                        </div>
                    </div>

                    <!-- Trial Creation Wizard (hidden initially) -->
                    <div id="trial-wizard" class="trial-wizard" style="display: none;">
                        <div class="wizard-header">
                            <h3>🧙‍♂️ Trial Creation Wizard</h3>
                            <div class="wizard-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 20%;"></div>
                                </div>
                                <span class="progress-text">Step 1 of 5</span>
                            </div>
                        </div>
                        <div id="wizard-content">
                            <!-- Wizard steps will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render the list of existing trials
     */
    static renderTrialsList(trials) {
        if (trials.length === 0) {
            return `
                <div class="empty-state">
                    <h4>No trials created yet</h4>
                    <p>Create your first trial to get started!</p>
                    <button class="btn btn-primary" onclick="TrialSetup.startNewTrial()">
                        ➕ Create First Trial
                    </button>
                </div>
            `;
        }

        return `
            <div class="trials-grid">
                ${trials.map(trial => `
                    <div class="trial-card" data-trial-id="${trial.id}">
                        <div class="trial-header">
                            <h4>${trial.name}</h4>
                            <span class="trial-status status-${trial.status || 'pending'}">${(trial.status || 'pending').toUpperCase()}</span>
                        </div>
                        <div class="trial-details">
                            <div class="trial-detail">
                                <span class="label">Host:</span>
                                <span class="value">${trial.host || 'Not set'}</span>
                            </div>
                            <div class="trial-detail">
                                <span class="label">Date:</span>
                                <span class="value">${trial.date ? new Date(trial.date).toLocaleDateString() : 'Not set'}</span>
                            </div>
                            <div class="trial-detail">
                                <span class="label">Location:</span>
                                <span class="value">${trial.location || 'Not set'}</span>
                            </div>
                            <div class="trial-detail">
                                <span class="label">Classes:</span>
                                <span class="value">${trial.classes ? trial.classes.length : 0}</span>
                            </div>
                        </div>
                        <div class="trial-actions">
                            <button class="btn btn-sm btn-primary" onclick="TrialSetup.editTrial('${trial.id}')">
                                ✏️ Edit
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="TrialSetup.viewTrial('${trial.id}')">
                                👁️ View
                            </button>
                            <button class="btn btn-sm btn-success" onclick="TrialSetup.duplicateSpecificTrial('${trial.id}')">
                                📄 Duplicate
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="TrialSetup.deleteTrial('${trial.id}')">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Setup event listeners
     */
    static setupEventListeners() {
        // Already handled in onclick attributes for simplicity
    }

    /**
     * Start new trial creation wizard
     */
    static startNewTrial() {
        this.currentStep = 1;
        this.trialData = {
            id: 'trial-' + Date.now(),
            createdAt: new Date().toISOString(),
            createdBy: Auth.getCurrentUser()?.id,
            status: 'pending'
        };

        document.getElementById('trial-wizard').style.display = 'block';
        this.loadWizardStep(1);
        document.getElementById('trial-wizard').scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Load specific wizard step
     */
    static loadWizardStep(step) {
        this.currentStep = step;
        const content = document.getElementById('wizard-content');
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');

        // Update progress
        const percentage = (step / 5) * 100;
        progressFill.style.width = percentage + '%';
        progressText.textContent = `Step ${step} of 5`;

        switch(step) {
            case 1:
                content.innerHTML = this.renderStep1();
                break;
            case 2:
                content.innerHTML = this.renderStep2();
                break;
            case 3:
                content.innerHTML = this.renderStep3();
                break;
            case 4:
                content.innerHTML = this.renderStep4();
                break;
            case 5:
                content.innerHTML = this.renderStep5();
                break;
        }
    }

    /**
     * Step 1: Basic Trial Information
     */
    static renderStep1() {
        return `
            <div class="wizard-step">
                <h4>📋 Basic Trial Information</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="trial-name">Trial Name *</label>
                        <input type="text" id="trial-name" required 
                               value="${this.trialData.name || ''}"
                               placeholder="e.g., Spring C-WAGS Trial 2024">
                    </div>
                    <div class="form-group">
                        <label for="trial-host">Host Organization *</label>
                        <input type="text" id="trial-host" required 
                               value="${this.trialData.host || ''}"
                               placeholder="e.g., Local Dog Training Club">
                    </div>
                    <div class="form-group">
                        <label for="trial-date">Trial Date *</label>
                        <input type="date" id="trial-date" required 
                               value="${this.trialData.date ? this.trialData.date.split('T')[0] : new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label for="trial-time">Start Time</label>
                        <input type="time" id="trial-time" 
                               value="${this.trialData.time || '08:00'}">
                    </div>
                    <div class="form-group">
                        <label for="trial-location">Location *</label>
                        <input type="text" id="trial-location" required 
                               value="${this.trialData.location || ''}"
                               placeholder="e.g., Community Center, 123 Main St">
                    </div>
                    <div class="form-group">
                        <label for="trial-description">Description</label>
                        <textarea id="trial-description" rows="3" 
                                  placeholder="Optional description of the trial">${this.trialData.description || ''}</textarea>
                    </div>
                </div>
                <div class="wizard-actions">
                    <button class="btn btn-secondary" onclick="TrialSetup.cancelWizard()">Cancel</button>
                    <button class="btn btn-primary" onclick="TrialSetup.nextStep()">Next Step →</button>
                </div>
            </div>
        `;
    }

    /**
     * Step 2: Judge and Officials
     */
    static renderStep2() {
        return `
            <div class="wizard-step">
                <h4>👨‍⚖️ Judge and Officials</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="judge-name">Judge Name *</label>
                        <input type="text" id="judge-name" required 
                               value="${this.trialData.judgeName || ''}"
                               placeholder="Judge Full Name">
                    </div>
                    <div class="form-group">
                        <label for="judge-email">Judge Email</label>
                        <input type="email" id="judge-email" 
                               value="${this.trialData.judgeEmail || ''}"
                               placeholder="judge@email.com">
                    </div>
                    <div class="form-group">
                        <label for="judge-phone">Judge Phone</label>
                        <input type="tel" id="judge-phone" 
                               value="${this.trialData.judgePhone || ''}"
                               placeholder="(555) 123-4567">
                    </div>
                    <div class="form-group">
                        <label for="trial-secretary">Trial Secretary</label>
                        <input type="text" id="trial-secretary" 
                               value="${this.trialData.trialSecretary || ''}"
                               placeholder="Secretary Name">
                    </div>
                    <div class="form-group">
                        <label for="secretary-email">Secretary Email</label>
                        <input type="email" id="secretary-email" 
                               value="${this.trialData.secretaryEmail || ''}"
                               placeholder="secretary@email.com">
                    </div>
                    <div class="form-group">
                        <label for="ring-steward">Ring Steward</label>
                        <input type="text" id="ring-steward" 
                               value="${this.trialData.ringSteward || ''}"
                               placeholder="Steward Name">
                    </div>
                </div>
                <div class="wizard-actions">
                    <button class="btn btn-secondary" onclick="TrialSetup.prevStep()">← Previous</button>
                    <button class="btn btn-primary" onclick="TrialSetup.nextStep()">Next Step →</button>
                </div>
            </div>
        `;
    }

    /**
     * Step 3: Classes and Levels
     */
    static renderStep3() {
        const commonClasses = [
            'Novice', 'Advanced', 'Excellent', 'Masters',
            'Intro to Games', 'Starters Games', 'Advanced Games',
            'Fun Match', 'Special Event'
        ];

        return `
            <div class="wizard-step">
                <h4>🏆 Classes and Levels</h4>
                <div class="classes-section">
                    <div class="form-group">
                        <label>Select Classes (check all that apply):</label>
                        <div class="checkbox-grid">
                            ${commonClasses.map(className => `
                                <label class="checkbox-item">
                                    <input type="checkbox" value="${className}" 
                                           ${(this.trialData.classes || []).includes(className) ? 'checked' : ''}>
                                    ${className}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="custom-classes">Additional Custom Classes (one per line):</label>
                        <textarea id="custom-classes" rows="4" 
                                  placeholder="Enter any additional classes not listed above">${(this.trialData.customClasses || []).join('\\n')}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="entry-limit">Entry Limit per Class</label>
                        <input type="number" id="entry-limit" min="1" max="100"
                               value="${this.trialData.entryLimit || 25}"
                               placeholder="25">
                    </div>
                </div>
                <div class="wizard-actions">
                    <button class="btn btn-secondary" onclick="TrialSetup.prevStep()">← Previous</button>
                    <button class="btn btn-primary" onclick="TrialSetup.nextStep()">Next Step →</button>
                </div>
            </div>
        `;
    }

    /**
     * Step 4: Entry Information
     */
    static renderStep4() {
        return `
            <div class="wizard-step">
                <h4>💰 Entry Information</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="entry-fee">Entry Fee per Run</label>
                        <input type="number" id="entry-fee" step="0.01" min="0"
                               value="${this.trialData.entryFee || 25.00}"
                               placeholder="25.00">
                    </div>
                    <div class="form-group">
                        <label for="entry-deadline">Entry Deadline</label>
                        <input type="datetime-local" id="entry-deadline"
                               value="${this.trialData.entryDeadline || ''}">
                    </div>
                    <div class="form-group">
                        <label for="late-fee">Late Entry Fee</label>
                        <input type="number" id="late-fee" step="0.01" min="0"
                               value="${this.trialData.lateFee || 5.00}"
                               placeholder="5.00">
                    </div>
                    <div class="form-group">
                        <label for="withdrawal-deadline">Withdrawal Deadline</label>
                        <input type="datetime-local" id="withdrawal-deadline"
                               value="${this.trialData.withdrawalDeadline || ''}">
                    </div>
                    <div class="form-group">
                        <label for="payment-methods">Accepted Payment Methods</label>
                        <div class="checkbox-grid">
                            <label class="checkbox-item">
                                <input type="checkbox" value="cash" 
                                       ${(this.trialData.paymentMethods || ['cash']).includes('cash') ? 'checked' : ''}>
                                Cash
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" value="check" 
                                       ${(this.trialData.paymentMethods || ['check']).includes('check') ? 'checked' : ''}>
                                Check
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" value="paypal" 
                                       ${(this.trialData.paymentMethods || ['paypal']).includes('paypal') ? 'checked' : ''}>
                                PayPal
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" value="venmo" 
                                       ${(this.trialData.paymentMethods || []).includes('venmo') ? 'checked' : ''}>
                                Venmo
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="special-instructions">Special Instructions</label>
                        <textarea id="special-instructions" rows="3"
                                  placeholder="Any special instructions for entries">${this.trialData.specialInstructions || ''}</textarea>
                    </div>
                </div>
                <div class="wizard-actions">
                    <button class="btn btn-secondary" onclick="TrialSetup.prevStep()">← Previous</button>
                    <button class="btn btn-primary" onclick="TrialSetup.nextStep()">Final Step →</button>
                </div>
            </div>
        `;
    }

    /**
     * Step 5: Review and Create
     */
    static renderStep5() {
        // Collect current data
        this.collectCurrentStepData();

        return `
            <div class="wizard-step">
                <h4>📋 Review and Create Trial</h4>
                <div class="review-section">
                    <div class="review-grid">
                        <div class="review-card">
                            <h5>📋 Basic Information</h5>
                            <div class="review-item">
                                <span class="label">Name:</span>
                                <span class="value">${this.trialData.name || 'Not set'}</span>
                            </div>
                            <div class="review-item">
                                <span class="label">Host:</span>
                                <span class="value">${this.trialData.host || 'Not set'}</span>
                            </div>
                            <div class="review-item">
                                <span class="label">Date:</span>
                                <span class="value">${this.trialData.date ? new Date(this.trialData.date).toLocaleDateString() : 'Not set'}</span>
                            </div>
                            <div class="review-item">
                                <span class="label">Location:</span>
                                <span class="value">${this.trialData.location || 'Not set'}</span>
                            </div>
                        </div>
                        
                        <div class="review-card">
                            <h5>👨‍⚖️ Officials</h5>
                            <div class="review-item">
                                <span class="label">Judge:</span>
                                <span class="value">${this.trialData.judgeName || 'Not set'}</span>
                            </div>
                            <div class="review-item">
                                <span class="label">Secretary:</span>
                                <span class="value">${this.trialData.trialSecretary || 'Not set'}</span>
                            </div>
                            <div class="review-item">
                                <span class="label">Steward:</span>
                                <span class="value">${this.trialData.ringSteward || 'Not set'}</span>
                            </div>
                        </div>
                        
                        <div class="review-card">
                            <h5>🏆 Classes</h5>
                            <div class="review-item">
                                <span class="label">Selected Classes:</span>
                                <div class="classes-list">
                                    ${(this.trialData.classes || []).map(c => `<span class="class-tag">${c}</span>`).join('')}
                                    ${(this.trialData.customClasses || []).map(c => `<span class="class-tag custom">${c}</span>`).join('')}
                                </div>
                            </div>
                            <div class="review-item">
                                <span class="label">Entry Limit:</span>
                                <span class="value">${this.trialData.entryLimit || 25} per class</span>
                            </div>
                        </div>
                        
                        <div class="review-card">
                            <h5>💰 Pricing</h5>
                            <div class="review-item">
                                <span class="label">Entry Fee:</span>
                                <span class="value">$${this.trialData.entryFee || '25.00'}</span>
                            </div>
                            <div class="review-item">
                                <span class="label">Late Fee:</span>
                                <span class="value">$${this.trialData.lateFee || '5.00'}</span>
                            </div>
                            <div class="review-item">
                                <span class="label">Payment Methods:</span>
                                <span class="value">${(this.trialData.paymentMethods || []).join(', ')}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="wizard-actions">
                    <button class="btn btn-secondary" onclick="TrialSetup.prevStep()">← Previous</button>
                    <button class="btn btn-success btn-lg" onclick="TrialSetup.createTrial()">✨ Create Trial</button>
                </div>
            </div>
        `;
    }

    /**
     * Navigate to next step
     */
    static nextStep() {
        if (this.validateCurrentStep()) {
            this.collectCurrentStepData();
            this.loadWizardStep(this.currentStep + 1);
        }
    }

    /**
     * Navigate to previous step
     */
    static prevStep() {
        this.collectCurrentStepData();
        this.loadWizardStep(this.currentStep - 1);
    }

    /**
     * Validate current step
     */
    static validateCurrentStep() {
        switch(this.currentStep) {
            case 1:
                const name = document.getElementById('trial-name').value;
                const host = document.getElementById('trial-host').value;
                const date = document.getElementById('trial-date').value;
                const location = document.getElementById('trial-location').value;
                
                if (!name || !host || !date || !location) {
                    CWAGSApp.showNotification('Please fill in all required fields', 'error');
                    return false;
                }
                break;
            case 2:
                const judgeName = document.getElementById('judge-name').value;
                if (!judgeName) {
                    CWAGSApp.showNotification('Judge name is required', 'error');
                    return false;
                }
                break;
        }
        return true;
    }

    /**
     * Collect data from current step
     */
    static collectCurrentStepData() {
        switch(this.currentStep) {
            case 1:
                this.trialData.name = document.getElementById('trial-name')?.value;
                this.trialData.host = document.getElementById('trial-host')?.value;
                this.trialData.date = document.getElementById('trial-date')?.value;
                this.trialData.time = document.getElementById('trial-time')?.value;
                this.trialData.location = document.getElementById('trial-location')?.value;
                this.trialData.description = document.getElementById('trial-description')?.value;
                break;
            case 2:
                this.trialData.judgeName = document.getElementById('judge-name')?.value;
                this.trialData.judgeEmail = document.getElementById('judge-email')?.value;
                this.trialData.judgePhone = document.getElementById('judge-phone')?.value;
                this.trialData.trialSecretary = document.getElementById('trial-secretary')?.value;
                this.trialData.secretaryEmail = document.getElementById('secretary-email')?.value;
                this.trialData.ringSteward = document.getElementById('ring-steward')?.value;
                break;
            case 3:
                const selectedClasses = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
                const customClasses = document.getElementById('custom-classes')?.value.split('\\n').filter(c => c.trim());
                this.trialData.classes = selectedClasses;
                this.trialData.customClasses = customClasses;
                this.trialData.entryLimit = parseInt(document.getElementById('entry-limit')?.value) || 25;
                break;
            case 4:
                this.trialData.entryFee = parseFloat(document.getElementById('entry-fee')?.value) || 25.00;
                this.trialData.entryDeadline = document.getElementById('entry-deadline')?.value;
                this.trialData.lateFee = parseFloat(document.getElementById('late-fee')?.value) || 5.00;
                this.trialData.withdrawalDeadline = document.getElementById('withdrawal-deadline')?.value;
                this.trialData.paymentMethods = Array.from(document.querySelectorAll('input[value="cash"], input[value="check"], input[value="paypal"], input[value="venmo"]')).filter(cb => cb.checked).map(cb => cb.value);
                this.trialData.specialInstructions = document.getElementById('special-instructions')?.value;
                break;
        }
    }

    /**
     * Create the trial
     */
    static createTrial() {
        this.collectCurrentStepData();
        
        // Finalize trial data
        this.trialData.status = 'active';
        this.trialData.updatedAt = new Date().toISOString();
        
        // Save to data manager
        const trials = DataManager.getData('trials', []);
        trials.push(this.trialData);
        DataManager.saveData('trials', trials);
        
        // Show success message
        CWAGSApp.showNotification('Trial created successfully!', 'success');
        
        // Hide wizard and refresh view
        document.getElementById('trial-wizard').style.display = 'none';
        this.renderTrialSetup();
        
        // Log activity
        if (window.Auth) {
            Auth.logActivity('trial_created', Auth.getCurrentUser()?.id);
        }
    }

    /**
     * Cancel wizard
     */
    static cancelWizard() {
        if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
            document.getElementById('trial-wizard').style.display = 'none';
            this.trialData = {};
            this.currentStep = 1;
        }
    }

    /**
     * Edit existing trial
     */
    static editTrial(trialId) {
        const trials = DataManager.getData('trials', []);
        const trial = trials.find(t => t.id === trialId);
        
        if (trial) {
            this.trialData = { ...trial };
            this.startNewTrial();
            CWAGSApp.showNotification('Editing trial: ' + trial.name, 'info');
        }
    }

    /**
     * View trial details
     */
    static viewTrial(trialId) {
        const trials = DataManager.getData('trials', []);
        const trial = trials.find(t => t.id === trialId);
        
        if (trial) {
            const details = `
                Trial: ${trial.name}
                Host: ${trial.host}
                Date: ${trial.date ? new Date(trial.date).toLocaleDateString() : 'Not set'}
                Location: ${trial.location}
                Judge: ${trial.judgeName || 'Not set'}
                Classes: ${(trial.classes || []).length}
                Status: ${trial.status || 'pending'}
            `;
            alert(details);
        }
    }

    /**
     * Delete trial
     */
    static deleteTrial(trialId) {
        if (confirm('Are you sure you want to delete this trial? This action cannot be undone.')) {
            const trials = DataManager.getData('trials', []);
            const updatedTrials = trials.filter(t => t.id !== trialId);
            DataManager.saveData('trials', updatedTrials);
            
            CWAGSApp.showNotification('Trial deleted successfully', 'success');
            this.renderTrialSetup();
        }
    }

    /**
     * Duplicate specific trial
     */
    static duplicateSpecificTrial(trialId) {
        const trials = DataManager.getData('trials', []);
        const trial = trials.find(t => t.id === trialId);
        
        if (trial) {
            const duplicatedTrial = {
                ...trial,
                id: 'trial-' + Date.now(),
                name: trial.name + ' (Copy)',
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            trials.push(duplicatedTrial);
            DataManager.saveData('trials', trials);
            
            CWAGSApp.showNotification('Trial duplicated successfully!', 'success');
            this.renderTrialSetup();
        }
    }

    /**
     * Manage trial (placeholder for future functionality)
     */
    static manageTrial() {
        CWAGSApp.showNotification('Management features coming soon!', 'info');
    }

    /**
     * Duplicate trial (show selection dialog)
     */
    static duplicateTrial() {
        const trials = DataManager.getData('trials', []);
        if (trials.length === 0) {
            CWAGSApp.showNotification('No trials available to duplicate', 'warning');
            return;
        }
        
        // For now, just duplicate the most recent trial
        const latestTrial = trials[trials.length - 1];
        this.duplicateSpecificTrial(latestTrial.id);
    }
}

// Make TrialSetup globally available
window.TrialSetup = TrialSetup;
