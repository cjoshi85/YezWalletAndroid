import React from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import Button from '../components/Button'
import GeneratedKeysView from '../components/GeneratedKeysView'
import { isValidPassphrase,isValidName } from '../utils/walletStuff'
import { DropDownHolder } from '../utils/DropDownHolder'
import { resetState } from '../actions/wallet'
import { isValidWIF,generateEncryptedWIF } from '../api/crypto'
import Database from '../ui/firebase/database'


// redux
import { bindActionCreatorsExt } from '../utils/bindActionCreatorsExt'
import { connect } from 'react-redux'
import { ActionCreators } from '../actions'

class CreateWallet extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        headerLeftOnPress: () => {
            // requires https://github.com/react-community/react-navigation/pull/1291
            //navigation.dispatch(resetState())
            navigation.state.params.updateState()
            navigation.goBack()
        }
    })

    constructor(props) {
        super(props)
        this.state = {
            useExistingKey: false,
            pw1: "",
            pw2: "",
            name: "",
            created:false,
            data:''
        }
    }

    componentDidMount(){
        this.props.navigation.setParams({ updateState: this._updateState });
        
    }

    _updateState = () => {
        this.setState({
            pw1: "",
            pw2: "",
            name: "",
            created:false,
            data:'',
            creating:false
        })
      };

   async _generateKeys() {
        
        this.setState({
            creating:true
        })
        const pw1 = this.state.pw1
        const pw2 = this.state.pw2
//        const wif = this.txtPrivateKey && this.txtPrivateKey._lastNativeText
        

        if (isValidPassphrase(pw1, pw2)) {
            if(isValidName(this.state.name)){
                            
               result=await generateEncryptedWIF(pw1)

               if(result.passphrase){
               
                this.setState({
                created:true,
                data:result,
                creating:false
                })
                Database.setWalletData(this.props.userId, result.address, this.state.name);
        }
               
    }
    }
}

    _renderWIFEntry() {
        return (
            <TextInput
                ref={txtInput => {
                    this.txtPrivateKey = txtInput
                }}
                multiline={false}
                placeholder="Enter your private key (WIF) here"
                placeholderTextColor="#636363"
                returnKeyType="done"
                style={styles.inputBox}
                autoCorrect={false}
                secureTextEntry={true}
            />
        )
    }

    _renderPassphraseEntry() {
       // this.setState({ useExistingKey: this.props.navigation.state.params.useExistingKey })
        return (
            <View style={styles.container}>
                <View style={styles.generateForm}>
                    <Text style={styles.instructionText}>Choose a passphrase to encrypt your private key</Text>
                    <TextInput
                            style={[styles.input]}
                            ref={(el) => { this.pw1 = el; }}
                            onChangeText={(pw1) => this.setState({ pw1 })}
                            value={this.state.pw1}
                            placeholder="Enter passphrase here"
							autoCorrect={false}
                            placeholderTextColor="#00000"
                        />
						
						<TextInput
                            style={[styles.input]}
                            ref={(el) => { this.pw2 = el; }}
                            onChangeText={(pw2) => this.setState({ pw2 })}
                            value={this.state.pw2}
                            placeholder="Repeat passphrase here"
							autoCorrect={false}
                            placeholderTextColor="#00000"
                        />

                        <TextInput
                            style={[styles.input, styles.whiteFont]}
                            ref={(el) => { this.name = el; }}
                            onChangeText={(name) => this.setState({ name })}
                            value={this.state.name}
                            placeholder="Enter Wallet Name"
							autoCorrect={false}
                            placeholderTextColor="#00000"
                        />

                    {this.state.useExistingKey ? this._renderWIFEntry() : null}
                    <Button onPress={this._generateKeys.bind(this)} title="Generate encrypted key" />
                </View>
            </View>
        )
    }

    _renderBarIndicator() {
        // don't use until key generation duration becomes less than 1/60 or it will block the animation
        // <View style={{ flexDirection: 'row' }}>
        //     <BarIndicator color="#236312" count={5} />
        // </View>
        return (
            <View style={styles.indicatorView}>
                <Text style={styles.indicatorText}>Generating...</Text>
            </View>
        )
    }

    _saveKey(key_name) {
        this.props.settings.saveKey(this.props.encryptedWIF, key_name)
    }

    render() {
       const { generating, wif, passphrase, address, encryptedWIF,uid,name } = this.props
        const {data}=this.state
        return (
            <View style={styles.container}>
                {!generating? this._renderPassphraseEntry() : null}
                {generating ? this._renderBarIndicator() : null}
                {data.passphrase && !generating ? (
                    <GeneratedKeysView
                        name={this.state.name}
                        wif={data.wif}
                        passphrase={data.passphrase}
                        address={data.address}
                        encryptedWIF={data.encryptedWIF}
                    />
                ) : null}
             
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start'
    },
    instructionText: {
        color: '#333333',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10
    },
    inputBox: {
        marginHorizontal: 20,
        marginVertical: 5,
        paddingLeft: 10,
        height: 36,
        fontSize: 14,
        backgroundColor: '#E8F4E5',
        color: '#333333'
    },
    generateForm: {
        marginTop: 5
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
    }
})

function mapStateToProps(state, ownProps) {
    return {
        wif: state.wallet.wif,
        userId:state.wallet.userId,
        name:state.wallet.name,
        address: state.wallet.address,
        passphrase: state.wallet.passphrase,
        encryptedWIF: state.wallet.encryptedWIF,
        generating: state.wallet.generating
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreatorsExt(ActionCreators, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(CreateWallet)
