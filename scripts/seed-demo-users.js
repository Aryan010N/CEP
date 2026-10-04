const admin = require('firebase-admin');

// Ensure you have FIREBASE_SERVICE_ACCOUNT_JSON env var or path set
// Usage: node scripts/seed-demo-users.js
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '../backend/serviceAccount.json';

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (err) {
  console.error("Failed to load service account key. Ensure FIREBASE_SERVICE_ACCOUNT_JSON is set or the file exists.");
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

const demoUsers = [
  {
    email: 'aarav@cep.demo',
    password: 'CepDemo2024!',
    displayName: 'Aarav Resident',
    role: 'resident',
    wing: 'A',
    communityId: 'demo-community'
  },
  {
    email: 'vikram@cep.demo',
    password: 'CepDemo2024!',
    displayName: 'Vikram Rep',
    role: 'wing_rep',
    wing: 'A',
    communityId: 'demo-community'
  },
  {
    email: 'rajesh@cep.demo',
    password: 'CepDemo2024!',
    displayName: 'Rajesh Admin',
    role: 'admin',
    wing: null,
    communityId: 'demo-community'
  },
  {
    email: 'anita@cep.demo',
    password: 'CepDemo2024!',
    displayName: 'Anita NGO',
    role: 'ngo',
    wing: null,
    communityId: 'demo-community'
  }
];

async function seedUsers() {
  console.log("Starting demo user seeding...");
  
  for (const user of demoUsers) {
    try {
      // Create user in Auth
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(user.email);
        console.log(`User ${user.email} already exists in Auth, updating password...`);
        await auth.updateUser(userRecord.uid, { password: user.password, displayName: user.displayName });
      } catch (e) {
        if (e.code === 'auth/user-not-found') {
          userRecord = await auth.createUser({
            email: user.email,
            password: user.password,
            displayName: user.displayName,
          });
          console.log(`Created user ${user.email} in Auth with UID ${userRecord.uid}`);
        } else {
          throw e;
        }
      }

      // Write to Firestore
      const userRef = db.collection('users').doc(userRecord.uid);
      await userRef.set({
        role: user.role,
        wing: user.wing,
        communityId: user.communityId,
        displayName: user.displayName,
        email: user.email,
        fcmToken: null,
        cepCredits: 0,
        migrated: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(`Firestore document seeded for ${user.email}`);

    } catch (err) {
      console.error(`Error processing ${user.email}:`, err);
    }
  }
  
  console.log("Demo user seeding complete.");
  process.exit(0);
}

seedUsers();
