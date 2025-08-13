import { createElement, formatTime } from '../../shared/js/utils.js';
import { setupLanguageToggle } from '../../shared/js/lang-toggle.js';

class BubbleSortGame {
    constructor() {
        this.currentNumbers = [];
        this.swapCount = 0;
        this.score = 0; // Added scoring system
        this.startTime = Date.now();
        this.timerInterval = null;
        this.language = 'english';
        this.currentIndex = 0;
        this.currentPass = 1;
        this.init();
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
                            <p>+10 points for correct swaps, -10 for unnecessary swaps!</p>
                        </div>
                        <div class="tutorial-content chinese" style="display:none;">
                            <p>您的目标是使用冒泡排序算法将数字按升序排列。</p>
                            <p>当左边数字大于右边时点击"交换"，否则点击"跳过"。</p>
                            <p>正确交换得10分，错误交换扣10分！</p>
                        </div>
                        <button id="startGame" class="english">Start Game</button>
                        <button id="startGame" class="chinese" style="display:none;">开始游戏</button>
                    </div>
                </div>
                
                <h1>
                    <span class="english">Bubble Sort Game</span>
                    <span class="chinese" style="display:none;">冒泡排序遊戲</span>
                </h1>
                <div class="subtitle english">Sort the numbers in ascending order!</div>
                <div class="subtitle chinese" style="display:none;">將數字按從小到大排序！</div>
                
                <div class="game-area">
                    ${this.createScoreBoard()}
                    <div class="number-line" id="numberLine"></div>
                    ${this.createControls()}
                    ${this.createTutorial()}
                </div>
            </div>
        `;
    }

    createScoreBoard() {
        return `
            <div class="big-score">
                <span class="english">SCORE: </span>
                <span class="chinese" style="display:none;">分數: </span>
                <span id="bigScore">0</span>
            </div>
            <div class="score-board">
                <div style="flex: 1; text-align: left;">
                    <span class="english">Pass: </span>
                    <span class="chinese" style="display:none;">遍歷次數: </span>
                    <span id="passCount">1</span>
                </div>
                <div style="flex: 1; text-align: right;">
                    <span class="english">Time: </span>
                    <span class="chinese" style="display:none;">時間: </span>
                    <span id="timer">0</span>s
                </div>
            </div>
        `;
    }

    createControls() {
        return `
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
                <div class="other-controls">
                    <button class="new-game">
                        <span class="english">New Game</span>
                        <span class="chinese" style="display:none;">新遊戲</span>
                    </button>
                    <div class="difficulty">
                        <span class="english">Difficulty:</span>
                        <span class="chinese" style="display:none;">難度:</span>
                        <select id="difficulty">
                            <option value="easy">Easy (6)</option>
                            <option value="medium">Medium (8)</option>
                            <option value="hard">Hard (10)</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    createTutorial() {
        return `
            <div class="tutorial">
                <h3 class="english">How to Play</h3>
                <h3 class="chinese" style="display:none;">玩法說明</h3>
                <p class="english">Use the Swap button when the left number is greater than the right number, otherwise use Skip. Earn 10 points for correct swaps, lose 10 points for unnecessary swaps!</p>
                <p class="chinese" style="display:none;">當左邊數字大於右邊數字時點擊「交換」，否則點擊「跳過」。正確交換得10分，不必要的交換扣10分！</p>
                
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
    
    swapCurrent() {
        if (this.currentIndex >= this.currentNumbers.length - 1) return;
        
        const i = this.currentIndex;
        const j = i + 1;
        
        if (this.currentNumbers[i] > this.currentNumbers[j]) {
            this.swapNumbers(i, j);
            this.swapCount++;
            this.updateScoreBoard();
        }
        
        this.nextStep();
    }
    
    skipCurrent() {
        this.nextStep();
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
        
        if (this.currentNumbers[i] > this.currentNumbers[j]) {
            this.swapNumbers(i, j);
            this.swapCount++;
            this.score += 10; // Add 10 points for correct swap
            this.updateScoreBoard();
        } else {
            // Deduct points and show message for unnecessary swap
            this.score = Math.max(0, this.score - 10); // Ensure score doesn't go negative
            this.updateScoreBoard();
            this.showFeedbackMessage(
                this.language === 'english' ? 
                "No need to swap! -10 points" : 
                "不需要交換！扣10分"
            );
        }
        
        this.nextStep();
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
    
    skipCurrent() {
        this.nextStep();
    }
    
    nextStep() {
        this.currentIndex++;
        
        if (this.currentIndex >= this.currentNumbers.length - 1) {
            this.currentPass++;
            this.updateScoreBoard();
            
            // Check if game should end after this pass
            if (this.checkWin()) {
                return; // End game immediately
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
        // Check if array is sorted
        if (this.currentNumbers.every((val, i, arr) => !i || arr[i-1] <= val)) {
            clearInterval(this.timerInterval);
            const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
            setTimeout(() => {
                alert(this.language === 'english' 
                    ? `Congratulations! Sorted in ${this.swapCount} swaps and ${timeTaken} seconds!` 
                    : `恭喜！用了${this.swapCount}次交換，耗時${timeTaken}秒完成排序！`);
            }, 500);
            return true; // Game ended
        } 
        // End game if max passes reached (n-1 for n elements)
        else if (this.currentPass >= this.currentNumbers.length - 1) {
            clearInterval(this.timerInterval);
            const completedPasses = this.currentNumbers.length - 1;
            setTimeout(() => {
                alert(this.language === 'english' 
                    ? `Game over! The array wasn't sorted after ${completedPasses} passes.` 
                    : `遊戲結束！經過${completedPasses}次遍歷，數組仍未排序完成。`);
            }, 500);
            return true; // Game ended
        }
        return false; // Game continues
    }

    showHint() {
        const i = this.currentIndex;
        const j = i + 1;
        if (i >= this.currentNumbers.length - 1) {
            return;
        }
        const left = this.currentNumbers[i];
        const right = this.currentNumbers[j];
        const shouldSwap = left > right;
        
        const message = this.language === 'english' ?
            `We're comparing the numbers at positions ${i} and ${j}: ${left} and ${right}. ` +
            `Since we're sorting in ascending order, ${shouldSwap ? 'you should swap them because ' + left + ' > ' + right : 'you should NOT swap them because ' + left + ' ≤ ' + right}.`
            :
            `我們正在比較位置 ${i} 和 ${j} 的數字: ${left} 和 ${right}。` +
            `由於我們要升冪排序，${shouldSwap ? '你應該交換它們，因為 ' + left + ' > ' + right : '你不應該交換它們，因為 ' + left + ' ≤ ' + right}。`;
        
        this.showFeedbackMessage(message);
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
