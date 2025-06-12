// js/forms/class-results.js
class ClassResultsForm {
    static generateAll(trial, entries) {
        let html = '<div class="class-results-collection">';
        
        // Generate a class results report for each class
        trial.classes.forEach(classInfo => {
            const classEntries = this.getEntriesForClass(entries, classInfo.name);
            if (classEntries.length > 0) {
                html += this.generateClassResultsReport(trial, classInfo, classEntries);
                html += '<div class="page-break"></div>';
                
                // Generate page 2 if more than 15 entries
                if (classEntries.length > 15) {
                    html += this.generateClassResultsPage2(trial, classInfo, classEntries);
                    html += '<div class="page-break"></div>';
                }
            }
        });
        
        // Generate judge signature page
        html += this.generateJudgeSignaturePage(trial);
        
        html += '</div>';
        return html;
    }

    static getEntriesForClass(entries, className) {
        return entries.filter(entry => 
            entry.classes && entry.classes.includes(className)
        ).sort((a, b) => a.handlerName.localeCompare(b.handlerName));
    }

    static generateClassResultsReport(trial, classInfo, entries) {
        const rounds = this.getRoundsForClass(trial, classInfo);
        const isLeague = trial.type === 'league';
        
        return `
            <div class="class-results-report cwags-form">
                <div class="results-header">
                    <div class="cwags-logo-section">
                        <img src="images/cwags-logo.png" alt="C-WAGS" class="results-logo">
                    </div>
                    <div class="results-title">
                        <h2>${isLeague ? 'League' : ''} CLASS RESULTS REPORT</h2>
                        ${isLeague ? '<p>(All results will be recorded as the last day of the league.)</p>' : ''}
                    </div>
                </div>

                <div class="trial-info-section">
                    <div class="info-row">
                        <div class="info-item">
                            <strong>Host:</strong> ${trial.host}
                        </div>
                        <div class="info-item">
                            <strong>Dates:</strong> ${this.formatTrialDates(trial)}
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-item">
                            <strong>Class:</strong> ${classInfo.name}
                        </div>
                        <div class="info-item">
                            <strong>Total # of Entries:</strong> ${entries.length}
                        </div>
                    </div>
                </div>

                <div class="instructions">
                    <p>Make as many copies of this page as classes offered. Use one column for each round of class – Place Date and Judge at top of each column</p>
                    ${this.getClassSpecificInstructions(classInfo)}
                </div>

                <table class="results-table">
                    <thead>
                        <tr>
                            <th class="entry-num-col">#</th>
                            <th class="reg-num-col">Registration Number</th>
                            <th class="dog-name-col">Dog's Call Name</th>
                            <th class="handler-col">Handler</th>
                            ${rounds.map(round => 
                                `<th class="round-col">
                                    ${this.formatRoundHeader(round)}
                                </th>`
                            ).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${entries.slice(0, 15).map((entry, index) => `
                            <tr class="${entry.entryType === 'feo' ? 'feo-entry' : 'regular-entry'}">
                                <td class="entry-number">${index + 1}</td>
                                <td class="reg-number">${entry.registrationNumber}</td>
                                <td class="dog-name">${entry.dogName}</td>
                                <td class="handler-name">${entry.handlerName}</td>
                                ${rounds.map(round => 
                                    `<td class="result-cell">${this.getResultForRound(entry, round)}</td>`
                                ).join('')}
                            </tr>
                        `).join('')}
                        
                        ${this.generateEmptyRows(Math.max(0, 15 - entries.length), rounds.length)}
                    </tbody>
                </table>

                ${this.generateResetSection(trial, classInfo, rounds)}

                <div class="results-footer">
                    <div class="completion-info">
                        <div class="signature-line">
                            <strong>Trial Secretary:</strong> _________________________ 
                            <strong>Date:</strong> _____________
                        </div>
                        <div class="signature-line">
                            <strong>Judge Verification:</strong> _________________________ 
                            <strong>Date:</strong> _____________
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static generateClassResultsPage2(trial, classInfo, entries) {
        const rounds = this.getRoundsForClass(trial, classInfo);
        const remainingEntries = entries.slice(15);
        
        return `
            <div class="class-results-page2 cwags-form">
                <div class="page2-header">
                    <h3>Class Results Report page 2</h3>
                    <div class="page2-info">
                        <div><strong>Class:</strong> ${classInfo.name} (MUST BE THE SAME AS PAGE 1)</div>
                        <div>Only use if more than 15 entries in a class.</div>
                        <div><strong>Host:</strong> ${trial.host}</div>
                    </div>
                </div>

                <table class="results-table">
                    <thead>
                        <tr>
                            <th class="entry-num-col">#</th>
                            <th class="reg-num-col">Registration Number</th>
                            <th class="dog-name-col">Dog's Call Name</th>
                            <th class="handler-col">Handler</th>
                            ${rounds.map(round => 
                                `<th class="round-col">${this.formatRoundHeader(round)}</th>`
                            ).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${remainingEntries.map((entry, index) => `
                            <tr class="${entry.entryType === 'feo' ? 'feo-entry' : 'regular-entry'}">
                                <td class="entry-number">${index + 16}</td>
                                <td class="reg-number">${entry.registrationNumber}</td>
                                <td class="dog-name">${entry.dogName}</td>
                                <td class="handler-name">${entry.handlerName}</td>
                                ${rounds.map(round => 
                                    `<td class="result-cell">${this.getResultForRound(entry, round)}</td>`
                                ).join('')}
                            </tr>
                        `).join('')}
                        
                        ${this.generateEmptyRows(Math.max(0, 17 - remainingEntries.length), rounds.length)}
                    </tbody>
                </table>
            </div>
        `;
    }

    static getRoundsForClass(trial, classInfo) {
        // Get all rounds for this class across all trial days
        const rounds = [];
        
        if (trial.multiDay) {
            trial.days.forEach((day, dayIndex) => {
                const dayClasses = day.classes.filter(c => c.name === classInfo.name);
                dayClasses.forEach(cls => {
                    rounds.push({
                        date: day.date,
                        judge: cls.judge,
                        round: cls.round || classInfo.round,
                        dayIndex: dayIndex + 1
                    });
                });
            });
        } else {
            // Single day trial
            trial.judges.forEach(judge => {
                rounds.push({
                    date: trial.date,
                    judge: judge,
                    round: classInfo.round,
                    dayIndex: 1
                });
            });
        }
        
        return rounds;
    }

    static formatRoundHeader(round) {
        const date = new Date(round.date).toLocaleDateString('en-US', { 
            month: 'numeric', 
            day: 'numeric' 
        });
        return `${date}<br>${round.judge}`;
    }

    static formatTrialDates(trial) {
        if (trial.multiDay) {
            const startDate = new Date(trial.days[0].date).toLocaleDateString();
            const endDate = new Date(trial.days[trial.days.length - 1].date).toLocaleDateString();
            return `${startDate} - ${endDate}`;
        } else {
            return new Date(trial.date).toLocaleDateString();
        }
    }

    static getClassSpecificInstructions(classInfo) {
        if (classInfo.type === 'scent') {
            return `
                <div class="scent-instructions">
                    <p><strong>SCENT ONLY:</strong> If a reset is offered with this class AND has a different judge - two reporting options:</p>
                    <p>OR Skip a line and group the reset below a heading line with judge</p>
                </div>
            `;
        }
        return '';
    }

    static getResultForRound(entry, round) {
        // This would typically pull from stored scores
        // For now, return empty cell for manual entry
        const scores = DataManager.getScoresForEntry(entry.id);
        const roundScore = scores?.find(s => 
            s.date === round.date && 
            s.judge === round.judge && 
            s.round === round.round
        );
        
        if (roundScore) {
            if (roundScore.type === 'scent') {
                return roundScore.qualified ? 'Pass' : 'Fail';
            } else {
                return roundScore.score || '';
            }
        }
        
        return ''; // Empty for manual entry
    }

    static generateEmptyRows(count, columnCount) {
        if (count <= 0) return '';
        
        let rows = '';
        for (let i = 0; i < count; i++) {
            rows += `
                <tr class="empty-row">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    ${Array(columnCount).fill('<td></td>').join('')}
                </tr>
            `;
        }
        return rows;
    }

    static generateResetSection(trial, classInfo, rounds) {
        if (classInfo.type !== 'scent') return '';
        
        return `
            <div class="reset-section">
                <h4>Reset Options (Scent Classes Only)</h4>
                <p>Use a separate column for any resets with a different judge:</p>
                
                <table class="reset-table">
                    <thead>
                        <tr>
                            <th class="reg-num-col">Registration Number</th>
                            <th class="dog-name-col">Dog's Call Name</th>
                            <th class="handler-col">Handler</th>
                            ${rounds.map(round => 
                                `<th class="reset-col">${this.formatRoundHeader(round)}<br>Reset</th>`
                            ).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${Array(5).fill().map((_, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                ${Array(rounds.length).fill('<td></td>').join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="reset-judges">
                    <strong>RESETS:</strong> 
                    ${rounds.map(round => round.judge).join(' | ')}
                </div>
            </div>
        `;
    }

    static generateJudgeSignaturePage(trial) {
        const judgeBlocks = trial.judges.map(judge => this.generateJudgeSignatureBlock(judge, trial));
        
        return `
            <div class="judge-signature-page cwags-form">
                <div class="signature-page-header">
                    <div class="header-logo">
                        <img src="images/cwags-logo.png" alt="C-WAGS" class="signature-logo">
                    </div>
                    <div class="header-title">
                        <h2>Class Results - Judge's Signature page</h2>
                        <p>Certifying you judged the listed class and verify the results on the Class Results Report</p>
                    </div>
                </div>

                <div class="signature-blocks">
                    ${judgeBlocks.join('')}
                </div>
            </div>
        `;
    }