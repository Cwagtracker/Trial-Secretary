// js/modules/paperwork-generator.js
class PaperworkGenerator {
    static init() {
        this.loadModule();
    }

    static loadModule() {
        const container = document.getElementById('module-container');
        container.innerHTML = `
            <div class="paperwork-module">
                <div class="module-header">
                    <h2>📄 Paperwork Generation</h2>
                    <p>Generate all required trial forms and documents</p>
                </div>

                <div class="paperwork-grid">
                    <!-- Trial Selection -->
                    <div class="paperwork-section">
                        <h3>Select Trial</h3>
                        <div class="form-group">
                            <label for="paperwork-trial-select">Trial:</label>
                            <select id="paperwork-trial-select" class="form-control">
                                <option value="">Select a trial...</option>
                            </select>
                        </div>
                        <div id="trial-info" class="trial-info" style="display: none;"></div>
                    </div>

                    <!-- Form Categories -->
                    <div class="paperwork-categories">
                        <!-- Pre-Trial Forms -->
                        <div class="category-card">
                            <h4>📋 Pre-Trial Forms</h4>
                            <div class="form-list">
                                <button class="form-btn" onclick="PaperworkGenerator.generateTrialApplication()">
                                    Trial Application
                                </button>
                                <button class="form-btn" onclick="PaperworkGenerator.generatePremium()">
                                    Premium (Trial Info)
                                </button>
                                <button class="form-btn" onclick="PaperworkGenerator.generateEntryConfirmations()">
                                    Entry Confirmations
                                </button>
                            </div>
                        </div>

                        <!-- Competition Day Forms -->
                        <div class="category-card">
                            <h4>🏆 Competition Day</h4>
                            <div class="form-list">
                                <button class="form-btn" onclick="PaperworkGenerator.generateRunningOrders()">
                                    Running Orders (Gate Sheets)
                                </button>
                                <button class="form-btn" onclick="PaperworkGenerator.generateScoreSheets()">
                                    Score Sheets
                                </button>
                                <button class="form-btn" onclick="PaperworkGenerator.generateClassResultsReports()">
                                    Class Results Reports
                                </button>
                                <button class="form-btn" onclick="PaperworkGenerator.generateModificationForms()">
                                    Modification Forms
                                </button>
                            </div>
                        </div>

                        <!-- Judge Forms -->
                        <div class="category-card">
                            <h4>👨‍⚖️ Judge Forms</h4>
                            <div class="form-list">
                                <button class="form-btn" onclick="PaperworkGenerator.generateJudgeSignaturePage()">
                                    Judge Signature Page
                                </button>
                                <button class="form-btn" onclick="PaperworkGenerator.generateJudgeEvaluation()">
                                    Judge Evaluation
                                </button>
                                <button class="form-btn" onclick="PaperworkGenerator.generateTrialReview()">
                                    Trial Review Form
                                </button>
                            </div>
                        </div>

                        <!-- Steward Support -->
                        <div class="category-card">
                            <h4>👥 Steward Support</h4>
                            <div class="form-list">
                                <button class="form-btn" onclick="PaperworkGenerator.generateTableStewardWorksheet()">
                                    Table Steward Worksheet
                                </button>
                                <button class="form-btn" onclick="PaperworkGenerator.generateCourseMaps()">
                                    Course Maps
                                </button>
                                <button class="form-btn" onclick="PaperworkGenerator.generateTitleTrackingSheets()">
                                    Title Tracking Sheets
                                </button>
                            </div>
                        </div>

                        <!-- Post-Trial Reports -->
                        <div class="category-card">
                            <h4>📊 Post-Trial Reports</h4>
                            <div class="form-list">
                                <button class="form-btn" onclick="PaperworkGenerator.generateTrialRecap()">
                                    Trial Recap Report
                                </button>
                                <button class="form-btn" onclick="PaperworkGenerator.generateTrialOfficialResults()">
                                    Trial Official Results
                                </button>
                                <button class="form-btn" onclick="PaperworkGenerator.generateCompletePaperworkPackage()">
                                    🎯 Complete Package
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Generation Options -->
                <div class="generation-options">
                    <div class="options-group">
                        <h4>Generation Options</h4>
                        <label><input type="checkbox" id="opt-include-blanks" checked> Include blank forms</label>
                        <label><input type="checkbox" id="opt-color-coding" checked> Use color coding</label>
                        <label><input type="checkbox" id="opt-auto-number"> Auto-number forms</label>
                        <label><input type="checkbox" id="opt-include-instructions"> Include instructions</label>
                    </div>
                    <div class="output-options">
                        <h4>Output Format</h4>
                        <label><input type="radio" name="output-format" value="pdf" checked> PDF</label>
                        <label><input type="radio" name="output-format" value="print"> Print</label>
                        <label><input type="radio" name="output-format" value="preview"> Preview</label>
                    </div>
                </div>
            </div>

            <!-- Preview Modal -->
            <div id="paperwork-preview-modal" class="modal" style="display: none;">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3>Document Preview</h3>
                        <span class="close" onclick="PaperworkGenerator.closePreview()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="preview-toolbar">
                            <button class="btn btn-primary" onclick="PaperworkGenerator.printPreview()">🖨️ Print</button>
                            <button class="btn btn-secondary" onclick="PaperworkGenerator.downloadPDF()">📄 Download PDF</button>
                            <button class="btn btn-secondary" onclick="PaperworkGenerator.closePreview()">❌ Close</button>
                        </div>
                        <div id="preview-content" class="preview-content"></div>
                    </div>
                </div>
            </div>
        `;

        this.loadTrials();
        this.setupEventListeners();
    }

    static setupEventListeners() {
        const trialSelect = document.getElementById('paperwork-trial-select');
        trialSelect.addEventListener('change', (e) => {
            this.loadTrialInfo(e.target.value);
        });
    }

    static loadTrials() {
        const trials = DataManager.getTrials();
        const select = document.getElementById('paperwork-trial-select');
        
        select.innerHTML = '<option value="">Select a trial...</option>';
        trials.forEach(trial => {
            if (trial.status === 'approved' || trial.status === 'active') {
                const option = document.createElement('option');
                option.value = trial.id;
                option.textContent = `${trial.name} - ${new Date(trial.date).toLocaleDateString()}`;
                select.appendChild(option);
            }
        });
    }

    static loadTrialInfo(trialId) {
        if (!trialId) {
            document.getElementById('trial-info').style.display = 'none';
            return;
        }

        const trial = DataManager.getTrial(trialId);
        const entries = DataManager.getTrialEntries(trialId);
        
        const infoDiv = document.getElementById('trial-info');
        infoDiv.innerHTML = `
            <div class="trial-summary">
                <h4>${trial.name}</h4>
                <div class="trial-details">
                    <div class="detail-item"><strong>Date:</strong> ${new Date(trial.date).toLocaleDateString()}</div>
                    <div class="detail-item"><strong>Location:</strong> ${trial.location}</div>
                    <div class="detail-item"><strong>Host:</strong> ${trial.host}</div>
                    <div class="detail-item"><strong>Judges:</strong> ${trial.judges.join(', ')}</div>
                    <div class="detail-item"><strong>Classes:</strong> ${trial.classes.length}</div>
                    <div class="detail-item"><strong>Entries:</strong> ${entries.length}</div>
                </div>
            </div>
        `;
        infoDiv.style.display = 'block';
    }

    // Pre-Trial Forms
    static generateTrialApplication() {
        const trialId = this.getSelectedTrial();
        if (!trialId) return;

        const trial = DataManager.getTrial(trialId);
        const form = TrialApplicationForm.generate(trial);
        this.showPreview('Trial Application', form);
    }

    static generatePremium() {
        const trialId = this.getSelectedTrial();
        if (!trialId) return;

        const trial = DataManager.getTrial(trialId);
        const premium = PremiumForm.generate(trial);
        this.showPreview('Premium', premium);
    }

    static generateEntryConfirmations() {
        const trialId = this.getSelectedTrial();
        if (!trialId) return;

        const trial = DataManager.getTrial(trialId);
        const entries = DataManager.getTrialEntries(trialId);
        const confirmations = EntryConfirmationForm.generateAll(trial, entries);
        this.showPreview('Entry Confirmations', confirmations);
    }

    // Competition Day Forms
    static generateRunningOrders() {
        const trialId = this.getSelectedTrial();
        if (!trialId) return;

        const trial = DataManager.getTrial(trialId);
        const entries = DataManager.getTrialEntries(trialId);
        const run
