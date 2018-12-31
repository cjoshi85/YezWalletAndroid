import React from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import moment from 'moment';
import { nDecimalsNoneZero } from '../../utils/walletStuff'
import { isZero } from '../../core/math';
import { ASSETS } from '../../core/constants';

class TransactionHistory extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        headerLeft: null
    })

    _renderRow(item) {
        const tx = item.item
        
        const date=moment(new Date(tx.time*1000)).format('MMMM Do YYYY, h:mm:ss a')
        return (
            <View style={styles.txRow}>
                <View style={styles.txId}>
                    <Text style={styles.txText}>{tx.txid}</Text>
                    </View>
                    <View style={styles.txId}>
                    <Text style={styles.bigText}>{tx.amount} {tx.asset}</Text>
                    </View>
                    <View style={styles.txId}>
                    <Text style={styles.bigText}>{date}</Text>
                </View>

                {/* {this.renderAmount(tx)} */}
            </View>
        )
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
        return (
            <View style={{backgroundColor:'#E8F4E5'}}>
                
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
        marginHorizontal: 5,
        height: 100
    },
    txId: {
        flex:1,
        flexDirection: 'row',
        alignItems: 'center',     
    },
    txText: {
        paddingTop:10,
        fontSize: 15,
        fontFamily: 'courier'
    },
    txValue: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    bigText: {
        paddingTop:5,
        fontSize: 15,
        fontFamily: 'courier',
        fontWeight: "bold"
    }
})

function mapStateToProps(state, ownProps) {
    return {
        transactions: state.wallet.transactions
    }
}

export default connect(mapStateToProps)(TransactionHistory)
