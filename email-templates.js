// js/core/email-templates.js
// Email template system for entry management integration

class EmailTemplates {
    static getEntryConfirmation(entry, trial) {
        const classesText = entry.classes.join(', ');
        const fees = entry.entryFees?.total || 0;
        
        return {
            subject: `Entry Confirmation - ${trial.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #2c3e50; color: white; padding: 20px; text-align: center;">
                        <h1>C-WAGS Entry Confirmation</h1>
                    </div>
                    
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #2c3e50;">Thank you for your entry!</h2>
                        
                        <p>Dear ${entry.handlerFirstName},</p>
                        
                        <p>We have received your entry for <strong>${trial.name}</strong>. Here are your entry details:</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #3498db; margin-top: 0;">Entry Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 8px 0; font-weight: bold;">Handler:</td>
                                    <td style="padding: 8px 0;">${entry.handlerName}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 8px 0; font-weight: bold;">Dog:</td>
                                    <td style="padding: 8px 0;">${entry.dogName}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 8px 0; font-weight: bold;">Registration #:</td>
                                    <td style="padding: 8px 0;">${entry.registrationNumber}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 8px 0; font-weight: bold;">Classes:</td>
                                    <td style="padding: 8px 0;">${classesText}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 8px 0; font-weight: bold;">Jump Height:</td>
                                    <td style="padding: 8px 0;">${entry.jumpHeight}"</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 8px 0; font-weight: bold;">Entry Type:</td>
                                    <td style="padding: 8px 0;">${entry.entryType.toUpperCase()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-weight: bold;">Total Fees:</td>
                                    <td style="padding: 8px 0; font-weight: bold; color: #27ae60;">$${fees.toFixed(2)}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #3498db; margin-top: 0;">Trial Information</h3>
                            <p><strong>Date:</strong> ${new Date(trial.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</p>
                            <p><strong>Location:</strong> ${trial.venue?.name}<br>
                            ${trial.venue?.address}<br>
                            ${trial.venue?.city}, ${trial.venue?.state} ${trial.venue?.zip || ''}</p>
                            <p><strong>Check-in Time:</strong> ${trial.schedule?.checkInTime || 'TBD'}</p>
                            <p><strong>Trial Start:</strong> ${trial.schedule?.startTime || 'TBD'}</p>
                        </div>
                        
                        ${fees > 0 ? `
                            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                                <h3 style="color: #856404; margin-top: 0;">Payment Required</h3>
                                <p>Your entry fees total <strong>$${fees.toFixed(2)}</strong>. 
                                Payment must be received by the trial date. 
                                Payment method: <strong>${entry.paymentMethod}</strong></p>
                                ${entry.paymentReference ? `<p>Reference: ${entry.paymentReference}</p>` : ''}
                            </div>
                        ` : ''}
                        
                        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                            <h3 style="color: #155724; margin-top: 0;">What's Next?</h3>
                            <ul style="color: #155724;">
                                <li>You'll receive running orders 1-2 days before the trial</li>
                                <li>Bring current vaccination records and registration papers</li>
                                <li>Arrive at check-in time with your dog ready to compete</li>
                                <li>Have fun and good luck!</li>
                            </ul>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #3498db; margin-top: 0;">Contact Information</h3>
                            <p><strong>Trial Host:</strong> ${trial.host}</p>
                            <p><strong>Email:</strong> ${trial.hostEmail}</p>
                            ${trial.hostPhone ? `<p><strong>Phone:</strong> ${trial.hostPhone}</p>` : ''}
                            ${trial.contactInfo ? `<p><strong>Emergency Contact:</strong> ${trial.contactInfo}</p>` : ''}
                        </div>
                        
                        <p style="margin-top: 30px;">If you have any questions or need to make changes to your entry, please contact the trial host as soon as possible.</p>
                        
                        <p>Best regards,<br>
                        The C-WAGS Trial Management Team</p>
                    </div>
                    
                    <div style="background: #2c3e50; color: white; padding: 15px; text-align: center; font-size: 12px;">
                        <p>This is an automated confirmation email from the C-WAGS Trial Management System.</p>
                    </div>
                </div>
            `,
            text: `
C-WAGS Entry Confirmation - ${trial.name}

Dear ${entry.handlerFirstName},

We have received your entry for ${trial.name}. Here are your entry details:

Handler: ${entry.handlerName}
Dog: ${entry.dogName}
Registration #: ${entry.registrationNumber}
Classes: ${classesText}
Jump Height: ${entry.jumpHeight}"
Entry Type: ${entry.entryType.toUpperCase()}
Total Fees: ${fees.toFixed(2)}

Trial Information:
Date: ${new Date(trial.date).toLocaleDateString()}
Location: ${trial.venue?.name}
${trial.venue?.address}
${trial.venue?.city}, ${trial.venue?.state} ${trial.venue?.zip || ''}
Check-in Time: ${trial.schedule?.checkInTime || 'TBD'}
Trial Start: ${trial.schedule?.startTime || 'TBD'}

${fees > 0 ? `Payment Required: ${fees.toFixed(2)} via ${entry.paymentMethod}` : ''}

Contact: ${trial.host} - ${trial.hostEmail}

If you have any questions, please contact the trial host.

Best regards,
The C-WAGS Trial Management Team
            `
        };
    }

    static getPaymentReminder(entry, trial) {
        const fees = entry.entryFees?.total || 0;
        const daysUntilTrial = Math.ceil((new Date(trial.date) - new Date()) / (1000 * 60 * 60 * 24));
        
        return {
            subject: `Payment Reminder - ${trial.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #f39c12; color: white; padding: 20px; text-align: center;">
                        <h1>Payment Reminder</h1>
                    </div>
                    
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #2c3e50;">Payment Due for ${trial.name}</h2>
                        
                        <p>Dear ${entry.handlerFirstName},</p>
                        
                        <p>This is a friendly reminder that payment is due for your entry in <strong>${trial.name}</strong>.</p>
                        
                        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                            <h3 style="color: #856404; margin-top: 0;">Payment Details</h3>
                            <p><strong>Amount Due:</strong> ${fees.toFixed(2)}</p>
                            <p><strong>Payment Method:</strong> ${entry.paymentMethod}</p>
                            ${entry.paymentReference ? `<p><strong>Reference:</strong> ${entry.paymentReference}</p>` : ''}
                            <p><strong>Trial Date:</strong> ${new Date(trial.date).toLocaleDateString()} (${daysUntilTrial} days)</p>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #3498db; margin-top: 0;">Your Entry</h3>
                            <p><strong>Handler:</strong> ${entry.handlerName}</p>
                            <p><strong>Dog:</strong> ${entry.dogName}</p>
                            <p><strong>Classes:</strong> ${entry.classes.join(', ')}</p>
                        </div>
                        
                        <p>Please submit your payment as soon as possible to secure your entry. If you have already sent payment, please disregard this reminder.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #3498db; margin-top: 0;">Contact Information</h3>
                            <p><strong>Trial Host:</strong> ${trial.host}</p>
                            <p><strong>Email:</strong> ${trial.hostEmail}</p>
                            ${trial.hostPhone ? `<p><strong>Phone:</strong> ${trial.hostPhone}</p>` : ''}
                        </div>
                        
                        <p>Thank you for your entry!</p>
                        
                        <p>Best regards,<br>
                        The C-WAGS Trial Management Team</p>
                    </div>
                </div>
            `
        };
    }

    static getTrialReminder(entry, trial) {
        const daysUntilTrial = Math.ceil((new Date(trial.date) - new Date()) / (1000 * 60 * 60 * 24));
        
        return {
            subject: `Trial Reminder - ${trial.name} in ${daysUntilTrial} days`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #27ae60; color: white; padding: 20px; text-align: center;">
                        <h1>Trial Reminder</h1>
                        <p style="margin: 0; font-size: 18px;">${daysUntilTrial} days to go!</p>
                    </div>
                    
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #2c3e50;">${trial.name} is Coming Up!</h2>
                        
                        <p>Dear ${entry.handlerFirstName},</p>
                        
                        <p>Just a friendly reminder that <strong>${trial.name}</strong> is coming up in ${daysUntilTrial} days!</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #3498db; margin-top: 0;">Trial Details</h3>
                            <p><strong>Date:</strong> ${new Date(trial.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</p>
                            <p><strong>Check-in:</strong> ${trial.schedule?.checkInTime || 'TBD'}</p>
                            <p><strong>Trial Start:</strong> ${trial.schedule?.startTime || 'TBD'}</p>
                            <p><strong>Location:</strong><br>
                            ${trial.venue?.name}<br>
                            ${trial.venue?.address}<br>
                            ${trial.venue?.city}, ${trial.venue?.state} ${trial.venue?.zip || ''}</p>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #3498db; margin-top: 0;">Your Entry</h3>
                            <p><strong>Dog:</strong> ${entry.dogName}</p>
                            <p><strong>Classes:</strong> ${entry.classes.join(', ')}</p>
                            <p><strong>Jump Height:</strong> ${entry.jumpHeight}"</p>
                            ${entry.specialNeeds ? `<p><strong>Special Needs:</strong> ${entry.specialNeeds}</p>` : ''}
                        </div>
                        
                        <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
                            <h3 style="color: #0c5460; margin-top: 0;">Preparation Checklist</h3>
                            <ul style="color: #0c5460;">
                                <li>Current vaccination records</li>
                                <li>Registration papers or proof of registration</li>
                                <li>Collar and leash for your dog</li>
                                <li>Water and treats for your dog</li>
                                <li>Chair or crate for ringside</li>
                                <li>Entry confirmation (this email)</li>
                            </ul>
                        </div>
                        
                        ${trial.venue?.directions ? `
                            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #3498db; margin-top: 0;">Directions & Parking</h3>
                                <p>${trial.venue.directions}</p>
                            </div>
                        ` : ''}
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #3498db; margin-top: 0;">Contact Information</h3>
                            <p><strong>Trial Host:</strong> ${trial.host}</p>
                            <p><strong>Email:</strong> ${trial.hostEmail}</p>
                            ${trial.hostPhone ? `<p><strong>Phone:</strong> ${trial.hostPhone}</p>` : ''}
                        </div>
                        
                        <p>We're looking forward to seeing you and ${entry.dogName} at the trial. Good luck!</p>
                        
                        <p>Best regards,<br>
                        The C-WAGS Trial Management Team</p>
                    </div>
                </div>
            `
        };
    }

    static getEntryWithdrawal(entry, trial) {
        return {
            subject: `Entry Withdrawal Confirmation - ${trial.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
                        <h1>Entry Withdrawal Confirmed</h1>
                    </div>
                    
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #2c3e50;">Entry Withdrawal Confirmation</h2>
                        
                        <p>Dear ${entry.handlerFirstName},</p>
                        
                        <p>We have processed your withdrawal from <strong>${trial.name}</strong>.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #6c757d; margin-top: 0;">Withdrawn Entry</h3>
                            <p><strong>Handler:</strong> ${entry.handlerName}</p>
                            <p><strong>Dog:</strong> ${entry.dogName}</p>
                            <p><strong>Classes:</strong> ${entry.classes.join(', ')}</p>
                            <p><strong>Withdrawal Date:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                        
                        <p>If you paid entry fees, please contact the trial host regarding refund arrangements according to the trial's refund policy.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #3498db; margin-top: 0;">Contact Information</h3>
                            <p><strong>Trial Host:</strong> ${trial.host}</p>
                            <p><strong>Email:</strong> ${trial.hostEmail}</p>
                            ${trial.hostPhone ? `<p><strong>Phone:</strong> ${trial.hostPhone}</p>` : ''}
                        </div>
                        
                        <p>We hope to see you at future C-WAGS trials!</p>
                        
                        <p>Best regards,<br>
                        The C-WAGS Trial Management Team</p>
                    </div>
                </div>
            `
        };
    }

    static getStatusUpdate(entry, trial, newStatus, oldStatus) {
        const statusMessages = {
            'confirmed': 'Your entry has been confirmed!',
            'paid': 'Payment received - thank you!',
            'checked-in': 'Successfully checked in for the trial',
            'cancelled': 'Entry has been cancelled'
        };

        const statusColors = {
            'confirmed': '#17a2b8',
            'paid': '#28a745',
            'checked-in': '#6f42c1',
            'cancelled': '#dc3545'
        };

        return {
            subject: `Entry Status Update - ${trial.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: ${statusColors[newStatus] || '#6c757d'}; color: white; padding: 20px; text-align: center;">
                        <h1>Entry Status Update</h1>
                    </div>
                    
                    <div style="padding: 30px; background: #f8f9fa;">
                        <h2 style="color: #2c3e50;">${statusMessages[newStatus] || 'Entry status updated'}</h2>
                        
                        <p>Dear ${entry.handlerFirstName},</p>
                        
                        <p>Your entry status for <strong>${trial.name}</strong> has been updated.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #3498db; margin-top: 0;">Status Change</h3>
                            <p><strong>Previous Status:</strong> ${oldStatus}</p>
                            <p><strong>New Status:</strong> <span style="color: ${statusColors[newStatus]}; font-weight: bold;">${newStatus}</span></p>
                            <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #3498db; margin-top: 0;">Entry Details</h3>
                            <p><strong>Handler:</strong> ${entry.handlerName}</p>
                            <p><strong>Dog:</strong> ${entry.dogName}</p>
                            <p><strong>Classes:</strong> ${entry.classes.join(', ')}</p>
                        </div>
                        
                        <p>If you have any questions about this status change, please contact the trial host.</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #3498db; margin-top: 0;">Contact Information</h3>
                            <p><strong>Trial Host:</strong> ${trial.host}</p>
                            <p><strong>Email:</strong> ${trial.hostEmail}</p>
                            ${trial.hostPhone ? `<p><strong>Phone:</strong> ${trial.hostPhone}</p>` : ''}
                        </div>
                        
                        <p>Thank you for participating in C-WAGS!</p>
                        
                        <p>Best regards,<br>
                        The C-WAGS Trial Management Team</p>
                    </div>
                </div>
            `
        };
    }

    // Email service integration helper
    static async sendEmail(emailData, recipientEmail) {
        // This would integrate with your email service (SendGrid, AWS SES, etc.)
        console.log('Sending email to:', recipientEmail);
        console.log('Subject:', emailData.subject);
        
        // Example integration with a hypothetical email service:
        /*
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${EMAIL_API_KEY}`
                },
                body: JSON.stringify({
                    to: recipientEmail,
                    subject: emailData.subject,
                    html: emailData.html,
                    text: emailData.text
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send email');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Email sending failed:', error);
            throw error;
        }
        */
        
        // For now, return a mock success response
        return Promise.resolve({
            success: true,
            messageId: 'mock-' + Date.now()
        });
    }

    // Bulk email sending
    static async sendBulkEmails(entries, templateFunction, additionalData = {}) {
        const results = {
            sent: 0,
            failed: 0,
            errors: []
        };

        for (const entry of entries) {
            try {
                const trial = DataManager.getTrial(entry.trialId);
                const emailData = templateFunction(entry, trial, additionalData);
                
                await this.sendEmail(emailData, entry.handlerEmail);
                results.sent++;
                
                // Add small delay to avoid overwhelming email service
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                results.failed++;
                results.errors.push({
                    entry: entry.handlerName,
                    email: entry.handlerEmail,
                    error: error.message
                });
            }
        }

        return results;
    }
}

// Integration with EntryManagement module
// Add these methods to the EntryManagement class:

/*
// Update the sendEntryConfirmation method:
static async sendEntryConfirmation(entry) {
    try {
        const trial = DataManager.getTrial(entry.trialId);
        const emailData = EmailTemplates.getEntryConfirmation(entry, trial);
        
        await EmailTemplates.sendEmail(emailData, entry.handlerEmail);
        
        // Update entry status to indicate confirmation was sent
        entry.confirmationSent = true;
        entry.confirmationSentAt = new Date().toISOString();
        DataManager.saveEntry(entry);
        
        App.showAlert('Entry confirmation sent successfully', 'success');
    } catch (error) {
        App.handleError(error, 'Send Confirmation');
    }
}

// Update the bulk email methods:
static async sendConfirmationEmails() {
    const selectedTrial = document.getElementById('trial-filter').value;
    if (!selectedTrial) {
        App.showAlert('Please select a trial first', 'warning');
        return;
    }
    
    const entries = DataManager.getTrialEntries(selectedTrial);
    const unconfirmedEntries = entries.filter(entry => 
        entry.status === 'submitted' && !entry.confirmationSent
    );
    
    if (unconfirmedEntries.length === 0) {
        App.showAlert('No entries need confirmation emails', 'info');
        return;
    }
    
    if (confirm(`Send confirmation emails to ${unconfirmedEntries.length} handlers?`)) {
        try {
            App.showLoading('Sending confirmation emails...');
            
            const results = await EmailTemplates.sendBulkEmails(
                unconfirmedEntries, 
                EmailTemplates.getEntryConfirmation
            );
            
            App.showAlert(
                `Sent ${results.sent} emails successfully. ${results.failed} failed.`,
                results.failed > 0 ? 'warning' : 'success'
            );
            
            if (results.failed > 0) {
                console.log('Failed emails:', results.errors);
            }
            
        } catch (error) {
            App.handleError(error, 'Bulk Email');
        } finally {
            App.hideLoading();
        }
    }
}

static async sendReminderEmails() {
    const selectedTrial = document.getElementById('trial-filter').value;
    if (!selectedTrial) {
        App.showAlert('Please select a trial first', 'warning');
        return;
    }
    
    const entries = DataManager.getTrialEntries(selectedTrial);
    const unpaidEntries = entries.filter(entry => 
        entry.status === 'submitted' && entry.entryFees?.total > 0
    );
    
    if (unpaidEntries.length === 0) {
        App.showAlert('No unpaid entries found', 'info');
        return;
    }
    
    if (confirm(`Send payment reminders to ${unpaidEntries.length} handlers?`)) {
        try {
            App.showLoading('Sending payment reminders...');
            
            const results = await EmailTemplates.sendBulkEmails(
                unpaidEntries, 
                EmailTemplates.getPaymentReminder
            );
            
            App.showAlert(
                `Sent ${results.sent} reminders successfully. ${results.failed} failed.`,
                results.failed > 0 ? 'warning' : 'success'
            );
            
        } catch (error) {
            App.handleError(error, 'Payment Reminders');
        } finally {
            App.hideLoading();
        }
    }
}

static async sendTrialReminders() {
    const selectedTrial = document.getElementById('trial-filter').value;
    if (!selectedTrial) {
        App.showAlert('Please select a trial first', 'warning');
        return;
    }
    
    const trial = DataManager.getTrial(selectedTrial);
    const daysUntilTrial = Math.ceil((new Date(trial.date) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilTrial > 7 || daysUntilTrial < 1) {
        App.showAlert('Trial reminders are typically sent 1-7 days before the trial', 'warning');
        return;
    }
    
    const entries = DataManager.getTrialEntries(selectedTrial);
    const confirmedEntries = entries.filter(entry => 
        entry.status === 'confirmed' || entry.status === 'paid'
    );
    
    if (confirmedEntries.length === 0) {
        App.showAlert('No confirmed entries found', 'info');
        return;
    }
    
    if (confirm(`Send trial reminders to ${confirmedEntries.length} handlers?`)) {
        try {
            App.showLoading('Sending trial reminders...');
            
            const results = await EmailTemplates.sendBulkEmails(
                confirmedEntries, 
                EmailTemplates.getTrialReminder
            );
            
            App.showAlert(
                `Sent ${results.sent} reminders successfully. ${results.failed} failed.`,
                results.failed > 0 ? 'warning' : 'success'
            );
            
        } catch (error) {
            App.handleError(error, 'Trial Reminders');
        } finally {
            App.hideLoading();
        }
    }
}
*/