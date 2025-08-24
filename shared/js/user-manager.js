import { auth, db } from './firebase-config.js';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Default user profile structure
const defaultUserProfile = {
  username: '',
  avatar: 'https://via.placeholder.com/120x120?text=Avatar', // Publicly accessible placeholder avatar
  language: 'en',
  progress: {
    bubbleSort: { mastery: 'None', stats: { timeSpent: 0, accuracy: 0, gamesPlayed: 0 } },
    insertionSort1: { mastery: 'None', stats: { timeSpent: 0, accuracy: 0, gamesPlayed: 0 } },
    insertionSort2: { mastery: 'None', stats: { timeSpent: 0, accuracy: 0, gamesPlayed: 0 } },
    binarySearch: { mastery: 'None', stats: { timeSpent: 0, accuracy: 0, gamesPlayed: 0 } },
  },
  achievements: [],
};

/**
 * Initializes Firebase (already done in firebase-config.js, but this function can be a wrapper if needed)
 */
function initFirebase() {
  // Firebase is already initialized via firebase-config.js
  console.log("Firebase initialized.");
}

/**
 * Returns the currently logged-in Firebase user.
 * @returns {Object|null} The Firebase user object or null if no user is logged in.
 */
function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Logs out the current user.
 */
async function logoutUser() {
  try {
    await signOut(auth);
    localStorage.removeItem('algogame_uid');
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}

/**
 * Saves or updates user profile data in Firestore.
 * @param {string} uid - The Firebase User ID.
 * @param {Object} userProfileData - The user profile data to save.
 * @returns {Promise<void>} A promise that resolves when the profile is saved.
 */
async function saveUserProfile(uid, userProfileData) {
  try {
    console.log("saveUserProfile: Attempting to save user profile for UID:", uid, "with data:", userProfileData);
    if (!db) {
      console.error("saveUserProfile: Firestore DB object is not initialized.");
      throw new Error("Firestore DB not initialized.");
    }
    const userRef = doc(db, "users", uid);
    console.log("saveUserProfile: User reference created:", userRef.path);
    console.log("saveUserProfile: Calling setDoc with data:", { ...defaultUserProfile, ...userProfileData });
    
    // Add detailed logging for document creation
    try {
      await setDoc(userRef, { ...defaultUserProfile, ...userProfileData }, { merge: true });
      console.log("saveUserProfile: setDoc completed successfully for UID:", uid);
      
      // Verify document creation
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        console.log("saveUserProfile: Document verified successfully for UID:", uid);
      } else {
        console.error("saveUserProfile: Document verification failed for UID:", uid);
      }
    } catch (setDocError) {
      console.error("saveUserProfile: Error in setDoc operation:", setDocError);
      throw setDocError;
    }
  } catch (error) {
    console.error("saveUserProfile: Error saving user profile:", error);
    throw error;
  }
}

/**
 * Retrieves user profile data from Firestore.
 * @param {string} uid - The Firebase User ID.
 * @returns {Promise<Object|null>} A promise that resolves with the user profile data or null if not found.
 */
async function getUserProfile(uid, retries = 10, delay = 500) { // Increased retries and initial delay for robustness
  try {
    console.log(`Attempting to get user profile for UID: ${uid} (Retries left: ${retries}, Delay: ${delay / 1000}s)`);
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      console.log("User profile found for UID:", uid);
      return docSnap.data();
    } else {
      if (retries > 0) {
        console.warn(`User profile not found for UID: ${uid}. Retrying in ${delay / 1000}s... (${retries} retries left)`);
        await new Promise(res => setTimeout(res, delay));
        return getUserProfile(uid, retries - 1, delay * 1.5); // Exponential backoff with 1.5 multiplier
      }
      console.error("No such user profile for UID:", uid, "after all retries. This user profile might be missing.");
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
}

/**
 * Updates a specific algorithm's progress for a user.
 * @param {string} uid - The Firebase User ID.
 * @param {string} algorithm - The name of the algorithm (e.g., 'bubbleSort').
 * @param {Object} progressData - The progress data to update.
 * @returns {Promise<void>} A promise that resolves when the progress is updated.
 */
async function updateUserProgress(uid, algorithm, progressData) {
  try {
    const userRef = doc(db, "users", uid);
    const updatePath = `progress.${algorithm}`;
    await updateDoc(userRef, {
      [updatePath]: progressData
    });
    console.log(`User progress for ${algorithm} updated successfully for UID:`, uid);
  } catch (error) {
    console.error(`Error updating user progress for ${algorithm}:`, error);
    throw error;
  }
}

/**
 * Checks if a username is already taken in Firestore.
 * @param {string} username - The username to check.
 * @returns {Promise<boolean>} A promise that resolves to true if the username is taken, false otherwise.
 */
async function checkUsernameAvailability(username) {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // If not empty, username is taken
  } catch (error) {
    console.error("Error checking username availability:", error);
    throw error;
  }
}

export {
  initFirebase,
  getCurrentUser,
  logoutUser,
  saveUserProfile,
  getUserProfile,
  updateUserProgress,
  checkUsernameAvailability,
};
