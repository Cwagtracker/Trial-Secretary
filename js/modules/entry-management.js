// js/modules/entry-management.js
class EntryManagement {
    static init() {
        this.currentEntry = null;
        this.isEditing = false;
        this.selectedTrial = null;
        this.loadModule();
        this.setupEventListeners();
        this.loadInitialData();
        this.checkForSelectedEntry();
    }

    static loadModule() {
        const container = document.getElementById('module-container');
        container.innerHTML = `
            <div class="entry-management-module">
                <div class="module-header">
                    <h2>📝 Entry Management</h2>
                    <p>Manage competitor entries for C-WAGS trials</p>
                </div>

                <div class="entry-management-content">
                    <!-- Management Tabs -->
                    <div class="entry-tabs">
                        <button class="entry-tab active" data-tab="entry-form">
                            Create/Edit Entry
                        </button>
                        <button class="entry-tab" data-tab="entry-list">
                            Manage Entries
                        </button>
                        <button class="entry-tab" data-tab="bulk-operations">
                            Bulk Operations
                        </button>
                        <button class="entry-tab" data-tab="verification">
                            Entry Verification
                        </button>
                    </div>

                    <!-- Entry Form Tab -->
                    <div id="entry-form" class="entry-tab-content active">
                        <div class="entry-form-container">
                            <div class="form-header">
                                <h3 id="entry-form-title">Create New Entry</h3>
                                <div class="form-actions">
                                    <button class="btn btn-secondary" onclick="EntryManagement.resetForm()">
                                        Reset Form
                                    </button>
                                    <button class="btn btn-warning" onclick="EntryManagement.saveDraft()">
                                        Save Draft
                                    </button>
                                    <button class="btn btn-success" onclick="EntryManagement.submitEntry()" id="entry-submit-btn">
                                        Submit Entry
                                    </button>
                                </div>
                            </div>

                            <!-- Trial Selection -->
                            <div class="trial-selection-section">
                                <div class="form-group">
                                    <label for="entry-trial-select">Select Trial <span class="required">*</span></label>
                                    <select id="entry-trial-select" class="form-control" required onchange="EntryManagement.onTrialChange()">
                                        <option value="">Choose a trial...</option>
                                    </select>
                                </div>
                                <div id="trial-info-display" class="trial-info-display" style="display: none;"></div>
                            </div>

                            <form id="entry-form-element" class="entry-form">
                                <!-- Handler Information -->
                                <div class="form-section">
                                    <h4>Handler Information</h4>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="handler-first-name">First Name <span class="required">*</span></label>
                                            <input type="text" id="handler-first-name" name="handlerFirstName" required 
                                                   onblur="EntryManagement.checkExistingHandler()">
                                        </div>
                                        <div class="form-group">
                                            <label for="handler-last-name">Last Name <span class="required">*</span></label>
                                            <input type="text" id="handler-last-name" name="handlerLastName" required 
                                                   onblur="EntryManagement.checkExistingHandler()">
                                        </div>
                                        <div class="form-group">
                                            <label for="handler-email">Email Address <span class="required">*</span></label>
                                            <input type="email" id="handler-email" name="handlerEmail" required>
                                        </div>
                                    </div>

                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="handler-phone">Phone Number</label>
                                            <input type="tel" id="handler-phone" name="handlerPhone">
                                        </div>
                                        <div class="form-group">
                                            <label for="handler-address">Address</label>
                                            <input type="text" id="handler-address" name="handlerAddress">
                                        </div>
                                        <div class="form-group">
                                            <label for="handler-city">City</label>
                                            <input type="text" id="handler-city" name="handlerCity">
                                        </div>
                                    </div>

                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="handler-state">State/Province</label>
                                            <input type="text" id="handler-state" name="handlerState">
                                        </div>
                                        <div class="form-group">
                                            <label for="handler-zip">ZIP/Postal Code</label>
                                            <input type="text" id="handler-zip" name="handlerZip">
                                        </div>
                                        <div class="form-group">
                                            <label for="emergency-contact">Emergency Contact</label>
                                            <input type="text" id="emergency-contact" name="emergencyContact" 
                                                   placeholder="Name and phone number">
                                        </div>
                                    </div>

                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>
                                                <input type="checkbox" id="junior-handler" name="juniorHandler">
                                                Junior Handler (under 18)
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <!-- Dog Information -->
                                <div class="form-section">
                                    <h4>Dog Information</h4>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="dog-name">Dog's Call Name <span class="required">*</span></label>
                                            <input type="text" id="dog-name" name="dogName" required 
                                                   onblur="EntryManagement.checkExistingDog()">
                                        </div>
                                        <div class="form-group">
                                            <label for="dog-registered-name">Registered Name</label>
                                            <input type="text" id="dog-registered-name" name="dogRegisteredName">
                                        </div>
                                        <div class="form-group">
                                            <label for="registration-number">Registration Number <span class="required">*</span></label>
                                            <input type="text" id="registration-number" name="registrationNumber" required 
                                                   onblur="EntryManagement.validateRegistrationNumber()">
                                        </div>
                                    </div>

                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="dog-breed">Breed <span class="required">*</span></label>
                                            <input type="text" id="dog-breed" name="dogBreed" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="dog-sex">Sex <span class="required">*</span></label>
                                            <select id="dog-sex" name="dogSex" required>
                                                <option value="">Select...</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Male - Neutered">Male - Neutered</option>
                                                <option value="Female - Spayed">Female - Spayed</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="dog-dob">Date of Birth</label>
                                            <input type="date" id="dog-dob" name="dogDob" onchange="EntryManagement.calculateAge()">
                                        </div>
                                    </div>

                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="dog-age">Age (at trial date)</label>
                                            <input type="text" id="dog-age" name="dogAge" readonly>
                                        </div>
                                        <div class="form-group">
                                            <label for="jump-height">Jump Height <span class="required">*</span></label>
                                            <select id="jump-height" name="jumpHeight" required onchange="EntryManagement.onJumpHeightChange()">
                                                <option value="">Select height...</option>
                                                <option value="8">8 inches</option>
                                                <option value="12">12 inches</option>
                                                <option value="16">16 inches</option>
                                                <option value="20">20 inches</option>
                                                <option value="24">24 inches</option>
                                                <option value="choice">Handler's choice</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="dog-height">Dog's Height at Withers</label>
                                            <input type="text" id="dog-height" name="dogHeight" placeholder="e.g., 14 inches">
                                        </div>
                                    </div>

                                    <div class="height-verification" id="height-verification" style="display: none;">
                                        <div class="alert alert-info">
                                            <strong>Height Verification:</strong> Based on your dog's height, the recommended jump height is different from your selection. Please verify your choice or select height modifications if needed.
                                        </div>
                                    </div>
                                </div>

                                <!-- Class Selection -->
                                <div class="form-section">
                                    <h4>Class Selection <span class="required">*</span></h4>
                                    <div class="classes-info">
                                        <p>Select the classes you wish to enter. Class availability depends on the selected trial.</p>
                                    </div>
                                    
                                    <div id="available-classes" class="available-classes">
                                        <div class="no-trial-selected">Please select a trial first to see available classes.</div>
                                    </div>
                                </div>

                                <!-- Entry Type and Modifications -->
                                <div class="form-section">
                                    <h4>Entry Type & Modifications</h4>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="entry-type">Entry Type <span class="required">*</span></label>
                                            <select id="entry-type" name="entryType" required onchange="EntryManagement.onEntryTypeChange()">
                                                <option value="regular">Regular Entry</option>
                                                <option value="feo">For Exhibition Only (FEO)</option>
                                            </select>
                                            <small class="help-text">FEO entries participate but do not qualify for placements</small>
                                        </div>
                                        <div class="form-group">
                                            <label>
                                                <input type="checkbox" id="needs-modifications" name="needsModifications" 
                                                       onchange="EntryManagement.toggleModifications()">
                                                Requires Exercise or Height Modifications
                                            </label>
                                        </div>
                                    </div>

                                    <div id="modifications-section" class="modifications-section" style="display: none;">
                                        <h5>Exercise Modifications</h5>
                                        <div class="modification-options">
                                            <label class="modification-checkbox">
                                                <input type="checkbox" name="modifications" value="physical-limitation">
                                                <span class="checkmark"></span>
                                                Physical Limitation (detailed explanation required)
                                            </label>
                                            <label class="modification-checkbox">
                                                <input type="checkbox" name="modifications" value="height-modification">
                                                <span class="checkmark"></span>
                                                Height Modification (vet certificate required)
                                            </label>
                                            <label class="modification-checkbox">
                                                <input type="checkbox" name="modifications" value="exercise-substitution">
                                                <span class="checkmark"></span>
                                                Exercise Substitution
                                            </label>
                                        </div>
                                        <div class="form-group">
                                            <label for="modification-details">Modification Details <span class="required">*</span></label>
                                            <textarea id="modification-details" name="modificationDetails" rows="4" 
                                                      placeholder="Please provide detailed explanation of modifications needed"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <!-- Special Needs -->
                                <div class="form-section">
                                    <h4>Special Needs & Accommodations</h4>
                                    <div class="form-group">
                                        <label for="special-needs">Special Accommodations Needed</label>
                                        <textarea id="special-needs" name="specialNeeds" rows="3" 
                                                  placeholder="Ring setup preferences, scheduling requests, accessibility needs, etc."></textarea>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label>
                                                <input type="checkbox" id="conflicting-dogs" name="conflictingDogs">
                                                Has dogs that cannot run back-to-back
                                            </label>
                                        </div>
                                        <div class="form-group">
                                            <label>
                                                <input type="checkbox" id="early-departure" name="earlyDeparture">
                                                May need to leave early
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <!-- Entry Fees -->
                                <div class="form-section">
                                    <h4>Entry Fees</h4>
                                    <div id="fee-breakdown" class="fee-breakdown">
                                        <div class="fee-calculation">
                                            <div class="fee-item">
                                                <span class="fee-label">Regular Entries:</span>
                                                <span class="fee-value" id="regular-entries-count">0</span>
                                                <span class="fee-cost" id="regular-entries-cost">$0.00</span>
                                            </div>
                                            <div class="fee-item">
                                                <span class="fee-label">FEO Entries:</span>
                                                <span class="fee-value" id="feo-entries-count">0</span>
                                                <span class="fee-cost" id="feo-entries-cost">$0.00</span>
                                            </div>
                                            <div class="fee-item total">
                                                <span class="fee-label">Total Entry Fees:</span>
                                                <span class="fee-cost" id="total-entry-cost">$0.00</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Payment Information -->
                                <div class="form-section">
                                    <h4>Payment Information</h4>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="payment-method">Payment Method <span class="required">*</span></label>
                                            <select id="payment-method" name="paymentMethod" required>
                                                <option value="">Select payment method...</option>
                                                <option value="check">Check</option>
                                                <option value="paypal">PayPal</option>
                                                <option value="venmo">Venmo</option>
                                                <option value="zelle">Zelle</option>
                                                <option value="cash">Cash (day of trial)</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="payment-reference">Payment Reference</label>
                                            <input type="text" id="payment-reference" name="paymentReference" 
                                                   placeholder="Check #, transaction ID, etc.">
                                        </div>
                                    </div>
                                </div>

                                <!-- Waiver and Acknowledgments -->
                                <div class="form-section">
                                    <h4>Waiver and Acknowledgments</h4>
                                    <div id="trial-waiver" class="trial-waiver">
                                        <div class="loading">Loading waiver text...</div>
                                    </div>
                                    <div class="acknowledgments">
                                        <label class="acknowledgment-checkbox">
                                            <input type="checkbox" id="waiver-agreement" name="waiverAgreement" required>
                                            <span class="checkmark"></span>
                                            I have read and agree to the liability waiver above
                                        </label>
                                        <label class="acknowledgment-checkbox">
                                            <input type="checkbox" id="vaccination-current" name="vaccinationCurrent" required>
                                            <span class="checkmark"></span>
                                            My dog's vaccinations are current and will remain so through the trial date
                                        </label>
                                        <label class="acknowledgment-checkbox">
                                            <input type="checkbox" id="rules-acknowledgment" name="rulesAcknowledgment" required>
                                            <span class="checkmark"></span>
                                            I have read and understand the C-WAGS rules and regulations
                                        </label>
                                        <label class="acknowledgment-checkbox">
                                            <input type="checkbox" id="info-accuracy" name="infoAccuracy" required>
                                            <span class="checkmark"></span>
                                            All information provided is accurate to the best of my knowledge
                                        </label>
                                    </div>
                                </div>

                                <div class="form-actions-bottom">
                                    <button type="button" class="btn btn-secondary" onclick="EntryManagement.resetForm()">
                                        Reset Form
                                    </button>
                                    <button type="button" class="btn btn-warning" onclick="EntryManagement.saveDraft()">
                                        Save Draft
                                    </button>
                                    <button type="submit" class="btn btn-success">
                                        Submit Entry
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Entry List Tab -->
                    <div id="entry-list" class="entry-tab-content">
                        <div class="entry-list-container">
                            <div class="list-header">
                                <h3>Manage Entries</h3>
                                <div class="list-controls">
                                    <select id="trial-filter" onchange="EntryManagement.filterEntries()">
                                        <option value="">All Trials</option>
                                    </select>
                                    <input type="text" id="entry-search" placeholder="Search entries..." 
                                           onkeyup="EntryManagement.searchEntries()">
                                    <select id="entry-status-filter" onchange="EntryManagement.filterEntries()">
                                        <option value="">All Statuses</option>
                                        <option value="draft">Draft</option>
                                        <option value="submitted">Submitted</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="paid">Paid</option>
                                        <option value="checked-in">Checked In</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="entry-summary" id="entry-summary">
                                <div class="summary-stats">
                                    <div class="stat-item">
                                        <span class="stat-label">Total Entries:</span>
                                        <span class="stat-value" id="total-entries-count">0</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Regular:</span>
                                        <span class="stat-value" id="regular-count">0</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">FEO:</span>
                                        <span class="stat-value" id="feo-count">0</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Total Fees:</span>
                                        <span class="stat-value" id="total-fees">$0.00</span>
                                    </div>
                                </div>
                            </div>

                            <div id="entries-table-container" class="entries-table-container">
                                <table id="entries-table" class="table entries-table">
                                    <thead>
                                        <tr>
                                            <th>Handler</th>
                                            <th>Dog</th>
                                            <th>Trial</th>
                                            <th>Classes</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th>Fees</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="8" class="loading">Loading entries...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Bulk Operations Tab -->
                    <div id="bulk-operations" class="entry-tab-content">
                        <div class="bulk-operations-container">
                            <h3>Bulk Operations</h3>
                            
                            <div class="bulk-sections">
                                <div class="bulk-section">
                                    <h4>📥 Import Entries</h4>
                                    <p>Import entries from CSV file or previous trial</p>
                                    <div class="bulk-actions">
                                        <input type="file" id="csv-import" accept=".csv" style="display: none;" 
                                               onchange="EntryManagement.handleCSVImport(this)">
                                        <button class="btn btn-primary" onclick="document.getElementById('csv-import').click()">
                                            Import from CSV
                                        </button>
                                        <button class="btn btn-secondary" onclick="EntryManagement.showImportFromTrial()">
                                            Copy from Previous Trial
                                        </button>
                                        <button class="btn btn-secondary" onclick="EntryManagement.downloadCSVTemplate()">
                                            Download CSV Template
                                        </button>
                                    </div>
                                </div>

                                <div class="bulk-section">
                                    <h4>📧 Communications</h4>
                                    <p>Send bulk emails to entry holders</p>
                                    <div class="bulk-actions">
                                        <button class="btn btn-primary" onclick="EntryManagement.sendConfirmationEmails()">
                                            Send Entry Confirmations
                                        </button>
                                        <button class="btn btn-secondary" onclick="EntryManagement.sendReminderEmails()">
                                            Send Payment Reminders
                                        </button>
                                        <button class="btn btn-secondary" onclick="EntryManagement.sendTrialReminders()">
                                            Send Trial Reminders
                                        </button>
                                    </div>
                                </div>

                                <div class="bulk-section">
                                    <h4>📊 Reports & Export</h4>
                                    <p>Generate reports and export entry data</p>
                                    <div class="bulk-actions">
                                        <button class="btn btn-primary" onclick="EntryManagement.exportEntries()">
                                            Export Entry List
                                        </button>
                                        <button class="btn btn-secondary" onclick="EntryManagement.generateEntryReport()">
                                            Generate Entry Report
                                        </button>
                                        <button class="btn btn-secondary" onclick="EntryManagement.generatePaymentReport()">
                                            Payment Status Report
                                        </button>
                                    </div>
                                </div>

                                <div class="bulk-section">
                                    <h4>⚠️ Administrative Actions</h4>
                                    <p>Bulk status updates and administrative functions</p>
                                    <div class="bulk-actions">
                                        <select id="bulk-status-change">
                                            <option value="">Select new status...</option>
                                            <option value="confirmed">Mark as Confirmed</option>
                                            <option value="paid">Mark as Paid</option>
                                            <option value="checked-in">Mark as Checked In</option>
                                            <option value="cancelled">Mark as Cancelled</option>
                                        </select>
                                        <button class="btn btn-warning" onclick="EntryManagement.bulkStatusUpdate()">
                                            Apply to Selected Entries
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Verification Tab -->
                    <div id="verification" class="entry-tab-content">
                        <div class="verification-container">
                            <h3>Entry Verification</h3>
                            
                            <div class="verification-sections">
                                <div class="verification-section">
                                    <h4>🔍 Data Validation</h4>
                                    <div class="validation-results" id="validation-results">
                                        <button class="btn btn-primary" onclick="EntryManagement.runDataValidation()">
                                            Run Validation Check
                                        </button>
                                    </div>
                                </div>

                                <div class="verification-section">
                                    <h4>📋 Registration Verification</h4>
                                    <div class="registration-check" id="registration-check">
                                        <button class="btn btn-primary" onclick="EntryManagement.verifyRegistrations()">
                                            Verify Registration Numbers
                                        </button>
                                    </div>
                                </div>

                                <div class="verification-section">
                                    <h4>💰 Payment Tracking</h4>
                                    <div class="payment-tracking" id="payment-tracking">
                                        <button class="btn btn-primary" onclick="EntryManagement.checkPaymentStatus()">
                                            Check Payment Status
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.entry-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form submission
        document.getElementById('entry-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitEntry();
        });

        // Auto-save for drafts
        const form = document.getElementById('entry-form-element');
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
        document.querySelectorAll('.entry-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.entry-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load tab-specific data
        switch(tabName) {
            case 'entry-list':
                this.loadEntriesList();
                break;
            case 'bulk-operations':
                this.loadBulkOperations();
                break;
            case 'verification':
                this.loadVerificationData();
                break;
        }
    }

    static async loadInitialData() {
        try {
            App.showLoading('Loading entry management data...');
            
            await Promise.all([
                this.loadTrialOptions(),
                this.loadEntriesList()
            ]);
            
        } catch (error) {
            App.handleError(error, 'Entry Management');
        } finally {
            App.hideLoading();
        }
    }

    static loadTrialOptions() {
        const trials = DataManager.getTrials().filter(trial => 
            trial.status === 'approved' || trial.status === 'active'
        );
        
        const trialSelect = document.getElementById('entry-trial-select');
        const trialFilter = document.getElementById('trial-filter');
        
        // Clear existing options
        trialSelect.innerHTML = '<option value="">Choose a trial...</option>';
        if (trialFilter) {
            trialFilter.innerHTML = '<option value="">All Trials</option>';
        }
        
        trials.forEach(trial => {
            const option = document.createElement('option');
            option.value = trial.id;
            option.textContent = `${trial.name} - ${App.formatDate(trial.date)}`;
            trialSelect.appendChild(option);
            
            if (trialFilter) {
                const filterOption = option.cloneNode(true);
                trialFilter.appendChild(filterOption);
            }
        });
    }

    static onTrialChange() {
        const trialId = document.getElementById('entry-trial-select').value;
        if (!trialId) {
            document.getElementById('trial-info-display').style.display = 'none';
            document.getElementById('available-classes').innerHTML = 
                '<div class="no-trial-selected">Please select a trial first to see available classes.</div>';
            this.calculateFees();
    }

    static displayTrialInfo() {
        if (!this.selectedTrial) return;

        const entries = DataManager.getTrialEntries(this.selectedTrial.id);
        const infoDiv = document.getElementById('trial-info-display');
        
        // Check if trial is full
        const isTrialFull = this.selectedTrial.entryLimit && entries.length >= this.selectedTrial.entryLimit;
        
        // Check if entries are still open
        const entryDeadline = new Date(this.selectedTrial.entryDeadline);
        const now = new Date();
        const entriesOpen = now < entryDeadline;
        
        infoDiv.innerHTML = `
            <div class="trial-info-card">
                <h4>${this.selectedTrial.name}</h4>
                <div class="trial-details">
                    <div class="detail-row">
                        <div class="detail-item">
                            <strong>Date:</strong> ${App.formatDate(this.selectedTrial.date)}
                        </div>
                        <div class="detail-item">
                            <strong>Location:</strong> ${this.selectedTrial.venue?.name || 'TBD'}
                        </div>
                        <div class="detail-item">
                            <strong>Host:</strong> ${this.selectedTrial.host}
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-item">
                            <strong>Entry Deadline:</strong> ${App.formatDate(this.selectedTrial.entryDeadline, 'datetime')}
                        </div>
                        <div class="detail-item">
                            <strong>Entries:</strong> ${entries.length}${this.selectedTrial.entryLimit ? ` / ${this.selectedTrial.entryLimit}` : ''}
                        </div>
                        <div class="detail-item ${entriesOpen ? 'status-open' : 'status-closed'}">
                            <strong>Status:</strong> ${entriesOpen ? 'Entries Open' : 'Entries Closed'}
                        </div>
                    </div>
                </div>
                
                ${!entriesOpen ? '<div class="alert alert-warning">Entry deadline has passed</div>' : ''}
                ${isTrialFull ? '<div class="alert alert-danger">Trial is full - no more entries accepted</div>' : ''}
            </div>
        `;
        
        infoDiv.style.display = 'block';
    }

    static loadAvailableClasses() {
        if (!this.selectedTrial) return;

        const container = document.getElementById('available-classes');
        
        if (!this.selectedTrial.classes || this.selectedTrial.classes.length === 0) {
            container.innerHTML = '<div class="no-classes">No classes defined for this trial.</div>';
            return;
        }

        const classCategories = this.categorizeClasses(this.selectedTrial.classes);
        
        container.innerHTML = Object.entries(classCategories).map(([category, classes]) => `
            <div class="class-category">
                <h5>${category}</h5>
                <div class="class-checkboxes">
                    ${classes.map(className => `
                        <label class="class-checkbox">
                            <input type="checkbox" name="selectedClasses" value="${className}" 
                                   onchange="EntryManagement.onClassSelectionChange()">
                            <span class="checkmark"></span>
                            ${className}
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    static categorizeClasses(classes) {
        const categories = {
            'Level 1': [],
            'Level 2': [],
            'Specialty': []
        };

        classes.forEach(className => {
            if (className.includes('Level 1')) {
                categories['Level 1'].push(className);
            } else if (className.includes('Level 2')) {
                categories['Level 2'].push(className);
            } else {
                categories['Specialty'].push(className);
            }
        });

        // Remove empty categories
        Object.keys(categories).forEach(key => {
            if (categories[key].length === 0) {
                delete categories[key];
            }
        });

        return categories;
    }

    static onClassSelectionChange() {
        this.calculateFees();
        this.validateClassSelection();
    }

    static validateClassSelection() {
        const selectedClasses = document.querySelectorAll('[name="selectedClasses"]:checked');
        const entryType = document.getElementById('entry-type').value;
        
        let warnings = [];
        
        // Check for conflicting classes
        const classNames = Array.from(selectedClasses).map(cb => cb.value);
        
        // Example validation: Can't enter both Level 1 and Level 2 of same type
        const level1Classes = classNames.filter(name => name.includes('Level 1'));
        const level2Classes = classNames.filter(name => name.includes('Level 2'));
        
        if (level1Classes.length > 0 && level2Classes.length > 0) {
            warnings.push('Warning: Entering both Level 1 and Level 2 classes may create scheduling conflicts.');
        }
        
        // Show warnings
        this.showClassWarnings(warnings);
    }

    static showClassWarnings(warnings) {
        const container = document.getElementById('available-classes');
        const existingWarning = container.querySelector('.class-warnings');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        if (warnings.length > 0) {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'class-warnings alert alert-warning';
            warningDiv.innerHTML = warnings.join('<br>');
            container.appendChild(warningDiv);
        }
    }

    static loadTrialWaiver() {
        if (!this.selectedTrial) return;

        const waiverDiv = document.getElementById('trial-waiver');
        const waiverText = this.selectedTrial.waiverText || this.getDefaultWaiver();
        
        waiverDiv.innerHTML = `
            <div class="waiver-text">
                <h5>Liability Waiver</h5>
                <div class="waiver-content">
                    ${waiverText.split('\n').map(line => `<p>${line}</p>`).join('')}
                </div>
            </div>
        `;
    }

    static getDefaultWaiver() {
        return `LIABILITY WAIVER AND RELEASE

I acknowledge that participation in C-WAGS events involves inherent risks, including but not limited to risks of injury to persons and animals, property damage, and other losses. I understand that these risks cannot be eliminated despite reasonable care by the organizers.

I voluntarily assume all risks associated with participation in this event. I agree to hold harmless and indemnify C-WAGS, the event host, judges, volunteers, and venue from any and all claims, damages, or losses arising from my participation.

I certify that my dog is healthy, current on vaccinations, and has no history of aggressive behavior. I understand that I am solely responsible for my dog's behavior and any damage or injury caused by my dog.

By signing below, I acknowledge that I have read, understood, and agree to be bound by this waiver.`;
    }

    static calculateFees() {
        if (!this.selectedTrial) {
            this.updateFeeDisplay(0, 0, 0);
            return;
        }

        const selectedClasses = document.querySelectorAll('[name="selectedClasses"]:checked');
        const entryType = document.getElementById('entry-type').value;
        
        const regularFee = this.selectedTrial.fees?.regular || 0;
        const feoFee = this.selectedTrial.fees?.feo || 0;
        
        let regularCount = 0;
        let feoCount = 0;
        
        if (entryType === 'feo') {
            feoCount = selectedClasses.length;
        } else {
            regularCount = selectedClasses.length;
        }
        
        const regularTotal = regularCount * regularFee;
        const feoTotal = feoCount * feoFee;
        const grandTotal = regularTotal + feoTotal;
        
        this.updateFeeDisplay(regularCount, feoCount, grandTotal);
    }

    static updateFeeDisplay(regularCount, feoCount, total) {
        document.getElementById('regular-entries-count').textContent = regularCount;
        document.getElementById('feo-entries-count').textContent = feoCount;
        document.getElementById('regular-entries-cost').textContent = App.formatCurrency(regularCount * (this.selectedTrial?.fees?.regular || 0));
        document.getElementById('feo-entries-cost').textContent = App.formatCurrency(feoCount * (this.selectedTrial?.fees?.feo || 0));
        document.getElementById('total-entry-cost').textContent = App.formatCurrency(total);
    }

    static onEntryTypeChange() {
        this.calculateFees();
    }

    static onJumpHeightChange() {
        const jumpHeight = document.getElementById('jump-height').value;
        const dogHeight = document.getElementById('dog-height').value;
        
        this.validateJumpHeight(jumpHeight, dogHeight);
    }

    static validateJumpHeight(jumpHeight, dogHeight) {
        const verificationDiv = document.getElementById('height-verification');
        
        if (!dogHeight || !jumpHeight || jumpHeight === 'choice') {
            verificationDiv.style.display = 'none';
            return;
        }
        
        const dogHeightInches = parseFloat(dogHeight);
        const selectedHeight = parseInt(jumpHeight);
        
        let recommendedHeight = 8;
        if (dogHeightInches > 10) recommendedHeight = 12;
        if (dogHeightInches > 14) recommendedHeight = 16;
        if (dogHeightInches > 18) recommendedHeight = 20;
        if (dogHeightInches > 22) recommendedHeight = 24;
        
        if (selectedHeight !== recommendedHeight) {
            verificationDiv.style.display = 'block';
            verificationDiv.innerHTML = `
                <div class="alert alert-info">
                    <strong>Height Verification:</strong> Based on your dog's height of ${dogHeight}, 
                    the recommended jump height is ${recommendedHeight}". You selected ${selectedHeight}". 
                    Please verify this is correct or consider height modifications if needed.
                </div>
            `;
        } else {
            verificationDiv.style.display = 'none';
        }
    }

    static calculateAge() {
        const dobInput = document.getElementById('dog-dob');
        const ageInput = document.getElementById('dog-age');
        
        if (!dobInput.value || !this.selectedTrial) {
            ageInput.value = '';
            return;
        }
        
        const dob = new Date(dobInput.value);
        const trialDate = new Date(this.selectedTrial.date);
        
        const ageInMs = trialDate - dob;
        const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
        const years = Math.floor(ageInYears);
        const months = Math.floor((ageInYears - years) * 12);
        
        ageInput.value = `${years} years, ${months} months`;
    }

    static toggleModifications() {
        const needsModifications = document.getElementById('needs-modifications').checked;
        const modificationsSection = document.getElementById('modifications-section');
        const modificationDetails = document.getElementById('modification-details');
        
        if (needsModifications) {
            modificationsSection.style.display = 'block';
            modificationDetails.setAttribute('required', 'required');
        } else {
            modificationsSection.style.display = 'none';
            modificationDetails.removeAttribute('required');
        }
    }

    static checkExistingHandler() {
        const firstName = document.getElementById('handler-first-name').value;
        const lastName = document.getElementById('handler-last-name').value;
        
        if (!firstName || !lastName) return;
        
        const fullName = `${firstName} ${lastName}`;
        const existingHandler = DataManager.getHandler(fullName);
        
        if (existingHandler) {
            if (confirm(`Found existing handler "${fullName}". Would you like to load their information?`)) {
                this.populateHandlerInfo(existingHandler);
            }
        }
    }

    static populateHandlerInfo(handler) {
        document.getElementById('handler-email').value = handler.email || '';
        document.getElementById('handler-phone').value = handler.phone || '';
        document.getElementById('handler-address').value = handler.address || '';
        document.getElementById('handler-city').value = handler.city || '';
        document.getElementById('handler-state').value = handler.state || '';
        document.getElementById('handler-zip').value = handler.zip || '';
        document.getElementById('emergency-contact').value = handler.emergencyContact || '';
    }

    static checkExistingDog() {
        const dogName = document.getElementById('dog-name').value;
        const handlerFirstName = document.getElementById('handler-first-name').value;
        const handlerLastName = document.getElementById('handler-last-name').value;
        
        if (!dogName || !handlerFirstName || !handlerLastName) return;
        
        // Look for existing entries with this handler/dog combination
        const entries = DataManager.getEntries();
        const existingEntry = entries.find(entry => 
            entry.dogName.toLowerCase() === dogName.toLowerCase() &&
            entry.handlerName.toLowerCase() === `${handlerFirstName} ${handlerLastName}`.toLowerCase()
        );
        
        if (existingEntry) {
            if (confirm(`Found existing dog "${dogName}" for this handler. Would you like to load the dog's information?`)) {
                this.populateDogInfo(existingEntry);
            }
        }
    }

    static populateDogInfo(entry) {
        document.getElementById('dog-registered-name').value = entry.dogRegisteredName || '';
        document.getElementById('registration-number').value = entry.registrationNumber || '';
        document.getElementById('dog-breed').value = entry.dogBreed || '';
        document.getElementById('dog-sex').value = entry.dogSex || '';
        document.getElementById('dog-dob').value = entry.dogDob || '';
        document.getElementById('jump-height').value = entry.jumpHeight || '';
        document.getElementById('dog-height').value = entry.dogHeight || '';
        
        if (entry.dogDob) {
            this.calculateAge();
        }
    }

    static validateRegistrationNumber() {
        const regNumber = document.getElementById('registration-number').value;
        
        if (!regNumber) return;
        
        // Check for duplicate registration numbers in same trial
        if (this.selectedTrial) {
            const existingEntries = DataManager.getTrialEntries(this.selectedTrial.id);
            const duplicate = existingEntries.find(entry => 
                entry.registrationNumber.toLowerCase() === regNumber.toLowerCase() &&
                entry.id !== this.currentEntry?.id
            );
            
            if (duplicate) {
                this.showFieldValidation(
                    document.getElementById('registration-number'),
                    'This registration number is already entered in this trial',
                    false
                );
                return false;
            }
        }
        
        // Basic format validation (customize as needed)
        const regNumberPattern = /^[A-Za-z0-9-]+$/;
        if (!regNumberPattern.test(regNumber)) {
            this.showFieldValidation(
                document.getElementById('registration-number'),
                'Registration number contains invalid characters',
                false
            );
            return false;
        }
        
        return true;
    }

    static async submitEntry() {
        try {
            App.showLoading('Submitting entry...');
            
            const entryData = this.collectEntryData();
            const validation = this.validateEntryData(entryData);
            
            if (!validation.isValid) {
                App.showAlert('Please correct the following errors: ' + validation.errors.join(', '), 'danger');
                return;
            }
            
            entryData.status = 'submitted';
            entryData.submittedAt = new Date().toISOString();
            
            const entry = DataManager.saveEntry(entryData);
            
            // Save handler and dog info for future use
            this.saveHandlerInfo(entryData);
            this.saveDogInfo(entryData);
            
            App.showAlert('Entry submitted successfully!', 'success');
            this.currentEntry = entry;
            this.isEditing = true;
            this.updateFormTitle();
            
            // Optionally send confirmation email
            this.sendEntryConfirmation(entry);
            
        } catch (error) {
            App.handleError(error, 'Entry Submission');
        } finally {
            App.hideLoading();
        }
    }

    static collectEntryData() {
        const form = document.getElementById('entry-form-element');
        const formData = new FormData(form);
        
        // Collect selected classes
        const selectedClasses = Array.from(document.querySelectorAll('[name="selectedClasses"]:checked'))
            .map(cb => cb.value);
        
        // Collect modifications
        const modifications = Array.from(document.querySelectorAll('[name="modifications"]:checked'))
            .map(cb => cb.value);
        
        const entry = {
            id: this.currentEntry?.id,
            trialId: document.getElementById('entry-trial-select').value,
            
            // Handler information
            handlerFirstName: formData.get('handlerFirstName'),
            handlerLastName: formData.get('handlerLastName'),
            handlerName: `${formData.get('handlerFirstName')} ${formData.get('handlerLastName')}`,
            handlerEmail: formData.get('handlerEmail'),
            handlerPhone: formData.get('handlerPhone'),
            handlerAddress: formData.get('handlerAddress'),
            handlerCity: formData.get('handlerCity'),
            handlerState: formData.get('handlerState'),
            handlerZip: formData.get('handlerZip'),
            emergencyContact: formData.get('emergencyContact'),
            isJuniorHandler: formData.get('juniorHandler') === 'on',
            
            // Dog information
            dogName: formData.get('dogName'),
            dogRegisteredName: formData.get('dogRegisteredName'),
            registrationNumber: formData.get('registrationNumber'),
            dogBreed: formData.get('dogBreed'),
            dogSex: formData.get('dogSex'),
            dogDob: formData.get('dogDob'),
            dogAge: formData.get('dogAge'),
            jumpHeight: formData.get('jumpHeight'),
            dogHeight: formData.get('dogHeight'),
            
            // Entry details
            classes: selectedClasses,
            entryType: formData.get('entryType'),
            needsModifications: formData.get('needsModifications') === 'on',
            modifications: modifications,
            modificationDetails: formData.get('modificationDetails'),
            specialNeeds: formData.get('specialNeeds'),
            conflictingDogs: formData.get('conflictingDogs') === 'on',
            earlyDeparture: formData.get('earlyDeparture') === 'on',
            
            // Payment information
            paymentMethod: formData.get('paymentMethod'),
            paymentReference: formData.get('paymentReference'),
            
            // Acknowledgments
            waiverAgreement: formData.get('waiverAgreement') === 'on',
            vaccinationCurrent: formData.get('vaccinationCurrent') === 'on',
            rulesAcknowledgment: formData.get('rulesAcknowledgment') === 'on',
            infoAccuracy: formData.get('infoAccuracy') === 'on',
            
            // Calculated fields
            entryFees: this.calculateEntryFees(selectedClasses, formData.get('entryType')),
            
            // Metadata
            submittedBy: Auth.getCurrentUser()?.id,
            createdAt: this.currentEntry?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        return entry;
    }

    static calculateEntryFees(selectedClasses, entryType) {
        if (!this.selectedTrial || !selectedClasses.length) {
            return { regular: 0, feo: 0, total: 0 };
        }
        
        const regularFee = this.selectedTrial.fees?.regular || 0;
        const feoFee = this.selectedTrial.fees?.feo || 0;
        
        let regularTotal = 0;
        let feoTotal = 0;
        
        if (entryType === 'feo') {
            feoTotal = selectedClasses.length * feoFee;
        } else {
            regularTotal = selectedClasses.length * regularFee;
        }
        
        return {
            regular: regularTotal,
            feo: feoTotal,
            total: regularTotal + feoTotal
        };
    }

    static validateEntryData(entry) {
        const errors = [];
        
        // Required fields
        if (!entry.trialId) {
            errors.push('Trial selection is required');
        }
        
        if (!entry.handlerFirstName || !entry.handlerLastName) {
            errors.push('Handler name is required');
        }
        
        if (!entry.handlerEmail) {
            errors.push('Handler email is required');
        }
        
        if (!entry.dogName) {
            errors.push('Dog name is required');
        }
        
        if (!entry.registrationNumber) {
            errors.push('Registration number is required');
        }
        
        if (!entry.dogBreed) {
            errors.push('Dog breed is required');
        }
        
        if (!entry.dogSex) {
            errors.push('Dog sex is required');
        }
        
        if (!entry.jumpHeight) {
            errors.push('Jump height is required');
        }
        
        if (!entry.classes || entry.classes.length === 0) {
            errors.push('At least one class must be selected');
        }
        
        if (!entry.paymentMethod) {
            errors.push('Payment method is required');
        }
        
        // Acknowledgment validations
        if (!entry.waiverAgreement) {
            errors.push('Waiver agreement is required');
        }
        
        if (!entry.vaccinationCurrent) {
            errors.push('Vaccination confirmation is required');
        }
        
        if (!entry.rulesAcknowledgment) {
            errors.push('Rules acknowledgment is required');
        }
        
        if (!entry.infoAccuracy) {
            errors.push('Information accuracy confirmation is required');
        }
        
        // Modification validations
        if (entry.needsModifications && !entry.modificationDetails) {
            errors.push('Modification details are required when modifications are requested');
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (entry.handlerEmail && !emailRegex.test(entry.handlerEmail)) {
            errors.push('Valid email address is required');
        }
        
        // Trial capacity check
        if (this.selectedTrial.entryLimit) {
            const existingEntries = DataManager.getTrialEntries(entry.trialId);
            if (existingEntries.length >= this.selectedTrial.entryLimit && !this.isEditing) {
                errors.push('Trial is full - no more entries accepted');
            }
        }
        
        // Entry deadline check
        const entryDeadline = new Date(this.selectedTrial.entryDeadline);
        const now = new Date();
        if (now > entryDeadline && !this.isEditing) {
            errors.push('Entry deadline has passed');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    static validateField(field) {
        // Individual field validation implementation
        const value = field.value?.trim();
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
        
        // Registration number validation
        if (field.name === 'registrationNumber' && value) {
            isValid = this.validateRegistrationNumber();
            if (!isValid) return false; // Message already shown
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

    static saveHandlerInfo(entryData) {
        const handler = {
            name: entryData.handlerName,
            firstName: entryData.handlerFirstName,
            lastName: entryData.handlerLastName,
            email: entryData.handlerEmail,
            phone: entryData.handlerPhone,
            address: entryData.handlerAddress,
            city: entryData.handlerCity,
            state: entryData.handlerState,
            zip: entryData.handlerZip,
            emergencyContact: entryData.emergencyContact,
            isJuniorHandler: entryData.isJuniorHandler
        };
        
        DataManager.saveHandler(handler);
    }

    static saveDogInfo(entryData) {
        const dog = {
            registrationNumber: entryData.registrationNumber,
            callName: entryData.dogName,
            registeredName: entryData.dogRegisteredName,
            breed: entryData.dogBreed,
            sex: entryData.dogSex,
            dateOfBirth: entryData.dogDob,
            height: entryData.dogHeight,
            handlerName: entryData.handlerName
        };
        
        DataManager.saveDog(dog);
    }

    static saveDraft() {
        try {
            const entryData = this.collectEntryData();
            entryData.status = 'draft';
            
            const entry = DataManager.saveEntry(entryData);
            this.currentEntry = entry;
            this.isEditing = true;
            
            App.showAlert('Draft saved successfully', 'success');
            this.updateFormTitle();
            
        } catch (error) {
            App.handleError(error, 'Save Draft');
        }
    }

    static autoSave() {
        if (this.currentEntry && this.currentEntry.status === 'draft') {
            // Debounced auto-save for drafts only
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = setTimeout(() => {
                try {
                    const entryData = this.collectEntryData();
                    entryData.status = 'draft';
                    DataManager.saveEntry(entryData);
                    
                    App.setStatus('Draft auto-saved', 'success');
                } catch (error) {
                    console.warn('Auto-save failed:', error);
                }
            }, 2000);
        }
    }

    static resetForm() {
        if (confirm('Are you sure you want to reset the form? All unsaved changes will be lost.')) {
            document.getElementById('entry-form-element').reset();
            document.getElementById('entry-trial-select').value = '';
            this.currentEntry = null;
            this.isEditing = false;
            this.selectedTrial = null;
            this.updateFormTitle();
            
            // Reset displays
            document.getElementById('trial-info-display').style.display = 'none';
            document.getElementById('available-classes').innerHTML = 
                '<div class="no-trial-selected">Please select a trial first to see available classes.</div>';
            this.updateFeeDisplay(0, 0, 0);
        }
    }

    static updateFormTitle() {
        const titleEl = document.getElementById('entry-form-title');
        const submitBtn = document.getElementById('entry-submit-btn');
        
        if (this.isEditing && this.currentEntry) {
            titleEl.textContent = `Edit Entry: ${this.currentEntry.handlerName} & ${this.currentEntry.dogName}`;
            submitBtn.textContent = 'Update Entry';
        } else {
            titleEl.textContent = 'Create New Entry';
            submitBtn.textContent = 'Submit Entry';
        }
    }

    static checkForSelectedEntry() {
        const selectedEntryId = sessionStorage.getItem('selectedEntryId');
        if (selectedEntryId) {
            this.loadEntryForEditing(selectedEntryId);
            sessionStorage.removeItem('selectedEntryId');
        }
    }

    static loadEntryForEditing(entryId) {
        const entry = DataManager.getEntry(entryId);
        if (!entry) {
            App.showAlert('Entry not found', 'warning');
            return;
        }
        
        this.currentEntry = entry;
        this.isEditing = true;
        this.selectedTrial = DataManager.getTrial(entry.trialId);
        this.populateEntryForm(entry);
        this.updateFormTitle();
    }

    static populateEntryForm(entry) {
        // Trial selection
        document.getElementById('entry-trial-select').value = entry.trialId;
        this.onTrialChange();
        
        // Handler information
        document.getElementById('handler-first-name').value = entry.handlerFirstName || '';
        document.getElementById('handler-last-name').value = entry.handlerLastName || '';
        document.getElementById('handler-email').value = entry.handlerEmail || '';
        document.getElementById('handler-phone').value = entry.handlerPhone || '';
        document.getElementById('handler-address').value = entry.handlerAddress || '';
        document.getElementById('handler-city').value = entry.handlerCity || '';
        document.getElementById('handler-state').value = entry.handlerState || '';
        document.getElementById('handler-zip').value = entry.handlerZip || '';
        document.getElementById('emergency-contact').value = entry.emergencyContact || '';
        document.getElementById('junior-handler').checked = entry.isJuniorHandler || false;
        
        // Dog information
        document.getElementById('dog-name').value = entry.dogName || '';
        document.getElementById('dog-registered-name').value = entry.dogRegisteredName || '';
        document.getElementById('registration-number').value = entry.registrationNumber || '';
        document.getElementById('dog-breed').value = entry.dogBreed || '';
        document.getElementById('dog-sex').value = entry.dogSex || '';
        document.getElementById('dog-dob').value = entry.dogDob || '';
        document.getElementById('jump-height').value = entry.jumpHeight || '';
        document.getElementById('dog-height').value = entry.dogHeight || '';
        
        // Calculate age if DOB is present
        if (entry.dogDob) {
            this.calculateAge();
        }
        
        // Entry details
        setTimeout(() => {
            // Classes (wait for classes to load)
            if (entry.classes) {
                entry.classes.forEach(className => {
                    const checkbox = document.querySelector(`[name="selectedClasses"][value="${className}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }
            
            this.calculateFees();
        }, 100);
        
        document.getElementById('entry-type').value = entry.entryType || 'regular';
        document.getElementById('needs-modifications').checked = entry.needsModifications || false;
        
        if (entry.needsModifications) {
            this.toggleModifications();
            if (entry.modifications) {
                entry.modifications.forEach(mod => {
                    const checkbox = document.querySelector(`[name="modifications"][value="${mod}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }
            document.getElementById('modification-details').value = entry.modificationDetails || '';
        }
        
        document.getElementById('special-needs').value = entry.specialNeeds || '';
        document.getElementById('conflicting-dogs').checked = entry.conflictingDogs || false;
        document.getElementById('early-departure').checked = entry.earlyDeparture || false;
        
        // Payment information
        document.getElementById('payment-method').value = entry.paymentMethod || '';
        document.getElementById('payment-reference').value = entry.paymentReference || '';
        
        // Acknowledgments
        document.getElementById('waiver-agreement').checked = entry.waiverAgreement || false;
        document.getElementById('vaccination-current').checked = entry.vaccinationCurrent || false;
        document.getElementById('rules-acknowledgment').checked = entry.rulesAcknowledgment || false;
        document.getElementById('info-accuracy').checked = entry.infoAccuracy || false;
    }

    static async loadEntriesList() {
        try {
            const user = Auth.getCurrentUser();
            let entries;
            
            if (user.role === 'admin' || user.permissions.includes('view_all_entries')) {
                entries = DataManager.getEntries();
            } else {
                // Regular users see only their own entries
                entries = DataManager.getEntries().filter(entry => 
                    entry.submittedBy === user.id
                );
            }
            
            this.displayEntriesList(entries);
            this.updateEntrySummary(entries);
            
        } catch (error) {
            App.handleError(error, 'Load Entries');
        }
    }

    static displayEntriesList(entries) {
        const tbody = document.querySelector('#entries-table tbody');
        
        if (entries.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        No entries found. <a href="#" onclick="EntryManagement.switchTab('entry-form')">Create your first entry</a>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = entries.map(entry => {
            const trial = DataManager.getTrial(entry.trialId);
            const trialName = trial ? trial.name : 'Unknown Trial';
            const fees = entry.entryFees?.total || 0;
            
            return `
                <tr data-entry-id="${entry.id}">
                    <td class="handler-name">${entry.handlerName}</td>
                    <td class="dog-name">${entry.dogName}</td>
                    <td class="trial-name">${trialName}</td>
                    <td class="classes-list">${(entry.classes || []).join(', ')}</td>
                    <td class="entry-type">
                        <span class="badge ${entry.entryType === 'feo' ? 'badge-warning' : 'badge-primary'}">
                            ${entry.entryType?.toUpperCase() || 'REG'}
                        </span>
                    </td>
                    <td class="entry-status">
                        <span class="status ${entry.status || 'draft'}">${entry.status || 'draft'}</span>
                    </td>
                    <td class="entry-fees">${App.formatCurrency(fees)}</td>
                    <td class="entry-actions">
                        <button class="btn btn-sm btn-primary" onclick="EntryManagement.editEntry('${entry.id}')">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="EntryManagement.viewEntry('${entry.id}')">
                            View
                        </button>
                        ${entry.status === 'draft' ? `
                            <button class="btn btn-sm btn-danger" onclick="EntryManagement.deleteEntry('${entry.id}')">
                                Delete
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    }

    static updateEntrySummary(entries) {
        const totalCount = entries.length;
        const regularCount = entries.filter(e => e.entryType !== 'feo').length;
        const feoCount = entries.filter(e => e.entryType === 'feo').length;
        const totalFees = entries.reduce((sum, entry) => sum + (entry.entryFees?.total || 0), 0);
        
        document.getElementById('total-entries-count').textContent = totalCount;
        document.getElementById('regular-count').textContent = regularCount;
        document.getElementById('feo-count').textContent = feoCount;
        document.getElementById('total-fees').textContent = App.formatCurrency(totalFees);
    }

    static editEntry(entryId) {
        this.loadEntryForEditing(entryId);
        this.switchTab('entry-form');
    }

    static viewEntry(entryId) {
        const entry = DataManager.getEntry(entryId);
        if (!entry) return;
        
        this.showEntryDetailsModal(entry);
    }

    static showEntryDetailsModal(entry) {
        const trial = DataManager.getTrial(entry.trialId);
        
        const modalContent = `
            <div class="entry-details-modal">
                <h3>Entry Details</h3>
                <div class="details-grid">
                    <div class="detail-section">
                        <h4>Handler Information</h4>
                        <p><strong>Name:</strong> ${entry.handlerName}</p>
                        <p><strong>Email:</strong> ${entry.handlerEmail}</p>
                        <p><strong>Phone:</strong> ${entry.handlerPhone || 'Not provided'}</p>
                        ${entry.isJuniorHandler ? '<p><strong>Junior Handler</strong></p>' : ''}
                    </div>
                    <div class="detail-section">
                        <h4>Dog Information</h4>
                        <p><strong>Call Name:</strong> ${entry.dogName}</p>
                        <p><strong>Registration #:</strong> ${entry.registrationNumber}</p>
                        <p><strong>Breed:</strong> ${entry.dogBreed}</p>
                        <p><strong>Jump Height:</strong> ${entry.jumpHeight}"</p>
                    </div>
                    <div class="detail-section">
                        <h4>Trial & Classes</h4>
                        <p><strong>Trial:</strong> ${trial?.name || 'Unknown'}</p>
                        <p><strong>Classes:</strong> ${(entry.classes || []).join(', ')}</p>
                        <p><strong>Entry Type:</strong> ${entry.entryType?.toUpperCase() || 'REGULAR'}</p>
                        <p><strong>Status:</strong> <span class="status ${entry.status}">${entry.status}</span></p>
                    </div>
                    <div class="detail-section">
                        <h4>Fees & Payment</h4>
                        <p><strong>Total Fees:</strong> ${App.formatCurrency(entry.entryFees?.total || 0)}</p>
                        <p><strong>Payment Method:</strong> ${entry.paymentMethod || 'Not specified'}</p>
                        ${entry.paymentReference ? `<p><strong>Reference:</strong> ${entry.paymentReference}</p>` : ''}
                    </div>
                </div>
                ${entry.specialNeeds ? `
                    <div class="special-notes">
                        <h4>Special Needs</h4>
                        <p>${entry.specialNeeds}</p>
                    </div>
                ` : ''}
                ${entry.needsModifications ? `
                    <div class="modifications">
                        <h4>Modifications Requested</h4>
                        <p><strong>Types:</strong> ${(entry.modifications || []).join(', ')}</p>
                        ${entry.modificationDetails ? `<p><strong>Details:</strong> ${entry.modificationDetails}</p>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
        
        // This would typically show in a modal - for now, show alert
        App.showAlert('Entry details would be shown in a modal', 'info');
    }

    static deleteEntry(entryId) {
        if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
            try {
                DataManager.deleteEntry(entryId);
                App.showAlert('Entry deleted successfully', 'success');
                this.loadEntriesList();
            } catch (error) {
                App.handleError(error, 'Delete Entry');
            }
        }
    }

    static searchEntries() {
        const searchTerm = document.getElementById('entry-search').value.toLowerCase();
        const trialFilter = document.getElementById('trial-filter').value;
        const statusFilter = document.getElementById('entry-status-filter').value;
        
        let entries = DataManager.getEntries();
        
        // Apply search filter
        if (searchTerm) {
            entries = entries.filter(entry => 
                entry.handlerName.toLowerCase().includes(searchTerm) ||
                entry.dogName.toLowerCase().includes(searchTerm) ||
                entry.registrationNumber.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply trial filter
        if (trialFilter) {
            entries = entries.filter(entry => entry.trialId === trialFilter);
        }
        
        // Apply status filter
        if (statusFilter) {
            entries = entries.filter(entry => entry.status === statusFilter);
        }
        
        this.displayEntriesList(entries);
        this.updateEntrySummary(entries);
    }

    static filterEntries() {
        this.searchEntries(); // Reuse search logic with current filters
    }

    static loadBulkOperations() {
        // Load data for bulk operations tab
        console.log('Loading bulk operations...');
    }

    static handleCSVImport(input) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const entries = this.parseCSVEntries(csv);
                this.showImportPreview(entries);
            } catch (error) {
                App.handleError(error, 'CSV Import');
            }
        };
        reader.readAsText(file);
    }

    static parseCSVEntries(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const entries = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length < headers.length) continue;
            
            const entry = {};
            headers.forEach((header, index) => {
                entry[header] = values[index];
            });
            
            entries.push(entry);
        }
        
        return entries;
    }

    static showImportPreview(entries) {
        // Show preview of imported entries before confirming
        App.showAlert(`Found ${entries.length} entries to import. Preview functionality would be shown here.`, 'info');
    }

    static downloadCSVTemplate() {
        const template = `handlerFirstName,handlerLastName,handlerEmail,dogName,registrationNumber,dogBreed,dogSex,jumpHeight,entryType,classes
John,Doe,john@example.com,Buddy,12345,Golden Retriever,Male,16,regular,"Level 1 - CTH,Level 1 - FFF"
Jane,Smith,jane@example.com,Luna,67890,Border Collie,Female,20,regular,"Level 1 - WA"`;
        
        App.downloadFile(template, 'entry-template.csv', 'text/csv');
    }

    static sendEntryConfirmation(entry) {
        // In a real implementation, this would send an email
        console.log('Sending entry confirmation for:', entry.handlerName);
        App.showAlert('Entry confirmation would be sent via email', 'info');
    }

    static sendConfirmationEmails() {
        const selectedTrial = document.getElementById('trial-filter').value;
        if (!selectedTrial) {
            App.showAlert('Please select a trial first', 'warning');
            return;
        }
        
        const entries = DataManager.getTrialEntries(selectedTrial);
        const unconfirmedEntries = entries.filter(entry => entry.status === 'submitted');
        
        if (unconfirmedEntries.length === 0) {
            App.showAlert('No unconfirmed entries found for this trial', 'info');
            return;
        }
        
        if (confirm(`Send confirmation emails to ${unconfirmedEntries.length} entry holders?`)) {
            // In real implementation, this would send actual emails
            App.showAlert(`Confirmation emails would be sent to ${unconfirmedEntries.length} handlers`, 'success');
        }
    }

    static sendReminderEmails() {
        // Similar implementation for payment reminders
        App.showAlert('Payment reminder emails would be sent', 'info');
    }

    static sendTrialReminders() {
        // Similar implementation for trial reminders
        App.showAlert('Trial reminder emails would be sent', 'info');
    }

    static exportEntries() {
        const entries = DataManager.getEntries();
        const csvData = this.entriesToCSV(entries);
        const filename = `entries-export-${new Date().toISOString().split('T')[0]}.csv`;
        App.downloadFile(csvData, filename, 'text/csv');
        App.showAlert('Entries exported successfully', 'success');
    }

    static entriesToCSV(entries) {
        const headers = [
            'Handler Name', 'Handler Email', 'Dog Name', 'Registration Number',
            'Dog Breed', 'Jump Height', 'Trial', 'Classes', 'Entry Type',
            'Status', 'Total Fees', 'Payment Method', 'Submitted Date'
        ];
        
        const rows = entries.map(entry => {
            const trial = DataManager.getTrial(entry.trialId);
            return [
                entry.handlerName,
                entry.handlerEmail,
                entry.dogName,
                entry.registrationNumber,
                entry.dogBreed,
                entry.jumpHeight,
                trial?.name || 'Unknown',
                (entry.classes || []).join(';'),
                entry.entryType,
                entry.status,
                entry.entryFees?.total || 0,
                entry.paymentMethod,
                entry.submittedAt ? new Date(entry.submittedAt).toLocaleDateString() : ''
            ];
        });
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    static generateEntryReport() {
        const entries = DataManager.getEntries();
        const report = this.createEntryReport(entries);
        App.generatePrintableReport('Entry Report', report);
    }

    static createEntryReport(entries) {
        const stats = this.calculateEntryStatistics(entries);
        
        return `
            <div class="entry-report">
                <h2>Entry Report Summary</h2>
                <div class="report-stats">
                    <div class="stat-item">Total Entries: ${stats.total}</div>
                    <div class="stat-item">Regular Entries: ${stats.regular}</div>
                    <div class="stat-item">FEO Entries: ${stats.feo}</div>
                    <div class="stat-item">Total Revenue: ${App.formatCurrency(stats.totalFees)}</div>
                </div>
                
                <h3>Entries by Trial</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Trial</th>
                            <th>Entries</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(stats.byTrial).map(([trialName, data]) => `
                            <tr>
                                <td>${trialName}</td>
                                <td>${data.count}</td>
                                <td>${App.formatCurrency(data.fees)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    static calculateEntryStatistics(entries) {
        const stats = {
            total: entries.length,
            regular: entries.filter(e => e.entryType !== 'feo').length,
            feo: entries.filter(e => e.entryType === 'feo').length,
            totalFees: entries.reduce((sum, e) => sum + (e.entryFees?.total || 0), 0),
            byTrial: {}
        };
        
        entries.forEach(entry => {
            const trial = DataManager.getTrial(entry.trialId);
            const trialName = trial?.name || 'Unknown Trial';
            
            if (!stats.byTrial[trialName]) {
                stats.byTrial[trialName] = { count: 0, fees: 0 };
            }
            
            stats.byTrial[trialName].count++;
            stats.byTrial[trialName].fees += entry.entryFees?.total || 0;
        });
        
        return stats;
    }

    static generatePaymentReport() {
        const entries = DataManager.getEntries();
        const paymentReport = this.createPaymentReport(entries);
        App.generatePrintableReport('Payment Status Report', paymentReport);
    }

    static createPaymentReport(entries) {
        const paymentStats = entries.reduce((stats, entry) => {
            const status = entry.status || 'draft';
            if (!stats[status]) {
                stats[status] = { count: 0, fees: 0 };
            }
            stats[status].count++;
            stats[status].fees += entry.entryFees?.total || 0;
            return stats;
        }, {});
        
        return `
            <div class="payment-report">
                <h2>Payment Status Report</h2>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Count</th>
                            <th>Total Fees</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(paymentStats).map(([status, data]) => `
                            <tr>
                                <td class="status ${status}">${status}</td>
                                <td>${data.count}</td>
                                <td>${App.formatCurrency(data.fees)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    static bulkStatusUpdate() {
        const newStatus = document.getElementById('bulk-status-change').value;
        if (!newStatus) {
            App.showAlert('Please select a status to apply', 'warning');
            return;
        }
        
        // In a real implementation, this would update selected entries
        App.showAlert(`Bulk status update to "${newStatus}" would be applied to selected entries`, 'info');
    }

    static loadVerificationData() {
        console.log('Loading verification data...');
    }

    static runDataValidation() {
        const entries = DataManager.getEntries();
        const validationResults = this.validateAllEntries(entries);
        this.displayValidationResults(validationResults);
    }

    static validateAllEntries(entries) {
        const results = {
            total: entries.length,
            errors: [],
            warnings: [],
            valid: 0
        };
        
        entries.forEach(entry => {
            const validation = this.validateEntryData(entry);
            if (validation.isValid) {
                results.valid++;
            } else {
                results.errors.push({
                    entry: entry,
                    errors: validation.errors
                });
            }
            
            // Check for warnings
            const warnings = this.checkEntryWarnings(entry);
            if (warnings.length > 0) {
                results.warnings.push({
                    entry: entry,
                    warnings: warnings
                });
            }
        });
        
        return results;
    }

    static checkEntryWarnings(entry) {
        const warnings = [];
        
        // Check for missing optional information
        if (!entry.handlerPhone) {
            warnings.push('Missing handler phone number');
        }
        
        if (!entry.emergencyContact) {
            warnings.push('Missing emergency contact');
        }
        
        if (!entry.dogDob) {
            warnings.push('Missing dog date of birth');
        }
        
        // Check for potential conflicts
        if (entry.classes && entry.classes.length > 3) {
            warnings.push('Large number of classes may cause scheduling conflicts');
        }
        
        return warnings;
    }

    static displayValidationResults(results) {
        const container = document.getElementById('validation-results');
        
        container.innerHTML = `
            <div class="validation-summary">
                <h4>Validation Summary</h4>
                <div class="validation-stats">
                    <div class="stat-item success">Valid Entries: ${results.valid}</div>
                    <div class="stat-item error">Entries with Errors: ${results.errors.length}</div>
                    <div class="stat-item warning">Entries with Warnings: ${results.warnings.length}</div>
                </div>
            </div>
            
            ${results.errors.length > 0 ? `
                <div class="validation-errors">
                    <h5>Entries with Errors</h5>
                    ${results.errors.map(item => `
                        <div class="validation-item error">
                            <strong>${item.entry.handlerName} & ${item.entry.dogName}</strong>
                            <ul>
                                ${item.errors.map(error => `<li>${error}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${results.warnings.length > 0 ? `
                <div class="validation-warnings">
                    <h5>Entries with Warnings</h5>
                    ${results.warnings.map(item => `
                        <div class="validation-item warning">
                            <strong>${item.entry.handlerName} & ${item.entry.dogName}</strong>
                            <ul>
                                ${item.warnings.map(warning => `<li>${warning}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    static verifyRegistrations() {
        const entries = DataManager.getEntries();
        const regNumbers = entries.map(entry => entry.registrationNumber);
        const duplicates = this.findDuplicateRegistrations(regNumbers);
        
        const container = document.getElementById('registration-check');
        
        if (duplicates.length === 0) {
            container.innerHTML = `
                <div class="verification-success">
                    ✅ All registration numbers are unique.
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="verification-errors">
                    <h5>Duplicate Registration Numbers Found</h5>
                    ${duplicates.map(dup => `
                        <div class="duplicate-entry">
                            <strong>Registration #${dup.regNumber}</strong>
                            <p>Used by: ${dup.handlers.join(', ')}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    static findDuplicateRegistrations(regNumbers) {
        const counts = {};
        const duplicates = [];
        
        regNumbers.forEach(regNum => {
            counts[regNum] = (counts[regNum] || 0) + 1;
        });
        
        Object.entries(counts).forEach(([regNum, count]) => {
            if (count > 1) {
                const entries = DataManager.getEntries().filter(e => e.registrationNumber === regNum);
                duplicates.push({
                    regNumber: regNum,
                    handlers: entries.map(e => e.handlerName)
                });
            }
        });
        
        return duplicates;
    }

    static checkPaymentStatus() {
        const entries = DataManager.getEntries();
        const paymentSummary = this.analyzePaymentStatus(entries);
        
        const container = document.getElementById('payment-tracking');
        
        container.innerHTML = `
            <div class="payment-summary">
                <h5>Payment Status Summary</h5>
                <div class="payment-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Outstanding:</span>
                        <span class="stat-value">${App.formatCurrency(paymentSummary.outstanding)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Paid:</span>
                        <span class="stat-value">${App.formatCurrency(paymentSummary.paid)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Unpaid Entries:</span>
                        <span class="stat-value">${paymentSummary.unpaidCount}</span>
                    </div>
                </div>
                
                ${paymentSummary.overdue.length > 0 ? `
                    <div class="overdue-entries">
                        <h6>Overdue Payments</h6>
                        ${paymentSummary.overdue.map(entry => `
                            <div class="overdue-entry">
                                ${entry.handlerName} - ${App.formatCurrency(entry.entryFees?.total || 0)}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    static analyzePaymentStatus(entries) {
        const summary = {
            outstanding: 0,
            paid: 0,
            unpaidCount: 0,
            overdue: []
        };
        
        entries.forEach(entry => {
            const fees = entry.entryFees?.total || 0;
            
            if (entry.status === 'paid') {
                summary.paid += fees;
            } else {
                summary.outstanding += fees;
                summary.unpaidCount++;
                
                // Check if overdue (more than 7 days after submission)
                if (entry.submittedAt) {
                    const submittedDate = new Date(entry.submittedAt);
                    const daysOld = (Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24);
                    
                    if (daysOld > 7) {
                        summary.overdue.push(entry);
                    }
                }
            }
        });
        
        return summary;
    }

    // Module interface methods
    static refresh() {
        this.loadInitialData();
    }

    static save() {
        if (this.currentEntry && this.currentEntry.status === 'draft') {
            return this.saveDraft();
        }
        return Promise.resolve();
    }

    static createNew() {
        this.resetForm();
        this.switchTab('entry-form');
    }
}ees();
            return;
        }

        this.selectedTrial = DataManager.getTrial(trialId);
        this.displayTrialInfo();
        this.loadAvailableClasses();
        this.loadTrialWaiver();
        this.calculateF
