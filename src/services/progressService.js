import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';

const DEFAULT_PROGRESS = {
  completedScenarios: [],
  completedTopics: [],
  challengeAttempts: 0,
  bestScore: 0,
  totalPoints: 0,
  bestStreak: 0,
  achievements: [],
  lastUpdated: new Date().toISOString()
};

export const ACHIEVEMENTS_LIST = [
  { id: 'first_step', title: 'First Defense', description: 'Completed your first practice scenario', icon: '🎯' },
  { id: 'streak_flame', title: 'Streak Flame', description: 'Achieved a streak of 3 or more correct answers', icon: '🔥' },
  { id: 'safety_champion', title: 'Safety Champion', description: 'Scored 80+ points in the Digital Safety Challenge', icon: '🏆' },
  { id: 'perfect_shield', title: 'Perfect Shield', description: 'Achieved a perfect 100/100 score in the Challenge', icon: '🛡️' },
  { id: 'knowledge_explorer', title: 'Knowledge Explorer', description: 'Explored 3 or more learning topics', icon: '📚' }
];

// Fetch user progress from Firestore (with local fallback)
export async function getUserProgress(userId) {
  if (!userId) return { ...DEFAULT_PROGRESS };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'userProgress', userId);
      const docSnap = await Promise.race([
        getDoc(docRef),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 2000))
      ]);
      if (docSnap && docSnap.exists()) {
        return { ...DEFAULT_PROGRESS, ...docSnap.data() };
      }
    } catch (err) {
      console.warn('Could not read from Firestore, checking local storage:', err.message);
    }
  }

  // Fallback to local storage
  try {
    const saved = localStorage.getItem(`ds_progress_${userId}`);
    if (saved) {
      return { ...DEFAULT_PROGRESS, ...JSON.parse(saved) };
    }
  } catch {
    // Ignore JSON errors
  }

  return { ...DEFAULT_PROGRESS };
}

// Save or update user progress in Firestore (with local fallback)
export async function saveUserProgress(userId, progressData) {
  if (!userId) return null;

  const current = await getUserProgress(userId);
  const updated = {
    ...current,
    ...progressData,
    lastUpdated: new Date().toISOString()
  };

  // Check and award achievements
  const newAchievements = [...(updated.achievements || [])];

  if (updated.completedScenarios?.length >= 1 && !newAchievements.includes('first_step')) {
    newAchievements.push('first_step');
  }
  if (updated.bestStreak >= 3 && !newAchievements.includes('streak_flame')) {
    newAchievements.push('streak_flame');
  }
  if (updated.bestScore >= 80 && !newAchievements.includes('safety_champion')) {
    newAchievements.push('safety_champion');
  }
  if (updated.bestScore >= 100 && !newAchievements.includes('perfect_shield')) {
    newAchievements.push('perfect_shield');
  }
  if (updated.completedTopics?.length >= 3 && !newAchievements.includes('knowledge_explorer')) {
    newAchievements.push('knowledge_explorer');
  }

  updated.achievements = newAchievements;

  // Persist locally
  try {
    localStorage.setItem(`ds_progress_${userId}`, JSON.stringify(updated));
  } catch {
    // Local storage error ignored
  }

  // Persist in Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'userProgress', userId);
      await Promise.race([
        setDoc(docRef, updated, { merge: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 2000))
      ]);
    } catch (err) {
      console.warn('Could not write to Firestore:', err.message);
    }
  }

  return updated;
}
