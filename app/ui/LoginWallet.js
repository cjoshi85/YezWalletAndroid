import React from 'react'
import { Text,View, StyleSheet,Image, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreatorsExt } from '../utils/bindActionCreatorsExt'
import { ActionCreators } from '../actions'

class LoginWallet extends React.Component{
    constructor(props){
        super(props)
    }

    _goToScreen=(screenName)=>{
        this.props.navigation.navigate(screenName)
    }

    render(){
        const background = require("../img/background.png");
        return(
            <View style={styles.dataInputView}>
                <Image source={background} style={{width: null, height: '100%'}} resizeMode="cover">
                <TouchableOpacity onPress={() => {
                        this._goToScreen('LoginWithEncryptedKey')
                    }}>
                        <View style={styles.button}>
                            <Text style={styles.whiteFont}>Login With Encrypted Key</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                        this._goToScreen('LoginWithPrivateKey')
                    }}>
                        <View style={styles.button}>
                            <Text style={styles.whiteFont}>Login With Private Key</Text>
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
   
    button:{
        alignItems: 'center',
        paddingVertical: 20,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30,
        backgroundColor: "hsl(119,139,61) rgb(67, 90, 98)", 
        borderRadius:10,
        marginLeft: 10,
        marginRight: 10
    },
    
      whiteFont: {
        color: '#FFF'
      },

   
})

function mapStateToProps(state, ownProps) {
    return {

    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreatorsExt(ActionCreators, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginWallet)
