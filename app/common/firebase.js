
import * as firebase from "firebase";

const config = {
  apiKey: "AIzaSyDk4FAfV958Ht9YnFpBLG3aIcRRBL0Br8Y",
  authDomain: "yezwallet.firebaseapp.com",
  databaseURL: "https://yezwallet.firebaseio.com",
  projectId: "yezwallet",
  storageBucket: "yezwallet.appspot.com",
  messagingSenderId: "1001567655720"
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
   }
  
const auth = firebase.auth();
  
export {
    auth,
  };
