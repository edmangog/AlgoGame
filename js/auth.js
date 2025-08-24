import { auth, db } from '../shared/js/firebase-config.js';
import {
  saveUserProfile,
  checkUsernameAvailability,
  getCurrentUser,
  getUserProfile // Added getUserProfile
} from '../shared/js/user-manager.js';
import { doc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut // Added signOut
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";


const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');

const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');
const loginError = document.getElementById('login-error');

const signupEmailInput = document.getElementById('signup-email');
const signupPasswordInput = document.getElementById('signup-password');
const signupUsernameInput = document.getElementById('signup-username');
const signupAvatarUrlInput = document.getElementById('signup-avatar-url');
const signupButton = document.getElementById('signup-button');
const signupError = document.getElementById('signup-error');
const usernameCheckMessage = document.getElementById('username-check-message');
const guestButton = document.getElementById('guest-button'); // Added guest button

// --- Form Switching Logic ---
showSignupLink.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.add('hidden');
  signupForm.classList.remove('hidden');
  clearMessages();
});

showLoginLink.addEventListener('click', (e) => {
  e.preventDefault();
  signupForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  clearMessages();
});

function clearMessages() {
  loginError.textContent = '';
  signupError.textContent = '';
  usernameCheckMessage.textContent = '';
}

// --- Username Availability Check ---
let usernameCheckTimeout;
signupUsernameInput.addEventListener('input', () => {
  clearTimeout(usernameCheckTimeout);
  const username = signupUsernameInput.value.trim();
  if (username.length > 0) {
    usernameCheckMessage.textContent = 'Checking availability...';
    usernameCheckMessage.style.color = 'var(--color-text-secondary)';
    usernameCheckTimeout = setTimeout(async () => {
      try {
        const isTaken = await checkUsernameAvailability(username);
        if (isTaken) {
          usernameCheckMessage.textContent = 'Username is already taken.';
          usernameCheckMessage.style.color = 'var(--color-error)';
          signupButton.disabled = true;
        } else {
          usernameCheckMessage.textContent = 'Username is available!';
          usernameCheckMessage.style.color = 'var(--color-success)';
          signupButton.disabled = false;
        }
      } catch (error) {
        console.error("Error checking username:", error);
        usernameCheckMessage.textContent = 'Error checking username.';
        usernameCheckMessage.style.color = 'var(--color-error)';
        signupButton.disabled = true;
      }
    }, 500);
  } else {
    usernameCheckMessage.textContent = '';
    signupButton.disabled = true; // Disable button if username is empty
  }
});

// --- Signup Logic ---
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const email = signupEmailInput.value.trim();
  const password = signupPasswordInput.value.trim();
  const username = signupUsernameInput.value.trim();
  const avatarUrl = signupAvatarUrlInput.value.trim();

  if (!email || !password || !username) {
    signupError.textContent = 'Please fill in all required fields (Email, Password, Username).';
    return;
  }

  if (password.length < 6) {
    signupError.textContent = 'Password should be at least 6 characters.';
    return;
  }

  try {
    const isTaken = await checkUsernameAvailability(username);
    if (isTaken) {
      signupError.textContent = 'Username is already taken. Please choose another.';
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("Auth user created with UID:", user.uid); // Added log

    const userProfile = {
      uid: user.uid,
      username: username,
      avatar: avatarUrl || 'https://via.placeholder.com/120x120?text=Avatar', // Default avatar
      language: 'en', // Default language
      progress: {
        bubbleSort: { mastery: 'None', stats: { timeSpent: 0, accuracy: 0, gamesPlayed: 0 } },
        insertionSort1: { mastery: 'None', stats: { timeSpent: 0, accuracy: 0, gamesPlayed: 0 } },
        insertionSort2: { mastery: 'None', stats: { timeSpent: 0, accuracy: 0, gamesPlayed: 0 } },
        binarySearch: { mastery: 'None', stats: { timeSpent: 0, accuracy: 0, gamesPlayed: 0 } },
      },
      achievements: [],
    };

    await saveUserProfile(user.uid, userProfile);
    console.log("saveUserProfile call completed for UID:", user.uid); // Added log
    
    // Add delay to allow Firestore to propagate the new document
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Signup process completed in auth.js."); // Modified log
    // localStorage.setItem('algogame_uid', user.uid); // Handled by onAuthStateChanged
    // window.location.href = 'index.html'; // Handled by onAuthStateChanged
  } catch (error) {
    console.error("Signup error:", error);
    signupError.textContent = `Signup failed: ${error.message}`;
  }
});

// --- Login Logic ---
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value.trim();

  if (!email || !password) {
    loginError.textContent = 'Please enter both email and password.';
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful, onAuthStateChanged will handle redirection."); // Added log
    // localStorage.setItem('algogame_uid', user.uid); // Handled by onAuthStateChanged
    // window.location.href = 'index.html'; // Handled by onAuthStateChanged
  } catch (error) {
    console.error("Login error:", error);
    loginError.textContent = `Login failed: ${error.message}`;
  }
});

// --- Auth State Change Listener ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("onAuthStateChanged detected user:", user.uid);
    // If user is signed in and we are on auth.html, try to get profile and redirect
    if (window.location.pathname.endsWith('/auth.html')) {
      try {
        const userProfile = await getUserProfile(user.uid); // This will retry internally
        if (userProfile) {
          localStorage.setItem('algogame_uid', user.uid);
          console.log("User profile confirmed, redirecting to index.html");
          window.location.href = 'index.html';
        } else {
          console.error("Auth state changed, but user profile could not be retrieved after retries. Forcing logout for UID:", user.uid);
          loginError.textContent = 'Failed to load user profile. Please try logging in again.';
          signupError.textContent = 'Failed to create user profile. Please try signing up again.';
          await signOut(auth); // Force logout to break the loop
          return; // IMPORTANT: Return after signOut to prevent further execution in this invocation
        }
      } catch (error) {
        console.error("Error during profile check in onAuthStateChanged for UID:", user.uid, error);
        loginError.textContent = `Error: ${error.message}`;
        signupError.textContent = `Error: ${error.message}`;
        await signOut(auth); // Force logout on error to break the loop
        return; // IMPORTANT: Return after signOut to prevent further execution in this invocation
      }
    }
    // If user is signed in but not on auth.html, do nothing here.
    // Other pages (like index.html) will handle their own auth state.
  } else {
    console.log("onAuthStateChanged detected no user. Ensuring on auth.html.");
    // If user is signed out and we are NOT on auth.html, redirect to auth.html
    if (!window.location.pathname.endsWith('/auth.html')) {
      window.location.href = 'auth.html';
    }
    // If user is signed out and we ARE on auth.html, do nothing (stay on page).
  }
});

// --- Guest Login Logic ---
guestButton.addEventListener('click', () => {
  localStorage.removeItem('algogame_uid'); // Clear any stored UID
  window.location.href = 'index.html'; // Redirect to main page
});
