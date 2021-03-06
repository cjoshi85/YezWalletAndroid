import { ActionConstants as actions } from '../actions'
import { getAccountFromWIF } from '../api/crypto'
import { ASSET_TYPE } from '../actions/wallet'
import { USER_REGULAR, USER_ADVANCE } from '../actions/wallet'

export default function order(state = {}, action) {
    switch (action.type) {
        case actions.wallet.CREATE_WALLET_START:
            return { ...state, generating: true }
        case actions.wallet.CREATE_WALLET_SUCCESS:
           
            return {
                ...state,
                name: action.data.name,
                wif: action.data.wif,
                address: action.data.address,
                passphrase: action.data.passphrase,
                encryptedWIF: action.data.encryptedWIF,
                generating: false,
                created: true
            }
        case actions.wallet.RESET_STATE:
            return {
                ...state,
                wif: null,
                user:null,
                address: null,
                passphrase: null,
                encryptedWIF: null,
                generating: false,
                decrypting: false,
                loggedIn: false,
                updatedState:false,
                updatingState:false,
                sendingAsset:false,
                sentAsset:false,
                logInError: null,
                neo: 0,
                gas: 0,
                price: 0.0,
                transactions: [],
                claimAmount: 0,
                claimUnspend: 0,
                updateSendIndicator: false,
                pendingBlockConfirm: false,
                created:false
            }

        case actions.wallet.START_DECRYPT_KEYS:
            return {
                ...state,
                decrypting: true
            }

        case actions.wallet.UPDATE_STATE_SUCCESS:
            return {
                ...state,
                updatedState:true,
                updatingState:false,
            }

        case actions.wallet.UPDATE_STATE_START:
            return {
                ...state,
                updatingState:true,
                updatedState:false
            }
        case actions.wallet.LOGIN_SUCCESS:
            //const account = getAccountFromWIF(action.plainKey)
            
            return {
                ...state,
                wif: action.data.WIF,
                address: action.data.address,
                passphrase:action.data.passphrase,
                encryptedWIF:action.data.encryptedWIF,
                roleType: action.roleType,
                email:action.user.email,
                currencyCode:action.currencyCode,
                symbol:action.symbol,
                userId:action.userId,
                decrypting: false,
                loggedIn: true,
            }
        case actions.wallet.LOGIN_ERROR:
            return {
                ...state,
                decrypting: false,
                loggedIn: false,
                logInError: action.error
            }
        case actions.wallet.LOGOUT: {
            return {
                ...state,
                loggedIn: false
            }
        }
        case actions.wallet.GET_BALANCE_SUCCESS: {
            let newState
            // we are not waiting for a transaction confirmation on the blockchain
            // update balance as normal
            if (!state.pendingBlockConfirm) {
                newState = {
                    ...state,
                    neo: action.neo,
                    yez:action.yez,
                    gas: action.gas,
                    tokenBalances: action.tokenBalances
                }
            } else {
                // ignore balance updates until our transaction is confirmed
                if (state.neo != action.neo && state.gas != action.neo) {
                    newState = {
                        ...state,
                        neo:action.neo,
                        gas:action.gas,
                        yez:action.yez,
                        tokenBalances: action.tokenBalances,
                        updatingState:false
                    }
                } else {
                    newState = {
                        ...state,
                        pendingBlockConfirm: false,
                        updatingState:false
                    }
                }
            }
            return newState
        }

        case actions.wallet.GET_MARKET_PRICE_SUCCESS: {
            return {
                ...state,
                neoPrice:action.price.NEO,
                gasPrice:action.price.GAS,
                yezPrice:action.price.YEZ
            }
        }
        case actions.wallet.GET_TRANSACTION_HISTORY_SUCCESS: {
            return {
                ...state,
                transactions: action.transactions,
                updatingState:false
            }
        }
        case actions.wallet.GET_AVAILABLE_GAS_CLAIM_SUCCESS:
            const MAGIC_NETWORK_PROTOCOL_FORMAT = 100000000 // read more here: https://github.com/CityOfZion/neon-wallet-db#claiming-gas
            return {
                ...state,
                claimAmount: (action.claimAmounts.available + action.claimAmounts.unavailable) / MAGIC_NETWORK_PROTOCOL_FORMAT,
                claimUnspend: action.claimAmounts.unavailable
            }

        case actions.wallet.SEND_ASSET_START:

            return{
                ...state,
                sendingAsset:true
            }

        case actions.wallet.SEND_ASSET_SUCCESS:

            if (action.sentToSelf == true) {
                /* Because we're sending to ourself, we don't want to freak out the user with showing
                 * an empty wallet while the blockchain confirms it's sent to ourselve. Therefore
                 * don't do the pre-emptive balance changing as below
                 */

                return {
                    ...state,
                    sendingAsset:false,
                    sentAsset:true
                }
            } else {
                // pre-emptively change asset value, to what has been send by the transaction for UX purpose
                let assetToChange = action.assetType === ASSET_TYPE.NEO ? 'neo' : 'gas'
                return {
                    ...state,
                    updateSendIndicators: true,
                    pendingBlockConfirm: true,
                    sendingAsset:false,
                    sentAsset:true,
                    [assetToChange]: state[assetToChange]
                }
            }
        case actions.wallet.SEND_ASSET_RESET_SEND_INDICATORS:
            return {
                ...state,
                updateSendIndicators: false
            }

        case actions.wallet.UPDATE_CURRENCY_START:{
                return{
                    ...state,
                    loading:true
                }
            }
        case actions.wallet.UPDATE_CURRENCY_SUCCESS:
        return{
            ...state,
            loading:false,
            currencyCode:action.currency,
            symbol:action.symbol
        }

        case actions.wallet.TOGGLE_USER_START:{
            return{
                ...state,
                loading:true
            }
        }

        case actions.wallet.TOGGLE_USER_SUCCESS: {
                
            return {
                ...state,
                loading:false,
                roleType: action.roleType
                }
            }

        case actions.wallet.BACKGROUND_TASK_START: {
            return{
                ...state,
                loading:true
            }
        }

        case actions.wallet.BACKGROUND_TASK_SUCCESS: {
            return{
                ...state,
                loading:false
            }
        }
        case actions.wallet.BACKGROUND_TASK_ERROR: {
            return{
                ...state,
                loading:false
            }
        }
        default:
            return state
    }
}
