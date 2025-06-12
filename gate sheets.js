// js/forms/running-orders.js
class RunningOrderForm {
    static generateAll(trial, entries) {
        let html = '<div class="running-orders-collection">';
        
        // Group entries by class and round
        const groupedEntries = this.groupEntriesByClassAndRound(entries, trial);
        
        // Generate running orders for each class/round combination
        trial.classes.forEach(classInfo => {
            const classEntries = groupedEntries[`${classInfo.name}-${classInfo.round}`] || [];
            if (classEntries.length > 0) {
                html += this.generateRunningOrder(trial, classInfo, classEntries);
                html += '<div class="page-break"></div>';
            }
        });
        
        html += '</div>';
        return html;
    }

    static groupEntriesByClassAndRound(entries, trial) {
        const grouped = {};
        
        entries.forEach(entry => {
            entry.classes.forEach(className => {
                const classInfo = trial.classes.find(c => c.name === className);
                if (classInfo) {
                    const key = `${classInfo.name}-${classInfo.round}`;
                    if (!grouped[key]) {
                        grouped[key] = [];
                    }
                    grouped[key].push({...entry, currentClass: classInfo});
                }
            });
        });
        
        // Sort entries within each group by jump height, then by handler name
        Object.keys(grouped).forEach(key => {
            grouped[key].sort((a, b) => {
                if (a.jumpHeight !== b.jumpHeight) {
                    return parseInt(a.jumpHeight) - parseInt(b.jumpHeight);
                }
                return a.handlerName.localeCompare(b.handlerName);
            });
        });
        
        return grouped;
    }

    static generateRunningOrder(trial, classInfo, entries) {
        const judge = trial.judges.find(j => j.classes && j.classes.includes(classInfo.name)) || trial.judges[0];
        
        return `
            <div class="running-order-sheet cwags-form">
                <div class="running-order-header">
                    <div class="header-row-1">
                        <div class="trial-info">
                            <h2>${trial.name}</h2>
                            <h3>Running Order (Gate Sheet)</h3>
                        </div>
                        <div class="cwags-logo">
                            <img src="images/cwags-logo.png" alt="C-WAGS" class="logo-image">
                            <div class="logo-text"><strong>C-WAGS</strong></div>
                        </div>
                    </div>
                    
                    <div class="class-details">
                        <div class="detail-row">
                            <div class="detail-item">
                                <strong>Class:</strong> ${classInfo.name} - ${classInfo.round}
                            </div>
                            <div class="detail-item">
                                <strong>Date:</strong> ${new Date(trial.date).toLocaleDateString()}
                            </div>
                            <div class="detail-item">
                                <strong>Judge:</strong> ${judge}
                            </div>
                        </div>
                        <div class="detail-row">
                            <div class="detail-item">
                                <strong>Location:</strong> ${trial.location}
                            </div>
                            <div class="detail-item">
                                <strong>Host:</strong> ${trial.host}
                            </div>
                            <div class="detail-item">
                                <strong>Total Entries:</strong> ${entries.length}
                            </div>
                        </div>
                    </div>
                </div>

                <table class="running-order-table">
                    <thead>
                        <tr>
                            <th class="order-col">Order</th>
                            <th class="reg-col">Registration<br>Number</th>
                            <th class="name-col">Call Name</th>
                            <th class="handler-col">Handler</th>
                            <th class="height-col">Jump<br>Height</th>
                            <th class="type-col">Entry<br>Type</th>
                            <th class="notes-col">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${entries.map((entry, index) => `
                            <tr class="${entry.entryType === 'feo' ? 'feo-entry' : 'regular-entry'}">
                                <td class="order-number">${index + 1}</td>
                                <td class="reg-number">${entry.registrationNumber}</td>
                                <td class="dog-name">${entry.dogName}</td>
                                <td class="handler-name">${entry.handlerName}</td>
                                <td class="jump-height">${entry.jumpHeight}"</td>
                                <td class="entry-type">${entry.entryType?.toUpperCase() || 'REG'}</td>
                                <td class="notes-cell">${this.getEntryNotes(entry)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="running-order-footer">
                    <div class="footer-info">
                        <div class="entry-stats">
                            <div class="stat-item">
                                <strong>Regular Entries:</strong> ${entries.filter(e => e.entryType !== 'feo').length}
                            </div>
                            <div class="stat-item">
                                <strong>FEO Entries:</strong> ${entries.filter(e => e.entryType === 'feo').length}
                            </div>
                        </div>
                        <div class="height-breakdown">
                            <strong>Jump Heights:</strong> ${this.getHeightBreakdown(entries)}
                        </div>
                    </div>
                    
                    <div class="instructions">
                        <h4>Instructions:</h4>
                        <ul>
                            <li>Post this running order where competitors can easily see it</li>
                            <li>FEO (For Exhibition Only) entries are shown but do not qualify for placements</li>
                            <li>Competitors should be ready 3-5 dogs before their turn</li>
                            <li>Any changes to running order must be announced clearly</li>
                        </ul>
                    </div>
                    
                    <div class="signatures">
                        <div class="signature-line">
                            <strong>Trial Secretary:</strong> _________________________ <strong>Date:</strong> _________
                        </div>
                        <div class="signature-line">
                            <strong>Judge:</strong> _________________________ <strong>Time Posted:</strong> _________
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static getEntryNotes(entry) {
        const notes = [];
        
        if (entry.entryType === 'feo') {
            notes.push('FEO');
        }
        
        if (entry.specialNeeds) {
            notes.push('Special needs');
        }
        
        if (entry.isJunior) {
            notes.push('Junior handler');
        }
        
        if (entry.modifications && entry.modifications.length > 0) {
            notes.push('Modifications');
        }
        
        return notes.join(', ');
    }

    static getHeightBreakdown(entries) {
        const heights = {};
        entries.forEach(entry => {
            const height = entry.jumpHeight || 'Unknown';
            heights[height] = (heights[height] || 0) + 1;
        });
        
        return Object.entries(heights)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([height, count]) => `${height}" (${count})`)
            .join(', ');
    }

    // Generate condensed running order for ring gate posting
    static generateGateSheet(trial, classInfo, entries) {
        return `
            <div class="gate-sheet cwags-form">
                <div class="gate-header">
                    <h3>${classInfo.name} - ${classInfo.round}</h3>
                    <div class="gate-info">
                        <span><strong>Judge:</strong> ${trial.judges[0]}</span>
                        <span><strong>Entries:</strong> ${entries.length}</span>
                    </div>
                </div>
                
                <div class="gate-list">
                    ${entries.map((entry, index) => `
                        <div class="gate-entry ${entry.entryType === 'feo' ? 'feo' : ''}">
                            <span class="gate-number">${index + 1}</span>
                            <span class="gate-name">${entry.dogName}</span>
                            <span class="gate-handler">${entry.handlerName}</span>
                            <span class="gate-height">${entry.jumpHeight}"</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Generate master entry list for verification
    static generateMasterEntryList(trial, entries) {
        const sortedEntries = [...entries].sort((a, b) => {
            return a.handlerName.localeCompare(b.handlerName);
        });

        return `
            <div class="master-entry-list cwags-form">
                <div class="master-header">
                    <div class="trial-title">
                        <h2>${trial.name}</h2>
                        <h3>Master Entry List - Registration Verification</h3>
                    </div>
                    <div class="trial-details">
                        <div><strong>Date:</strong> ${new Date(trial.date).toLocaleDateString()}</div>
                        <div><strong>Location:</strong> ${trial.location}</div>
                        <div><strong>Host:</strong> ${trial.host}</div>
                    </div>
                </div>

                <div class="verification-instructions">
                    <p><strong>IMPORTANT:</strong> Please verify that your dog's registration number is correct. 
                    Notify the trial secretary immediately of any errors.</p>
                </div>

                <table class="master-entry-table">
                    <thead>
                        <tr>
                            <th class="handler-col">Handler Name</th>
                            <th class="dog-col">Dog Name</th>
                            <th class="reg-col">Registration Number</th>
                            <th class="classes-col">Classes Entered</th>
                            <th class="verify-col">Verified ✓</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedEntries.map(entry => `
                            <tr>
                                <td class="handler-name">${entry.handlerName}</td>
                                <td class="dog-name">${entry.dogName}</td>
                                <td class="reg-number">${entry.registrationNumber}</td>
                                <td class="classes-list">${entry.classes.join(', ')}</td>
                                <td class="verify-checkbox">☐</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="master-footer">
                    <div class="statistics">
                        <div class="stat"><strong>Total Handlers:</strong> ${new Set(entries.map(e => e.handlerName)).size}</div>
                        <div class="stat"><strong>Total Dogs:</strong> ${new Set(entries.map(e => e.registrationNumber)).size}</div>
                        <div class="stat"><strong>Total Entries:</strong> ${entries.length}</div>
                    </div>
                    
                    <div class="verification-signature">
                        <p><strong>Trial Secretary Verification:</strong></p>
                        <div class="signature-line">
                            Signature: _________________________ Date: _________ Time: _________
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Generate check-in sheet for day of trial
    static generateCheckInSheet(trial, entries) {
        const sortedEntries = [...entries].sort((a, b) => {
            return a.handlerName.localeCompare(b.handlerName);
        });

        return `
            <div class="check-in-sheet cwags-form">
                <div class="checkin-header">
                    <h2>${trial.name} - Check-In Sheet</h2>
                    <div class="checkin-info">
                        <div><strong>Date:</strong> ${new Date(trial.date).toLocaleDateString()}</div>
                        <div><strong>Check-in Time:</strong> _________ to _________</div>
                    </div>
                </div>

                <div class="checkin-instructions">
                    <h4>Check-In Requirements:</h4>
                    <ul>
                        <li>Valid registration papers or proof of registration</li>
                        <li>Current vaccination records</li>
                        <li>Entry confirmation or receipt</li>
                        <li>Completed waiver (if not already on file)</li>
                    </ul>
                </div>

                <table class="checkin-table">
                    <thead>
                        <tr>
                            <th class="handler-col">Handler</th>
                            <th class="dog-col">Dog</th>
                            <th class="reg-col">Reg #</th>
                            <th class="armband-col">Armband #</th>
                            <th class="checkin-col">Check-in Time</th>
                            <th class="signature-col">Handler Signature</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedEntries.map((entry, index) => `
                            <tr>
                                <td>${entry.handlerName}</td>
                                <td>${entry.dogName}</td>
                                <td>${entry.registrationNumber}</td>
                                <td class="armband-number">${index + 1}</td>
                                <td class="checkin-time">_______</td>
                                <td class="signature-cell">________________</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="checkin-footer">
                    <div class="checkin-stats">
                        <div>Expected Entries: ${entries.length}</div>
                        <div>Checked In: _______</div>
                        <div>No Shows: _______</div>
                    </div>
                    
                    <div class="secretary-notes">
                        <h4>Secretary Notes:</h4>
                        <div class="notes-area">
                            ${Array(8).fill().map(() => '_'.repeat(60)).join('<br>')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Generate conflict report if handlers have dogs in same class
    static generateConflictReport(trial, entries) {
        const conflicts = this.findRunningOrderConflicts(entries);
        
        if (conflicts.length === 0) {
            return `
                <div class="conflict-report cwags-form">
                    <h3>Running Order Conflict Report</h3>
                    <div class="no-conflicts">
                        ✅ No running order conflicts detected.
                    </div>
                </div>
            `;
        }

        return `
            <div class="conflict-report cwags-form">
                <h3>Running Order Conflict Report</h3>
                <div class="conflicts-found">
                    <p>⚠️ The following conflicts were detected:</p>
                    
                    ${conflicts.map(conflict => `
                        <div class="conflict-item">
                            <h4>${conflict.handler}</h4>
                            <p>Has multiple dogs in ${conflict.className}:</p>
                            <ul>
                                ${conflict.dogs.map(dog => `<li>${dog}</li>`).join('')}
                            </ul>
                            <p><strong>Recommendation:</strong> ${conflict.recommendation}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    static findRunningOrderConflicts(entries) {
        const conflicts = [];
        const handlerClasses = {};

        // Group entries by handler and class
        entries.forEach(entry => {
            entry.classes.forEach(className => {
                const key = `${entry.handlerName}-${className}`;
                if (!handlerClasses[key]) {
                    handlerClasses[key] = {
                        handler: entry.handlerName,
                        className: className,
                        dogs: []
                    };
                }
                handlerClasses[key].dogs.push(entry.dogName);
            });
        });

        // Find conflicts (handlers with multiple dogs in same class)
        Object.values(handlerClasses).forEach(group => {
            if (group.dogs.length > 1) {
                conflicts.push({
                    handler: group.handler,
                    className: group.className,
                    dogs: group.dogs,
                    recommendation: `Space dogs apart in running order. Suggest at least 3-5 dogs between entries.`
                });
            }
        });

        return conflicts;
    }
}