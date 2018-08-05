import React, { Component } from 'react';
import {View,Text,StyleSheet,NativeModules,TouchableHighlight,} from 'react-native';
const FacebookUtil = NativeModules.FacebookUtil;

const globals = {
  login: 'Login with Facebook',
  logout: 'Logout from Facebook'
};

export default class LoginButton extends Component {
  constructor (props) {
    super(props);

    this.onLogin = this.onLogin.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);

    this.state = {
      globals: globals,
      status: false,
      text: globals.login
    };
  }

  onLogin() {
    if(this.state.status)
      this.logout()
    else
      this.login()
  }

  login() {
    let permissions = [];
    FacebookUtil.login(
      (err,data) => {
        console.log('returning fom loginWithPermissions')
        this.handleLogin(err,data)
      }
    );
  }

  logout() {
    FacebookUtil.logout((err, data) => {
      this.setState({status:false, text: this.state.globals.login});
      this.handleLogin(err, data);
    })
  }

  handleLogin(e, data) {
    const result = e || data;
    if(result.profile){
      try{
        result.profile = JSON.parse(result.profile)
        this.setState({status:true, text: this.state.globals.logout});
      } catch (err) {
        console.error(err);
      }
    }

    if(result.eventName && this.props.hasOwnProperty(result.eventName)){
      const event = result.eventName;
      delete result.eventName;
      this.props[event](result);
    }
  }
  
  render(){
    const text = this.state.text;
    return (
      <TouchableHighlight activeOpacity={.5} onPress={this.onLogin}  >
         <View style={[styles.button]}>
          <Text style={[styles.signupLinkText]}>{text}</Text>
        </View>
      </TouchableHighlight>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#3B5998",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  whiteText: {
    color: 'white'
  },
  signupLinkText: {
    color: "#FFF",
    marginLeft: 5,
  }
});
