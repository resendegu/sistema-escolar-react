import firebase from 'firebase';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId:process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

var app = firebase.initializeApp(firebaseConfig);

// if (window.location.hostname === "localhost") {
//   app.functions().useEmulator("localhost", 5001);
//   app.auth().useEmulator("http://localhost:9099");
//   app.firestore().settings({
//     host: "localhost:8080",
//     ssl: false,
//   });
//   app.database().useEmulator("localhost", 9000);
//   app.storage().useEmulator("localhost", 9199);
// } 

const authNormal = firebase.auth;
const auth = firebase.auth();
const database = firebase.database();
const functions = firebase.app().functions('southamerica-east1');
const storage = firebase.storage();
let messaging
try {
  messaging = firebase.messaging();
} catch (error) {
  console.log(error);
}
const firestore = firebase.firestore();

const { REACT_APP_VAPID_KEY } = process.env;
const publicKey = REACT_APP_VAPID_KEY;

const getToken = async (setTokenFound) => {
    let currentToken = "";
  
    try {
      currentToken = await messaging.getToken({ vapidKey: publicKey });
      if (currentToken) {
        setTokenFound(true);

        
      } else {
        setTokenFound(false);
      }
    } catch (error) {
      console.log("An error occurred while retrieving token. ", error);
    }
  
    return currentToken;
};

const onMessageListener = () =>
    new Promise((resolve) => {
    messaging.onMessage((payload) => {
        resolve(payload);
    });
});

export { firebase, auth, authNormal, database, functions, storage, getToken, onMessageListener };