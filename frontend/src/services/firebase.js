import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';

// Firebase configuration from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyADaXMoJOErpXHThu4ZSx4SKy1eXvCmm34",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cep-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cep-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cep-ai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "920330565851",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:920330565851:web:c0b0c03c098eff4e8b74fe",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XGHD2EM7JE"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

export class DuplicateTicketError extends Error {
  constructor(duplicateOf, reason) {
    super(reason || "A similar complaint already exists.");
    this.name = "DuplicateTicketError";
    this.duplicateOf = duplicateOf;
    this.reason = reason;
  }
}

// Check if real Firebase credentials have been configured
export const isFirestoreConfigured = () => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return Boolean(key && !key.includes("DummyKey"));
};

// Reliable backend URL helper
export const getBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_BACKEND_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://cep-wacs.onrender.com';
  }
  return envUrl || 'http://localhost:8000';
};

// Sample Image Presets for rapid testing & defect demonstration
export const SAMPLE_COMPLAINT_IMAGES = {
  electrical: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%231e293b'%3E%3Crect width='400' height='300' fill='%230f172a'/%3E%3Crect x='120' y='60' width='160' height='180' rx='12' fill='%23334155' stroke='%23475569' stroke-width='4'/%3E%3Ccircle cx='170' cy='120' r='14' fill='%230f172a'/%3E%3Ccircle cx='230' cy='120' r='14' fill='%230f172a'/%3E%3Cpath d='M150 200 L180 160 L200 180 L230 140' stroke='%23f59e0b' stroke-width='5' fill='none' stroke-linecap='round'/%3E%3Cpath d='M235 135 L260 115 L245 150 L270 130' stroke='%23ef4444' stroke-width='4' fill='none' stroke-linecap='round'/%3E%3Ctext x='200' y='275' font-family='sans-serif' font-size='14' font-weight='bold' fill='%2394a3b8' text-anchor='middle'%3EElectrical Hazard / Sparking Switch%3C/text%3E%3C/svg%3E",
  plumbing: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%231e293b'%3E%3Crect width='400' height='300' fill='%230f172a'/%3E%3Cpath d='M80 100 L200 100 L200 200 L320 200' stroke='%2364748b' stroke-width='24' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='200' cy='160' r='8' fill='%2338bdf8'/%3E%3Cpath d='M196 170 C190 190 210 190 204 210' stroke='%2338bdf8' stroke-width='4' fill='none'/%3E%3Cellipse cx='200' cy='240' rx='50' ry='15' fill='%230284c7' opacity='0.4'/%3E%3Ctext x='200' y='275' font-family='sans-serif' font-size='14' font-weight='bold' fill='%2394a3b8' text-anchor='middle'%3EWater Pipe Leakage%3C/text%3E%3C/svg%3E",
  sanitation: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%231e293b'%3E%3Crect width='400' height='300' fill='%230f172a'/%3E%3Cpath d='M140 100 L150 230 L250 230 L260 100 Z' fill='%2315803d' stroke='%23166534' stroke-width='4'/%3E%3Crect x='130' y='80' width='140' height='20' rx='4' fill='%23166534'/%3E%3Ccircle cx='180' cy='65' r='10' fill='%23ca8a04' opacity='0.7'/%3E%3Ccircle cx='220' cy='55' r='12' fill='%23ca8a04' opacity='0.8'/%3E%3Ctext x='200' y='275' font-family='sans-serif' font-size='14' font-weight='bold' fill='%2394a3b8' text-anchor='middle'%3EOverflowing Waste Bin%3C/text%3E%3C/svg%3E"
};

// Pre-Configured Baseline Communities with Dynamic Nomenclature
export const INITIAL_DEMO_COMMUNITIES = [
  {
    community_id: "comm_emerald_1",
    name: "Emerald Heights Campus Hostel",
    type: "hostel",
    city: "Bengaluru",
    wings: ["Wing A", "Wing B", "Wing C", "Wing D"],
    admin_uid: "R1htdZe8E1ThIpfFHiHO63bnEx72",
    nomenclature: {
      reporter_label: "Student / Resident",
      verifier_label: "Wing Representative",
      authority_label: "Estate Admin",
      division_label: "Wing"
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
  },
  {
    community_id: "comm_palmgrove_2",
    name: "Palm Grove Co-operative Housing Society",
    type: "housing_society",
    city: "Pune",
    wings: ["Tower 1 (Gulmohar)", "Tower 2 (Amaltas)", "Tower 3 (Jacaranda)"],
    admin_uid: "usr_admin_2",
    nomenclature: {
      reporter_label: "Resident / Flat Owner",
      verifier_label: "Floor Captain",
      authority_label: "Estate Admin",
      division_label: "Tower"
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
  },
  {
    community_id: "comm_greenwoods_3",
    name: "Greenwoods Valley RWA Enclave",
    type: "rwa_colony",
    city: "Gurugram",
    wings: ["Block North", "Block South", "Central Avenue"],
    admin_uid: "usr_admin_3",
    nomenclature: {
      reporter_label: "Homeowner",
      verifier_label: "Block Coordinator",
      authority_label: "Estate Admin",
      division_label: "Block"
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  }
];

export const INITIAL_DEMO_TICKETS = [
  {
    ticket_id: "TICK-8021",
    title: "Main corridor ceiling fan making spark sounds & flickering light",
    description: "The ceiling fan outside room A-304 creates electrical sparks when switched to speed 4 and the hallway tube light flickers violently.",
    category: "Electrical",
    urgency: "High",
    status: "Submitted",
    resident_id: "1CQhM7DORNOAtMynLCFbtSti5rl2",
    resident_name: "Aarav Resident",
    community_id: "comm_emerald_1",
    wing: "Wing A",
    room_number: "A-304",
    image_url: SAMPLE_COMPLAINT_IMAGES.electrical,
    upvotes: 4,
    upvoted_by: ["1CQhM7DORNOAtMynLCFbtSti5rl2", "xRvnXdGIsmQfpYcXgdqdyHv0KKj2"],
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    verified_by: null,
    assigned_worker: null,
    ai_summary: "Electrical hazard: High voltage sparking in corridor fan switchboard outside A-304.",
    suggested_action: "Dispatch emergency electrician to isolate breaker and replace capacitor/wiring."
  },
  {
    ticket_id: "TICK-8019",
    title: "Water overflow in common washroom drain pipe",
    description: "The primary drainage pipe on the 2nd floor bathroom is heavily clogged and dirty water is leaking onto the hallway tiles.",
    category: "Plumbing",
    urgency: "High",
    status: "Verified_By_Rep",
    resident_id: "1CQhM7DORNOAtMynLCFbtSti5rl2",
    resident_name: "Aarav Resident",
    community_id: "comm_emerald_1",
    wing: "Wing A",
    room_number: "A-210",
    image_url: SAMPLE_COMPLAINT_IMAGES.plumbing,
    upvotes: 7,
    upvoted_by: ["1CQhM7DORNOAtMynLCFbtSti5rl2"],
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    verified_by: "Vikram Rep (Wing Representative)",
    assigned_worker: null,
    ai_summary: "Plumbing issue: Severe common washroom drain blockage causing hallway water leakage.",
    suggested_action: "Dispatch plumbing crew with mechanical snake tool and floor disinfection."
  }
];

export const INITIAL_DEMO_CHALLENGES = [
  {
    challenge_id: "NGO-CH-101",
    ngo_name: "CleanCity & EcoGreen NGO",
    title: "AI Image Model for Segregated Waste Auditing in Hostel Messes",
    description: "We need a lightweight mobile web tool that hostel mess staff or student volunteers can use to photograph food waste bins and automatically assess wet vs dry waste contamination percentage.",
    skills_required: ["React", "Python / FastAI", "Computer Vision", "UI/UX"],
    status: "Open",
    claimed_by_user_id: null,
    claimed_by_user_name: null,
    contact_email: "contact@ecogreen.ngo",
    reward: "Certificate of Social Impact & 200 CEP Credits",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    challenge_id: "NGO-CH-102",
    ngo_name: "Vidya Jyoti Rural Literacy Initiative",
    title: "Offline-First Interactive Maths & Science Quizzes for Low-Bandwidth Tablets",
    description: "Build a PWA that works without internet after initial sync, allowing rural community learning centers to track kids' math practice.",
    skills_required: ["IndexedDB", "React / PWA", "Gamification"],
    status: "Claimed",
    claimed_by_user_id: "1CQhM7DORNOAtMynLCFbtSti5rl2",
    claimed_by_user_name: "Aarav Resident (Student)",
    contact_email: "tech@vidyajyoti.org",
    reward: "Letter of Recommendation + 350 CEP Credits",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  {
    challenge_id: "NGO-CH-103",
    ngo_name: "Jal Rakshak Foundation",
    title: "IoT Water Tank Level Telemetry Dashboard & SMS Alert Bot",
    description: "Design a dashboard integrating ESP32 ultrasonic water level sensors with automated SMS alerts to prevent overhead community tank dry-runs.",
    skills_required: ["IoT / MQTT", "Node.js or FastAPI", "Twilio / SMS"],
    status: "Open",
    claimed_by_user_id: null,
    claimed_by_user_name: null,
    contact_email: "alerts@jalrakshak.org",
    reward: "Hardware Prototype Grant & 500 CEP Credits",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  }
];

// ============================================================================
// REAL-TIME CLOUD FIRESTORE MODULAR v10+ SERVICES (PRODUCTION ONLY)
// ============================================================================

export const subscribeTickets = (communityId, onUpdate, onError) => {
  if (!db || !communityId) {
    return () => {};
  }

  try {
    const q = query(
      collection(db, 'tickets'),
      where('community_id', '==', communityId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ticketList = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ticket_id: docSnap.id,
          ...docSnap.data(),
          created_at: docSnap.data().server_created_at?.toDate
            ? docSnap.data().server_created_at.toDate().toISOString()
            : docSnap.data().created_at || new Date().toISOString()
        }));

        ticketList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        onUpdate(ticketList);
      },
      (error) => {
        console.warn('Firestore tickets subscription notice:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach Firestore ticket subscriber:', err);
    if (onError) onError(err);
    return () => {};
  }
};

export const subscribeCommunities = (onUpdate, onError) => {
  if (!db) return () => {};

  try {
    const q = collection(db, 'communities');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            community_id: docSnap.id,
            ...docSnap.data()
          }));
          onUpdate(list);
        }
      },
      (error) => {
        console.warn('Firestore communities subscription notice:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe communities:', err);
    if (onError) onError(err);
    return () => {};
  }
};

export const subscribeChallenges = (onUpdate, onError) => {
  if (!db) return () => {};

  try {
    const q = collection(db, 'challenges');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            challenge_id: docSnap.id,
            ...docSnap.data()
          }));
          onUpdate(list);
        }
      },
      (error) => {
        console.warn('Firestore challenges subscription notice:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe challenges:', err);
    if (onError) onError(err);
    return () => {};
  }
};

/**
 * Persist a new ticket into Cloud Firestore using modular v10+ setDoc with serverTimestamp.
 * Enforces a strict blocking AI deduplication gate against active community tickets.
 */
export const createTicketInFirestore = async (ticket, existingComplaints = []) => {
  if (!db) return ticket;

  const backendUrl = getBackendUrl();
  try {
    const formattedExisting = (existingComplaints || []).map(t => ({
      ticket_id: t.ticket_id || t.id || 'TICK-PREV',
      text: `${t.title || ''}. ${t.description || ''}`
    }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const dedupResponse = await fetch(`${backendUrl}/api/tickets/deduplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        new_complaint: `${ticket.title}. ${ticket.description}`,
        existing_complaints: formattedExisting
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (dedupResponse.ok) {
      const dedupResult = await dedupResponse.json();
      if (dedupResult.is_duplicate) {
        throw new DuplicateTicketError(dedupResult.matched_ticket_id, dedupResult.reasoning);
      }
    }
  } catch (error) {
    if (error instanceof DuplicateTicketError) {
      throw error;
    }
    console.warn("Deduplication check passed with client fallback:", error?.message);
  }

  const docRef = doc(db, 'tickets', ticket.ticket_id);
  await setDoc(docRef, {
    ...ticket,
    isDuplicate: false,
    upvotes: ticket.upvotes || 0,
    upvoted_by: ticket.upvoted_by || [],
    server_created_at: serverTimestamp(),
    server_updated_at: serverTimestamp()
  });
  return ticket;
};

export const updateTicketInFirestore = async (ticketId, updateData) => {
  if (!db) return;
  const docRef = doc(db, 'tickets', ticketId);
  await updateDoc(docRef, {
    ...updateData,
    server_updated_at: serverTimestamp()
  });
};

export const upvoteTicketInFirestore = async (ticketId, userId) => {
  if (!db || !ticketId) return;
  const docRef = doc(db, 'tickets', ticketId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const upvotedBy = data.upvoted_by || [];
    if (!upvotedBy.includes(userId)) {
      await updateDoc(docRef, {
        upvotes: (data.upvotes || 0) + 1,
        upvoted_by: [...upvotedBy, userId],
        server_updated_at: serverTimestamp()
      });
    }
  }
};

export const createCommunityInFirestore = async (community) => {
  if (!db) return community;
  const docRef = doc(db, 'communities', community.community_id);
  await setDoc(docRef, {
    ...community,
    server_created_at: serverTimestamp()
  });
  return community;
};

export const joinCommunityInFirestore = async (communityId, member) => {
  if (!db) return;
  const docRef = doc(db, 'communities', communityId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const currentMembers = docSnap.data().members || [];
    await updateDoc(docRef, {
      members: [...currentMembers, member],
      server_updated_at: serverTimestamp()
    });
  }
};

export const claimChallengeInFirestore = async (challengeId, studentUserId, studentName) => {
  if (!db) return;
  const docRef = doc(db, 'challenges', challengeId);
  await updateDoc(docRef, {
    status: 'Claimed',
    claimed_by_user_id: studentUserId,
    claimed_by_user_name: studentName,
    claimed_at: new Date().toISOString(),
    server_updated_at: serverTimestamp()
  });
};

export const postChallengeInFirestore = async (challenge) => {
  if (!db) return challenge;
  const docRef = doc(db, 'challenges', challenge.challenge_id);
  await setDoc(docRef, {
    ...challenge,
    server_created_at: serverTimestamp()
  });
  return challenge;
};
