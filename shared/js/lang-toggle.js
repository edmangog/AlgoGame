export function setupLanguageToggle() {
    const toggleButton = document.querySelector('.lang-toggle');
    if (!toggleButton) return;

    let currentLanguage = 'en'; // Default language

    const setLanguage = (lang) => {
        currentLanguage = lang;
        const englishElements = document.querySelectorAll('.english');
        const chineseElements = document.querySelectorAll('.chinese');

        englishElements.forEach(el => {
            el.style.display = (lang === 'en') ? '' : 'none';
        });

        chineseElements.forEach(el => {
            el.style.display = (lang === 'zh') ? '' : 'none';
        });
        // Dispatch a custom event when the language changes
        document.dispatchEvent(new CustomEvent('languageChange', { detail: { language: currentLanguage } }));
    };

    // Load initial language from local storage
    const storedLang = localStorage.getItem('algogame-language');
    setLanguage(storedLang || 'en');

    toggleButton.addEventListener('click', () => {
        const newLanguage = currentLanguage === 'en' ? 'zh' : 'en';
        setLanguage(newLanguage);
        localStorage.setItem('algogame-language', newLanguage);
    });
}
