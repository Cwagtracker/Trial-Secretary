// js/modules/trial-setup.js
class TrialSetup {
    static init() {
        this.currentTrial = null;
        this.isEditing = false;
        this.loadModule();
        this.setupEventListeners();
        this.loadTrialData();
        this.checkForSelectedTrial();
    }

    static loadModule() {
        const container = document.getElementById('module-container');
        container.innerHTML = `
            <div class="trial-setup-module">
                <div class="module-header">
                    <h2>🎯 Trial Setup & Management</h2>
                    <p>Create, edit, and manage C-WAGS trials</p>
                </div>

                <div class="trial-setup-content">
                    <!-- Trial Management Tabs -->
                    <div class="setup-tabs">
                        <button class="setup-tab active" data-tab="trial-form">
                            Create/Edit Trial
                        </button>
                        <button class="setup-tab" data-tab="trial-list">
                            Manage Trials
                        </button>
                        <button class="setup-tab" data-tab="trial-templates">
                            Templates
                        </button>
                    </div>

                    <!-- Trial Form Tab -->
                    <div id="trial-form" class="setup-tab-content active">
                        <div class="trial-form-container">
                            <div class="form-header">
                                <h3 id="form-title">Create New Trial</h3>
                                <div class="form-actions">
                                    <button class="btn btn-secondary" onclick="TrialSetup.resetForm()">
                                        Reset Form
                                    </button>
                                    <button class="btn btn-warning" onclick="TrialSetup.saveDraft()">
                                        Save Draft
                                    </button>
                                    <button class="btn btn-success" onclick="TrialSetup.submitForApproval()" id="submit-btn">
                                        Submit for Approval
                                    </button>
                                </div>
                            </div>

                            <form id="trial-setup-form" class="trial-form">
                                <!-- Basic Trial Information -->
                                <div class="form-section">
                                    <h4>Basic Information</h4>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="trial-name">Trial Name <span class="required">*</span></label>
                                            <input type="text" id="trial-name" name="name" required 
                                                   placeholder="e.g., Spring Fun Trial 2025">
                                        </div>
                                        <div class="form-group">
                                            <label for="trial-type">Trial Type <span class="required">*</span></label>
                                            <select id="trial-type" name="type" required onchange="TrialSetup.onTrialTypeChange()">
                                                <option value="">Select trial type...</option>
                                                <option value="regular">Regular Trial</option>
                                                <option value="fun-match">Fun Match</option>
                                                <option value="league">League Trial</option>
                                                <option value="video">Video Trial</option>
                                                <option value="specialty">Specialty Trial</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="host-name">Host Name <span class="required">*</span></label>
                                            <input type="text" id="host-name" name="host" required 
                                                   placeholder="Organization or individual hosting">
                                        </div>
                                        <div class="form-group">
                                            <label for="host-email">Host Email <span class="required">*</span></label>
                                            <input type="email" id="host-email" name="hostEmail" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="host-phone">Host Phone</label>
                                            <input type="tel" id="host-phone" name="hostPhone">
                                        </div>
                                    </div>

                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="trial-date">Trial Date <span class="required">*</span></label>
                                            <input type="date" id="trial-date" name="date" required 
                                                   min="${new Date().toISOString().split('T')[0]}">
                                        </div>
                                        <div class="form-group">
                                            <label for="entry-deadline">Entry Deadline <span class="required">*</span></label>
                                            <input type="datetime-local" id="entry-deadline" name="entryDeadline" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="entry-limit">Entry Limit</label>
                                            <input type="number" id="entry-limit" name="entryLimit" min="1" max="500" 
                                                   placeholder="Optional limit">
                                        </div>
                                    </div>
                                </div>

                                <!-- Location Information -->
                                <div class="form-section">
                                    <h4>Location & Venue</h4>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="venue-name">Venue Name <span class="required">*</span></label>
                                            <input type="text" id="venue-name" name="venueName" required 
                                                   placeholder="Name of facility">
                                        </div>
                                        <div class="form-group">
                                            <label for="venue-address">Address <span class="required">*</span></label>
                                            <input type="text" id="venue-address" name="venueAddress" required 
                                                   placeholder="Street address">
                                        </div>
                                    </div>

                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="venue-city">City <span class="required">*</span></label>
                                            <input type="text" id="venue-city" name="venueCity" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="venue-state">State/Province <span class="required">*</span></label>
                                            <input type="text" id="venue-state" name="venueState" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="venue-zip">ZIP/Postal Code</label>
                                            <input type="text" id="venue-zip" name="venueZip">
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label for="venue-directions">Directions/Special Instructions</label>
                                        <textarea id="venue-directions" name="venueDirections" rows="3" 
                                                  placeholder="Additional directions, parking info, etc."></textarea>
                                    </div>
                                </div>

                                <!-- Judges -->
                                <div class="form-section">
                                    <h4>Judges <span class="required">*</span></h4>
                                    <div class="judges-container" id="judges-container">
                                        <div class="judge-entry">
                                            <div class="form-row">
                                                <div class="form-group">
                                                    <label>Judge Name</label>
                                                    <input type="text" name="judgeName" placeholder="Full name" required>
                                                </div>
                                                <div class="form-group">
                                                    <label>Judge Email</label>
                                                    <input type="email" name="judgeEmail" placeholder="Contact email">
                                                </div>
                                                <div class="form-group">
                                                    <label>Specialties</label>
                                                    <input type="text" name="judgeSpecialties" 
                                                           placeholder="e.g., Obedience, Rally, Scent">
                                                </div>
                                                <div class="form-group">
                                                    <button type="button" class="btn btn-danger btn-sm" 
                                                            onclick="TrialSetup.removeJudge(this)">Remove</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" class="btn btn-secondary" onclick="TrialSetup.addJudge()">
                                        Add Another Judge
                                    </button>
                                </div>

                                <!-- Classes and Rounds -->
                                <div class="form-section">
                                    <h4>Classes & Rounds <span class="required">*</span></h4>
                                    <div class="classes-info">
                                        <p>Select the classes and rounds that will be offered at this trial.</p>
                                    </div>
                                    
                                    <div class="class-categories">
                                        <div class="class-category">
                                            <h5>Level 1 Classes</h5>
                                            <div class="class-checkboxes">
                                                <label class="class-checkbox">
                                                    <input type="checkbox" name="classes" value="Level 1 - CTH">
                                                    <span class="checkmark"></span>
                                                    Call to Heel (CTH)
                                                </label>
                                                <label class="class-checkbox">
                                                    <input type="checkbox" name="classes" value="Level 1 - FFF">
                                                    <span class="checkmark"></span>
                                                    Find Front Forward (FFF)
                                                </label>
                                                <label class="class-checkbox">
                                                    <input type="checkbox" name="classes" value="Level 1 - WA">
                                                    <span class="checkmark"></span>
                                                    Walk About (WA)
                                                </label>
                                                <label class="class-checkbox">
                                                    <input type="checkbox" name="classes" value="Level 1 - CTH2">
                                                    <span class="checkmark"></span>
                                                    Call to Heel 2 (CTH2)
                                                </label>
                                                <label class="class-checkbox">
                                                    <input type="checkbox" name="classes" value="Level 1 - Split Heel">
                                                    <span class="checkmark"></span>
                                                    Split Heel
                                                </label>
                                            </div>
                                        </div>

                                        <div class="class-category">
                                            <h5>Level 2 Classes</h5>
                                            <div class="class-checkboxes">
                                                <label class="class-checkbox">
                                                    <input type="checkbox" name="classes" value="Level 2 - Basic">
                                                    <span class="checkmark"></span>
                                                    Level 2 Basic
                                                </label>
                                                <label class="class-checkbox">
                                                    <input type="checkbox" name="classes" value="Level 2 - Advanced">
                                                    <span class="checkmark"></span>
                                                    Level 2 Advanced
                                                </label>
                                            </div>
                                        </div>

                                        <div class="class-category">
                                            <h5>Specialty Classes</h5>
                                            <div class="class-checkboxes">
                                                <label class="class-checkbox">
                                                    <input type="checkbox" name="classes" value="Rally">
                                                    <span class="checkmark"></span>
                                                    Rally
                                                </label>
                                                <label class="class-checkbox">
                                                    <input type="checkbox" name="classes" value="Scent">
                                                    <span class="checkmark"></span>
                                                    Scent Work
                                                </label>
                                                <label class="class-checkbox">
                                                    <input type="checkbox" name="classes" value="Games">
                                                    <span class="checkmark"></span>
                                                    Games
                                                </label>
                                                <label class="class-checkbox">
                                                    <input type="checkbox" name="classes" value="Video">
                                                    <span class="checkmark"></span>
                                                    Video Submissions
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Trial Schedule -->
                                <div class="form-section">
                                    <h4>Trial Schedule</h4>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="check-in-time">Check-in Time</label>
                                            <input type="time" id="check-in-time" name="checkInTime" value="08:00">
                                        </div>
                                        <div class="form-group">
                                            <label for="start-time">Trial Start Time</label>
                                            <input type="time" id="start-time" name="startTime" value="09:00">
                                        </div>
                                        <div class="form-group">
                                            <label for="lunch-break">Lunch Break</label>
                                            <select id="lunch-break" name="lunchBreak">
                                                <option value="none">No lunch break</option>
                                                <option value="30min">30 minutes</option>
                                                <option value="45min">45 minutes</option>
                                                <option value="60min">1 hour</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <!-- Fees and Costs -->
                                <div class="form-section">
                                    <h4>Entry Fees</h4>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="regular-fee">Regular Entry Fee</label>
                                            <div class="input-group">
                                                <span class="input-prefix">$</span>
                                                <input type="number" id="regular-fee" name="regularFee" 
                                                       min="0" step="0.01" placeholder="0.00">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label for="feo-fee">FEO Entry Fee</label>
                                            <div class="input-group">
                                                <span class="input-prefix">$</span>
                                                <input type="number" id="feo-fee" name="feoFee" 
                                                       min="0" step="0.01" placeholder="0.00">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label for="day-of-fee">Day-of-Show Surcharge</label>
                                            <div class="input-group">
                                                <span class="input-prefix">$</span>
                                                <input type="number" id="day-of-fee" name="dayOfFee" 
                                                       min="0" step="0.01" placeholder="0.00">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" name="dayOfEntries" id="day-of-entries">
                                            Accept day-of-show entries
                                        </label>
                                    </div>
                                </div>

                                <!-- Awards and Prizes -->
                                <div class="form-section">
                                    <h4>Awards & Prizes</h4>
                                    <div class="form-group">
                                        <label for="awards-info">Awards Information</label>
                                        <textarea id="awards-info" name="awardsInfo" rows="4" 
                                                  placeholder="Describe ribbons, trophies, special awards, etc."></textarea>
                                    </div>
                                </div>

                                <!-- Special Instructions -->
                                <div class="form-section">
                                    <h4>Additional Information</h4>
                                    <div class="form-group">
                                        <label for="special-instructions">Special Instructions</label>
                                        <textarea id="special-instructions" name="specialInstructions" rows="4" 
                                                  placeholder="Any special rules, requirements, or information for competitors"></textarea>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="contact-info">Emergency Contact Information</label>
                                        <textarea id="contact-info" name="contactInfo" rows="2" 
                                                  placeholder="Emergency contact name and phone number"></textarea>
                                    </div>
                                </div>

                                <!-- Liability Waiver -->
                                <div class="form-section">
                                    <h4>Liability Waiver</h4>
                                    <div class="form-group">
                                        <label for="waiver-text">Waiver Text</label>
                                        <textarea id="waiver-text" name="waiverText" rows="8" 
                                                  placeholder="Enter custom waiver text or leave blank to use default C-WAGS waiver"></textarea>
                                    </div>
                                    <button type="button" class="btn btn-secondary" onclick="TrialSetup.loadDefaultWaiver()">
                                        Load Default C-WAGS Waiver
                                    </button>
                                </div>

                                <div class="form-actions-bottom">
                                    <button type="button" class="btn btn-secondary" onclick="TrialSetup.resetForm()">
                                        Reset Form
                                    </button>
                                    <button type="button" class="btn btn-warning" onclick="TrialSetup.saveDraft()">
                                        Save Draft
                                    </button>
                                    <button type="submit" class="btn btn-success">
                                        Submit for Approval
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Trial List Tab -->
                    <div id="trial-list" class="setup-tab-content">
                        <div class="trial-list-container">
                            <div class="list-header">
                                <h3>Your Trials</h3>
                                <div class="list-controls">
                                    <input type="text" id="trial-search" placeholder="Search trials..." 
                                           onkeyup="TrialSetup.searchTrials()">
                                    <select id="status-filter" onchange="TrialSetup.filterTrials()">
                                        <option value="">All Statuses</option>
                                        <option value="draft">Draft</option>
                                        <option value="pending">Pending Approval</option>
                                        <option value="approved">Approved</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div id="trials-grid" class="trials-grid">
                                <div class="loading">Loading trials...</div>
                            </div>
                        </div>
                    </div>

                    <!-- Templates Tab -->
                    <div id="trial-templates" class="setup-tab-content">
                        <div class="templates-container">
                            <div class="templates-header">
                                <h3>Trial Templates</h3>
                                <button class="btn btn-primary" onclick="TrialSetup.saveAsTemplate()">
                                    Save Current Trial as Template
                                </button>
                            </div>
                            <div id="templates-grid" class="templates-grid">
                                <div class="loading">Loading templates...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.setup-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form submission
        document.getElementById('trial-setup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitTrial();
        });

        // Auto-save functionality
        const form = document.getElementById('trial-setup-form');
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.autoSave();
            });
        });

        // Real-time validation
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    static switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.setup-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.setup-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load tab-specific data
        switch(tabName) {
            case 'trial-list':
                this.loadTrialsList();
                break;
            case 'trial-templates':
                this.loadTemplates();
                break;
        }
    }

    static onTrialTypeChange() {
        const trialType = document.getElementById('trial-type').value;
        
        // Adjust form based on trial type
        if (trialType === 'video') {
            // For video trials, auto-select video class
            document.querySelector('[value="Video"]').checked = true;
        } else if (trialType === 'league') {
            // Show league-specific options
            this.showLeagueOptions();
        }
    }

    static addJudge() {
        const container = document.getElementById('judges-container');
        const judgeEntry = document.createElement('div');
        judgeEntry.className = 'judge-entry';
        judgeEntry.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Judge Name</label>
                    <input type="text" name="judgeName" placeholder="Full name" required>
                </div>
                <div class="form-group">
                    <label>Judge Email</label>
                    <input type="email" name="judgeEmail" placeholder="Contact email">
                </div>
                <div class="form-group">
                    <label>Specialties</label>
                    <input type="text" name="judgeSpecialties" placeholder="e.g., Obedience, Rally, Scent">
                </div>
                <div class="form-group">
                    <button type="button" class="btn btn-danger btn-sm" onclick="TrialSetup.removeJudge(this)">Remove</button>
                </div>
            </div>
        `;
        container.appendChild(judgeEntry);
    }

    static removeJudge(button) {
        const judgeEntry = button.closest('.judge-entry');
        const container = document.getElementById('judges-container');
        
        if (container.children.length > 1) {
            judgeEntry.remove();
        } else {
            App.showAlert('At least one judge is required', 'warning');
        }
    }

    static loadDefaultWaiver() {
        const defaultWaiver = `LIABILITY WAIVER AND RELEASE

I acknowledge that participation in C-WAGS events involves inherent risks, including but not limited to risks of injury to persons and animals, property damage, and other losses. I understand that these risks cannot be eliminated despite reasonable care by the organizers.

I voluntarily assume all risks associated with participation in this event. I agree to hold harmless and indemnify C-WAGS, the event host, judges, volunteers, and venue from any and all claims, damages, or losses arising from my participation.

I certify that my dog is healthy, current on vaccinations, and has no history of aggressive behavior. I understand that I am solely responsible for my dog's behavior and any damage or injury caused by my dog.

By signing below, I acknowledge that I have read, understood, and agree to be bound by this waiver.`;

        document.getElementById('waiver-text').value = defaultWaiver;
    }

    static async submitTrial() {
        try {
            App.showLoading('Submitting trial...');
            
            const formData = this.collectFormData();
            const validation = this.validateTrialData(formData);
            
            if (!validation.isValid) {
                App.showAlert('Please correct the following errors: ' + validation.errors.join(', '), 'danger');
                return;
            }

            // Set status based on user permissions
            const user = Auth.getCurrentUser();
            if (user && (user.role === 'admin' || user.permissions.includes('auto_approve'))) {
                formData.status = 'approved';
            } else {
                formData.status = 'pending';
            }

            const trial = DataManager.saveTrial(formData);
            
            App.showAlert('Trial submitted successfully!', 'success');
            this.currentTrial = trial;
            this.isEditing = true;
            this.updateFormTitle();
            this.switchTab('trial-list');
            
        } catch (error) {
            App.handleError(error, 'Trial Submission');
        } finally {
            App.hideLoading();
        }
    }

    static saveDraft() {
        try {
            const formData = this.collectFormData();
            formData.status = 'draft';
            
            const trial = DataManager.saveTrial(formData);
            this.currentTrial = trial;
            this.isEditing = true;
            
            App.showAlert('Draft saved successfully', 'success');
            this.updateFormTitle();
            
        } catch (error) {
            App.handleError(error, 'Save Draft');
        }
    }

    static submitForApproval() {
        const formData = this.collectFormData();
        formData.status = 'pending';
        
        if (confirm('Are you sure you want to submit this trial for approval? You will not be able to edit it until it is reviewed.')) {
            this.submitTrial();
        }
    }

    static collectFormData() {
        const form = document.getElementById('trial-setup-form');
        const formData = new FormData(form);
        
        const trial = {
            id: this.currentTrial?.id,
            name: formData.get('name'),
            type: formData.get('type'),
            host: formData.get('host'),
            hostEmail: formData.get('hostEmail'),
            hostPhone: formData.get('hostPhone'),
            date: formData.get('date'),
            entryDeadline: formData.get('entryDeadline'),
            entryLimit: formData.get('entryLimit') ? parseInt(formData.get('entryLimit')) : null,
            
            // Venue information
            venue: {
                name: formData.get('venueName'),
                address: formData.get('venueAddress'),
                city: formData.get('venueCity'),
                state: formData.get('venueState'),
                zip: formData.get('venueZip'),
                directions: formData.get('venueDirections')
            },
            
            // Judges
            judges: this.collectJudges(),
            
            // Classes
            classes: formData.getAll('classes'),
            
            // Schedule
            schedule: {
                checkInTime: formData.get('checkInTime'),
                startTime: formData.get('startTime'),
                lunchBreak: formData.get('lunchBreak')
            },
            
            // Fees
            fees: {
                regular: parseFloat(formData.get('regularFee')) || 0,
                feo: parseFloat(formData.get('feoFee')) || 0,
                dayOf: parseFloat(formData.get('dayOfFee')) || 0
            },
            
            // Settings
            acceptDayOfEntries: formData.get('dayOfEntries') === 'on',
            
            // Additional info
            awardsInfo: formData.get('awardsInfo'),
            specialInstructions: formData.get('specialInstructions'),
            contactInfo: formData.get('contactInfo'),
            waiverText: formData.get('waiverText'),
            
            // Metadata
            hostId: Auth.getCurrentUser()?.id,
            createdAt: this.currentTrial?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return trial;
    }

    static collectJudges() {
        const judges = [];
        const judgeEntries = document.querySelectorAll('.judge-entry');
        
        judgeEntries.forEach(entry => {
            const name = entry.querySelector('[name="judgeName"]').value.trim();
            const email = entry.querySelector('[name="judgeEmail"]').value.trim();
            const specialties = entry.querySelector('[name="judgeSpecialties"]').value.trim();
            
            if (name) {
                judges.push({
                    name: name,
                    email: email,
                    specialties: specialties
                });
            }
        });
        
        return judges;
    }

    static validateTrialData(trial) {
        const errors = [];
        
        if (!trial.name || trial.name.length < 3) {
            errors.push('Trial name must be at least 3 characters');
        }
        
        if (!trial.type) {
            errors.push('Trial type is required');
        }
        
        if (!trial.host) {
            errors.push('Host name is required');
        }
        
        if (!trial.hostEmail) {
            errors.push('Host email is required');
        }
        
        if (!trial.date) {
            errors.push('Trial date is required');
        } else {
            const trialDate = new Date(trial.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (trialDate < today) {
                errors.push('Trial date must be in the future');
            }
        }
        
        if (!trial.entryDeadline) {
            errors.push('Entry deadline is required');
        } else {
            const deadline = new Date(trial.entryDeadline);
            const trialDate = new Date(trial.date);
            
            if (deadline >= trialDate) {
                errors.push('Entry deadline must be before trial date');
            }
        }
        
        if (!trial.venue.name) {
            errors.push('Venue name is required');
        }
        
        if (!trial.venue.address) {
            errors.push('Venue address is required');
        }
        
        if (!trial.venue.city) {
            errors.push('Venue city is required');
        }
        
        if (!trial.venue.state) {
            errors.push('Venue state/province is required');
        }
        
        if (!trial.judges || trial.judges.length === 0) {
            errors.push('At least one judge is required');
        }
        
        if (!trial.classes || trial.classes.length === 0) {
            errors.push('At least one class must be selected');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    static validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';
        
        // Remove existing validation styling
        field.classList.remove('field-error', 'field-success');
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'This field is required';
        }
        
        // Email validation
        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        }
        
        // Date validation
        if (field.type === 'date' && value) {
            const date = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (date < today) {
                isValid = false;
                message = 'Date must be in the future';
            }
        }
        
        // Entry deadline validation
        if (field.name === 'entryDeadline' && value) {
            const deadline = new Date(value);
            const trialDate = new Date(document.getElementById('trial-date').value);
            
            if (deadline >= trialDate) {
                isValid = false;
                message = 'Entry deadline must be before trial date';
            }
        }
        
        // Apply validation styling
        field.classList.add(isValid ? 'field-success' : 'field-error');
        
        // Show/hide validation message
        this.showFieldValidation(field, message, isValid);
        
        return isValid;
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static showFieldValidation(field, message, isValid) {
        // Remove existing validation message
        const existingMessage = field.parentNode.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Add new validation message if needed
        if (!isValid && message) {
            const messageEl = document.createElement('div');
            messageEl.className = 'validation-message error';
            messageEl.textContent = message;
            field.parentNode.appendChild(messageEl);
        }
    }

    static autoSave() {
        if (this.currentTrial && this.currentTrial.status === 'draft') {
            // Debounced auto-save for drafts only
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = setTimeout(() => {
                try {
                    const formData = this.collectFormData();
                    formData.status = 'draft';
                    DataManager.saveTrial(formData);
                    
                    // Show subtle save indicator
                    App.setStatus('Draft auto-saved', 'success');
                } catch (error) {
                    console.warn('Auto-save failed:', error);
                }
            }, 2000);
        }
    }

    static resetForm() {
        if (confirm('Are you sure you want to reset the form? All unsaved changes will be lost.')) {
            document.getElementById('trial-setup-form').reset();
            this.currentTrial = null;
            this.isEditing = false;
            this.updateFormTitle();
            
            // Reset judges to just one entry
            const container = document.getElementById('judges-container');
            container.innerHTML = `
                <div class="judge-entry">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Judge Name</label>
                            <input type="text" name="judgeName" placeholder="Full name" required>
                        </div>
                        <div class="form-group">
                            <label>Judge Email</label>
                            <input type="email" name="judgeEmail" placeholder="Contact email">
                        </div>
                        <div class="form-group">
                            <label>Specialties</label>
                            <input type="text" name="judgeSpecialties" placeholder="e.g., Obedience, Rally, Scent">
                        </div>
                        <div class="form-group">
                            <button type="button" class="btn btn-danger btn-sm" onclick="TrialSetup.removeJudge(this)">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    static updateFormTitle() {
        const titleEl = document.getElementById('form-title');
        const submitBtn = document.getElementById('submit-btn');
        
        if (this.isEditing && this.currentTrial) {
            titleEl.textContent = `Edit Trial: ${this.currentTrial.name}`;
            submitBtn.textContent = 'Update Trial';
        } else {
            titleEl.textContent = 'Create New Trial';
            submitBtn.textContent = 'Submit for Approval';
        }
    }

    static checkForSelectedTrial() {
        const selectedTrialId = sessionStorage.getItem('selectedTrialId');
        if (selectedTrialId) {
            this.loadTrialForEditing(selectedTrialId);
            sessionStorage.removeItem('selectedTrialId');
        }
    }

    static loadTrialForEditing(trialId) {
        const trial = DataManager.getTrial(trialId);
        if (!trial) {
            App.showAlert('Trial not found', 'warning');
            return;
        }
        
        this.currentTrial = trial;
        this.isEditing = true;
        this.populateForm(trial);
        this.updateFormTitle();
    }

    static populateForm(trial) {
        // Basic information
        document.getElementById('trial-name').value = trial.name || '';
        document.getElementById('trial-type').value = trial.type || '';
        document.getElementById('host-name').value = trial.host || '';
        document.getElementById('host-email').value = trial.hostEmail || '';
        document.getElementById('host-phone').value = trial.hostPhone || '';
        document.getElementById('trial-date').value = trial.date || '';
        document.getElementById('entry-deadline').value = trial.entryDeadline || '';
        document.getElementById('entry-limit').value = trial.entryLimit || '';
        
        // Venue information
        if (trial.venue) {
            document.getElementById('venue-name').value = trial.venue.name || '';
            document.getElementById('venue-address').value = trial.venue.address || '';
            document.getElementById('venue-city').value = trial.venue.city || '';
            document.getElementById('venue-state').value = trial.venue.state || '';
            document.getElementById('venue-zip').value = trial.venue.zip || '';
            document.getElementById('venue-directions').value = trial.venue.directions || '';
        }
        
        // Judges
        this.populateJudges(trial.judges || []);
        
        // Classes
        if (trial.classes) {
            trial.classes.forEach(className => {
                const checkbox = document.querySelector(`[name="classes"][value="${className}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
        
        // Schedule
        if (trial.schedule) {
            document.getElementById('check-in-time').value = trial.schedule.checkInTime || '';
            document.getElementById('start-time').value = trial.schedule.startTime || '';
            document.getElementById('lunch-break').value = trial.schedule.lunchBreak || '';
        }
        
        // Fees
        if (trial.fees) {
            document.getElementById('regular-fee').value = trial.fees.regular || '';
            document.getElementById('feo-fee').value = trial.fees.feo || '';
            document.getElementById('day-of-fee').value = trial.fees.dayOf || '';
        }
        
        // Settings
        document.getElementById('day-of-entries').checked = trial.acceptDayOfEntries || false;
        
        // Additional information
        document.getElementById('awards-info').value = trial.awardsInfo || '';
        document.getElementById('special-instructions').value = trial.specialInstructions || '';
        document.getElementById('contact-info').value = trial.contactInfo || '';
        document.getElementById('waiver-text').value = trial.waiverText || '';
    }

    static populateJudges(judges) {
        const container = document.getElementById('judges-container');
        container.innerHTML = '';
        
        if (judges.length === 0) {
            this.addJudge();
            return;
        }
        
        judges.forEach(judge => {
            const judgeEntry = document.createElement('div');
            judgeEntry.className = 'judge-entry';
            judgeEntry.innerHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label>Judge Name</label>
                        <input type="text" name="judgeName" placeholder="Full name" required value="${judge.name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Judge Email</label>
                        <input type="email" name="judgeEmail" placeholder="Contact email" value="${judge.email || ''}">
                    </div>
                    <div class="form-group">
                        <label>Specialties</label>
                        <input type="text" name="judgeSpecialties" placeholder="e.g., Obedience, Rally, Scent" value="${judge.specialties || ''}">
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-danger btn-sm" onclick="TrialSetup.removeJudge(this)">Remove</button>
                    </div>
                </div>
            `;
            container.appendChild(judgeEntry);
        });
    }

    static async loadTrialData() {
        // Load initial data for the module
        await this.loadTrialsList();
    }

    static async loadTrialsList() {
        try {
            const user = Auth.getCurrentUser();
            let trials;
            
            if (user.role === 'admin' || user.permissions.includes('view_all_trials')) {
                trials = DataManager.getTrials();
            } else {
                trials = DataManager.getTrialsByHost(user.id);
            }
            
            this.displayTrialsList(trials);
            
        } catch (error) {
            App.handleError(error, 'Load Trials');
        }
    }

    static displayTrialsList(trials) {
        const container = document.getElementById('trials-grid');
        
        if (trials.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No trials found</h4>
                    <p>Create your first trial to get started.</p>
                    <button class="btn btn-primary" onclick="TrialSetup.switchTab('trial-form')">
                        Create New Trial
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = trials.map(trial => this.createTrialCard(trial)).join('');
    }

    static createTrialCard(trial) {
        const entriesCount = DataManager.getTrialEntries(trial.id).length;
        const statusClass = trial.status || 'draft';
        
        return `
            <div class="trial-card ${statusClass}" data-trial-id="${trial.id}">
                <div class="trial-card-header">
                    <h4>${trial.name}</h4>
                    <span class="status ${statusClass}">${trial.status}</span>
                </div>
                <div class="trial-card-content">
                    <div class="trial-meta">
                        <div class="meta-item">
                            <strong>Date:</strong> ${App.formatDate(trial.date)}
                        </div>
                        <div class="meta-item">
                            <strong>Host:</strong> ${trial.host}
                        </div>
                        <div class="meta-item">
                            <strong>Venue:</strong> ${trial.venue?.name || 'TBD'}
                        </div>
                        <div class="meta-item">
                            <strong>Classes:</strong> ${trial.classes?.length || 0}
                        </div>
                        <div class="meta-item">
                            <strong>Entries:</strong> ${entriesCount}
                        </div>
                    </div>
                </div>
                <div class="trial-card-actions">
                    <button class="btn btn-primary btn-sm" onclick="TrialSetup.editTrial('${trial.id}')">
                        Edit
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="TrialSetup.duplicateTrial('${trial.id}')">
                        Duplicate
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="TrialSetup.viewTrialDetails('${trial.id}')">
                        Details
                    </button>
                    ${trial.status === 'draft' ? `
                        <button class="btn btn-danger btn-sm" onclick="TrialSetup.deleteTrial('${trial.id}')">
                            Delete
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    static editTrial(trialId) {
        this.loadTrialForEditing(trialId);
        this.switchTab('trial-form');
    }

    static duplicateTrial(trialId) {
        const trial = DataManager.getTrial(trialId);
        if (!trial) return;
        
        // Create a copy with new ID and modified name
        const duplicate = { ...trial };
        delete duplicate.id;
        duplicate.name = `Copy of ${trial.name}`;
        duplicate.status = 'draft';
        duplicate.createdAt = new Date().toISOString();
        duplicate.updatedAt = new Date().toISOString();
        
        this.currentTrial = duplicate;
        this.isEditing = false;
        this.populateForm(duplicate);
        this.switchTab('trial-form');
        
        App.showAlert('Trial duplicated. Make any necessary changes and save.', 'info');
    }

    static deleteTrial(trialId) {
        if (confirm('Are you sure you want to delete this trial? This action cannot be undone.')) {
            try {
                DataManager.deleteTrial(trialId);
                App.showAlert('Trial deleted successfully', 'success');
                this.loadTrialsList();
            } catch (error) {
                App.handleError(error, 'Delete Trial');
            }
        }
    }

    static viewTrialDetails(trialId) {
        const trial = DataManager.getTrial(trialId);
        if (!trial) return;
        
        // Create a detailed view modal or navigate to a details page
        this.showTrialDetailsModal(trial);
    }

    static showTrialDetailsModal(trial) {
        const entries = DataManager.getTrialEntries(trial.id);
        
        const modalContent = `
            <div class="trial-details-modal">
                <h3>${trial.name}</h3>
                <div class="details-grid">
                    <div class="detail-section">
                        <h4>Basic Information</h4>
                        <p><strong>Type:</strong> ${trial.type}</p>
                        <p><strong>Date:</strong> ${App.formatDate(trial.date)}</p>
                        <p><strong>Host:</strong> ${trial.host}</p>
                        <p><strong>Status:</strong> <span class="status ${trial.status}">${trial.status}</span></p>
                    </div>
                    <div class="detail-section">
                        <h4>Venue</h4>
                        <p><strong>Name:</strong> ${trial.venue?.name || 'TBD'}</p>
                        <p><strong>Address:</strong> ${trial.venue?.address || 'TBD'}</p>
                        <p><strong>City:</strong> ${trial.venue?.city || 'TBD'}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Classes</h4>
                        <ul>
                            ${trial.classes?.map(cls => `<li>${cls}</li>`).join('') || '<li>No classes defined</li>'}
                        </ul>
                    </div>
                    <div class="detail-section">
                        <h4>Statistics</h4>
                        <p><strong>Total Entries:</strong> ${entries.length}</p>
                        <p><strong>Regular Entries:</strong> ${entries.filter(e => e.entryType !== 'feo').length}</p>
                        <p><strong>FEO Entries:</strong> ${entries.filter(e => e.entryType === 'feo').length}</p>
                    </div>
                </div>
            </div>
        `;
        
        // Show modal (this would typically use a modal component)
        App.showAlert('Trial details would be shown in a modal', 'info');
    }

    static searchTrials() {
        const searchTerm = document.getElementById('trial-search').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;
        
        let trials = DataManager.getTrials();
        
        // Apply search filter
        if (searchTerm) {
            trials = trials.filter(trial => 
                trial.name.toLowerCase().includes(searchTerm) ||
                trial.host.toLowerCase().includes(searchTerm) ||
                trial.venue?.name?.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply status filter
        if (statusFilter) {
            trials = trials.filter(trial => trial.status === statusFilter);
        }
        
        this.displayTrialsList(trials);
    }

    static filterTrials() {
        this.searchTrials(); // Reuse search logic with current filters
    }

    static async loadTemplates() {
        const templates = DataManager.getData('cwags_trial_templates', []);
        const container = document.getElementById('templates-grid');
        
        if (templates.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No templates found</h4>
                    <p>Save your first trial as a template to quickly create similar trials in the future.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = templates.map(template => `
            <div class="template-card">
                <h4>${template.name}</h4>
                <p>${template.description || 'No description'}</p>
                <div class="template-meta">
                    <small>Created: ${App.formatDate(template.createdAt)}</small>
                </div>
                <div class="template-actions">
                    <button class="btn btn-primary btn-sm" onclick="TrialSetup.useTemplate('${template.id}')">
                        Use Template
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="TrialSetup.deleteTemplate('${template.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    static saveAsTemplate() {
        if (!this.currentTrial) {
            App.showAlert('Please create or edit a trial first', 'warning');
            return;
        }
        
        const templateName = prompt('Enter a name for this template:');
        if (!templateName) return;
        
        const template = {
            id: DataManager.generateId('template'),
            name: templateName,
            description: prompt('Enter a description (optional):') || '',
            data: { ...this.currentTrial },
            createdAt: new Date().toISOString()
        };
        
        // Remove trial-specific data
        delete template.data.id;
        delete template.data.createdAt;
        delete template.data.updatedAt;
        delete template.data.status;
        
        const templates = DataManager.getData('cwags_trial_templates', []);
        templates.push(template);
        DataManager.saveData('cwags_trial_templates', templates);
        
        App.showAlert('Template saved successfully', 'success');
        this.loadTemplates();
    }

    static useTemplate(templateId) {
        const templates = DataManager.getData('cwags_trial_templates', []);
        const template = templates.find(t => t.id === templateId);
        
        if (!template) {
            App.showAlert('Template not found', 'warning');
            return;
        }
        
        this.currentTrial = null;
        this.isEditing = false;
        this.populateForm(template.data);
        this.switchTab('trial-form');
        
        App.showAlert('Template loaded. Modify as needed and save.', 'info');
    }

    static deleteTemplate(templateId) {
        if (confirm('Are you sure you want to delete this template?')) {
            const templates = DataManager.getData('cwags_trial_templates', []);
            const filteredTemplates = templates.filter(t => t.id !== templateId);
            DataManager.saveData('cwags_trial_templates', filteredTemplates);
            
            App.showAlert('Template deleted', 'success');
            this.loadTemplates();
        }
    }

    // Module interface methods
    static refresh() {
        this.loadTrialData();
    }

    static save() {
        if (this.currentTrial && this.currentTrial.status === 'draft') {
            return this.saveDraft();
        }
        return Promise.resolve();
    }

    static createNew() {
        this.resetForm();
        this.switchTab('trial-form');
    }
}