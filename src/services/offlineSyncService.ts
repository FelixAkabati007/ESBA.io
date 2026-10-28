// ======================================================================================
// E-SBA Ghana — Offline PWA Caching & Score Synchronization Service
// Implements optimistic concurrency locking, local storage queuing, and conflict detection
// ======================================================================================

import { AssessmentScoreRecord } from "../types";

const OFFLINE_QUEUE_KEY = "ESBA_OFFLINE_SCORE_QUEUE";
const ROSTER_CACHE_KEY_PREFIX = "ESBA_CACHED_ROSTER::";

export interface PendingOfflineScore {
  id: string;
  record: AssessmentScoreRecord;
  clientTimestamp: number;
  expectedVersion: number;
}

export interface SyncConflict {
  studentId: string;
  subjectId: string;
  localVersion: number;
  serverVersion: number;
  localScore: number;
  serverScore: number;
}

export const offlineSyncService = {
  /**
   * Check if client browser is currently online
   */
  isOnline(): boolean {
    return typeof navigator !== "undefined" && typeof navigator.onLine === "boolean"
      ? navigator.onLine
      : true;
  },

  /**
   * Safe localStorage check
   */
  hasStorage(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined" && typeof window.localStorage.setItem === "function";
  },

  /**
   * Cache class roster locally for offline access
   */
  cacheRoster(classId: string, subjectId: string, data: any[]): void {
    if (!this.hasStorage()) return;
    try {
      window.localStorage.setItem(
        `${ROSTER_CACHE_KEY_PREFIX}${classId}::${subjectId}`,
        JSON.stringify({
          cachedAt: Date.now(),
          data,
        })
      );
    } catch {
      // ignore in environments with restricted quota
    }
  },

  /**
   * Get cached roster for offline score entry
   */
  getCachedRoster(classId: string, subjectId: string): any[] | null {
    if (!this.hasStorage()) return null;
    try {
      const raw = window.localStorage.getItem(`${ROSTER_CACHE_KEY_PREFIX}${classId}::${subjectId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Queue score record for background sync when offline
   */
  enqueueScoreUpdate(record: AssessmentScoreRecord): void {
    if (!this.hasStorage()) return;
    try {
      const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue: PendingOfflineScore[] = raw ? JSON.parse(raw) : [];

      // Replace or append
      const existingIdx = queue.findIndex(
        (q) =>
          q.record.studentId === record.studentId &&
          q.record.subjectId === record.subjectId
      );

      const item: PendingOfflineScore = {
        id: `${record.studentId}_${record.subjectId}`,
        record,
        clientTimestamp: Date.now(),
        expectedVersion: record.version,
      };

      if (existingIdx >= 0) {
        queue[existingIdx] = item;
      } else {
        queue.push(item);
      }

      window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch {
      // ignore
    }
  },

  /**
   * Get pending sync items count
   */
  getPendingCount(): number {
    if (!this.hasStorage()) return 0;
    try {
      const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!raw) return 0;
      const queue: PendingOfflineScore[] = JSON.parse(raw);
      return queue.length;
    } catch {
      return 0;
    }
  },

  /**
   * Clear sync queue
   */
  clearQueue(): void {
    if (!this.hasStorage()) return;
    try {
      window.localStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch {
      // ignore
    }
  },

  /**
   * Process synchronization against server state with optimistic concurrency check
   */
  syncPendingScores(
    serverScores: AssessmentScoreRecord[]
  ): {
    syncedCount: number;
    conflicts: SyncConflict[];
    updatedServerScores: AssessmentScoreRecord[];
  } {
    if (!this.hasStorage()) {
      return { syncedCount: 0, conflicts: [], updatedServerScores: serverScores };
    }
    try {
      const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!raw) {
        return { syncedCount: 0, conflicts: [], updatedServerScores: serverScores };
      }

      const queue: PendingOfflineScore[] = JSON.parse(raw);
      const conflicts: SyncConflict[] = [];
      const updated = [...serverScores];
      let syncedCount = 0;

      for (const item of queue) {
        const existingIdx = updated.findIndex(
          (s) =>
            s.studentId === item.record.studentId &&
            s.subjectId === item.record.subjectId
        );

        if (existingIdx >= 0) {
          const currentServerRecord = updated[existingIdx];
          // Check optimistic concurrency: if server version was incremented by another session
          if (currentServerRecord.version > item.expectedVersion) {
            conflicts.push({
              studentId: item.record.studentId,
              subjectId: item.record.subjectId,
              localVersion: item.expectedVersion,
              serverVersion: currentServerRecord.version,
              localScore: item.record.finalTotal,
              serverScore: currentServerRecord.finalTotal,
            });
            continue;
          }

          // Merge clean update
          updated[existingIdx] = {
            ...item.record,
            version: currentServerRecord.version + 1,
            updatedAt: new Date().toISOString(),
          };
          syncedCount++;
        } else {
          // New record
          updated.push({
            ...item.record,
            version: 1,
            updatedAt: new Date().toISOString(),
          });
          syncedCount++;
        }
      }

      // If no unresolved conflicts, clear queue
      if (conflicts.length === 0) {
        localStorage.removeItem(OFFLINE_QUEUE_KEY);
      }

      return {
        syncedCount,
        conflicts,
        updatedServerScores: updated,
      };
    } catch (e) {
      console.error("Sync error:", e);
      return { syncedCount: 0, conflicts: [], updatedServerScores: serverScores };
    }
  },
};
