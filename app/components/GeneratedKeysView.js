import React from 'react'
import { ScrollView, View, Text, StyleSheet, Clipboard } from 'react-native'
import KeyDataRow from './KeyDataRow'
import Button from './Button'
import QRCode from 'react-native-qrcode';
import { DropDownHolder } from '../utils/DropDownHolder'
import PropTypes from 'prop-types'

class GeneratedKeysView extends React.Component {
    constructor(props) {
        super(props)
        this.dropdown = DropDownHolder.getDropDown()
        this.state = {
            saveDisabled: true,
            saved: false,
            wallets:[],
            buttonText: 'Select wallet',
            walletSelected:false,
            name:'',
            passphrase:'',
            address:'',
            encryptedWIF:'',
            wif:'',
            loading:false
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


    render() {
        const { passphrase, address, encryptedWIF, wif } = this.props
        return (
            <ScrollView>
                <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={styles.addressRow}>
                    <QRCode
                                    value={address}
                                    size={100}
                                    bgColor='black'
                                    fgColor='white'/>
                    <Text style={{marginVertical: 10}}> Address </Text>
                </View>
                   {wif && <View style={styles.addressRow}>

                                    <QRCode
                                    value={wif}
                                    size={100}
                                    bgColor='black'
                                    fgColor='white'/>
                                    <Text style={{marginVertical: 10}}> Private Key </Text>
                                    </View>
                                    }

                                    
               {encryptedWIF && <View style={styles.addressRow}>
                                    <QRCode
                                    value={encryptedWIF}
                                    size={100}
                                    bgColor='black'
                                    fgColor='white'/>
                                    <Text style={{marginVertical: 10}}> Encryped Key </Text>
                                    </View>}
                </View> 
                            
                <View style={styles.dataList}>
                    {passphrase && <KeyDataRow title="Passphrase" value={passphrase} />}
                    <KeyDataRow title="Public address" value={address} />
                    {encryptedWIF && <KeyDataRow title="Encrypted key" value={encryptedWIF} />}
                                {wif && <KeyDataRow title="Private Key" value={wif} /> }
                </View>
                <Button onPress={this._copyToClipBoard.bind(this)} title="Copy data to clipboard" />
                
            </ScrollView>
        )

    }
}

GeneratedKeysView.propTypes = {
    name: PropTypes.string,
    wif: PropTypes.string,
    passphrase: PropTypes.string,
    encryptedWIF: PropTypes.string,
    address: PropTypes.string,
    uid:PropTypes.string,
    showOption:PropTypes.bool
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
        flexDirection: 'column',
        alignItems: 'center', // vertical
        marginVertical: 5,
        marginLeft:10,
        flex:1,
        
    },
})

export default GeneratedKeysView

