import { ActionConstants as actions } from '../actions'


export default function auth(state = {}, action) {
    switch (action.type) {
        case actions.auth.LOGIN_USER_START:
            return { ...state, generating: true }
        case actions.auth.LOGIN_USER_SUCCESS:
            
            return {
                ...state,
                user: action.data.user,
                generating: false
            }
        case actions.auth.SIGNUP_USER_START:
            return { ...state, generating: true }
        case actions.auth.SIGNUP_USER_SUCCESS:           
            return {
                ...state,
                user: action.data.user,
                generating: false
            }

            case actions.auth.RESET_USER_STATE:
            return {
                ...state,
                 user:null
            }

        
        default:
            return state
    }
}
