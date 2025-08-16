
"use client";

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import type { AppData } from '@/lib/types';

export function useCloudStorage(initialValue: AppData): [AppData, (value: AppData | ((val: AppData) => AppData)) => void] {
  const { currentUser } = useAuth();
  const [data, setData] = useState<AppData>(initialValue);

  const docRef = currentUser ? doc(db, "users", currentUser.uid) : null;

  useEffect(() => {
    if (!docRef) return;

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const cloudData = doc.data() as AppData;
        // A simple merge strategy: prefer cloud data, but keep local if cloud is missing fields.
        setData(prevLocalData => ({
          ...initialValue, // Start with defaults
          ...prevLocalData, // Overlay with whatever is in local state
          ...cloudData, // Overlay with cloud data
        }));
      } else {
        // No data in cloud yet, maybe push local data up?
        // For now, we'll just use the local/initial state.
        setDoc(docRef, initialValue); // First time sync
      }
    });

    return () => unsubscribe();
  }, [currentUser, docRef, initialValue]);


  const setAndSyncValue = useCallback((value: AppData | ((val: AppData) => AppData)) => {
    const valueToStore = value instanceof Function ? value(data) : value;
    setData(valueToStore);

    if (docRef) {
      setDoc(docRef, valueToStore, { merge: true }).catch(error => {
        console.error("Error syncing to Firestore:", error);
      });
    }
  }, [data, docRef]);

  return [data, setAndSyncValue];
}
