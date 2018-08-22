import React from 'react'
import { View, TextInput, StyleSheet,AsyncStorage } from 'react-native'
import Button from '../components/Button'
import Spinner from 'react-native-loading-spinner-overlay';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Icon from 'react-native-vector-icons/MaterialIcons';
// redux
import { bindActionCreatorsExt } from '../utils/bindActionCreatorsExt'
import { connect } from 'react-redux'
import { ActionCreators } from '../actions'
import { isValidWIF } from '../api/crypto'
import * as firebase from "firebase";

class LoginEncryptedKey extends React.Component {
    constructor(props){
        super(props)
        this.state={
            encryptedWIF:'',
            passphrase:'',
            icEye: 'visibility-off',
            password: true,
            iconSize:25,
            uid:'',
            password1:true,
            icEye1:'visibility-off',
            showQR:true,
            loading:false,
            spinnerText:"Please wait.."
        }
    }

    async componentDidMount(){
        const user = await firebase.auth().currentUser
        this.setState({
            uid:user.uid
        })
     }

    _walletLogin() {

        this.setState({
            showQR:false,
            loading:true
        })

        setTimeout(() => {
            this.login()
          }, 2000)

          setTimeout(()=>{
              this.setState({
                  spinnerText:'We are validating your account.'
              })
          },6000)

        //setTimeout(function() { this.login(); }, 2000);
    }

    saveKey=async ()=>{
        await AsyncStorage.setItem('user_id',this.state.uid) 
        await AsyncStorage.setItem('encryptedWIF',this.state.encryptedWIF)
        await AsyncStorage.setItem('passphrase',this.state.passphrase)
     }

    login=()=>{
        const {encryptedWIF,passphrase,uid} = this.state
        this.props.wallet.login(passphrase,encryptedWIF,uid)
    }

    onSuccess(e) {
        this.setState({ encryptedWIF: e.data });
      }

      changePwdType = () => {
        let newState;
        if (this.state.password) {
            newState = {
                icEye: 'visibility',
                password: false
            }
        } else {
            newState = {
                icEye: 'visibility-off',
                password: true
            }
        }
        this.setState(newState)
    };

    updateState() {
        alert(this.state.loading)
        this.setState({
            showQR:true,
            loading:false
        })
        
    }

    changePwdType1 = () => {
        let newState;
        if (this.state.password1) {
            newState = {
                icEye1: 'visibility',
                password1: false
            }
        } else {
            newState = {
                icEye1: 'visibility-off',
                password1: true
            }
        }
        this.setState(newState)
    };

    render() {

        if(this.props.loggedIn){
            this.saveKey()
        }
        
        return (
            <View style={styles.container}>
                <View style={styles.loginForm}>
                <Spinner visible={this.props.decrypting} textContent={this.state.spinnerText} textStyle={{ color: '#000' }} />
                    <TextInput
                        ref={(el) => { this.encryptedWIF = el; }}
                        onChangeText={(encryptedWIF) => this.setState({ encryptedWIF })}
                        value={this.state.encryptedWIF}
                        placeholderTextColor="#000"
                        placeholder="Enter your Encrypted key here"
                        style={styles.inputBox}
                        autoCorrect={false}
                        secureTextEntry={this.state.password}/>

                     <Icon style={styles.icon}
                      name={this.state.icEye}
                      size={this.state.iconSize}
                      color='#000'
                      onPress={this.changePwdType}
                />

                <TextInput
                        ref={(el) => { this.passphrase = el; }}
                        onChangeText={(passphrase) => this.setState({ passphrase })}
                        value={this.state.passphrase}
                        placeholderTextColor="#000"
                        placeholder="Enter your Passphrase here"
                        style={styles.inputBox}
                        autoCorrect={false}
                        secureTextEntry={this.state.password1}/>

                     <Icon style={styles.icon1}
                      name={this.state.icEye1}
                      size={this.state.iconSize}
                      color='#000'
                      onPress={this.changePwdType1}
                />
                    <Button title="Login" onPress={this._walletLogin.bind(this)} />
                    </View>
                   {this.state.showQR && <QRCodeScanner
                            onRead={this.onSuccess.bind(this)}

                   /> }

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    inputBox: {
        marginHorizontal: 20,
        marginVertical: 5,
        paddingLeft: 10,
        height: 36,
        fontSize: 14,
        //backgroundColor: '#E8F4E5',
        color: '#333333'
    },
    loginForm: {
        marginTop: 10
    },
    icon: {
        position: 'absolute',
        top: 5,
        right: 0
    },
    icon1: {
        position: 'absolute',
        top: '35%',
        right: 0
    }
})

function mapStateToProps(state, ownProps) {
    return {
        loggedIn:state.wallet.loggedIn,
        decrypting:state.wallet.decrypting
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreatorsExt(ActionCreators, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginEncryptedKey)
