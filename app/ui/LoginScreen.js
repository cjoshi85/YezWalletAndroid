import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, TextInput, Image, AsyncStorage} from 'react-native';
import { MaterialDialog } from 'react-native-material-dialog';
import { isValidPassphrase} from '../utils/walletStuff'
import { resetUserState } from '../actions/auth'
import Database from "./firebase/database";
import DismissKeyboard from "dismissKeyboard";
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
import { bindActionCreatorsExt } from '../utils/bindActionCreatorsExt'
import { connect } from 'react-redux'
import { ActionCreators } from '../actions'
import Spinner from 'react-native-loading-spinner-overlay';
const FBSDK = require('react-native-fbsdk');
import * as firebase from "firebase";

const {
  LoginManager,
  AccessToken,
  LoginButton
} = FBSDK;


class LoginScreen extends React.Component {

  componentWillMount() {
    const config = {
      apiKey: "AIzaSyCYwSK4rexyY6l1N82J4h0bmAY8O-l7t1A",
      authDomain: "neowallet-723e2.firebaseapp.com",
      databaseURL: "https://neowallet-723e2.firebaseio.com",
      projectId: "neowallet-723e2",
      storageBucket: "neowallet-723e2.appspot.com",
      messagingSenderId: "117276209951"
    };
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }

  }

  static navigationOptions = ({ navigation }) => ({
    headerLeftOnPress: () => {
      // requires https://github.com/react-community/react-navigation/pull/1291
      navigation.dispatch(resetUserState())
      navigation.goBack()
    }
  })
  constructor(props) {
    super(props);

    this.state = {
      uid: "",
      user: null,
      email: "",
      password: "",
      response: "",
      useExistingKey: false,
      hasToken: false,
      isLoaded: false,
      phone: "",
      address: "",
      g_user: "",
      s_user: "",
      loading: false,
      generating: false,
      name:'',
      update:true,
      showPop:false
    };

    this.login = this.login.bind(this);
  }


  _goToScreen(screenName, payload) {
    this.props.navigation.navigate(screenName, payload)
  }

  async getWalletData(uid) {
    
    try {
      
      const data = await Database.listenwalletData(uid)
      if (data) {
        //this._walletLogin('6PYTA478o7p2W9EbfbHJVfkKkLTQLrYr8YzUmJgmfaxgR1a7XoebK2BBWT','Chetan Joshi04291995')
        this._walletLogin(data.passphrase, data.wif)
      }
    } catch (error) {
      alert(error)
    }


  }

  ifWalletExists = async (uid) => {
    
    let response = false
    const data = await Database.listenwalletData(uid)
    if (data) {   
      response = true
      return response
    }
    return response
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
            this.setState({
              showPop:false,
              loading:false});
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
  

  _isUserExists = async (uid) => {
    let response = false
    const data = await Database.listenUserData(uid)
    if (data) {
      response = true
      
      return response
    }
    return response
  }

  async login() {

    DismissKeyboard();
      this.setState({
          loading: true
      });
    try {

      const response = await firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password);
      if (response) {
        //this.getWalletData(response.uid)
        this.setState({
          user: response,
          loading:false
        });
        this.props.navigation.navigate('LoginWallet')

      }
    } catch (error) {
        this.setState({
            loading: false
        });
      alert(error);
    }

  }

  _generateKeys(pw) {

    this.props.wallet.create(pw,null,'Default')

  }


  _saveKey(key_name) {
    this.props.settings.saveKey(this.props.encryptedWIF, key_name)
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

  async saveWallet() {
    await Database.setWalletData(this.state.uid, this.props.address,'Default');
    this.props.navigation.navigate('DisplayWalletAccount')
  }

  saveUserData = async() => {
    await AsyncStorage.setItem('user_id',this.state.uid)
    Database.setUserData(this.state.uid,this.state.name,this.state.email, this.state.phone, "Regular",'USD');
  }

  createWallet = (pw) => {
    this.props.wallet.create(pw, null, 'Default')
  }

  onFBButtonPress= async()=>{
    try{
    const result =await LoginManager.logInWithReadPermissions(['public_profile', 'email','user_birthday'])
    if (result.isCancelled) {
       alert('Whoops!', 'You cancelled the sign in.');
    } 

    else{
        const data= await AccessToken.getCurrentAccessToken()
        const credential=await firebase.auth.FacebookAuthProvider.credential(data.accessToken);
        const currentUser=await firebase.auth().signInWithCredential(credential)
        
    }

  }catch(error){
    alert(error)
  }

 
  }

  _googlesignIn = async () => {
    var user_exists = false
    var wallet_exists = ""
    try {
      await GoogleSignin.configure({
        ClientId: '117276209951-r3t4dgdkmjuc94nlf90l0otva6hrh50f.apps.googleusercontent.com'
      })
      const user = await GoogleSignin.signIn()
      debugger
      if (user) {
        this.setState({ 
          name: user.name,
          email: user.email,
          phone: '' });
      }
      const credential = await firebase.auth.GoogleAuthProvider.credential(
        user.idToken,
        user.accessToken
      );

      const currentUser = await firebase.auth().signInWithCredential(credential);

      if (currentUser) {
        this.setState({
          uid:currentUser.uid,
          loading: true
        });

        debugger
        
        user_exists = await this._isUserExists(currentUser.uid)
        wallet_exists = await this.ifWalletExists(currentUser.uid)
        if (user_exists) {
          if (wallet_exists) {
            this.setState({
              loading:false
            })
            this.props.navigation.navigate('LoginWallet')
          }
          else {         
            const passphrase=(user.name.replace(/\s/g,'')+'04291995').toString()
            this.setState({
                passphrase,
                showPop:true
            })
          }
        }
        else {

          const passphrase=(user.name.replace(/\s/g,'')+'04291995').toString()
            this.setState({
                passphrase,
                showPop:true
            })
          this.saveUserData()
        }

      }

    } catch (error) {
      alert('Error' + error)
    }
  };

  _createWallet() {

    const background = require("../img/background.png");
    const mark = null;
    const lockIcon = require("../img/login1_lock.png");
    const personIcon = require("../img/login1_person.png");
    return (
      <View style={styles.container}>
        <Image source={background} style={styles.background} resizeMode="cover">

        

          <View style={styles.wrapper}>
            <View style={styles.inputWrap}>
              <View style={styles.iconWrap}>
                <Image source={personIcon} style={styles.icon} resizeMode="contain" />
              </View>
              <TextInput
                onSubmitEditing={() => this.password.focus()}
                ref={(el) => { this.email = el; }}
                onChangeText={(email) => this.setState({ email })}
                value={this.state.email}
                autoCorrect={false}
                keyboardType='email-address'
                placeholder="Email"
                placeholderTextColor="#FFF"
                style={[styles.input, styles.whiteFont]}
              />
            </View>
            <View style={styles.inputWrap}>
              <View style={styles.iconWrap}>
                <Image source={lockIcon} style={styles.icon} resizeMode="contain" />
              </View>
              <TextInput
                ref={(el) => { this.password = el; }}
                onChangeText={(password) => this.setState({ password })}
                value={this.state.password}
                placeholderTextColor="#FFF"
                placeholder="Password"
                style={[styles.input, styles.whiteFont]}
                secureTextEntry
              />
            </View>
            <TouchableOpacity activeOpacity={.5}>
              <View>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.login} activeOpacity={0.5}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Sign In</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.signupWrap}>
            <Text style={styles.accountText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => this._goToScreen('Signup', { useExistingKey: false })} activeOpacity={.5}>
              <View>
                <Text style={styles.signupLinkText}>Sign Up</Text>
              </View>
            </TouchableOpacity>
          </View>
            {/* <LoginButton title="Continue with fb" onPress={this.onFBButtonPress} style={styles.FbButton}/> */}

          <GoogleSigninButton
              style={styles.googleButton}
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={this._googlesignIn}
          />
        </Image>
      </View>




    );
  }

  render() {
    const { generating, wif, passphrase, address, encryptedWIF,created,loggedIn } = this.props;
    if (!generating && wif != null && created && !loggedIn) {
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
        <Spinner visible={this.state.loading} textStyle={{ color: '#FFF' }} />
        {this._createWallet()}
      </View>
    );

  }
}

const styles = StyleSheet.create({

  generateForm: {
    marginTop: 30
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
  indicatorView: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#AAAAAA66'
  },
  indicatorText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold'
  },
  submit: {
    paddingTop: 30
  },
  input: {
    flex: 1,
    fontSize: 20,
  },
  whiteFont: {
    color: '#FFF'
  },
  buttonContainer: {
    backgroundColor: '#2980b6',
    paddingVertical: 15
  },
  loginbuttonContainer: {
    backgroundColor: '#2980b6',
    paddingVertical: 15,
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700'
  },
  loginButton: {
    backgroundColor: '#2980b6',
    color: '#fff'
  },
  container: {
    flex: 1
  },
  markWrap: {
    flex: 1,
    paddingVertical: 30,
  },
  mark: {
    width: null,
    height: null,
    flex: 1,
  },
  background: {
    width: null,
    height: '100%'
  },
  wrapper: {
    marginTop: 100,
    paddingVertical: 30,
  },
  inputWrap: {
    flexDirection: "row",
    marginVertical: 10,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC"
  },
  inputBox:{
    height: 36,
    fontSize: 14,
    //backgroundColor: '#E8F4E5',
    color: '#333333'
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
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "hsl(119,139,61) rgb(28,102,100)",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
    googleButton:{
        paddingVertical: 20,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        height:45,
        marginLeft:5,
        marginRight:5,
    },
  FbButton:{
    paddingVertical: 20,
      height:35,
      fontSize:20,
      marginLeft:10,
      marginRight:10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
  },
  forgotPasswordText: {
    color: "#D8D8D8",
    backgroundColor: "transparent",
    textAlign: "right",
    paddingRight: 15,
  },
  signupWrap: {
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  accountText: {
    color: "#D8D8D8"
  },
  signupLinkText: {
    color: "#FFF",
    marginLeft: 5,
  }

});

function mapStateToProps(state, ownProps) {
  return {
    wif: state.wallet.wif,
    name: state.wallet.name,
    address: state.wallet.address,
    passphrase: state.wallet.passphrase,
    encryptedWIF: state.wallet.encryptedWIF,
    generating: state.wallet.generating,
    userId:state.wallet.userId,
    created:state.wallet.created,
    loggedIn:state.wallet.loggedIn
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreatorsExt(ActionCreators, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen)
