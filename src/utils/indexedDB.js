import { openDB } from 'idb';

const DB_NAME = 'FreshmanExamDB';
const STORE_NAME = 'scores';

export const initDB = async () =>
  openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('synced', 'synced');
      }
    },
  });

export const saveScoreOffline = async (score) => {
  const db = await initDB();
  await db.add(STORE_NAME, { ...score, synced: false });
};

export const getPendingScores = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const index = tx.store.index('synced');
  const scores = [];
  let cursor = await index.openCursor(IDBKeyRange.only(false));
  while (cursor) {
    scores.push(cursor.value);
    cursor = await cursor.continue();
  }
  return scores;
};

export const markScoreSynced = async (id) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const score = await store.get(id);
  if (score) {
    score.synced = true;
    await store.put(score);
  }
  await tx.done;
};
