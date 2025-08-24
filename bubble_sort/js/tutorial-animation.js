// tutorial-animation.js
export function setupTutorialAnimation() {
    const container = document.getElementById('tutorial-animation-container');
    if (!container) return;

    container.innerHTML = `
        <div class="animation-array-container">
            <div class="animation-array"></div>
            <div class="animation-pointers">
                <!-- Pointers for i and j are not needed for bubble sort tutorial -->
            </div>
        </div>
    `;

    const arrayElement = container.querySelector('.animation-array');
    const compareLeftPointer = container.querySelector('.compare-left');
    const compareRightPointer = container.querySelector('.compare-right');

    const tutorialSwapBtn = document.getElementById('tutorial-swap');
    const tutorialNoSwapBtn = document.getElementById('tutorial-no-swap');

    let array = [5, 1, 4, 2, 8]; // Example array for bubble sort
    const originalArray = [...array]; // Keep a copy for reset
    let animationSteps = [];
    let currentPass = 0; // Track current pass
    let animationTimeout; // To store the timeout ID

    const currentPassDisplay = document.getElementById('current-tutorial-pass');
    const replayButton = document.getElementById('tutorial-replay-button');

    function bubbleSortSimulation(arr) {
        let n = arr.length;
        let a = [...arr]; // Work on a copy
        for (let i = 0; i < n - 1; i++) {
            currentPass = i + 1; // Update current pass
            for (let j = 0; j < n - 1; j++) {
                // Step 1: Show comparison state, and indicate the *expected* action
                if (a[j] > a[j + 1]) {
                    animationSteps.push({ array: [...a], i: j, j: j + 1, expectedAction: 'swap', pass: currentPass });
                    // Perform swap for the next visual state
                    let temp = a[j];
                    a[j] = a[j + 1];
                    a[j + 1] = temp;
                    // Step 2: Show the result of the swap (array changed, button highlighted)
                    animationSteps.push({ array: [...a], i: j, j: j + 1, expectedAction: 'swap_done', pass: currentPass });
                } else {
                    animationSteps.push({ array: [...a], i: j, j: j + 1, expectedAction: 'no-swap', pass: currentPass });
                    // No array change, but still show the 'no-swap' button highlighted
                    animationSteps.push({ array: [...a], i: j, j: j + 1, expectedAction: 'no-swap_done', pass: currentPass });
                }
            }
        }
        // Add a final step to show the sorted array
        animationSteps.push({ array: [...a], i: -1, j: -1, expectedAction: 'sorted', pass: currentPass });
    }

    function initializeAnimation() {
        animationSteps = [];
        array = [...originalArray];
        currentPass = 0;
        stepIndex = 0;
        bubbleSortSimulation(array);
        if (currentPassDisplay) {
            currentPassDisplay.textContent = currentPass;
        }
        if (replayButton) {
            replayButton.style.display = 'none'; // Hide replay button when animation starts
        }
        if (tutorialSwapBtn) {
            tutorialSwapBtn.style.display = 'inline-block'; // Show swap button
        }
        if (tutorialNoSwapBtn) {
            tutorialNoSwapBtn.style.display = 'inline-block'; // Show no swap button
        }
        animateStep();
    }

    function renderArray(arr, currentI, currentJ, isSwapping = false, swappedIndices = []) {
        arrayElement.innerHTML = '';
        arr.forEach((num, index) => {
            const numBox = document.createElement('div');
            numBox.classList.add('animation-number-box');
            numBox.textContent = num;
            numBox.dataset.index = index; // Add data-index for potential reordering

            if (index === currentI || index === currentJ) {
                numBox.classList.add('comparing-animation');
            }
            if (isSwapping && (index === swappedIndices[0] || index === swappedIndices[1])) {
                numBox.classList.add('swapping');
            }
            arrayElement.appendChild(numBox);
        });

        // If swapping, apply the visual swap
        if (isSwapping && swappedIndices.length === 2) {
            const itemI = arrayElement.querySelector(`[data-index="${swappedIndices[0]}"]`);
            const itemJ = arrayElement.querySelector(`[data-index="${swappedIndices[1]}"]`);

            if (itemI && itemJ) {
                const distance = itemJ.offsetLeft - itemI.offsetLeft;
                itemI.style.transform = `translateX(${distance}px)`;
                itemJ.style.transform = `translateX(${-distance}px)`;
            }
        }

        arrayElement.offsetWidth; // Force reflow
    }

    let stepIndex = 0;
    function animateStep() {
        // Reset button styles at the beginning of each step
        [tutorialSwapBtn, tutorialNoSwapBtn].forEach(btn => {
            if (btn) btn.classList.remove('clicked');
        });

        if (stepIndex < animationSteps.length) {
            const step = animationSteps[stepIndex];
            
            if (step.expectedAction === 'swap_start') {
                renderArray(step.array, step.i, step.j, true, [step.i, step.j]);
            } else if (step.expectedAction === 'swap_done') {
                // After the visual swap, update the DOM to reflect the new order
                renderArray(step.array, step.i, step.j); // Render with the new array order
                const items = Array.from(arrayElement.children);
                const itemI = items[step.i];
                const itemJ = items[step.j];

                if (itemI && itemJ) {
                    itemI.style.transform = ''; // Reset transform
                    itemJ.style.transform = ''; // Reset transform

                    // Physically swap the elements in the DOM
                    const parent = itemI.parentNode;
                    parent.insertBefore(itemJ, itemI);
                    parent.insertBefore(itemI, itemJ.nextSibling);
                }
            } else {
                renderArray(step.array, step.i, step.j);
            }

            if (currentPassDisplay) {
                currentPassDisplay.textContent = step.pass;
            }

            // Highlight the button only for the decision-making steps
            if (step.expectedAction === 'swap' && tutorialSwapBtn) {
                tutorialSwapBtn.classList.add('clicked');
            } else if (step.expectedAction === 'no-swap' && tutorialNoSwapBtn) {
                tutorialNoSwapBtn.classList.add('clicked');
            }

            stepIndex++;
            animationTimeout = setTimeout(animateStep, 1500);
        } else {
            // Animation finished
            if (replayButton) {
                replayButton.style.display = 'block'; // Show replay button
            }
            if (tutorialSwapBtn) {
                tutorialSwapBtn.style.display = 'none'; // Hide swap button
            }
            if (tutorialNoSwapBtn) {
                tutorialNoSwapBtn.style.display = 'none'; // Hide no swap button
            }
            // Ensure the final sorted array is displayed
            renderArray(animationSteps[animationSteps.length - 1].array, -1, -1);
            if (currentPassDisplay) {
                currentPassDisplay.textContent = animationSteps[animationSteps.length - 1].pass;
            }
        }
    }

    if (replayButton) {
        replayButton.addEventListener('click', initializeAnimation);
    }

    initializeAnimation();
}

document.addEventListener('DOMContentLoaded', setupTutorialAnimation);
