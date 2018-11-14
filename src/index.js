// import * as d3 from 'd3';
// const square = d3.selectAll("rect");
// square.style("fill", "orange");

import React from 'react';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';
import Steps from './steps';


function App() {
  return (
    <div>
      <Button variant="contained" color="primary">
        Hello World
      </Button>
      <Steps></Steps>
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector('#app'));