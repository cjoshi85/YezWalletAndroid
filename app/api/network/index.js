import request from './request'
import axios from 'axios'
import { api, rpc } from '@cityofzion/neon-js'
import {
    getAccountFromWIF,
    buildContractTransactionData,
    buildClaimTransactionData,
    buildRawTransaction,
    signTransactionData
} from '../crypto'
import { ASSETS } from '../../core/constants'
import { toBigNumber,toNumber } from '../../core/math'
import { COIN_DECIMAL_LENGTH } from '../../core/formatters'
import { filter, reduce } from 'lodash'
import { getTokenBalanceScript, buildInvocationTransactionData } from '../crypto/nep5'
import { reverse } from '../crypto/utils'

export const NEO_ID = 'c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b'
export const GAS_ID = '602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7'

export async function getBalance(net,address) {
    try{
        debugger
        
        const assetBalances = await api.getBalanceFrom({ net, address }, api.neoscan)
        const { assets } = assetBalances.balance
        
        // The API doesn't always return NEO or GAS keys if, for example, the address only has one asset
        const neoBalance = assets.NEO ? assets.NEO.balance.toString() : '0'
        const gasBalance = assets.GAS ? assets.GAS.balance.round(COIN_DECIMAL_LENGTH).toString() : '0'
        
        return { [ASSETS.NEO]: neoBalance, [ASSETS.GAS]: gasBalance }
        }catch(error){
            alert('GetBalance Error'+error)
            console.error(error)
            throw error
        }
}

export async function getWalletDBHeight(net) {
    try{
        
        const endpoint = await api.getRPCEndpointFrom({ net }, api.neoscan)
        debugger
        const client = new rpc.RPCClient(endpoint)
        return client.getBlockCount()
        }catch(error){
            alert('DB Height Error'+error)
        }
}

function sum (txns, address, asset) {
    const matchingTxns = filter(txns, (txn) => {
      return txn.asset === asset && txn.address_hash === address
    })
  
    return reduce(matchingTxns, (sum, txn) => {
      return sum.plus(txn.value)
    }, toBigNumber(0))
  }

export async function getTransactionHistory(net,address) {
    try{
        const endpoint = api.neoscan.getAPIEndpoint(net)
      const { data } = await axios.get(`${endpoint}/v1/get_last_transactions_by_address/${address}`)
      debugger
    
      return data.map(({ txid, vin, vouts }) => ({
        txid,
        [ASSETS.NEO]: sum(vouts, address, NEO_ID).minus(sum(vin, address, NEO_ID)).toFixed(0),
        [ASSETS.GAS]: sum(vouts, address, GAS_ID).minus(sum(vin, address, GAS_ID)).toPrecision(COIN_DECIMAL_LENGTH).toString()
      }))
    }catch(error){
        alert('Transaction History error'+error)
        console.error(error)
        throw error
    }
}

export function getClaimAmounts(address) {
    var path = '/v2/address/claims/' + address
    return request(path).then(response => {
        let available = parseInt(response.total_claim)
        let unavailable = parseInt(response.total_unspent_claim)

        if (isNaN(available) || isNaN(unavailable)) {
            throw new Error('Return data malformed')
        }

        return { available: available, unavailable: unavailable }
    })
}

export function getAssetId(assetType) {
    // more info here: http://docs.neo.org/en-us/node/api/getbalance.html
    const neoId = 'c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b'
    const gasId = '602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7'

    let assetId
    if (assetType === 'Neo') {
        assetId = neoId
    } else {
        assetId = gasId
    }
    return assetId
}

/**
 * Send an asset to an address
 * @param {string} destinationAddress - The destination address.
 * @param {string} WIF - The WIF of the originating address.
 * @param {string} assetType - The Asset. 'Neo' or 'Gas'.
 * @param {number} amount - The amount of asset to send.
 * @return {Promise<Response>} RPC Response
 */
export async function sendAsset(net,destinationAddress,senderAddress, WIF, assetType, amount) {
    debugger
    try{
    // const intent = await api.makeIntent({assetType:amount}, destinationAddress)
    const intent=api.makeIntent(
        {
          [assetType]: toNumber(amount)
        },
        destinationAddress
      )
    const config = {
        net:net, // The network to perform the action, MainNet or TestNet.
        address: senderAddress,  // This is the address which the assets come from.
        privateKey: WIF,
        intents: intent
      }
      const result=await api.sendAsset(config)
      debugger
      return result.response
    }catch(error){
        alert(error)
    }
}

function getRPCEndpoint() {
    var path = '/v2/network/best_node'

    return request(path).then(response => {
        return response.node
    })
}

export const queryRPC = (method, params, id = 1) => {
    const jsonRpcData = { method, params, id, jsonrpc: '2.0' }
    return getRPCEndpoint().then(rpcEndpoint => {
        var options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonRpcData)
        }
        return request(rpcEndpoint, options, true).then(response => {
            return response
        })
    })
}

export function claimAllGAS(fromWif) {
    const account = getAccountFromWIF(fromWif)

    var path = '/v2/address/claims/' + account.address
    return request(path).then(response => {
        const claims = response['claims']
        const totalClaim = response['total_claim']

        const txData = buildClaimTransactionData(claims, totalClaim, account.publicKeyEncoded)
        const signature = signTransactionData(txData, account.privateKey)
        const rawTXData = buildRawTransaction(txData, signature, account.publicKeyEncoded)
        return queryRPC('sendrawtransaction', [rawTXData.toString('hex')], 2)
    })
}

export function getMarketPriceUSD(currency) {
    try{
        symbols = [ASSETS.NEO, ASSETS.GAS]
        
        return api.cmc.getPrices(symbols, currency)
    }catch(error){
        console.error(error)
        throw error
    }
}

export function getWalletDataFrom(url) {
    let options = {}
    let OVERRIDE_BASE_URL = true
    return request(url, options, OVERRIDE_BASE_URL).then(response => {
        try {
            data = {}
            data.scrypt = response.scrypt
            data.accounts = response.accounts.map(acc => {
                return { key: acc.key, label: acc.label }
            })
            return data
        } catch (error) {
            throw new Error('Wallet format invalid or corrupt')
        }
    })
}

/**
 * Get the balance of a NEP5 Token
 * @param {String} token hash (hex)
 * @param {String} public address of account to check token balance of
 * @returns {int} token abalance
 */

export function getTokenBalance(token, address) {
    const NETWORK_STORAGE_MULTIPLIER = 100000000
    return queryRPC('invokescript', [getTokenBalanceScript(token, address).toString('hex')], 2).then(response => {
        let valueBuf = Buffer.from(response.result.stack[0].value, 'hex')
        let value = parseInt(reverse(valueBuf).toString('hex'), 16) / NETWORK_STORAGE_MULTIPLIER

        if (isNaN(value)) {
            value = 0
        }
        return value
    })
}

/**
 *
 * @param {string} destinationAddress - The destination address.
 * @param {string} WIF - The WIF of the originating address.
 * @param {string} token - token scripthash (hex string).
 * @param {number} amount - of tokens to sent
 * @return {Promise<Response>} RPC Response
 */
export function SendNEP5Asset(destinationAddress, WIF, token, amount) {
    let assetId = getAssetId('Gas')
    const fromAccount = getAccountFromWIF(WIF)

    return getBalance(fromAccount.address).then(response => {
        const UTXOs = response.unspent['Gas']
        const txData = buildInvocationTransactionData(UTXOs, assetId, fromAccount.publicKeyEncoded, destinationAddress, amount, token)
        console.log(txData.toString('hex'))
        const signature = signTransactionData(txData, fromAccount.privateKey)
        const rawTXData = buildRawTransaction(txData, signature, fromAccount.publicKeyEncoded)

        return queryRPC('sendrawtransaction', [rawTXData.toString('hex')], 4)
    })
}
