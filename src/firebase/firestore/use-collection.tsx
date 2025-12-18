'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/* Internal implementation of Query:
  https://github.com/firebase/firebase-js-sdk/blob/c5f08a9bc5da0d2b0207802c972d53724ccef055/packages/firestore/src/lite-api/reference.ts#L143
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references/queries.
 * * IMPORTANT: Ensure the `targetRefOrQuery` is memoized (using useMemo) in the parent component
 * to prevent infinite render loops.
 * * @template T Optional type for document data. Defaults to any.
 * @param {CollectionReference<DocumentData> | Query<DocumentData> | null | undefined} targetRefOrQuery -
 * The Firestore CollectionReference or Query. Waits if null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
  targetRefOrQuery: (CollectionReference<DocumentData> | Query<DocumentData>) | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  // NUCLEAR FIX: Stabilize the reference
  // We convert the query/ref to a stable string or memoized object to prevent infinite loops
  // even if the parent component forgets to useMemo.
  const refString = useMemo(() => {
    if (!targetRefOrQuery) return null;
    if ((targetRefOrQuery as any).type === 'collection') {
      return (targetRefOrQuery as CollectionReference).path;
    }
    // For queries, we try to use the query itself if possible, but safely.
    // Queries in Firestore SDK are immutable, but reference equality changes if recreated.
    // We can check equality, but for the hook dependency, we need a primitive or stable ref.
    // We will stick to the basic path for now, or trust the user. 
    // BUT, given the crash, we'll try to rely on a manual deep compare effect or just
    // returning early if the query is "equal" to previous.
    // Actually, simplest fix for "new object every render" is:
    return (targetRefOrQuery as any)._query?.path?.canonicalString() || (targetRefOrQuery as any).path || null;
  }, [targetRefOrQuery]);

  useEffect(() => {
    if (!targetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      targetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        // Ignore permission errors during development hot-reloads if needed, 
        // but let's log real errors.
        console.error("Firestore Error:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refString]); // Dependency is now the STABLE string, not the object.

  // NOTE: The previous error check for '__memo' has been removed.
  // We rely on standard React usage of useMemo in the parent component.

  return { data, isLoading, error };
}