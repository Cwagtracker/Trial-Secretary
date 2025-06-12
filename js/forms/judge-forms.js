// js/forms/judge-forms.js
class JudgeForms {
    // Generate Judge Signature Page
    static generateSignaturePage(trial) {
        const formattedDate = new Date(trial.date).toLocaleDateString();
        
        return `
            <div class="judge-signature-page">
                <div class="signature-page-header">
                    <div class="header-logo">
                        <img src="images/cwags-logo.png" alt="C-WAGS" class="signature-logo">
                    </div>
                    <div class="header-title">
                        <h2>C-WAGS JUDGE SIGNATURE PAGE</h2>
                        <p>Trial: ${trial.name} | Date: ${formattedDate}</p>
                        <p>Location: ${trial.venue?.name || ''}, ${trial.venue?.city || ''}, ${trial.venue?.state || ''}</p>
                    </div>
                </div>

                <div class="signature-blocks">
                    ${this.generateJudgeSignatureBlocks(trial)}
                </div>

                <div class="signature-footer">
                    <div class="footer-section">
                        <h4>CERTIFICATION</h4>
                        <p>We, the undersigned judges, certify that we have judged the above classes in accordance with C-WAGS rules and regulations. All scores and placements are final as recorded above.</p>
                    </div>
                    
                    <div class="footer-section">
                        <h4>TRIAL STEWARD VERIFICATION</h4>
                        <div class="signature-line-section">
                            <div class="signature-line">
                                <div class="line"></div>
                                <div class="label">Trial Steward Signature</div>
                            </div>
                            <div class="signature-line">
                                <div class="line"></div>
                                <div class="label">Date</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static generateJudgeSignatureBlocks(trial) {
        if (!trial.judges || trial.judges.length === 0) {
            return '<div class="no-judges">No judges assigned to this trial</div>';
        }

        return trial.judges.map(judge => `
            <div class="judge-signature-block">
                <div class="judge-block-header">
                    <div class="judge-name">${judge.name}</div>
                    <div class="judge-certification">Certification: ${judge.certification || 'TBD'}</div>
                </div>
                
                <div class="judge-signature-area">
                    <div class="signature-line-section">
                        <div class="signature-line">
                            <div class="line"></div>
                            <div class="label">Judge Signature</div>
                        </div>
                        <div class="signature-line">
                            <div class="line"></div>
                            <div class="label">Date</div>
                        </div>
                    </div>
                </div>

                <div class="class-signature-grid">
                    ${this.generateClassSignatureCells(trial.classes)}
                </div>
            </div>
        `).join('');
    }

    static generateClassSignatureCells(classes) {
        if (!classes || classes.length === 0) {
            return '<div class="no-classes">No classes assigned</div>';
        }

        return classes.map(className => `
            <div class="class-signature-cell">
                <div class="class-label">${className}</div>
                <div class="signature-space"></div>
            </div>
        `).join('');
    }

    // Generate Judge Evaluation Form
    static generateJudgeEvaluation(trial, judge) {
        return `
            <div class="judge-evaluation-form">
                <div class="evaluation-header">
                    <div class="header-logo">
                        <img src="images/cwags-logo.png" alt="C-WAGS" class="signature-logo">
                    </div>
                    <div class="header-title">
                        <h2>C-WAGS JUDGE EVALUATION</h2>
                        <p>Confidential Evaluation Form</p>
                    </div>
                </div>

                <div class="evaluation-form">
                    <!-- Trial Information -->
                    <div class="form-section">
                        <div class="section-title">TRIAL INFORMATION</div>
                        
                        <div class="form-field">
                            <div class="field-label">Trial Name:</div>
                            <div class="field-value">${trial.name}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Date:</div>
                            <div class="field-value">${new Date(trial.date).toLocaleDateString()}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Location:</div>
                            <div class="field-value">${trial.venue?.name || ''}, ${trial.venue?.city || ''}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Host:</div>
                            <div class="field-value">${trial.host}</div>
                        </div>
                    </div>

                    <!-- Judge Information -->
                    <div class="form-section">
                        <div class="section-title">JUDGE INFORMATION</div>
                        
                        <div class="form-field">
                            <div class="field-label">Judge Name:</div>
                            <div class="field-value">${judge?.name || '_______________'}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Certification Level:</div>
                            <div class="field-value">${judge?.certification || '_______________'}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Classes Judged:</div>
                            <div class="field-value">${trial.classes?.join(', ') || '_______________'}</div>
                        </div>
                    </div>

                    <!-- Performance Evaluation -->
                    <div class="form-section">
                        <div class="section-title">PERFORMANCE EVALUATION</div>
                        
                        ${this.generateEvaluationCriteria()}
                    </div>

                    <!-- Comments Section -->
                    <div class="form-section">
                        <div class="section-title">ADDITIONAL COMMENTS</div>
                        
                        <div class="form-field">
                            <div class="field-label">Strengths:</div>
                            <div class="field-value" style="min-height: 60px; border: 1px solid #000;"></div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Areas for Improvement:</div>
                            <div class="field-value" style="min-height: 60px; border: 1px solid #000;"></div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Overall Comments:</div>
                            <div class="field-value" style="min-height: 60px; border: 1px solid #000;"></div>
                        </div>
                    </div>

                    <!-- Recommendation -->
                    <div class="form-section">
                        <div class="section-title">RECOMMENDATION</div>
                        
                        <div class="checkbox-section">
                            <div class="checkbox-item">
                                <input type="checkbox">
                                <label>Highly Recommend for Future Assignments</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox">
                                <label>Recommend with Minor Improvements</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox">
                                <label>Needs Additional Training</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox">
                                <label>Not Recommended</label>
                            </div>
                        </div>
                    </div>

                    <!-- Evaluator Signature -->
                    <div class="form-section">
                        <div class="section-title">EVALUATOR INFORMATION</div>
                        
                        <div class="form-field">
                            <div class="field-label">Evaluator Name:</div>
                            <div class="field-value">_______________</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Position/Title:</div>
                            <div class="field-value">_______________</div>
                        </div>
                        
                        <div style="margin: 30px 0;">
                            <div style="display: flex; justify-content: space-between; align-items: end;">
                                <div style="flex: 1; border-bottom: 1px solid #000; margin-right: 20px; height: 20px;"></div>
                                <div style="flex: 1; border-bottom: 1px solid #000; height: 20px;"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 5px;">
                                <div>Evaluator Signature</div>
                                <div>Date</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static generateEvaluationCriteria() {
        const criteria = [
            'Knowledge of C-WAGS Rules and Procedures',
            'Ring Management and Flow',
            'Communication with Participants',
            'Consistency in Judging',
            'Problem Solving and Decision Making',
            'Professional Demeanor',
            'Time Management',
            'Safety Awareness',
            'Record Keeping and Documentation',
            'Overall Performance'
        ];

        const ratings = ['Excellent', 'Good', 'Satisfactory', 'Needs Improvement', 'Unsatisfactory'];

        return `
            <table class="evaluation-table">
                <thead>
                    <tr>
                        <th style="width: 40%;">Criteria</th>
                        ${ratings.map(rating => `<th style="width: 12%;">${rating}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${criteria.map(criterion => `
                        <tr>
                            <td style="text-align: left; padding: 8px;">${criterion}</td>
                            ${ratings.map(() => `<td style="text-align: center;"><input type="radio" name="${criterion.replace(/\s+/g, '_')}" style="transform: scale(1.5);"></td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Generate Trial Review Form
    static generateTrialReview(trial) {
        return `
            <div class="trial-review-form">
                <div class="review-header">
                    <div class="header-logo">
                        <img src="images/cwags-logo.png" alt="C-WAGS" class="signature-logo">
                    </div>
                    <div class="header-title">
                        <h2>C-WAGS TRIAL REVIEW FORM</h2>
                        <p>Post-Trial Assessment and Feedback</p>
                    </div>
                </div>

                <div class="review-form">
                    <!-- Trial Information -->
                    <div class="form-section">
                        <div class="section-title">TRIAL INFORMATION</div>
                        
                        <div class="form-field">
                            <div class="field-label">Trial Name:</div>
                            <div class="field-value">${trial.name}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Date:</div>
                            <div class="field-value">${new Date(trial.date).toLocaleDateString()}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Host:</div>
                            <div class="field-value">${trial.host}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Location:</div>
                            <div class="field-value">${trial.venue?.name || ''}</div>
                        </div>
                    </div>

                    <!-- Statistics -->
                    <div class="form-section">
                        <div class="section-title">TRIAL STATISTICS</div>
                        
                        <div class="form-field">
                            <div class="field-label">Total Entries:</div>
                            <div class="field-value">_______________</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Classes Offered:</div>
                            <div class="field-value">${trial.classes?.length || 0}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Start Time:</div>
                            <div class="field-value">${trial.schedule?.startTime || 'TBD'}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">End Time:</div>
                            <div class="field-value">_______________</div>
                        </div>
                    </div>

                    <!-- Performance Assessment -->
                    <div class="form-section">
                        <div class="section-title">TRIAL PERFORMANCE ASSESSMENT</div>
                        
                        ${this.generateTrialAssessmentCriteria()}
                    </div>

                    <!-- Issues and Incidents -->
                    <div class="form-section">
                        <div class="section-title">ISSUES AND INCIDENTS</div>
                        
                        <div class="form-field">
                            <div class="field-label">Equipment Issues:</div>
                            <div class="field-value" style="min-height: 40px; border: 1px solid #000;"></div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Safety Concerns:</div>
                            <div class="field-value" style="min-height: 40px; border: 1px solid #000;"></div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Rule Clarifications Needed:</div>
                            <div class="field-value" style="min-height: 40px; border: 1px solid #000;"></div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Other Incidents:</div>
                            <div class="field-value" style="min-height: 40px; border: 1px solid #000;"></div>
                        </div>
                    </div>

                    <!-- Recommendations -->
                    <div class="form-section">
                        <div class="section-title">RECOMMENDATIONS FOR FUTURE TRIALS</div>
                        
                        <div class="form-field">
                            <div class="field-label">Venue Improvements:</div>
                            <div class="field-value" style="min-height: 40px; border: 1px solid #000;"></div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Equipment Recommendations:</div>
                            <div class="field-value" style="min-height: 40px; border: 1px solid #000;"></div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Process Improvements:</div>
                            <div class="field-value" style="min-height: 40px; border: 1px solid #000;"></div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Judge Training Needs:</div>
                            <div class="field-value" style="min-height: 40px; border: 1px solid #000;"></div>
                        </div>
                    </div>

                    <!-- Overall Assessment -->
                    <div class="form-section">
                        <div class="section-title">OVERALL TRIAL ASSESSMENT</div>
                        
                        <div class="checkbox-section">
                            <div class="checkbox-item">
                                <input type="checkbox">
                                <label>Excellent - Exceeded Expectations</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox">
                                <label>Good - Met Expectations</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox">
                                <label>Satisfactory - Minor Issues</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox">
                                <label>Needs Improvement - Major Issues</label>
                            </div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Overall Comments:</div>
                            <div class="field-value" style="min-height: 80px; border: 1px solid #000;"></div>
                        </div>
                    </div>

                    <!-- Reviewer Information -->
                    <div class="form-section">
                        <div class="section-title">REVIEWER INFORMATION</div>
                        
                        <div class="form-field">
                            <div class="field-label">Reviewer Name:</div>
                            <div class="field-value">_______________</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Position/Role:</div>
                            <div class="field-value">_______________</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">C-WAGS Membership #:</div>
                            <div class="field-value">_______________</div>
                        </div>
                        
                        <div style="margin: 30px 0;">
                            <div style="display: flex; justify-content: space-between; align-items: end;">
                                <div style="flex: 1; border-bottom: 1px solid #000; margin-right: 20px; height: 20px;"></div>
                                <div style="flex: 1; border-bottom: 1px solid #000; height: 20px;"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 5px;">
                                <div>Reviewer Signature</div>
                                <div>Date</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static generateTrialAssessmentCriteria() {
        const criteria = [
            'Trial Organization and Setup',
            'Schedule Adherence',
            'Judge Performance',
            'Steward Support',
            'Equipment and Venue Quality',
            'Safety Protocols',
            'Participant Communication',
            'Problem Resolution',
            'Documentation and Record Keeping',
            'Overall Trial Management'
        ];

        const ratings = ['Excellent', 'Good', 'Satisfactory', 'Poor', 'N/A'];

        return `
            <table class="evaluation-table">
                <thead>
                    <tr>
                        <th style="width: 40%;">Assessment Area</th>
                        ${ratings.map(rating => `<th style="width: 12%;">${rating}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${criteria.map(criterion => `
                        <tr>
                            <td style="text-align: left; padding: 8px;">${criterion}</td>
                            ${ratings.map(() => `<td style="text-align: center;"><input type="radio" name="${criterion.replace(/\s+/g, '_')}" style="transform: scale(1.5);"></td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Generate Judge Assignment Sheet
    static generateJudgeAssignmentSheet(trial) {
        return `
            <div class="judge-assignment-sheet">
                <div class="assignment-header">
                    <div class="header-logo">
                        <img src="images/cwags-logo.png" alt="C-WAGS" class="signature-logo">
                    </div>
                    <div class="header-title">
                        <h2>C-WAGS JUDGE ASSIGNMENT SHEET</h2>
                        <p>Trial: ${trial.name} | Date: ${new Date(trial.date).toLocaleDateString()}</p>
                    </div>
                </div>

                <div class="assignment-content">
                    <!-- Trial Summary -->
                    <div class="form-section">
                        <div class="section-title">TRIAL SUMMARY</div>
                        
                        <div class="summary-grid">
                            <div class="summary-item">
                                <div class="summary-label">Host:</div>
                                <div class="summary-value">${trial.host}</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">Location:</div>
                                <div class="summary-value">${trial.venue?.name || ''}</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">Start Time:</div>
                                <div class="summary-value">${trial.schedule?.startTime || 'TBD'}</div>
                            </div>
                            <div class="summary-item">
                                <div class="summary-label">Total Classes:</div>
                                <div class="summary-value">${trial.classes?.length || 0}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Judge Assignments -->
                    <div class="form-section">
                        <div class="section-title">JUDGE ASSIGNMENTS</div>
                        
                        <table class="assignment-table">
                            <thead>
                                <tr>
                                    <th>Judge Name</th>
                                    <th>Certification</th>
                                    <th>Classes Assigned</th>
                                    <th>Contact Info</th>
                                    <th>Arrival Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.generateJudgeAssignmentRows(trial)}
                            </tbody>
                        </table>
                    </div>

                    <!-- Class Schedule -->
                    <div class="form-section">
                        <div class="section-title">DETAILED CLASS SCHEDULE</div>
                        
                        <table class="schedule-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Class</th>
                                    <th>Judge</th>
                                    <th>Entries</th>
                                    <th>Ring/Area</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.generateScheduleRows(trial)}
                            </tbody>
                        </table>
                    </div>

                    <!-- Judge Instructions -->
                    <div class="form-section">
                        <div class="section-title">SPECIAL INSTRUCTIONS FOR JUDGES</div>
                        
                        <div class="instructions-content">
                            <div class="instruction-item">
                                <strong>Arrival and Check-in:</strong> Please arrive at least 30 minutes before your first class to review the setup and meet with stewards.
                            </div>
                            
                            <div class="instruction-item">
                                <strong>Equipment Check:</strong> Verify all necessary equipment is available and functioning before starting each class.
                            </div>
                            
                            <div class="instruction-item">
                                <strong>Safety First:</strong> Stop any exercise immediately if safety concerns arise. Report all incidents to the Trial Steward.
                            </div>
                            
                            <div class="instruction-item">
                                <strong>Record Keeping:</strong> Complete all score sheets legibly and submit to Trial Steward immediately after each class.
                            </div>
                            
                            <div class="instruction-item">
                                <strong>Questions:</strong> Direct all rule clarifications to the Trial Steward. Maintain consistency throughout the day.
                            </div>
                            
                            ${trial.specialInstructions ? `
                                <div class="instruction-item">
                                    <strong>Trial-Specific Instructions:</strong> ${trial.specialInstructions}
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Contact Information -->
                    <div class="form-section">
                        <div class="section-title">EMERGENCY CONTACT INFORMATION</div>
                        
                        <div class="contact-grid">
                            <div class="contact-item">
                                <div class="contact-label">Trial Steward:</div>
                                <div class="contact-value">_______________</div>
                            </div>
                            <div class="contact-item">
                                <div class="contact-label">Phone:</div>
                                <div class="contact-value">_______________</div>
                            </div>
                            <div class="contact-item">
                                <div class="contact-label">Host Contact:</div>
                                <div class="contact-value">${trial.hostPhone || '_______________'}</div>
                            </div>
                            <div class="contact-item">
                                <div class="contact-label">Emergency Services:</div>
                                <div class="contact-value">911</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static generateJudgeAssignmentRows(trial) {
        if (!trial.judges || trial.judges.length === 0) {
            return '<tr><td colspan="5">No judges assigned</td></tr>';
        }

        return trial.judges.map(judge => `
            <tr>
                <td>${judge.name}</td>
                <td>${judge.certification || 'TBD'}</td>
                <td>${trial.classes?.join(', ') || 'TBD'}</td>
                <td>${judge.email || 'TBD'}</td>
                <td>TBD</td>
            </tr>
        `).join('');
    }

    static generateScheduleRows(trial) {
        if (!trial.classes || trial.classes.length === 0) {
            return '<tr><td colspan="6">No classes scheduled</td></tr>';
        }

        return trial.classes.map((className, index) => `
            <tr>
                <td>TBD</td>
                <td>${className}</td>
                <td>${trial.judges?.[0]?.name || 'TBD'}</td>
                <td>TBD</td>
                <td>Ring ${index + 1}</td>
                <td></td>
            </tr>
        `).join('');
    }

    // Generate Judge Expense Report
    static generateJudgeExpenseReport(trial, judge) {
        return `
            <div class="judge-expense-report">
                <div class="expense-header">
                    <div class="header-logo">
                        <img src="images/cwags-logo.png" alt="C-WAGS" class="signature-logo">
                    </div>
                    <div class="header-title">
                        <h2>C-WAGS JUDGE EXPENSE REPORT</h2>
                        <p>Reimbursement Request Form</p>
                    </div>
                </div>

                <div class="expense-form">
                    <!-- Judge and Trial Information -->
                    <div class="form-section">
                        <div class="section-title">JUDGE AND TRIAL INFORMATION</div>
                        
                        <div class="form-row">
                            <div class="form-field">
                                <div class="field-label">Judge Name:</div>
                                <div class="field-value">${judge?.name || '_______________'}</div>
                            </div>
                            <div class="form-field">
                                <div class="field-label">Address:</div>
                                <div class="field-value">_______________</div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-field">
                                <div class="field-label">Trial Name:</div>
                                <div class="field-value">${trial.name}</div>
                            </div>
                            <div class="form-field">
                                <div class="field-label">Trial Date:</div>
                                <div class="field-value">${new Date(trial.date).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Expense Categories -->
                    <div class="form-section">
                        <div class="section-title">EXPENSE BREAKDOWN</div>
                        
                        <table class="expense-table">
                            <thead>
                                <tr>
                                    <th>Expense Category</th>
                                    <th>Amount</th>
                                    <th>Description</th>
                                    <th>Receipt Required</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Mileage</td>
                                    <td>$_______</td>
                                    <td>_____ miles @ $0.65/mile</td>
                                    <td>Trip log</td>
                                </tr>
                                <tr>
                                    <td>Lodging</td>
                                    <td>$_______</td>
                                    <td>_________________</td>
                                    <td>Yes</td>
                                </tr>
                                <tr>
                                    <td>Meals</td>
                                    <td>$_______</td>
                                    <td>_________________</td>
                                    <td>Yes (>$25)</td>
                                </tr>
                                <tr>
                                    <td>Airfare</td>
                                    <td>$_______</td>
                                    <td>_________________</td>
                                    <td>Yes</td>
                                </tr>
                                <tr>
                                    <td>Other</td>
                                    <td>$_______</td>
                                    <td>_________________</td>
                                    <td>Yes</td>
                                </tr>
                                <tr style="font-weight: bold; border-top: 2px solid #000;">
                                    <td>TOTAL</td>
                                    <td>$_______</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Signatures -->
                    <div class="form-section">
                        <div class="section-title">CERTIFICATION AND APPROVAL</div>
                        
                        <div class="signature-section">
                            <div class="signature-block">
                                <div class="signature-line"></div>
                                <div class="signature-label">Judge Signature / Date</div>
                                <div class="signature-text">I certify that the above expenses were incurred in connection with my judging assignment and are accurate and complete.</div>
                            </div>
                            
                            <div class="signature-block">
                                <div class="signature-line"></div>
                                <div class="signature-label">Trial Host Signature / Date</div>
                                <div class="signature-text">I approve the above expenses for reimbursement.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
