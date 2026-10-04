const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || path.join(__dirname, '../backend/serviceAccount.json');

try {
  const serviceAccount = require(serviceAccountPath);
  initializeApp({
    credential: cert(serviceAccount)
  });
} catch (err) {
  console.error("Initialization failed:", err.message);
  console.error(err.stack);
  process.exit(1);
}

const db = getFirestore();
const auth = getAuth();

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
        createdAt: FieldValue.serverTimestamp()
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
