
import * as firebase from "firebase";

class Firebase {

    /**
     * Initialises Firebase
     */
    static initialise() {
        firebase.initializeApp({
            apiKey: "AIzaSyCYwSK4rexyY6l1N82J4h0bmAY8O-l7t1A",
            authDomain: "neowallet-723e2.firebaseapp.com",
            databaseURL: "https://neowallet-723e2.firebaseio.com",
            projectId: "neowallet-723e2",
            storageBucket: "neowallet-723e2.appspot.com",
            messagingSenderId: "117276209951"
        });
    }

}

module.exports = Firebase;
