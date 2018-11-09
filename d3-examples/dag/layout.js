'use strict';

function addOnceArrowMarker(svg, id, reversed=true) {
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

  const line = d3.line()
    .curve(d3.curveBasis)
    .x(d => d.x * ratio)
    .y(d => d.y);
  
  addOnceArrowMarker(svg, triangle);

  // Nodes and links are sorted to make sure
  // the last added items are in the tail,
  // so the animation is correct.
  const sortedNodes = dag.descendants()
  sortedNodes.sort((a,b) => {
    return a.id - b.id;
  })
  const sortedLinks = dag.links();
  sortedLinks.sort((a, b) => {
    const targetOrder = a.target.id - b.target.id;
    if (targetOrder == 0) {
      return a.source.id - b.source.id;
    }
    return targetOrder;
  })
  
  const links = svg.select('.link').size() == 0 ? 
    svg.append('g').classed('link', true) :
    svg.select('.link');
  
  // Delay displaying `marker-mid` marker and other data points
  // to the animation stage for two reasons:
  // 1. A safari bug. Rendering mid point will overwrite part of circles
  // 2. The animation of displaying arrows truns out to quite cool :)
  links.selectAll('path')
    .data(sortedLinks).enter().append('path')
    .attr('d', ({ source, target, data }) => line([{x: source.x, y: source.y}].concat(data.points || [], [{x: target.x, y: target.y}])));

  const nodes = svg.select('.node').size() == 0 ?
    svg.append('g').classed('node', true) :
    svg.select('.node');
    
  const enterNode = nodes.selectAll('g').data(sortedNodes)
    .enter()
    .append('g')
    .attr('transform', ({x, y}) => `translate(${x * ratio}, ${y})`)
    .on("click", function(d){
      console.log(d)
    })

  enterNode.append('circle')
    .attr('r', 0.05)
    .classed('head', d => !!d.data.head)
    

  // Measure and trim
  const { x, y, width, height } = svg.node().getBBox();
  svg.attr('viewBox', [x - padding, y - padding, width + 2 * padding, height + 2 * padding].join(' '));

  // Add text, which screws up measurement in Safari
  enterNode.append('text').text(d => d.id)
    .attr("dy", "0.02") // set the offset for vertical alignment

    
  // Animations
  links.selectAll('path')
    .transition()
    .duration(duration)
    .attr("marker-mid", `url(#${triangle})`)
    .attr('d', ({ source, target, data }) => {
      const path = line([{x: source.x, y: source.y}].concat(data.points || [], [{x: target.x, y: target.y}]));
      // return path;
      const [s, e] = path.split("L")
      // manually add a mid point for arrow
      return `${s}L${(source.x + target.x) * ratio / 2},${(source.y + target.y) / 2}L${e}`;
    })

  nodes.selectAll('g')
    .transition()
    .duration(duration)
    .attr('transform', ({x, y}) => `translate(${x * ratio}, ${y})`)
    .select('text').text(d => d.id)

  // nodes.selectAll('circle')
    // .classed('head', function(d){
    //   if (d.data.head) {
    //     return true;
    //   } 
    //   return false;
    // })
}

// function layout(dag, w=500, h=500) {
//   const padding = 0.01;
//   const ratio = w / h;
//   const duration = 400;
//   const triangle = "triangle";
  
//   const svg = d3.select('svg')
  
//   const transition = d3.transition()
//     .duration(750)
//     .ease(d3.easeLinear);
//   // TODO: reuse existing elements
//   // svg.selectAll('g').remove()

//   const line = d3.line()
//     .curve(d3.curveBasis)
//     .x(d => d.x * ratio)
//     .y(d => d.y);
  
//   // add an arrow marker
//   addDefsMarker(svg, triangle);
  
//   const links = svg.select('.link').size() == 0 ? 
//     svg.append('g').classed('link', true) :
//     svg.select('.link');
  
//   const enterLinks = links.selectAll('path')
//     .data(dag.links()).enter().append('path')

//   enterLinks
//     .attr("marker-mid", `url(#${triangle})`)
//     .attr('d', ({ source, target, data }) => {
//       const path = line([{x: source.x, y: source.y}].concat(data.points || [], [{x: target.x, y: target.y}]));
//       // return path;
//       const [s, e] = path.split("L")
//       // manually add a mid point for arrow
//       return `${s}L${(source.x + target.x) * ratio / 2},${(source.y + target.y) / 2}L${e}`;
//     })


//   const nodes = svg.select('.node').size() == 0 ?
//     svg.append('g').classed('node', true) :
//     svg.select('.node');
    
//   const nodesInside = nodes.selectAll('g').data(dag.descendants())
//     .enter()
//     .append('g')
//     .on("click", function(d){
//       console.log(d)
//     })
//     .attr('transform', ({x, y}) => `translate(${x * ratio}, ${y})`)

//   nodesInside.append('circle')
//     .attr('r', 0.05)
//     .classed('head', function(d){
//       if (d.data.head) {
//         return true;
//       } 
//       return false;
//     })

//   // nodesInside.exit().remove();

//   // Measure and trim
//   const { x, y, width, height } = svg.node().getBBox();
//   svg.attr('viewBox', [x - padding, y - padding, width + 2 * padding, height + 2 * padding].join(' '));

//   // Add text, which screws up measurement in Safari
//   nodesInside.append('text').text(d => d.id)
//     .attr("dy", "0.02") // set half of the font-size as the offset for vertical alignment
  
  
// }
