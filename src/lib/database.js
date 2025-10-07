// src/lib/database.js
import { openDB } from 'idb';

const DB_NAME = 'FinanceControlDB';
const DB_VERSION = 1;
const USERS_STORE = 'users';

const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        const store = db.createObjectStore(USERS_STORE, { keyPath: 'email' });
        store.createIndex('email', 'email', { unique: true });
      }
    },
  });
};

export const addUser = async (user) => {
  const db = await initDB();
  return db.put(USERS_STORE, user);
};

export const getUser = async (email) => {
  const db = await initDB();
  return db.get(USERS_STORE, email);
};

export const getAllUsers = async () => {
  const db = await initDB();
  return db.getAll(USERS_STORE);
};