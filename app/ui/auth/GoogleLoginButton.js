import React, { Component } from 'react';
import {View,Text,StyleSheet,NativeModules,TouchableHighlight,Image, } from 'react-native';
const GoogleUtil = NativeModules.GoogleUtil;

export default class GoogleLoginButton extends Component {
    constructor (props) {
        super(props);
    
        this.onLogin = this.onLogin.bind(this);
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    
        this.state = {
          status: false,
          text: 'Sign out'
        };
      }

      onLogin() {
        if(this.state.status)
          this.logout()
        else
          this.login()
      }
    
      login() {
        GoogleUtil.setup()
        .then(() => {
          GoogleUtil.login(
            (err,data) => {
              this.handleLogin(err,data)
            }
          );
        });
      }
    
      logout() {
        GoogleUtil.logout((err, data) => {
          this.setState({status:false});
          this.handleLogin(err, data);
        })
      }
    
      handleLogin(e, data) {
        const result = e || data;
        if (result.eventName == "onLogin") {
          this.setState({status:true});
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
      <View style={styles.button}>
        
         <Text style={[styles.signupLinkText]}>Login with Google</Text>
        </View>
      </TouchableHighlight>

          // <TouchableHighlight style={styles.fullWidthButton} onPress={this.onLogin}  >
          //   {(this.state.status == false) ? 
          //     <Image source={require('../../img/btn_google_signin_light_normal_web.png')}  />
          //     : <View style={[styles.button]}>
          //     <Image source={require('../../img/btn_google_light_normal_ios.png')}  />
          //         <Text style={[styles.black]}>{text}</Text>
          //       </View>
          //     }   
          // </TouchableHighlight>
        )
      }
}

const styles = StyleSheet.create({

  button: {
    backgroundColor: "#DB4437",
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