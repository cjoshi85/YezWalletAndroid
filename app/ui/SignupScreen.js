import React from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, StatusBar, Text, TextInput, Image, Button, AsyncStorage, KeyboardAvoidingView } from 'react-native';
//import DatePicker from 'react-native-datepicker'
import FAIcons from 'react-native-vector-icons/FontAwesome'
import Database from "./firebase/database";
import DismissKeyboard from "dismissKeyboard";
import { DatePickerDialog } from 'react-native-datepicker-dialog'
import { MaterialDialog } from 'react-native-material-dialog';
import moment from 'moment';
import { isValidPassphrase} from '../utils/walletStuff'

import { bindActionCreatorsExt } from '../utils/bindActionCreatorsExt'
import { connect } from 'react-redux'
import { ActionCreators } from '../actions'
import Spinner from 'react-native-loading-spinner-overlay';
import * as firebase from "firebase";


class SignupScreen extends React.Component {

    componentWillMount() {
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

    }
    constructor(props) {
        super(props);
        this.state = {
            uid: "",
            user: null,
            username:'',
            email: "",
            password: "",
            response: "",
            useExistingKey: false,
            hasToken: false,
            isLoaded: false,
            phone: "",
            address: "",
            loading: false,
            date: "",
            dobText: "Date of Birth",
            passphrase:"",
            update:true,
            showPop:false
        };

    }

    _goToScreen(screenName, payload) {
        this.props.navigation.navigate(screenName, payload)
    }


    saveUserData() {
        Database.setUserData(this.state.uid,this.state.username, this.state.email, this.state.phone,'Regular','USD','$');

    }

     _generateKeys = async (pw) => {
        this.props.wallet.create(pw, null, 'Default')
    }

    signup = async () => {
        DismissKeyboard();
        this.setState({
            loading:true
        });
        try {
            const response = await firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password);
            const dob=moment(this.state.dobText).format('DDMMYYYY')
            passphrase = (this.state.username + dob).toString();
            if (response.uid) {
                this.setState({
                    uid: response.uid,
                    showPop:true,
                    passphrase
                });

                 this.saveUserData()
            }
        } catch (error) {
            alert(error)
            this.setState({
                loading:false
            });
        }

    }

    _storeData = async (uid) => {
        
        try {
            await AsyncStorage.setItem('user_id', uid);
        } catch (error) {
            alert(error)// Error saving data
        }
    }

    onDOBPress = () => {
        let dobDate = this.state.dobText;
        dobDate = new Date();
        //To open the dialog
        this.refs.dobDialog.open({
          date: dobDate,
          maxDate: new Date() //To restirct future date
        });
        }
      
    
      /**
       * Call back for dob date picked event
       *
       */
      onDOBDatePicked = (date) => {
        this.setState({
          dobText: moment(date).format('DD-MMM-YYYY')
        });
      }

      updatePassphrase=async()=>{
        if(this.state.update){
            debugger
            this.setState({
                update:false
            })
        }
        else{
            debugger
            if (isValidPassphrase(this.state.pw1, this.state.pw2)){
                
                await this._generateKeys(this.state.pw1)
                this.setState({showPop:false});
                
               // this.props.wallet.updatePassphrase(this.state.pw1)
                //alert('Passphrase Updated Successfully')
            }
        }
    }

    acceptPassphrase=async ()=>{
        debugger
        await this._generateKeys(this.state.passphrase)
        this.setState({
            showPop:false,
            loading:false
        })
    }

    saveWallet=async()=>{
         await Database.setWalletData(this.state.uid, this.props.address,'Default');
         this.props.navigation.navigate('DisplayWalletAccount')
    }

    _renderPop() {

        if(this.state.update){
        
        return (
            <View>
                <Text style={styles.dialogText}>
                      Your Default Passphrase is
                    </Text>
                    <Text style={styles.dialogText}>
                       
                      {this.state.passphrase}
                    </Text>
            </View>
        )
    }
    
    else{
        return(
        <View>
           <TextInput
                ref={(el) => { this.pw1 = el; }}
                onChangeText={(pw1) => this.setState({ pw1 })}
                value={this.state.pw1}
                placeholderTextColor="#000"
                placeholder="Enter Passphrase"
                style={styles.inputBox}
                secureTextEntry
              />
                            <TextInput
                ref={(el) => { this.pw2 = el; }}
                onChangeText={(pw2) => this.setState({ pw2 })}
                value={this.state.pw2}
                placeholderTextColor="#000"
                placeholder="Repeat Passphrase"
                style={styles.inputBox}
                secureTextEntry
              />
            </View>
    )
}
    }

    _create_user() {
        const background = require("../img/background.png");
        // const backIcon = require("../img/back.png");
        // const personIcon = require("../img/signup_person.png");
        // const lockIcon = require("../img/signup_lock.png");
        // const emailIcon = require("../img/signup_email.png");
        // const birthdayIcon = require("../img/signup_birthday.png");

        return (
            <View style={styles.container}>
                <Image
                    source={background}
                    style={[styles.container, styles.bg]}
                    resizeMode="cover"
                >

                 <View style={styles.inputContainer}>
                        <View style={styles.iconContainer}>
                        
                            <FAIcons name="user" size={25} style={styles.inputIcon} color='white'/>
                        </View>
                        <TextInput
                            style={[styles.input, styles.whiteFont]}
                            onSubmitEditing={() => this.email.focus()}
                            ref={(el) => { this.username = el; }}
                            onChangeText={(username) => this.setState({ username })}
                            value={this.state.username}
                            placeholder="Full Name"
                            autoCorrect={false}
                            keyboardType='text'
                            placeholderTextColor="#FFF"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.iconContainer}>
                        <FAIcons name="envelope" size={25} style={styles.inputIcon} color='white'/>
                            {/* <Image
                                source={emailIcon}
                                style={styles.inputIcon}
                                resizeMode="contain"
                            /> */}
                        </View>
                        <TextInput
                            style={[styles.input, styles.whiteFont]}
                            onSubmitEditing={() => this.password.focus()}
                            ref={(el) => { this.email = el; }}
                            onChangeText={(email) => this.setState({ email })}
                            value={this.state.email}
                            placeholder="Email"
                            autoCorrect={false}
                            keyboardType='email-address'
                            placeholderTextColor="#FFF"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.iconContainer}>
                        <FAIcons name="lock" size={35} style={styles.inputIcon} color='white'/>
                        </View>
                        <TextInput
                            secureTextEntry={true}
                            onSubmitEditing={() => this.phone.focus()}
                            style={[styles.input, styles.whiteFont]}
                            ref={(el) => { this.password = el; }}
                            onChangeText={(password) => this.setState({ password })}
                            value={this.state.password}
                            placeholder="Password"

                            placeholderTextColor="#FFF"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <View style={styles.iconContainer}>
                        <FAIcons name="mobile" size={35} style={styles.inputIcon} color='white'/>
                        </View>
                        <TextInput
                            style={[styles.input, styles.whiteFont]}
                            ref={(el) => { this.phone = el; }}
                            onChangeText={(phone) => this.setState({ phone })}
                            value={this.state.phone}
                            placeholder="Mobile Number"
                            keyboardType='numeric'
                            placeholderTextColor="#FFF"
                            // underlineColorAndroid='transparent'
                        />
                    </View>

                    <View style={styles.inputContainer}>

                        <View style={styles.iconContainer}>
                        <FAIcons name="calendar" size={30} style={styles.inputIcon} color='white'/>
                        </View>
                        
                        <TouchableOpacity onPress={this.onDOBPress.bind(this)} >
                        <View style={styles.datePickerBox}>    
                                <Text style={[styles.input, styles.whiteFont]}>
                                    {this.state.dobText}</Text>
                                </View>
                        </TouchableOpacity>
                        
                    </View>


                    <View style={styles.footerContainer}>

                        <TouchableOpacity onPress={this.signup}>
                            <View style={styles.signup}>
                                <Text style={styles.whiteFont}>Sign Up</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => this._goToScreen('Login', { useExistingKey: false })}>
                            <View style={styles.signin}>
                                <Text style={styles.greyFont}>Already have an account?<Text style={styles.whiteFont}> Sign In</Text></Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                </Image>

                <DatePickerDialog ref="dobDialog" onDatePicked={this.onDOBDatePicked.bind(this)} />
            </View>
        )
    }


    render() {

        const { generating, wif,loggedIn } = this.props;
        if (!generating && wif != null && !loggedIn) {
            this.saveWallet()
        }
        return (
            <View style={styles.container}>

            <MaterialDialog
                    title="Update Passphrase?"
                    visible={this.state.showPop}
                    okLabel='Update'
                    cancelLabel='Accept'
                    onOk={() => this.updatePassphrase()}
                    onCancel={() => this.acceptPassphrase()}>
                    {this._renderPop()}
                </MaterialDialog>
                <Spinner visible={this.props.generating} textContent="Creating wallet.." textStyle={{ color: '#FFF' }} />
                {this._create_user()}
            </View>
        );
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    activityIndicator: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#AAAAAA66',
        justifyContent: 'center',
        alignItems: 'center'
    },
    bg: {
        paddingTop: 30,
        width: null,
        height: null
    },
    headerContainer: {
        flex: 1,
    },
    inputsContainer: {
        flex: 3,
        marginTop: 50,
    },
    footerContainer: {
        flex: 1
    },
    headerIconView: {
        marginLeft: 10,
        backgroundColor: 'transparent'
    },
    datePickerBox:{
        borderColor: '#ABABAB',
        borderWidth: 0,
        padding: 0,
        marginTop:20,
        height: 100,
        width:200,
        justifyContent:'center'
      },
      datePickerText: {
        flex: 1,
        fontSize: 20,
        fontSize: 14,
        borderWidth: 0,
        color: '#121212',
      },
    headerBackButtonView: {
        width: 25,
        height: 25,
    },
    backButtonIcon: {
        width: 25,
        height: 25
    },
    headerTitleView: {
        backgroundColor: 'transparent',
        marginTop: 25,
        marginLeft: 25,
    },
    titleViewText: {
        fontSize: 40,
        color: '#fff',
    },
    inputs: {
        paddingVertical: 20,
    },
    inputContainer: {
        borderWidth: 1,
        borderBottomColor: '#CCC',
        borderColor: 'transparent',
        flexDirection: 'row',
        height: 75,
    },
    iconContainer: {
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputIcon: {
        width: 30,
        height: 30,
    },
    input: {
        flex: 1,
        fontSize: 20,
    },
    inputBox:{
        height: 36,
        fontSize: 14,
        //backgroundColor: '#E8F4E5',
        color: '#333333'
    },
    signup: {
        backgroundColor: "hsl(119,139,61) rgb(28,102,100)",
        paddingVertical: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    signin: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    greyFont: {
        color: '#D8D8D8'
    },
    whiteFont: {
        color: '#FFF'
    }
});

function mapStateToProps(state, ownProps) {
    return {
        wif: state.wallet.wif,
        address: state.wallet.address,
        passphrase: state.wallet.passphrase,
        encryptedWIF: state.wallet.encryptedWIF,
        generating: state.wallet.generating,
        userId: state.wallet.userId,
        loggedIn: state.wallet.loggedIn
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreatorsExt(ActionCreators, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(SignupScreen)
