const LOGIN_USER = 'LOGIN_USER'
const LOGIN_USER_START = 'LOGIN_USER_START'
const LOGIN_USER_SUCCESS = 'LOGIN_USER_SUCCESS'
const LOGIN_USER_ERROR = 'LOGIN_USER_ERROR'
const SIGNUP_USER = 'SIGNUP_USER'
const SIGNUP_USER_START = 'SIGNUP_USER_START'
const SIGNUP_USER_SUCCESS = 'SIGNUP_USER_SUCCESS'
const SIGNUP_USER_ERROR = 'SIGNUP_USER_ERROR'
const RESET_USER_STATE='RESET_USER_STATE'


export const constants = {
    LOGIN_USER,
    LOGIN_USER_START,
    LOGIN_USER_SUCCESS,
    LOGIN_USER_ERROR,
    SIGNUP_USER,
    SIGNUP_USER_START,
    SIGNUP_USER_SUCCESS,
    SIGNUP_USER_ERROR,
    RESET_USER_STATE

}


export function loginUser(userName, password) {
  //  alert(userName)
    return {
        type: LOGIN_USER,
        userName,
        password
    }
}

export function resetUserState() {
    return {
        type: RESET_USER_STATE
    }
}

export function signupUser(userName,password,phoneno){
    return{
        type: SIGNUP_USER,
        userName,
        password,
        phoneno
    }
}
