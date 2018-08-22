import React from 'react'

import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { AsyncStorage } from 'react-native';
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
import * as firebase from "firebase";

const config = {
  apiKey: "AIzaSyDk4FAfV958Ht9YnFpBLG3aIcRRBL0Br8Y",
  authDomain: "yezwallet.firebaseapp.com",
  databaseURL: "https://yezwallet.firebaseio.com",
  projectId: "yezwallet",
  storageBucket: "yezwallet.appspot.com",
  messagingSenderId: "1001567655720"
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

    const response=await this._retrieveData()
    debugger
    if(response){
      this.props.navigation.navigate('Dashboard')
    }
    else{
      this.props.navigation.navigate('Login')
    }

    
  }

  _retrieveData = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const privateKey=await AsyncStorage.getItem('wif');
      const encryptedKey=await AsyncStorage.getItem('encryptedWIF');
      const passphrase=await AsyncStorage.getItem('passphrase');
      debugger
      if (user_id &&(privateKey||(encryptedKey&&passphrase))) {
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
