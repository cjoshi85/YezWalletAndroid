/**
 * @class Database
 */

import * as firebase from "firebase";

class Database {

    /**
     * Sets a users mobile number
     * @param userId
     * @param mobile
     * @returns {firebase.Promise<any>|!firebase.Promise.<void>}
     */
    static setUserData(userId, username,email, phone,role,countrycode,symbol) {

        let userPath = "/user/" + userId + "/details";
        let rolePath= "/roles/"+userId;
        let currencyPath="/countrycode/"+userId;


        firebase.database().ref(userPath).set({
            email,
            username,
            phone
        })

        firebase.database().ref(rolePath).set({
            role:role
        })

        firebase.database().ref(currencyPath).set({
            countrycode:countrycode,
            symbol
        })

    }

    static setWalletData(userId, address,name) {

        let userMobilePath = "/wallet/" + userId + "/" + name;
       // alert('Wallet Name-->' + name)

       

        return firebase.database().ref(userMobilePath).set({
            address: address,
        })

    }

    /**
     * Listen for changes to a users mobile number
     * @param userId
     * @param callback Users mobile number
     */
    static async listenUserData(userId) {

        let userMobilePath = "/user/" + userId + "/details";

       var snapshot=await firebase.database().ref(userMobilePath).once('value')
       if(snapshot){
       return snapshot.val()
       }
       return false
    }

    static async listenwalletData(userId) {
        let addressPath = "/wallet/" + userId + "/Default";

        // alert(userId)

       var snapshot=await firebase.database().ref(addressPath).once('value')
                //  alert('address1'+snapshot.val().address)
        return snapshot.val()

    }

    static async listenwalletDatabyName(userId,name){
        let addressPath = "/wallet/" + userId + "/"+name;

        // alert(userId)

       var snapshot=await firebase.database().ref(addressPath).once('value')
                //  alert('address1'+snapshot.val().address)
        return snapshot.val()
    }

static async listenallwallets(userId) {
        let addressPath = "/wallet/"+userId;

        // alert(userId)
        let items = [];

        let snapshot = await firebase.database().ref(addressPath).orderByKey().once('value');
        
        snapshot.forEach(function(childSnapshot) {
          var childKey = childSnapshot.key;
         // var childData = snapshot.val();
          items.push(childKey);
        }); 
     
        return items

    }
}

module.exports = Database;
