import { createElement } from '../../shared/js/utils.js';
import { setupLanguageToggle } from '../../shared/js/lang-toggle.js';

class BinarySearchGame {
    constructor() {
        this.array = [];
        this.targetIndex = -1;
        this.left = 0;
        this.right = 0;
        this.mid = 0;
        this.steps = 0;
        this.score = 0; // Added scoring system
        this.gameState = 'initial'; // initial, playing, won, lost, tutorial
        this.language = 'english';
        this.settingMode = false; // Tracks if in boundary setting mode
        this.currentSettingStep = null; // 'left', 'right', 'mid'
        this.tempNewLeft = 0; // Temporary boundary during setting
        this.tempNewRight = 0; // Temporary boundary during setting
        this.hasVisited = localStorage.getItem('binarySearchVisited') === 'true';

        // Get audio elements for sound effects
        this.correctSound = document.getElementById('correctSound');
        this.incorrectSound = document.getElementById('incorrectSound');
        this.winSound = document.getElementById('winSound');
        this.loseSound = document.getElementById('loseSound');
        
        // Feedback system properties
        this.feedbackTimer = null; // Timer for temporary messages
        this.currentGuide = ''; // Current persistent guide message
        this.tempGuideBackup = null; // Backup of guide during temp messages
        
        // Feedback messages
        this.feedbackMessages = {
            correct: {
                english: [
                    "Great move! 🚀",
                    "Perfect decision! 👍",
                    "You're getting it! 😊",
                    "Well done! 🎉",
                    "Exactly right! 💯"
                ],
                chinese: [
                    "太棒了！🚀",
                    "完美的選擇！👍",
                    "你做得很對！😊",
                    "幹得好！🎉",
                    "完全正確！💯"
                ]
            },
            incorrect: {
                english: [
                    "Not quite, try again! 💪",
                    "Check the values again! 👀",
                    "Almost there, keep going! 🌟",
                    "Mistakes help us learn! 📚",
                    "Let's try another approach! 🔄"
                ],
                chinese: [
                    "不太對，再試一次！💪",
                    "再檢查一下數值！👀",
                    "接近了，繼續加油！🌟",
                    "錯誤幫助我們學習！📚",
                    "試試另一種方法！🔄"
                ]
            }
        };

        this.init();
    }

    init() {
        this.setupDOM();
        this.setupEventListeners();
        setupLanguageToggle();
        this.showTutorialIfFirstTime(); // Show tutorial or start game
    }

    setupDOM() {
        this.app = document.getElementById('app');
        this.app.innerHTML = `
            <div class="container">
                <div class="header-container">
                    <div>
                        <h1>
                            <span class="english">Binary Search Game</span>
                            <span class="chinese" style="display:none;">二分搜尋遊戲</span>
                        </h1>
                        <div class="subtitle english">Find the target using binary search!</div>
                        <div class="subtitle chinese" style="display:none;">使用二分搜尋法找到目標！</div>
                    </div>
                    <div class="other-controls">
                        <div class="difficulty">
                            <span class="english">Difficulty:</span>
                            <span class="chinese" style="display:none;">難度:</span>
                            <select id="difficulty">
                                <option value="easy">Easy (7)</option>
                                <option value="medium">Medium (12)</option>
                                <option value="hard">Hard (20)</极>
                            </select>
                        </div>
                        <button class="new-game">
                            <span class="english">New Game</span>
                            <span class="chinese" style="display:none;">新遊戲</span>
                        </button>
                    </div>
                </div>
                
                <div class="game-area">
                    <!-- Score animation container -->
                    <div class="score-animation-container"></div>
                    
                    <!-- Big score display -->
                    <div class="big-score">
                        <span class="english">SCORE: </span>
                        <span class="chinese" style="display:none;">分數: </span>
                        <span id="bigScore">0</span>
                    </div>
                    
                    <div class="score-board">
                        <div style="flex: 1; text-align: right;">
                            <span class="english">Iterations: </span>
                            <span class="chinese" style="display:none;">迭代次數: </span>
                            <span id="stepCount">0</span>
                        </div>
                        <div style="flex: 1; text-align: left;">
                            <span class="english">Time: </span>
                            <span class="chinese" style="display:none;">時間: </span>
                            <span id="timer">0</span>s
                        </div>
                    </div>
                    
                    <div class="number-line" id="numberLine"></div>
                    
                    <div class="controls">
                        ${this.createActionButtons()}
                        <div id="feedbackMessage" class="feedback-message"></div>
                    </div>
                </div>
            </div>
        `;
    }

    createActionButtons() {
        return `
            <div class="core-buttons">
                <button id="foundBtn" class="found-btn">
                    <span class="english">🔍 Found</span>
                    <span class="chinese" style="display:none;">🔍 找到</span>
                </button>
                <button id="elimLeftBtn" class="elim-left-btn">
                    <span class="english">⬅️ Go Left</span>
                    <span class="chinese" style="display:none;">⬅️ 向左</span>
                </button>
                <button id="elimRightBtn" class="elim-right-btn">
                    <span class="english">➡️ Go Right</span>
                    <span class="chinese" style="display:none;">➡️ 向右</span>
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        this.app.querySelector('.new-game').addEventListener('click', () => this.newGame());
        this.app.querySelector('#elimLeftBtn').addEventListener('click', () => this.handleAction('elimLeft'));
        this.app.querySelector('#elimRightBtn').addEventListener('click', () => this.handleAction('elimRight'));
        this.app.querySelector('#foundBtn').addEventListener('click', () => this.handleAction('found'));

        // Tutorial button event listeners
        document.getElementById('start-game-button').addEventListener('click', () => this.dismissTutorial());
        document.getElementById('skip-tutorial-button').addEventListener('click', () => this.dismissTutorial());
        
        // Add touch event listeners for swipe gestures
        const numberLine = this.app.querySelector('#numberLine');
        numberLine.addEventListener('touchstart', this.handleTouchStart.bind(this), false);
        numberLine.addEventListener('touchmove', this.handleTouchMove.bind(this), false);
        numberLine.addEventListener('touchend', this.handleTouchEnd.bind(this), false);
        
        // Initialize touch tracking variables
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
    }

    newGame() {
        // Removed the check that prevented game from starting after tutorial

        // Clear existing timer
        clearInterval(this.timerInterval);
        
        // Get selected difficulty
        const difficulty = this.app.querySelector('#difficulty').value;
        let size = 7; // Easy
        if (difficulty === 'medium') size = 12;
        if (difficulty === 'hard') size = 20;
        
        // Generate sorted array with unique values
        const values = new Set();
        while (values.size < size) {
            values.add(Math.floor(Math.random() * 100) + 1);
        }
        this.array = Array.from(values);
        this.array.sort((a, b) => a - b);
        
        // Select random target
        this.targetIndex = Math.floor(Math.random() * size);
        
        // Reset game state
        this.left = 0;
        this.right = this.array.length - 1;
        this.mid = Math.floor((this.left + this.right) / 2);
        this.steps = 0;
        this.score = 0; // Reset score
        this.gameState = 'playing';
        
        // Reset boundary setting state
        this.settingMode = false;
        this.currentSettingStep = null;
        this.tempNewLeft = 0;
        this.tempNewRight = 0;
        
        // Update score display
        this.updateScore();
        
        // Clear any existing feedback message
        this.showFeedback('');
        
        // Start timer
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.app.querySelector('#timer').textContent = timeElapsed;
        }, 1000);
        
        this.updateStepCount();
        this.renderArray();
        this.updateButtonStates();
    }

    renderArray() {
        const numberLine = document.getElementById('numberLine');
        numberLine.innerHTML = '';
        
        this.array.forEach((num, index) => {
            const numBox = createElement('div', 'number-box', num);
            
            // Highlight target
            if (index === this.targetIndex) {
                numBox.classList.add('target-element');
            }
            
            // Apply eliminated state based on ACTUAL boundaries
            if (index < this.left || index > this.right) {
                numBox.classList.add('eliminated');
            }
            
            // Highlight elements during boundary setting
            if (this.settingMode) {
                const inSearchRange = index >= this.tempNewLeft && index <= this.tempNewRight;
                const isSettingTarget = (
                    (this.currentSettingStep === 'left' && index === this.tempNewLeft) ||
                    (this.currentSettingStep === 'right' && index === this.tempNewRight) ||
                    (this.currentSettingStep === 'mid' && index === Math.floor((this.tempNewLeft + this.tempNewRight) / 2))
                );
                
                if (inSearchRange) {
                    numBox.classList.add('active');
                }
                if (isSettingTarget) {
                    numBox.classList.add('highlight');
                }
            }
            
            // Add annotations for boundaries
            let hasAnnotation = false;
            
                // Show annotations based on current state
                if (this.gameState === 'playing') {
                    // Always show current boundaries when not in setting mode
                    if (!this.settingMode) {
                        const labels = [];
                        if (index === this.left) labels.push('L');
                        if (index === this.right) labels.push('R');
                        if (index === this.mid) labels.push('M');
                        
                        if (labels.length > 0) {
                            const annotationText = labels.join('/');
                            const annotation = createElement('div', 'annotation', annotationText);
                            numBox.appendChild(annotation);
                            hasAnnotation = true;
                        }
                    }
                    // Show temporary annotations during boundary setting
                    else if (this.settingMode) {
                        // Show current M to guide boundary setting
                        if (index === this.mid && 
                           (this.currentSettingStep === 'left' || this.currentSettingStep === 'right')) {
                            const annotation = createElement('div', 'annotation', 'M');
                            numBox.appendChild(annotation);
                            hasAnnotation = true;
                        }
                        
                        // Show L after it's been set
                        if ((this.currentSettingStep === 'right' || this.currentSettingStep === 'mid') && 
                             index === this.tempNewLeft) {
                            const annotation = createElement('div', 'annotation', 'L');
                            numBox.appendChild(annotation);
                            hasAnnotation = true;
                        }
                        // Show R after it's been set
                        if (this.currentSettingStep === 'mid' && index === this.tempNewRight) {
                            const annotation = createElement('div', 'annotation', 'R');
                            numBox.appendChild(annotation);
                            hasAnnotation = true;
                        }
                    }
                }
            
            // Add bottom padding for elements with annotations
            if (hasAnnotation) {
                numBox.style.marginBottom = '40px';
            }
            
            // During setting mode, highlight the proposed new search range
            if (this.settingMode) {
                if (index >= this.tempNewLeft && index <= this.tempNewRight) {
                    numBox.classList.add('active');
                }
            }
            
            // Add click handlers - always allow clicks during setting mode
            if (this.gameState === 'playing' && 
                (this.settingMode || index === this.left || index === this.right)) {
                numBox.addEventListener('click', () => this.updateBoundary(index));
            }
            
            numberLine.appendChild(numBox);
        });
    }

    updateBoundary(index) {
        if (this.settingMode) {
            this.handleBoundarySelection(index);
        } else if (this.gameState === 'playing') {
            if (index === this.left) {
                this.left = index;
            } else if (index === this.right) {
                this.right = index;
            }
            this.mid = Math.floor((this.left + this.right) / 2);
            this.renderArray();
        }
    }

    handleAction(action) {
        if (this.gameState !== 'playing') return;
        
        let correct = false;
        let feedback = '';
        
        switch(action) {
            case 'elimLeft':
                correct = (this.array[this.mid] > this.array[this.targetIndex]);
                if (correct) {
                    // Enter setting mode with L->R->M sequence
                    this.settingMode = true;
                    this.currentSettingStep = 'left';
                    this.tempNewLeft = this.left;
                    this.tempNewRight = this.mid - 1;
                    feedback = this.language === 'english' 
                        ? "Correct! Now set the new LEFT boundary."
                        : "正確！現在設置新的左邊界。";
                    // Set as persistent guide
                    this.showFeedback(feedback);
                    this.disableActionButtons();
                }
                break;
                
            case 'elimRight':
                correct = (this.array[this.mid] < this.array[this.targetIndex]);
                if (correct) {
                    // Enter setting mode with L->R->M sequence
                    this.settingMode = true;
                    this.currentSettingStep = 'left';
                    this.tempNewLeft = this.mid + 1;
                    this.tempNewRight = this.right;
                    feedback = this.language === 'english' 
                        ? "Correct! Now set the new LEFT boundary."
                        : "正確！現在設置新的左邊界。";
                    // Set as persistent guide
                    this.showFeedback(feedback);
                    this.disableActionButtons();
                }
                break;
                
            case 'found':
                correct = (this.mid === this.targetIndex);
                if (correct) {
                    this.gameState = 'won';
                }
                break;
        }
        
        if (!correct) {
            const messages = this.feedbackMessages.incorrect[this.language];
            feedback = messages[Math.floor(Math.random() * messages.length)];
            // Show as temporary message (will restore guide after timeout)
            this.showFeedback(feedback, true);
            
            // Deduct 10 points for incorrect action
            this.score = Math.max(0, this.score - 10);
            this.updateScore();
            this.showScoreAnimation(-10);
            this.playIncorrectSound(); // Play sound for incorrect action
        } else {
            this.steps++;
            this.score += 10; // Add 10 points for correct action
            this.updateStepCount();
            this.updateScore();
            this.showScoreAnimation(10);
            this.playCorrectSound(); // Play sound for correct action
        }
        this.renderArray();
        this.checkGameEnd();
    }

    handleBoundarySelection(index) {
        if (!this.settingMode) return;
        
        let correct = false;
        let feedback = '';
        let nextStep = '';
        
        switch(this.currentSettingStep) {
            case 'left':
                correct = (index === this.tempNewLeft);
                feedback = correct 
                    ? (this.language === 'english' 
                        ? "Great! Now click on the element for the new RIGHT boundary." 
                        : "很好！現在請點擊新的右邊界元素。")
                    : (this.language === 'english' 
                        ? "Not quite. Remember, the new left boundary should be after the middle. Try again!" 
                        : "不太對。記住，新的左邊界應該在中間之後。再試一次！");
                if (correct) {
                    nextStep = 'right';
                }
                break;
                
            case 'right':
                correct = (index === this.tempNewRight);
                feedback = correct 
                    ? (this.language === 'english' 
                        ? "Well done! Now click on the element for the new MIDDLE position." 
                        : "做得好！現在請點擊新的中間位置元素。")
                    : (this.language === 'english' 
                        ? "Almost! The new right boundary should be before the middle. Try again." 
                        : "接近了！新的右邊界應該在中間之前。再試一次。");
                if (correct) {
                    nextStep = 'mid';
                }
                break;
                
            case 'mid':
                const expectedMid = Math.floor((this.tempNewLeft + this.tempNewRight) / 2);
                correct = (index === expectedMid);
                feedback = correct 
                    ? (this.language === 'english' 
                        ? "Perfect! Boundaries updated. Continue searching." 
                        : "完美！邊界已更新。請繼續搜尋。")
                    : (this.language === 'english' 
                        ? "Check the midpoint calculation: floor((left + right) / 2). Try again!" 
                        : "檢查中點計算：floor((左 + 右) / 2)。再極一次！");
                if (correct) {
                    // Update actual boundaries
                    this.left = this.tempNewLeft;
                    this.right = this.tempNewRight;
                    this.mid = expectedMid;
                    
                    // Exit setting mode immediately
                    this.settingMode = false;
                    // Clear guide message after completing boundary setting
                    this.currentGuide = '';
                    this.showFeedback('');
                    this.renderArray();
                    this.updateButtonStates();
                    
                    // Add points for setting boundaries correctly
            this.score += 10;
            this.updateScore();
            this.showScoreAnimation(10);
            this.playCorrectSound(); // Play sound for correct boundary update
        }
        this.renderArray();
    }
        
        if (correct && nextStep) {
            this.currentSettingStep = nextStep;
            // Show next guide message as persistent
            this.showFeedback(feedback);
        } else {
            // Show error as temporary message
            this.showFeedback(feedback, true);
        }
        this.renderArray();
    }

    checkGameEnd() {
        if (this.gameState === 'won' || this.gameState === 'lost') {
            clearInterval(this.timerInterval);
        }
        
        if (this.gameState === 'won') {
            this.playWinSound(); // Play win sound
            alert(this.language === 'english' 
                ? `Congratulations! Found in ${this.steps} steps! Starting new game...` 
                : `恭喜！用了 ${this.steps} 步找到目標！即將開始新遊戲...`);
            this.disableAllButtons();
            
            // Start a new game after showing the message
            setTimeout(() => {
                this.newGame();
            }, 1500);
            return;
        }
        
        if (this.left > this.right) {
            this.gameState = 'lost';
            this.playLoseSound(); // Play lose sound
            alert(this.language === 'english' 
                ? 'Target not found! Starting new game...' 
                : '未找到目標！即將開始新遊戲...');
            this.disableAllButtons();
            
            // Start a new game after showing the message
            setTimeout(() => {
                this.newGame();
            }, 1500);
        }
    }

    disableActionButtons() {
        const buttons = [
            document.getElementById('elimLeftBtn'),
            document.getElementById('elimRightBtn'),
            document.getElementById('foundBtn')
        ];
        
        buttons.forEach(button => {
            if (button) {
                button.disabled = true;
                button.classList.add('disabled-button');
            }
        });
    }
    
    updateButtonStates() {
        const buttons = [
            document.getElementById('elimLeftBtn'),
            document.getElementById('elimRightBtn'),
            document.getElementById('foundBtn')
        ];

        if (this.settingMode) {
            // Disable buttons during boundary setting
            this.disableActionButtons();
        } else if (this.gameState === 'playing') {
            // Enable buttons during normal gameplay
            buttons.forEach(button => {
                if (button) {
                    button.disabled = false;
                    button.classList.remove('disabled-button');
                }
            });
        } else if (this.gameState === 'initial') {
            // Enable buttons in initial state
            buttons.forEach(button => {
                if (button) {
                    button.disabled = false;
                    button.classList.remove('disabled-button');
                }
            });
        } else {
            // Disable buttons in won/lost states
            this.disableAllButtons();
        }
    }

    disableAllButtons() {
        const buttons = [
            document.getElementById('elimLeftBtn'),
            document.getElementById('elimRightBtn'),
            document.getElementById('foundBtn')
        ];
        
        buttons.forEach(button => {
            if (button) {
                button.disabled = true;
                button.classList.add('disabled-button');
            }
        });
    }

    updateStepCount() {
        document.getElementById('stepCount').textContent = this.steps;
    }
    
    updateScore() {
        document.getElementById('bigScore').textContent = this.score;
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

    showFeedback(message, isTemporary = false) {
        const feedbackElement = document.getElementById('feedbackMessage');
        
        // Clear any existing timers
        if (this.feedbackTimer) {
            clearTimeout(this.feedbackTimer);
            this.feedbackTimer = null;
        }
        
        feedbackElement.textContent = message;
        feedbackElement.style.display = 'block';
        
        if (isTemporary) {
            // Store current guide before showing temporary message
            if (this.currentGuide) {
                this.tempGuideBackup = this.currentGuide;
            }
            
            // Set timer to restore guide after 3 seconds
            this.feedbackTimer = setTimeout(() => {
                if (this.tempGuideBackup) {
                    feedbackElement.textContent = this.tempGuideBackup;
                    this.currentGuide = this.tempGuideBackup;
                } else {
                    feedbackElement.style.display = 'none';
                }
            }, 3000);
        } else {
            // This is a persistent guide message
            this.currentGuide = message;
            this.tempGuideBackup = null;
        }
    }

    getRandomFeedback(type) {
        const messages = this.feedbackMessages[type][this.language];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    playCorrectSound() {
        if (this.correctSound) {
            this.correctSound.play().catch(e => console.error("Error playing correct sound:", e));
        }
    }

    playIncorrectSound() {
        if (this.incorrectSound) {
            this.incorrectSound.play().catch(e => console.error("Error playing incorrect sound:", e));
        }
    }

    playWinSound() {
        if (this.winSound) {
            this.winSound.play().catch(e => console.error("Error playing win sound:", e));
        }
    }

    playLoseSound() {
        if (this.loseSound) {
            this.loseSound.play().catch(e => console.error("Error playing lose sound:", e));
        }
    }

    showTutorialIfFirstTime() {
        const tutorialModal = document.getElementById('tutorial-modal');
        if (!this.hasVisited) {
            tutorialModal.style.display = 'flex'; // Show the modal
            this.gameState = 'tutorial'; // Set game state to tutorial
            this.disableAllButtons(); // Disable game buttons during tutorial
        } else {
            tutorialModal.style.display = 'none'; // Hide the modal
            this.newGame(); // Start the game if already visited
        }
    }

    dismissTutorial() {
        const tutorialModal = document.getElementById('tutorial-modal');
        tutorialModal.style.display = 'none'; // Hide the modal
        localStorage.setItem('binarySearchVisited', 'true'); // Mark as visited
        this.hasVisited = true;
        this.gameState = 'playing'; // Set game state to playing before starting new game
        this.newGame(); // Start the game
    }

    showGameDescription() {
        const gameDescriptionElement = document.getElementById('game-description');
        if (gameDescriptionElement) {
            gameDescriptionElement.style.display = 'block';
        }
    }
    
    // Touch event handlers for swipe gestures
    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
    }
    
    handleTouchMove(event) {
        if (!this.touchStartX || !极this.touchStartY) return;
        
        this.touchEndX = event.touches[0].clientX;
        this.touchEndY = event.touches[0].clientY;
        
        // Prevent scrolling if we're detecting a horizontal swipe
        const diffX = Math.abs(this.touchEndX - this.touchStartX);
        const diffY = Math.abs(this.touchEndY - this.touchStartY);
        
        if (diffX > diffY) {
            event.preventDefault();
        }
    }
    
    handleTouchEnd() {
        if (!this.touchStartX || !this.touchStartY || !this.touchEndX || !this.touchEndY) return;
        
        const diffX = this.touchEndX - this.touchStartX;
        const diffY = this.touchEndY - this.touchStartY;
        
        // Only consider horizontal swipes with minimal vertical movement
        if (Math.abs(diffX) > 50 && Math.abs(diffY) < 50) {
            if (diffX < 0) {
                // Swipe left: trigger Go Left
                this.handleAction('elimLeft');
            } else {
                // Swipe right: trigger Go Right
                this.handleAction('elimRight');
            }
        }
        
        // Reset touch points
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => new BinarySearchGame());
