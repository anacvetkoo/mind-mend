import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createContent,
  incrementContentViews,
  getTherapistContent
} from '../content';
import { auth } from '../firebaseConfig';
import { setDoc, updateDoc, getDocs, increment } from 'firebase/firestore';
import { uploadBytes, getDownloadURL } from 'firebase/storage';

vi.mock('../firebaseConfig', () => ({
  db: {},
  storage: {},
  auth: { currentUser: null }
}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    doc: vi.fn(() => ({ id: 'mocked_content_id' })),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    increment: vi.fn((val) => ({ type: 'increment', value: val })),
    serverTimestamp: vi.fn(() => 'mocked-timestamp'),
  };
});

vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn().mockResolvedValue(undefined),
  getDownloadURL: vi.fn().mockResolvedValue('https://storage.googleapis.com/mock-file-url'),
}));

describe('Content Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication guard', () => {
    it('should throw an error if createContent is called by an unauthenticated user', async () => {
      // Nihče ni vpisan
      vi.spyOn(auth, 'currentUser', 'get').mockReturnValue(null);

      await expect(createContent({ title: 'Test', category: 'relaxation', gradient: 'g1' }, false))
        .rejects
        .toThrow('Therapist is not authenticated.');
    });
  });

  describe('createContent', () => {
    it('should upload files and clear out empty/null values on save', async () => {
      // Vpisan je terapevt z ID-jem 'therapist_abc'
      vi.spyOn(auth, 'currentUser', 'get').mockReturnValue({ uid: 'therapist_abc' } as any);
      vi.mocked(setDoc).mockResolvedValueOnce(undefined);

      const mockContent = {
        title: 'Meditation 101',
        category: 'relaxation',
        gradient: 'g1',
        description: '', // to more funkcija "removeEmptyValues" odstraniti
        difficulty: 'Easy' as const
      };

      // Ustvarimo lažno datoteko za test nalaganja
      const mockAudioFile = new File([''], 'audio.mp3', { type: 'audio/mp3' });

      const contentId = await createContent(mockContent, false, { audioFile: mockAudioFile });

      expect(contentId).toBe('mocked_content_id');
      expect(uploadBytes).toHaveBeenCalled();
      expect(getDownloadURL).toHaveBeenCalled();

      // Preverimo, da je setDoc prejel očiščene podatke
      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          title: 'Meditation 101',
          therapistId: 'therapist_abc',
          audioUrl: 'https://storage.googleapis.com/mock-file-url',
          audioFileName: 'audio.mp3',
          views: 0,
        })
      );
    });
  });

  describe('incrementContentViews', () => {
    it('should call updateDoc with firestore increment function', async () => {
      vi.mocked(updateDoc).mockResolvedValueOnce(undefined);

      await incrementContentViews('content_123');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          views: expect.objectContaining({ type: 'increment', value: 1 })
        })
      );
    });
  });

  describe('getTherapistContent sorting', () => {
    it('should correctly sort the content by updatedAt timestamp in descending order', async () => {
      vi.spyOn(auth, 'currentUser', 'get').mockReturnValue({ uid: 'therapist_abc' } as any);

      // Pripravimo dva lažna dokumenta z različnimi časovnimi žigi
      const mockDocs = [
        {
          id: 'old_content',
          data: () => ({ title: 'Old', updatedAt: { toMillis: () => 1000 } })
        },
        {
          id: 'new_content',
          data: () => ({ title: 'New', updatedAt: { toMillis: () => 5000 } })
        }
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({ docs: mockDocs } as any);

      const result = await getTherapistContent();

      expect(result).toHaveLength(2);
      // Prvi element v tabeli mora biti tisti z višjim milisekundnim žigom
      expect(result[0].id).toBe('new_content');
      expect(result[1].id).toBe('old_content');
    });
  });
});