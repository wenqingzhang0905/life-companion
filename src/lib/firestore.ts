import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { JournalEntry, Streak } from "./types";

const ENTRIES_COLLECTION = "journal_entries";
const STREAKS_COLLECTION = "streaks";

// Journal Entries
export async function addEntry(entry: JournalEntry): Promise<string> {
  const docRef = await addDoc(collection(db, ENTRIES_COLLECTION), entry);
  return docRef.id;
}

export async function getEntries(limit?: number): Promise<JournalEntry[]> {
  const q = query(collection(db, ENTRIES_COLLECTION), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  const entries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as JournalEntry));
  return limit ? entries.slice(0, limit) : entries;
}

export async function getEntriesByDateRange(start: string, end: string): Promise<JournalEntry[]> {
  const q = query(
    collection(db, ENTRIES_COLLECTION),
    where("date", ">=", start),
    where("date", "<=", end),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as JournalEntry));
}

export async function getEntryByDate(date: string): Promise<JournalEntry | null> {
  const q = query(collection(db, ENTRIES_COLLECTION), where("date", "==", date));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as JournalEntry;
}

export async function updateEntry(id: string, data: Partial<JournalEntry>): Promise<void> {
  await updateDoc(doc(db, ENTRIES_COLLECTION, id), data);
}

export async function deleteEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, ENTRIES_COLLECTION, id));
}

// Streaks
export async function addStreak(streak: Streak): Promise<string> {
  const docRef = await addDoc(collection(db, STREAKS_COLLECTION), streak);
  return docRef.id;
}

export async function getStreaks(): Promise<Streak[]> {
  const q = query(collection(db, STREAKS_COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Streak));
}

export async function updateStreak(id: string, data: Partial<Streak>): Promise<void> {
  await updateDoc(doc(db, STREAKS_COLLECTION, id), data);
}

export async function deleteStreak(id: string): Promise<void> {
  await deleteDoc(doc(db, STREAKS_COLLECTION, id));
}
