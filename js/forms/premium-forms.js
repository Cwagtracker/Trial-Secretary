// js/forms/premium-form.js
class PremiumForm {
    static generate(trial) {
        const formattedDate = new Date(trial.date).toLocaleDateString();
        const entryDeadline = new Date(trial.entryDeadline).toLocaleDateString();
        
        return `
            <div class="premium-form">
                <div class="premium-header">
                    <div class="header-logo">
                        <img src="images/cwags-logo.png" alt="C-WAGS" class="signature-logo">
                    </div>
                    <div class="header-title">
                        <h1>${trial.name}</h1>
                        <h2>PREMIUM & TRIAL INFORMATION</h2>
                        <p class="trial-date">${formattedDate}</p>
                    </div>
                </div>

                <div class="premium-content">
                    <!-- Quick Trial Facts -->
                    <div class="quick-facts">
                        <div class="fact-box">
                            <h4>📅 IMPORTANT DATES</h4>
                            <div class="fact-item"><strong>Trial Date:</strong> ${formattedDate}</div>
                            <div class="fact-item"><strong>Entry Deadline:</strong> ${entryDeadline}</div>
                            <div class="fact-item"><strong>Check-in:</strong> ${trial.schedule?.checkInTime || 'TBD'}</div>
                            <div class="fact-item"><strong>Start Time:</strong> ${trial.schedule?.startTime || 'TBD'}</div>
                        </div>
                        
                        <div class="fact-box">
                            <h4>💰 ENTRY FEES</h4>
                            <div class="fact-item"><strong>Regular Entry:</strong> $${trial.fees?.regular || '0.00'}</div>
                            <div class="fact-item"><strong>FEO Entry:</strong> $${trial.fees?.feo || '0.00'}</div>
                            <div class="fact-item"><strong>Day of Trial:</strong> ${trial.acceptDayOfEntries ? '$' + (trial.fees?.dayOf || '0.00') : 'Not Accepted'}</div>
                            <div class="fact-item"><strong>Entry Limit:</strong> ${trial.entryLimit || 'No Limit'}</div>
                        </div>
                    </div>

                    <!-- Host Information -->
                    <div class="info-section">
                        <h3>🏢 HOST INFORMATION</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>Host:</strong> ${trial.host}
                            </div>
                            <div class="info-item">
                                <strong>Contact:</strong> ${trial.hostEmail || 'TBD'}
                            </div>
                            <div class="info-item">
                                <strong>Phone:</strong> ${trial.hostPhone || 'TBD'}
                            </div>
                            <div class="info-item">
                                <strong>Trial Type:</strong> ${this.formatTrialType(trial.type)}
                            </div>
                        </div>
                        
                        ${trial.contactInfo ? `
                            <div class="additional-contact">
                                <strong>Additional Contact Information:</strong><br>
                                ${trial.contactInfo}
                            </div>
                        ` : ''}
                    </div>

                    <!-- Location Information -->
                    <div class="info-section">
                        <h3>📍 LOCATION & VENUE</h3>
                        <div class="venue-details">
                            <div class="venue-name">${trial.venue?.name || 'Venue TBD'}</div>
                            <div class="venue-address">
                                ${trial.venue?.address || ''}<br>
                                ${trial.venue?.city || ''}, ${trial.venue?.state || ''} ${trial.venue?.zip || ''}
                            </div>
                            
                            ${trial.venue?.directions ? `
                                <div class="venue-directions">
                                    <strong>Directions:</strong><br>
                                    ${trial.venue.directions}
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Judges Information -->
                    <div class="info-section">
                        <h3>👨‍⚖️ JUDGES</h3>
                        <div class="judges-list">
                            ${this.generateJudgesList(trial.judges)}
                        </div>
                    </div>

                    <!-- Classes Offered -->
                    <div class="info-section">
                        <h3>🎯 CLASSES OFFERED</h3>
                        <div class="classes-grid">
                            ${this.generateClassesGrid(trial.classes)}
                        </div>
                        
                        ${this.generateClassDescriptions()}
                    </div>

                    <!-- Schedule Information -->
                    <div class="info-section">
                        <h3>⏰ SCHEDULE</h3>
                        <div class="schedule-info">
                            <div class="schedule-item">
                                <strong>Check-in Time:</strong> ${trial.schedule?.checkInTime || 'TBD'}
                            </div>
                            <div class="schedule-item">
                                <strong>First Class Starts:</strong> ${trial.schedule?.startTime || 'TBD'}
                            </div>
                            <div class="schedule-item">
                                <strong>Lunch Break:</strong> ${trial.schedule?.lunchBreak || 'TBD'}
                            </div>
                        </div>
                        
                        <div class="schedule-note">
                            <strong>Note:</strong> Detailed running orders will be available closer to the trial date. 
                            Please arrive by check-in time to ensure your team is ready for competition.
                        </div>
                    </div>

                    <!-- Awards Information -->
                    <div class="info-section">
                        <h3>🏆 AWARDS & RECOGNITION</h3>
                        <div class="awards-content">
                            ${trial.awardsInfo || 'Awards information will be announced closer to the trial date.'}
                        </div>
                    </div>

                    <!-- Entry Instructions -->
                    <div class="info-section">
                        <h3>📝 HOW TO ENTER</h3>
                        <div class="entry-instructions">
                            <ol>
                                <li>Complete the entry form for each dog/handler team</li>
                                <li>Submit entries by ${entryDeadline}</li>
                                <li>Include payment with entry (check, PayPal, or online payment)</li>
                                <li>Wait for entry confirmation</li>
                                <li>Arrive on trial day by check-in time</li>
                            </ol>
                            
                            <div class="payment-info">
                                <strong>Payment Methods:</strong>
                                <ul>
                                    <li>Check payable to: ${trial.host}</li>
                                    <li>PayPal: ${trial.hostEmail || 'TBD'}</li>
                                    <li>Online entry system (if available)</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Special Instructions -->
                    ${trial.specialInstructions ? `
                        <div class="info-section">
                            <h3>⚠️ SPECIAL INSTRUCTIONS</h3>
                            <div class="special-instructions">
                                ${trial.specialInstructions}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Rules and Requirements -->
                    <div class="info-section">
                        <h3>📋 RULES & REQUIREMENTS</h3>
                        <div class="rules-content">
                            <div class="rule-section">
                                <strong>Dog Requirements:</strong>
                                <ul>
                                    <li>Must be at least 18 months old for regular classes</li>
                                    <li>Current vaccinations required</li>
                                    <li>Dogs in season welcome but must notify host</li>
                                    <li>No aggressive dogs allowed</li>
                                </ul>
                            </div>
                            
                            <div class="rule-section">
                                <strong>Handler Requirements:</strong>
                                <ul>
                                    <li>All handlers must sign waiver</li>
                                    <li>Handlers under 18 must have parent/guardian signature</li>
                                    <li>Appropriate attire required (closed-toe shoes, etc.)</li>
                                </ul>
                            </div>
                            
                            <div class="rule-section">
                                <strong>Trial Rules:</strong>
                                <ul>
                                    <li>Current C-WAGS rules apply</li>
                                    <li>Judge's decisions are final</li>
                                    <li>Sportsmanlike conduct required</li>
                                    <li>Clean up after your dog</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Contact for Questions -->
                    <div class="info-section">
                        <h3>❓ QUESTIONS?</h3>
                        <div class="contact-for-questions">
                            <p>For questions about this trial, please contact:</p>
                            <div class="contact-details">
                                <strong>${trial.host}</strong><br>
                                Email: ${trial.hostEmail || 'TBD'}<br>
                                Phone: ${trial.hostPhone || 'TBD'}
                            </div>
                            
                            <p>For general C-WAGS questions, visit: <strong>www.c-wags.org</strong></p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="premium-footer">
                        <div class="footer-text">
                            <p>We look forward to seeing you and your dogs at ${trial.name}!</p>
                            <p><em>Generated: ${new Date().toLocaleDateString()}</em></p>
                        </div>
                        <div class="footer-logo">
                            <img src="images/cwags-logo.png" alt="C-WAGS" class="signature-logo">
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
            return '<div class="judge-item">Judges to be announced</div>';
        }

        return judges.map(judge => `
            <div class="judge-item">
                <div class="judge-name">${judge.name}</div>
                <div class="judge-cert">${judge.certification || 'Certification TBD'}</div>
                ${judge.bio ? `<div class="judge-bio">${judge.bio}</div>` : ''}
            </div>
        `).join('');
    }

    static generateClassesGrid(classes) {
        if (!classes || classes.length === 0) {
            return '<div class="class-item">Classes to be announced</div>';
        }

        return classes.map(className => `
            <div class="class-item">
                <div class="class-name">${className}</div>
            </div>
        `).join('');
    }

    static generateClassDescriptions() {
        return `
            <div class="class-descriptions">
                <h4>Class Descriptions:</h4>
                <div class="description-grid">
                    <div class="class-desc">
                        <strong>Interior:</strong> Dog searches for odor hidden inside a building or enclosed area.
                    </div>
                    <div class="class-desc">
                        <strong>Exterior:</strong> Dog searches for odor hidden in an outdoor environment.
                    </div>
                    <div class="class-desc">
                        <strong>Containers:</strong> Dog searches through a line of identical containers.
                    </div>
                    <div class="class-desc">
                        <strong>Buried:</strong> Dog searches for odor buried underground.
                    </div>
                    <div class="class-desc">
                        <strong>Vehicle:</strong> Dog searches vehicles for hidden odor.
                    </div>
                    <div class="class-desc">
                        <strong>Handler Discrimination:</strong> Handler chooses which hides to point out.
                    </div>
                </div>
            </div>
        `;
    }
}

// js/forms/entry-confirmation.js
class EntryConfirmationForm {
    static generateAll(trial, entries) {
        if (!entries || entries.length === 0) {
            return '<div class="no-entries">No entries to confirm</div>';
        }

        return entries.map(entry => this.generateSingle(trial, entry)).join('\n<div class="page-break"></div>\n');
    }

    static generateSingle(trial, entry) {
        const formattedDate = new Date(trial.date).toLocaleDateString();
        const confirmationNumber = this.generateConfirmationNumber(entry);
        
        return `
            <div class="entry-confirmation">
                <div class="confirmation-header">
                    <div class="header-logo">
                        <img src="images/cwags-logo.png" alt="C-WAGS" class="signature-logo">
                    </div>
                    <div class="header-title">
                        <h2>ENTRY CONFIRMATION</h2>
                        <p>C-WAGS Trial Entry Accepted</p>
                    </div>
                    <div class="confirmation-number">
                        <strong>Confirmation #: ${confirmationNumber}</strong>
                    </div>
                </div>

                <div class="confirmation-content">
                    <!-- Trial Information -->
                    <div class="info-section">
                        <h3>📅 TRIAL INFORMATION</h3>
                        <div class="trial-info-grid">
                            <div class="info-item">
                                <strong>Trial:</strong> ${trial.name}
                            </div>
                            <div class="info-item">
                                <strong>Date:</strong> ${formattedDate}
                            </div>
                            <div class="info-item">
                                <strong>Location:</strong> ${trial.venue?.name || 'TBD'}
                            </div>
                            <div class="info-item">
                                <strong>Host:</strong> ${trial.host}
                            </div>
                        </div>
                    </div>

                    <!-- Handler & Dog Information -->
                    <div class="info-section">
                        <h3>🐕 ENTRY DETAILS</h3>
                        <div class="entry-details-grid">
                            <div class="handler-info">
                                <h4>Handler Information</h4>
                                <div class="detail-item"><strong>Name:</strong> ${entry.handlerName}</div>
                                <div class="detail-item"><strong>Address:</strong> ${entry.handlerAddress || 'On File'}</div>
                                <div class="detail-item"><strong>Phone:</strong> ${entry.handlerPhone || 'On File'}</div>
                                <div class="detail-item"><strong>Email:</strong> ${entry.handlerEmail || 'On File'}</div>
                                <div class="detail-item"><strong>C-WAGS ID:</strong> ${entry.cwagsId || 'TBD'}</div>
                            </div>
                            
                            <div class="dog-info">
                                <h4>Dog Information</h4>
                                <div class="detail-item"><strong>Name:</strong> ${entry.dogName}</div>
                                <div class="detail-item"><strong>Breed:</strong> ${entry.dogBreed || 'Mixed Breed'}</div>
                                <div class="detail-item"><strong>Sex:</strong> ${entry.dogSex || 'Not Specified'}</div>
                                <div class="detail-item"><strong>Date of Birth:</strong> ${entry.dogDob ? new Date(entry.dogDob).toLocaleDateString() : 'On File'}</div>
                                <div class="detail-item"><strong>Registration:</strong> ${entry.dogRegistration || 'Not Required'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Classes Entered -->
                    <div class="info-section">
                        <h3>🎯 CLASSES ENTERED</h3>
                        <div class="classes-entered">
                            ${this.generateEnteredClasses(entry.classes)}
                        </div>
                        
                        <div class="entry-summary">
                            <div class="summary-item">
                                <strong>Total Classes:</strong> ${entry.classes?.length || 0}
                            </div>
                            <div class="summary-item">
                                <strong>Entry Type:</strong> ${entry.entryType || 'Regular'}
                            </div>
                            <div class="summary-item">
                                <strong>Entry Fee:</strong> ${this.calculateEntryFee(entry, trial)}
                            </div>
                        </div>
                    </div>

                    <!-- Payment Information -->
                    <div class="info-section">
                        <h3>💰 PAYMENT INFORMATION</h3>
                        <div class="payment-info">
                            <div class="payment-item">
                                <strong>Entry Fee:</strong> ${this.calculateEntryFee(entry, trial)}
                            </div>
                            <div class="payment-item">
                                <strong>Payment Method:</strong> ${entry.paymentMethod || 'TBD'}
                            </div>
                            <div class="payment-item">
                                <strong>Payment Status:</strong> ${entry.paymentStatus || 'Pending'}
                            </div>
                            <div class="payment-item">
                                <strong>Transaction ID:</strong> ${entry.transactionId || 'TBD'}
                            </div>
                        </div>
                    </div>

                    <!-- Important Information -->
                    <div class="info-section important-info">
                        <h3>⚠️ IMPORTANT TRIAL DAY INFORMATION</h3>
                        
                        <div class="important-grid">
                            <div class="important-item">
                                <h4>📍 Arrival Instructions</h4>
                                <ul>
                                    <li>Arrive by: ${trial.schedule?.checkInTime || 'TBD'}</li>
                                    <li>Check in at trial headquarters</li>
                                    <li>Confirm your entry and get running order</li>
                                    <li>Walk the search areas if time permits</li>
                                </ul>
                            </div>
                            
                            <div class="important-item">
                                <h4>📋 What to Bring</h4>
                                <ul>
                                    <li>This confirmation letter</li>
                                    <li>Current vaccination records</li>
                                    <li>Signed waiver (if not already submitted)</li>
                                    <li>Treats and rewards for your dog</li>
                                    <li>Water bowl and leash</li>
                                </ul>
                            </div>
                        </div>

                        <div class="venue-reminder">
                            <h4>📍 Venue Location</h4>
                            <div class="venue-address">
                                ${trial.venue?.name || 'Venue TBD'}<br>
                                ${trial.venue?.address || ''}<br>
                                ${trial.venue?.city || ''}, ${trial.venue?.state || ''} ${trial.venue?.zip || ''}
                            </div>
                            
                            ${trial.venue?.directions ? `
                                <div class="directions">
                                    <strong>Directions:</strong> ${trial.venue.directions}
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Contact Information -->
                    <div class="info-section">
                        <h3>📞 QUESTIONS OR CHANGES</h3>
                        <div class="contact-info">
                            <p>If you need to make changes to your entry or have questions, please contact:</p>
                            
                            <div class="contact-details">
                                <strong>${trial.host}</strong><br>
                                Email: ${trial.hostEmail || 'TBD'}<br>
                                Phone: ${trial.hostPhone || 'TBD'}
                            </div>
                            
                            <div class="contact-note">
                                <strong>Note:</strong> Changes may not be possible closer to the trial date. 
                                Please contact the host as soon as possible if modifications are needed.
                            </div>
                        </div>
                    </div>

                    <!-- Withdrawal Policy -->
                    <div class="info-section policy-section">
                        <h3>🔄 WITHDRAWAL & REFUND POLICY</h3>
                        <div class="policy-content">
                            <ul>
                                <li><strong>14+ days before trial:</strong> Full refund minus $5 processing fee</li>
                                <li><strong>7-13 days before trial:</strong> 50% refund</li>
                                <li><strong>Less than 7 days:</strong> No refund unless space can be filled</li>
                                <li><strong>Day of trial:</strong> No refund</li>
                            </ul>
                            
                            <div class="emergency-note">
                                <strong>Emergency Policy:</strong> Refunds for veterinary emergencies may be considered 
                                with appropriate documentation. Contact the host immediately.
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="confirmation-footer">
                        <div class="footer-message">
                            <h4>🎉 We're Excited to See You!</h4>
                            <p>Thank you for entering ${trial.name}. We look forward to a great day of nose work with you and ${entry.dogName}!</p>
                            
                            <div class="social-reminder">
                                <p>Don't forget to share your trial experience on social media and tag us!</p>
                                <p><strong>C-WAGS:</strong> #CWAGS #NoseWork #DogSport</p>
                            </div>
                        </div>
                        
                        <div class="confirmation-summary">
                            <div class="summary-box">
                                <h4>Quick Reference</h4>
                                <div><strong>Confirmation:</strong> ${confirmationNumber}</div>
                                <div><strong>Trial Date:</strong> ${formattedDate}</div>
                                <div><strong>Check-in:</strong> ${trial.schedule?.checkInTime || 'TBD'}</div>
                                <div><strong>Classes:</strong> ${entry.classes?.length || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static generateConfirmationNumber(entry) {
        // Generate a confirmation number based on entry details
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const entryId = entry.id || Math.random().toString(36).substr(2, 5).toUpperCase();
        return `CW${year}${month}-${entryId}`;
    }

    static generateEnteredClasses(classes) {
        if (!classes || classes.length === 0) {
            return '<div class="no-classes">No classes entered</div>';
        }

        return classes.map(className => `
            <div class="entered-class">
                <div class="class-name">${className}</div>
                <div class="class-status">✓ Confirmed</div>
            </div>
        `).join('');
    }

    static calculateEntryFee(entry, trial) {
        const classCount = entry.classes?.length || 0;
        const baseRate = entry.entryType === 'FEO' ? 
            (trial.fees?.feo || 0) : 
            (trial.fees?.regular || 0);
        
        return (baseRate * classCount).toFixed(2);
    }

    // Generate a simple confirmation email template
    static generateEmailConfirmation(trial, entry) {
        const confirmationNumber = this.generateConfirmationNumber(entry);
        
        return `
            Subject: Entry Confirmation - ${trial.name}

            Dear ${entry.handlerName},

            Your entry for ${trial.name} has been confirmed!

            CONFIRMATION DETAILS:
            Confirmation Number: ${confirmationNumber}
            Trial Date: ${new Date(trial.date).toLocaleDateString()}
            Dog Name: ${entry.dogName}
            Classes: ${entry.classes?.join(', ') || 'TBD'}
            Entry Fee: ${this.calculateEntryFee(entry, trial)}

            TRIAL DAY INFORMATION:
            Location: ${trial.venue?.name || 'TBD'}
            Check-in Time: ${trial.schedule?.checkInTime || 'TBD'}
            Start Time: ${trial.schedule?.startTime || 'TBD'}

            Please bring this confirmation and your dog's vaccination records to the trial.

            Questions? Contact ${trial.host} at ${trial.hostEmail || 'TBD'}

            We look forward to seeing you and ${entry.dogName}!

            Best regards,
            ${trial.host}
            ${trial.name} Host
        `;
    }
}

// js/forms/modification-forms.js
class ModificationForms {
    static generateExerciseModificationForm(trial, entry) {
        return `
            <div class="modification-form">
                <div class="modification-header">
                    <div class="header-logo">
                        <img src="images/cwags-logo.png" alt="C-WAGS" class="signature-logo">
                    </div>
                    <div class="header-title">
                        <h2>C-WAGS EXERCISE MODIFICATION REQUEST</h2>
                        <p>Handler or Dog Accommodation Form</p>
                    </div>
                </div>

                <div class="modification-content">
                    <!-- Trial and Entry Information -->
                    <div class="form-section">
                        <div class="section-title">TRIAL & ENTRY INFORMATION</div>
                        
                        <div class="form-field">
                            <div class="field-label">Trial Name:</div>
                            <div class="field-value">${trial.name}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Trial Date:</div>
                            <div class="field-value">${new Date(trial.date).toLocaleDateString()}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Handler Name:</div>
                            <div class="field-value">${entry?.handlerName || '_______________'}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Dog Name:</div>
                            <div class="field-value">${entry?.dogName || '_______________'}</div>
                        </div>
                    </div>

                    <!-- Modification Request -->
                    <div class="form-section">
                        <div class="section-title">MODIFICATION REQUEST</div>
                        
                        <div class="form-field">
                            <div class="field-label">Type of Modification Needed:</div>
                            <div class="checkbox-section">
                                <div class="checkbox-item">
                                    <input type="checkbox">
                                    <label>Height Modification (Handler)</label>
                                </div>
                                <div class="checkbox-item">
                                    <input type="checkbox">
                                    <label>Mobility Assistance (Handler)</label>
                                </div>
                                <div class="checkbox-item">
                                    <input type="checkbox">
                                    <label>Exercise Modification (Dog)</label>
                                </div>
                                <div class="checkbox-item">
                                    <input type="checkbox">
                                    <label>Time Modification</label>
                                </div>
                                <div class="checkbox-item">
                                    <input type="checkbox">
                                    <label>Other (specify below)</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Detailed Description of Needed Modification:</div>
                            <div class="field-value" style="min-height: 80px; border: 1px solid #000;"></div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Reason for Modification:</div>
                            <div class="field-value" style="min-height: 60px; border: 1px solid #000;"></div>
                        </div>
                    </div>

                    <!-- Medical Documentation -->
                    <div class="form-section">
                        <div class="section-title">MEDICAL DOCUMENTATION (if applicable)</div>
                        
                        <div class="form-field">
                            <div class="field-label">Healthcare Provider:</div>
                            <div class="field-value">_______________</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Documentation Attached:</div>
                            <div class="checkbox-section">
                                <div class="checkbox-item">
                                    <input type="checkbox">
                                    <label>Medical Letter</label>
                                </div>
                                <div class="checkbox-item">
                                    <input type="checkbox">
                                    <label>Veterinary Report</label>
                                </div>
                                <div class="checkbox-item">
                                    <input type="checkbox">
                                    <label>Other Documentation</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Signatures -->
                    <div class="form-section">
                        <div class="section-title">SIGNATURES & APPROVAL</div>
                        
                        <div style="margin: 30px 0;">
                            <div style="display: flex; justify-content: space-between; align-items: end;">
                                <div style="flex: 1; border-bottom: 1px solid #000; margin-right: 20px; height: 20px;"></div>
                                <div style="flex: 1; border-bottom: 1px solid #000; height: 20px;"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 5px;">
                                <div>Handler Signature</div>
                                <div>Date</div>
                            </div>
                        </div>
                        
                        <div style="margin: 30px 0;">
                            <div style="display: flex; justify-content: space-between; align-items: end;">
                                <div style="flex: 1; border-bottom: 1px solid #000; margin-right: 20px; height: 20px;"></div>
                                <div style="flex: 1; border-bottom: 1px solid #000; height: 20px;"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 5px;">
                                <div>Judge Approval</div>
                                <div>Date</div>
                            </div>
                        </div>
                        
                        <div style="margin: 30px 0;">
                            <div style="display: flex; justify-content: space-between; align-items: end;">
                                <div style="flex: 1; border-bottom: 1px solid #000; margin-right: 20px; height: 20px;"></div>
                                <div style="flex: 1; border-bottom: 1px solid #000; height: 20px;"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 5px;">
                                <div>Trial Host Approval</div>
                                <div>Date</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
