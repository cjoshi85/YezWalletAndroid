const CREATE_WALLET = 'WALLET/CREATE'
const CREATE_WALLET_START = 'WALLET/CREATE_START'
const CREATE_WALLET_SUCCESS = 'WALLET/CREATE_SUCCESS'
const CREATE_WALLET_ERROR = 'WALLET/CREATE_ERROR'
const RESET_STATE = 'WALLET/RESET_STATE'
const LOGIN = 'WALLET/LOGIN'
const LOGOUT = 'WALLET/LOGOUT'
const TOGGLE_USER = 'WALLET/TOGGLE_USER'
const TOGGLE_USER_SUCCESS='WALLET/TOGGLE_USER_SUCCESS'
const UPDATE_CURRENCY='WALLET/UPDATE_CURRENCY'
const UPDATE_CURRENCY_SUCCESS='WALLET/UPDATE_CURRENCY_SUCCESS'
const UPDATE_PASSPHRASE='WALLET/UPDATE_PASSPHRASE'
const UPDATE_PASSPHRASE_SUCCESS='WALLET/UPDATE_PASSPHRASE_SUCCESS'
const LOGIN_SUCCESS = 'WALLET/LOGIN_SUCCESS'
const LOGIN_ERROR = 'WALLET/LOGIN_ERROR'
const START_DECRYPT_KEYS = 'WALLET/DECRYPTING_KEYS'
const GET_BALANCE = 'WALLET/GET_BALANCE'
const GET_BALANCE_SUCCESS = 'WALLET/GET_BALANCE_SUCCESS'
const GET_BALANCE_ERROR = 'WALLET/GET_BALANCE_ERROR'
const GET_MARKET_PRICE = 'WALLET/GET_MARKET_PRICE'
const GET_MARKET_PRICE_SUCCESS = 'WALLET/GET_MARKET_PRICE_SUCCESS'
const GET_MARKET_PRICE_ERROR = 'WALLET/GET_MARKET_PRICE_ERROR'
const GET_TRANSACTION_HISTORY = 'WALLET/GET_TRANSACTION_HISTORY'
const GET_TRANSACTION_HISTORY_SUCCESS = 'WALLET/GET_TRANSACTION_HISTORY_SUCCESS'
const GET_TRANSACTION_HISTORY_ERROR = 'WALLET/GET_TRANSACTION_HISTORY_ERROR'
const SEND_ASSET = 'WALLET/SEND_ASSET'
const SEND_ASSET_SUCCESS = 'WALLET/SEND_ASSET_SUCCESS'
const SEND_ASSET_ERROR = 'WALLET/SEND_ASSET_ERROR'
const SEND_ASSET_RESET_SEND_INDICATORS = 'WALLET/SEND_ASSET_RESET_SEND_INDICATORS'
const GET_AVAILABLE_GAS_CLAIM = 'WALLET/GET_AVAILABLE_GAS_CLAIM'
const GET_AVAILABLE_GAS_CLAIM_SUCCESS = 'WALLET/GET_AVAILABLE_GAS_CLAIM_SUCCESS'
const GET_AVAILABLE_GAS_CLAIM_ERROR = 'WALLET/GET_AVAILABLE_GAS_CLAIM_ERROR'
const CLAIM_GAS = 'WALLET/CLAIM_GAS'
const CLAIM_GAS_START = 'WALLET/CLAIM_GAS_START'
const CLAIM_GAS_SUCCESS = 'WALLET/CLAIM_GAS_SUCCESS'
const CLAIM_GAS_ERROR = 'WALLET/CLAIM_GAS_ERROR'
const CLAIM_GAS_CONFIRMED_BY_BLOCKCHAIN = 'WALLET/CLAIM_GAS_CONFIRMED_BY_BLOCKCHAIN'
const UNSPEND_CLAIM_TO_CLEAR = 'WALLET/UNSPEND_CLAIM_TO_CLEAR'
const TRANSACTION_TO_SELF_CLEARED = 'WALLET/TRANSACTION_TO_SELF_CLEARED'
const WAITING_FOR_TRANSACTION_TO_SELF_TO_CLEAR = 'WALLET/WAITING_FOR_TRANSACTION_TO_SELF_TO_CLEAR'
const START_BG_TASK = 'WALLET/START_BG_TASK'
const IMPORT_NEP6 = 'WALLET/IMPORT_NEP6'
const IMPORT_NEP6_START = 'WALLET/IMPORT_NEP6_START'
const IMPORT_NEP6_SUCCESS = 'WALLET/IMPORT_NEP6_SUCCESS'
const IMPORT_NEP6_ERROR = 'WALLET/IMPORT_NEP6_ERROR'
const IMPORT_NEP6_PROVIDE_PW = 'WALLET/IMPORT_NEP6_PROVIDE_PW'

export const constants = {
    CREATE_WALLET,
    CREATE_WALLET_START,
    CREATE_WALLET_SUCCESS,
    CREATE_WALLET_ERROR,
    RESET_STATE,
    LOGIN,
    LOGIN_SUCCESS,
    LOGIN_ERROR,
    START_DECRYPT_KEYS,
    LOGOUT,
    TOGGLE_USER,
    TOGGLE_USER_SUCCESS,
    UPDATE_CURRENCY,
    UPDATE_CURRENCY_SUCCESS,
    UPDATE_PASSPHRASE,
    UPDATE_PASSPHRASE_SUCCESS,
    GET_BALANCE,
    GET_BALANCE_SUCCESS,
    GET_BALANCE_ERROR,
    GET_MARKET_PRICE,
    GET_MARKET_PRICE_SUCCESS,
    GET_MARKET_PRICE_ERROR,
    GET_TRANSACTION_HISTORY,
    GET_TRANSACTION_HISTORY_SUCCESS,
    GET_TRANSACTION_HISTORY_ERROR,
    SEND_ASSET,
    SEND_ASSET_SUCCESS,
    SEND_ASSET_ERROR,
    SEND_ASSET_RESET_SEND_INDICATORS,
    GET_AVAILABLE_GAS_CLAIM,
    GET_AVAILABLE_GAS_CLAIM_SUCCESS,
    GET_AVAILABLE_GAS_CLAIM_ERROR,
    CLAIM_GAS,
    CLAIM_GAS_START,
    CLAIM_GAS_SUCCESS,
    CLAIM_GAS_ERROR,
    CLAIM_GAS_CONFIRMED_BY_BLOCKCHAIN,
    UNSPEND_CLAIM_TO_CLEAR,
    TRANSACTION_TO_SELF_CLEARED,
    WAITING_FOR_TRANSACTION_TO_SELF_TO_CLEAR,
    START_BG_TASK,
    IMPORT_NEP6,
    IMPORT_NEP6_START,
    IMPORT_NEP6_SUCCESS,
    IMPORT_NEP6_ERROR,
    IMPORT_NEP6_PROVIDE_PW
}

export const ASSET_TYPE = {
    NEO: 'NEO', // otherwise neon-js will get borked on doSendAsset
    GAS: 'GAS'
}

export const USER_REGULAR = 'Regular'
export const USER_ADVANCE = 'Advance'

// wif is optional
export function create(passphrase, wif,name) {
    return {
        type: CREATE_WALLET,
        passphrase,
        wif,
        name
    }
}

export function resetState() {
    return {
        type: RESET_STATE
    }
}

export function updateCurrency(currency,symbol){
    return{
        type:UPDATE_CURRENCY,
        currency,
        symbol
    }
}

export function updatePassphrase(passphrase){
    return{
        type:UPDATE_PASSPHRASE,
        passphrase
    }
}

export function login(passphrase, encryptedKey,userId) {
  //  alert('action uid==>'+uid)
    return {
        type: LOGIN,
        passphrase,
        key: encryptedKey,
        userId,
        keyIsEncrypted: true
    }
}
// TODO: should rename to unencryptedWIF() as it's tehnically not really the private key but it's unencrypted encoded form
export function loginWithPrivateKey(key,userId) {
    debugger
    return {
        type: LOGIN,
        passphrase: null,
        key,
        userId,
        keyIsEncrypted: false
    }
}

export function logout() {
    return {
        type: LOGOUT
    }
}

export function toggleUser() {
    return {
        type: TOGGLE_USER
    }
}

export function sendAsset(toAddress, amount, assetType) {
   // alert('Send Assett')
    return {
        type: SEND_ASSET,
        toAddress,
        amount,
        assetType
    }
}

export function claim() {
    return {
        type: CLAIM_GAS
    }
}

export function importWalletsFrom(url) {
    return {
        type: IMPORT_NEP6,
        url
    }
}

export function provideNEP6Passphrase(pw) {
    return {
        type: IMPORT_NEP6_PROVIDE_PW,
        pw
    }
}
