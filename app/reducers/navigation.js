import { RootStackNavigator } from '../navigators/RootNavigationConfiguration'
import { NavigationActions, StateUtils } from 'react-navigation'
import { ActionConstants as actions } from '../actions'

export default function navigation(state, action) {
    switch (action.type) {
        case actions.wallet.TOGGLE_USER_SUCCESS:
            if(action.roleType==='Regular'){
            return RootStackNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'WalletInfo',
                    params: {}
                }),
                state
            )
        }
        else{
            return RootStackNavigator.router.getStateForAction(
                NavigationActions.navigate({
                    routeName: 'WalletInfoAdvance',
                    params: {}
                }),
                state
            )
        }
        case actions.wallet.LOGOUT:
            let reset_action = NavigationActions.reset({
                index: 0,
                actions: [{ type: NavigationActions.NAVIGATE, routeName: 'Login' }],
                key: null
            })
            return RootStackNavigator.router.getStateForAction(reset_action, state)

        default:
            let newState = RootStackNavigator.router.getStateForAction(action, state)
            return newState ? newState : state
    }
}
