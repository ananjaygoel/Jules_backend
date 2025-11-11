const fs = require('fs');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Support two ways to provide the Firebase service account:
// 1) FIREBASE_SERVICE_ACCOUNT_KEY_PATH pointing to a JSON file
// 2) FIREBASE_SERVICE_ACCOUNT_KEY containing a JSON string (single-line or with escaped newlines)
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
  const raw = fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH, 'utf8');
  serviceAccount = JSON.parse(raw);
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } catch (e) {
    // If the env value contains escaped newlines ("\\n") for the private key, convert them and try again.
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'));
    } catch (err) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY from environment.');
      console.error('Options: set FIREBASE_SERVICE_ACCOUNT_KEY_PATH to a file containing the JSON,');
      console.error('or set FIREBASE_SERVICE_ACCOUNT_KEY to a valid single-line JSON string where newlines are escaped as \\\\n');
      throw err;
    }
  }
} else {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_KEY_PATH must be set');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
