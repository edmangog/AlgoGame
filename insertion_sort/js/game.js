import { createElement, formatTime } from '../../shared/js/utils.js';
import { setupLanguageToggle } from '../../shared/js/lang-toggle.js';

class InsertionSortGame {
    constructor() {
        this.currentNumbers = [];
        this.keyIndex = 1;
        this.jIndex = 2;
        this.score = 0;
        this.moveCount = 0; // Track total moves
        this.startTime = Date.now();
        this.timerInterval = null;
        this.language = 'english';
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
                    <button class="lang-toggle">中/Eng</button>
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
                            <button class="swap-btn">
                                <span class="english">Swap</span>
                                <span class="chinese" style="display:none;">交換</span>
                            </button>
                            <button class="skip-btn">
                                <span class="english">Skip</span>
                                <span class="chinese" style="display:none;">跳過</span>
                            </button>
                        </div>
                        <div id="feedbackMessage" style="display:none; color: #e74c3c; font-weight: bold; margin: 5px 0; text-align: center;"></div>
                    </div>
                    
                    <div class="tutorial">
                        <h3 class="english">How to Play</h3>
                        <h3 class="chinese" style="display:none;">玩法說明</h3>
                        <p class="english">Insert the highlighted KEY element into its correct position in the sorted portion (left side).</p>
                        <p class="chinese" style="display:none;">將高亮的KEY元素插入已排序部分（左側）的正確位置。</p>
                        
                        <div class="algorithm-explanation">
                            <h4 class="english">Insertion Sort Algorithm</h4>
                            <h4 class="chinese" style="display:none;">插入排序算法</h4>
                            <ol class="english">
                                <li>Start with the second element as the KEY</li>
                                <li>Compare KEY with elements to its left</li>
                                <li>Swap if KEY is smaller than the left element</li>
                                <li>Repeat until KEY is in correct position</li>
                                <li>Move to next KEY element</li>
                            </ol>
                            <ol class="chinese" style="display:none;">
                                <li>從第二個元素開始作為KEY</li>
                                <li>將KEY與左側元素比較</li>
                                <li>若KEY較小則交換位置</li>
                                <li>重複直到KEY位於正確位置</li>
                                <li>移動到下一個KEY元素</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        this.app.querySelector('.new-game').addEventListener('click', () => this.newGame());
        this.app.querySelector('.swap-btn').addEventListener('click', () => this.swapKey());
        this.app.querySelector('.skip-btn').addEventListener('click', () => this.skipKey());
    }

    newGame() {
        clearInterval(this.timerInterval);
        this.score = 0;
        this.moveCount = 0; // Reset move count
        this.keyIndex = 1;
        this.jIndex = 2;
        this.startTime = Date.now();
        this.updateScoreBoard();
        this.generateNumbers();
        this.startTimer();
        this.highlightCurrentKey();
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

    highlightCurrentKey() {
        // Reset all highlights
        this.app.querySelectorAll('.number-box').forEach(item => {
            item.classList.remove('key', 'compared');
        });
        
        // Highlight current key
        if (this.keyIndex < this.currentNumbers.length) {
            this.app.querySelector(`.number-box[data-index="${this.keyIndex}"]`).classList.add('key');
        }
        
        // Highlight comparison element if exists
        if (this.keyIndex > 0) {
            this.app.querySelector(`.number-box[data-index="${this.keyIndex - 1}"]`).classList.add('compared');
        }
    }

    swapKey() {
        if (this.keyIndex === 0 || this.keyIndex >= this.currentNumbers.length) return;
        
        const key = this.currentNumbers[this.keyIndex];
        const left = this.currentNumbers[this.keyIndex - 1];
        
        this.moveCount++; // Count this move
        if (key < left) {
            // Swap elements
            [this.currentNumbers[this.keyIndex], this.currentNumbers[this.keyIndex - 1]] = 
                [this.currentNumbers[this.keyIndex - 1], this.currentNumbers[this.keyIndex]];
            
            // Update DOM with swap animation
            const keyBox = this.app.querySelector(`.number-box[data-index="${this.keyIndex}"]`);
            const leftBox = this.app.querySelector(`.number-box[data-index="${this.keyIndex - 1}"]`);
            
            keyBox.classList.add('swapping');
            leftBox.classList.add('swapping');
            
            setTimeout(() => {
                keyBox.textContent = this.currentNumbers[this.keyIndex];
                leftBox.textContent = this.currentNumbers[this.keyIndex - 1];
                
                setTimeout(() => {
                    keyBox.classList.remove('swapping');
                    leftBox.classList.remove('swapping');
                    this.keyIndex--;
                    
                    // Boundary check
                    if (this.keyIndex === 0) {
                        this.keyIndex = 1;
                    }
                    
                    this.highlightCurrentKey();
                    this.score += 10;
                    this.updateScoreBoard();
                    this.showFeedbackMessage(
                        this.language === 'english' ? 
                        "Great! Moved key to correct position +10 points 🎉" : 
                        "太棒了！已將關鍵元素移動到正確位置 +10分 🎉"
                    );
                    this.showScoreAnimation(10);
                }, 400);
            }, 400);
        } else {
            this.showFeedbackMessage(
                this.language === 'english' ? 
                "Key doesn't need to move here - try again 😅" : 
                "關鍵元素不需要移動 - 請再試一次 😅"
            );
        }
        this.updateScoreBoard(); // Update UI with new move count
    }

    skipKey() {
        if (this.keyIndex >= this.currentNumbers.length) return;
        
        const key = this.currentNumbers[this.keyIndex];
        const left = this.keyIndex > 0 ? this.currentNumbers[this.keyIndex - 1] : -Infinity;
        
        this.moveCount++; // Count this move
        if (key >= left) {
            // Move to next key
            this.keyIndex = this.jIndex;
            this.jIndex++;
            this.highlightCurrentKey();
            this.score += 10;
            this.updateScoreBoard();
            this.showFeedbackMessage(
                this.language === 'english' ? 
                "Good choice! Key is in position +10 points 👍" : 
                "正確選擇！關鍵元素已在正確位置 +10分 👍"
            );
            this.showScoreAnimation(10);
            
            // Check if game completed
            if (this.keyIndex >= this.currentNumbers.length) {
                clearInterval(this.timerInterval);
                const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
                setTimeout(() => {
                    alert(this.language === 'english' 
                        ? `Congratulations! Sorted in ${timeTaken} seconds! Starting new game...` 
                        : `恭喜！耗時${timeTaken}秒完成排序！即將開始新遊戲...`);
                    setTimeout(() => {
                        this.newGame();
                    }, 600);
                }, 500);
            }
        } else {
            this.showFeedbackMessage(
                this.language === 'english' ? 
                "Key still needs sorting - try swapping 🔄" : 
                "關鍵元素仍需排序 - 請嘗試交換 🔄"
            );
        }
        this.updateScoreBoard(); // Update UI with new move count
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
        }, 2000);
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
