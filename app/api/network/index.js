import request from './request'
import axios from 'axios'
import { api, rpc,wallet,u,sc,settings } from '@cityofzion/neon-js'
import Neon from '@cityofzion/neon-js'
import {
    getAccountFromWIF,
    buildClaimTransactionData,
    buildRawTransaction,
    signTransactionData
} from '../crypto'
import { ASSETS,SCRIPTHASH } from '../../core/constants'
import { toBigNumber,toNumber } from '../../core/math'
import { COIN_DECIMAL_LENGTH } from '../../core/formatters'
import { filter, reduce } from 'lodash'
import { getTokenBalanceScript, buildInvocationTransactionData } from '../crypto/nep5'
import { reverse } from '../crypto/utils'

export const NEO_ID = 'c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b'
export const GAS_ID = '602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7'
settings.httpsOnly=true
const assets={}
export async function getBalance(net,address,wif) {
    try{
        const config = {
            net,
            script: Neon.create.script({
                scriptHash: SCRIPTHASH[net],
                operation: 'balanceOf',
                args: [Neon.u.reverseHex(wallet.getScriptHashFromAddress(address))]
              }),
            address:address,
            privateKey:wif,
            gas: 0
          }
          const res=await api.doInvoke({
            ...config
          }, api.neoscan)

          const assets=await res.balance.assets
          const neoBalance = assets.NEO ? assets.NEO.balance.toString() : '0'
          const yezBalance = assets['YEZCOIN'] ? assets['YEZCOIN'].balance.toString() : '0'
          const gasBalance = assets.GAS ? assets.GAS.balance.round(COIN_DECIMAL_LENGTH).toString() : '0'
          return { [ASSETS.NEO]: neoBalance, [ASSETS.GAS]: gasBalance,[ASSETS.YEZ]: yezBalance, assets }
        }catch(error){
            throw error
        }
}

export async function getWalletDBHeight(net) {
    try{
        const endpoint = await api.getRPCEndpointFrom({ net }, api.neoscan)   
        const client = new rpc.RPCClient(endpoint)
        return client.getBlockCount()
        }catch(error){
            throw error
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

  export async function getAssetName(asset,net){
    try{
    if(assets[asset]){
        return assets[asset]
    }
    if(asset==='c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b'){
        return 'NEO'
    }
    else if(asset==='602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7'){
        return 'GAS'
    }
    else if(asset.length==40){
          const props = {
        scriptHash: asset, // Scripthash for the contract
        operation: 'symbol', // name of operation to perform.
        args: [] // any optional arguments to pass in. If null, use empty array.
      }
      const endpoint = await api.getRPCEndpointFrom({ net }, api.neoscan)
      const script =await Neon.create.script(props)
      if(endpoint && script)
      {const res=await rpc.Query.invokeScript(script).execute(endpoint)
      const name=Neon.u.hexstring2str(res.result.stack[0].value)
      assets[asset]=name
      return name
      }
    }
    return undefined
}catch(error){
    if(assets[asset]){
        return assets[asset]
    }
    return undefined
}
    
}


export async function getTransactionHistory(net,address,roleType) {
    try{
        var i=1
  const endpoint = api.neoscan.getAPIEndpoint(net)
  const res1=await axios.get(`${endpoint}/v1/get_address_abstracts/${address}/1`)
  const transactions1=res1.data
  var final=[]
  
  while(i<=transactions1.total_pages){
    const res=await axios.get(`${endpoint}/v1/get_address_abstracts/${address}/${i}`)
    const transactions=res.data
    const test=await Promise.all(transactions.entries.map(async({txid,amount,time,asset,address_to})=>({
        txid,
        amount:address_to===address?amount:-amount,
        time,
        asset:await getAssetName(asset,net),
      })))

      if(roleType==='Advance'){
        for(var x=0;x<test.length;x++){
            final.push(test[x])
      }
      }

      else{
        for(var x=0;x<test.length;x++){
            if(test[x].asset==='YEZ')
            final.push(test[x])
      }      
      }
      //final=final===[]?test:final.push(test)
      i++
  }
        return final
}catch(error){
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
    
    try{
      const scriptHash=SCRIPTHASH[net]
      const fromAcct = new wallet.Account(senderAddress)
      const scriptBuilder = new sc.ScriptBuilder()
      const toAcct = new wallet.Account(destinationAddress)
      const intent=[]
      const args = [
        u.reverseHex(fromAcct.scriptHash),
        u.reverseHex(toAcct.scriptHash),
        sc.ContractParam.byteArray(toNumber(amount), 'fixed8', 8)
      ]
      scriptBuilder.emitAppCall(scriptHash, 'transfer', args)
      const script=scriptBuilder.str
      const config = {
        net:net, // The network to perform the action, MainNet or TestNet.
        address: senderAddress,  // This is the address which the assets come from.
        privateKey: WIF,
      }     
      const result=await api.doInvoke({
        ...config,
        intents: intent,
        script,
        gas: 0
      }, api.neoscan)
      return result.response
    }catch(error){
        throw error
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

export async function getMarketPriceUSD(currency) {
    try{
        symbols = [ASSETS.NEO, ASSETS.GAS]

    // const price=await api.cmc.getPrices('CTX', currency)
    // alert(price)
    //console.log(res.json())
    const usdPrice=await api.cmc.getPrices(symbols, 'USD')
    let price=await api.cmc.getPrices(symbols, currency)
    price['YEZ']=(price.NEO/usdPrice.NEO)*0.20
    return price
    }catch(error){
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
