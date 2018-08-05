import { all } from 'redux-saga/effects'
import { rootWalletSaga } from './wallet'
import { rootAuthSaga } from './auth'

export default function* rootSaga() {
    yield all([rootWalletSaga(), rootAuthSaga()])
}
