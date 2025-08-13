export function setupLanguageToggle() {
    const toggleButton = document.querySelector('.lang-toggle');
    if (!toggleButton) return;

    toggleButton.addEventListener('click', () => {
        const englishElements = document.querySelectorAll('.english');
        const chineseElements = document.querySelectorAll('.chinese');
        
        englishElements.forEach(el => {
            el.style.display = el.style.display === 'none' ? '' : 'none';
        });
        
        chineseElements.forEach(el => {
            el.style.display = el.style.display === 'none' ? '' : 'none';
        });
    });
}
