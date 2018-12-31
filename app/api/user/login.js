import * as firebase from "firebase";
import { USER_REGULAR, USER_ADVANCE } from '../../actions/wallet'

export async function user_login(email, password) {

   
    let result = null
    let user=null

    alert(email)
  //  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

    const response = await firebase.auth().signInWithEmailAndPassword(email, password);

    if (response) {

        user = await firebase.auth().currentUser
    }
    if (user) {
       // alert('uid'+user.uid)
        result =
            {
                user
            }
    }

    return result
} 

export async function userSignup(email,password){
    const response = await firebase.auth().createUserWithEmailAndPassword(email, password);
    let user = null
    let result = null
    if (response) {

        user = await firebase.auth().currentUser
    }
    if (user) {
        result =
            {
                user
            }
    }

    return result
}

export function saveUser(user,email,password,phone){
    
    let userMobilePath = "/user/" + user.uid + "/details";

    return firebase.database().ref(userMobilePath).set({
        email: email,
        password: password,
        phone: phone
    })
}

export async function logoutUser(){
   
   alert('Entered')
    const res=await firebase.auth().signOut()
}

export async function currentuser(){
try{
    const user=await firebase.auth().currentUser
      if(user){
          result =user.uid
      }
  
      return result
    }catch(error){
        console.error(error)
    }
  }
  
  export async function getUserRole(userId){

    try{
      let rolePath = "/roles/" + userId;
  
      // alert(userId)
  
     var snapshot=await firebase.database().ref(rolePath).once('value')
     if(snapshot.val()){
        return snapshot.val().role
     }

     return 'Regular'
          
      
    }catch(error){
        console.error(error)
    }
  }

  export async function getCurrencySymbol(userId){
    let currencyPath="/countrycode/"+ userId;
    var snapshot=await firebase.database().ref(currencyPath).once('value')
    if(snapshot.val().symbol){
        return snapshot.val().symbol
    }
    return '$'
}
  
  export async function getCurrencyCode(userId){

    try{
      let currencyPath="/countrycode/"+ userId;
      var snapshot=await firebase.database().ref(currencyPath).once('value')
      if(snapshot.val().countrycode){
        return snapshot.val().countrycode
      }
      return 'USD'
    }catch(error){
        console.error(error)
    }
  }
  
  export async function getUserData(userId){
      try{
          
      let userPath="/user/"+ userId+"/details";
      var snapshot=await firebase.database().ref(userPath).once('value')
      if(snapshot.val()){
        return snapshot.val()
      }
      }catch(error){
          console.error(error)
      }
  }

  export async function updateUserRole(userId,roleType){

    let userMobilePath = "/roles/" + userId;

    toggleRole=(roleType===USER_REGULAR)?USER_ADVANCE:USER_REGULAR
    firebase.database().ref(userMobilePath).update({
        role:toggleRole
    })
    return toggleRole
}

  export async function updateCurrency(userId,currency,symbol){
    let currencyPath="/countrycode/"+userId;
    
    firebase.database().ref(currencyPath).update({
        countrycode:currency,
        symbol: symbol
    })

    return currency
}

export async function updatePassphrase(userId,name,result){
    let walletPath="/wallet/" + userId + "/" + name;
    firebase.database().ref(walletPath).update({
        passphrase:result.passphrase,
        address:result.address,
        wif:result.encryptedWIF,
    })

    return result.passphrase
}

export async function getAllAdress(userId){
    let addressPath = "/wallet/"+userId;

    // alert(userId)
    let items = [];
    
    let snapshot = await firebase.database().ref(addressPath).orderByKey().once('value');
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.val();
      items.push(childKey.address);
    }); 
    
    return items
}

export async function getAllWalletName(userId){
    let addressPath = "/wallet/"+userId;

    // alert(userId)
    let items = [];
    
    let snapshot = await firebase.database().ref(addressPath).orderByKey().once('value');
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      items.push(childKey);
    }); 
    
    return items
}