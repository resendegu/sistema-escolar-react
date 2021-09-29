   
// Scripts for firebase and firebase messaging
// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");


const firebaseConfig = {
    apiKey: "AIzaSyD1y5hC5MRvATJRp2TNjz4fVqKONFdQqjc",
    authDomain: "agenciaprojetox.com",
    databaseURL: "https://projetoxagencia-default-rtdb.firebaseio.com",
    projectId: "projetoxagencia",
    storageBucket: "projetoxagencia.appspot.com",
    messagingSenderId: "41818165586",
    appId: "1:41818165586:web:b8a2b49ca919cce1712a8b",
    measurementId: "G-B7H6MK5BNF"
};

// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();




messaging.onBackgroundMessage(async function (payload) {
    console.log("Received background message ", payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: "/logo192.png",
    };

    
    // eslint-disable-next-line no-restricted-globals
    return self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
});

