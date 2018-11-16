import React from 'react';
import Steps from './Steps';
import Painter from './Painter';
import data from './data/merge_vs_rebase'; 

const App = (dag) => {
  return (
    <div>
      <Painter></Painter>
      <Steps steps={data}></Steps>
    </div>
  );
}

export default App;