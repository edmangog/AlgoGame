import { createElement, formatTime } from '../../shared/js/utils.js';
import { setupLanguageToggle } from '../../shared/js/lang-toggle.js';

class InsertionSortGame {
    constructor() {
        this.currentNumbers = [];
        this.keyIndex = 1;       // Current key element position
        this.score = 0;
        this.moveCount = 0;
        this.passCount = 1;      // Track current pass number
        this.startTime = Date.now();
        this.timerInterval = null;
        this.language = 'english';
        this.sorted = false;     // Track if array is fully sorted
        this.originalKeyValue = null; // Store original key value during shifting
        this.init();
    }

    init() {
        this.setupDOM();
        this.setupEventListeners();
        setupLanguageToggle();
        this.newGame();
    }

    setupDOM() {
        this.app = document.getElementById('app');
        this.app.innerHTML = `
            <div class="container">
                <div class="header-container">
                    <div>
                        <h1>
                            <span class="english">Insertion Sort Game</span>
                            <span class="chinese" style="display:none;">插入排序遊戲</span>
                        </h1>
                        <div class="subtitle english">Sort the numbers in ascending order!</div>
                        <div class="subtitle chinese" style="display:none;">將數字按從小到大排序！</div>
                    </div>
                    <div class="other-controls">
                        <div class="difficulty">
                            <span class="english">Difficulty:</span>
                            <span class="chinese" style="display:none;">難度:</span>
                            <select id="difficulty">
                                <option value="easy">Easy (6)</option>
                                <option value="medium">Medium (8)</option>
                                <option value="hard">Hard (10)</option>
                            </select>
                        </div>
                        <button class="new-game">
                            <span class="english">New Game</span>
                            <span class="chinese" style="display:none;">新遊戲</span>
                        </button>
                    </div>
                </div>
                
                <div class="game-area">
                    <div class="score-animation-container"></div>
                    <div class="score-board">
                        <div class="score-display">
                            <div class="score-row big-score">
                                <div class="english">SCORE: </div>
                                <div class="chinese" style="display:none;">分數: </div>
                                <div id="score">0</div>
                            </div>
                            <div class="time-row">
                                <div class="english">Time: </div>
                                <div class="chinese" style="display:none;">時間: </div>
                                <div class="timer-value" id="timer">0s</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="number-line" id="numberLine"></div>
                    
                    <div class="controls">
                        <div class="core-buttons">
                            <button class="shift-btn">
                                <span class="english">Shift</span>
                                <span class="chinese" style="display:none;">移動</span>
                            </button>
                            <button class="insert-btn">
                                <span class="english">Insert</span>
                                <span class="chinese" style="display:none;">插入</span>
                            </button>
                        </div>
                        <div id="feedbackMessage" style="display:none; color: #e74c3c; font-weight: bold; margin: 5px 0; text-align: center;"></div>
                    </div>
                    
                    <div class="tutorial">
                        <h3 class="english">How to Play</h3>
                        <h3 class="chinese" style="display:none;">玩法說明</h3>
                        <p class="english">Move the KEY element to its correct position using SHIFT and INSERT buttons.</p>
                        <p class="english"><strong>SHIFT</strong>: Move left element to right position</p>
                        <p class="english"><strong>INSERT</strong>: Place KEY element in current gap</p>
                        <p class="chinese" style="display:none;">使用移動和插入按鈕將關鍵元素移至正確位置。</p>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        this.app.querySelector('.new-game').addEventListener('click', () => this.newGame());
        this.app.querySelector('.shift-btn').addEventListener('click', () => this.shiftElement());
        this.app.querySelector('.insert-btn').addEventListener('click', () => this.insertKey());
    }

    newGame() {
        clearInterval(this.timerInterval);
        this.score = 0;
        this.moveCount = 0;
        this.keyIndex = 1;
        this.passCount = 1;
        this.sorted = false;
        this.originalKeyValue = null; // Reset original key value
        this.startTime = Date.now();
        this.updateScoreBoard();
        this.generateNumbers();
        this.startTimer();
        this.highlightElements();
    }

    generateNumbers() {
        const difficulty = this.app.querySelector('#difficulty').value;
        let size = 6;
        if (difficulty === 'medium') size = 8;
        if (difficulty === 'hard') size = 10;
        
        this.currentNumbers = Array.from({length: size}, () => Math.floor(Math.random() * 50) + 1);
        const numberLine = this.app.querySelector('#numberLine');
        numberLine.innerHTML = '';
        
        this.currentNumbers.forEach((num, i) => {
            const numBox = createElement('div', 'number-box', num);
            numBox.dataset.index = i;
            numberLine.appendChild(numBox);
        });
    }

    highlightElements() {
        // Reset all highlights
        this.app.querySelectorAll('.number-box').forEach(item => {
            item.classList.remove('key');
        });
        
        // Highlight current key
        if (this.keyIndex < this.currentNumbers.length && !this.sorted) {
            this.app.querySelector(`.number-box[data-index="${this.keyIndex}"]`).classList.add('key');
        }
    }

    shiftElement() {
        if (this.sorted || this.keyIndex <= 0) return;
        
        this.moveCount++;
        const currentIndex = this.keyIndex;
        const prevIndex = currentIndex - 1;
        
        // Store original key value at start of operation
        if (!this.originalKeyValue) {
            this.originalKeyValue = this.currentNumbers[currentIndex];
        }
        
        // Check if shift is valid (previous element > original key)
        if (this.currentNumbers[prevIndex] > this.originalKeyValue) {
            // Get DOM elements
            const currentBox = this.app.querySelector(`.number-box[data-index="${currentIndex}"]`);
            const prevBox = this.app.querySelector(`.number-box[data-index="${prevIndex}"]`);
            
            // Apply animation classes
            prevBox.classList.add('shifting');
            
            // Wait for animation to complete
            setTimeout(() => {
                // Perform shift after animation: move left element to right
                this.currentNumbers[currentIndex] = this.currentNumbers[prevIndex];
                // Place key in the gap (left position)
                this.currentNumbers[prevIndex] = this.originalKeyValue;
                
                // Update DOM
                currentBox.textContent = this.currentNumbers[currentIndex];
                prevBox.textContent = this.currentNumbers[prevIndex];
                prevBox.classList.remove('shifting');
                
                this.keyIndex = prevIndex;
                this.highlightElements();
            }, 500);
            
            this.score += 10;
            this.showFeedbackMessage(
                this.language === 'english' ? 
                "Shifted element! +10 points 🔄" : 
                "元素已移動！+10分 🔄"
            );
            this.showScoreAnimation(10);
        } else {
            this.score = Math.max(0, this.score - 10);
            this.showFeedbackMessage(
                this.language === 'english' ? 
                "Can't shift - element is smaller! -10 points ❌" : 
                "無法移動 - 元素較小！-10分 ❌"
            );
            this.showScoreAnimation(-10);
        }
        
        this.updateScoreBoard();
    }

    insertKey() {
        if (this.sorted) return;
        
        this.moveCount++;
        const currentIndex = this.keyIndex;
        const keyValue = this.originalKeyValue || this.currentNumbers[currentIndex];
        
        // Check if insert is valid (left element <= key)
        const isValidInsert = currentIndex === 0 || 
                             this.currentNumbers[currentIndex - 1] <= keyValue;
        
        if (isValidInsert) {
            // Place key in current position
            this.currentNumbers[currentIndex] = keyValue;
            this.app.querySelector(`.number-box[data-index="${currentIndex}"]`).textContent = keyValue;
            
            // Reset original key value
            this.originalKeyValue = null;
            
            this.score += 10;
            this.showFeedbackMessage(
                this.language === 'english' ? 
                "Key inserted! +10 points ✅" : 
                "關鍵元素已插入！+10分 ✅"
            );
            this.showScoreAnimation(10);
            
            // Move to next pass
            this.passCount++;
            this.keyIndex = this.passCount;
            
            // Check if game completed
            if (this.passCount >= this.currentNumbers.length) {
                // Add delay to ensure animation completes
                setTimeout(() => {
                    this.endGame(true);
                }, 500);
            } else {
                this.highlightElements();
                this.updateScoreBoard();
            }
        } else {
            this.score = Math.max(0, this.score - 10);
            this.showFeedbackMessage(
                this.language === 'english' ? 
                "Invalid insert! Shift elements first -10 points ❌" : 
                "插入無效！請先移動元素 -10分 ❌"
            );
            this.showScoreAnimation(-10);
            this.updateScoreBoard();
        }
    }

    
    endGame(isWin) {
        this.sorted = true;
        clearInterval(this.timerInterval);
        const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Update scoreboard to ensure it matches the final score
        this.updateScoreBoard();
        
        setTimeout(() => {
            alert(this.language === 'english' 
                ? `Game completed in ${timeTaken} seconds! Final score: ${this.score}` 
                : `遊戲完成！耗時${timeTaken}秒，最終分數: ${this.score}`);
        }, 500);
    }

    showScoreAnimation(points) {
        const container = this.app.querySelector('.score-animation-container');
        if (!container) return;
        
        const animElement = document.createElement('div');
        animElement.className = 'score-change';
        animElement.textContent = points > 0 ? `+${points}` : `${points}`;
        animElement.classList.add(points > 0 ? 'positive-change' : 'negative-change');
        
        container.appendChild(animElement);
        
        setTimeout(() => {
            animElement.remove();
        }, 1500);
    }

    showFeedbackMessage(message) {
        const feedbackElement = document.getElementById('feedbackMessage');
        if (!feedbackElement) return;
        
        feedbackElement.textContent = message;
        feedbackElement.style.display = 'block';
        setTimeout(() => {
            feedbackElement.style.display = 'none';
        }, 3000);
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.app.querySelector('#timer').textContent = timeElapsed + 's';
        }, 1000);
    }

    updateScoreBoard() {
        this.app.querySelector('#score').textContent = this.score;
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => new InsertionSortGame());
