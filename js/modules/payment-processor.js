// js/core/payment-processor.js
// Payment processing integration for entry management

class PaymentProcessor {
    static config = {
        // Configure your payment processor settings
        processors: {
            paypal: {
                enabled: true,
                sandboxMode: true, // Set to false for production
                clientId: 'YOUR_PAYPAL_CLIENT_ID',
                currency: 'USD'
            },
            stripe: {
                enabled: false,
                publishableKey: 'YOUR_STRIPE_PUBLISHABLE_KEY',
                currency: 'usd'
            },
            square: {
                enabled: false,
                applicationId: 'YOUR_SQUARE_APPLICATION_ID',
                locationId: 'YOUR_SQUARE_LOCATION_ID',
                environment: 'sandbox' // or 'production'
            }
        }
    };

    // Initialize payment processors
    static async init() {
        if (this.config.processors.paypal.enabled) {
            await this.initPayPal();
        }
        
        if (this.config.processors.stripe.enabled) {
            await this.initStripe();
        }
        
        if (this.config.processors.square.enabled) {
            await this.initSquare();
        }
    }

    // PayPal integration
    static async initPayPal() {
        if (typeof paypal === 'undefined') {
            // Load PayPal SDK
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${this.config.processors.paypal.clientId}&currency=${this.config.processors.paypal.currency}`;
            document.head.appendChild(script);
            
            return new Promise((resolve) => {
                script.onload = () => resolve();
            });
        }
    }

    static createPayPalButton(containerId, entry, trial, onSuccess, onError) {
        const fees = entry.entryFees?.total || 0;
        
        if (fees <= 0) {
            onError(new Error('No payment required'));
            return;
        }

        paypal.Buttons({
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: fees.toFixed(2),
                            currency_code: this.config.processors.paypal.currency
                        },
                        description: `Entry fees for ${trial.name} - ${entry.handlerName} & ${entry.dogName}`,
                        custom_id: entry.id,
                        invoice_id: `ENTRY-${entry.id}-${Date.now()}`
                    }],
                    application_context: {
                        brand_name: 'C-WAGS Trial Management',
                        landing_page: 'NO_PREFERENCE',
                        user_action: 'PAY_NOW'
                    }
                });
            },
            onApprove: async (data, actions) => {
                try {
                    const order = await actions.order.capture();
                    
                    // Record payment in entry
                    const paymentRecord = {
                        processor: 'paypal',
                        transactionId: order.id,
                        amount: parseFloat(order.purchase_units[0].amount.value),
                        currency: order.purchase_units[0].amount.currency_code,
                        status: order.status,
                        payerEmail: order.payer.email_address,
                        processedAt: new Date().toISOString(),
                        details: order
                    };
                    
                    // Update entry status
                    entry.paymentRecord = paymentRecord;
                    entry.status = 'paid';
                    entry.paidAt = new Date().toISOString();
                    
                    DataManager.saveEntry(entry);
                    
                    onSuccess(paymentRecord);
                    
                } catch (error) {
                    onError(error);
                }
            },
            onError: (err) => {
                onError(err);
            },
            onCancel: (data) => {
                onError(new Error('Payment cancelled by user'));
            }
        }).render(`#${containerId}`);
    }

    // Stripe integration
    static async initStripe() {
        if (typeof Stripe === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            document.head.appendChild(script);
            
            await new Promise((resolve) => {
                script.onload = () => resolve();
            });
        }
        
        this.stripe = Stripe(this.config.processors.stripe.publishableKey);
    }

    static async createStripePaymentIntent(entry, trial) {
        const fees = entry.entryFees?.total || 0;
        
        if (fees <= 0) {
            throw new Error('No payment required');
        }

        // This would typically call your backend to create a payment intent
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: Math.round(fees * 100), // Stripe uses cents
                currency: this.config.processors.stripe.currency,
                entryId: entry.id,
                trialId: trial.id,
                metadata: {
                    handlerName: entry.handlerName,
                    dogName: entry.dogName,
                    trialName: trial.name
                }
            })
        });

        const { client_secret } = await response.json();
        return client_secret;
    }

    static async processStripePayment(entry, trial, paymentElement) {
        try {
            const clientSecret = await this.createStripePaymentIntent(entry, trial);
            
            const { error, paymentIntent } = await this.stripe.confirmPayment({
                elements: paymentElement,
                clientSecret: clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success`,
                }
            });

            if (error) {
                throw error;
            }

            if (paymentIntent.status === 'succeeded') {
                // Record payment
                const paymentRecord = {
                    processor: 'stripe',
                    transactionId: paymentIntent.id,
                    amount: paymentIntent.amount / 100,
                    currency: paymentIntent.currency,
                    status: paymentIntent.status,
                    processedAt: new Date().toISOString(),
                    details: paymentIntent
                };

                entry.paymentRecord = paymentRecord;
                entry.status = 'paid';
                entry.paidAt = new Date().toISOString();
                
                DataManager.saveEntry(entry);
                
                return paymentRecord;
            }

        } catch (error) {
            throw error;
        }
    }

    // Square integration
    static async initSquare() {
        if (typeof Square === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://sandbox.web.squarecdn.com/v1/square.js'; // Use production URL for live
            document.head.appendChild(script);
            
            await new Promise((resolve) => {
                script.onload = () => resolve();
            });
        }

        this.square = Square.init(this.config.processors.square);
    }

    static async createSquarePayment(entry, trial, containerId) {
        const fees = entry.entryFees?.total || 0;
        
        if (fees <= 0) {
            throw new Error('No payment required');
        }

        const payments = this.square.payments(this.config.processors.square.applicationId, this.config.processors.square.locationId);
        
        const card = await payments.card();
        await card.attach(`#${containerId}`);

        return {
            payments,
            card,
            amount: fees
        };
    }

    // Generic payment status checker
    static async checkPaymentStatus(entry) {
        if (!entry.paymentRecord) {
            return { status: 'unpaid', verified: false };
        }

        const { processor, transactionId } = entry.paymentRecord;

        try {
            switch (processor) {
                case 'paypal':
                    return await this.verifyPayPalPayment(transactionId);
                case 'stripe':
                    return await this.verifyStripePayment(transactionId);
                case 'square':
                    return await this.verifySquarePayment(transactionId);
                default:
                    return { status: 'unknown', verified: false };
            }
        } catch (error) {
            console.error('Payment verification failed:', error);
            return { status: 'error', verified: false, error: error.message };
        }
    }

    static async verifyPayPalPayment(transactionId) {
        // This would call your backend to verify with PayPal API
        const response = await fetch(`/api/verify-paypal-payment/${transactionId}`);
        const data = await response.json();
        
        return {
            status: data.status,
            verified: data.status === 'COMPLETED',
            amount: data.amount,
            currency: data.currency
        };
    }

    static async verifyStripePayment(transactionId) {
        // This would call your backend to verify with Stripe API
        const response = await fetch(`/api/verify-stripe-payment/${transactionId}`);
        const data = await response.json();
        
        return {
            status: data.status,
            verified: data.status === 'succeeded',
            amount: data.amount / 100,
            currency: data.currency
        };
    }

    static async verifySquarePayment(transactionId) {
        // This would call your backend to verify with Square API
        const response = await fetch(`/api/verify-square-payment/${transactionId}`);
        const data = await response.json();
        
        return {
            status: data.status,
            verified: data.status === 'COMPLETED',
            amount: data.amount,
            currency: data.currency
        };
    }

    // Refund processing
    static async processRefund(entry, amount = null, reason = '') {
        if (!entry.paymentRecord) {
            throw new Error('No payment record found');
        }

        const { processor, transactionId } = entry.paymentRecord;
        const refundAmount = amount || entry.paymentRecord.amount;

        try {
            let refundResult;
            
            switch (processor) {
                case 'paypal':
                    refundResult = await this.refundPayPalPayment(transactionId, refundAmount, reason);
                    break;
                case 'stripe':
                    refundResult = await this.refundStripePayment(transactionId, refundAmount, reason);
                    break;
                case 'square':
                    refundResult = await this.refundSquarePayment(transactionId, refundAmount, reason);
                    break;
                default:
                    throw new Error(`Refund not supported for processor: ${processor}`);
            }

            // Record refund in entry
            if (!entry.refunds) {
                entry.refunds = [];
            }
            
            entry.refunds.push({
                refundId: refundResult.refundId,
                amount: refundAmount,
                reason: reason,
                processedAt: new Date().toISOString(),
                processor: processor
            });

            // Update entry status if fully refunded
            const totalRefunded = entry.refunds.reduce((sum, refund) => sum + refund.amount, 0);
            if (totalRefunded >= entry.paymentRecord.amount) {
                entry.status = 'refunded';
            }

            DataManager.saveEntry(entry);
            
            return refundResult;

        } catch (error) {
            throw new Error(`Refund failed: ${error.message}`);
        }
    }

    // Payment method validation
    static validatePaymentMethod(method, amount) {
        const errors = [];

        if (amount <= 0) {
            errors.push('Payment amount must be greater than zero');
        }

        switch (method) {
            case 'paypal':
                if (!this.config.processors.paypal.enabled) {
                    errors.push('PayPal payments are not currently available');
                }
                break;
            case 'stripe':
                if (!this.config.processors.stripe.enabled) {
                    errors.push('Credit card payments are not currently available');
                }
                break;
            case 'square':
                if (!this.config.processors.square.enabled) {
                    errors.push('Square payments are not currently available');
                }
                break;
            case 'check':
            case 'cash':
            case 'venmo':
            case 'zelle':
                // These are manual payment methods - no validation needed
                break;
            default:
                errors.push('Invalid payment method selected');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Generate payment receipt
    static generateReceipt(entry, trial) {
        if (!entry.paymentRecord) {
            return null;
        }

        const payment = entry.paymentRecord;
        
        return {
            receiptNumber: `CWAGS-${entry.id}-${Date.now()}`,
            date: new Date(payment.processedAt).toLocaleDateString(),
            handler: entry.handlerName,
            dog: entry.dogName,
            trial: trial.name,
            trialDate: new Date(trial.date).toLocaleDateString(),
            classes: entry.classes,
            amount: payment.amount,
            currency: payment.currency,
            processor: payment.processor,
            transactionId: payment.transactionId,
            processorStatus: payment.status
        };
    }

    // Helper function to format currency
    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
}

// Payment UI helpers for integration with EntryManagement
class PaymentUI {
    static showPaymentModal(entry, trial, onSuccess, onError) {
        const fees = entry.entryFees?.total || 0;
        
        if (fees <= 0) {
            onError(new Error('No payment required'));
            return;
        }

        const modalHtml = `
            <div class="payment-modal modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Payment for ${trial.name}</h3>
                        <span class="close" onclick="PaymentUI.closePaymentModal()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="payment-summary">
                            <h4>Payment Summary</h4>
                            <div class="payment-details">
                                <div class="payment-item">
                                    <span>Handler:</span>
                                    <span>${entry.handlerName}</span>
                                </div>
                                <div class="payment-item">
                                    <span>Dog:</span>
                                    <span>${entry.dogName}</span>
                                </div>
                                <div class="payment-item">
                                    <span>Classes:</span>
                                    <span>${entry.classes.join(', ')}</span>
                                </div>
                                <div class="payment-item total">
                                    <span>Total Amount:</span>
                                    <span>${PaymentProcessor.formatCurrency(fees)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="payment-methods">
                            <h4>Select Payment Method</h4>
                            <div class="payment-options">
                                ${PaymentProcessor.config.processors.paypal.enabled ? `
                                    <div class="payment-option">
                                        <button class="btn btn-primary" onclick="PaymentUI.processPayPalPayment('${entry.id}', '${trial.id}')">
                                            Pay with PayPal
                                        </button>
                                    </div>
                                ` : ''}
                                
                                ${PaymentProcessor.config.processors.stripe.enabled ? `
                                    <div class="payment-option">
                                        <button class="btn btn-primary" onclick="PaymentUI.processStripePayment('${entry.id}', '${trial.id}')">
                                            Pay with Credit Card
                                        </button>
                                    </div>
                                ` : ''}
                                
                                <div class="payment-option">
                                    <button class="btn btn-secondary" onclick="PaymentUI.recordManualPayment('${entry.id}', '${trial.id}')">
                                        Record Manual Payment
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div id="payment-processing" class="payment-processing" style="display: none;">
                            <div class="processing-spinner"></div>
                            <p>Processing payment...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Store callbacks for later use
        PaymentUI.currentPayment = {
            entry: entry,
            trial: trial,
            onSuccess: onSuccess,
            onError: onError
        };
    }

    static closePaymentModal() {
        const modal = document.querySelector('.payment-modal');
        if (modal) {
            modal.remove();
        }
        PaymentUI.currentPayment = null;
    }

    static async processPayPalPayment(entryId, trialId) {
        const entry = DataManager.getEntry(entryId);
        const trial = DataManager.getTrial(trialId);
        
        try {
            document.getElementById('payment-processing').style.display = 'none';
        }
    }

    static async processStripePayment(entryId, trialId) {
        const entry = DataManager.getEntry(entryId);
        const trial = DataManager.getTrial(trialId);
        
        try {
            document.getElementById('payment-processing').style.display = 'block';
            
            // Create Stripe Elements
            const elements = PaymentProcessor.stripe.elements();
            const cardElement = elements.create('card');
            
            // Create card container
            const cardContainer = document.createElement('div');
            cardContainer.id = 'card-element';
            cardContainer.style.padding = '10px';
            cardContainer.style.border = '1px solid #ccc';
            cardContainer.style.borderRadius = '4px';
            cardContainer.style.marginBottom = '10px';
            
            const submitButton = document.createElement('button');
            submitButton.className = 'btn btn-primary';
            submitButton.textContent = 'Complete Payment';
            submitButton.onclick = async () => {
                try {
                    const paymentRecord = await PaymentProcessor.processStripePayment(entry, trial, elements);
                    PaymentUI.currentPayment.onSuccess(paymentRecord);
                    PaymentUI.closePaymentModal();
                } catch (error) {
                    PaymentUI.currentPayment.onError(error);
                }
            };
            
            const paymentContainer = document.querySelector('.payment-methods');
            paymentContainer.innerHTML = '<h4>Enter Card Details</h4>';
            paymentContainer.appendChild(cardContainer);
            paymentContainer.appendChild(submitButton);
            
            cardElement.mount('#card-element');
            
        } catch (error) {
            PaymentUI.currentPayment.onError(error);
            document.getElementById('payment-processing').style.display = 'none';
        }
    }

    static recordManualPayment(entryId, trialId) {
        const entry = DataManager.getEntry(entryId);
        const trial = DataManager.getTrial(trialId);
        
        const manualPaymentHtml = `
            <div class="manual-payment-form">
                <h4>Record Manual Payment</h4>
                <div class="form-group">
                    <label for="manual-payment-method">Payment Method:</label>
                    <select id="manual-payment-method" required>
                        <option value="check">Check</option>
                        <option value="cash">Cash</option>
                        <option value="venmo">Venmo</option>
                        <option value="zelle">Zelle</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="manual-payment-reference">Reference/Check Number:</label>
                    <input type="text" id="manual-payment-reference" placeholder="Check #, transaction ID, etc.">
                </div>
                <div class="form-group">
                    <label for="manual-payment-amount">Amount:</label>
                    <input type="number" id="manual-payment-amount" step="0.01" 
                           value="${entry.entryFees?.total || 0}" required>
                </div>
                <div class="form-group">
                    <label for="manual-payment-date">Payment Date:</label>
                    <input type="date" id="manual-payment-date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label for="manual-payment-notes">Notes:</label>
                    <textarea id="manual-payment-notes" rows="3" placeholder="Additional notes about this payment"></textarea>
                </div>
                <div class="manual-payment-actions">
                    <button class="btn btn-primary" onclick="PaymentUI.saveManualPayment('${entryId}')">
                        Record Payment
                    </button>
                    <button class="btn btn-secondary" onclick="PaymentUI.closePaymentModal()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.querySelector('.payment-methods').innerHTML = manualPaymentHtml;
    }

    static saveManualPayment(entryId) {
        const entry = DataManager.getEntry(entryId);
        
        const paymentData = {
            method: document.getElementById('manual-payment-method').value,
            reference: document.getElementById('manual-payment-reference').value,
            amount: parseFloat(document.getElementById('manual-payment-amount').value),
            date: document.getElementById('manual-payment-date').value,
            notes: document.getElementById('manual-payment-notes').value
        };
        
        // Validate
        if (!paymentData.method || !paymentData.amount || !paymentData.date) {
            alert('Please fill in all required fields');
            return;
        }
        
        if (paymentData.amount <= 0) {
            alert('Payment amount must be greater than zero');
            return;
        }
        
        // Create manual payment record
        const paymentRecord = {
            processor: 'manual',
            method: paymentData.method,
            transactionId: paymentData.reference || `MANUAL-${Date.now()}`,
            amount: paymentData.amount,
            currency: 'USD',
            status: 'completed',
            paymentDate: paymentData.date,
            notes: paymentData.notes,
            processedAt: new Date().toISOString(),
            recordedBy: Auth.getCurrentUser()?.id
        };
        
        // Update entry
        entry.paymentRecord = paymentRecord;
        entry.status = 'paid';
        entry.paidAt = new Date().toISOString();
        
        DataManager.saveEntry(entry);
        
        if (PaymentUI.currentPayment?.onSuccess) {
            PaymentUI.currentPayment.onSuccess(paymentRecord);
        }
        
        PaymentUI.closePaymentModal();
    }

    static showPaymentReceipt(entry, trial) {
        const receipt = PaymentProcessor.generateReceipt(entry, trial);
        
        if (!receipt) {
            alert('No payment record found');
            return;
        }
        
        const receiptHtml = `
            <div class="payment-receipt-modal modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Payment Receipt</h3>
                        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="receipt-content">
                            <div class="receipt-header">
                                <h2>C-WAGS Payment Receipt</h2>
                                <p>Receipt #: ${receipt.receiptNumber}</p>
                                <p>Date: ${receipt.date}</p>
                            </div>
                            
                            <div class="receipt-details">
                                <table class="receipt-table">
                                    <tr>
                                        <td><strong>Handler:</strong></td>
                                        <td>${receipt.handler}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Dog:</strong></td>
                                        <td>${receipt.dog}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Trial:</strong></td>
                                        <td>${receipt.trial}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Trial Date:</strong></td>
                                        <td>${receipt.trialDate}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Classes:</strong></td>
                                        <td>${receipt.classes.join(', ')}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Amount Paid:</strong></td>
                                        <td><strong>${PaymentProcessor.formatCurrency(receipt.amount, receipt.currency)}</strong></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Payment Method:</strong></td>
                                        <td>${receipt.processor}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Transaction ID:</strong></td>
                                        <td>${receipt.transactionId}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div class="receipt-footer">
                                <p>Thank you for your payment!</p>
                                <p><small>This receipt confirms payment for the above trial entry. 
                                Please bring this receipt or your entry confirmation to the trial.</small></p>
                            </div>
                        </div>
                        
                        <div class="receipt-actions">
                            <button class="btn btn-primary" onclick="PaymentUI.printReceipt()">
                                Print Receipt
                            </button>
                            <button class="btn btn-secondary" onclick="PaymentUI.emailReceipt('${entry.id}')">
                                Email Receipt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', receiptHtml);
    }

    static printReceipt() {
        const receiptContent = document.querySelector('.receipt-content').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Payment Receipt</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .receipt-header { text-align: center; margin-bottom: 30px; }
                    .receipt-table { width: 100%; border-collapse: collapse; }
                    .receipt-table td { padding: 8px; border-bottom: 1px solid #eee; }
                    .receipt-footer { margin-top: 30px; text-align: center; }
                </style>
            </head>
            <body>
                ${receiptContent}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    static async emailReceipt(entryId) {
        const entry = DataManager.getEntry(entryId);
        const trial = DataManager.getTrial(entry.trialId);
        
        try {
            // This would integrate with your email system
            const emailData = {
                to: entry.handlerEmail,
                subject: `Payment Receipt - ${trial.name}`,
                html: `Your payment receipt for ${trial.name} is attached.`,
                // Would include receipt as PDF attachment
            };
            
            // Mock email sending
            console.log('Sending receipt email to:', entry.handlerEmail);
            alert('Receipt emailed successfully!');
            
        } catch (error) {
            alert('Failed to email receipt: ' + error.message);
        }
    }
}

// Integration helper for EntryManagement module
// Add these methods to the EntryManagement class:

/*
// Add payment button to entry form
static addPaymentButton(entry, trial) {
    const fees = entry.entryFees?.total || 0;
    
    if (fees <= 0) return '';
    
    return `
        <div class="payment-section">
            <h4>Payment</h4>
            <div class="payment-status">
                ${entry.status === 'paid' ? `
                    <div class="payment-completed">
                        <span class="status paid">✓ Payment Completed</span>
                        <button class="btn btn-secondary btn-sm" onclick="PaymentUI.showPaymentReceipt(EntryManagement.currentEntry, EntryManagement.selectedTrial)">
                            View Receipt
                        </button>
                    </div>
                ` : `
                    <div class="payment-pending">
                        <span class="payment-amount">Amount Due: ${PaymentProcessor.formatCurrency(fees)}</span>
                        <button class="btn btn-primary" onclick="EntryManagement.processPayment()">
                            Pay Now
                        </button>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Add to EntryManagement class
static processPayment() {
    if (!this.currentEntry || !this.selectedTrial) {
        App.showAlert('Please save the entry first', 'warning');
        return;
    }
    
    PaymentUI.showPaymentModal(
        this.currentEntry,
        this.selectedTrial,
        (paymentRecord) => {
            App.showAlert('Payment processed successfully!', 'success');
            this.currentEntry.paymentRecord = paymentRecord;
            this.currentEntry.status = 'paid';
            this.loadEntriesList(); // Refresh the list
        },
        (error) => {
            App.handleError(error, 'Payment Processing');
        }
    );
}

// Add payment status checking to bulk operations
static async checkAllPaymentStatuses() {
    const entries = DataManager.getEntries().filter(entry => entry.paymentRecord);
    
    if (entries.length === 0) {
        App.showAlert('No entries with payment records found', 'info');
        return;
    }
    
    App.showLoading('Verifying payments...');
    
    let verified = 0;
    let failed = 0;
    
    for (const entry of entries) {
        try {
            const status = await PaymentProcessor.checkPaymentStatus(entry);
            
            if (status.verified) {
                verified++;
                if (entry.status !== 'paid') {
                    entry.status = 'paid';
                    DataManager.saveEntry(entry);
                }
            } else {
                failed++;
                console.warn('Payment verification failed for entry:', entry.id, status);
            }
            
        } catch (error) {
            failed++;
            console.error('Payment check failed for entry:', entry.id, error);
        }
    }
    
    App.hideLoading();
    App.showAlert(`Payment verification complete: ${verified} verified, ${failed} failed`, 
                  failed > 0 ? 'warning' : 'success');
    
    this.loadEntriesList(); // Refresh the list
}
*/

// Initialize payment processing when the module loads
document.addEventListener('DOMContentLoaded', () => {
    PaymentProcessor.init().catch(console.error);
});'block';
            
            // Create PayPal button container
            const paypalContainer = document.createElement('div');
            paypalContainer.id = 'paypal-button-container';
            document.querySelector('.payment-methods').appendChild(paypalContainer);
            
            PaymentProcessor.createPayPalButton(
                'paypal-button-container',
                entry,
                trial,
                (paymentRecord) => {
                    PaymentUI.currentPayment.onSuccess(paymentRecord);
                    PaymentUI.closePaymentModal();
                },
                (error) => {
                    PaymentUI.currentPayment.onError(error);
                    document.getElementById('payment-processing').style.display = 'none';
                }
            );
            
        } catch (error) {
            PaymentUI.currentPayment.onError(error);
            document.getElementById('payment-processing').style.display =
