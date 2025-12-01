/**
 * Client-Side Session Storage
 * Manages workout sessions in browser's IndexedDB for offline support
 */

interface RepData {
  rep_number: number;
  metrics: any;
  quality: string;
  timestamp: number;
}

interface WorkoutSession {
  session_id: string;
  user_id?: string;
  exercise_id: string;
  plan: {
    sets?: number;
    reps_per_set?: number;
    target_weight?: number;
    rest_seconds?: number;
  };
  created_at: number;
  completed_at?: number;
  reps: RepData[];
  total_reps: number;
  completed_sets: number;
  status: 'active' | 'completed';
}

const DB_NAME = 'PersonalTrainerDB';
const DB_VERSION = 1;
const SESSIONS_STORE = 'sessions';

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create sessions store if it doesn't exist
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        const store = db.createObjectStore(SESSIONS_STORE, { keyPath: 'session_id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('created_at', 'created_at', { unique: false });
      }
    };
  });
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new workout session
 */
export async function createSession(
  exerciseId: string,
  plan: any,
  userId?: string
): Promise<WorkoutSession> {
  const db = await initDB();
  
  const session: WorkoutSession = {
    session_id: generateSessionId(),
    user_id: userId,
    exercise_id: exerciseId,
    plan: plan || {},
    created_at: Date.now(),
    reps: [],
    total_reps: 0,
    completed_sets: 0,
    status: 'active'
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSIONS_STORE], 'readwrite');
    const store = transaction.objectStore(SESSIONS_STORE);
    const request = store.add(session);

    request.onsuccess = () => resolve(session);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get a session by ID
 */
export async function getSession(sessionId: string): Promise<WorkoutSession | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSIONS_STORE], 'readonly');
    const store = transaction.objectStore(SESSIONS_STORE);
    const request = store.get(sessionId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Log a rep to a session
 */
export async function logRep(
  sessionId: string,
  metrics: any,
  quality: string
): Promise<WorkoutSession> {
  const db = await initDB();
  const session = await getSession(sessionId);

  if (!session) {
    throw new Error('Session not found');
  }

  const repData: RepData = {
    rep_number: session.total_reps + 1,
    metrics,
    quality,
    timestamp: Date.now()
  };

  session.reps.push(repData);
  session.total_reps += 1;

  // Check if set is complete
  const repsPerSet = session.plan.reps_per_set || 0;
  if (repsPerSet > 0 && session.total_reps % repsPerSet === 0) {
    session.completed_sets += 1;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSIONS_STORE], 'readwrite');
    const store = transaction.objectStore(SESSIONS_STORE);
    const request = store.put(session);

    request.onsuccess = () => resolve(session);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Complete a session
 */
export async function completeSession(sessionId: string): Promise<{
  session: WorkoutSession;
  summary: any;
}> {
  const db = await initDB();
  const session = await getSession(sessionId);

  if (!session) {
    throw new Error('Session not found');
  }

  session.status = 'completed';
  session.completed_at = Date.now();

  // Calculate summary statistics
  const duration = session.completed_at - session.created_at;
  
  const qualityCounts: { [key: string]: number } = {};
  for (const rep of session.reps) {
    qualityCounts[rep.quality] = (qualityCounts[rep.quality] || 0) + 1;
  }

  const summary = {
    session_id: session.session_id,
    exercise_id: session.exercise_id,
    total_reps: session.total_reps,
    completed_sets: session.completed_sets,
    duration,
    quality_breakdown: qualityCounts,
    created_at: session.created_at,
    completed_at: session.completed_at
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSIONS_STORE], 'readwrite');
    const store = transaction.objectStore(SESSIONS_STORE);
    const request = store.put(session);

    request.onsuccess = () => resolve({ session, summary });
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all sessions
 */
export async function getAllSessions(): Promise<WorkoutSession[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSIONS_STORE], 'readonly');
    const store = transaction.objectStore(SESSIONS_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get active sessions
 */
export async function getActiveSessions(): Promise<WorkoutSession[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSIONS_STORE], 'readonly');
    const store = transaction.objectStore(SESSIONS_STORE);
    const index = store.index('status');
    const request = index.getAll('active');

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSIONS_STORE], 'readwrite');
    const store = transaction.objectStore(SESSIONS_STORE);
    const request = store.delete(sessionId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clean up old completed sessions (older than 30 days)
 */
export async function cleanupOldSessions(): Promise<void> {
  const db = await initDB();
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SESSIONS_STORE], 'readwrite');
    const store = transaction.objectStore(SESSIONS_STORE);
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const session: WorkoutSession = cursor.value;
        if (session.status === 'completed' && session.created_at < thirtyDaysAgo) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        resolve();
      }
    };

    request.onerror = () => reject(request.error);
  });
}
