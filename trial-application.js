// js/forms/trial-application.js
class TrialApplicationForm {
    static generate(trial) {
        const now = new Date();
        const formattedDate = new Date(trial.date).toLocaleDateString();
        
        return `
            <div class="trial-application">
                <div class="application-header">
                    <div class="header-logo">
                        <img src="images/cwags-logo.png" alt="C-WAGS" class="signature-logo">
                    </div>
                    <div class="header-title">
                        <h2 class="application-title">C-WAGS TRIAL APPLICATION</h2>
                        <p class="application-subtitle">Canine-Work And Games</p>
                    </div>
                </div>

                <div class="application-form">
                    <!-- Host Information Section -->
                    <div class="form-section">
                        <div class="section-title">HOST INFORMATION</div>
                        
                        <div class="form-field">
                            <div class="field-label">Host Name:</div>
                            <div class="field-value">${trial.host}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Contact Email:</div>
                            <div class="field-value">${trial.hostEmail || ''}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Phone Number:</div>
                            <div class="field-value">${trial.hostPhone || ''}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Additional Contact:</div>
                            <div class="field-value">${trial.contactInfo || ''}</div>
                        </div>
                    </div>

                    <!-- Trial Information Section -->
                    <div class="form-section">
                        <div class="section-title">TRIAL INFORMATION</div>
                        
                        <div class="form-field">
                            <div class="field-label">Trial Name:</div>
                            <div class="field-value">${trial.name}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Trial Type:</div>
                            <div class="field-value">${this.formatTrialType(trial.type)}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Trial Date:</div>
                            <div class="field-value">${formattedDate}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Entry Deadline:</div>
                            <div class="field-value">${new Date(trial.entryDeadline).toLocaleDateString()}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Entry Limit:</div>
                            <div class="field-value">${trial.entryLimit || 'No limit'}</div>
                        </div>
                    </div>

                    <!-- Venue Information Section -->
                    <div class="form-section">
                        <div class="section-title">VENUE INFORMATION</div>
                        
                        <div class="form-field">
                            <div class="field-label">Venue Name:</div>
                            <div class="field-value">${trial.venue?.name || ''}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Address:</div>
                            <div class="field-value">${trial.venue?.address || ''}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">City, State ZIP:</div>
                            <div class="field-value">${trial.venue?.city || ''}, ${trial.venue?.state || ''} ${trial.venue?.zip || ''}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Directions:</div>
                            <div class="field-value">${trial.venue?.directions || ''}</div>
                        </div>
                    </div>

                    <!-- Judge Information Section -->
                    <div class="form-section">
                        <div class="section-title">JUDGES</div>
                        ${this.generateJudgesList(trial.judges)}
                    </div>

                    <!-- Classes Offered Section -->
                    <div class="form-section">
                        <div class="section-title">CLASSES OFFERED</div>
                        <div class="checkbox-section">
                            ${this.generateClassCheckboxes(trial.classes)}
                        </div>
                    </div>

                    <!-- Schedule Section -->
                    <div class="form-section">
                        <div class="section-title">SCHEDULE</div>
                        
                        <div class="form-field">
                            <div class="field-label">Check-in Time:</div>
                            <div class="field-value">${trial.schedule?.checkInTime || ''}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Start Time:</div>
                            <div class="field-value">${trial.schedule?.startTime || ''}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Lunch Break:</div>
                            <div class="field-value">${trial.schedule?.lunchBreak || 'TBD'}</div>
                        </div>
                        
                        ${this.generateClassScheduleTable(trial)}
                    </div>

                    <!-- Entry Fees Section -->
                    <div class="form-section">
                        <div class="section-title">ENTRY FEES</div>
                        
                        <div class="form-field">
                            <div class="field-label">Regular Entry:</div>
                            <div class="field-value">$${trial.fees?.regular || '0.00'}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">FEO (For Exhibition Only):</div>
                            <div class="field-value">$${trial.fees?.feo || '0.00'}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Day of Trial Entry:</div>
                            <div class="field-value">$${trial.fees?.dayOf || 'Not Accepted'}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Day of Entries Accepted:</div>
                            <div class="field-value">${trial.acceptDayOfEntries ? 'Yes' : 'No'}</div>
                        </div>
                    </div>

                    <!-- Awards Information Section -->
                    <div class="form-section">
                        <div class="section-title">AWARDS INFORMATION</div>
                        <div class="field-value">${trial.awardsInfo || 'Awards information to be announced'}</div>
                    </div>

                    <!-- Special Instructions Section -->
                    <div class="form-section">
                        <div class="section-title">SPECIAL INSTRUCTIONS & REQUIREMENTS</div>
                        <div class="field-value">${trial.specialInstructions || ''}</div>
                    </div>

                    <!-- Waiver Section -->
                    <div class="form-section">
                        <div class="section-title">WAIVER AND RELEASE</div>
                        <div class="field-value" style="font-size: 10px;">
                            ${trial.waiverText || this.getDefaultWaiverText()}
                        </div>
                    </div>

                    <!-- Application Status Section -->
                    <div class="form-section">
                        <div class="section-title">APPLICATION STATUS</div>
                        
                        <div class="form-field">
                            <div class="field-label">Application Date:</div>
                            <div class="field-value">${now.toLocaleDateString()}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Status:</div>
                            <div class="field-value">${trial.status || 'Pending Review'}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Approval Date:</div>
                            <div class="field-value">${trial.approvalDate ? new Date(trial.approvalDate).toLocaleDateString() : '_______________'}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Approved By:</div>
                            <div class="field-value">_______________</div>
                        </div>
                    </div>

                    <!-- Signature Section -->
                    <div class="form-section">
                        <div class="section-title">HOST SIGNATURE</div>
                        
                        <div style="margin: 30px 0;">
                            <div style="display: flex; justify-content: space-between; align-items: end;">
                                <div style="flex: 1; border-bottom: 1px solid #000; margin-right: 20px; height: 20px;"></div>
                                <div style="flex: 1; border-bottom: 1px solid #000; height: 20px;"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 5px;">
                                <div>Host Signature</div>
                                <div>Date</div>
                            </div>
                        </div>
                        
                        <div style="font-size: 10px; font-style: italic;">
                            By signing above, I certify that all information provided is accurate and complete, 
                            and I agree to comply with all C-WAGS rules and regulations.
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static formatTrialType(type) {
        const types = {
            'regular': 'Regular Trial',
            'fun-match': 'Fun Match',
            'league': 'League Trial',
            'video': 'Video Trial',
            'specialty': 'Specialty Trial'
        };
        return types[type] || type;
    }

    static generateJudgesList(judges) {
        if (!judges || judges.length === 0) {
            return '<div class="field-value">No judges assigned yet</div>';
        }

        return judges.map(judge => `
            <div class="form-field">
                <div class="field-label">${judge.name}:</div>
                <div class="field-value">${judge.certification || ''} - ${judge.email || ''}</div>
            </div>
        `).join('');
    }

    static generateClassCheckboxes(classes) {
        const allClasses = [
            'Interior', 'Exterior', 'Containers', 'Buried', 'Handler Discrimination',
            'Elite', 'Vehicle', 'Area Search', 'Scent Match', 'Specific Scent',
            'Detective', 'Senior Detective', 'Convergent', 'Divergent'
        ];

        return allClasses.map(className => {
            const isOffered = classes && classes.includes(className);
            return `
                <div class="checkbox-item">
                    <input type="checkbox" ${isOffered ? 'checked' : ''} disabled>
                    <label>${className}</label>
                </div>
            `;
        }).join('');
    }

    static generateClassScheduleTable(trial) {
        if (!trial.classes || trial.classes.length === 0) {
            return '<div class="field-value">Class schedule to be determined</div>';
        }

        return `
            <table class="class-schedule-table">
                <thead>
                    <tr>
                        <th>Class</th>
                        <th>Judge</th>
                        <th>Start Time</th>
                        <th>Estimated Duration</th>
                    </tr>
                </thead>
                <tbody>
                    ${trial.classes.map(className => `
                        <tr>
                            <td>${className}</td>
                            <td>TBD</td>
                            <td>TBD</td>
                            <td>TBD</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    static getDefaultWaiverText() {
        return `I hereby waive and release C-WAGS, its officers, directors, agents, and the hosting organization from any and all liability, claims, demands, and causes of action whatsoever, arising out of or related to any loss, damage, or injury, including death, that may be sustained by me or my dog while participating in this trial. I understand that participation in this trial involves inherent risks and I voluntarily assume all such risks. I certify that my dog is healthy, properly vaccinated, and not aggressive toward people or other dogs. I agree to be solely responsible for any damage caused by my dog and will immediately clean up after my dog. I understand that C-WAGS reserves the right to dismiss any participant whose dog or conduct is deemed unsafe or disruptive.`;
    }

    // Generate a simplified version for quick reference
    static generateQuickReference(trial) {
        return `
            <div class="quick-reference">
                <h3>Trial Quick Reference</h3>
                <div class="quick-info">
                    <div><strong>Trial:</strong> ${trial.name}</div>
                    <div><strong>Date:</strong> ${new Date(trial.date).toLocaleDateString()}</div>
                    <div><strong>Host:</strong> ${trial.host}</div>
                    <div><strong>Location:</strong> ${trial.venue?.name || 'TBD'}</div>
                    <div><strong>Entry Deadline:</strong> ${new Date(trial.entryDeadline).toLocaleDateString()}</div>
                    <div><strong>Classes:</strong> ${trial.classes?.join(', ') || 'TBD'}</div>
                </div>
            </div>
        `;
    }
}