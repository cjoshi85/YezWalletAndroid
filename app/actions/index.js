import * as walletActions from './wallet'
import * as networkActions from './network'
import * as settingsActions from './settings'
import * as authActions from './auth'

export const ActionCreators = Object.assign({}, {auth: authActions, wallet: walletActions, network: networkActions, settings: settingsActions })

export const ActionConstants = Object.assign(
    {},
    { auth: authActions.constants,wallet: walletActions.constants, network: networkActions.constants, settings: settingsActions.constants }
)
