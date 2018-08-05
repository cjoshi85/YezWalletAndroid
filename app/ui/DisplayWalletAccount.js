import React from 'react'
import { ScrollView, View, Text, StyleSheet, TextInput, Clipboard } from 'react-native'
import Button from '../components/Button'
import KeyDataRow from '../components/KeyDataRow'
import { DropDownHolder } from '../utils/DropDownHolder'
import { bindActionCreatorsExt } from '../utils/bindActionCreatorsExt'
import { connect } from 'react-redux'
import { ActionCreators } from '../actions'
import * as firebase from "firebase";
import Spinner from 'react-native-loading-spinner-overlay';
import QRCode from 'react-native-qrcode';

class DisplayWalletAccount extends React.Component{
    constructor(props){
        super(props)
        this.dropdown = DropDownHolder.getDropDown()
        this.state = {
            uid: "",
        }
    }

    _copyToClipBoard() {
        const { passphrase, address, encryptedWIF, wif } = this.props
        const data = {
            passphrase: passphrase,
            public_address: address,
            encrypted_key: encryptedWIF,
            private_key: wif
        }
        Clipboard.setString(JSON.stringify(data))
        this.dropdown.alertWithType('info', 'Success', 'Data copied to clipboard. Be careful where you paste the data!')
    }

   async componentDidMount(){
       const user = await firebase.auth().currentUser
       this.setState({
           uid:user.uid
       })
    }

    _loginWallet=()=>{
        //alert(this.props.encryptedWIF)
        this.props.wallet.login(this.props.passphrase,this.props.encryptedWIF,this.state.uid)
    }


    render(){
        const { passphrase, address, encryptedWIF, wif } = this.props
        return (
            <ScrollView>
                <View style={styles.warningView}>
                    <Text style={styles.warningText}>
                        You must save and backup the keys below. If you lose them, you lose access to your assets. Verify that you can log in to the account and see the correct public address before sending anything to the
                        address below!
                    </Text>
                </View>
                <Spinner visible={this.props.decrypting} textContent={this.state.spinnerText} textStyle={{ color: '#000' }} />
                <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={styles.addressRow}>
                                <QRCode
                                    value={this.props.address}
                                    size={100}
                                    bgColor='black'
                                    fgColor='white'/>
</View>
<View style={styles.addressRow}>

                                    <QRCode
                                    value={this.props.wif}
                                    size={100}
                                    bgColor='black'
                                    fgColor='white'/>
                                    <Text></Text>
                                    
<View style={styles.addressRow}>
                                    <QRCode
                                    value={this.props.encryptedWIF}
                                    size={100}
                                    bgColor='black'
                                    fgColor='white'/>
                                    </View>
                           </View> 
                            </View>
                <View style={styles.dataList}>
                    <KeyDataRow title="Passphrase" value={passphrase} />
                    <KeyDataRow title="Public address" value={address} />
                    <KeyDataRow title="Encrypted key" value={encryptedWIF} />
                    <KeyDataRow title="Private key" value={wif} />
                </View>
                <Button onPress={this._copyToClipBoard.bind(this)} title="Copy data to clipboard" />
                <Button onPress={() => {this._loginWallet()}} title="Conntinue to Dashboard" />
                
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    warningView: {
        flexDirection: 'row',
        backgroundColor: 'red'
    },
    warningText: {
        marginHorizontal: 20,
        paddingVertical: 5,
        color: 'white'
    },
    dataList: {
        flexDirection: 'column',
        justifyContent: 'flex-start' // vertical
    },
    spacer: {
        height: 2,
        backgroundColor: '#EFEFEF',
        marginHorizontal: 30,
        marginVertical: 20
    },
    inputBox: {
        marginHorizontal: 20,
        marginVertical: 5,
        paddingLeft: 10,
        // paddingTop: 5,
        height: 36,
        fontSize: 14,
        backgroundColor: '#E8F4E5',
        color: '#333333'
    },
    instructionText: {
        color: '#333333',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center', // vertical
        marginVertical: 5,
        marginLeft:10
    },
})


function mapStateToProps(state, ownProps) {
    return {
        wif: state.wallet.wif,
        address: state.wallet.address,
        passphrase: state.wallet.passphrase,
        encryptedWIF: state.wallet.encryptedWIF,
        generating: state.wallet.generating,
        userId: state.wallet.userId,
        decrypting: state.wallet.decrypting
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreatorsExt(ActionCreators, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(DisplayWalletAccount)
