import React from 'react'
import { Text,View, TextInput, StyleSheet,Image, TouchableOpacity,Modal } from 'react-native'
import { isValidPublicAddress } from '../api/crypto/index'
import FAIcons from 'react-native-vector-icons/FontAwesome'
import Button from '../components/Button'
import { ASSET_TYPE } from '../actions/wallet'
import { DropDownHolder } from '../utils/DropDownHolder'
import { isNil } from 'lodash'
import { formatFiat, formatNEO } from '../core/formatters'
import QRCode from 'react-native-qrcode';
import { toBigNumber } from '../core/math'
import QRCodeScanner from 'react-native-qrcode-scanner';

// redux
import { connect } from 'react-redux'
import { bindActionCreatorsExt } from '../utils/bindActionCreatorsExt'
import { ActionCreators } from '../actions'
import { AsyncStorage } from 'react-native'

class AssetSendForm extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showPop:false,
            dialogVisible: false,
            selectedAsset: 'YEZ',
            ModalVisibleStatus_S: false,
            ModalVisibleStatus_R: false,
            address:'',
            visible:true,
            update:true,
            pw1:'',
            pw2:''
        }
        this.dropdown = DropDownHolder.getDropDown()
    }

    _storeData = async (uid) => {
    try {
      await AsyncStorage.setItem('user_id', uid);
    } catch (error) {
      alert(error)// Error saving data
    }
  }

    _toggleAsset() {
        const asset = this.state.selectedAsset === ASSET_TYPE.NEO ? ASSET_TYPE.GAS : ASSET_TYPE.NEO
        this.setState({ selectedAsset: asset })
    }

    onSuccess(e) {
        this.setState({ address: e.data });
      }

    ShowModalFunction_S(visible) {
 
        this.setState({ModalVisibleStatus_S: visible});
        
      }

      ShowModalFunction_R(visible) {
 
        this.setState({ModalVisibleStatus_R: visible});
        
      }

    componentWillReceiveProps(nextProps) {
        if (nextProps.updateAfterSend == true) {
            this.txtInputAmount.clear()
            this.txtInputAddress.clear()
            this.setState({ value: '' });
        }
    }

    _isValidInputForm(address, amount, assetType) {
        let result = true
        const balance = assetType == ASSET_TYPE.NEO ? this.props.neo : this.props.gas
        if (address == undefined || address.length <= 0 || isValidPublicAddress(address) != true || address.charAt(0) !== 'A') {
            this.dropdown.alertWithType('error', 'Error', 'Not a valid destination address')
            result = false
        } else if (amount == undefined || amount <= 0) {
            this.dropdown.alertWithType('error', 'Error', 'Invalid amount')
            result = false
        } else if (amount > balance) {
            this.dropdown.alertWithType('error', 'Error', 'Not enough ' + `${assetType}`)
            result = false
        } else if (assetType == ASSET_TYPE.NEO && parseFloat(amount) !== parseInt(amount)) {
            this.dropdown.alertWithType('error', 'Error', 'Cannot not send fractional amounts of ' + `${assetType}`)
            result = false
        }
        return result
    }

    _sendAsset() {
        const address = this.state.address
        const amount = this.txtInputAmount._lastNativeText
        const assetType = this.state.selectedAsset

        // TODO: add confirmation (modal?)
        if (this._isValidInputForm(address, amount, 'NEO')) {
        //    alert(address+' '+amount+' '+assetType)
                this.props.wallet.sendAsset(address, amount, 'NEO')
        }
    }
    handleDialogCancel = () => {
        this.setState({ dialogVisible: false });
    };

    handleDialogDelete = () => {
        this.setState({ dialogVisible: false });
    };

   render(){
        const background = require("../img/background.png");
        const {neo,neoPrice,currencyCode,passphrase}=this.props
        const neoValue = neoPrice && neo && neo !== '0'
         ? toBigNumber(neoPrice).multipliedBy(neo) : toBigNumber(0)

         const invalidPrice = isNil(neoPrice)

        return (
            <View style={styles.dataInputView}>
                <Image source={background} style={{width: null, height: '100%'}} resizeMode="cover">
                    <Modal
                        visible={this.state.ModalVisibleStatus_S}
                        onRequestClose={() => {
                            this.ShowModalFunction_S(!this.state.ModalVisibleStatus_S)
                        }}>


                        <QRCodeScanner
                            onRead={this.onSuccess.bind(this)}

                        />
                        <View style={styles.addressRow}>

                            <TextInput
                                ref={(ref) => {
                                    this.FirstInput = ref;
                                }}
                                onChangeText={(value) => this.setState({'address': value})}
                                value={this.state.address}
                                multiline={false}
                                placeholder="Where to send the asset (address)"
                                placeholderTextColor="#636363"
                                returnKeyType="done"
                                style={styles.inputBox}
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.addressRow}>


                            <TextInput
                                ref={txtInput => {
                                    this.txtInputAmount = txtInput
                                }}
                                multiline={false}
                                placeholder="Amount"
                                placeholderTextColor="#636363"
                                returnKeyType="done"
                                style={styles.inputBox}
                                autoCorrect={false}
                            />
                            <Button title={this.state.selectedAsset} 
                                    // onPress={this._toggleAsset.bind(this)}
                                    style={styles.assetToggleButton}/>
                        </View>
                        <Button title="Send Asset" onPress={this._sendAsset.bind(this)}/>

                        <Button title="Cancel" onPress={() => {
                            this.ShowModalFunction_S(!this.state.ModalVisibleStatus_S)
                        }}/>


                    </Modal>


                    <Modal visible={this.state.ModalVisibleStatus_R} onRequestClose={() => {
                        this.ShowModalFunction_R(!this.state.ModalVisibleStatus_R)
                    }}>
                        <View style={{flex: 1}}>


                            <View style={styles.addressView}>
                                <Text style={styles.textpublicAddress}>Your Public Neo Address:</Text>
                                <Text style={styles.textpublicAddress}>{this.props.address}</Text>
                            </View>
                            <View style={styles.addressRow}>
                                <QRCode
                                    value={this.props.address}
                                    size={200}
                                    bgColor='purple'
                                    fgColor='white'/>
                            </View>

                            <Button title="Cancel" onPress={() => {
                                this.ShowModalFunction_R(!this.state.ModalVisibleStatus_R)
                            }}/>
                        </View>

                    </Modal>
                    <View style={styles.content}>
                        <View style={styles.coinCountView}>
                            <Text style={styles.coinCountLabel}>YEZ</Text>
                            <Text style={[styles.coinCountValue, this.props.pendingBlockConfirm ? styles.pendingConfirm : null]}>
                            {neo ? formatNEO(neo) : '-'}
                            </Text>
                        </View>
                        <View style={styles.refreshButtonView}>
                            <FAIcons name="refresh" size={24} style={styles.refreshButton} />
                        </View>
                        <View style={styles.coinCountView}>
                            <Text style={styles.coinCountLabel}>${currencyCode}</Text>
                            <Text style={[styles.coinCountValue, this.props.pendingBlockConfirm ? styles.pendingConfirm : null]}>
                            {invalidPrice ? '-' :formatFiat(neoValue)}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => {
                        this.ShowModalFunction_S(true)
                    }}>
                        <View style={styles.button}>
                            <Text style={styles.whiteFont}>Send</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                        this.ShowModalFunction_R(true)
                    }}>
                        <View style={styles.button}>
                            <Text style={styles.whiteFont}>Recieve</Text>
                        </View>
                    </TouchableOpacity>
                </Image>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    dataInputView: {
        backgroundColor: '#E8F4E5',
        flex:1,
        paddingBottom: 10
    },
    content: {
        flexDirection: 'row',
        marginTop:20,
        marginBottom:20
    },
    coinCountView: {
        flexDirection: 'column',
        flex: 0.35,
        alignItems: 'center' // horizontal
    },
    coinCountLabel: {
        fontSize: 14,
        fontWeight: '300',
        color:'#FFF'
    },
    coinCountValue: {
        fontSize: 40,
        fontWeight: '200',
        color:'#FFF'
    },
    dialogText:{
        marginTop:5,
    },
    refreshButtonView: {
        flexDirection: 'column',
        flex: 0.3,
        alignItems: 'center', // horizontal
        justifyContent: 'center'
    },
    refreshButton: {
        color: '#4D933B'
    },
    button:{
        backgroundColor: "hsl(119,139,61) rgb(28,102,100)",
        alignItems: 'center',
        paddingVertical: 20,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30
    },
    addressRow1:{
        flexDirection: 'row',
        alignItems: 'center', // vertical
        marginVertical: 5

    },

    input: {
        flex: 1,
        fontSize: 20,
      },
      whiteFont: {
        color: '#00000'
      },

    addressRow: {
        flexDirection: 'row',
        alignItems: 'center', // vertical
        marginVertical: 5
    },
    addressBook: {
        backgroundColor: '#236312',
        padding: 5,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20
    },
    inputBox: {
        marginHorizontal: 20,
        marginVertical: 5,
        paddingHorizontal: 10,
        height: 36,
        fontSize: 14,
        flex: 1
    },
    assetToggleButton: {
        height: 30,
        marginLeft: 0,
        marginRight: 20,
        marginTop: 0,
        flex: 1,
        backgroundColor: '#236312'
    },
    centerText: {
        flex: 1,
        fontSize: 18,
        padding: 32,
        color: '#777',
      },

 
    ModalInsideView:{
     
      justifyContent: 'center',
      alignItems: 'center', 
      backgroundColor : "#00BCD4", 
      height: 300 ,
      width: '90%',
      borderRadius:10,
      borderWidth: 1,
      borderColor: '#fff'
     
    },
 
    TextStyle:{
     
      fontSize: 20, 
      marginBottom: 20, 
      color: "#fff",
      padding: 20,
      textAlign: 'center'
     
    },
    textAddress: {
        fontSize: 12,
        textAlign: 'center'
    },
    qrcode:{
        alignItems: 'center', 
        marginTop:10
    },
    textpublicAddress:{
        marginTop: 10,
        fontSize: 15,
        textAlign: 'center'

    },
    textBold: {
      fontWeight: '500',
      color: '#000',
    },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
    whiteFont:{
        color:"#FFF"
    }
})

function mapStateToProps(state, ownProps) {
    return {
        address: state.wallet.address,
        neo: state.wallet.neo,
        gas: state.wallet.gas,
        neoPrice:state.wallet.neoPrice,
        currencyCode:state.wallet.currencyCode,
        name: state.wallet.name,
        uid: state.wallet.uid,
        updateAfterSend: state.wallet.updateSendIndicators,
        passphrase: state.wallet.passphrase,
        encryptedWIF: state.wallet.encryptedWIF,
        created:state.wallet.created
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreatorsExt(ActionCreators, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(AssetSendForm)
