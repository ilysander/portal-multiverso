import { createRealmContext } from '@realm/react';
import { Note } from '@/entities/note/model/Note';
import { OutboxEntry } from '@/entities/note/model/Outbox';

export const { RealmProvider, useRealm, useQuery, useObject } = createRealmContext({
  schema: [Note, OutboxEntry],
  schemaVersion: 2,
});
