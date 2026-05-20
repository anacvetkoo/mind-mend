import {
  collection,
  deleteDoc,
  deleteField,
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

export interface LibraryContentItem {
  id: string;
  title: string;
  category: 'relaxation' | 'breathing' | 'sound';
  categoryLabel: string;
  duration?: string;
  description: string;
  therapistId?: string;
  therapistName?: string;
  therapistAvatar?: string;
  therapistTitle?: string;
  therapistBio?: string;
  therapistRating?: number;
  therapistReviews?: number;
  thumbnailGradient?: string;
  gradient?: string;
  thumbnailType?: 'color' | 'image';
  thumbnailImage?: string | null;
  contentType?: 'steps' | 'video' | 'audio';
  steps?: Array<{ title: string; description: string }>;
  difficulty?: string;
  audioUrl?: string;
  videoUrl?: string;
  createdAt?: any;
  likes?: number;
  views?: number;
  isDraft?: true;
}

const getCategoryData = (category: string, contentType?: string) => {
  if (category === 'Sound Therapy' || category === 'sound' || contentType === 'audio') {
    return { category: 'sound' as const, categoryLabel: 'Sound Therapy' };
  }

  if (category === 'Breathing' || category === 'breathing') {
    return { category: 'breathing' as const, categoryLabel: 'Breathing Technique' };
  }

  return { category: 'relaxation' as const, categoryLabel: 'Relaxation Exercise' };
};

const getCssGradient = (gradient?: string) => {
  if (!gradient) {
    return 'linear-gradient(135deg, #C4B5FD 0%, #7C3AED 100%)';
  }

  if (gradient.includes('soft-mint')) {
    return 'linear-gradient(135deg, #86EFAC 0%, #93C5FD 100%)';
  }

  if (gradient.includes('soft-pink')) {
    return 'linear-gradient(135deg, #FBCFE8 0%, #C4B5FD 100%)';
  }

  return 'linear-gradient(135deg, #C4B5FD 0%, #7C3AED 100%)';
};

const getFirstStringValue = (...values: unknown[]): string => {
  const value = values.find((item) => typeof item === 'string' && item.trim() !== '');

  return typeof value === 'string' ? value.trim() : '';
};

const getTherapistFullName = (therapistData: any, contentData: any): string => {
  const fullName = getFirstStringValue(
    therapistData.displayName,
    therapistData.fullName,
    therapistData.name,
    therapistData.username,
    contentData.therapistName
  );

  if (fullName) return fullName;

  const firstName = getFirstStringValue(
    therapistData.firstName,
    therapistData.ime
  );

  const lastName = getFirstStringValue(
    therapistData.lastName,
    therapistData.priimek
  );

  const combinedName = `${firstName} ${lastName}`.trim();

  return combinedName || 'Therapist';
};

const mapTherapistData = (therapistId: string | undefined, therapistData: any, contentData: any) => {
  return {
    therapistId,
    therapistName: getTherapistFullName(therapistData, contentData),
    therapistAvatar: getFirstStringValue(
      therapistData.avatar,
      therapistData.photoURL,
      therapistData.profileImage,
      therapistData.profileImageUrl,
      therapistData.imageUrl,
      therapistData.avatarUrl,
      contentData.therapistAvatar
    ),
    therapistTitle: getFirstStringValue(
      therapistData.title,
      therapistData.specialization,
      therapistData.profession,
      therapistData.roleTitle,
      therapistData.occupation,
      contentData.therapistTitle
    ) || 'Mental health professional',
    therapistBio: getFirstStringValue(
      therapistData.bio,
      therapistData.about,
      therapistData.description,
      therapistData.profileDescription,
      contentData.therapistBio
    ) || 'This therapist creates supportive mental health and wellness content.',
    therapistRating: therapistData.rating || contentData.therapistRating || 5,
    therapistReviews: therapistData.reviews || therapistData.reviewCount || contentData.therapistReviews || 0
  };
};

export const getLibraryContent = async (): Promise<LibraryContentItem[]> => {
  const snapshot = await getDocs(collection(db, 'content'));

  const contentItems = await Promise.all(
    snapshot.docs.map(async (contentDocument) => {
      const data = contentDocument.data();
      const categoryData = getCategoryData(data.category, data.contentType);
      const therapistId = getFirstStringValue(data.therapistId, data.createdBy, data.authorId);

      let therapistData: any = {};

      if (therapistId) {
        const therapistSnapshot = await getDoc(doc(db, 'users', therapistId));

        if (therapistSnapshot.exists()) {
          therapistData = therapistSnapshot.data();
        }
      }

      const therapist = mapTherapistData(therapistId, therapistData, data);

      return {
        id: contentDocument.id,
        title: data.title || '',
        category: categoryData.category,
        categoryLabel: categoryData.categoryLabel,
        duration: data.duration,
        description: data.description || '',
        ...therapist,
        thumbnailGradient: getCssGradient(data.gradient),
        gradient: data.gradient,
        thumbnailType: data.thumbnailType || 'color',
        thumbnailImage: data.thumbnailUrl || data.thumbnailImage || null,
        contentType: data.contentType || (categoryData.category === 'sound' ? 'audio' : 'steps'),
        steps: data.steps || [],
        difficulty: data.difficulty,
        audioUrl: data.audioUrl,
        videoUrl: data.videoUrl,
        createdAt: data.createdAt,
        likes: data.likes || data.likeCount || 0,
        views: data.views || data.viewCount || 0,
        isDraft: data.isDraft
      };
    })
  );

  return contentItems.filter((item) => item.isDraft !== true);
};

export const incrementContentViews = async (contentId: string): Promise<void> => {
  await updateDoc(doc(db, 'content', contentId), {
    views: increment(1)
  });
};

export const getMoreContentFromTherapist = async (
  therapistId: string,
  currentContentId: string
): Promise<LibraryContentItem[]> => {
  const contentItems = await getLibraryContent();

  return contentItems
    .filter((item) => item.therapistId === therapistId && item.id !== currentContentId)
    .slice(0, 4);
};