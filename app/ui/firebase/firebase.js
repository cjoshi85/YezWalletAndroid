
import * as firebase from "firebase";

class Firebase {

    /**
     * Initialises Firebase
     */
    static initialise() {
        firebase.initializeApp({
            apiKey: "AIzaSyDk4FAfV958Ht9YnFpBLG3aIcRRBL0Br8Y",
            authDomain: "yezwallet.firebaseapp.com",
            databaseURL: "https://yezwallet.firebaseio.com",
            projectId: "yezwallet",
            storageBucket: "yezwallet.appspot.com",
            messagingSenderId: "1001567655720"
        });
    }

}

module.exports = Firebase;
