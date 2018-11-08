'use strict';
function layout(dag) {
  const padding = 0.01;
  const svg = d3.select('svg');
  const line = d3.line()
    .curve(d3.curveBasis)
    .x(d => d.x)
    .y(d => d.y);
  
  // add an arrow marker
  svg.append("svg:defs").append("svg:marker")
    .attr("id", "triangle")
    .attr("refX", 0.02)
    .attr("refY", 0.02)
    .attr("markerWidth", 0.10)
    .attr("markerHeight", 0.10)
    .attr("markerUnits","userSpaceOnUse")
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 0.04 0.02 0 0.04 0.01 0.02")
    .style("fill", "black");

  svg.append('g').classed('link', true)
    .selectAll('path').data(dag.links()).enter().append('path')
    .attr("marker-mid", "url(#triangle)")
    .attr('d', ({ source, target, data }) => {
      const path = line([{x: source.x, y: source.y}].concat(data.points || [], [{x: target.x, y: target.y}]));
      const [s, e] = path.split("L")
      // manually add a mid point for arrow
      return `${s}L${(source.x + target.x)/2},${(source.y + target.y)/2}L${e}`;
    })
    
  const nodes = svg.append('g').classed('node', true)
    .selectAll('g').data(dag.descendants()).enter().append('g')
    .attr('transform', ({x, y}) => `translate(${x}, ${y})`);
  nodes.append('circle');

  // Measure and trim
  const { x, y, width, height } = svg.node().getBBox();
  svg.attr('viewBox', [x - padding, y - padding, width + 2 * padding, height + 2 * padding].join(' '));

  // Add text, which screws up measureement
  nodes.append('text').text(d => d.id)
    .attr('transform', () => `translate(0, 0.020)`)
}
