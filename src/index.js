import * as d3_original from 'd3';
import * as d3_dag from 'd3-dag';
import './style.css'
const d3 = Object.assign(d3_original, d3_dag);
// console.log(d3)

// const square = d3.selectAll("rect");
// square.style("fill", "orange");

import React from 'react';
import ReactDOM from 'react-dom';
// import Button from '@material-ui/core/Button';
import Steps from './Steps';
import Paint from './Painter';

const GIT_MERGE_VS_REBASE = [ 
  {
    label: 'Select campaign settings',
    content: `For each ad campaign that you create, you can control how much
              you're willing to spend on clicks and conversions, which networks
              and geographical locations you want your ads to show on, and more.`,
  },
  {
    label: 'Create an ad group',
    content: 'An ad group contains one or more ads which target a shared set of keywords.',
  },
  {
    label: 'Create an ad 2',
    content: `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`
  },
];

function draw(raw) {
  // return;
  const dag = d3.dratify()(raw);
  // console.log(dag)
  d3.sugiyama()
    .layering(d3.layeringSimplex())
    .coord(d3.coordGreedy())
    (dag);
  // top-left to bottom-right
  dag.each(n => [n.x, n.y] = [n.y, n.x]);
  // dag.eachLinks(l => (l.data.points || []).forEach(p => [p.x, p.y] = [p.y, p.x + 0.03]));
  console.log(dag, dag.links(), dag.descendants())
  
  // paint(dag, 960, 500);
  ReactDOM.render(<App dag={dag}/>, document.querySelector('#app'));
}

// (async function() {
//   // const grafo = await fetch('grafo.json', { mode: 'no-cors' }).then(r => r.json());
//   const grafo = await fetch('./d3-examples/dag/grafo.json', { mode: 'no-cors' }).then(r => r.json());
//   draw(grafo)
//   // window.grafo = grafo
// })();

fetch('./d3-examples/dag/grafo.json', { mode: 'no-cors' }).then(r => r.json()).then(draw)

function App(dag) {
  return (
    <div>
      {/* <Button variant="contained" color="primary">
        Hello World
      </Button> */}
      <Paint data={dag}></Paint>
      <Steps steps={GIT_MERGE_VS_REBASE}></Steps>
    </div>
  );
}

// ReactDOM.render(<App />, document.querySelector('#app'));