/**
 * useDatabase - Database access hook
 * Thin wrapper around Expo's useSQLiteContext for consistency
 */

import { useSQLiteContext } from "expo-sqlite";

/**
 * Hook to access the database instance
 * Uses Expo's SQLiteProvider context under the hood
 */
export function useDatabase() {
  const db = useSQLiteContext();
  return db;
}
