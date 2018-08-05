import { delay } from 'redux-saga'
import { put, takeEvery, call, all, takeLatest, select, fork, take, cancel, cancelled, race } from 'redux-saga/effects'
import { ActionConstants as actions } from '../actions'
import { DropDownHolder } from '../utils/DropDownHolder'
import {user_login,userSignup,saveUser} from '../api/user/login'


export function* rootAuthSaga() {
    yield all([watchLoginUser(),watchSignupUser()])
}

export function* watchLoginUser() {  
    // expanded to make testable with redux-saga-mock
           const params = yield take(actions.auth.LOGIN_USER)
           yield fork(loginUserFlow, params)
    
}

export function* watchSignupUser(){
    while(true){
        const params = yield take(actions.auth.SIGNUP_USER)
        yield fork(signupUserFlow,params)
    }
}


export function* loginUserFlow(args) {
    alert('args'+args.userName)
        try {
        yield put({ type: actions.auth.LOGIN_USER_START })
        yield call(delay, 1000) // to give the UI-thread time to show the 'generating view'  
        const result = yield call(user_login, args.userName, args.password) 
     //  alert(result.uid)// too computational heavy. Blocks Animations.
      
       yield put({ type: actions.auth.LOGIN_USER_SUCCESS, data: result })
    } catch (error) {
        yield put({ type: actions.auth.LOGIN_USER_ERROR, error })
        DropDownHolder.getDropDown().alertWithType('error', 'Error', error)
    }
}

export function* signupUserFlow(args){
    try{
        yield put({type: actions.auth.SIGNUP_USER_START})
        yield call(delay,1000)
        const result= yield call(userSignup,args.userName,args.password)
        const response= yield call(saveUser,result.user,args.userName,args.password,args.phoneno)
        yield put({type: actions.auth.SIGNUP_USER_SUCCESS, data: result})
    }catch(error){
        yield put({type: actions.auth.SIGNUP_USER_ERROR,error})
        DropDownHolder.getDropDown().alertWithType('error','Error',error)
    }
}