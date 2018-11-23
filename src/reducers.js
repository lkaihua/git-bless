import { combineReducers } from "redux";
import * as actionTypes from "./actionTypes";

// const initState = {
//   activeStep: 0
// };

export function itemsHasErrored(state = false, action) {
  switch (action.type) {
      case actionTypes.ITEMS_HAS_ERRORED:
          return action.hasErrored;

      default:
          return state;
  }
}

export function itemsIsLoading(state = false, action) {
  switch (action.type) {
      case actionTypes.ITEMS_IS_LOADING:
          return action.isLoading;

      default:
          return state;
  }
}

export function items(state = [], action) {
  switch (action.type) {
      case actionTypes.ITEMS_FETCH_DATA_SUCCESS:
          return action.items;

      default:
          return state;
  }
}

// export function updateActiveStep(state = initState, action) {
//   switch (action.type) {
//     case actionTypes.UPDATE_ACTIVE_STEP:
//       return {activeStep: action.payload}

//     default:
//       return state;
//   }
// }

export function step(state = 0, action) {
  switch (action.type) {
    case actionTypes.UPDATE_ACTIVE_STEP:
      return action.step;

    default:
      return state;
  }
}

const rootReducer = combineReducers({
  items,
  itemsHasErrored,
  itemsIsLoading,
  step,
});

export default rootReducer;