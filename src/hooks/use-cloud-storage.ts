
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import type { AppData } from '@/lib/types';
import { debounce } from 'lodash';

// A simple deep equality check for objects.
// This is to prevent unnecessary writes to Firestore if the data hasn't changed.
function deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    for (const key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }
    return true;
}

export function useCloudStorage(initialValue: AppData): [AppData, (value: AppData | ((val: AppData) => AppData)) => void] {
  const { currentUser, needsOnboarding } = useAuth();
  const [data, setData] = useState<AppData>(initialValue);

  const docRef = currentUser ? doc(db, "users", currentUser.uid) : null;

  // This ref holds the debounced function to write to Firestore.
  const debouncedWriteRef = useRef(
    debounce((docRef, dataToWrite) => {
        getDoc(docRef).then(docSnap => {
            // Only write if the data is actually different to avoid triggering unnecessary snapshot listeners.
            if (!docSnap.exists() || !deepEqual(docSnap.data(), dataToWrite)) {
                 setDoc(docRef, dataToWrite, { merge: true }).catch(error => {
                    console.error("Error syncing to Firestore:", error);
                 });
            }
        });
    }, 1000) // Debounce for 1 second
  ).current;

  useEffect(() => {
    if (!currentUser || !docRef || needsOnboarding) return;

    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const cloudData = doc.data() as AppData;
        // Simple merge: cloud data is the source of truth.
        setData(prevLocalData => {
            const mergedData = {
              ...initialValue,
              ...cloudData,
            };
            // Prevent re-render if data is the same
            if (deepEqual(prevLocalData, mergedData)) {
                return prevLocalData;
            }
            return mergedData;
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser, docRef, needsOnboarding, initialValue]);


  const setAndSyncValue = useCallback((value: AppData | ((val: AppData) => AppData)) => {
    // We update the local state immediately for a responsive UI.
    const valueToStore = value instanceof Function ? value(data) : value;
    setData(valueToStore);

    if (docRef) {
        // We debounce the write to Firestore to prevent too many writes in a short period.
        debouncedWriteRef(docRef, valueToStore);
    }
  }, [data, docRef, debouncedWriteRef]);
  
  // Install lodash and its types for debounce
  // You'll need to run: npm install lodash @types/lodash
  useEffect(() => {
    return () => {
        debouncedWriteRef.cancel();
    }
  }, [debouncedWriteRef]);

  return [data, setAndSyncValue];
}
