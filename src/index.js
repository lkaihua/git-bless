import * as d3_original from 'd3';
import * as d3_dag from 'd3-dag';
import './style.css'
const d3 = Object.assign(d3_original, d3_dag);
// console.log(d3)

// const square = d3.selectAll("rect");
// square.style("fill", "orange");

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';

// import Button from '@material-ui/core/Button';
import App from './App';

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('#app')
);




// (async function() {
//   // const grafo = await fetch('grafo.json', { mode: 'no-cors' }).then(r => r.json());
//   const grafo = await fetch('./d3-examples/dag/grafo.json', { mode: 'no-cors' }).then(r => r.json());
//   draw(grafo)
//   // window.grafo = grafo
// })();

// fetch('./d3-examples/dag/grafo.json', { mode: 'no-cors' }).then(r => r.json()).then(draw)



// ReactDOM.render(<App />, document.querySelector('#app'));