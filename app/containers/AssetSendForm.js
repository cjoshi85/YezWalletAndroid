import React from 'react'
import { Text,View, TextInput, StyleSheet,Image, TouchableOpacity,Modal,ScrollView,Clipboard } from 'react-native'
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
import { NavigationActions } from 'react-navigation'
// redux
import { connect } from 'react-redux'
import { bindActionCreatorsExt } from '../utils/bindActionCreatorsExt'
import { ActionCreators } from '../actions'
import { AsyncStorage } from 'react-native'
import NeoBalanceForm from './NeoBalanceForm';

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
backPressed = () => {
    const s = this.props.navigation
    const backAction = NavigationActions.back({
        key: null
      }) 
    return true;
}

  async componentDidMount(){
    if(this.props.created){ 
        await AsyncStorage.setItem('encryptedWIF',this.props.encryptedWIF)
        await AsyncStorage.setItem('passphrase',this.props.passphrase)
        if(this.props.wif){
        await AsyncStorage.setItem('wif',this.props.wif)
        }
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

      _UpdateState=()=>{
          
        this.setState({
              refreshingState:true
          })
        this.props.wallet.updateState()
      }

      componentDidUpdate(){
        
        if(this.props.sendingAsset && this.state.ModalVisibleStatus_S){
            this.closeSendModal()
        }

        if(this.props.updatingState && this.state.refreshingState){
            this.dropdown.alertWithType(
                'info',
                'Info',
                'Retrieving latest BlockChain Information.'
            )
         }

         if(this.props.updatedState && this.state.refreshingState){
            this.dropdown.alertWithType(
                'success',
                'Success',
                'Retrieved latest BlockChain Information.'
            )
            setTimeout(()=>{
                this.setState({
                    refreshingState:false
                })
            },1000)
         }
        
    }

    _isValidInputForm(address, amount, assetType) {
        let result = true
        const balance = assetType == ASSET_TYPE.YEZ ? this.props.yez : this.props.gas
        if (address == undefined || address.length <= 0 || isValidPublicAddress(address) != true || address.charAt(0) !== 'A') {
            this.dropdown.alertWithType('error', 'Error', 'Not a valid destination address')
            result = false
        } else if (amount == undefined || amount <= 0) {
            this.dropdown.alertWithType('error', 'Error', 'Invalid amount')
            result = false
        } else if (amount > balance) {
            this.dropdown.alertWithType('error', 'Error', 'Not enough ' + `${assetType}`)
            result = false
        } else if (assetType == ASSET_TYPE.YEZ && parseFloat(amount) !== parseInt(amount)) {
            this.dropdown.alertWithType('error', 'Error', 'Cannot not send fractional amounts of ' + `${assetType}`)
            result = false
        }
        return result
    }

    _sendAsset() {
        const address = this.state.address
        const amount = this.txtInputAmount._lastNativeText
        // TODO: add confirmation (modal?)
        if (this._isValidInputForm(address, amount, 'YEZ')) {
        //    alert(address+' '+amount+' '+assetType)
                this.props.wallet.sendAsset(address, amount, 'YEZ')
        }
    }

    copyToClipBoardText(text){
        const string=JSON.stringify(text)

        Clipboard.setString(string.replace(/['"]+/g, ''))
        this.dropdown.alertWithType('info', 'Success', 'Data copied to clipboard.')
    }
    handleDialogCancel = () => {
        this.setState({ dialogVisible: false });
    };

    handleDialogDelete = () => {
        this.setState({ dialogVisible: false });
    };

    closeSendModal=()=>{
        this.dropdown.alertWithType(
            'info',
            'Info',
            'Sending YezCoin...'
        )
        this.setState({
            ModalVisibleStatus_S:false
        })
    }

   render(){
        const background = require("../img/background.png");
        const {currencyCode,symbol,yez,yezPrice,roleType}=this.props
         const yezValue = yezPrice && yez && yez !== '0'
         ? toBigNumber(yezPrice).multipliedBy(yez) : toBigNumber(0)
         const invalidPrice = isNil(yezPrice)
         const advance=roleType==='Advance'?true:false
        return (
        <View style={styles.dataInputView}>
            <Image source={background} style={{width: null, height: '100%'}} resizeMode="cover">
                <ScrollView>
                    <Modal
                        visible={this.state.ModalVisibleStatus_S}
                        animationType="slide"              
                        onRequestClose={() => {
                            this.ShowModalFunction_S(!this.state.ModalVisibleStatus_S)
                        }}>
                        <View style={styles.sendView}>
                        <Text style={styles.scanText}>Scan or Type(send-to address)</Text>
                        </View>
                        <QRCodeScanner
                            onRead={this.onSuccess.bind(this)}
                            containerStyle={styles.sendView}
                        />
                        <View style={styles.sendView}>
                        <View style={styles.addressRow}>
                            <TextInput
                                ref={(ref) => {
                                    this.FirstInput = ref;
                                }}
                                onChangeText={(value) => this.setState({'address': value})}
                                value={this.state.address}
                                multiline={false}
                                placeholder="Where to send the Yezcoin (address)"
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
                                keyboardType='numeric'
                                placeholderTextColor="#636363"
                                returnKeyType="done"
                                style={styles.inputBox}
                                autoCorrect={false}
                            />
                            <Button  title={this.state.selectedAsset} 
                                    // onPress={this._toggleAsset.bind(this)}
                                    style={styles.assetToggleButton}/>
                        </View>
                        <Button style={{ backgroundColor: "hsl(119,139,61) rgb(67, 90, 98)", borderRadius:10 }} title="Send Yezcoin" onPress={this._sendAsset.bind(this)}/>
                        <Button style={{ backgroundColor: "hsl(119,139,61) rgb(67, 90, 98)", borderRadius:10, marginBottom: 15 }} title="Cancel" onPress={() => {
                            this.ShowModalFunction_S(!this.state.ModalVisibleStatus_S)
                        }}/>
                        </View>
                    </Modal>
                    <Modal 
                    visible={this.state.ModalVisibleStatus_R} 
                    animationType="slide"          
                    onRequestClose={() => {
                        this.ShowModalFunction_R(!this.state.ModalVisibleStatus_R)
                    }}
                    >
                        <View style={{flex: 1, zIndex:1000,backgroundColor:'#E8F4E5'}}>
                            <View style={styles.addressView}>
                                <Text style={styles.textpublicAddress}>Your Public Neo Address:</Text>
                                <Text style={styles.textpublicAddress}>{this.props.address}</Text>
                                <FAIcons name="clipboard" style={styles.icon} size={15} onPress={()=>{
                                this.copyToClipBoardText(this.props.address)
                            }}/>
                            </View>
                            <View style={styles.addressRow1}>
                                <QRCode
                                    value={this.props.address}
                                    size={200}
                                    bgColor='black'
                                    fgColor='#E8F4E5'/>
                            </View>
                            <Button style={{ backgroundColor: "hsl(119,139,61) rgb(67, 90, 98)", borderRadius:10 }}  title="Cancel" onPress={() => {
                                this.ShowModalFunction_R(!this.state.ModalVisibleStatus_R)
                            }}/>
                        </View>
                    </Modal>
                    <View style={styles.content}>
                        <View style={styles.coinCountView}>
                            <Text style={styles.coinCountLabel}>YEZ</Text>
                            <Text style={[styles.coinCountValue, this.props.pendingBlockConfirm ? styles.pendingConfirm : null]}>
                            {yez ? formatNEO(yez) : '-'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.content}>
                        <View style={styles.refreshButtonView} >
                            <FAIcons name="refresh" size={24} style={styles.refreshButton} onPress={()=>{
                                this._UpdateState()
                            }}/>
                        </View>
                    </View>          
                    <View style={styles.content}>
                        <View style={styles.coinCountView}>
                            <Text style={styles.coinCountLabel}>Total({currencyCode})</Text>
                            <Text style={[styles.coinCountValue, this.props.pendingBlockConfirm ? styles.pendingConfirm : null]}>
                            {symbol}{invalidPrice ? '-' :formatFiat(yezValue)} 
                            </Text>
                        </View>
                    </View>
                    <View style={styles.buttonContainer}>  
                        <View style={{flex:1,marginLeft:5}}>
                            <TouchableOpacity onPress={() => {
                                this.ShowModalFunction_S(true)
                                }}>
                                <View style={styles.button}>
                                    <Text style={styles.whiteFont}>Send</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{flex:1,marginLeft:5,marginRight:5}}>
                            <TouchableOpacity onPress={() => {
                                this.ShowModalFunction_R(true)
                                }}>
                                <View style={styles.button}>
                                    <Text style={styles.whiteFont}>Recieve</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                  { advance && <View style= {{borderTopWidth:2,borderTopColor:'white',marginTop:10}} >
                        <NeoBalanceForm/>
                    </View> 
                  }
                </ScrollView>
            </Image>    
        </View> 
        )
    }
}

const styles = StyleSheet.create({
    dataInputView: {
        backgroundColor: '#E8F4E5',
        flex:1,
        
    },
    icon:{
        marginHorizontal:10,
        marginVertical:25,
    },
    content: {
        flexDirection: 'row',
        marginTop:10,
        marginBottom:10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    coinCountView: {
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        overflow:'visible'
         // horizontal
    },
    scanText:{
        alignItems:'center',
        justifyContent: 'center',
        textAlign: 'center',
        marginTop:10
    },
    addressView: {
        flexDirection: 'row',
        justifyContent: 'center', // horizontal
        flexWrap: 'wrap',
        marginHorizontal: 20,
        marginVertical: 5
    },
    coinCountLabel: {
        fontSize: 14,
        fontWeight: '300',
        color:'#FFF'
    },
    coinCountValue: {
        fontSize: 30,
        fontWeight: '300',
        color:'#FFF'
    },
    dialogText:{
        marginTop:5,
    },
    refreshButtonView: {
        flexDirection: 'row',
        alignItems: 'center', // horizontal       
    },
    refreshButton: {
        color: '#FFF'
    },
    buttonContainer: {
        flex: 0.4,
        flexDirection: 'row',        
      },
    button:{
        backgroundColor: "hsl(119,139,61) rgb(67, 90, 98)",
        alignItems: 'center',
        paddingVertical: 20,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30
    },
    input: {
        flex: 1,
        fontSize: 20,
      },
      whiteFont: {
        color: '#00000'
      },

    addressRow1: {
        flexDirection: 'row',
        alignItems: 'center', // vertical
        marginVertical: '30%',
        marginHorizontal:'25%'
    },
    sendView:{
        backgroundColor: '#E8F4E5',
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
        height: 50,
        fontSize: 14,
        flex: 1,
        color:'#000'
    },
    assetToggleButton: {
        height: 30,
        marginLeft: 0,
        marginRight: 20,
        marginTop: 0,
        flex: 1,
        backgroundColor: "hsl(119,139,61) rgb(67, 90, 98)",
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
        marginTop: 20,
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
        yez: state.wallet.yez,
        yezPrice: state.wallet.yezPrice,
        neoPrice:state.wallet.neoPrice,
        currencyCode:state.wallet.currencyCode,
        name: state.wallet.name,
        uid: state.wallet.uid,
        updateAfterSend: state.wallet.updateSendIndicators,
        passphrase: state.wallet.passphrase,
        encryptedWIF: state.wallet.encryptedWIF,
        created:state.wallet.created,
        symbol:state.wallet.symbol,
        updatingState:state.wallet.updatingState,
        updatedState:state.wallet.updatedState,
        sentAsset:state.wallet.sentAsset,
        sendingAsset:state.wallet.sendingAsset,
        wif:state.wallet.wif,
        roleType:state.wallet.roleType
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreatorsExt(ActionCreators, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(AssetSendForm)
