import { delay } from 'redux-saga'
import { put, takeEvery, call, all, takeLatest, select, fork, take, cancel, cancelled, race } from 'redux-saga/effects'
import { getWallet, getNetwork, getWalletGasBalance } from './selectors'
import {
    getBalance,
    getTransactionHistory,
    sendAsset,
    getClaimAmounts,
    getWalletDBHeight,
    claimAllGAS,
    getMarketPriceUSD,
    getWalletDataFrom
} from '../api/network'
import { decryptWIF, generateEncryptedWIF,encryptWIF,loginWIF } from '../api/crypto'

import { ActionConstants as actions } from '../actions'
import { DropDownHolder } from '../utils/DropDownHolder'
import {currentuser,getCurrencyCode,getUserRole,getUserData,updateUserRole,updateCurrency,getAllAdress,updatePassphrase} from '../api/user/login'
import { isBlockedByTransportSecurityPolicy, generateEncryptedWif } from '../utils/walletStuff'

let bgTaskHandler = null

export function* rootWalletSaga() {
    yield all([watchCreateWallet(), watchLoginWallet(), watchSendAsset(),watchToggleUser(),watchUpdateCurrency(),watchUpdatePassphrase(), watchClaimGAS(), watchImportNEP6()])
}

/*
 *
 * Watchers 
 *
 */
export function* watchCreateWallet() {
    // expanded to make testable with redux-saga-mock
    while (true) {
        const params = yield take(actions.wallet.CREATE_WALLET)
        yield call(createWalletFlow, params)
    }
}

export function* watchLoginWallet() {
    while (true) {
        const params = yield take(actions.wallet.LOGIN)
        yield fork(bgTaskController)
        
        const walletFlowTask = yield fork(walletUseFlow, params)

        const action = yield take([actions.wallet.LOGOUT, actions.wallet.LOGIN_ERROR])
        if (action.type == actions.wallet.LOGOUT) {
            yield put({ type: actions.wallet.RESET_STATE })
        }

        cancel(walletFlowTask)
        // bgTaskController isn't started if LOGIN_ERROR occurs, on otherwise it's self ending on LOGOUT or network errors
    }
}

export function* watchSendAsset() {
    yield takeEvery(actions.wallet.SEND_ASSET, sendAssetFlow)
}

export function* watchClaimGAS() {
    while (true) {
        const params = yield take(actions.wallet.CLAIM_GAS)
        yield fork(claimGASFlow, params)
    }
}

export function* watchImportNEP6() {
    while (true) {
        const params = yield take(actions.wallet.IMPORT_NEP6)
        yield fork(importNEP6Wallets, params)
    }
}

export function* watchUpdateCurrency(){
    while(true){
        const params=yield take(actions.wallet.UPDATE_CURRENCY)
        const wallet = yield select(getWallet)
        const currency=yield call(updateCurrency,wallet.userId,params.currency)
        yield call(retrieveMarketPrice,currency)
        yield put({type:actions.wallet.UPDATE_CURRENCY_SUCCESS,currency})
    }
}

export function* watchUpdatePassphrase(){
    while(true){
        const params=yield take(actions.wallet.UPDATE_PASSPHRASE)
        const wallet = yield select(getWallet)
        const result = yield call(generateEncryptedWIF, params.passphrase)
        const passphrase=yield call(updatePassphrase,wallet.userId,'Default',result)
        yield put({type:actions.wallet.UPDATE_CURRENCY_SUCCESS,data:result})
        yield put({type:actions.wallet.TOGGLE_USER_SUCCESS,roleType:wallet.roleType })
    }
}

export function* watchToggleUser(){
    while(true){        
        yield take(actions.wallet.TOGGLE_USER)
        debugger
        const wallet = yield select(getWallet)
        const roleType=yield call(updateUserRole,wallet.userId,wallet.roleType)
        yield put({ type: actions.wallet.TOGGLE_USER_SUCCESS,roleType })
    }
}
/*
 *
 * action takers 
 *
 */
function* bgTaskController() {
    yield take(actions.wallet.START_BG_TASK)
    bgTaskHandler = yield fork(backgroundSyncData)

    // stop task on logout or any network error
    yield take([
        actions.wallet.LOGOUT,
        //actions.network.GET_BLOCK_HEIGHT_ERROR,
        actions.wallet.GET_BALANCE_ERROR,
        actions.wallet.GET_MARKET_PRICE_ERROR,
        //actions.wallet.GET_TRANSACTION_HISTORY_ERROR,
        actions.wallet.GET_AVAILABLE_GAS_CLAIM_ERROR,
        actions.wallet.CLAIM_GAS_ERROR
    ])
    yield cancel(bgTaskHandler)

    // because of https://github.com/wix/redux-saga-tester/issues/38
    if (global.__SAGA__UNDER_JEST__) {
        yield put({ type: 'JEST_BG_TASK_CANCELLED' })
    }
}

export function* createWalletFlow(args) {
    const { passphrase, wif,name } = args

    try {
        yield put({ type: actions.wallet.CREATE_WALLET_START })
        
        yield call(delay, 1000) // to give the UI-thread time to show the 'generating view'
      
        const result = yield call(generateEncryptedWIF, passphrase, wif)

       // alert(result.encryptedWIF)
        
        result.name=name
        yield put({ type: actions.wallet.CREATE_WALLET_SUCCESS, data: result })
    } catch (error) {
        yield put({ type: actions.wallet.CREATE_WALLET_ERROR, error })
        DropDownHolder.getDropDown().alertWithType('error', 'Error', error)
    }
}

function* decryptWalletKeys(encryptedKey, passphrase,userId) {
    try {
        yield put({ type: actions.wallet.START_DECRYPT_KEYS })
        yield call(delay, 1000) // to allow UI to update before it gets locked by the computational heavy decrypt_wif function
        const result = yield call(decryptWIF, encryptedKey, passphrase)
        if(!userId){
            userId=yield call(currentuser)
            }      
        // const roleType=yield call(getUserRole,userId)
        // const currencyCode=yield call(getCurrencyCode,userId)        
        const roleType='Regular'
        const currencyCode='USD'
        yield put({ type: actions.wallet.LOGIN_SUCCESS, data:result,roleType,currencyCode,userId,passphrase })
        yield put({ type: actions.wallet.TOGGLE_USER_SUCCESS,roleType })
    } catch (error) {
        yield put({ type: actions.wallet.LOGIN_ERROR, error })
        DropDownHolder.getDropDown().alertWithType('error', 'Error', error.toString())
    }
}

function* retrieveBlockHeight(net) {
    try {
        yield put({ type: actions.network.GET_BLOCK_HEIGHT })
        const blockHeight = yield call(getWalletDBHeight,net)
        yield put({ type: actions.network.GET_BLOCK_HEIGHT_SUCCESS, height: blockHeight })
        return blockHeight
    } catch (error) {
        yield put({ type: actions.network.GET_BLOCK_HEIGHT_ERROR, error })
    }
}

function* retrieveBalance(net,address) {
    try {
        yield put({ type: actions.wallet.GET_BALANCE })
        const balance = yield call(getBalance, net,address)
        
        yield put({ type: actions.wallet.GET_BALANCE_SUCCESS, neo: balance.NEO, gas: balance.GAS })
    } catch (error) {
        yield put({ type: actions.wallet.GET_BALANCE_ERROR, error })
    }
}

function* retrieveMarketPrice(currency) {
    try {
        yield put({ type: actions.wallet.GET_MARKET_PRICE })
        const price = yield call(getMarketPriceUSD,currency)
        
        yield put({ type: actions.wallet.GET_MARKET_PRICE_SUCCESS, price: price })
    } catch (error) {
        yield put({ type: actions.wallet.GET_MARKET_PRICE_ERROR, error })
    }
}

function* retrieveTransactionHistory(net,address) {
    try {
        yield put({ type: actions.wallet.GET_TRANSACTION_HISTORY })
        const transactions = yield call(getTransactionHistory, net,address)
        
        yield put({ type: actions.wallet.GET_TRANSACTION_HISTORY_SUCCESS, transactions: transactions })
    } catch (error) {
        yield put({ type: actions.wallet.GET_TRANSACTION_HISTORY_ERROR, error })
    }
}

function* retrieveClaimAmount(address) {
    try {
        yield put({ type: actions.wallet.GET_AVAILABLE_GAS_CLAIM })
        const claimAmounts = yield call(getClaimAmounts, address)
        yield put({ type: actions.wallet.GET_AVAILABLE_GAS_CLAIM_SUCCESS, claimAmounts: claimAmounts })
        // perhaps disable button/functionality until next block update?
    } catch (error) {
        yield put({ type: actions.wallet.GET_AVAILABLE_GAS_CLAIM_ERROR, error })
    }
}

export function* retrieveData() {
    let BLOCKCHAIN_UPDATE_INTERVAL = 10000 //15000
    const wallet = yield select(getWallet)
    const network = yield select(getNetwork)
    const currency='USD'

    if (global.__SAGA__UNDER_JEST__) {
        BLOCKCHAIN_UPDATE_INTERVAL = 1000
    }

    const blockHeight = yield call(retrieveBlockHeight,network.net)

    if (!blockHeight || (blockHeight > network.blockHeight[network.net])) {
        yield put({ type: actions.network.SET_BLOCK_HEIGHT, blockHeight: blockHeight })
        yield all([
            call(retrieveBalance, network.net, wallet.address),
            call(retrieveMarketPrice,wallet.currencyCode),
            call(retrieveTransactionHistory, network.net,wallet.address),
            //call(retrieveClaimAmount, wallet.address)
        ])
    }
    yield call(delay, BLOCKCHAIN_UPDATE_INTERVAL)
}

export function* backgroundSyncData() {
    try {
        yield put({ type: 'BACKGROUND_SYNC_STARTING' })
        while (true) {
            // either wait until the retrieveData task is finished or cancel that and update instantly if we see a network change
            yield race({
                updateTask: call(retrieveData),
                networkSwitch: take([actions.network.SWITCH, actions.network.TOGGLE])
            })
        }
    } finally {
        if (yield cancelled()) {
            yield put({ type: 'BACKGROUND_SYNC_STOPPED' })
        }
    }
}

export function* walletUseFlow(args) {
    const { key, passphrase,userId, keyIsEncrypted } = args
    
    if (keyIsEncrypted) {
        yield fork(decryptWalletKeys, key, passphrase,userId)
        yield take(actions.wallet.LOGIN_SUCCESS)
    } else {
        debugger
        yield call(loginWithWif,key,userId)
       // yield put({ type: actions.wallet.LOGIN_SUCCESS})
    }

    // start periodic update of data from the blockchain
    yield put({ type: actions.wallet.START_BG_TASK })
}

export function* sendAssetFlow(args) {
    const { assetType, toAddress, amount } = args
    const wallet = yield select(getWallet)
    const network = yield select(getNetwork)
    const FIVE_SECONDS = 5000

    try {
        yield call(sendAsset, network.net, toAddress,wallet.address, wallet.wif, assetType, amount)

        if(response.result != true){
            DropDownHolder.getDropDown().alertWithType(
                'error',
                'Error',
                'Transaction Failed!'
            )
        }

        if (toAddress === wallet.address) {
            // Then we're just doing a transaction to release all "unspent_claim", so we can claim the GAS
            // and we don't want to notify the user with an additional dropdown box as we do below
            yield put({ type: actions.wallet.SEND_ASSET_SUCCESS, sentToSelf: true })
        } else {
            yield put({ type: actions.wallet.SEND_ASSET_SUCCESS, assetType, amount, sentToSelf: false })
            DropDownHolder.getDropDown().alertWithType(
                'success',
                'Success',
                'Transaction complete! Your balance will automatically update when the blockchain has processed it.'
            )
            // SEND_ASSET_SUCCESS sets a variable that tells the walletInfo/SendAssetForm components to update some parts
            // We want to reset that variable here
            yield call(delay, FIVE_SECONDS)
            yield put({ type: actions.wallet.SEND_ASSET_RESET_SEND_INDICATORS })
        }
    } catch (error) {
        const { blockedByPolicy, blockedDomain } = isBlockedByTransportSecurityPolicy(error)
        if (blockedByPolicy) {
            DropDownHolder.getDropDown().alertWithType(
                'error',
                'Error',
                'Transaction sending failed.' +
                    `${blockedDomain}` +
                    ' not allowed by iOS App Transport Security policy. Please contact the wallet author.'
            )
        } else {
            DropDownHolder.getDropDown().alertWithType('error', 'Send', 'Transaction sending failed')
        }
        yield put({ type: actions.wallet.SEND_ASSET_ERROR, error: error })
    }
}

function* loginWithWif(wif,userId){
    try{
        const result=yield call(loginWIF,wif)
        if(!userId){
        userId=yield call(currentuser)
        }
        const userName=yield call(getUserData,userId)
        //console.error('Username===>'+userName)
        const roleType=yield call(getUserRole,userId)
        const currencyCode=yield call(getCurrencyCode,userId)
        const getAllAddress=yield call(getAllAdress,userId)
        debugger
        if(!getAllAddress.includes(result.address))
        {
            debugger
            throw new Error('Wallet does not belong to your account')
        }
        yield put({ type: actions.wallet.LOGIN_SUCCESS, data:result,roleType,currencyCode,userName,userId })
        yield put({ type: actions.wallet.TOGGLE_USER_SUCCESS,roleType })
        debugger
    }catch(error){
        alert(error)
        yield put({ type: actions.wallet.LOGIN_ERROR, error })
    }
}

function* claim(wif) {
    // doClaimAllGas example usage
    // https://github.com/CityOfZion/neon-wallet/blob/1d0d037ae5813c0e04af4a196053923d8c0cfe57/app/components/Claim.js#L13
    // https://github.com/CityOfZion/neon-js/blob/ec8ba51a4fb8dea3c9f777db002b9c2e5c8a8ad0/src/api.js#L45
    try {
        yield put({ type: actions.wallet.CLAIM_GAS_START })
        const response = yield call(claimAllGAS, wif)
        if (response.result == true) {
            yield put({ type: actions.wallet.CLAIM_GAS_SUCCESS })
        } else {
            throw new Error('Claim failed')
        }
    } catch (error) {
        yield put({ type: actions.wallet.CLAIM_GAS_ERROR, error })
    }
}

function* waitForTransactionToSelfToClear(previousUnspendClaim) {
    yield put({ type: actions.wallet.WAITING_FOR_TRANSACTION_TO_SELF_TO_CLEAR })

    while (true) {
        yield take(actions.wallet.GET_AVAILABLE_GAS_CLAIM_SUCCESS)
        let wallet = yield select(getWallet)

        // testing for smaller than previous unspend amount, because while clearing we might earn new GAS. Testing for 0 is thus not a good solution
        if (wallet.claimUnspend < previousUnspendClaim) {
            // confirmed
            yield put({ type: actions.wallet.TRANSACTION_TO_SELF_CLEARED })
            break
        }
    }
}

export function* claimGASFlow() {
    const wallet = yield select(getWallet)

    /* If we have NEO balance in our wallet, then part or all of the available claim can be "unspent_claim".
     * We first have to release this. This can be done by sending to yourself. Read about it here:
     * https://github.com/CityOfZion/neon-wallet-db#claiming-gas
     * https://github.com/CityOfZion/neon-wallet-db/blob/master/docs/Overview.md#what-is-the-difference-between-an-available-and-unavailable-claim
     */
    if (wallet.neo != 0) {
        yield put({ type: actions.wallet.UNSPEND_CLAIM_TO_CLEAR }) // we can just assume this based on Neo balance instead of checking with `retrieveClaimAmount`

        const sendToSelfParams = { assetType: 'Neo', toAddress: wallet.address, amount: wallet.neo }
        const previousUnspend = wallet.claimUnspend

        yield call(sendAssetFlow, sendToSelfParams)
        yield fork(waitForTransactionToSelfToClear, previousUnspend)

        yield take(actions.wallet.TRANSACTION_TO_SELF_CLEARED)
    }
    claimGASTask = yield fork(claim, wallet.wif)

    const action = yield take([actions.wallet.CLAIM_GAS_SUCCESS, actions.wallet.CLAIM_GAS_ERROR])
    if (action.type == actions.wallet.CLAIM_GAS_ERROR) {
        cancel(claimGASTask)
        return
    }
    // Wait for GAS balance to be confirmed
    const oldGASBalance = wallet.gas
    while (true) {
        let newGASBalance = yield select(getWalletGasBalance)
        if (newGASBalance > oldGASBalance) {
            // This sitation might occur for 2 reasons:
            // 1) GAS balance has updated as the result of our claim being confirmed by the blockchain
            // 2) Somebody happened to have sent us GAS in the time window between the CLAIM_GAS_SUCCESS and the next ~2 GET_BALANCE_SUCCESS events
            // Option 2 is so unlikely to happen that I consider this an acceptable solution
            yield put({ type: actions.wallet.CLAIM_GAS_CONFIRMED_BY_BLOCKCHAIN })
            return
        } else {
            yield take(actions.wallet.GET_BALANCE_SUCCESS)
        }
    }
}

function* importNEP6Wallets(args) {
    const { url } = args
    try {
        yield put({ type: actions.wallet.IMPORT_NEP6_START })
        let wallet_data = yield call(getWalletDataFrom, url)
        const scrypt = wallet_data.scrypt

        // check if default NEP2 values used for key encryption
        if (scrypt.n != 16384 || scrypt.p != 8 || scrypt.r != 8) {
            const scrypt_params = {
                ITERATIONS: scrypt.n,
                BLOCKSIZE: scrypt.r,
                PARALLEL_FACTOR: scrypt.p,
                KEY_LEN_BYTES: 64
            }

            // ask for pw such that we can decrypt, then encrypt using NEP2 default settings
            yield put({ type: actions.wallet.IMPORT_NEP6_NEED_PASSPHRASE })
            const passphrase = yield take({ type: actions.wallet.IMPORT_NEP6_PROVIDE_PW })

            let nep2Accounts = []
            for (let acc of wallet_data.accounts) {
                const plainKey = yield call(decryptWIF, acc.key, passphrase, scrypt_params)
                const account = yield call(generateEncryptedWIF, passphrase, plainkey)
                nep2Accounts.push({ key: account.encryptedWIF, label: acc.label })
            }
            wallet_data.accounts = nep2Accounts
        }

        // store keys in settings
        for (let acc of wallet_data.accounts) {
            yield put({ type: actions.settings.SAVE_KEY, key: acc.key, name: acc.label })
        }

        yield put({ type: actions.wallet.IMPORT_NEP6_SUCCESS })
    } catch (error) {
        yield put({ type: actions.wallet.IMPORT_NEP6_ERROR, error })
        DropDownHolder.getDropDown().alertWithType('error', 'Error', 'Importing wallet file failed')
    }
}

// function* monitorNetworkHealth() {
//     while(true) {
//         // do some network test
//         if (ok) {
//             set ONLINE_FLAG
//             if (was bgsync) {
//                 restart bgsync
//             }
//         }
//         if (!ok) {
//             set OFFLINE flag
//             if (bgsync) {
//                 stop bgsync
//             }
//         }
//     }
// }
