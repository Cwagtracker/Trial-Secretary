const netScore = parseFloat(netScoreDisplay.textContent) || 0;
                totalScore += netScore;
            }
        });
        
        const finalScore = hasNQ ? 'NQ' : totalScore;
        document.getElementById('manual-final-score').textContent = finalScore;
        
        this.updateManualQualification();
    }

    static toggleInputMethod() {
        const method = document.querySelector('[name="input-method"]:checked').value;
        const deductionsInput = document.getElementById('deductions-input');
        const totalScoreInput = document.getElementById('total-score-input');
        
        if (method === 'deductions') {
            deductionsInput.style.display = 'block';
            totalScoreInput.style.display = 'none';
        } else {
            deductionsInput.style.display = 'none';
            totalScoreInput.style.display = 'block';
            
            // Set total score from current calculations
            const currentScore = document.getElementById('manual-final-score').textContent;
            if (currentScore !== 'NQ') {
                document.getElementById('manual-total-score').value = currentScore;
            }
        }
        
        this.updateManualQualification();
    }

    static updateManualQualification() {
        const method = document.querySelector('[name="input-method"]:checked').value;
        let finalScore;
        
        if (method === 'total') {
            finalScore = parseFloat(document.getElementById('manual-total-score').value) || 0;
            document.getElementById('manual-final-score').textContent = finalScore;
        } else {
            finalScore = document.getElementById('manual-final-score').textContent;
        }
        
        const maxScore = parseInt(document.getElementById('manual-max-score').value);
        const qualifyingScore = Math.ceil(maxScore * 0.7);
        
        let qualified = false;
        if (finalScore !== 'NQ' && finalScore !== 0) {
            qualified = finalScore >= qualifyingScore;
        }
        
        const qualificationText = finalScore === 'NQ' ? 'Non-Qualifying (NQ)' : 
            (qualified ? 'Qualified' : 'Non-Qualifying');
        
        document.getElementById('manual-qualification').textContent = qualificationText;
        document.getElementById('manual-qualification').className = qualified ? 'qualified' : 'nq';
        
        // Enable/disable placement
        const placementSelect = document.getElementById('manual-placement');
        placementSelect.disabled = !qualified;
        if (!qualified) {
            placementSelect.value = '';
        }
    }

    static loadExistingManualScore() {
        const existingScore = DataManager.getScoresForEntry(this.currentManualEntry.id)
            .find(s => s.className === this.currentManualClass.name && s.round === this.currentManualClass.round);
        
        if (!existingScore) return;
        
        // Load exercise scores if using deductions method
        if (existingScore.exerciseScores) {
            existingScore.exerciseScores.forEach((exerciseScore, index) => {
                const row = document.querySelector(`[data-exercise-index="${index}"]`);
                if (!row) return;
                
                const deductionInput = row.querySelector('.deduction-input');
                const nqCheckbox = row.querySelector('.nq-checkbox');
                
                if (exerciseScore.nq) {
                    nqCheckbox.checked = true;
                } else {
                    deductionInput.value = exerciseScore.pointsLost || 0;
                }
                
                this.updateManualExerciseScore(index);
            });
        } else if (existingScore.totalScore !== undefined) {
            // Load total score
            document.querySelector('[name="input-method"][value="total"]').checked = true;
            this.toggleInputMethod();
            document.getElementById('manual-total-score').value = existingScore.totalScore;
        }
        
        // Load other fields
        document.getElementById('manual-placement').value = existingScore.placement || '';
        document.getElementById('manual-judge-notes').value = existingScore.judgeNotes || '';
        
        this.updateManualQualification();
    }

    static submitManualScore() {
        try {
            const scoreData = this.collectManualScoreData();
            
            if (!this.validateManualScoreData(scoreData)) {
                return;
            }
            
            DataManager.saveScore(scoreData);
            App.showAlert('Manual score submitted successfully!', 'success');
            
            // Reset form
            this.resetManualScore();
            
        } catch (error) {
            App.handleError(error, 'Submit Manual Score');
        }
    }

    static collectManualScoreData() {
        const method = document.querySelector('[name="input-method"]:checked').value;
        let scoreData = {
            entryId: this.currentManualEntry.id,
            trialId: document.getElementById('manual-trial-select').value,
            className: this.currentManualClass.name,
            round: this.currentManualClass.round,
            placement: document.getElementById('manual-placement').value || null,
            judgeNotes: document.getElementById('manual-judge-notes').value,
            judge: 'Manual Entry',
            scoredAt: new Date().toISOString(),
            scoredBy: Auth.getCurrentUser()?.id,
            isManualEntry: true
        };
        
        if (method === 'deductions') {
            // Collect exercise-by-exercise scores
            const exercises = this.getExercisesForClass(this.currentManualClass.round);
            const exerciseScores = [];
            let totalPointsLost = 0;
            let hasNQ = false;
            let totalMaxPoints = 0;
            
            exercises.forEach((exercise, index) => {
                totalMaxPoints += exercise.maxPoints;
                const row = document.querySelector(`[data-exercise-index="${index}"]`);
                const deductionInput = row.querySelector('.deduction-input');
                const nqCheckbox = row.querySelector('.nq-checkbox');
                
                const exerciseScore = {
                    exerciseName: exercise.name,
                    maxPoints: exercise.maxPoints
                };
                
                if (nqCheckbox.checked) {
                    exerciseScore.nq = true;
                    exerciseScore.pointsLost = exercise.maxPoints;
                    exerciseScore.netScore = 0;
                    hasNQ = true;
                } else {
                    const pointsLost = parseFloat(deductionInput.value) || 0;
                    exerciseScore.nq = false;
                    exerciseScore.pointsLost = pointsLost;
                    exerciseScore.netScore = exercise.maxPoints - pointsLost;
                    totalPointsLost += pointsLost;
                }
                
                exerciseScores.push(exerciseScore);
            });
            
            scoreData.exerciseScores = exerciseScores;
            scoreData.totalMaxPoints = totalMaxPoints;
            scoreData.totalPointsLost = totalPointsLost;
            scoreData.totalScore = hasNQ ? 0 : (totalMaxPoints - totalPointsLost);
            scoreData.hasNQ = hasNQ;
        } else {
            // Total score method
            const totalScore = parseFloat(document.getElementById('manual-total-score').value) || 0;
            const maxScore = parseInt(document.getElementById('manual-max-score').value);
            
            scoreData.totalScore = totalScore;
            scoreData.totalMaxPoints = maxScore;
            scoreData.hasNQ = totalScore === 0;
        }
        
        // Calculate qualification
        const qualifyingScore = Math.ceil(scoreData.totalMaxPoints * 0.7);
        scoreData.qualifyingScore = qualifyingScore;
        scoreData.qualified = !scoreData.hasNQ && scoreData.totalScore >= qualifyingScore;
        
        return scoreData;
    }

    static validateManualScoreData(scoreData) {
        if (!scoreData.totalScore && scoreData.totalScore !== 0) {
            App.showAlert('Please enter a valid score', 'warning');
            return false;
        }
        
        if (scoreData.qualified && scoreData.placement) {
            const placement = parseInt(scoreData.placement);
            if (placement < 1 || placement > 4) {
                App.showAlert('Placement must be between 1st and 4th place', 'warning');
                return false;
            }
        }
        
        return true;
    }

    static resetManualScore() {
        // Reset exercise table
        const exercises = this.getExercisesForClass(this.currentManualClass.round);
        exercises.forEach((exercise, index) => {
            const row = document.querySelector(`[data-exercise-index="${index}"]`);
            if (row) {
                const deductionInput = row.querySelector('.deduction-input');
                const nqCheckbox = row.querySelector('.nq-checkbox');
                const netScoreDisplay = row.querySelector('.net-score-display');
                
                deductionInput.value = '';
                nqCheckbox.checked = false;
                netScoreDisplay.textContent = exercise.maxPoints;
            }
        });
        
        // Reset other fields
        document.getElementById('manual-total-score').value = '';
        document.getElementById('manual-placement').value = '';
        document.getElementById('manual-judge-notes').value = '';
        
        // Reset to deductions method
        document.querySelector('[name="input-method"][value="deductions"]').checked = true;
        this.toggleInputMethod();
        
        this.updateManualTotalScore();
    }

    // ===================
    // RESULTS MANAGEMENT
    // ===================

    static loadResultsManagement() {
        this.loadTrialOptions();
    }

    static loadResultsForTrial() {
        const trialId = document.getElementById('results-trial-select').value;
        if (!trialId) {
            document.getElementById('results-tbody').innerHTML = 
                '<tr><td colspan="8" class="loading">Select a trial to view results</td></tr>';
            return;
        }

        const trial = DataManager.getTrial(trialId);
        
        // Load class filter options
        const classFilter = document.getElementById('results-class-filter');
        classFilter.innerHTML = '<option value="">All Classes</option>';
        trial.classes.forEach(classInfo => {
            const option = document.createElement('option');
            option.value = `${classInfo.name}-${classInfo.round}`;
            option.textContent = `${classInfo.name} - ${classInfo.round}`;
            classFilter.appendChild(option);
        });
        
        this.currentResultsTrial = trial;
        this.loadAndDisplayResults();
    }

    static loadAndDisplayResults() {
        if (!this.currentResultsTrial) return;
        
        const scores = DataManager.getTrialScores(this.currentResultsTrial.id);
        const entries = DataManager.getTrialEntries(this.currentResultsTrial.id);
        
        // Combine scores with entry data
        const results = scores.map(score => {
            const entry = entries.find(e => e.id === score.entryId);
            return {
                ...score,
                handlerName: entry?.handlerName || 'Unknown',
                dogName: entry?.dogName || 'Unknown',
                jumpHeight: entry?.jumpHeight || 'Unknown'
            };
        }).sort((a, b) => {
            // Sort by placement first, then by score
            if (a.placement && b.placement) {
                return parseInt(a.placement) - parseInt(b.placement);
            }
            if (a.placement && !b.placement) return -1;
            if (!a.placement && b.placement) return 1;
            
            // Then by qualification status
            if (a.qualified !== b.qualified) {
                return b.qualified ? 1 : -1;
            }
            
            // Finally by score
            const aScore = a.hasNQ ? -1 : (a.totalScore || 0);
            const bScore = b.hasNQ ? -1 : (b.totalScore || 0);
            return bScore - aScore;
        });
        
        this.displayScoreboard(results);
        document.getElementById('scoreboard-last-update').textContent = 
            `Last updated: ${new Date().toLocaleTimeString()}`;
    }

    static displayScoreboard(results) {
        const content = document.getElementById('scoreboard-content');
        
        if (results.length === 0) {
            content.innerHTML = '<div class="scoreboard-message">No results available yet</div>';
            return;
        }
        
        // Group results by class if showing all classes
        const classFilter = document.getElementById('scoreboard-class-select').value;
        
        if (!classFilter) {
            // Group by class
            const groupedResults = {};
            results.forEach(result => {
                const key = `${result.className}-${result.round}`;
                if (!groupedResults[key]) {
                    groupedResults[key] = [];
                }
                groupedResults[key].push(result);
            });
            
            content.innerHTML = Object.entries(groupedResults).map(([classKey, classResults]) => {
                const [className, round] = classKey.split('-');
                return `
                    <div class="scoreboard-class">
                        <h3 class="class-title">${className} - ${round}</h3>
                        ${this.generateScoreboardTable(classResults)}
                    </div>
                `;
            }).join('');
        } else {
            // Single class view
            const [className, round] = classFilter.split('-');
            content.innerHTML = `
                <div class="scoreboard-class">
                    <h3 class="class-title">${className} - ${round}</h3>
                    ${this.generateScoreboardTable(results)}
                </div>
            `;
        }
    }

    static generateScoreboardTable(results) {
        return `
            <table class="scoreboard-table">
                <thead>
                    <tr>
                        <th class="place-col">Place</th>
                        <th class="handler-col">Handler</th>
                        <th class="dog-col">Dog</th>
                        <th class="score-col">Score</th>
                        <th class="status-col">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map((result, index) => `
                        <tr class="scoreboard-row ${result.qualified ? 'qualified' : 'nq'}">
                            <td class="place">
                                ${result.placement ? this.getPlacementDisplay(result.placement) : (index + 1)}
                            </td>
                            <td class="handler">${result.handlerName}</td>
                            <td class="dog">${result.dogName}</td>
                            <td class="score">
                                <span class="score-value">${result.hasNQ ? 'NQ' : result.totalScore}</span>
                                <span class="score-max">/ ${result.totalMaxPoints}</span>
                            </td>
                            <td class="status">
                                <span class="qualification-badge ${result.qualified ? 'qualified' : 'nq'}">
                                    ${result.qualified ? 'Q' : 'NQ'}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    static toggleAutoRefresh() {
        const autoRefresh = document.getElementById('auto-refresh').checked;
        
        if (autoRefresh) {
            this.autoRefreshInterval = setInterval(() => {
                this.updateScoreboard();
            }, 30000); // 30 seconds
            App.showAlert('Auto-refresh enabled (30 seconds)', 'info');
        } else {
            if (this.autoRefreshInterval) {
                clearInterval(this.autoRefreshInterval);
                this.autoRefreshInterval = null;
            }
            App.showAlert('Auto-refresh disabled', 'info');
        }
    }

    static refreshScoreboard() {
        this.updateScoreboard();
        App.showAlert('Scoreboard refreshed', 'success');
    }

    static fullscreenScoreboard() {
        const scoreboardDisplay = document.getElementById('scoreboard-display');
        
        if (scoreboardDisplay.requestFullscreen) {
            scoreboardDisplay.requestFullscreen();
        } else if (scoreboardDisplay.webkitRequestFullscreen) {
            scoreboardDisplay.webkitRequestFullscreen();
        } else if (scoreboardDisplay.msRequestFullscreen) {
            scoreboardDisplay.msRequestFullscreen();
        }
    }

    // ===================
    // REPORTS & ANALYSIS
    // ===================

    static loadReportsTab() {
        // Reports tab is loaded statically
        console.log('Reports tab loaded');
    }

    static generateScoreReport() {
        const trialId = this.getSelectedTrialForReports();
        if (!trialId) return;
        
        const trial = DataManager.getTrial(trialId);
        const scores = DataManager.getTrialScores(trialId);
        const entries = DataManager.getTrialEntries(trialId);
        
        const reportContent = this.createScoreReport(trial, scores, entries);
        this.showReportViewer('Complete Score Report', reportContent);
    }

    static createScoreReport(trial, scores, entries) {
        // Combine scores with entry data
        const results = scores.map(score => {
            const entry = entries.find(e => e.id === score.entryId);
            return { ...score, ...entry };
        });
        
        // Group by class
        const classSeparated = {};
        results.forEach(result => {
            const key = `${result.className}-${result.round}`;
            if (!classSeparated[key]) {
                classSeparated[key] = [];
            }
            classSeparated[key].push(result);
        });
        
        // Sort each class by placement/score
        Object.keys(classSeparated).forEach(key => {
            classSeparated[key].sort((a, b) => {
                if (a.placement && b.placement) {
                    return parseInt(a.placement) - parseInt(b.placement);
                }
                if (a.qualified !== b.qualified) {
                    return b.qualified ? 1 : -1;
                }
                return (b.totalScore || 0) - (a.totalScore || 0);
            });
        });
        
        return `
            <div class="score-report">
                <div class="report-header">
                    <h1>${trial.name} - Complete Score Report</h1>
                    <div class="report-meta">
                        <p><strong>Date:</strong> ${App.formatDate(trial.date)}</p>
                        <p><strong>Location:</strong> ${trial.venue?.name}, ${trial.venue?.city}, ${trial.venue?.state}</p>
                        <p><strong>Host:</strong> ${trial.host}</p>
                        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                
                ${Object.entries(classSeparated).map(([classKey, classResults]) => {
                    const [className, round] = classKey.split('-');
                    const qualified = classResults.filter(r => r.qualified).length;
                    const total = classResults.length;
                    
                    return `
                        <div class="class-report-section">
                            <h2>${className} - ${round}</h2>
                            <div class="class-summary">
                                <p><strong>Total Entries:</strong> ${total}</p>
                                <p><strong>Qualified:</strong> ${qualified} (${Math.round(qualified/total*100)}%)</p>
                                <p><strong>Judge:</strong> ${classResults[0]?.judge || 'TBD'}</p>
                            </div>
                            
                            <table class="report-results-table">
                                <thead>
                                    <tr>
                                        <th>Place</th>
                                        <th>Handler</th>
                                        <th>Dog</th>
                                        <th>Registration</th>
                                        <th>Score</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${classResults.map((result, index) => `
                                        <tr class="${result.qualified ? 'qualified' : 'nq'}">
                                            <td>${result.placement || (index + 1)}</td>
                                            <td>${result.handlerName}</td>
                                            <td>${result.dogName}</td>
                                            <td>${result.registrationNumber}</td>
                                            <td>${result.hasNQ ? 'NQ' : result.totalScore} / ${result.totalMaxPoints}</td>
                                            <td>${result.qualified ? 'Qualified' : 'Non-Qualifying'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                }).join('')}
                
                <div class="report-footer">
                    <p>Report generated by C-WAGS Trial Management System</p>
                    <p>${new Date().toLocaleString()}</p>
                </div>
            </div>
        `;
    }

    static generateStatisticsReport() {
        const trialId = this.getSelectedTrialForReports();
        if (!trialId) return;
        
        const trial = DataManager.getTrial(trialId);
        const scores = DataManager.getTrialScores(trialId);
        const entries = DataManager.getTrialEntries(trialId);
        
        const stats = this.calculateTrialStatistics(trial, scores, entries);
        const reportContent = this.createStatisticsReport(trial, stats);
        this.showReportViewer('Trial Statistics', reportContent);
    }

    static calculateTrialStatistics(trial, scores, entries) {
        const stats = {
            totalEntries: entries.length,
            totalScored: scores.length,
            totalQualified: scores.filter(s => s.qualified).length,
            qualificationRate: 0,
            averageScore: 0,
            highestScore: 0,
            lowestScore: Infinity,
            classSummary: {},
            judgeStats: {},
            heightDistribution: {}
        };
        
        if (stats.totalScored > 0) {
            stats.qualificationRate = Math.round((stats.totalQualified / stats.totalScored) * 100);
            
            const validScores = scores.filter(s => !s.hasNQ && s.totalScore !== undefined);
            if (validScores.length > 0) {
                stats.averageScore = Math.round(
                    validScores.reduce((sum, s) => sum + s.totalScore, 0) / validScores.length * 10
                ) / 10;
                stats.highestScore = Math.max(...validScores.map(s => s.totalScore));
                stats.lowestScore = Math.min(...validScores.map(s => s.totalScore));
            }
        }
        
        // Class summary
        scores.forEach(score => {
            const key = `${score.className}-${score.round}`;
            if (!stats.classSummary[key]) {
                stats.classSummary[key] = {
                    total: 0,
                    qualified: 0,
                    averageScore: 0,
                    scores: []
                };
            }
            stats.classSummary[key].total++;
            if (score.qualified) stats.classSummary[key].qualified++;
            if (!score.hasNQ) stats.classSummary[key].scores.push(score.totalScore);
        });
        
        // Calculate class averages
        Object.keys(stats.classSummary).forEach(key => {
            const classStats = stats.classSummary[key];
            if (classStats.scores.length > 0) {
                classStats.averageScore = Math.round(
                    classStats.scores.reduce((sum, s) => sum + s, 0) / classStats.scores.length * 10
                ) / 10;
            }
            classStats.qualificationRate = Math.round((classStats.qualified / classStats.total) * 100);
        });
        
        // Judge statistics
        scores.forEach(score => {
            const judge = score.judge || 'Unknown';
            if (!stats.judgeStats[judge]) {
                stats.judgeStats[judge] = {
                    total: 0,
                    qualified: 0,
                    averageScore: 0,
                    scores: []
                };
            }
            stats.judgeStats[judge].total++;
            if (score.qualified) stats.judgeStats[judge].qualified++;
            if (!score.hasNQ) stats.judgeStats[judge].scores.push(score.totalScore);
        });
        
        // Calculate judge averages
        Object.keys(stats.judgeStats).forEach(judge => {
            const judgeStats = stats.judgeStats[judge];
            if (judgeStats.scores.length > 0) {
                judgeStats.averageScore = Math.round(
                    judgeStats.scores.reduce((sum, s) => sum + s, 0) / judgeStats.scores.length * 10
                ) / 10;
            }
            judgeStats.qualificationRate = Math.round((judgeStats.qualified / judgeStats.total) * 100);
        });
        
        // Height distribution
        entries.forEach(entry => {
            const height = entry.jumpHeight || 'Unknown';
            if (!stats.heightDistribution[height]) {
                stats.heightDistribution[height] = 0;
            }
            stats.heightDistribution[height]++;
        });
        
        return stats;
    }

    static createStatisticsReport(trial, stats) {
        return `
            <div class="statistics-report">
                <div class="report-header">
                    <h1>${trial.name} - Statistics Report</h1>
                    <p>Generated: ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="overall-stats">
                    <h2>Overall Statistics</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${stats.totalEntries}</div>
                            <div class="stat-label">Total Entries</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.totalScored}</div>
                            <div class="stat-label">Entries Scored</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.totalQualified}</div>
                            <div class="stat-label">Qualified</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.qualificationRate}%</div>
                            <div class="stat-label">Qualification Rate</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.averageScore}</div>
                            <div class="stat-label">Average Score</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.highestScore}</div>
                            <div class="stat-label">Highest Score</div>
                        </div>
                    </div>
                </div>
                
                <div class="class-stats">
                    <h2>Class Statistics</h2>
                    <table class="stats-table">
                        <thead>
                            <tr>
                                <th>Class</th>
                                <th>Total Entries</th>
                                <th>Qualified</th>
                                <th>Qualification Rate</th>
                                <th>Average Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(stats.classSummary).map(([classKey, classStats]) => {
                                const [className, round] = classKey.split('-');
                                return `
                                    <tr>
                                        <td>${className} - ${round}</td>
                                        <td>${classStats.total}</td>
                                        <td>${classStats.qualified}</td>
                                        <td>${classStats.qualificationRate}%</td>
                                        <td>${classStats.averageScore}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="judge-stats">
                    <h2>Judge Statistics</h2>
                    <table class="stats-table">
                        <thead>
                            <tr>
                                <th>Judge</th>
                                <th>Entries Judged</th>
                                <th>Qualified</th>
                                <th>Qualification Rate</th>
                                <th>Average Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(stats.judgeStats).map(([judge, judgeStats]) => `
                                <tr>
                                    <td>${judge}</td>
                                    <td>${judgeStats.total}</td>
                                    <td>${judgeStats.qualified}</td>
                                    <td>${judgeStats.qualificationRate}%</td>
                                    <td>${judgeStats.averageScore}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="height-distribution">
                    <h2>Jump Height Distribution</h2>
                    <table class="stats-table">
                        <thead>
                            <tr>
                                <th>Jump Height</th>
                                <th>Number of Entries</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(stats.heightDistribution)
                                .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                                .map(([height, count]) => `
                                    <tr>
                                        <td>${height}"</td>
                                        <td>${count}</td>
                                        <td>${Math.round((count / stats.totalEntries) * 100)}%</td>
                                    </tr>
                                `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    static getSelectedTrialForReports() {
        // Get the most recently selected trial from any tab
        const trialSelectors = [
            'scoring-trial-select',
            'results-trial-select',
            'scoreboard-trial-select'
        ];
        
        for (let selectorId of trialSelectors) {
            const value = document.getElementById(selectorId)?.value;
            if (value) return value;
        }
        
        App.showAlert('Please select a trial first', 'warning');
        return null;
    }

    static showReportViewer(title, content) {
        document.getElementById('report-title').textContent = title;
        document.getElementById('report-content').innerHTML = content;
        document.getElementById('report-viewer').style.display = 'block';
        
        this.currentReportTitle = title;
        this.currentReportContent = content;
    }

    static closeReportViewer() {
        document.getElementById('report-viewer').style.display = 'none';
    }

    static printReport() {
        if (!this.currentReportContent) return;
        
        App.generatePrintableReport(this.currentReportTitle, this.currentReportContent);
    }

    static downloadReport() {
        if (!this.currentReportContent) return;
        
        const filename = `${this.currentReportTitle.replace(/[^a-z0-9]/gi, '_')}.html`;
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${this.currentReportTitle}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
                    .stat-card { border: 1px solid #ccc; padding: 15px; text-align: center; }
                    .stats-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .stats-table th, .stats-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                    .stats-table th { background: #f0f0f0; }
                </style>
            </head>
            <body>
                ${this.currentReportContent}
            </body>
            </html>
        `;
        
        App.downloadFile(htmlContent, filename, 'text/html');
    }

    // Additional report generation methods
    static generateClassResults() {
        const trialId = this.getSelectedTrialForReports();
        if (!trialId) return;
        
        const trial = DataManager.getTrial(trialId);
        const scores = DataManager.getTrialScores(trialId);
        const entries = DataManager.getTrialEntries(trialId);
        
        const classResultsHtml = ClassResultsForm.generateAll(trial, entries);
        this.showReportViewer('Class Results Summary', classResultsHtml);
    }

    static generateQualificationReport() {
        const trialId = this.getSelectedTrialForReports();
        if (!trialId) return;
        
        const trial = DataManager.getTrial(trialId);
        const scores = DataManager.getTrialScores(trialId);
        const qualifiedScores = scores.filter(s => s.qualified);
        
        if (qualifiedScores.length === 0) {
            App.showAlert('No qualified entries found', 'info');
            return;
        }
        
        const reportContent = this.createQualificationReport(trial, qualifiedScores);
        this.showReportViewer('Qualification Report', reportContent);
    }

    static createQualificationReport(trial, qualifiedScores) {
        return `
            <div class="qualification-report">
                <h1>${trial.name} - Qualification Report</h1>
                <p>The following entries achieved qualifying scores:</p>
                
                <table class="qualification-table">
                    <thead>
                        <tr>
                            <th>Handler</th>
                            <th>Dog</th>
                            <th>Class</th>
                            <th>Score</th>
                            <th>Placement</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${qualifiedScores.map(score => {
                            const entry = DataManager.getEntry(score.entryId);
                            return `
                                <tr>
                                    <td>${entry?.handlerName || 'Unknown'}</td>
                                    <td>${entry?.dogName || 'Unknown'}</td>
                                    <td>${score.className} - ${score.round}</td>
                                    <td>${score.totalScore} / ${score.totalMaxPoints}</td>
                                    <td>${score.placement ? this.getPlacementDisplay(score.placement) : '—'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                
                <div class="qualification-summary">
                    <p><strong>Total Qualified Entries:</strong> ${qualifiedScores.length}</p>
                    <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
        `;
    }

    // Quick export functions
    static exportToCSV() {
        this.exportResults();
    }

    static exportToPDF() {
        App.showAlert('PDF export would be implemented with a PDF library', 'info');
    }

    static exportToRegistry() {
        App.showAlert('Registry submission would integrate with C-WAGS central database', 'info');
    }

    // Module interface methods
    static refresh() {
        this.loadInitialData();
    }

    static save() {
        if (this.isScoring && this.currentEntry) {
            return this.autoSaveScore();
        }
        return Promise.resolve();
    }

    static createNew() {
        this.switchTab('scoring-interface');
        document.getElementById('scoring-trial-select').value = '';
        this.onTrialChange();
    }
}(score => {
            const entry = entries.find(e => e.id === score.entryId);
            return {
                ...score,
                handlerName: entry?.handlerName || 'Unknown',
                dogName: entry?.dogName || 'Unknown',
                registrationNumber: entry?.registrationNumber || 'Unknown',
                jumpHeight: entry?.jumpHeight || 'Unknown'
            };
        });
        
        this.currentResults = results;
        this.updateResultsSummary(results);
        this.displayResults(results);
    }

    static updateResultsSummary(results) {
        const totalScored = results.length;
        const totalQualified = results.filter(r => r.qualified).length;
        const qualificationRate = totalScored > 0 ? Math.round((totalQualified / totalScored) * 100) : 0;
        const averageScore = totalScored > 0 ? 
            Math.round(results.reduce((sum, r) => sum + (r.totalScore || 0), 0) / totalScored * 10) / 10 : 0;
        
        document.getElementById('total-scored').textContent = totalScored;
        document.getElementById('total-qualified').textContent = totalQualified;
        document.getElementById('qualification-rate').textContent = qualificationRate + '%';
        document.getElementById('average-score').textContent = averageScore;
    }

    static displayResults(results) {
        const tbody = document.getElementById('results-tbody');
        
        if (results.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No results found</td></tr>';
            return;
        }
        
        tbody.innerHTML = results.map(result => `
            <tr>
                <td class="placement">
                    ${result.placement ? this.getPlacementDisplay(result.placement) : '—'}
                </td>
                <td class="handler-name">${result.handlerName}</td>
                <td class="dog-name">${result.dogName}</td>
                <td class="class-name">${result.className} - ${result.round}</td>
                <td class="score">
                    ${result.hasNQ ? 'NQ' : (result.totalScore || 0)}
                    ${result.totalMaxPoints ? ` / ${result.totalMaxPoints}` : ''}
                </td>
                <td class="qualified">
                    <span class="qualification-badge ${result.qualified ? 'qualified' : 'nq'}">
                        ${result.qualified ? 'Q' : 'NQ'}
                    </span>
                </td>
                <td class="judge">${result.judge || '—'}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary" onclick="ScoringSystem.editResult('${result.id}')">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="ScoringSystem.viewResultDetails('${result.id}')">
                        View
                    </button>
                </td>
            </tr>
        `).join('');
    }

    static getPlacementDisplay(placement) {
        const placements = {
            '1': '🥇 1st',
            '2': '🥈 2nd', 
            '3': '🥉 3rd',
            '4': '4th'
        };
        return placements[placement] || placement;
    }

    static filterResults() {
        if (!this.currentResults) return;
        
        const classFilter = document.getElementById('results-class-filter').value;
        const statusFilter = document.getElementById('results-status-filter').value;
        
        let filteredResults = [...this.currentResults];
        
        // Apply class filter
        if (classFilter) {
            const [className, round] = classFilter.split('-');
            filteredResults = filteredResults.filter(result => 
                result.className === className && result.round === round
            );
        }
        
        // Apply status filter
        if (statusFilter) {
            switch (statusFilter) {
                case 'scored':
                    filteredResults = filteredResults.filter(result => result.totalScore !== undefined);
                    break;
                case 'unscored':
                    filteredResults = filteredResults.filter(result => result.totalScore === undefined);
                    break;
                case 'qualified':
                    filteredResults = filteredResults.filter(result => result.qualified);
                    break;
                case 'nq':
                    filteredResults = filteredResults.filter(result => !result.qualified);
                    break;
            }
        }
        
        this.displayResults(filteredResults);
        this.updateResultsSummary(filteredResults);
    }

    static sortResults(field) {
        if (!this.currentResults) return;
        
        this.currentResults.sort((a, b) => {
            switch (field) {
                case 'placement':
                    const aPlace = parseInt(a.placement) || 999;
                    const bPlace = parseInt(b.placement) || 999;
                    return aPlace - bPlace;
                case 'handlerName':
                case 'dogName':
                case 'className':
                    return (a[field] || '').localeCompare(b[field] || '');
                case 'score':
                    const aScore = a.hasNQ ? -1 : (a.totalScore || 0);
                    const bScore = b.hasNQ ? -1 : (b.totalScore || 0);
                    return bScore - aScore; // Descending order
                case 'qualified':
                    return (b.qualified ? 1 : 0) - (a.qualified ? 1 : 0);
                default:
                    return 0;
            }
        });
        
        this.displayResults(this.currentResults);
    }

    static calculatePlacements() {
        if (!this.currentResultsTrial) {
            App.showAlert('Please select a trial first', 'warning');
            return;
        }
        
        if (confirm('This will calculate placements for all classes. Continue?')) {
            try {
                this.performPlacementCalculation();
                App.showAlert('Placements calculated successfully!', 'success');
                this.loadAndDisplayResults();
            } catch (error) {
                App.handleError(error, 'Calculate Placements');
            }
        }
    }

    static performPlacementCalculation() {
        const scores = DataManager.getTrialScores(this.currentResultsTrial.id);
        
        // Group scores by class and round
        const classScoressorted = {};
        scores.forEach(score => {
            const key = `${score.className}-${score.round}`;
            if (!classScoressorted[key]) {
                classScoressorted[key] = [];
            }
            classScoressorted[key].push(score);
        });
        
        // Calculate placements for each class
        Object.keys(classScoressorted).forEach(classKey => {
            const classScores = classScoressorted[classKey];
            
            // Filter only qualified scores and sort by score (highest first)
            const qualifiedScores = classScores
                .filter(score => score.qualified && !score.hasNQ)
                .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
            
            // Assign placements
            qualifiedScores.forEach((score, index) => {
                if (index < 4) { // Only place top 4
                    score.placement = (index + 1).toString();
                    DataManager.saveScore(score);
                }
            });
            
            // Clear placements for non-qualified or lower-placed entries
            classScores
                .filter(score => !score.qualified || score.hasNQ)
                .forEach(score => {
                    score.placement = null;
                    DataManager.saveScore(score);
                });
        });
    }

    static editResult(scoreId) {
        // Switch to manual score entry tab and load this score
        const score = DataManager.getScores().find(s => s.id === scoreId);
        if (!score) return;
        
        // Set up manual entry form with this score
        document.getElementById('manual-trial-select').value = score.trialId;
        this.loadManualScoreOptions();
        
        // Find and select the class
        setTimeout(() => {
            const classOptions = document.getElementById('manual-class-select').options;
            for (let option of classOptions) {
                if (option.value) {
                    const classInfo = JSON.parse(option.value);
                    if (classInfo.name === score.className && classInfo.round === score.round) {
                        document.getElementById('manual-class-select').value = option.value;
                        this.loadManualEntries();
                        break;
                    }
                }
            }
            
            // Select the entry
            setTimeout(() => {
                document.getElementById('manual-entry-select').value = score.entryId;
                this.loadManualScoreForm();
                
                // Switch to manual score entry tab
                this.switchTab('score-entry');
            }, 100);
        }, 100);
    }

    static viewResultDetails(scoreId) {
        const score = DataManager.getScores().find(s => s.id === scoreId);
        if (!score) return;
        
        const entry = DataManager.getEntry(score.entryId);
        
        // Create detailed view modal
        this.showResultDetailsModal(score, entry);
    }

    static showResultDetailsModal(score, entry) {
        const modalHtml = `
            <div class="result-details-modal modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Score Details</h3>
                        <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="score-details">
                            <div class="competitor-section">
                                <h4>Competitor Information</h4>
                                <div class="detail-grid">
                                    <div><strong>Handler:</strong> ${entry?.handlerName || 'Unknown'}</div>
                                    <div><strong>Dog:</strong> ${entry?.dogName || 'Unknown'}</div>
                                    <div><strong>Registration:</strong> ${entry?.registrationNumber || 'Unknown'}</div>
                                    <div><strong>Jump Height:</strong> ${entry?.jumpHeight || 'Unknown'}"</div>
                                </div>
                            </div>
                            
                            <div class="class-section">
                                <h4>Class Information</h4>
                                <div class="detail-grid">
                                    <div><strong>Class:</strong> ${score.className}</div>
                                    <div><strong>Round:</strong> ${score.round}</div>
                                    <div><strong>Judge:</strong> ${score.judge || 'Unknown'}</div>
                                    <div><strong>Date:</strong> ${App.formatDate(score.scoredAt)}</div>
                                </div>
                            </div>
                            
                            <div class="score-section">
                                <h4>Score Summary</h4>
                                <div class="score-summary-grid">
                                    <div class="score-item">
                                        <label>Final Score:</label>
                                        <span class="score-value ${score.hasNQ ? 'nq' : ''}">${score.hasNQ ? 'NQ' : score.totalScore} / ${score.totalMaxPoints}</span>
                                    </div>
                                    <div class="score-item">
                                        <label>Qualifying Score:</label>
                                        <span>${score.qualifyingScore || 'N/A'}</span>
                                    </div>
                                    <div class="score-item">
                                        <label>Qualification:</label>
                                        <span class="qualification-result ${score.qualified ? 'qualified' : 'nq'}">${score.qualified ? 'Qualified' : 'Non-Qualifying'}</span>
                                    </div>
                                    <div class="score-item">
                                        <label>Placement:</label>
                                        <span>${score.placement ? this.getPlacementDisplay(score.placement) : 'No placement'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            ${score.exerciseScores ? `
                                <div class="exercises-section">
                                    <h4>Exercise Breakdown</h4>
                                    <table class="exercise-breakdown-table">
                                        <thead>
                                            <tr>
                                                <th>Exercise</th>
                                                <th>Max Points</th>
                                                <th>Points Lost</th>
                                                <th>Net Score</th>
                                                <th>Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${score.exerciseScores.map(exercise => `
                                                <tr>
                                                    <td>${exercise.exerciseName}</td>
                                                    <td>${exercise.maxPoints}</td>
                                                    <td>${exercise.nq ? 'NQ' : (exercise.pointsLost || 0)}</td>
                                                    <td>${exercise.nq ? 'NQ' : exercise.netScore}</td>
                                                    <td>${exercise.notes || '—'}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            ` : ''}
                            
                            ${score.judgeNotes ? `
                                <div class="notes-section">
                                    <h4>Judge Notes</h4>
                                    <div class="judge-notes">${score.judgeNotes}</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    static exportResults() {
        if (!this.currentResultsTrial) {
            App.showAlert('Please select a trial first', 'warning');
            return;
        }
        
        const results = this.currentResults || [];
        const csvData = this.resultsToCSV(results);
        const filename = `${this.currentResultsTrial.name.replace(/[^a-z0-9]/gi, '_')}_results.csv`;
        
        App.downloadFile(csvData, filename, 'text/csv');
        App.showAlert('Results exported successfully', 'success');
    }

    static resultsToCSV(results) {
        const headers = [
            'Placement', 'Handler', 'Dog', 'Registration', 'Class', 'Round',
            'Score', 'Max Score', 'Qualified', 'Judge', 'Date'
        ];
        
        const rows = results.map(result => [
            result.placement || '',
            result.handlerName,
            result.dogName,
            result.registrationNumber,
            result.className,
            result.round,
            result.hasNQ ? 'NQ' : (result.totalScore || 0),
            result.totalMaxPoints || '',
            result.qualified ? 'Yes' : 'No',
            result.judge || '',
            result.scoredAt ? new Date(result.scoredAt).toLocaleDateString() : ''
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    static generateCertificates() {
        if (!this.currentResultsTrial) {
            App.showAlert('Please select a trial first', 'warning');
            return;
        }
        
        const qualifiedResults = (this.currentResults || []).filter(result => result.qualified);
        
        if (qualifiedResults.length === 0) {
            App.showAlert('No qualified entries found', 'info');
            return;
        }
        
        // Generate qualification certificates
        this.createQualificationCertificates(qualifiedResults);
        App.showAlert(`Generated ${qualifiedResults.length} qualification certificates`, 'success');
    }

    static createQualificationCertificates(results) {
        const certificatesHtml = results.map(result => 
            this.generateQualificationCertificate(result)
        ).join('<div class="page-break"></div>');
        
        App.generatePrintableReport('Qualification Certificates', certificatesHtml);
    }

    static generateQualificationCertificate(result) {
        return `
            <div class="qualification-certificate">
                <div class="certificate-header">
                    <h1>Certificate of Qualification</h1>
                    <h2>C-WAGS Trial Event</h2>
                </div>
                
                <div class="certificate-body">
                    <p class="certificate-text">This certifies that</p>
                    <h3 class="handler-name">${result.handlerName}</h3>
                    <p class="certificate-text">and</p>
                    <h3 class="dog-name">${result.dogName}</h3>
                    <p class="certificate-text">have successfully qualified in</p>
                    <h3 class="class-name">${result.className} - ${result.round}</h3>
                    <p class="certificate-text">with a score of</p>
                    <h3 class="score">${result.totalScore} out of ${result.totalMaxPoints}</h3>
                    ${result.placement ? `<p class="placement">Earning ${this.getPlacementDisplay(result.placement)} Place</p>` : ''}
                </div>
                
                <div class="certificate-footer">
                    <div class="trial-info">
                        <p><strong>${this.currentResultsTrial.name}</strong></p>
                        <p>${App.formatDate(this.currentResultsTrial.date)}</p>
                        <p>${this.currentResultsTrial.venue?.city}, ${this.currentResultsTrial.venue?.state}</p>
                    </div>
                    
                    <div class="signatures">
                        <div class="signature-line">
                            <p>Judge: ${result.judge}</p>
                        </div>
                        <div class="signature-line">
                            <p>Trial Host: ${this.currentResultsTrial.host}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===================
    // SCOREBOARD
    // ===================

    static loadScoreboardTab() {
        this.loadTrialOptions();
    }

    static loadScoreboard() {
        const trialId = document.getElementById('scoreboard-trial-select').value;
        if (!trialId) {
            document.getElementById('scoreboard-content').innerHTML = 
                '<div class="scoreboard-message">Select a trial to display live scores</div>';
            return;
        }

        const trial = DataManager.getTrial(trialId);
        this.currentScoreboardTrial = trial;
        
        // Load class options
        const classSelect = document.getElementById('scoreboard-class-select');
        classSelect.innerHTML = '<option value="">All Classes</option>';
        trial.classes.forEach(classInfo => {
            const option = document.createElement('option');
            option.value = `${classInfo.name}-${classInfo.round}`;
            option.textContent = `${classInfo.name} - ${classInfo.round}`;
            classSelect.appendChild(option);
        });
        
        // Update scoreboard title
        document.getElementById('scoreboard-trial-name').textContent = trial.name;
        document.getElementById('scoreboard-title').textContent = `${trial.name} - Live Results`;
        
        this.updateScoreboard();
    }

    static updateScoreboard() {
        if (!this.currentScoreboardTrial) return;
        
        const classFilter = document.getElementById('scoreboard-class-select').value;
        let scores = DataManager.getTrialScores(this.currentScoreboardTrial.id);
        const entries = DataManager.getTrialEntries(this.currentScoreboardTrial.id);
        
        // Apply class filter
        if (classFilter) {
            const [className, round] = classFilter.split('-');
            scores = scores.filter(score => score.className === className && score.round === round);
        }
        
        // Combine with entry data and sort
        const results = scores.map        grid.innerHTML = this.classEntries.map((entry, index) => {
            const existingScore = DataManager.getScoresForEntry(entry.id)
                .find(s => s.className === this.currentClass.name && s.round === this.currentClass.round);
            
            const status = existingScore ? 'scored' : 'unscored';
            const score = existingScore ? existingScore.totalScore : '';
            const qualified = existingScore ? (existingScore.qualified ? 'Q' : 'NQ') : '';
            
            return `
                <div class="entry-card ${status}" data-entry-index="${index}">
                    <div class="entry-header">
                        <div class="entry-number">${index + 1}</div>
                        <div class="entry-status ${status}">${status === 'scored' ? '✓' : '○'}</div>
                    </div>
                    <div class="entry-info">
                        <div class="handler-name">${entry.handlerName}</div>
                        <div class="dog-name">${entry.dogName}</div>
                        <div class="entry-details">
                            <span class="reg-number">${entry.registrationNumber}</span>
                            <span class="jump-height">${entry.jumpHeight}"</span>
                            <span class="entry-type">${entry.entryType?.toUpperCase() || 'REG'}</span>
                        </div>
                    </div>
                    <div class="entry-score">
                        ${score ? `<div class="score-display">${score}</div>` : ''}
                        ${qualified ? `<div class="qualification-display ${qualified.toLowerCase()}">${qualified}</div>` : ''}
                    </div>
                    <div class="entry-actions">
                        <button class="btn btn-primary btn-sm" onclick="ScoringSystem.scoreEntry(${index})">
                            ${status === 'scored' ? 'Edit Score' : 'Score'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    static updateScoringProgress() {
        const scored = this.classEntries.filter((entry, index) => {
            const existingScore = DataManager.getScoresForEntry(entry.id)
                .find(s => s.className === this.currentClass.name && s.round === this.currentClass.round);
            return existingScore;
        }).length;
        
        const total = this.classEntries.length;
        const percentage = total > 0 ? (scored / total) * 100 : 0;
        
        document.getElementById('progress-text').textContent = `${scored} of ${total} scored`;
        document.getElementById('progress-fill').style.width = `${percentage}%`;
    }

    static scoreEntry(entryIndex) {
        this.currentEntryIndex = entryIndex;
        this.currentEntry = this.classEntries[entryIndex];
        this.loadDigitalScoreSheet();
    }

    static loadDigitalScoreSheet() {
        if (!this.currentEntry || !this.currentClass) return;

        // Update competitor information
        document.getElementById('competitor-name').textContent = 
            `${this.currentEntry.handlerName} & ${this.currentEntry.dogName}`;
        document.getElementById('competitor-reg').textContent = 
            `Reg: ${this.currentEntry.registrationNumber}`;
        document.getElementById('competitor-height').textContent = 
            `Height: ${this.currentEntry.jumpHeight}"`;
        document.getElementById('competitor-type').textContent = 
            `Type: ${this.currentEntry.entryType?.toUpperCase() || 'REG'}`;

        // Load exercises for this class
        this.loadExercises();
        
        // Load existing score if available
        this.loadExistingScore();
        
        // Show the score sheet
        document.getElementById('digital-score-sheet').style.display = 'block';
        document.getElementById('running-order-display').style.display = 'none';
    }

    static loadExercises() {
        const exercises = this.getExercisesForClass(this.currentClass.round);
        const container = document.getElementById('exercises-section');
        
        container.innerHTML = exercises.map((exercise, index) => `
            <div class="exercise-card" data-exercise-index="${index}">
                <div class="exercise-header">
                    <h4>${exercise.name}</h4>
                    <div class="exercise-points">Max: ${exercise.maxPoints} pts</div>
                </div>
                
                ${exercise.description ? `
                    <div class="exercise-description">${exercise.description}</div>
                ` : ''}
                
                <div class="scoring-options">
                    <div class="deduction-buttons">
                        <button class="deduction-btn nq-btn" onclick="ScoringSystem.applyNQ(${index})" data-type="nq">
                            NQ
                        </button>
                        <button class="deduction-btn major-btn" onclick="ScoringSystem.applyDeduction(${index}, 'major', 5)" data-type="major">
                            Major (-5)
                        </button>
                        <button class="deduction-btn minor-btn" onclick="ScoringSystem.applyDeduction(${index}, 'minor', 3)" data-type="minor">
                            Minor (-3)
                        </button>
                        <button class="deduction-btn slight-btn" onclick="ScoringSystem.applyDeduction(${index}, 'slight', 1)" data-type="slight">
                            Slight (-1)
                        </button>
                    </div>
                    
                    <div class="custom-deduction">
                        <label>Custom:</label>
                        <input type="number" class="custom-input" min="0" max="${exercise.maxPoints}" 
                               step="0.5" placeholder="0" 
                               onchange="ScoringSystem.applyCustomDeduction(${index}, this.value)">
                        <span>pts lost</span>
                    </div>
                </div>
                
                <div class="exercise-score">
                    <div class="points-lost">
                        Points Lost: <span class="lost-points" id="lost-${index}">0</span>
                    </div>
                    <div class="net-score">
                        Net Score: <span class="net-points" id="net-${index}">${exercise.maxPoints}</span>
                    </div>
                </div>
                
                <div class="exercise-notes">
                    <textarea class="exercise-note" placeholder="Exercise notes..." rows="2"></textarea>
                </div>
            </div>
        `).join('');
        
        // Initialize scoring totals
        this.updateScoringTotals();
    }

    static getExercisesForClass(round) {
        const exercises = {
            'CTH': [
                {
                    name: 'Call to Heel',
                    description: 'Handler calls dog from 4 feet away (begins in sit)',
                    maxPoints: 10,
                    deductions: {
                        major: ['Fail to heel - 5 pts'],
                        minor: ['Ext cue 3 pts', 'No sit 3pts']
                    }
                },
                {
                    name: 'Leave Dog / Call Dog',
                    description: 'Handler leaves, calls dog back',
                    maxPoints: 40,
                    deductions: {
                        major: ['turns wrong 5pts'],
                        minor: ['Ext cue 3 pts', 'No sit 3pts']
                    }
                },
                {
                    name: 'On-Leash Heeling',
                    description: 'Tie-breaker exercise',
                    maxPoints: 20,
                    deductions: {
                        major: ['Fail to front - 5 pts'],
                        minor: ['Ext cue 3 pts', 'No sit/sits on Forward 3pts']
                    }
                }
            ],
            'FFF': [
                {
                    name: 'Find Front Forward',
                    description: 'Tie-breaker exercise',
                    maxPoints: 30,
                    deductions: {
                        major: ['Fail to front - 5 pts'],
                        minor: ['Ext cue 3 pts', 'No sit 3pts']
                    }
                },
                {
                    name: 'Sit Stay',
                    description: '1 minute stay',
                    maxPoints: 20,
                    deductions: {
                        major: ['Breaks stay - 5 pts'],
                        minor: ['Ext cue 3 pts']
                    }
                }
            ],
            'WA': [
                {
                    name: 'Walk About',
                    description: 'Tie-breaker exercise',
                    maxPoints: 40,
                    deductions: {
                        major: ['Fails to follow - 5 pts'],
                        minor: ['Ext cue 3 pts', 'Lags/forges']
                    }
                }
            ],
            'CTH2': [
                {
                    name: 'Call to Heel',
                    description: 'Handler calls dog from 4 feet away (begins in sit)',
                    maxPoints: 10,
                    deductions: {
                        major: ['Fail to heel - 5 pts'],
                        minor: ['Ext cue 3 pts', 'No sit 3pts']
                    }
                },
                {
                    name: 'On-Leash Heeling',
                    description: 'With turns',
                    maxPoints: 30,
                    deductions: {
                        major: ['Wrong turn - 5 pts'],
                        minor: ['Ext cue 3 pts', 'No sit 3pts']
                    }
                },
                {
                    name: 'Find Front Forward',
                    description: 'Tie-breaker exercise',
                    maxPoints: 30,
                    deductions: {
                        major: ['Fail to front - 5 pts'],
                        minor: ['Ext cue 3 pts', 'No sit 3pts']
                    }
                }
            ],
            'Video': [
                {
                    name: 'Video Submission',
                    description: 'All exercises combined in video format',
                    maxPoints: 100,
                    deductions: {
                        major: ['Major errors - 5+ pts'],
                        minor: ['Minor errors - 1-3 pts']
                    }
                }
            ]
        };
        
        return exercises[round] || [];
    }

    static applyNQ(exerciseIndex) {
        const lostSpan = document.getElementById(`lost-${exerciseIndex}`);
        const netSpan = document.getElementById(`net-${exerciseIndex}`);
        
        lostSpan.textContent = 'NQ';
        netSpan.textContent = 'NQ';
        
        // Clear any custom input
        const customInput = document.querySelector(`[data-exercise-index="${exerciseIndex}"] .custom-input`);
        customInput.value = '';
        
        // Update button states
        this.updateDeductionButtons(exerciseIndex, 'nq');
        this.updateScoringTotals();
    }

    static applyDeduction(exerciseIndex, type, points) {
        const exercises = this.getExercisesForClass(this.currentClass.round);
        const exercise = exercises[exerciseIndex];
        
        const lostSpan = document.getElementById(`lost-${exerciseIndex}`);
        const netSpan = document.getElementById(`net-${exerciseIndex}`);
        
        lostSpan.textContent = points;
        netSpan.textContent = Math.max(0, exercise.maxPoints - points);
        
        // Clear any custom input
        const customInput = document.querySelector(`[data-exercise-index="${exerciseIndex}"] .custom-input`);
        customInput.value = '';
        
        // Update button states
        this.updateDeductionButtons(exerciseIndex, type);
        this.updateScoringTotals();
    }

    static applyCustomDeduction(exerciseIndex, deduction) {
        const exercises = this.getExercisesForClass(this.currentClass.round);
        const exercise = exercises[exerciseIndex];
        
        const points = parseFloat(deduction) || 0;
        const lostSpan = document.getElementById(`lost-${exerciseIndex}`);
        const netSpan = document.getElementById(`net-${exerciseIndex}`);
        
        if (points >= exercise.maxPoints) {
            lostSpan.textContent = 'NQ';
            netSpan.textContent = 'NQ';
        } else {
            lostSpan.textContent = points;
            netSpan.textContent = Math.max(0, exercise.maxPoints - points);
        }
        
        // Clear button states
        this.updateDeductionButtons(exerciseIndex, 'custom');
        this.updateScoringTotals();
    }

    static updateDeductionButtons(exerciseIndex, activeType) {
        const card = document.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
        const buttons = card.querySelectorAll('.deduction-btn');
        
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === activeType) {
                btn.classList.add('active');
            }
        });
    }

    static updateScoringTotals() {
        const exercises = this.getExercisesForClass(this.currentClass.round);
        let totalPointsLost = 0;
        let hasNQ = false;
        let totalMaxPoints = 0;
        
        exercises.forEach((exercise, index) => {
            totalMaxPoints += exercise.maxPoints;
            const lostSpan = document.getElementById(`lost-${index}`);
            const lostValue = lostSpan.textContent;
            
            if (lostValue === 'NQ') {
                hasNQ = true;
            } else {
                totalPointsLost += parseFloat(lostValue) || 0;
            }
        });
        
        const finalScore = hasNQ ? 'NQ' : (totalMaxPoints - totalPointsLost);
        const qualifyingScore = Math.ceil(totalMaxPoints * 0.7);
        
        document.getElementById('total-points-lost').textContent = hasNQ ? 'NQ' : totalPointsLost;
        document.getElementById('final-score').textContent = finalScore;
        document.getElementById('qualifying-score').textContent = qualifyingScore;
        
        // Update qualification status
        const qualified = !hasNQ && finalScore >= qualifyingScore;
        const qualificationResult = document.getElementById('qualification-result');
        qualificationResult.textContent = hasNQ ? 'Non-Qualifying (NQ)' : 
            (qualified ? 'Qualified' : 'Non-Qualifying');
        qualificationResult.className = `qualification-result ${hasNQ ? 'nq' : (qualified ? 'qualified' : 'nq')}`;
        
        // Enable/disable placement selection
        const placementSelect = document.getElementById('placement-select');
        placementSelect.disabled = !qualified;
        if (!qualified) {
            placementSelect.value = '';
        }
    }

    static previousEntry() {
        if (this.currentEntryIndex > 0) {
            this.currentEntryIndex--;
            this.currentEntry = this.classEntries[this.currentEntryIndex];
            this.loadDigitalScoreSheet();
        }
    }

    static nextEntry() {
        if (this.currentEntryIndex < this.classEntries.length - 1) {
            this.currentEntryIndex++;
            this.currentEntry = this.classEntries[this.currentEntryIndex];
            this.loadDigitalScoreSheet();
        }
    }

    static closeScoreSheet() {
        document.getElementById('digital-score-sheet').style.display = 'none';
        document.getElementById('running-order-display').style.display = 'block';
        this.displayRunningOrder(); // Refresh to show any updates
        this.updateScoringProgress();
    }

    static loadExistingScore() {
        const existingScore = DataManager.getScoresForEntry(this.currentEntry.id)
            .find(s => s.className === this.currentClass.name && s.round === this.currentClass.round);
        
        if (!existingScore) return;
        
        // Load exercise scores
        const exercises = this.getExercisesForClass(this.currentClass.round);
        exercises.forEach((exercise, index) => {
            const exerciseScore = existingScore.exerciseScores?.[index];
            if (exerciseScore) {
                const lostSpan = document.getElementById(`lost-${index}`);
                const netSpan = document.getElementById(`net-${index}`);
                
                if (exerciseScore.nq) {
                    lostSpan.textContent = 'NQ';
                    netSpan.textContent = 'NQ';
                    this.updateDeductionButtons(index, 'nq');
                } else {
                    lostSpan.textContent = exerciseScore.pointsLost || 0;
                    netSpan.textContent = exercise.maxPoints - (exerciseScore.pointsLost || 0);
                    
                    // Set appropriate button state
                    if (exerciseScore.pointsLost === 5) {
                        this.updateDeductionButtons(index, 'major');
                    } else if (exerciseScore.pointsLost === 3) {
                        this.updateDeductionButtons(index, 'minor');
                    } else if (exerciseScore.pointsLost === 1) {
                        this.updateDeductionButtons(index, 'slight');
                    } else if (exerciseScore.pointsLost > 0) {
                        this.updateDeductionButtons(index, 'custom');
                        const customInput = document.querySelector(`[data-exercise-index="${index}"] .custom-input`);
                        customInput.value = exerciseScore.pointsLost;
                    }
                }
                
                // Load exercise notes
                const noteTextarea = document.querySelector(`[data-exercise-index="${index}"] .exercise-note`);
                noteTextarea.value = exerciseScore.notes || '';
            }
        });
        
        // Load overall score data
        document.getElementById('placement-select').value = existingScore.placement || '';
        document.getElementById('judge-notes').value = existingScore.judgeNotes || '';
        
        this.updateScoringTotals();
    }

    static collectScoreData() {
        const exercises = this.getExercisesForClass(this.currentClass.round);
        const exerciseScores = [];
        let totalPointsLost = 0;
        let hasNQ = false;
        let totalMaxPoints = 0;
        
        exercises.forEach((exercise, index) => {
            totalMaxPoints += exercise.maxPoints;
            const lostSpan = document.getElementById(`lost-${index}`);
            const lostValue = lostSpan.textContent;
            const noteTextarea = document.querySelector(`[data-exercise-index="${index}"] .exercise-note`);
            
            const exerciseScore = {
                exerciseName: exercise.name,
                maxPoints: exercise.maxPoints,
                notes: noteTextarea.value
            };
            
            if (lostValue === 'NQ') {
                exerciseScore.nq = true;
                exerciseScore.pointsLost = exercise.maxPoints;
                exerciseScore.netScore = 0;
                hasNQ = true;
            } else {
                const pointsLost = parseFloat(lostValue) || 0;
                exerciseScore.nq = false;
                exerciseScore.pointsLost = pointsLost;
                exerciseScore.netScore = exercise.maxPoints - pointsLost;
                totalPointsLost += pointsLost;
            }
            
            exerciseScores.push(exerciseScore);
        });
        
        const finalScore = hasNQ ? 0 : (totalMaxPoints - totalPointsLost);
        const qualifyingScore = Math.ceil(totalMaxPoints * 0.7);
        const qualified = !hasNQ && finalScore >= qualifyingScore;
        
        return {
            entryId: this.currentEntry.id,
            trialId: this.currentTrial.id,
            className: this.currentClass.name,
            round: this.currentClass.round,
            exerciseScores: exerciseScores,
            totalMaxPoints: totalMaxPoints,
            totalPointsLost: totalPointsLost,
            totalScore: finalScore,
            qualifyingScore: qualifyingScore,
            qualified: qualified,
            hasNQ: hasNQ,
            placement: document.getElementById('placement-select').value || null,
            judgeNotes: document.getElementById('judge-notes').value,
            judge: document.getElementById('scoring-judge').value,
            scoredAt: new Date().toISOString(),
            scoredBy: Auth.getCurrentUser()?.id
        };
    }

    static async submitScore() {
        try {
            const scoreData = this.collectScoreData();
            
            // Validate score data
            if (!this.validateScoreData(scoreData)) {
                return;
            }
            
            // Save the score
            DataManager.saveScore(scoreData);
            
            App.showAlert('Score submitted successfully!', 'success');
            
            // Move to next entry or close if this was the last one
            if (this.currentEntryIndex < this.classEntries.length - 1) {
                this.nextEntry();
            } else {
                this.closeScoreSheet();
            }
            
        } catch (error) {
            App.handleError(error, 'Submit Score');
        }
    }

    static validateScoreData(scoreData) {
        // Check if all exercises have been scored
        const hasUnscoredExercises = scoreData.exerciseScores.some(exercise => 
            exercise.pointsLost === undefined && !exercise.nq
        );
        
        if (hasUnscoredExercises) {
            App.showAlert('Please score all exercises before submitting', 'warning');
            return false;
        }
        
        // Check placement validation
        if (scoreData.qualified && scoreData.placement) {
            const placement = parseInt(scoreData.placement);
            if (placement < 1 || placement > 4) {
                App.showAlert('Placement must be between 1st and 4th place', 'warning');
                return false;
            }
        }
        
        return true;
    }

    static saveDraftScore() {
        try {
            const scoreData = this.collectScoreData();
            scoreData.isDraft = true;
            
            DataManager.saveScore(scoreData);
            App.showAlert('Draft score saved', 'success');
            
        } catch (error) {
            App.handleError(error, 'Save Draft');
        }
    }

    static autoSaveScore() {
        if (!this.currentEntry || !this.currentClass) return;
        
        try {
            const scoreData = this.collectScoreData();
            scoreData.isDraft = true;
            scoreData.autoSaved = true;
            
            DataManager.saveScore(scoreData);
            console.log('Auto-saved score for', this.currentEntry.handlerName);
            
        } catch (error) {
            console.warn('Auto-save failed:', error);
        }
    }

    static resetScore() {
        if (confirm('Are you sure you want to reset this score? All current scoring will be lost.')) {
            // Reset all exercise scores
            const exercises = this.getExercisesForClass(this.currentClass.round);
            exercises.forEach((exercise, index) => {
                const lostSpan = document.getElementById(`lost-${index}`);
                const netSpan = document.getElementById(`net-${index}`);
                
                lostSpan.textContent = '0';
                netSpan.textContent = exercise.maxPoints;
                
                // Clear button states
                this.updateDeductionButtons(index, null);
                
                // Clear custom input and notes
                const customInput = document.querySelector(`[data-exercise-index="${index}"] .custom-input`);
                const noteTextarea = document.querySelector(`[data-exercise-index="${index}"] .exercise-note`);
                customInput.value = '';
                noteTextarea.value = '';
            });
            
            // Reset other fields
            document.getElementById('placement-select').value = '';
            document.getElementById('judge-notes').value = '';
            
            this.updateScoringTotals();
        }
    }

    static handleScoringKeyboard(e) {
        // Keyboard shortcuts for faster scoring
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    this.submitScore();
                    break;
                case 'd':
                    e.preventDefault();
                    this.saveDraftScore();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousEntry();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextEntry();
                    break;
            }
        }
    }

    // ===================
    // MANUAL SCORE ENTRY
    // ===================

    static loadManualScoreEntry() {
        this.loadTrialOptions();
    }

    static loadManualScoreOptions() {
        const trialId = document.getElementById('manual-trial-select').value;
        if (!trialId) {
            document.getElementById('manual-class-select').innerHTML = '<option value="">Select class...</option>';
            return;
        }

        const trial = DataManager.getTrial(trialId);
        const classSelect = document.getElementById('manual-class-select');
        
        classSelect.innerHTML = '<option value="">Select class...</option>';
        trial.classes.forEach(classInfo => {
            const option = document.createElement('option');
            option.value = JSON.stringify(classInfo);
            option.textContent = `${classInfo.name} - ${classInfo.round}`;
            classSelect.appendChild(option);
        });
    }

    static loadManualEntries() {
        const trialId = document.getElementById('manual-trial-select').value;
        const classData = document.getElementById('manual-class-select').value;
        
        if (!trialId || !classData) {
            document.getElementById('manual-entry-select').innerHTML = '<option value="">Select entry...</option>';
            return;
        }

        const classInfo = JSON.parse(classData);
        const entries = DataManager.getTrialEntries(trialId);
        const classEntries = entries.filter(entry => entry.classes.includes(classInfo.name));
        
        const entrySelect = document.getElementById('manual-entry-select');
        entrySelect.innerHTML = '<option value="">Select entry...</option>';
        
        classEntries.forEach(entry => {
            const option = document.createElement('option');
            option.value = entry.id;
            option.textContent = `${entry.handlerName} & ${entry.dogName}`;
            entrySelect.appendChild(option);
        });
    }

    static loadManualScoreForm() {
        const entryId = document.getElementById('manual-entry-select').value;
        const classData = document.getElementById('manual-class-select').value;
        
        if (!entryId || !classData) {
            document.getElementById('manual-score-form').style.display = 'none';
            return;
        }

        const entry = DataManager.getEntry(entryId);
        const classInfo = JSON.parse(classData);
        
        this.currentManualEntry = entry;
        this.currentManualClass = classInfo;
        
        // Display entry information
        document.getElementById('manual-entry-info').innerHTML = `
            <div class="manual-entry-details">
                <div><strong>Handler:</strong> ${entry.handlerName}</div>
                <div><strong>Dog:</strong> ${entry.dogName}</div>
                <div><strong>Registration:</strong> ${entry.registrationNumber}</div>
                <div><strong>Class:</strong> ${classInfo.name} - ${classInfo.round}</div>
                <div><strong>Jump Height:</strong> ${entry.jumpHeight}"</div>
            </div>
        `;
        
        // Load exercises
        this.loadManualExerciseTable();
        
        // Load existing score if available
        this.loadExistingManualScore();
        
        document.getElementById('manual-score-form').style.display = 'block';
    }

    static loadManualExerciseTable() {
        const exercises = this.getExercisesForClass(this.currentManualClass.round);
        const tbody = document.getElementById('manual-exercises-tbody');
        const totalMaxPoints = exercises.reduce((sum, ex) => sum + ex.maxPoints, 0);
        
        document.getElementById('manual-max-score').value = totalMaxPoints;
        
        tbody.innerHTML = exercises.map((exercise, index) => `
            <tr data-exercise-index="${index}">
                <td class="exercise-name">${exercise.name}</td>
                <td class="max-points">${exercise.maxPoints}</td>
                <td class="deductions-input">
                    <input type="number" class="deduction-input" min="0" max="${exercise.maxPoints}" 
                           step="0.5" placeholder="0" onchange="ScoringSystem.updateManualExerciseScore(${index})">
                </td>
                <td class="nq-checkbox">
                    <input type="checkbox" class="nq-checkbox" onchange="ScoringSystem.updateManualExerciseScore(${index})">
                </td>
                <td class="net-score">
                    <span class="net-score-display">${exercise.maxPoints}</span>
                </td>
            </tr>
        `).join('');
        
        this.updateManualTotalScore();
    }

    static updateManualExerciseScore(exerciseIndex) {
        const row = document.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
        const deductionInput = row.querySelector('.deduction-input');
        const nqCheckbox = row.querySelector('.nq-checkbox');
        const netScoreDisplay = row.querySelector('.net-score-display');
        const maxPointsCell = row.querySelector('.max-points');
        
        const maxPoints = parseInt(maxPointsCell.textContent);
        
        if (nqCheckbox.checked) {
            netScoreDisplay.textContent = 'NQ';
            deductionInput.disabled = true;
            deductionInput.value = '';
        } else {
            deductionInput.disabled = false;
            const deduction = parseFloat(deductionInput.value) || 0;
            const netScore = Math.max(0, maxPoints - deduction);
            netScoreDisplay.textContent = netScore;
        }
        
        this.updateManualTotalScore();
    }

    static updateManualTotalScore() {
        const exercises = this.getExercisesForClass(this.currentManualClass.round);
        let totalScore = 0;
        let hasNQ = false;
        
        exercises.forEach((exercise, index) => {
            const row = document.querySelector(`[data-exercise-index="${index}"]`);
            const nqCheckbox = row.querySelector('.nq-checkbox');
            const netScoreDisplay = row.querySelector('.net-score-display');
            
            if (nqCheckbox.checked) {
                hasNQ = true;
            } else {
                const netScore = parseFloat(netScoreDisplay// js/modules/scoring-system.js
class ScoringSystem {
    static init() {
        this.currentTrial = null;
        this.currentClass = null;
        this.currentEntry = null;
        this.scoringMode = 'digital'; // 'digital' or 'traditional'
        this.loadModule();
        this.setupEventListeners();
        this.loadInitialData();
    }

    static loadModule() {
        const container = document.getElementById('module-container');
        container.innerHTML = `
            <div class="scoring-system-module">
                <div class="module-header">
                    <h2>🏆 Scoring & Results</h2>
                    <p>Digital scoring system and results management</p>
                </div>

                <div class="scoring-system-content">
                    <!-- Scoring Tabs -->
                    <div class="scoring-tabs">
                        <button class="scoring-tab active" data-tab="scoring-interface">
                            Digital Scoring
                        </button>
                        <button class="scoring-tab" data-tab="score-entry">
                            Manual Score Entry
                        </button>
                        <button class="scoring-tab" data-tab="results-management">
                            Results Management
                        </button>
                        <button class="scoring-tab" data-tab="scoreboard">
                            Live Scoreboard
                        </button>
                        <button class="scoring-tab" data-tab="reports">
                            Reports & Analysis
                        </button>
                    </div>

                    <!-- Digital Scoring Interface -->
                    <div id="scoring-interface" class="scoring-tab-content active">
                        <div class="scoring-interface-container">
                            <!-- Trial and Class Selection -->
                            <div class="scoring-controls">
                                <div class="control-group">
                                    <label for="scoring-trial-select">Select Trial:</label>
                                    <select id="scoring-trial-select" onchange="ScoringSystem.onTrialChange()">
                                        <option value="">Choose trial...</option>
                                    </select>
                                </div>
                                <div class="control-group">
                                    <label for="scoring-class-select">Select Class:</label>
                                    <select id="scoring-class-select" onchange="ScoringSystem.onClassChange()">
                                        <option value="">Choose class...</option>
                                    </select>
                                </div>
                                <div class="control-group">
                                    <label for="scoring-judge">Judge:</label>
                                    <input type="text" id="scoring-judge" readonly>
                                </div>
                                <div class="control-group">
                                    <button class="btn btn-primary" onclick="ScoringSystem.startScoring()" id="start-scoring-btn" disabled>
                                        Start Scoring Session
                                    </button>
                                </div>
                            </div>

                            <!-- Running Order Display -->
                            <div id="running-order-display" class="running-order-display" style="display: none;">
                                <div class="running-order-header">
                                    <h3>Running Order - <span id="current-class-name"></span></h3>
                                    <div class="scoring-progress">
                                        <span id="progress-text">0 of 0 scored</span>
                                        <div class="progress-bar">
                                            <div class="progress-fill" id="progress-fill"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="entries-grid" id="entries-grid">
                                    <!-- Entries will be loaded here -->
                                </div>
                            </div>

                            <!-- Digital Score Sheet -->
                            <div id="digital-score-sheet" class="digital-score-sheet" style="display: none;">
                                <div class="score-sheet-header">
                                    <div class="competitor-info">
                                        <h3 id="competitor-name">Handler & Dog</h3>
                                        <div class="competitor-details">
                                            <span id="competitor-reg">Registration #</span>
                                            <span id="competitor-height">Jump Height</span>
                                            <span id="competitor-type">Entry Type</span>
                                        </div>
                                    </div>
                                    <div class="score-sheet-controls">
                                        <button class="btn btn-secondary" onclick="ScoringSystem.previousEntry()">‹ Previous</button>
                                        <button class="btn btn-secondary" onclick="ScoringSystem.nextEntry()">Next ›</button>
                                        <button class="btn btn-danger" onclick="ScoringSystem.closeScoreSheet()">Close</button>
                                    </div>
                                </div>

                                <div class="scoring-content">
                                    <div class="exercises-section" id="exercises-section">
                                        <!-- Exercises will be loaded here -->
                                    </div>

                                    <div class="scoring-summary">
                                        <div class="score-totals">
                                            <div class="total-item">
                                                <label>Total Points Lost:</label>
                                                <span id="total-points-lost">0</span>
                                            </div>
                                            <div class="total-item">
                                                <label>Final Score:</label>
                                                <span id="final-score">0</span>
                                            </div>
                                            <div class="total-item">
                                                <label>Qualifying Score:</label>
                                                <span id="qualifying-score">0</span>
                                            </div>
                                        </div>

                                        <div class="qualification-section">
                                            <div class="qualification-status" id="qualification-status">
                                                <span class="qualification-label">Qualification Status:</span>
                                                <span class="qualification-result" id="qualification-result">Calculating...</span>
                                            </div>
                                            
                                            <div class="placement-section">
                                                <label for="placement-select">Placement (if qualified):</label>
                                                <select id="placement-select">
                                                    <option value="">No placement</option>
                                                    <option value="1">1st Place</option>
                                                    <option value="2">2nd Place</option>
                                                    <option value="3">3rd Place</option>
                                                    <option value="4">4th Place</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div class="judge-notes">
                                            <label for="judge-notes">Judge Notes:</label>
                                            <textarea id="judge-notes" rows="3" placeholder="Optional notes about this run"></textarea>
                                        </div>

                                        <div class="scoring-actions">
                                            <button class="btn btn-warning" onclick="ScoringSystem.saveDraftScore()">Save Draft</button>
                                            <button class="btn btn-success" onclick="ScoringSystem.submitScore()" id="submit-score-btn">Submit Score</button>
                                            <button class="btn btn-secondary" onclick="ScoringSystem.resetScore()">Reset</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Manual Score Entry -->
                    <div id="score-entry" class="scoring-tab-content">
                        <div class="manual-score-entry">
                            <div class="entry-controls">
                                <div class="control-row">
                                    <div class="control-group">
                                        <label for="manual-trial-select">Trial:</label>
                                        <select id="manual-trial-select" onchange="ScoringSystem.loadManualScoreOptions()">
                                            <option value="">Select trial...</option>
                                        </select>
                                    </div>
                                    <div class="control-group">
                                        <label for="manual-class-select">Class:</label>
                                        <select id="manual-class-select" onchange="ScoringSystem.loadManualEntries()">
                                            <option value="">Select class...</option>
                                        </select>
                                    </div>
                                    <div class="control-group">
                                        <label for="manual-entry-select">Entry:</label>
                                        <select id="manual-entry-select" onchange="ScoringSystem.loadManualScoreForm()">
                                            <option value="">Select entry...</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div id="manual-score-form" class="manual-score-form" style="display: none;">
                                <div class="form-header">
                                    <h3>Manual Score Entry</h3>
                                    <div class="entry-info" id="manual-entry-info">
                                        <!-- Entry information will be displayed here -->
                                    </div>
                                </div>

                                <div class="score-input-section">
                                    <div class="input-method-selector">
                                        <label>
                                            <input type="radio" name="input-method" value="deductions" checked onchange="ScoringSystem.toggleInputMethod()">
                                            Enter by Deductions
                                        </label>
                                        <label>
                                            <input type="radio" name="input-method" value="total" onchange="ScoringSystem.toggleInputMethod()">
                                            Enter Total Score
                                        </label>
                                    </div>

                                    <!-- Deductions Input -->
                                    <div id="deductions-input" class="deductions-input">
                                        <table class="manual-score-table">
                                            <thead>
                                                <tr>
                                                    <th>Exercise</th>
                                                    <th>Max Points</th>
                                                    <th>Deductions</th>
                                                    <th>NQ</th>
                                                    <th>Net Score</th>
                                                </tr>
                                            </thead>
                                            <tbody id="manual-exercises-tbody">
                                                <!-- Exercises will be loaded here -->
                                            </tbody>
                                        </table>
                                    </div>

                                    <!-- Total Score Input -->
                                    <div id="total-score-input" class="total-score-input" style="display: none;">
                                        <div class="score-input-row">
                                            <div class="input-group">
                                                <label for="manual-total-score">Total Score:</label>
                                                <input type="number" id="manual-total-score" min="0" step="0.5" onchange="ScoringSystem.updateManualQualification()">
                                            </div>
                                            <div class="input-group">
                                                <label for="manual-max-score">Maximum Possible:</label>
                                                <input type="number" id="manual-max-score" readonly>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="manual-score-summary">
                                        <div class="summary-row">
                                            <div class="summary-item">
                                                <label>Final Score:</label>
                                                <span id="manual-final-score">0</span>
                                            </div>
                                            <div class="summary-item">
                                                <label>Qualification:</label>
                                                <span id="manual-qualification">TBD</span>
                                            </div>
                                        </div>
                                        
                                        <div class="manual-placement">
                                            <label for="manual-placement">Placement:</label>
                                            <select id="manual-placement">
                                                <option value="">No placement</option>
                                                <option value="1">1st Place</option>
                                                <option value="2">2nd Place</option>
                                                <option value="3">3rd Place</option>
                                                <option value="4">4th Place</option>
                                            </select>
                                        </div>

                                        <div class="manual-notes">
                                            <label for="manual-judge-notes">Judge Notes:</label>
                                            <textarea id="manual-judge-notes" rows="3"></textarea>
                                        </div>

                                        <div class="manual-actions">
                                            <button class="btn btn-success" onclick="ScoringSystem.submitManualScore()">Submit Score</button>
                                            <button class="btn btn-secondary" onclick="ScoringSystem.resetManualScore()">Reset</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Results Management -->
                    <div id="results-management" class="scoring-tab-content">
                        <div class="results-management-container">
                            <div class="results-controls">
                                <div class="control-row">
                                    <div class="control-group">
                                        <label for="results-trial-select">Trial:</label>
                                        <select id="results-trial-select" onchange="ScoringSystem.loadResultsForTrial()">
                                            <option value="">Select trial...</option>
                                        </select>
                                    </div>
                                    <div class="control-group">
                                        <label for="results-class-filter">Class Filter:</label>
                                        <select id="results-class-filter" onchange="ScoringSystem.filterResults()">
                                            <option value="">All Classes</option>
                                        </select>
                                    </div>
                                    <div class="control-group">
                                        <label for="results-status-filter">Status Filter:</label>
                                        <select id="results-status-filter" onchange="ScoringSystem.filterResults()">
                                            <option value="">All Statuses</option>
                                            <option value="scored">Scored</option>
                                            <option value="unscored">Unscored</option>
                                            <option value="qualified">Qualified</option>
                                            <option value="nq">Non-Qualifying</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="results-actions">
                                    <button class="btn btn-primary" onclick="ScoringSystem.calculatePlacements()">Calculate Placements</button>
                                    <button class="btn btn-secondary" onclick="ScoringSystem.exportResults()">Export Results</button>
                                    <button class="btn btn-secondary" onclick="ScoringSystem.generateCertificates()">Generate Certificates</button>
                                </div>
                            </div>

                            <div class="results-summary" id="results-summary">
                                <div class="summary-stats">
                                    <div class="stat-card">
                                        <div class="stat-number" id="total-scored">0</div>
                                        <div class="stat-label">Total Scored</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-number" id="total-qualified">0</div>
                                        <div class="stat-label">Qualified</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-number" id="qualification-rate">0%</div>
                                        <div class="stat-label">Qualification Rate</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-number" id="average-score">0</div>
                                        <div class="stat-label">Average Score</div>
                                    </div>
                                </div>
                            </div>

                            <div class="results-table-container">
                                <table class="results-table" id="results-table">
                                    <thead>
                                        <tr>
                                            <th onclick="ScoringSystem.sortResults('placement')">Placement</th>
                                            <th onclick="ScoringSystem.sortResults('handlerName')">Handler</th>
                                            <th onclick="ScoringSystem.sortResults('dogName')">Dog</th>
                                            <th onclick="ScoringSystem.sortResults('className')">Class</th>
                                            <th onclick="ScoringSystem.sortResults('score')">Score</th>
                                            <th onclick="ScoringSystem.sortResults('qualified')">Qualified</th>
                                            <th>Judge</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="results-tbody">
                                        <tr>
                                            <td colspan="8" class="loading">Select a trial to view results</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Live Scoreboard -->
                    <div id="scoreboard" class="scoring-tab-content">
                        <div class="scoreboard-container">
                            <div class="scoreboard-controls">
                                <div class="control-row">
                                    <div class="control-group">
                                        <label for="scoreboard-trial-select">Trial:</label>
                                        <select id="scoreboard-trial-select" onchange="ScoringSystem.loadScoreboard()">
                                            <option value="">Select trial...</option>
                                        </select>
                                    </div>
                                    <div class="control-group">
                                        <label for="scoreboard-class-select">Class:</label>
                                        <select id="scoreboard-class-select" onchange="ScoringSystem.updateScoreboard()">
                                            <option value="">All Classes</option>
                                        </select>
                                    </div>
                                    <div class="control-group">
                                        <label>
                                            <input type="checkbox" id="auto-refresh" onchange="ScoringSystem.toggleAutoRefresh()">
                                            Auto-refresh (30s)
                                        </label>
                                    </div>
                                    <div class="control-group">
                                        <button class="btn btn-primary" onclick="ScoringSystem.refreshScoreboard()">Refresh Now</button>
                                        <button class="btn btn-secondary" onclick="ScoringSystem.fullscreenScoreboard()">Fullscreen</button>
                                    </div>
                                </div>
                            </div>

                            <div class="scoreboard-display" id="scoreboard-display">
                                <div class="scoreboard-header">
                                    <h2 id="scoreboard-title">Live Scoreboard</h2>
                                    <div class="scoreboard-info">
                                        <span id="scoreboard-trial-name">Select Trial</span>
                                        <span id="scoreboard-last-update">Last updated: Never</span>
                                    </div>
                                </div>

                                <div class="scoreboard-content" id="scoreboard-content">
                                    <div class="scoreboard-message">Select a trial to display live scores</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Reports & Analysis -->
                    <div id="reports" class="scoring-tab-content">
                        <div class="reports-container">
                            <div class="reports-grid">
                                <!-- Score Reports -->
                                <div class="report-category">
                                    <h3>📊 Score Reports</h3>
                                    <div class="report-buttons">
                                        <button class="report-btn" onclick="ScoringSystem.generateScoreReport()">
                                            <div class="report-icon">📋</div>
                                            <div class="report-text">Complete Score Report</div>
                                        </button>
                                        <button class="report-btn" onclick="ScoringSystem.generateClassResults()">
                                            <div class="report-icon">🏆</div>
                                            <div class="report-text">Class Results Summary</div>
                                        </button>
                                        <button class="report-btn" onclick="ScoringSystem.generateQualificationReport()">
                                            <div class="report-icon">✅</div>
                                            <div class="report-text">Qualification Report</div>
                                        </button>
                                    </div>
                                </div>

                                <!-- Statistics -->
                                <div class="report-category">
                                    <h3>📈 Statistics & Analysis</h3>
                                    <div class="report-buttons">
                                        <button class="report-btn" onclick="ScoringSystem.generateStatisticsReport()">
                                            <div class="report-icon">📊</div>
                                            <div class="report-text">Trial Statistics</div>
                                        </button>
                                        <button class="report-btn" onclick="ScoringSystem.generateJudgeAnalysis()">
                                            <div class="report-icon">👨‍⚖️</div>
                                            <div class="report-text">Judge Analysis</div>
                                        </button>
                                        <button class="report-btn" onclick="ScoringSystem.generateTrendAnalysis()">
                                            <div class="report-icon">📈</div>
                                            <div class="report-text">Trend Analysis</div>
                                        </button>
                                    </div>
                                </div>

                                <!-- Certificates & Awards -->
                                <div class="report-category">
                                    <h3>🏅 Certificates & Awards</h3>
                                    <div class="report-buttons">
                                        <button class="report-btn" onclick="ScoringSystem.generateQualificationCertificates()">
                                            <div class="report-icon">🎓</div>
                                            <div class="report-text">Qualification Certificates</div>
                                        </button>
                                        <button class="report-btn" onclick="ScoringSystem.generatePlacementAwards()">
                                            <div class="report-icon">🏆</div>
                                            <div class="report-text">Placement Awards</div>
                                        </button>
                                        <button class="report-btn" onclick="ScoringSystem.generateTitleProgress()">
                                            <div class="report-icon">⭐</div>
                                            <div class="report-text">Title Progress Report</div>
                                        </button>
                                    </div>
                                </div>

                                <!-- Export Options -->
                                <div class="report-category">
                                    <h3>💾 Export & Integration</h3>
                                    <div class="report-buttons">
                                        <button class="report-btn" onclick="ScoringSystem.exportToCSV()">
                                            <div class="report-icon">📄</div>
                                            <div class="report-text">Export to CSV</div>
                                        </button>
                                        <button class="report-btn" onclick="ScoringSystem.exportToPDF()">
                                            <div class="report-icon">📑</div>
                                            <div class="report-text">Export to PDF</div>
                                        </button>
                                        <button class="report-btn" onclick="ScoringSystem.exportToRegistry()">
                                            <div class="report-icon">🗂️</div>
                                            <div class="report-text">Submit to Registry</div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Report Viewer -->
                            <div id="report-viewer" class="report-viewer" style="display: none;">
                                <div class="report-viewer-header">
                                    <h3 id="report-title">Report</h3>
                                    <div class="report-viewer-controls">
                                        <button class="btn btn-primary" onclick="ScoringSystem.printReport()">Print</button>
                                        <button class="btn btn-secondary" onclick="ScoringSystem.downloadReport()">Download</button>
                                        <button class="btn btn-secondary" onclick="ScoringSystem.closeReportViewer()">Close</button>
                                    </div>
                                </div>
                                <div id="report-content" class="report-content">
                                    <!-- Report content will be loaded here -->
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
        document.querySelectorAll('.scoring-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Keyboard shortcuts for scoring
        document.addEventListener('keydown', (e) => {
            if (this.isScoring && document.getElementById('digital-score-sheet').style.display !== 'none') {
                this.handleScoringKeyboard(e);
            }
        });

        // Auto-save functionality
        this.setupAutoSave();
    }

    static setupAutoSave() {
        // Auto-save scores every 30 seconds when actively scoring
        setInterval(() => {
            if (this.isScoring && this.currentEntry) {
                this.autoSaveScore();
            }
        }, 30000);
    }

    static switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.scoring-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.scoring-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load tab-specific data
        switch(tabName) {
            case 'scoring-interface':
                this.loadScoringInterface();
                break;
            case 'score-entry':
                this.loadManualScoreEntry();
                break;
            case 'results-management':
                this.loadResultsManagement();
                break;
            case 'scoreboard':
                this.loadScoreboardTab();
                break;
            case 'reports':
                this.loadReportsTab();
                break;
        }
    }

    static async loadInitialData() {
        try {
            App.showLoading('Loading scoring system...');
            
            await Promise.all([
                this.loadTrialOptions(),
                this.loadScoringInterface()
            ]);
            
        } catch (error) {
            App.handleError(error, 'Scoring System');
        } finally {
            App.hideLoading();
        }
    }

    static loadTrialOptions() {
        const trials = DataManager.getTrials().filter(trial => 
            trial.status === 'approved' || trial.status === 'active'
        );
        
        // Update all trial select elements
        const selectors = [
            'scoring-trial-select',
            'manual-trial-select', 
            'results-trial-select',
            'scoreboard-trial-select'
        ];
        
        selectors.forEach(selectorId => {
            const select = document.getElementById(selectorId);
            if (select) {
                select.innerHTML = '<option value="">Select trial...</option>';
                trials.forEach(trial => {
                    const option = document.createElement('option');
                    option.value = trial.id;
                    option.textContent = `${trial.name} - ${App.formatDate(trial.date)}`;
                    select.appendChild(option);
                });
            }
        });
    }

    // ===================
    // DIGITAL SCORING INTERFACE
    // ===================

    static loadScoringInterface() {
        // Initialize digital scoring interface
        console.log('Loading digital scoring interface...');
    }

    static onTrialChange() {
        const trialId = document.getElementById('scoring-trial-select').value;
        if (!trialId) {
            document.getElementById('scoring-class-select').innerHTML = '<option value="">Choose class...</option>';
            document.getElementById('start-scoring-btn').disabled = true;
            return;
        }

        this.currentTrial = DataManager.getTrial(trialId);
        this.loadClassOptions();
    }

    static loadClassOptions() {
        if (!this.currentTrial) return;

        const classSelect = document.getElementById('scoring-class-select');
        classSelect.innerHTML = '<option value="">Choose class...</option>';
        
        this.currentTrial.classes.forEach(classInfo => {
            const option = document.createElement('option');
            option.value = JSON.stringify(classInfo);
            option.textContent = `${classInfo.name} - ${classInfo.round}`;
            classSelect.appendChild(option);
        });

        document.getElementById('start-scoring-btn').disabled = true;
    }

    static onClassChange() {
        const classData = document.getElementById('scoring-class-select').value;
        if (!classData) {
            document.getElementById('start-scoring-btn').disabled = true;
            return;
        }

        this.currentClass = JSON.parse(classData);
        
        // Set judge information
        const judge = this.currentTrial.judges.find(j => 
            j.classes && j.classes.includes(this.currentClass.name)
        ) || this.currentTrial.judges[0];
        
        document.getElementById('scoring-judge').value = judge?.name || judge || 'TBD';
        document.getElementById('start-scoring-btn').disabled = false;
    }

    static startScoring() {
        if (!this.currentTrial || !this.currentClass) {
            App.showAlert('Please select a trial and class first', 'warning');
            return;
        }

        // Load entries for this class
        const entries = DataManager.getTrialEntries(this.currentTrial.id);
        this.classEntries = entries.filter(entry => 
            entry.classes.includes(this.currentClass.name)
        ).sort((a, b) => {
            // Sort by jump height, then by handler name
            if (a.jumpHeight !== b.jumpHeight) {
                return parseInt(a.jumpHeight) - parseInt(b.jumpHeight);
            }
            return a.handlerName.localeCompare(b.handlerName);
        });

        if (this.classEntries.length === 0) {
            App.showAlert('No entries found for this class', 'warning');
            return;
        }

        this.isScoring = true;
        this.currentEntryIndex = 0;
        this.displayRunningOrder();
        this.showRunningOrderDisplay();
    }

    static showRunningOrderDisplay() {
        document.getElementById('running-order-display').style.display = 'block';
        document.getElementById('current-class-name').textContent = 
            `${this.currentClass.name} - ${this.currentClass.round}`;
        
        this.updateScoringProgress();
    }

    static displayRunningOrder() {
        const grid = document.getElementById('entries-grid');