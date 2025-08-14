import { createElement, formatTime } from '../../shared/js/utils.js';
import { setupLanguageToggle } from '../../shared/js/lang-toggle.js';

class BubbleSortGame {
    constructor() {
        this.currentNumbers = [];
        this.score = 0; // Added scoring system
        this.startTime = Date.now();
        this.timerInterval = null;
        this.language = 'english';
        this.currentIndex = 0;
        this.currentPass = 1;
        
        // Encouraging messages for all actions
        this.feedbackMessages = {
            correct: {
                english: [
                    "Awesome! 😊 ",
                    "Perfect move! 🌟 ",
                    "Great decision! 👍",
                    "Well done! 🎉 ",
                    "Excellent choice! 💯!"
                ],
                chinese: [
                    "太棒了！😊 ",
                    "完美的選擇！🌟 ",
                    "明智的決定！👍 ",
                    "做得好！🎉 ",
                    "出色的選擇！💯 "
                ]
            },
            incorrect: {
                english: [
                    "Oops! Don't worry, keep going! 💪",
                    "Not quite! You'll get it next time! 😊",
                    "Mistakes happen!  Keep learning! 🌟",
                    "Almost!  You're making progress! 👍",
                    "No problem!  Every expert was a beginner! 🎓"
                ],
                chinese: [
                    "哎呀！別擔心，繼續加油！💪",
                    "差一點！下次會更好！😊",
                    "犯錯是學習的一部分！繼續進步！🌟",
                    "接近了！你正在進步！👍",
                    "沒關係！每個專家都曾是新手！🎓"
                ]
            }
        };
        
        this.init();
    }
    
    // Get a random feedback message based on action type and language
    getRandomFeedback(type) {
        const messages = this.feedbackMessages[type][this.language];
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    // Get a random encouraging message based on current language
    getRandomEncouragement() {
        const messages = this.encouragingMessages[this.language];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    init() {
        this.setupDOM();
        this.setupEventListeners();
        setupLanguageToggle(); // Initialize after DOM is ready
        this.newGame();
    }

    setupDOM() {
        this.app = document.getElementById('app');
        this.app.innerHTML = `
            <div class="container">
                <div id="firstTimeModal" class="modal">
                    <div class="modal-content">
                        <h2 class="english">Welcome to Bubble Sort Game!</h2>
                        <h2 class="chinese" style="display:none;">欢迎来到冒泡排序游戏！</h2>
                        <div class="tutorial-content english">
                            <p>Your goal is to sort numbers in ascending order using the bubble sort algorithm.</p>
                            <p>Click SWAP when left number > right number, otherwise click SKIP.</p>
                            <p>Earn 10 points for each correct action, lose 10 points for each incorrect action.</p>
                        </div>
                        <div class="tutorial-content chinese" style="display:none;">
                            <p>您的目标是使用冒泡排序算法将数字按升序排列。</p>
                            <p>当左边数字大于右边时点击"交换"，否则点击"跳过"。</p>
                            <p>正确操作得10分，错误操作扣10分！</p>
                        </div>
                        <button id="startGame" class="english">Start Game</button>
                        <button id="startGame" class="chinese" style="display:none;">开始游戏</button>
                    </div>
                </div>
                
                <div class="header-container">
                    <div>
                        <h1>
                            <span class="english">Bubble Sort Game</span>
                            <span class="chinese" style="display:none;">冒泡排序遊戲</span>
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
                    ${this.createScoreBoard()}
                    <div class="number-line" id="numberLine"></div>
                    ${this.createControls()}
                    ${this.createTutorial()}
                </div>
            </div>
        `;
    }
    
    createControls() {
        return `
            <div class="controls">
                <div class="core-buttons-container">
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
                </div>
                <div id="feedbackMessage" style="display:none; color: #e74c3c; font-weight: bold; margin: 5px 0; text-align: center;"></div>
            </div>
        `;
    }

    createScoreBoard() {
        return `
            <div class="score-animation-container"></div>
            <div class="big-score">
                <span class="english">SCORE: </span>
                <span class="chinese" style="display:none;">分數: </span>
                <span id="bigScore">0</span>
            </div>
            <div class="score-board">
                <div style="flex: 1; text-align: right;">
                    <span class="english">Pass: </span>
                    <span class="chinese" style="display:none;">遍歷次數: </span>
                    <span id="passCount">1</span>
                </div>
                <div style="flex: 1; text-align: left;">
                    <span class="english">Time: </span>
                    <span class="chinese" style="display:none;">時間: </span>
                    <span id="timer">0</span>s
                </div>
            </div>
        `;
    }


    createTutorial() {
        return `
            <div class="tutorial">
                <h3 class="english">How to Play</h3>
                <h3 class="chinese" style="display:none;">玩法說明</h3>
                <p class="english">Click SWAP when the left number is greater than the right number, otherwise click SKIP. Earn 10 points for each correct action, lose 10 points for each incorrect action.</p>
                <p class="chinese" style="display:none;">當左邊數字大於右邊數字時點擊「交換」，否則點擊「跳過」。正確操作得10分，錯誤操作扣10分！</p>
                
                <div class="algorithm-explanation">
                    <h4 class="english">Bubble Sort Algorithm</h4>
                    <h4 class="chinese" style="display:none;">冒泡排序算法</h4>
                    <ol class="english">
                        <li>Start from the first element</li>
                        <li>Compare adjacent elements</li>
                        <li>Swap if they're in wrong order</li>
                        <li>Repeat until no more swaps needed</li>
                    </ol>
                    <ol class="chinese" style="display:none;">
                        <li>從第一個元素開始</li>
                        <li>比較相鄰元素</li>
                        <li>如果順序錯誤則交換</li>
                        <li>重複直到不需要交換</li>
                    </ol>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        this.app.querySelector('.new-game').addEventListener('click', () => this.newGame());
        this.app.querySelector('.swap-btn').addEventListener('click', () => this.swapCurrent());
        this.app.querySelector('.skip-btn').addEventListener('click', () => this.skipCurrent());
        
        // First-time modal
        const firstTimeModal = document.getElementById('firstTimeModal');
        const tutorialSeen = localStorage.getItem('bubbleSortTutorialSeen');
        
        if (!tutorialSeen) {
            firstTimeModal.style.display = 'block';
        }
        
        document.getElementById('startGame').addEventListener('click', () => {
            firstTimeModal.style.display = 'none';
            localStorage.setItem('bubbleSortTutorialSeen', 'true');
            this.newGame();
        });
    }
    
    newGame() {
        clearInterval(this.timerInterval);
        this.swapCount = 0;
        this.score = 0;
        this.startTime = Date.now();
        this.currentIndex = 0;
        this.currentPass = 1;
        this.updateScoreBoard();
        this.generateNumbers();
        this.startTimer();
        this.highlightCurrentPair();
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
    


    newGame() {
        clearInterval(this.timerInterval);
        this.swapCount = 0;
        this.score = 0; // Reset score
        this.startTime = Date.now();
        this.currentIndex = 0;
        this.currentPass = 1;
        this.updateScoreBoard();
        this.generateNumbers();
        this.startTimer();
        this.highlightCurrentPair();
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

    swapCurrent() {
        if (this.currentIndex >= this.currentNumbers.length - 1) return;
        
        const i = this.currentIndex;
        const j = i + 1;
        const shouldSwap = this.currentNumbers[i] > this.currentNumbers[j];
        
        if (shouldSwap) {
            this.swapNumbers(i, j);
            this.score += 10; // Correct swap
            this.updateScoreBoard();
            this.showScoreAnimation(10); // Show +10 animation
            this.showFeedbackMessage(this.getRandomFeedback('correct'));
        } else {
            this.score = Math.max(0, this.score - 10); // Incorrect swap
            this.updateScoreBoard();
            this.showScoreAnimation(-10); // Show -10 animation
            this.showFeedbackMessage(this.getRandomFeedback('incorrect'));
        }
        
        this.nextStep();
    }
    
    showScoreAnimation(pointsChange) {
        const animationContainer = this.app.querySelector('.score-animation-container');
        if (!animationContainer) return;
        
        // Create animation element
        const animElement = document.createElement('div');
        animElement.className = `score-change ${pointsChange > 0 ? 'positive-change' : 'negative-change'}`;
        animElement.textContent = (pointsChange > 0 ? '🌟 +' : '📖 ') + pointsChange;
        
        // Add to animation container
        animationContainer.appendChild(animElement);
        
        // Remove after animation completes
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
        }, 4000); // Show for 4 seconds
    }
    
    skipCurrent() {
        if (this.currentIndex >= this.currentNumbers.length - 1) return;
        
        const i = this.currentIndex;
        const j = i + 1;
        const shouldNotSwap = this.currentNumbers[i] <= this.currentNumbers[j];
        
        if (shouldNotSwap) {
            this.score += 10; // Correct skip
            this.updateScoreBoard();
            this.showScoreAnimation(10); // Show +10 animation
            this.showFeedbackMessage(this.getRandomFeedback('correct'));
        } else {
            this.score = Math.max(0, this.score - 10); // Incorrect skip
            this.updateScoreBoard();
            this.showScoreAnimation(-10); // Show -10 animation
            this.showFeedbackMessage(this.getRandomFeedback('incorrect'));
        }
        
        this.nextStep();
    }
    
    nextStep() {
        this.currentIndex++;
        
        if (this.currentIndex >= this.currentNumbers.length - 1) {
            this.currentPass++;
            this.updateScoreBoard();
            
            // Always proceed to next pass without early termination
            if (this.checkWin()) {
                return; // Game has ended after completing all passes
            }
            
            this.currentIndex = 0;
            this.highlightCurrentPair();
        } else {
            this.highlightCurrentPair();
        }
    }
    
    highlightCurrentPair() {
        this.resetSelection();
        
        const items = this.app.querySelectorAll('.number-box');
        items.forEach(item => item.classList.remove('active'));
        
        if (this.currentIndex < this.currentNumbers.length - 1) {
            items[this.currentIndex].classList.add('active');
            items[this.currentIndex + 1].classList.add('active');
        }
    }

    swapNumbers(i, j) {
        [this.currentNumbers[i], this.currentNumbers[j]] = [this.currentNumbers[j], this.currentNumbers[i]];
        const items = this.app.querySelectorAll('.number-box');
        
        // Visual feedback before swap
        items[i].classList.add('swapping-from');
        items[j].classList.add('swapping-to');
        
        setTimeout(() => {
            // Swap animation
            items[i].classList.remove('swapping-from');
            items[j].classList.remove('swapping-to');
            items[i].classList.add('swapping');
            items[j].classList.add('swapping');
            
            setTimeout(() => {
                // Update DOM elements
                [items[i].textContent, items[j].textContent] = [items[j].textContent, items[i].textContent];
                items[i].dataset.index = j;
                items[j].dataset.index = i;
                
                // Cleanup animations
                setTimeout(() => {
                    items[i].classList.remove('swapping');
                    items[j].classList.remove('swapping');
                    
                    // Check if swap was optimal
                    if (this.isOptimalSwap(i, j)) {
                        items[i].classList.add('optimal');
                        items[j].classList.add('optimal');
                        setTimeout(() => {
                            items[i].classList.remove('optimal');
                            items[j].classList.remove('optimal');
                        }, 1000);
                    }
                }, 400);
            }, 400);
        }, 100);
    }
    
    isOptimalSwap(i, j) {
        // Check if this was the next optimal swap
        const nextSwap = this.findNextOptimalSwap();
        return nextSwap && (
            (i === nextSwap[0] && j === nextSwap[1]) || 
            (j === nextSwap[0] && i === nextSwap[1])
        );
    }

    resetSelection() {
        this.app.querySelectorAll('.number-box').forEach(item => {
            item.classList.remove('active');
        });
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.app.querySelector('#timer').textContent = timeElapsed;
        }, 1000);
    }

    updateScoreBoard() {
        // Removed swapCount display
        this.app.querySelector('#passCount').textContent = this.currentPass;
        this.app.querySelector('#bigScore').textContent = this.score; // Update big score display
    }

    checkWin() {
        // Only check win condition after completing all passes
        if (this.currentPass >= this.currentNumbers.length) {
            clearInterval(this.timerInterval);
            const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
            
            // Set pass count to n-1 before showing results
            this.currentPass = this.currentNumbers.length - 1;
            this.updateScoreBoard();
            
            if (this.currentNumbers.every((val, i, arr) => !i || arr[i-1] <= val)) {
                setTimeout(() => {
                    alert(this.language === 'english' 
                        ? `Congratulations! Sorted in ${timeTaken} seconds!` 
                        : `恭喜！耗時${timeTaken}秒完成排序！`);
                }, 500);
                return true; // Game ended with win
            } else {
                const completedPasses = this.currentNumbers.length - 1;
                setTimeout(() => {
                    alert(this.language === 'english' 
                        ? `Game over! The array wasn't sorted after ${completedPasses} passes.` 
                        : `遊戲結束！經過${completedPasses}次遍歷，數組仍未排序完成。`);
                }, 500);
                return true; // Game ended with loss
            }
        }
        return false; // Game continues
    }

    findNextOptimalSwap() {
        for (let i = 0; i < this.currentNumbers.length - 1; i++) {
            if (this.currentNumbers[i] > this.currentNumbers[i + 1]) {
                return [i, i + 1];
            }
        }
        return null;
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => new BubbleSortGame());
