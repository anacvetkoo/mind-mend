import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  increment,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { getLibraryContent, type LibraryContentItem } from './content';

export interface UserContentInteractions {
  likedContentIds: string[];
  savedContentIds: string[];
  completedContentIds: string[];
}

const getCurrentUserId = () => auth.currentUser?.uid || '';

const getUserInteractionsRef = (userId: string) => {
  return doc(db, 'userContentInteractions', userId);
};

export const getUserContentInteractions = async (): Promise<UserContentInteractions> => {
  const userId = getCurrentUserId();

  if (!userId) {
    return {
      likedContentIds: [],
      savedContentIds: [],
      completedContentIds: []
    };
  }

  const snapshot = await getDoc(getUserInteractionsRef(userId));

  if (!snapshot.exists()) {
    return {
      likedContentIds: [],
      savedContentIds: [],
      completedContentIds: []
    };
  }

  const data = snapshot.data();

  return {
    likedContentIds: data.likedContentIds || [],
    savedContentIds: data.savedContentIds || [],
    completedContentIds: data.completedContentIds || []
  };
};

export const toggleLikedContent = async (contentId: string, isCurrentlyLiked: boolean) => {
  const userId = getCurrentUserId();

  if (!userId) return;

  await setDoc(
    getUserInteractionsRef(userId),
    {
      likedContentIds: isCurrentlyLiked ? arrayRemove(contentId) : arrayUnion(contentId)
    },
    { merge: true }
  );

  const contentRef = doc(db, 'content', contentId);

  await updateDoc(contentRef, {
    likes: increment(isCurrentlyLiked ? -1 : 1)
  });
};

export const toggleSavedContent = async (contentId: string, isCurrentlySaved: boolean) => {
  const userId = getCurrentUserId();

  if (!userId) return;

  await setDoc(
    getUserInteractionsRef(userId),
    {
      savedContentIds: isCurrentlySaved ? arrayRemove(contentId) : arrayUnion(contentId)
    },
    { merge: true }
  );
};

export const markContentAsCompleted = async (contentId: string) => {
  const userId = getCurrentUserId();

  if (!userId) return;

  await setDoc(
    getUserInteractionsRef(userId),
    {
      completedContentIds: arrayUnion(contentId)
    },
    { merge: true }
  );
};

const getContentByIds = async (contentIds: string[]): Promise<LibraryContentItem[]> => {
  if (contentIds.length === 0) return [];

  const content = await getLibraryContent();

  return content.filter((item) => contentIds.includes(item.id));
};

export const getLikedContent = async () => {
  const interactions = await getUserContentInteractions();

  return getContentByIds(interactions.likedContentIds);
};

export const getSavedContent = async () => {
  const interactions = await getUserContentInteractions();

  return getContentByIds(interactions.savedContentIds);
};

export const getCompletedContent = async () => {
  const interactions = await getUserContentInteractions();

  return getContentByIds(interactions.completedContentIds);
};