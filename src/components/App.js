import React from 'react';
import Steps from './Steps';
import Painter from './Painter';
// import data from '../data/merge_vs_rebase';
import data from "../data/merge_vs_rebase.json";

const App = () => {
  return (
    <div>
      <Painter data={data}></Painter>
      <Steps data={data}></Steps>
    </div>
  );
}

export default App;