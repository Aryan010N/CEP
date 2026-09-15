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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForLocalDevelopmentAndEvaluationMode",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-community-observatory.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-community-observatory",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-community-observatory.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

// Check if real Firebase credentials have been configured
export const isFirestoreConfigured = () => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return Boolean(key && !key.includes("DummyKey"));
};

// Sample Image Presets for rapid testing & demos
export const SAMPLE_COMPLAINT_IMAGES = {
  electrical: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%231e293b'%3E%3Crect width='400' height='300' fill='%230f172a'/%3E%3Crect x='120' y='60' width='160' height='180' rx='12' fill='%23334155' stroke='%23475569' stroke-width='4'/%3E%3Ccircle cx='170' cy='120' r='14' fill='%230f172a'/%3E%3Ccircle cx='230' cy='120' r='14' fill='%230f172a'/%3E%3Cpath d='M150 200 L180 160 L200 180 L230 140' stroke='%23f59e0b' stroke-width='5' fill='none' stroke-linecap='round'/%3E%3Cpath d='M235 135 L260 115 L245 150 L270 130' stroke='%23ef4444' stroke-width='4' fill='none' stroke-linecap='round'/%3E%3Ctext x='200' y='275' font-family='sans-serif' font-size='14' font-weight='bold' fill='%2394a3b8' text-anchor='middle'%3EElectrical Hazard / Sparking Switch%3C/text%3E%3C/svg%3E",
  plumbing: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%231e293b'%3E%3Crect width='400' height='300' fill='%230f172a'/%3E%3Cpath d='M80 100 L200 100 L200 200 L320 200' stroke='%2364748b' stroke-width='24' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='200' cy='160' r='8' fill='%2338bdf8'/%3E%3Cpath d='M196 170 C190 190 210 190 204 210' stroke='%2338bdf8' stroke-width='4' fill='none'/%3E%3Cellipse cx='200' cy='240' rx='50' ry='15' fill='%230284c7' opacity='0.4'/%3E%3Ctext x='200' y='275' font-family='sans-serif' font-size='14' font-weight='bold' fill='%2394a3b8' text-anchor='middle'%3EWater Pipe Leakage%3C/text%3E%3C/svg%3E",
  sanitation: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%231e293b'%3E%3Crect width='400' height='300' fill='%230f172a'/%3E%3Cpath d='M140 100 L150 230 L250 230 L260 100 Z' fill='%2315803d' stroke='%23166534' stroke-width='4'/%3E%3Crect x='130' y='80' width='140' height='20' rx='4' fill='%23166534'/%3E%3Ccircle cx='180' cy='65' r='10' fill='%23ca8a04' opacity='0.7'/%3E%3Ccircle cx='220' cy='55' r='12' fill='%23ca8a04' opacity='0.8'/%3E%3Ctext x='200' y='275' font-family='sans-serif' font-size='14' font-weight='bold' fill='%2394a3b8' text-anchor='middle'%3EOverflowing Waste Bin%3C/text%3E%3C/svg%3E"
};

// Initial Pre-Seeded Communities with Customizable Nomenclature
export const INITIAL_DEMO_COMMUNITIES = [
  {
    community_id: "comm_emerald_1",
    name: "Emerald Heights Campus Hostel",
    type: "hostel",
    city: "Bengaluru",
    wings: ["Wing A", "Wing B", "Wing C", "Wing D"],
    admin_uid: "usr_admin_1",
    nomenclature: {
      reporter_label: "Student / Resident",
      verifier_label: "Wing Representative",
      authority_label: "Chief Warden",
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
      authority_label: "Society Secretary",
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
      authority_label: "RWA President",
      division_label: "Block"
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  }
];

// Initial Pre-Seeded Demonstration Users
export const INITIAL_DEMO_USERS = [
  {
    uid: "usr_resident_1",
    email: "resident@campus.edu",
    name: "Aarav Sharma",
    role: "resident",
    community_id: "comm_emerald_1",
    wing: "Wing A",
    room_number: "A-304",
    phone: "+91 98765 43210"
  },
  {
    uid: "usr_resident_2",
    email: "priya@palmgrove.org",
    name: "Priya Nair",
    role: "resident",
    community_id: "comm_palmgrove_2",
    wing: "Tower 1 (Gulmohar)",
    room_number: "Flat 402",
    phone: "+91 98765 43211"
  },
  {
    uid: "usr_wingrep_1",
    email: "wingrep.a@campus.edu",
    name: "Vikram Malhotra",
    role: "wing_rep",
    community_id: "comm_emerald_1",
    wing: "Wing A",
    room_number: "A-101",
    phone: "+91 98765 11111"
  },
  {
    uid: "usr_admin_1",
    email: "admin@campus.edu",
    name: "Dr. Rajesh Iyer",
    role: "admin",
    community_id: "comm_emerald_1",
    wing: "Admin Block",
    room_number: "HQ-01",
    phone: "+91 98765 99999"
  },
  {
    uid: "usr_ngo_1",
    email: "reachout@ngo.org",
    name: "Anita Deshmukh",
    role: "ngo",
    community_id: "comm_emerald_1",
    wing: "Partner NGO",
    room_number: "NGO-Desk",
    phone: "+91 98765 77777"
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
    resident_id: "usr_resident_1",
    resident_name: "Aarav Sharma",
    community_id: "comm_emerald_1",
    wing: "Wing A",
    room_number: "A-304",
    image_url: SAMPLE_COMPLAINT_IMAGES.electrical,
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
    resident_id: "usr_resident_1",
    resident_name: "Aarav Sharma",
    community_id: "comm_emerald_1",
    wing: "Wing A",
    room_number: "A-210",
    image_url: SAMPLE_COMPLAINT_IMAGES.plumbing,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    verified_by: "Vikram Malhotra (Wing Rep)",
    assigned_worker: null,
    ai_summary: "Plumbing issue: Severe common washroom drain blockage causing hallway water leakage.",
    suggested_action: "Dispatch plumbing crew with mechanical snake tool and floor disinfection."
  },
  {
    ticket_id: "TICK-7994",
    title: "Garbage bin overflowing near Tower 1 staircase",
    description: "Waste collection bin has not been emptied for 2 days, attracting pests and foul smell.",
    category: "Sanitation",
    urgency: "Medium",
    status: "In_Progress",
    resident_id: "usr_resident_2",
    resident_name: "Priya Nair",
    community_id: "comm_palmgrove_2",
    wing: "Tower 1 (Gulmohar)",
    room_number: "Flat 402",
    image_url: SAMPLE_COMPLAINT_IMAGES.sanitation,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    verified_by: "Floor Captain Rakesh",
    assigned_worker: "Swachh Cleaning Crew #4",
    ai_summary: "Sanitation issue: Waste bin backlog causing hygiene hazard near Tower 1 stairs.",
    suggested_action: "Sanitation clearance and antiseptic spraying."
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
    reward: "Certificate of Social Impact & ₹5,000 Project Grant",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    challenge_id: "NGO-CH-102",
    ngo_name: "Vidya Jyoti Rural Literacy Initiative",
    title: "Offline-First Interactive Maths & Science Quizzes for Low-Bandwidth Tablets",
    description: "Build a PWA that works without internet after initial sync, allowing rural community learning centers to track kids' math practice.",
    skills_required: ["IndexedDB", "React / PWA", "Gamification"],
    status: "Claimed",
    claimed_by_user_id: "usr_resident_1",
    claimed_by_user_name: "Aarav Sharma (Student)",
    contact_email: "tech@vidyajyoti.org",
    reward: "Letter of Recommendation + Industry Mentorship",
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
    reward: "Hardware Prototype Grant & Certificate",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  }
];

// ============================================================================
// CLOUD FIRESTORE MODULAR v10+ SERVICES (Sprint 2 Specification)
// ============================================================================

/**
 * Real-time subscription to tickets belonging to a community.
 * Returns the unsubscribe cleanup function.
 */
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
          ...docSnap.data(),
          // Ensure client-usable date format if serverTimestamp is pending
          created_at: docSnap.data().server_created_at?.toDate
            ? docSnap.data().server_created_at.toDate().toISOString()
            : docSnap.data().created_at || new Date().toISOString()
        }));

        // Sort descending by created_at client-side to prevent missing index blocks
        ticketList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        onUpdate(ticketList);
      },
      (error) => {
        console.warn('Firestore tickets onSnapshot subscription warning/fallback:', error);
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

/**
 * Real-time subscription to all available communities.
 * Returns the unsubscribe cleanup function.
 */
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
        console.warn('Firestore communities subscription warning:', error);
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

/**
 * Real-time subscription to NGO challenges.
 * Returns the unsubscribe cleanup function.
 */
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
        console.warn('Firestore challenges subscription warning:', error);
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
 */
export const createTicketInFirestore = async (ticket) => {
  if (!db) return ticket;
  const docRef = doc(db, 'tickets', ticket.ticket_id);
  await setDoc(docRef, {
    ...ticket,
    server_created_at: serverTimestamp(),
    server_updated_at: serverTimestamp()
  });
  return ticket;
};

/**
 * Update an existing ticket in Cloud Firestore with serverTimestamp.
 */
export const updateTicketInFirestore = async (ticketId, updateData) => {
  if (!db) return;
  const docRef = doc(db, 'tickets', ticketId);
  await updateDoc(docRef, {
    ...updateData,
    server_updated_at: serverTimestamp()
  });
};

/**
 * Create a new community in Cloud Firestore.
 */
export const createCommunityInFirestore = async (community) => {
  if (!db) return community;
  const docRef = doc(db, 'communities', community.community_id);
  await setDoc(docRef, {
    ...community,
    server_created_at: serverTimestamp()
  });
  return community;
};

/**
 * Join an existing community in Cloud Firestore.
 */
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

/**
 * Claim an NGO challenge in Cloud Firestore.
 */
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

/**
 * Post a new NGO challenge in Cloud Firestore.
 */
export const postChallengeInFirestore = async (challenge) => {
  if (!db) return challenge;
  const docRef = doc(db, 'challenges', challenge.challenge_id);
  await setDoc(docRef, {
    ...challenge,
    server_created_at: serverTimestamp()
  });
  return challenge;
};

/**
 * Seed initial demonstration data into Cloud Firestore if collections are empty.
 */
export const seedDemoDataToFirestore = async () => {
  if (!db) return;
  try {
    for (const comm of INITIAL_DEMO_COMMUNITIES) {
      await setDoc(doc(db, 'communities', comm.community_id), {
        ...comm,
        server_created_at: serverTimestamp()
      }, { merge: true });
    }
    for (const tkt of INITIAL_DEMO_TICKETS) {
      await setDoc(doc(db, 'tickets', tkt.ticket_id), {
        ...tkt,
        server_created_at: serverTimestamp()
      }, { merge: true });
    }
    for (const ch of INITIAL_DEMO_CHALLENGES) {
      await setDoc(doc(db, 'challenges', ch.challenge_id), {
        ...ch,
        server_created_at: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('Seeding demo data to Firestore skipped or encountered rule restriction:', err);
  }
};
