import React from 'react'
import { StackNavigator } from 'react-navigation'

// Screens

import Dashboard from '../ui/Dashboard.js'
import Loading from '../ui/Loading.js'
import LoginScreen from '../ui/LoginScreen.js'
import SignupScreen from '../ui/SignupScreen.js'
import CreateWallet from '../screens/createWallet.js'
import LoginWallet from '../ui/LoginWallet'
import LoginEncryptedKey from '../ui/LoginEncryptedKey'
import LoginPrivateKey from '../ui/LoginPrivateKey'
import ForgotScreen from '../ui/ForgotScreen.js'

import DisplayWalletAccount from '../ui/DisplayWalletAccount'
import { WalletTabBar } from '../navigators/WalletTabBarConfiguration'
import { WalletTabBarAdvance } from '../navigators/WalletTabBarConfigurationAdvance'
//xxx import all remaining screens

const defaultOptions = {
    // default options for the StackNavigator
    headerTintColor: 'white',
    headerStyle: {
        backgroundColor: "hsl(119,139,61) rgb(67, 90, 98)",
        borderBottomColor: '#979797',
        borderBottomWidth: 1
    }
}

const routeConfiguration = {

    Loading:{

        screen: Loading,
        navigationOptions: {
            ...defaultOptions,
            headerTitle: 'Loading'
        }

    },

    Dashboard:{
        screen: Dashboard,
        navigationOptions: {
            ...defaultOptions,
            headerLeft: null,            
            headerTitle: 'Dashboard'
        }
    },

    DisplayWalletAccount:{
        screen:DisplayWalletAccount,
        navigationOptions: {
            ...defaultOptions,
            headerTitle: 'Wallet Details',
            headerLeft: null
        }
    },




    Login:{
        screen: LoginScreen,
        navigationOptions: {
            ...defaultOptions,
            headerTitle: 'Login',
            headerLeft: null
        }
    },

    ResetPassword:{
        screen: ForgotScreen,
        navigationOptions: {
            ...defaultOptions,
            headerTitle: 'Login',
        }
    },
    Signup:{
        screen: SignupScreen,
        navigationOptions: {
            ...defaultOptions,
            headerTitle: 'Signup'
        }
    },
    

    CreateWallet: {
        screen: CreateWallet,
        navigationOptions: {
            ...defaultOptions,
            headerTitle: 'Create New Wallet'
            // tabBarVisible: false
        }
    },
    LoginWallet: {
        screen: LoginWallet,
        navigationOptions: {
            ...defaultOptions,
            headerTitle: 'Login to existing Wallet'
        }
    },
    LoginWithEncryptedKey: {
        screen: LoginEncryptedKey,
        navigationOptions: {
            ...defaultOptions,
            headerTitle: 'Login with an encrypted key'
        }
    },
    // insert manage neo settngs here
    LoginWithPrivateKey: {
        screen: LoginPrivateKey,
        navigationOptions: {
            ...defaultOptions,
            headerTitle: 'Login with private key'
        }
    },
    WalletTabBar: {
        screen: WalletTabBar,
        navigationOptions: {
            ...defaultOptions
        }
    },
    WalletTabBarAdvance: {
        screen: WalletTabBarAdvance,
        navigationOptions: {
            ...defaultOptions
        }
    },


}

const StackNavigatorConfiguration = {
    initialRoute: 'Loading',
    mode: 'modal',
    cardStyle: {
        backgroundColor: 'white'
    }
}

export const RootStackNavigator = StackNavigator(routeConfiguration, StackNavigatorConfiguration)
