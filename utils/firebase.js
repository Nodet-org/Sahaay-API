const firebase = require("firebase");

const firebaseConfig = {
  apiKey: "AIzaSyCnLpp966sDw68fDrzID5knoOpW8L7g-lA",
  authDomain: "resource-covid.firebaseapp.com",
  databaseURL:
    "https://resource-covid-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "resource-covid",
  storageBucket: "resource-covid.appspot.com",
  messagingSenderId: "642854737017",
  appId: "1:642854737017:web:05f037104fbd9e7f30b0a8",
  measurementId: "G-9MQHCT81HD",
};

const app = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

exports.db = app.database();

exports.app;
