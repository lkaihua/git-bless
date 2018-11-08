'use strict';

function addDefsMarker(svg, id, reversed=true) {
  const arrow = "M 0 0 0.04 0.02 0 0.04 0.01 0.02";
  const arrowReversed = "M 0 0.02 0.04 0.04 0.03 0.02 0.04 0"
  if (!svg.select("defs").size()) {
    svg.append("defs").append("marker")
      .attr("id", id)
      .attr("refX", 0.02)
      .attr("refY", 0.02)
      .attr("markerWidth", 0.10)
      .attr("markerHeight", 0.10)
      .attr("markerUnits","userSpaceOnUse")
      .attr("orient", "auto")
      .append("path")
      .attr("d", reversed ? arrowReversed : arrow)
      .style("fill", "black");
  } 
}

function layout(dag, w=500, h=500) {
  const padding = 0.01;
  const ratio = w / h;
  const duration = 400;
  const triangle = "triangle";
  
  const svg = d3.select('svg')
  const transition = d3.transition()
    .duration(750)
    .ease(d3.easeLinear);
  // TODO: reuse existing elements
  svg.selectAll('g').remove()
  
  const line = d3.line()
    .curve(d3.curveBasis)
    .x(d => d.x * ratio)
    .y(d => d.y);
  
  // add an arrow marker
  addDefsMarker(svg, triangle);
  
  const links = svg.select('.link').size() == 0 ? 
    svg.append('g').classed('link', true) :
    svg.select('.link');
  
  links.selectAll('path')
    .data(dag.links()).enter().append('path')
    // .transition(transition)
    .attr("marker-mid", `url(#${triangle})`)
    .attr('d', ({ source, target, data }) => {
      const path = line([{x: source.x, y: source.y}].concat(data.points || [], [{x: target.x, y: target.y}]));
      // return path;
      const [s, e] = path.split("L")
      // manually add a mid point for arrow
      return `${s}L${(source.x + target.x) * ratio / 2},${(source.y + target.y) / 2}L${e}`;
    })

  const nodes = svg.select('.node').size() == 0 ?
    svg.append('g').classed('node', true) :
    svg.select('.node');
    
  const nodesInside = nodes.selectAll('g').data(dag.descendants())
    .enter()
    .append('g')
    .on("click", function(d){
      console.log(d)
    })

  nodesInside.append('circle')
    .attr('r', 0.05)
    .attr('transform', ({x, y}) => `translate(${x * ratio}, ${y})`)

  nodesInside.append('text').text(d => d.id)
    .attr("dy", "0.3em")
    .attr('transform', ({x, y}) => `translate(${x * ratio}, ${y})`)

  // Measure and trim
  const { x, y, width, height } = svg.node().getBBox();
  console.log( x, y, width, height)
  svg.attr('viewBox', [x - padding, y - padding, width + 2 * padding, height + 2 * padding].join(' '));

  // Add text, which screws up measureement
  // nodes // set half of the font-size as the offset for vertical alignment
}
