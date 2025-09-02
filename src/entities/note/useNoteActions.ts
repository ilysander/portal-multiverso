import { BSON } from 'realm';
import { useRealm } from '@/app/realm';
import { Note } from './model/Note';
import { OutboxEntry } from './model/Outbox';

type CreateArgs = { characterId?: number; text: string };
type UpdateArgs = { noteId: BSON.ObjectId; text: string };
type DeleteArgs = { noteId: BSON.ObjectId };

function safeWrite(realm: Realm, fn: () => void) {
  if (realm.isInTransaction) {
    fn();
  } else {
    realm.write(fn);
  }
}

export function useNoteActions() {
  const realm = useRealm();

  const createNote = ({ characterId, text }: CreateArgs) => {
    safeWrite(realm, () => {
      const noteId = new BSON.ObjectId();

      realm.create(Note, {
        _id: noteId,
        text,
        status: 'pending',
        updatedAt: new Date(),
        characterId,
        remoteId: null,
      });

      realm.create(OutboxEntry, {
        _id: new BSON.ObjectId(),
        op: 'create' as const,
        noteLocalId: noteId,
        payload: JSON.stringify({ text, characterId }),
        attempt: 0,
        lastError: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  };

  const updateNote = ({ noteId, text }: UpdateArgs) => {
    safeWrite(realm, () => {
      const n = realm.objectForPrimaryKey(Note, noteId);
      if (!n) return;

      n.text = text;
      n.status = 'pending';
      n.updatedAt = new Date();

      realm.create(OutboxEntry, {
        _id: new BSON.ObjectId(),
        op: 'update' as const,
        noteLocalId: noteId,
        payload: JSON.stringify({ text }),
        attempt: 0,
        lastError: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  };

  const deleteNote = ({ noteId }: DeleteArgs) => {
    safeWrite(realm, () => {
      const n = realm.objectForPrimaryKey(Note, noteId);
      if (n) {
        realm.delete(n);
      }

      realm.create(OutboxEntry, {
        _id: new BSON.ObjectId(),
        op: 'delete' as const,
        noteLocalId: noteId,
        payload: JSON.stringify({}),
        attempt: 0,
        lastError: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  };

  return { createNote, updateNote, deleteNote };
}
