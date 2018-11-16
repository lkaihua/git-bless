const initState = {
  activeStep: 0
};

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