// js/forms/score-sheets.js
class ScoreSheetForm {
    static generateAll(trial, entries) {
        let html = '<div class="score-sheets-collection">';
        
        // Group entries by class and round
        const groupedEntries = this.groupEntriesByClassAndRound(entries, trial);
        
        // Generate score sheets for each class/round combination
        trial.classes.forEach(classInfo => {
            trial.judges.forEach(judge => {
                const classEntries = groupedEntries[`${classInfo.name}-${classInfo.round}`] || [];
                if (classEntries.length > 0) {
                    classEntries.forEach(entry => {
                        html += this.generateScoreSheet(trial, entry, classInfo, judge);
                        html += '<div class="page-break"></div>';
                    });
                }
            });
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
        
        return grouped;
    }

    static generateScoreSheet(trial, entry, classInfo, judge) {
        const exercises = this.getExercisesForClass(classInfo.round);
        const maxTotal = this.getMaxTotalForClass(classInfo.round);
        const qualifyingScore = Math.floor(maxTotal * 0.7);

        return `
            <div class="score-sheet cwags-form">
                <div class="score-sheet-header">
                    <div class="header-left">
                        <div class="placing-section">
                            <strong>A &nbsp;&nbsp; B &nbsp;&nbsp; Jr &nbsp;&nbsp; Placing</strong>
                        </div>
                        <div class="basic-info">
                            <div class="info-line">
                                <strong>Date:</strong> ${new Date(trial.date).toLocaleDateString()}
                            </div>
                            <div class="info-line">
                                <strong>Judge:</strong> ${judge}
                            </div>
                        </div>
                    </div>
                    
                    <div class="header-center">
                        <div class="cwags-logo-area">
                            <strong>C-WAGS</strong>
                        </div>
                        <div class="level-info">
                            <strong>Level 1</strong>
                        </div>
                        <div class="division-info">
                            <strong>A &nbsp;&nbsp; B &nbsp;&nbsp; To &nbsp;&nbsp; Jr</strong>
                        </div>
                    </div>
                    
                    <div class="header-right">
                        <div class="competitor-info">
                            <div class="info-line">
                                <strong>Number/Name:</strong>
                            </div>
                            <div class="reg-number">${entry.registrationNumber}</div>
                            <div class="dog-handler">${entry.handlerName} & ${entry.dogName}</div>
                            <div class="info-line">
                                <strong>Breed:</strong> ${entry.breed || '_____________'}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="version-info">
                    <strong>v.${this.getVersionForRound(classInfo.round)}</strong>
                </div>

                <table class="score-table">
                    <thead>
                        <tr>
                            <th class="exercise-col">Exercise</th>
                            <th class="nq-col">Non<br>Qualifying</th>
                            <th class="major-col">Major<br>4+pts</th>
                            <th class="minor-col">Minor<br>2-3 pts</th>
                            <th class="slight-col">Slight<br>1/2-1pts</th>
                            <th class="max-col">Maximum<br>pts</th>
                            <th class="lost-col">Points<br>Lost</th>
                            <th class="net-col">Net<br>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${exercises.map(exercise => `
                            <tr>
                                <td class="exercise-name">
                                    <strong>${exercise.name}</strong>
                                    ${exercise.description ? `<br><small>${exercise.description}</small>` : ''}
                                </td>
                                <td class="deduction-cell">${exercise.nq || ''}</td>
                                <td class="deduction-cell">${exercise.major || ''}</td>
                                <td class="deduction-cell">${exercise.minor || ''}</td>
                                <td class="deduction-cell">${exercise.slight || ''}</td>
                                <td class="max-points">${exercise.maxPoints}</td>
                                <td class="points-lost"></td>
                                <td class="net-score"></td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td><strong>TOTAL</strong></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td><strong>${maxTotal}</strong></td>
                            <td class="total-lost"></td>
                            <td class="total-score"></td>
                        </tr>
                    </tfoot>
                </table>

                <div class="score-summary">
                    <div class="summary-row">
                        <div class="summary-item">
                            <strong>Qualifying Score:</strong> ${qualifyingScore} points
                        </div>
                        <div class="summary-item">
                            <strong>Final Score:</strong> _____ / ${maxTotal}
                        </div>
                    </div>
                    <div class="summary-row">
                        <div class="summary-item">
                            <strong>Qualified:</strong> Yes __ No __
                        </div>
                        <div class="summary-item">
                            <strong>Placement:</strong> 1st __ 2nd __ 3rd __ 4th __
                        </div>
                    </div>
                    <div class="signature-area">
                        <div class="signature-line">
                            <strong>Judge Signature:</strong> _________________________________
                        </div>
                    </div>
                </div>

                ${this.generateClassSpecificNotes(classInfo.round)}
            </div>
        `;
    }

    static getExercisesForClass(round) {
        const exercises = {
            'CTH': [
                {
                    name: 'Call to Heel',
                    description: '(Handler 4\') (begins in sit)',
                    major: 'Fail to heel - 5 pts',
                    minor: 'Ext cue 3 pts<br>No sit 3pts',
                    maxPoints: 10
                },
                {
                    name: '"Leave Dog"<br>"Call Dog"',
                    description: '',
                    major: 'turns wrong 5pts',
                    minor: 'Ext cue 3 pts<br>No sit 3pts',
                    maxPoints: 40
                },
                {
                    name: 'On-Leash Heeling',
                    description: '(tie-breaker)',
                    major: 'Fail to front - 5 pts',
                    minor: 'Ext cue 3 pts<br>No sit/sits on Forward 3pts',
                    maxPoints: 20
                },
                {
                    name: '*Find Front Forward',
                    description: '(begins in sit)',
                    major: '',
                    minor: '',
                    maxPoints: 0
                }
            ],
            'FFF': [
                {
                    name: 'Find Front Forward',
                    description: '(tie-breaker)',
                    major: 'Fail to front - 5 pts',
                    minor: 'Ext cue 3 pts<br>No sit 3pts',
                    maxPoints: 30
                },
                {
                    name: 'Sit Stay',
                    description: '(1 minute)',
                    major: 'Breaks stay - 5 pts',
                    minor: 'Ext cue 3 pts',
                    maxPoints: 20
                }
            ],
            'CTH2': [
                {
                    name: 'Call to Heel',
                    description: '(Handler 4\') (begins in sit)',
                    major: 'Fail to heel - 5 pts',
                    minor: 'Ext cue 3 pts<br>No sit 3pts',
                    maxPoints: 10
                },
                {
                    name: 'On-Leash Heeling',
                    description: '(with turns)',
                    major: 'Wrong turn - 5 pts',
                    minor: 'Ext cue 3 pts<br>No sit 3pts',
                    maxPoints: 30
                },
                {
                    name: 'Find Front Forward',
                    description: '(tie-breaker)',
                    major: 'Fail to front - 5 pts',
                    minor: 'Ext cue 3 pts<br>No sit 3pts',
                    maxPoints: 30
                }
            ],
            'splt.heel': [
                {
                    name: 'Split Heeling',
                    description: '(around obstacles)',
                    major: 'Wrong path - 5 pts',
                    minor: 'Ext cue 3 pts<br>No sit 3pts',
                    maxPoints: 40
                },
                {
                    name: 'Recall to Heel',
                    description: '(finish exercise)',
                    major: 'Fail to heel - 5 pts',
                    minor: 'Ext cue 3 pts',
                    maxPoints: 30
                }
            ],
            'WA': [
                {
                    name: 'Walk About',
                    description: '(tie-breaker)',
                    major: 'Fails to follow - 5 pts',
                    minor: 'Ext cue 3 pts<br>Lags/forges',
                    maxPoints: 40
                }
            ],
            'Video': [
                {
                    name: 'Video Submission',
                    description: '(all exercises combined)',
                    major: 'Major errors - 5+ pts',
                    minor: 'Minor errors - 1-3 pts',
                    maxPoints: 100
                }
            ]
        };
        
        return exercises[round] || [];
    }

    static getMaxTotalForClass(round) {
        const totals = {
            'CTH': 70,
            'FFF': 50,
            'CTH2': 70,
            'splt.heel': 70,
            'WA': 40,
            'Video': 100
        };
        return totals[round] || 100;
    }

    static getVersionForRound(round) {
        const versions = {
            'CTH': '2',
            'FFF': '3',
            'CTH2': '4',
            'splt.heel': '5',
            'WA': '7',
            'Video': '1'
        };
        return versions[round] || '1';
    }

    static generateClassSpecificNotes(round) {
        const notes = {
            'CTH': `
                <div class="class-notes">
                    <p><strong>Call to Heel:</strong> Handler calls dog from 4 feet away. Dog must come and sit in heel position.</p>
                    <p><strong>On-Leash Heeling:</strong> This is the tie-breaker exercise. Points are critical.</p>
                    <p><strong>Find Front Forward:</strong> * indicates tie-breaker if needed.</p>
                </div>
            `,
            'FFF': `
                <div class="class-notes">
                    <p><strong>Find Front Forward:</strong> Tie-breaker exercise for this class.</p>
                    <p><strong>Sit Stay:</strong> Dog must remain in sit for 1 minute while handler is out of sight.</p>
                </div>
            `,
            'WA': `
                <div class="class-notes">
                    <p><strong>Walk About:</strong> Dog follows handler in loose heel position around course. This is the tie-breaker.</p>
                </div>
            `,
            'Video': `
                <div class="class-notes">
                    <p><strong>Video Level 1:</strong> All exercises submitted via video recording.</p>
                    <p>Judge reviews video and scores based on demonstrated skills.</p>
                </div>
            `
        };
        
        return notes[round] || '';
    }

    // Digital scoring version for tablet/computer use
    static generateDigitalScoreSheet(trial, entry, classInfo, judge) {
        const exercises = this.getExercisesForClass(classInfo.round);
        const maxTotal = this.getMaxTotalForClass(classInfo.round);

        return `
            <div class="digital-score-sheet" data-entry-id="${entry.id}" data-class="${classInfo.name}" data-round="${classInfo.round}">
                <div class="digital-header">
                    <h3>${entry.handlerName} & ${entry.dogName}</h3>
                    <p>${classInfo.name} - ${classInfo.round} | Judge: ${judge}</p>
                </div>
                
                <div class="digital-exercises">
                    ${exercises.map((exercise, index) => `
                        <div class="digital-exercise" data-exercise-index="${index}">
                            <div class="exercise-header">
                                <h4>${exercise.name}</h4>
                                <span class="max-points">Max: ${exercise.maxPoints} pts</span>
                            </div>
                            
                            <div class="scoring-buttons">
                                <button class="score-btn nq-btn" onclick="ScoreSheetForm.applyDeduction(${index}, 'nq')">
                                    NQ
                                </button>
                                <button class="score-btn major-btn" onclick="ScoreSheetForm.applyDeduction(${index}, 'major', 5)">
                                    Major (-5)
                                </button>
                                <button class="score-btn minor-btn" onclick="ScoreSheetForm.applyDeduction(${index}, 'minor', 3)">
                                    Minor (-3)
                                </button>
                                <button class="score-btn slight-btn" onclick="ScoreSheetForm.applyDeduction(${index}, 'slight', 1)">
                                    Slight (-1)
                                </button>
                            </div>
                            
                            <div class="custom-deduction">
                                <label>Custom: -</label>
                                <input type="number" min="0" max="${exercise.maxPoints}" 
                                       onchange="ScoreSheetForm.applyCustomDeduction(${index}, this.value)">
                                <span>pts</span>
                            </div>
                            
                            <div class="exercise-score">
                                Score: <span class="score-display" id="exercise-${index}-score">${exercise.maxPoints}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="digital-total">
                    <div class="total-score">
                        Total Score: <span id="total-score">${maxTotal}</span> / ${maxTotal}
                    </div>
                    <div class="qualification">
                        <label>
                            <input type="radio" name="qualified" value="yes"> Qualified
                        </label>
                        <label>
                            <input type="radio" name="qualified" value="no"> Not Qualified
                        </label>
                    </div>
                </div>
                
                <div class="digital-actions">
                    <button class="btn btn-success" onclick="ScoreSheetForm.saveDigitalScore()">
                        Save Score
                    </button>
                    <button class="btn btn-secondary" onclick="ScoreSheetForm.resetScore()">
                        Reset
                    </button>
                </div>
            </div>
        `;
    }

    // Digital scoring functions
    static applyDeduction(exerciseIndex, type, points = 0) {
        const exercise = document.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
        const scoreDisplay = exercise.querySelector('.score-display');
        const maxPoints = parseInt(exercise.querySelector('.max-points').textContent.match(/\d+/)[0]);
        
        if (type === 'nq') {
            scoreDisplay.textContent = 'NQ';
        } else {
            const currentScore = parseInt(scoreDisplay.textContent) || maxPoints;
            const newScore = Math.max(0, currentScore - points);
            scoreDisplay.textContent = newScore;
        }
        
        this.updateTotalScore();
    }

    static applyCustomDeduction(exerciseIndex, deduction) {
        const exercise = document.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
        const scoreDisplay = exercise.querySelector('.score-display');
        const maxPoints = parseInt(exercise.querySelector('.max-points').textContent.match(/\d+/)[0]);
        
        const newScore = Math.max(0, maxPoints - parseInt(deduction || 0));
        scoreDisplay.textContent = newScore;
        
        this.updateTotalScore();
    }

    static updateTotalScore() {
        const scoreDisplays = document.querySelectorAll('.score-display');
        let total = 0;
        let hasNQ = false;
        
        scoreDisplays.forEach(display => {
            const score = display.textContent;
            if (score === 'NQ') {
                hasNQ = true;
            } else {
                total += parseInt(score) || 0;
            }
        });
        
        const totalDisplay = document.getElementById('total-score');
        totalDisplay.textContent = hasNQ ? 'NQ' : total;
    }

    static saveDigitalScore() {
        // Implementation for saving digital scores
        App.showAlert('Score saved successfully', 'success');
    }

    static resetScore() {
        // Reset all scores to maximum
        document.querySelectorAll('.score-display').forEach((display, index) => {
            const exercise = display.closest('.digital-exercise');
            const maxPoints = parseInt(exercise.querySelector('.max-points').textContent.match(/\d+/)[0]);
            display.textContent = maxPoints;
        });
        
        this.updateTotalScore();
    }
}
