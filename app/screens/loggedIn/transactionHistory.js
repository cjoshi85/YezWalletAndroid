import React from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import { nDecimalsNoneZero } from '../../utils/walletStuff'
import { isZero } from '../../core/math';
import { ASSETS } from '../../core/constants';

class TransactionHistory extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        headerLeft: null
    })

    _renderRow(item) {
        const tx = item.item
        debugger
        return (
            <View style={styles.txRow}>
                <View style={styles.txId}>
                    <Text>{tx.txid.slice(0, 15)}..</Text>
                </View>
                {this.renderAmount(tx)}
            </View>
        )
    }

    renderAmount=(tx)=>{
        if(!isZero(tx[ASSETS.NEO])||isZero(tx[ASSETS.GAS])){
        return(
            <View style={styles.txValue}>
                <Text style={styles.bigText}>{nDecimalsNoneZero(tx[ASSETS.NEO], 6)}</Text>
                <Text style={styles.bigText}>YEZ</Text>
            </View>
        )
    }
        else if(!isZero(tx[ASSETS.GAS])){
            <View style={styles.txValue}>
                <Text style={styles.bigText}>{nDecimalsNoneZero(tx[ASSETS.GAS], 6)}</Text>
                <Text style={styles.bigText}>{ASSETS.GAS}</Text>
            </View>
        }
    }
    

    _renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    backgroundColor: '#CED0CE'
                }}
            />
        )
    }

    render() {
        const background = require("../../img/background.png");
        debugger
        return (
            <View>
                
                <FlatList
                    ItemSeparatorComponent={this._renderSeparator}
                    data={this.props.transactions}
                    renderItem={this._renderRow.bind(this)}
                    keyExtractor={item => item.txid}
                />
                
            </View>
        )
    }
}

const styles = StyleSheet.create({
    txRow: {
        flexDirection: 'row',
        marginHorizontal: 30,
        height: 48
    },
    txId: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    txText: {
        fontSize: 10,
        fontFamily: 'courier new'
    },
    txValue: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    bigText: {
        fontSize: 20,
        marginLeft: 5,
        fontFamily: 'courier'
    }
})

function mapStateToProps(state, ownProps) {
    return {
        transactions: state.wallet.transactions
    }
}

export default connect(mapStateToProps)(TransactionHistory)
