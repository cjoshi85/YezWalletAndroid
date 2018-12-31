import React from 'react'
import { View, TextInput, StyleSheet,TouchableOpacity,Text,Image } from 'react-native'
import { DropDownHolder } from '../utils/DropDownHolder'
import FAIcons from 'react-native-vector-icons/FontAwesome'
import * as firebase from "firebase";
import DismissKeyboard from "dismissKeyboard";

class ForgotScreen extends React.Component {
    constructor(props){
        super(props)
        this.dropdown = DropDownHolder.getDropDown()
        this.state={
            email:''
        }
    } 
    
    resetPassword = async()=>{
          DismissKeyboard();
          const resonse = await firebase.auth().sendPasswordResetEmail(this.state.email)
          this.dropdown.alertWithType('info', 'Success', 'Password reset link has been sent to your email. Please use link to reset your password.')
          this.props.navigation.navigate('Login')
    }
    
    render() {
        const background = require("../img/background.png");
        return (
            <View style={styles.container}>
            <Image source={background} style={styles.background} resizeMode="cover">
                <View style={styles.wrapper}>
                    <View style={styles.inputWrap}>
                        <View style={styles.iconWrap}>
                            <FAIcons name="envelope" size={20} style={styles.icon} color='white'/>
                        </View>
                    <TextInput
                        ref={(el) => { this.email = el; }}
                        onChangeText={(email) => this.setState({ email })}
                        value={this.state.email}
                        autoCorrect={false}
                        keyboardType='email-address'
                        placeholder="Enter your email"
                        placeholderTextColor="#FFF"
                        style={[styles.input, styles.whiteFont]}
                    />
                    </View>
                    <TouchableOpacity onPress={this.resetPassword} activeOpacity={0.5}>
                        <View style={styles.button}>
                            <Text style={styles.buttonText}>Reset Password</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Image>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 20,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30,
        backgroundColor: "hsl(119,139,61) rgb(67, 90, 98)", 
        borderRadius:10
      },
      buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700'
      },
      container: {
        flex: 1,
      },
      wrapper: {
        marginTop: 100,
        paddingVertical: 30,
      },
      inputWrap: {
        flexDirection: "row",
        marginVertical: 10,
        height: 60,
        borderBottomWidth: 1,
        borderBottomColor: "#CCC"
      },
      iconWrap: {
        paddingHorizontal: 7,
        alignItems: "center",
        justifyContent: "center",
      },
      icon: {
        height: 20,
        width: 20,
      },
      input: {
        flex: 1,
        fontSize: 20,
      },
      whiteFont: {
        color: '#FFF'
      },
      background: {
        width: null,
        height: '100%'
      },
})
export default ForgotScreen;