'use strict';

function addOnceArrowMarker(svg, id, reversed = true) {
  const arrow = "M 0,0 0.04,0.02 0,0.04 0.01,0.02";
  const arrowReversed = "M 0,0.02 0.04,0.04 0.03,0.02 0.04,0"

  if (!svg.select(`marker#${id}`).size()) {
    svg.append("defs").append("marker")
      .attr("id", id)
      .attr("refX", 0.02)
      .attr("refY", 0.02)
      // .attr("markerWidth", 0.10)
      // .attr("markerHeight", 0.10)
      .attr("markerUnits", "userSpaceOnUse")
      .attr("orient", "auto")
      .append("path")
      .attr("d", reversed ? arrowReversed : arrow)
      .style("fill", "black");
  }
}

function abbreviate(name, maxLength=10) {
  if(!name){
    return null;
  }

  
  if (name.length > maxLength) {
    return name.slice(0, maxLength - 2) + ".."
  } 
  return name;
}

function layout(dag, w = 500, h = 500) {
  const padding = {
    top: 0.05,
    right: 0.02,
    bottom: 0.05,
    left: 0.02
  };
  const ratio = w / h;
  const duration = 400;
  const radius = 0.05;
  const triangle = "triangle";

  const svg = d3.select('svg')
  // svg.attr('viewBox', `-0.1 -0.1 ${ratio + 0.2} 1.2`)
  
  const line = d3.line()
    .curve(d3.curveLinear)
    .x(d => d.x * ratio)
    .y(d => d.y);

  addOnceArrowMarker(svg, triangle);

  // Nodes and links are sorted to make sure
  // the last added items are in the tail,
  // so the animation is correct.
  const sortedNodes = dag.descendants()
  sortedNodes.sort((a, b) => {
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

  const tags = svg.select('.tag').size() == 0 ?
    svg.append('g').classed('tag', true) :
    svg.select('.tag');

  const allTags = tags.selectAll('g').data(sortedNodes);
  // console.log(sortedNodes)
  
  const filledTags = allTags.enter().filter(d => d.data.branches && d.data.branches.length)
    .append("g")
      .attr('transform', ({x, y}) => `translate(${x * ratio}, ${y})`)
  
  filledTags.append("g").classed("tag-box", true).html(d => {
    const branches = d.data.branches;
    const template = branches.map((branch,index) => {
      return `<rect x="-0.1" y="${radius + index * 0.07}" width="0.2" height="0.06"></rect>`
    })
    return template.join("")
  })

  // filledTags
  //   .append('rect')
  //     .attr('x', -0.1)
  //     .attr('y', radius + 0.01)
  //     .attr('width', 0.2)
  //     .attr('height', 0.06)
  //     .attr('rx', 0.01)
  //     .attr('ry', 0.01)

  allTags.filter(d => !d.data.branches || !d.data.branches.length)
    .transition()
    .style("opacity", 0)
    .duration(duration)
    .remove()

  const links = svg.select('.link').size() == 0 ?
    svg.append('g').classed('link', true) :
    svg.select('.link');

  // Delay displaying `marker-mid` marker and other data points
  // to the animation stage for two reasons:
  // 1. A safari bug. Rendering mid point will overwrite part of circles
  // 2. The initial animation of arrows looks quite cool :)
  links.selectAll('path')
    .data(sortedLinks).enter().append('path')
    .attr('d', ({source, target, data}) => line(
      [{
        x: source.x,
        y: source.y
      }].concat(data.points || [], [{
        x: target.x,
        y: target.y
      }])
    ));

  const nodes = svg.select('.node').size() == 0 ?
    svg.append('g').classed('node', true) :
    svg.select('.node');

  const enterNode = nodes.selectAll('g').data(sortedNodes)
    .enter()
    .append('g')

  enterNode
    .attr('transform', ({x, y}) => `translate(${x * ratio}, ${y})`)
    .on("click", function (d) {
      console.log(d)
    })
    .append('circle')
    .attr('r', radius)


  
    
  /**
   * Measure and trim.
   * Must be called before adding text, otherwise adding text 
   * screws up measurement in Safari.
   */
  const {
    x,
    y,
    width,
    height
  } = svg.node().getBBox();
  svg.attr('viewBox',
    [ 
      x - padding.left, 
      y - padding.top, 
      width + padding.left + padding.right, 
      height + padding.top + padding.bottom,
    ].join(' ')
  );

  // 
  // enterNode.selectAll('.branch').data(sortedNodes).enter()
  //   .append('text').classed('branch', true).text(d => {
  // filledTags.append('text')
  //   .classed('branch-text', true)
  //   .text(d => abbreviate(d.data.branches))
  //   .attr("dy", "0.1")


  filledTags.append('g').html(d => {
    const branches = d.data.branches;
    const template = branches.map((branch,index) => {
      return `<text class="branch-text" dy="${radius + index * 0.07 + 0.04}">${branch}</text>`
    })
    return template.join("")
  })  

  enterNode.append('text').text(d => d.id)
    .attr("dy", "0.015")

  // enterNode.append('rect')
  //   .attr("width", 0.1)
  //   .attr("x", -0.05)
  //   .attr("y", 0)
  //   .attr("height", 0.1)
  //   .classed("branch-tag", true)

  // Animations
  links.selectAll('path')
    .transition()
    .duration(duration)
    .attr("marker-mid", `url(#${triangle})`)
    .attr('d', ({source, target, data}) => {
      const path = line(
        [{
          x: source.x,
          y: source.y
        }].concat(data.points || [], [{
          x: target.x,
          y: target.y
        }])
      );
      // return path;
      const [s, e] = path.split("L");
      // manually add a mid point for arrow
      return `${s}L${(source.x + target.x) * ratio / 2},${(source.y + target.y) / 2}L${e}`;
    })

  nodes.selectAll('g')
    .transition()
    .duration(duration)
    .attr('transform', ({x, y}) => `translate(${x * ratio}, ${y})`)

  nodes.selectAll('circle')
    .classed('head', d => !!d.data.head)

  // filledTags.selectAll('g')
  //   .transition()
  //   .duration(duration)
  //   .attr('transform', ({x, y}) => `translate(${x * ratio}, ${y})`)
  
}