import React from 'react'
import { Text,View, FlatList, StyleSheet,Picker, TouchableOpacity,Modal,Linking } from 'react-native'
import { connect } from 'react-redux'
import { bindActionCreatorsExt } from '../utils/bindActionCreatorsExt'
import { ActionCreators } from '../actions'
import GeneratedKeysView from '../components/GeneratedKeysView'
import UserSwitchButton from '../containers/UserSwitchButton'
import * as firebase from "firebase";


class Settings extends React.Component{

    static navigationOptions = ({ navigation }) => ({
        headerLeftOnPress: () => {
            // requires https://github.com/react-community/react-navigation/pull/1291
            //navigation.dispatch(resetState())
            navigation.state.params.updateState()
            navigation.goBack()
        },

        headerRight: <UserSwitchButton />

        // tabBarOnPress:({ jumpToIndex, scene })=>{
        //     navigation.state.params.getPassphrase()
            
        // }
    })

    constructor(props){
        super(props)
        this.state = {
            updateCurrency:false,
            currency:'',
            showWallet:false,
            passphrase:'',
            showOption:false,
            currencies:{}
        }
    }

    async componentDidMount(){
        var snap=await firebase.database().ref('currencies/').once('value')
      
        if(snap.val()){
            this.setState({
            currencies:snap.val()
            })
        }
          
        this.props.navigation.setParams({ updateState: this._updateState });
        this.props.navigation.setParams({ getPassphrase: this._getPassphrase });
        if(this.props.roleType ==='Advance'){
            this.setState({
                showOption:true
            })
        }
    }

    _updateState = () => {
        this.setState({
            updateCurrency:false,
            showWallet:false
        })
      };

      _getPassphrase = () => {

        alert('Cool1')
        this.setState({
            passphrase:'Test'
        })
      };
    

    showCurrencies=()=>{
        this.setState({
            updateCurrency:true
        })
    }

    _showWallet=()=>{
        this.setState({
            showWallet:true
        })
        
    }

    _updateCurrency=()=>{
        this.setState({
            updateCurrency:true
        })
    }

    FlatListItemSeparator = () => {
        return (
          <View
            style={{
              height: 1,
              width: "100%",
              backgroundColor: "#607D8B",
            }}
          />
        );
      }
     
      GetItem (code,symbol) {    
      this.props.wallet.updateCurrency(code,symbol)
      this.setState({
          updateCurrency:false
      })  
      }

    render(){
        //const currencies = ['AUD', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'USD', 'ZAR']
        const{wif,encryptedWIF,passphrase,address,uid,name}=this.props
        const {currencies}=this.state     

        var data = Object.keys(currencies).map(key=> {
            return {
              code: key,
              symbol: currencies[key].symbol
            };
          });
        console.log(data)
        if(!this.state.updateCurrency && !this.state.showWallet){
        return(
            <View style={styles.dataInputView}>
                
                    <TouchableOpacity onPress={() => {this._showWallet()}}>
                        <View style={styles.button}>
                            <Text style={styles.whiteFont}>Show Wallet Info</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {this._updateCurrency()}}>
                        <View style={styles.button}>
                            <Text style={styles.whiteFont}>Choose Default Currency</Text>
                        </View>
                    </TouchableOpacity>
                
            </View>
        )
    }
    else if(this.state.updateCurrency){
        return(
            <View style={styles.MainContainer}>
  
       <FlatList     
          data={ data }
          ItemSeparatorComponent = {this.FlatListItemSeparator}
          renderItem={({item}) => <Text style={styles.item} onPress={this.GetItem.bind(this, item.code,item.symbol)} > {item.code}({item.symbol}) </Text>}
          keyExtractor={(item, index) => index}
         />
    
    
</View>
        )
    }

    else if(this.state.showWallet){
        return(
            <View style={styles.MainContainer}>
            
                <GeneratedKeysView
                        wif={wif}
                        passphrase={passphrase}
                        address={address}
                        encryptedWIF={encryptedWIF}
                    />

            </View>
        )
    }
    }
}


const styles = StyleSheet.create({
    dataInputView: {
        backgroundColor: '#E8F4E5',
        flex:1,
        paddingBottom: 10
    },
  
    MainContainer :{
 
        // Setting up View inside content in Vertically center.
        justifyContent: 'center',
        flex:1,
        margin: 10
         
        },
         
        item: {
            padding: 10,
            fontSize: 18,
            height: 44,
          },
          
    button:{
        backgroundColor: "hsl(119,139,61) rgb(28,102,100)",
        alignItems: 'center',
        paddingVertical: 20,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30
    },
    
    whiteFont:{
        color:"#FFF"
    },
    container: {
        flex: 1,
        marginTop: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
      },
      h2text: {
        marginTop: 10,
        fontFamily: 'Helvetica',
        fontSize: 36,
        fontWeight: 'bold',
      },
      flatview: {
        justifyContent: 'center',
        paddingTop: 30,
        borderRadius: 2,
      },
      name: {
        fontFamily: 'Verdana',
        fontSize: 18
      },
      email: {
        color: 'red'
      }
})


function mapStateToProps(state, ownProps) {
    return {
        address: state.wallet.address,
        wif:state.wallet.wif,
        name: state.wallet.name,
        uid: state.wallet.userId,
        passphrase: state.wallet.passphrase,
        encryptedWIF: state.wallet.encryptedWIF,
        created:state.wallet.created,
        roleType:state.wallet.roleType
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreatorsExt(ActionCreators, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
