import React from 'react';
import ItemList from "./ItemList";
import Painter from './Painter';
import Steps from './Steps';
// import data from '../data/merge_vs_rebase';
import data from "../data/merge_vs_rebase.json";

const App = () => {
  return (
    <div>
      {/* <ItemList></ItemList> */}
      <Painter data={data}></Painter>
      <Steps data={data}></Steps>
    </div>
  );
}

export default App;