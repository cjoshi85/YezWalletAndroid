import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet,BackHandler,DeviceEventManager } from 'react-native'
import { NavigationActions } from 'react-navigation'
import RNExitApp from 'react-native-exit-app';
import FAIcons from 'react-native-vector-icons/FontAwesome'
import Button from '../../components/Button'
import Spacer from '../../components/Spacer'
import NetworkSwitchButton from '../../containers/NetworkSwitchButton'
import AssetSendForm from '../../containers/AssetSendForm'
import ClaimProgressIndicator from '../../containers/ClaimProgressIndicator'
import { nDecimalsNoneZero } from '../../utils/walletStuff'

import { AsyncStorage } from 'react-native'
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';

// redux
import { connect } from 'react-redux'
import { bindActionCreatorsExt } from '../../utils/bindActionCreatorsExt'
import { ActionCreators } from '../../actions'
import * as firebase from "firebase";



class WalletInfo extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        headerLeft: (
            <TouchableOpacity
                onPress={() => {
                    navigation.state.params.handleLogout()
                }}
                style={styles.headerButton}
            >
                <Text style={styles.headerButtonText}>Logout</Text>
            </TouchableOpacity>
        ),
        headerRight: <NetworkSwitchButton />
    })

    constructor(props) {
        super(props)
        this.state = {
            claimStarted: false
        }

        
    }

    componentDidMount() {

        //this.logout.bind(this)
    
        this.props.navigation.setParams({ handleLogout: this._logout.bind(this) })
    }

    componentWillMount() {
         BackHandler.addEventListener('hardwareBackPress', this.backPressed);
     }
     
     componentWillUnmount() {
         BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
     }

     backPressed = () => {
        //const s = this.props.navigation
        
        const backAction = NavigationActions.back({
            key: 'Loading'
          }) 
        this.props.wallet.resetState()
        //DeviceEventManager.invokeDefaultBackPressHandler()
        //BackHandler.exitApp()
        RNExitApp.exitApp();
        //this.props.navigation.dispatch(backAction)
        //return true;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.gasClaimConfirmed == true) {
            // flow is done, we can reset now
            this.setState({ claimStarted: false })
        }
    }


    async _logout() {
       // this.props.wallet.logout()
       try {        
        const g_user = await GoogleSignin.currentUserAsync();
        if(g_user){
    //        alert('Removing google Account')
            await GoogleSignin.revokeAccess();
            
            await GoogleSignin.signOut();
        }

        let user = await firebase.auth().currentUser

        if(user){
    //        alert('Removing firebase account')
            await firebase.auth().signOut();
        }


        await AsyncStorage.removeItem('user_id');
        await AsyncStorage.removeItem('wif');
        await AsyncStorage.removeItem('encryptedWIF');
        await AsyncStorage.removeItem('passphrase');
     //   alert('Done'+user)
        this.props.wallet.logout()
        // this.props.navigation.navigate('Loading')
         
        

    } catch (error) {
        alert(error)
    }

    }
    _claim() {
        // avoid unnecessary network call
        if (this.props.claimAmount > 0) {
            this.props.wallet.claim()
            this.setState({ claimStarted: true })
        }
    }

    render(){
        return(
            <View style={styles.container}>
            <AssetSendForm />
            </View>
        )
    }

}

const styles = StyleSheet.create({
    headerButton: {
        marginHorizontal: 10,
        flexDirection: 'row'
    },
    headerButtonText: {
        color: 'white'
    },
    container: {
        flex: 1
    },
    addressView: {
        marginTop: 10
    },
    textAddress: {
        fontSize: 12,
        textAlign: 'center'
    },
    content: {
        flexDirection: 'row'
    },
    coinCountView: {
        flexDirection: 'column',
        flex: 0.35,
        alignItems: 'center' // horizontal
    },
    coinCountLabel: {
        fontSize: 14,
        fontWeight: '300'
    },
    coinCountValue: {
        fontSize: 40,
        fontWeight: '200'
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
    fiatView: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    fiatValue: {
        fontWeight: '300'
    },
    pendingConfirm: {
        color: '#939393'
    },
    pendingView: {
        flexDirection: 'row',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    invisible: {
        color: 'white'
    },
    claimProgress: {
        marginLeft: 30,
        opacity: 0.5
    }
})

function mapStateToProps(state, ownProps) {
    return {
        address: state.wallet.address,
        neo: state.wallet.neo,
        gas: state.wallet.gas,
        price: state.wallet.price,
        claimAmount: state.wallet.claimAmount,
        pendingBlockConfirm: state.wallet.pendingBlockConfirm,
        gasClaimConfirmed: state.claim.gasClaimConfirmed
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreatorsExt(ActionCreators, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletInfo)
