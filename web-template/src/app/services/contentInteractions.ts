import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { getLibraryContent, type LibraryContentItem } from './content';

export interface UserContentInteractions {
  likedContentIds: string[];
  savedContentIds: string[];
  completedContentIds: string[];
}

export interface ContentProgressItem {
  id: string;
  userId: string;
  contentId: string;
  contentType: 'video' | 'audio' | 'steps';
  currentTime?: number;
  currentStep?: number;
  progress: number;
  updatedAt?: any;
}

const getCurrentUserId = () => auth.currentUser?.uid || '';

const getUserRef = (userId: string) => {
  return doc(db, 'users', userId);
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

  const snapshot = await getDoc(getUserRef(userId));

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
    getUserRef(userId),
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
    getUserRef(userId),
    {
      savedContentIds: isCurrentlySaved ? arrayRemove(contentId) : arrayUnion(contentId)
    },
    { merge: true }
  );

  await updateDoc(doc(db, 'content', contentId), {
    saves: increment(isCurrentlySaved ? -1 : 1)
  });
};

export const markContentAsCompleted = async (contentId: string) => {
  const userId = getCurrentUserId();

  if (!userId) return;

  await setDoc(
    getUserRef(userId),
    {
      completedContentIds: arrayUnion(contentId)
    },
    { merge: true }
  );

  await removeContentProgress(contentId);
};

export const saveContentProgress = async (
  contentId: string,
  contentType: 'video' | 'audio' | 'steps',
  progressData: {
    currentTime?: number;
    currentStep?: number;
    progress: number;
  }
) => {
  const userId = getCurrentUserId();

  if (!userId) return;

  if (progressData.progress <= 0 || progressData.progress >= 100) return;

  await setDoc(
    doc(db, 'contentProgress', `${userId}_${contentId}`),
    {
      userId,
      contentId,
      contentType,
      ...progressData,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
};

export const getUserContentProgress = async (): Promise<ContentProgressItem[]> => {
  const userId = getCurrentUserId();

  if (!userId) return [];

  const progressQuery = query(
    collection(db, 'contentProgress'),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(progressQuery);

  return snapshot.docs.map((progressDocument) => ({
    id: progressDocument.id,
    ...progressDocument.data()
  })) as ContentProgressItem[];
};

export const getContentProgress = async (
  contentId: string
): Promise<ContentProgressItem | null> => {
  const userId = getCurrentUserId();

  if (!userId) return null;

  const progressSnapshot = await getDoc(doc(db, 'contentProgress', `${userId}_${contentId}`));

  if (!progressSnapshot.exists()) return null;

  return {
    id: progressSnapshot.id,
    ...progressSnapshot.data()
  } as ContentProgressItem;
};

export const removeContentProgress = async (contentId: string) => {
  const userId = getCurrentUserId();

  if (!userId) return;

  await deleteDoc(doc(db, 'contentProgress', `${userId}_${contentId}`));
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