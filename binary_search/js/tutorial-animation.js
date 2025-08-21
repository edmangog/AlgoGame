// tutorial-animation.js
export function setupTutorialAnimation() {
    const container = document.getElementById('tutorial-animation-container');
    if (!container) return;

    container.innerHTML = `
        <div class="animation-array-container">
            <div class="animation-array"></div>
            <div class="animation-pointers">
                <div class="pointer left-pointer">L</div>
                <div class="pointer mid-pointer">M</div>
                <div class="pointer right-pointer">R</div>
            </div>
        </div>
    `;

    const arrayElement = container.querySelector('.animation-array');
    const leftPointer = container.querySelector('.left-pointer');
    const midPointer = container.querySelector('.mid-pointer');
    const rightPointer = container.querySelector('.right-pointer');

    const array = [5, 12, 23, 30, 45, 58, 67]; // Reduced to 7 elements
    const target = 45; // Example target

    function renderArray(arr, currentLeft, currentRight, currentMid, targetVal) {
        arrayElement.innerHTML = '';
        arr.forEach((num, index) => {
            const numBox = document.createElement('div');
            numBox.classList.add('animation-number-box');
            numBox.textContent = num;

            if (index < currentLeft || index > currentRight) {
                numBox.classList.add('eliminated-animation');
            }
            if (num === targetVal) {
                numBox.classList.add('target-animation');
            }
            arrayElement.appendChild(numBox);
        });

        // Ensure array elements are rendered before calculating offset
        // This forces a reflow and ensures offsetWidth is correct
        arrayElement.offsetWidth; 

        // Calculate the offset of the first number box relative to the container
        // This accounts for the centering of the array within its container
        let firstBoxOffsetLeft = 0;
        const firstNumBox = arrayElement.querySelector('.animation-number-box');
        if (firstNumBox) {
            firstBoxOffsetLeft = firstNumBox.offsetLeft;
        }

        // Position pointers
        const boxWidth = 40; // Width of a number box
        const boxMargin = 5; // Margin on one side (total 10px between boxes)
        const totalBoxWidth = boxWidth + (boxMargin * 2); // Total space taken by one box including its margins

        leftPointer.style.left = `${firstBoxOffsetLeft + currentLeft * totalBoxWidth + (totalBoxWidth / 2) - (leftPointer.offsetWidth / 2)}px`;
        midPointer.style.left = `${firstBoxOffsetLeft + currentMid * totalBoxWidth + (totalBoxWidth / 2) - (midPointer.offsetWidth / 2)}px`;
        rightPointer.style.left = `${firstBoxOffsetLeft + currentRight * totalBoxWidth + (totalBoxWidth / 2) - (rightPointer.offsetWidth / 2)}px`;

        leftPointer.style.display = 'block';
        midPointer.style.display = 'block';
        rightPointer.style.display = 'block';
    }

    let currentLeft = 0;
    let currentRight = array.length - 1;
    let animationSteps = [];

    // Simulate binary search steps for animation
    while (currentLeft <= currentRight) {
        let mid = Math.floor((currentLeft + currentRight) / 2);
        animationSteps.push({ left: currentLeft, right: currentRight, mid: mid });

        if (array[mid] === target) {
            break; // Target found
        } else if (array[mid] < target) {
            currentLeft = mid + 1;
        } else {
            currentRight = mid - 1;
        }
    }

    let stepIndex = 0;
    function animateStep() {
        if (stepIndex < animationSteps.length) {
            const step = animationSteps[stepIndex];
            renderArray(array, step.left, step.right, step.mid, target);
            stepIndex++;
            setTimeout(animateStep, 1500); // Adjust speed as needed
        } else {
            // Loop animation
            stepIndex = 0;
            setTimeout(animateStep, 2000); // Pause before looping
        }
    }

    animateStep(); // Start the animation
}

// Call setupTutorialAnimation when the DOM is ready
document.addEventListener('DOMContentLoaded', setupTutorialAnimation);
