import { createActions, handleActions, combineActions } from "redux-actions";

const initState = {
  activeStep: 0
};

// TODO: understanding how to add action
// const { 
//   updateActiveStep
// } = createActions({
//   UPDATE_ACTIVE_STEP: (step) => ({})
// })

const rootReducer = (state = initState, action) => {
  switch (action.type) {
    case 'UPDATE_ACTIVE_STEP':
      return {activeStep: action.payload}

    default:
      return state;
  }
  // return state;
}

export default rootReducer;