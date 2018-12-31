import React from 'react'
import { View, Text, StyleSheet,Clipboard } from 'react-native'
import PropTypes from 'prop-types'
import FAIcons from 'react-native-vector-icons/FontAwesome'
import { DropDownHolder } from '../utils/DropDownHolder'

class KeyDataRow extends React.Component {

    constructor(props){
        super(props)
        this.dropdown = DropDownHolder.getDropDown()
    }

    copyToClipBoardText(text){
        const string=JSON.stringify(text)

        Clipboard.setString(string.replace(/['"]+/g, ''))
        this.dropdown.alertWithType('info', 'Success', 'Data copied to clipboard.')
    }

    render() {
        return (
            <View style={styles.dataRow}>
                <Text style={styles.dataItem}>{this.props.title}: </Text>
                <Text>{this.props.value}</Text>
                <FAIcons name="clipboard" style={styles.icon} size={15} onPress={()=>{
                                this.copyToClipBoardText(this.props.value)
                            }}/>
            </View>
        )
    }
}

KeyDataRow.propTypes = {
    title: PropTypes.string,
    value: PropTypes.string
}

const styles = StyleSheet.create({
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start', // horizontal
        flexWrap: 'wrap',
        marginHorizontal: 20,
        marginVertical: 5
    },
    dataItem: {
        fontWeight: 'bold'
    },
    icon:{
        marginHorizontal:5,
        marginVertical:4
    }

})

export default KeyDataRow
