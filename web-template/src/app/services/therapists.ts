import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface TherapistContentPreview {
  id: string;
  title: string;
  duration?: string;
}

export interface TherapistProfileData {
  id: string;
  name: string;
  avatar: string;
  title: string;
  specialization: string;
  rating: number;
  reviews: number;
  bio: string;
  tags: string[];
  yearsExperience: number;
  sessionsCompleted: number;
  content: TherapistContentPreview[];
}

const getStringValue = (...values: unknown[]): string => {
  const value = values.find((item) => typeof item === 'string' && item.trim() !== '');

  return typeof value === 'string' ? value.trim() : '';
};

const mapTherapistData = (id: string, data: any): TherapistProfileData => {
  const firstName = getStringValue(data.firstName, data.ime);
  const lastName = getStringValue(data.lastName, data.priimek);

  return {
    id,
    name:
      getStringValue(
        data.displayName,
        data.fullName,
        data.name,
        `${firstName} ${lastName}`.trim()
      ) || 'Therapist',
    avatar:
      getStringValue(
        data.avatar,
        data.photoURL,
        data.profileImage,
        data.profileImageUrl,
        data.imageUrl,
        data.avatarUrl
      ),
    title:
      getStringValue(
        data.title,
        data.specialization,
        data.profession,
        data.roleTitle,
        data.occupation
      ) || 'Mental health professional',
    specialization:
      getStringValue(
        data.specialization,
        data.profession,
        data.fieldOfWork
      ),
    rating: data.rating || 5,
    reviews: data.reviews || data.reviewCount || 0,
    bio:
      getStringValue(
        data.bio,
        data.about,
        data.description,
        data.profileDescription
      ) || 'This therapist creates supportive mental health and wellness content.',
    tags: data.tags || data.specialties || data.specializations || [],
    yearsExperience: Number(data.yearsExperience || data.experienceYears || data.yearsOfExperience || 0),
    sessionsCompleted: Number(data.sessionsCompleted || 0),
    content: []
  };
};

export const getTherapistById = async (therapistId: string): Promise<TherapistProfileData | null> => {
  const therapistSnapshot = await getDoc(doc(db, 'users', therapistId));

  if (!therapistSnapshot.exists()) return null;

  return mapTherapistData(therapistSnapshot.id, therapistSnapshot.data());
};

export const getTherapists = async (): Promise<TherapistProfileData[]> => {
  const therapistsQuery = query(collection(db, 'users'), where('role', '==', 'therapist'));
  const snapshot = await getDocs(therapistsQuery);

  return snapshot.docs.map((therapistDocument) =>
    mapTherapistData(therapistDocument.id, therapistDocument.data())
  );
};