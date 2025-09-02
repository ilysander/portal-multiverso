import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { useRealm, useQuery } from '@/app/realm';
import { OutboxEntry } from '@/entities/note/model/Outbox';
import { Note } from '@/entities/note/model/Note';

const BASE = 'https://jsonplaceholder.typicode.com';
const MAX_ATTEMPTS = 5;

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

function isRealJsonPlaceholderId(id?: number | null): boolean {
  return typeof id === 'number' && id >= 1 && id <= 100;
}

export function useOutboxSync() {
  const realm = useRealm();
  const outbox = useQuery(OutboxEntry).sorted('createdAt');
  const isRunningRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const processQueue = async () => {
      if (!mounted || isRunningRef.current) return;
      isRunningRef.current = true;

      try {
        const batch = Array.from(outbox);

        for (const entry of batch) {
          if (!mounted) return;

          const current = realm.objectForPrimaryKey(OutboxEntry, entry._id);
          if (!current) continue;

          let payload: any = {};
          try {
            payload = current.payload ? JSON.parse(current.payload) : {};
          } catch {
            payload = {};
          }

          const note = realm.objectForPrimaryKey(Note, current.noteLocalId);
          let ok = false;
          let nextRemoteId: number | undefined;

          try {
            if (current.op === 'create') {
              const resp = await fetch(`${BASE}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: 'note',
                  body: payload?.text ?? note?.text ?? '',
                  userId: payload?.characterId ?? note?.characterId ?? 0,
                }),
              });
              ok = resp.ok;
              if (ok) {
                const data = await resp.json();
                nextRemoteId = Number(data?.id) || undefined;
              }
            } else if (current.op === 'update') {
              const rid = note?.remoteId ?? null;
              const canTargetReal = isRealJsonPlaceholderId(rid);
              const url = canTargetReal ? `${BASE}/posts/${rid}` : `${BASE}/posts/1`;
              const resp = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: 'note',
                  body: payload?.text ?? note?.text ?? '',
                  userId: note?.characterId ?? 0,
                }),
              });
              ok = resp.ok;
            } else if (current.op === 'delete') {
              if (!note) {
                ok = true;
              } else {
                const rid = note.remoteId ?? null;
                const canTargetReal = isRealJsonPlaceholderId(rid);
                const url = canTargetReal ? `${BASE}/posts/${rid}` : `${BASE}/posts/1`;
                const resp = await fetch(url, { method: 'DELETE' });
                ok = resp.ok;
              }
            }
          } catch {
            ok = false;
          }

          realm.write(() => {
            const e = realm.objectForPrimaryKey(OutboxEntry, current._id);
            if (!e) return;

            if (ok) {
              if (current.op === 'create' || current.op === 'update') {
                const n = realm.objectForPrimaryKey(Note, current.noteLocalId);
                if (n) {
                  if (nextRemoteId && !n.remoteId) n.remoteId = nextRemoteId;
                  n.status = 'synced';
                  n.updatedAt = new Date();
                }
              }
              realm.delete(e);
            } else {
              e.attempt += 1;
              e.updatedAt = new Date();
              if (e.attempt >= MAX_ATTEMPTS) {
                e.lastError = 'max_attempts_reached';
              }
            }
          });

          if (!ok) {
            const delay = Math.min(current.attempt * 1000, 5000);
            await sleep(delay);
          }
        }
      } finally {
        isRunningRef.current = false;
      }
    };

    const outboxListener = () => {
      processQueue();
    };
    outbox.addListener(outboxListener);

    const netSub = NetInfo.addEventListener(() => {
      processQueue();
    });
    // processQueue();

    return () => {
      mounted = false;
      try {
        outbox.removeListener(outboxListener);
      } catch {}
      netSub();
    };
  }, [realm, outbox]);
}
