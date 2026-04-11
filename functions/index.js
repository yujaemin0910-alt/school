const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.onUserSignUp = functions.auth.user().onCreate(async (user) => {
  console.log('User signed up:', user.uid);
});

exports.saveHistory = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in');
  }

  const db = admin.firestore();
  await db.collection('users').doc(context.auth.uid).collection('history').add({
    content: data.content,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true };
});
