import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from './firebaseConfig';

export interface ContentStep {
  id: number;
  title: string;
  description: string;
}

export interface ContentFiles {
  audioFile?: File;
  videoFile?: File;
  thumbnailFile?: File;
}

export interface ContentItem {
  id?: string;
  therapistId?: string;
  title: string;
  category: string;
  duration?: string;
  gradient: string;
  views?: number;
  likes?: number;
  isDraft?: true;
  description?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  thumbnailType?: 'color' | 'image';
  thumbnailImage?: string | null;
  thumbnailUrl?: string;
  contentType?: 'video' | 'steps' | 'audio';
  steps?: ContentStep[];
  audioUrl?: string;
  videoUrl?: string;
  audioFileName?: string;
  videoFileName?: string;
  createdAt?: any;
updatedAt?: any;
publishedAt?: any;
}

const removeEmptyValues = <T extends Record<string, unknown>>(data: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => {
      if (value === undefined || value === null || value === false) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  ) as Partial<T>;
};

const getCurrentTherapistId = (): string => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('Therapist is not authenticated.');
  }

  return currentUser.uid;
};

const uploadContentFile = async (
  therapistId: string,
  contentId: string,
  file: File,
  folder: string
): Promise<string> => {
  const filePath = `content/${therapistId}/${contentId}/${folder}/${Date.now()}-${file.name}`;
  const fileRef = ref(storage, filePath);

  await uploadBytes(fileRef, file);

  return getDownloadURL(fileRef);
};

export const createContent = async (
  content: ContentItem,
  isDraft: boolean,
  files: ContentFiles = {}
): Promise<string> => {
  const therapistId = getCurrentTherapistId();
  const contentDocumentRef = doc(collection(db, 'content'));

  const uploadedData: Partial<ContentItem> = {};

  if (files.audioFile) {
    uploadedData.audioUrl = await uploadContentFile(therapistId, contentDocumentRef.id, files.audioFile, 'audio');
    uploadedData.audioFileName = files.audioFile.name;
  }

  if (files.videoFile) {
    uploadedData.videoUrl = await uploadContentFile(therapistId, contentDocumentRef.id, files.videoFile, 'video');
    uploadedData.videoFileName = files.videoFile.name;
  }

  if (files.thumbnailFile) {
    uploadedData.thumbnailUrl = await uploadContentFile(therapistId, contentDocumentRef.id, files.thumbnailFile, 'thumbnails');
  }

  const cleanedContent = removeEmptyValues({
    ...content,
    ...uploadedData,
    therapistId,
    views: isDraft ? undefined : 0,
    likes: isDraft ? undefined : 0,
    isDraft: isDraft ? true : undefined,
    thumbnailImage: undefined,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: isDraft ? undefined : serverTimestamp()
  });

  await setDoc(contentDocumentRef, cleanedContent);

  return contentDocumentRef.id;
};

export const updateContent = async (
  contentId: string,
  content: ContentItem,
  isDraft: boolean,
  files: ContentFiles = {}
): Promise<void> => {
  const therapistId = getCurrentTherapistId();
  const uploadedData: Partial<ContentItem> = {};

  if (files.audioFile) {
    uploadedData.audioUrl = await uploadContentFile(therapistId, contentId, files.audioFile, 'audio');
    uploadedData.audioFileName = files.audioFile.name;
  }

  if (files.videoFile) {
    uploadedData.videoUrl = await uploadContentFile(therapistId, contentId, files.videoFile, 'video');
    uploadedData.videoFileName = files.videoFile.name;
  }

  if (files.thumbnailFile) {
    uploadedData.thumbnailUrl = await uploadContentFile(therapistId, contentId, files.thumbnailFile, 'thumbnails');
  }

  const cleanedContent = removeEmptyValues({
    ...content,
    ...uploadedData,
    therapistId,
    isDraft: isDraft ? true : undefined,
    thumbnailImage: undefined,
    updatedAt: serverTimestamp(),
    publishedAt: isDraft ? undefined : serverTimestamp()
  });

  await updateDoc(doc(db, 'content', contentId), {
    ...cleanedContent,
    isDraft: isDraft ? true : deleteField()
  });
};

export const deleteContent = async (contentId: string): Promise<void> => {
  await deleteDoc(doc(db, 'content', contentId));
};

export const getTherapistContent = async (): Promise<ContentItem[]> => {
  const therapistId = getCurrentTherapistId();

  const contentQuery = query(
    collection(db, 'content'),
    where('therapistId', '==', therapistId)
  );

  const snapshot = await getDocs(contentQuery);

  const therapistContent = snapshot.docs.map((contentDocument) => ({
    id: contentDocument.id,
    ...contentDocument.data()
  })) as ContentItem[];

  return therapistContent.sort((firstItem, secondItem) => {
    const firstDate = firstItem.updatedAt?.toMillis?.() || 0;
    const secondDate = secondItem.updatedAt?.toMillis?.() || 0;

    return secondDate - firstDate;
  });
};