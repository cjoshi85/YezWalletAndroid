import { combineReducers } from 'redux'
import navigation from './navigation'
import wallet from './wallet'
import network from './network'
import claim from './claim'
import settings from './settings'
import login from './login'
import auth from './auth'

export default combineReducers({auth:auth, rootStackNav: navigation, wallet: wallet, network: network, claim: claim, settings: settings,login:login })
