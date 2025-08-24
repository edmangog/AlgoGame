import { auth } from './firebase-config.js';
import { getUserProfile, saveUserProfile } from './user-manager.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
    };

    // Load initial language from user profile or local storage
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userProfile = await getUserProfile(user.uid);
            if (userProfile && userProfile.language) {
                setLanguage(userProfile.language);
            } else {
                const storedLang = localStorage.getItem('algogame-language');
                setLanguage(storedLang || 'en');
            }
        } else {
            const storedLang = localStorage.getItem('algogame-language');
            setLanguage(storedLang || 'en');
        }
    });

    toggleButton.addEventListener('click', async () => {
        const newLanguage = currentLanguage === 'en' ? 'zh' : 'en';
        setLanguage(newLanguage);

        // Save language preference
        const user = auth.currentUser;
        if (user) {
            await saveUserProfile(user.uid, { language: newLanguage });
        }
        localStorage.setItem('algogame-language', newLanguage);
    });
}
