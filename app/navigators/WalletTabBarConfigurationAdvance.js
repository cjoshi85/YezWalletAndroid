import React from 'react'
import { TabNavigator, TabBarBottom } from 'react-navigation'
import FAIcons from 'react-native-vector-icons/FontAwesome'
import ENTIcons from 'react-native-vector-icons/Entypo'
import WalletInfo from '../screens/loggedIn/walletInfo'
import TransactionHistory from '../screens/loggedIn/transactionHistory'
import CreateWallet from '../screens/createWallet.js'
import Settings from '../ui/Settings'

const routeConfiguration = {
    WalletInfoAdvance: {
        screen: WalletInfo,
        navigationOptions: {
            tabBarLabel: 'Wallet',
            headerTitle: 'YEZ Wallet',
            headerTitleStyle :{textAlign: 'center',alignSelf:'center'},
            tabBarIcon: ({ tintColor, focused }) => <ENTIcons name={'wallet'} size={24} style={{ color: tintColor }} />
        }
    },
    TransactionHistory: {
        screen: TransactionHistory,
        navigationOptions: {
            tabBarLabel: 'Transaction history',
            headerTitle: 'Transaction history',
            tabBarIcon: ({ tintColor, focused }) => <FAIcons name="history" size={24} style={{ color: tintColor }} />
        }
    },

    Settings:{
        screen: Settings,
        navigationOptions:{
            tabBarLabel:'Settings',
            headerTitle:'Settings',
            tabBarIcon: ({ tintColor, focused }) => <FAIcons name="gear" size={24} style={{ color: tintColor }} />
        }
    },

    CreateWallet:{
        screen: CreateWallet,
        navigationOptions:{
            tabBarLabel: 'Create wallet',
            headerTitle: 'Create wallet',
            tabBarIcon: ({ tintColor, focused }) => <FAIcons name="save" size={24} style={{ color: tintColor }} />

        }

    }
}


const tabBarConfiguration = {
    // other configs
    tabBarOptions: {
        activeBackgroundColor: 'white',
        inactiveBackgroundColor: 'white',
        activeTintColor: '#4D933B', // label and icon color of the active tab
        inactiveTintColor: '#979797', // label and icon color of the inactive tab
        labelStyle: {
            // style object for the labels on the tabbar
            fontSize: 10,
            color: '#636363'
        },
        style: {
            // style object for the tabbar itself
            borderTopColor: '#979797', // seems to set the tabbar top border color on IOS
            borderTopWidth: 1.5
        }
    },
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom'
}

export const WalletTabBarAdvance = TabNavigator(routeConfiguration, tabBarConfiguration)
