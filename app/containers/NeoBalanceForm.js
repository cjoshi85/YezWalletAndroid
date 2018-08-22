import React from 'react'
import { Text,View, StyleSheet,ScrollView} from 'react-native'
import { isNil,omit } from 'lodash'
import { formatBalance } from '../core/formatters';
import { toBigNumber } from '../core/math'

// redux
import { connect } from 'react-redux'
import { bindActionCreatorsExt } from '../utils/bindActionCreatorsExt'
import { ActionCreators } from '../actions'

class NeoBalanceForm extends React.Component {
    constructor(props) {
        super(props)
        
    }

    getTokenBalances = (balances)=> {
        const tokens = omit(balances, 'YEZCOIN', 'NEO','GAS')
        return tokens
      }

   render(){
        const {neo,neoPrice,gas,gasPrice,currencyCode,currencySymbol}=this.props
        const neoValue = neoPrice && neo && neo !== '0'
         ? toBigNumber(neoPrice).multipliedBy(neo) : toBigNumber(0)
         const gasValue = gasPrice && gas && gas !== '0'
         ? toBigNumber(gasPrice).multipliedBy(gas) : toBigNumber(0)
   
         const totalValue = neoValue.plus(gasValue)
        //  const invalidPrice = isNil(neoPrice)
          const displayCurrencyCode = (currencyCode||'USD').toUpperCase()
          const displayCurrencySymbol = (currencySymbol||'$')

          const tokenBalances=this.getTokenBalances(this.props.tokenBalances)
         

        return ( 
            <View>
            <View>
                <View style={styles.content}>
                    <View style={styles.coinCountView}>
                        <Text style={styles.coinCountLabel}>NEO</Text>
                        <Text style={[styles.coinCountValue, this.props.pendingBlockConfirm ? styles.pendingConfirm : null]}>
                            {neo}
                        </Text>
                    </View>
                    <View style={styles.coinCountView}>
                        <Text style={styles.coinCountLabel}>GAS</Text>
                        <Text style={styles.coinCountValue}>
                            {gas}
                        </Text>
                    </View>
                </View>
            
                <View style={styles.fiatView}>
                    <Text style={styles.fiatValue}>{displayCurrencySymbol}{totalValue.toFixed(2)} {displayCurrencyCode}</Text>
                </View>

                <View style={{borderBottomWidth: 2,borderBottomColor:'white',marginTop:5}}></View>

                </View>
                <View style={{marginTop:5}}>

                    <View style={styles.content}>
                        <View style={styles.coinCountView}>
                            <Text style={styles.coinCountLabel}>Token</Text>
                        </View>
                        <View style={styles.coinCountView}>
                            <Text style={styles.coinCountLabel}>Balance</Text>
                        </View>
                    </View>

                    <View style={{borderBottomColor:'white',borderBottomWidth:1.5,marginLeft:30,marginRight:30,marginTop:5}}>

                    </View>

                    {
        Object.keys(tokenBalances).map((key) => {
        const balance=tokenBalances[key].balance.toString()
        const formattedBalance = formatBalance(key, balance,true)
        return (
            <View>
                
            <View style={styles.content}>
                    
                <View style={styles.coinCountView}>
                            <Text style={styles.coinCountLabel}>{key}</Text>
                </View>
                <View style={styles.coinCountView}>
                          <Text style={styles.coinCountLabel}>{formattedBalance}</Text>
                </View>
                
            </View>
            <View style={{borderBottomColor:'white',borderBottomWidth:1,marginLeft:30,marginRight:30,marginTop:5}}></View>
            
            </View>
            
           
        )
      })}

                </View>
        </View>

        )
    }
}

const styles = StyleSheet.create({

    container: {
        flex: 1
    },

    content: {
        flexDirection: 'row',
    },
    coinCountView: {
        flexDirection: 'column',
        flex: 0.50,
        alignItems: 'center',
        marginTop:10 // horizontal
    },
    coinCountLabel: {
        color:'white',
        fontSize: 16,
        fontWeight: '300'
    },
    coinCountValue: {
        color:'white',
        fontSize: 40,
        fontWeight: '200'
    },

    fiatView: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    fiatValue: {
        fontWeight: '300',
        color: 'white'
    },
    pendingConfirm: {
        color: '#939393'
    },

})


function mapStateToProps(state, ownProps) {
    return {
        neo: state.wallet.neo,
        gas: state.wallet.gas,
        neoPrice:state.wallet.neoPrice,
        gasPrice:state.wallet.gasPrice,
        currencyCode:state.wallet.currencyCode,
        currencySymbol:state.wallet.symbol,
        tokenBalances:state.wallet.tokenBalances
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreatorsExt(ActionCreators, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(NeoBalanceForm)
