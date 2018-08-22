import React from 'react'
import { View, TextInput, StyleSheet,AsyncStorage } from 'react-native'
import Button from '../components/Button'
import { DropDownHolder } from '../utils/DropDownHolder'
import QRCodeScanner from 'react-native-qrcode-scanner';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/MaterialIcons';
// redux
import { bindActionCreatorsExt } from '../utils/bindActionCreatorsExt'
import { connect } from 'react-redux'
import { ActionCreators } from '../actions'
import { isValidWIF } from '../api/crypto'
import * as firebase from "firebase";
class LoginPrivateKey extends React.Component {
    constructor(props){
        super(props)
        this.state={
            privateKey:'',
            icEye: 'visibility-off',
            password: true,
            iconSize:25,
            uid:''
        }
    }

    async componentDidMount(){
        const user = await firebase.auth().currentUser
        this.setState({
            uid:user.uid
        })
     }

     saveKey=async ()=>{
        await AsyncStorage.setItem('user_id',this.state.uid) 
        await AsyncStorage.setItem('wif',this.state.privateKey)
     }
 
    _walletLogin() {
        const {privateKey} = this.state
        if (isValidWIF(privateKey)) {
            this.props.wallet.loginWithPrivateKey(privateKey,this.state.uid)
        } else {
            DropDownHolder.getDropDown().alertWithType('error', 'Error', 'Invalid key')
        }
    }

    onSuccess(e) {
        this.setState({ privateKey: e.data });
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

    render() {
        if(this.props.loggedIn){
            this.saveKey()
        }
        return (
            <View style={styles.container}>
                <View style={styles.loginForm}>
                <Spinner visible={this.props.decrypting} textContent='Please wait..' textStyle={{ color: '#000' }} />
                    <TextInput
                        ref={(el) => { this.privateKey = el; }}
                        onChangeText={(privateKey) => this.setState({ privateKey })}
                        value={this.state.privateKey}
                        placeholderTextColor="#000"
                        placeholder="Enter your Private key(WIF) here"
                        style={styles.inputBox}
                        autoCorrect={false}
                        secureTextEntry={this.state.password}/>
                     
                     <Icon style={styles.icon}
                      name={this.state.icEye}
                      size={this.state.iconSize}
                      color='#000'
                      onPress={this.changePwdType}
                />
                    <Button title="Login" onPress={this._walletLogin.bind(this)} />
                    </View>
                    {!this.props.decrypting && <QRCodeScanner
                            onRead={this.onSuccess.bind(this)}

                        />}
                
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

export default connect(mapStateToProps, mapDispatchToProps)(LoginPrivateKey)
