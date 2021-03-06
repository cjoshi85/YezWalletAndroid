import React from 'react'
import { StyleSheet, Platform, Image,ActivityIndicator, Text, View } from 'react-native'


import { bindActionCreatorsExt } from '../utils/bindActionCreatorsExt'
import { connect } from 'react-redux'
import { ActionCreators } from '../actions'
import Database from "./firebase/database";
import { AsyncStorage } from 'react-native';


class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      address: "",
      generating: true,
      uid: "",
      passphrase: "",
      privateKey: "",
      encryptedKey:""
    };
  }

  async componentDidMount() {
  
    const user_id = await AsyncStorage.getItem('user_id');
    const privateKey=await AsyncStorage.getItem('wif');
    const encryptedKey=await AsyncStorage.getItem('encryptedWIF');
    const passphrase=await AsyncStorage.getItem('passphrase');
    debugger
    if (user_id && privateKey) {
      this.setState({
        uid: user_id,
        privateKey,
        generating: false
      })
    }

    else if(user_id && encryptedKey && passphrase){
        this.setState({
          uid: user_id,
          encryptedKey,
          passphrase,
          generating: false
        })
    }

  }

  async _walletLogin() {
    const {uid,privateKey,encryptedKey,passphrase}=this.state
    debugger
    try {
      if (uid && privateKey) {
        this.props.wallet.loginWithPrivateKey(privateKey,uid)
        this.setState({
          generating: true
        })
      }
      else if(uid && encryptedKey && passphrase){
        this.props.wallet.login(encryptedKey,passphrase,uid)
        this.setState({
          generating: true
        })
      }
    } catch (error) {
      alert(error)
    }

  }

  _renderBarIndicator() {
    return (
      <View style={styles.indicatorView}>
          <ActivityIndicator size="large" color="#228B22"/>
        <Text style={styles.indicatorText}>Logging in...</Text>
      </View>
    )
  }

  render() {

    if (this.state.generating) {

      render = this._renderBarIndicator();
    }
    if (!this.state.generating) {
      this._walletLogin()
    }

    return (

      <View style={styles.container}>
      
       {render}

      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: '#228B22',
    fontWeight: 'bold'
  }
})

function mapStateToProps(state, ownProps) {
  return {

    generating: state.wallet.generating
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreatorsExt(ActionCreators, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)