import { createElement, formatTime } from '../../shared/js/utils.js';
import { setupLanguageToggle } from '../../shared/js/lang-toggle.js';

class BubbleSortGame {
    constructor() {
        this.currentNumbers = [];
        this.swapCount = 0;
        this.startTime = Date.now();
        this.timerInterval = null;
        this.language = 'english';
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
            <div class="score-board">
                <div>
                    <span class="english">Swaps: </span>
                    <span class="chinese" style="display:none;">交換次數: </span>
                    <span id="swapCount">0</span>
                </div>
                <div>
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
                <button class="new-game">
                    <span class="english">New Game</span>
                    <span class="chinese" style="display:none;">新遊戲</span>
                </button>
                <button class="hint">
                    <span class="english">Hint</span>
                    <span class="chinese" style="display:none;">提示</span>
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
        `;
    }

    createTutorial() {
        return `
            <div class="tutorial">
                <h3 class="english">How to Play</h3>
                <h3 class="chinese" style="display:none;">玩法說明</h3>
                <p class="english">Click adjacent numbers to swap them. Sort in ascending order with the fewest swaps!</p>
                <p class="chinese" style="display:none;">點擊相鄰數字交換位置，用最少步驟完成排序！</p>
                
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
        this.app.querySelector('.hint').addEventListener('click', () => this.showHint());
    }

    newGame() {
        clearInterval(this.timerInterval);
        this.swapCount = 0;
        this.startTime = Date.now();
        this.updateScoreBoard();
        this.generateNumbers();
        this.startTimer();
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
            numBox.addEventListener('click', (e) => this.handleSwap(Number(e.target.dataset.index)));
            numberLine.appendChild(numBox);
        });
    }

    handleSwap(index) {
        const activeItems = this.app.querySelectorAll('.number-box.active');
        if (activeItems.length === 0) {
            this.app.querySelectorAll('.number-box')[index].classList.add('active');
            return;
        }

        const firstIndex = Number(activeItems[0].dataset.index);
        if (Math.abs(firstIndex - index) !== 1) {
            this.resetSelection();
            return;
        }

        this.swapNumbers(firstIndex, index);
        this.swapCount++;
        this.updateScoreBoard();
        this.checkWin();
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
                    this.resetSelection();
                    
                    // Check if swap was optimal
                    if (this.isOptimalSwap(i, j)) {
                        items[i].classList.add('optimal');
                        items[j].classList.add('optimal');
                        setTimeout(() => {
                            items[i].classList.remove('optimal');
                            items[j].classList.remove('optimal');
                        }, 1000);
                    }
                }, 300);
            }, 300);
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
        this.app.querySelector('#swapCount').textContent = this.swapCount;
    }

    checkWin() {
        if (this.currentNumbers.every((val, i, arr) => !i || arr[i-1] <= val)) {
            clearInterval(this.timerInterval);
            const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
            setTimeout(() => {
                alert(this.language === 'english' 
                    ? `Congratulations! Sorted in ${this.swapCount} swaps and ${timeTaken} seconds!` 
                    : `恭喜！用了${this.swapCount}次交換，時間${timeTaken}秒！`);
            }, 500);
        }
    }

    showHint() {
        const nextSwap = this.findNextOptimalSwap();
        if (nextSwap) {
            const items = this.app.querySelectorAll('.number-box');
            items[nextSwap[0]].classList.add('active');
            items[nextSwap[1]].classList.add('active');
            setTimeout(() => this.resetSelection(), 1000);
        }
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
