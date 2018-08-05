import React from 'react'

import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { AsyncStorage } from 'react-native';
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
import * as firebase from "firebase";

const config = {
  apiKey: "AIzaSyCYwSK4rexyY6l1N82J4h0bmAY8O-l7t1A",
  authDomain: "neowallet-723e2.firebaseapp.com",
  databaseURL: "https://neowallet-723e2.firebaseio.com",
  projectId: "neowallet-723e2",
  storageBucket: "neowallet-723e2.appspot.com",
  messagingSenderId: "117276209951"
};
export default class Loading extends React.Component {

 async componentDidMount() {
    
    if (!firebase.apps.length) {
      //   alert('Initialized!!')
      firebase.initializeApp(config);
    }

    await GoogleSignin.configure({
      ClientId: '117276209951-r3t4dgdkmjuc94nlf90l0otva6hrh50f.apps.googleusercontent.com'
    })

    // const user = await firebase.auth().currentUser

    // if (user.uid) {
    //  alert(user.uid)
    // }

    // else{
    //   alert('sorrt')
    // }

    //  firebase.auth().onAuthStateChanged(user => {
    //   if (user) {
        
    //     this.props.navigation.navigate('Dashboard')
    //    }
   
    //    else{
         
    //      this.props.navigation.navigate('Login')
    //    }
    // //   this.props.navigation.navigate(user ? 'Dashboard' : 'Login')
    //  })
    const response=await this._retrieveData()
    if(response){
      this.props.navigation.navigate('Dashboard')
    }
    else{
      this.props.navigation.navigate('Login')
    }

    
  }

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('user_id');
      if (value !== null) {
        // We have data!!
        //alert('Value'+value)
        return true
      }
     } catch (error) {
       alert(error)
     }

     return false
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Loading</Text>
        <ActivityIndicator size="large" />
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})
