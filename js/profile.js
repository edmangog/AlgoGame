import { auth } from '../shared/js/firebase-config.js';
import { getUserProfile, saveUserProfile } from '../shared/js/user-manager.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const profileAvatar = document.getElementById('profile-avatar');
const profileUsername = document.getElementById('profile-username');
const profileEmail = document.getElementById('profile-email');
const editAvatarButton = document.getElementById('edit-avatar-button');
const achievementsList = document.getElementById('achievements-list');
const backToHomeButton = document.getElementById('back-to-home');

const progressAlgorithmIds = ['bubbleSort', 'insertionSort1', 'insertionSort2', 'binarySearch'];

/**
 * Loads and displays the user profile.
 * @param {string} uid - The Firebase User ID.
 */
async function loadAndDisplayUserProfile(uid) {
  try {
    const userProfile = await getUserProfile(uid);
    if (userProfile) {
      displayUserProfile(userProfile);
    } else {
      profileUsername.textContent = 'Profile not found.';
      console.warn("User profile not found for UID:", uid);
    }
  } catch (error) {
    console.error("Error loading user profile:", error);
    profileUsername.textContent = 'Error loading profile.';
  }
}

/**
 * Renders user profile information on profile.html.
 * @param {Object} userProfile - The user profile data.
 */
function displayUserProfile(userProfile) {
  profileAvatar.src = userProfile.avatar || 'https://via.placeholder.com/120x120?text=Avatar';
  profileUsername.textContent = userProfile.username;
  profileEmail.textContent = auth.currentUser ? auth.currentUser.email : 'N/A';

  // Display progress
  progressAlgorithmIds.forEach(algo => {
    const progress = userProfile.progress[algo];
    if (progress) {
      document.getElementById(`${algo}-mastery`).textContent = progress.mastery;
      document.getElementById(`${algo}-timeSpent`).textContent = `${progress.stats.timeSpent}s`;
      document.getElementById(`${algo}-accuracy`).textContent = `${progress.stats.accuracy}%`;
      document.getElementById(`${algo}-gamesPlayed`).textContent = progress.stats.gamesPlayed;
    }
  });

  // Display achievements
  achievementsList.innerHTML = '';
  if (userProfile.achievements && userProfile.achievements.length > 0) {
    userProfile.achievements.forEach(achievement => {
      const li = document.createElement('li');
      li.textContent = achievement;
      achievementsList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No achievements yet.';
    achievementsList.appendChild(li);
  }
}

/**
 * Updates user's avatar in Firestore.
 * @param {string} uid - The Firebase User ID.
 * @param {string} newAvatarUrl - The new avatar URL.
 */
async function updateAvatar(uid, newAvatarUrl) {
  try {
    await saveUserProfile(uid, { avatar: newAvatarUrl });
    profileAvatar.src = newAvatarUrl;
    alert('Avatar updated successfully!');
  } catch (error) {
    console.error("Error updating avatar:", error);
    alert('Failed to update avatar. Please try again.');
  }
}

// --- Event Listeners ---
editAvatarButton.addEventListener('click', async () => {
  const newAvatar = prompt('Enter new avatar URL:');
  if (newAvatar && auth.currentUser) {
    await updateAvatar(auth.currentUser.uid, newAvatar);
  }
});

backToHomeButton.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// --- Auth State Change Listener ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, load profile
    loadAndDisplayUserProfile(user.uid);
  } else {
    // User is signed out, redirect to auth.html
    window.location.href = 'auth.html';
  }
});
