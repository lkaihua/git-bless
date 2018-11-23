import React from 'react';
import { connect } from "react-redux";
import * as d3_ from 'd3';
import * as d3_dag from 'd3-dag';
const d3 = Object.assign(d3_, d3_dag);

// import treeData from "../data/merge_vs_rebase.json";
import { hash } from "../utils/hash";


const mapStateToProps = state => ({
  step: state.step
});

class Painter extends React.Component {
  constructor(props){
    super(props);
    this.svg = null;
    this.cache = {};
    // console.log(treeData);
    this.layout = this.layout.bind(this);
    this.parse = this.parse.bind(this);
  }

  componentDidMount() {
    
    this.layout(this.parse(this.props.data, this.props.step), this.svgNode, 2, 1);
    // console.log(this.props)
    // this.layout(this.props.data.dag, this.svgNode, 2, 1);
  }

  componentDidUpdate() {
    // console.log(this.props)
    this.layout(this.parse(this.props.data, this.props.step), this.svgNode, 2, 1);
  }

  render() {
    return (
      <div>
        <svg ref={n => this.svgNode = n}></svg>
      </div>
    )
  }

  parse(data, step) {
    const raw = data[step]["graph"]; 

    const dag = d3.dratify()(raw);
    d3.sugiyama()
      .layering(d3.layeringSimplex())
      .coord(d3.coordGreedy())
      (dag);
    // top-left to bottom-right
    dag.each(n => [n.x, n.y] = [n.y, n.x]);
    // console.error('dag', dag)
    return dag;
  }

  layout(dag, svgNode, w = 500, h = 500) {
    // console.log(dag)
    // const svg = d3.select('svg');
    if (!dag || !svgNode) {
      return;
    }
    const svg = d3.select(svgNode)
    const radius = 0.05;
    const padding = {
      top: 0.06,
      right: 0.02,
      bottom: 0.06,
      left: 0.02
    };
    const ratio = w / h;
    const duration = 400;
    const triangle = "triangle";
    const line = d3.line()
      .curve(d3.curveLinear)
      .x(d => d.x * ratio)
      .y(d => d.y);

  
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
  
    /** Add svg defs */
    addOnceArrowMarker(svg, triangle);
  
    /** 
     * 
     * Links: the directed edges between nodes.
     *  
     * Here we draw links in lower canvas layers, so other elements 
     * will not be covered by links.
     * 
     **/
    const links = svg.select('.link').size() == 0 ?
      svg.append('g').classed('link', true) :
      svg.select('.link');
  
    const allLinks = links.selectAll('path').data(sortedLinks)
    
    allLinks.enter()
      .append('path')
      // .attr('d', ({source, target, data}) => line(
      //   [{
      //     x: source.x,
      //     y: source.y
      //   }].concat(data.points || [], [{
      //     x: target.x,
      //     y: target.y
      //   }])
      // ));
        .attr('d', ({source, target, data}) => {  // add the data points in the middle
          const path = line(
            [{
              x: source.x,
              y: source.y
            }].concat(data.points || [], [{
              x: target.x,
              y: target.y
            }])
          );
          // return path; // draw lines, without arrows
          const [s, e] = path.split("L");
          // add a mid point for arrow
          const mid_x = (source.x + target.x) * ratio / 2;
          const mid_y = (source.y + target.y) / 2;
          return `${s} L ${mid_x},${mid_y} L ${e}`;
        })
      
    
    allLinks.exit().remove();

  
    /**
     * 
     * Nodes: each node has a circle, an id inside of it, and a hash text
     * 
     */
  
    const nodes = svg.select('.node').size() == 0 ?
      svg.append('g').classed('node', true) :
      svg.select('.node');
  
    // const allNodes = nodes.selectAll('g')
    const allNodes = nodes.selectAll('g').data(sortedNodes, d => d)
    
    const enterNodes = allNodes.enter().append('g')
  
    enterNodes
        .attr('transform', ({x, y}) => `translate(${x * ratio}, ${y})`) 
        .on("click", function (d) {
          // Output the info of this node, including {id, layer, x, y, children, data}
          console.log(d)
        })
      .append('circle')
        .style('opacity', 0)
        .attr('r', radius)
        .classed('isBranch', d => !!d.data.tags && d.data.tags.length)
        .classed('isMaster', d => !!d.data.tags && d.data.tags.includes("master"))
        .classed('isHead', d => !!d.data.head)
        .transition().duration(duration)
        .style("opacity", 1)
        
    allNodes.exit()
      .transition().duration(duration)
      .style('opacity', 0)
      .remove();

    allNodes.transition()
      .duration(duration)
      .attr('transform', ({x, y}) => `translate(${x * ratio}, ${y})`)
      
    

    // nodes.selectAll('circle')
    //   .classed('isBranch', d => !!d.data.tags && d.data.tags.length)
    //   .classed('isMaster', d => !!d.data.tags && d.data.tags.includes("master"))
    //   .classed('isHead', d => !!d.data.head)
  
    /**
     * Tags: HEAD tag, branch tag name and background box.
     */
    const tags = svg.select('.tag').size() == 0 ?
      svg.append('g').classed('tag', true) :
      svg.select('.tag');
    
    const allTags = tags.selectAll('g.tag-item').data(sortedNodes, d => d);
    
    const filledTags = allTags.enter()//.filter(d => d.data.tags && d.data.tags.length)
      .append("g").classed('tag-item', true)
    
    filledTags
        .attr('transform', ({x, y}) => `translate(${x * ratio}, ${y})`)
      .append("g").classed("tag-box", true).html(d => updateTagBox(d))
    
    allTags.selectAll('.tag-box').html(d => updateTagBox(d))
    allTags.exit().remove();
  

    /**
     * Measure and trim.
     * Must be called before adding text, otherwise adding text 
     * screws up measurement in Safari.
     *
     * Lesson learnt: dynamically update viewBox is problematic.
     * Resize it when intialized and keep it fixed.
     */
    // if (!this.cache.resized && svg && svg.size()) {
    //   try {
    //     const {
    //       x,
    //       y,
    //       width,
    //       height
    //     } = svg.node().getBBox();
    //     // console.log("resize:", x, y, width, height)
    //     svg.attr('viewBox',
    //       [
    //         x - padding.left,
    //         y - padding.top,
    //         width + padding.left + padding.right,
    //         height + padding.top + padding.bottom,
    //       ].join(' ')
    //     )
    //     this.cache.resized = true;
    //   } catch (e) {
    //     console.error("Fail to call getBBox on <svg></svg>.");
    //   }
    // }
    
    // if (svg && svg.size() && !this.cache.box) {
    //   this.cache.bbox = svg.node().getBBox();
    //   console.log(this.cache.bbox)
    //   svg.attr('viewBox',
    //     [
    //       this.cache.bbox.x - padding.left,
    //       this.cache.bbox.y - padding.top,
    //       this.cache.bbox.width + padding.left + padding.right,
    //       this.cache.bbox.height + padding.top + padding.bottom,
    //     ].join(' ')
    //   )
    // }
    if (svg && svg.size() && !this.cache.bbox) {
      this.cache.bbox = svg.node().getBBox();
    }
    
    
  
    /**
     * 
     * Add text after updating view box
     * 
     */
  
    filledTags.append('g').classed("tag-text", true).html(d => updateTagText(d))  
  
    allTags.selectAll('.tag-text').html(d => updateTagText(d))
  
    enterNodes.append('text').text(d => d.data.name || d.id)
      .attr("dy", "0.015");
  
    enterNodes.append('text').text(d => d.data.hash || hash(d.id))
      .attr("dy", "0.08").classed("hashText", true)

    /**
     * 
     * Animations
     * 
     */
  
  
    // nodes.selectAll('g')
    //   .transition()
    //   .duration(duration)
    //   .attr('transform', ({x, y}) => `translate(${x * ratio}, ${y})`)
  
  
    tags.selectAll('g.tag-item')
      .transition()
      .duration(duration)
      .attr('transform', ({x, y}) => `translate(${x * ratio}, ${y})`)

    links.selectAll('path')
      .transition()
      .duration(duration)
      .attr("marker-mid", `url(#${triangle})`)  // add arrow style
      .attr('d', ({source, target, data}) => {  // add the data points in the middle
        const path = line(
          [{
            x: source.x,
            y: source.y
          }].concat(data.points || [], [{
            x: target.x,
            y: target.y
          }])
        );
        // return path; // draw lines, without arrows
        const [s, e] = path.split("L");
        // add a mid point for arrow
        const mid_x = (source.x + target.x) * ratio / 2;
        const mid_y = (source.y + target.y) / 2;
        return `${s} L ${mid_x},${mid_y} L ${e}`;
      })

    // const all = d3.selectAll("g, path");
    // // console.log(all)
    // all.transition().call(endall, function() { 
    //   console.log("all done") 
    //   // repaint to fix bug in safari
    //   // d3.select('g.link').attr('overflow', 'auto')
    // })
      
    svg.transition().duration(duration).delay(0).on('end', () => {
      // console.log('svg transition done')
      const newBBox = svg.node().getBBox();
      // console.log(this.cache.bbox, newBBox)
      let bbox = this.cache.bbox;

      const findMax = o => {
        return Math.max(o.x, o.y, o.width, o.height)
      }
      
      if (findMax(newBBox) > 2 * findMax(bbox)) {
        // the <text> layout has caused a bug of calculation of size in Safari
      }       
      else if (newBBox.height < bbox.height) {
        // or height decreases
      }
      else {
        this.cache.bbox = newBBox
      }
      
      bbox = this.cache.bbox;
      bbox && bbox.x && svg.attr('viewBox',
        [
          bbox.x - padding.left,
          bbox.y - padding.top,
          bbox.width + padding.left + padding.right,
          bbox.height + padding.top + padding.bottom,
        ].join(' ')
      )
      // d3.select('g.link').attr('overflow', 'auto')
    })
      
    
  }
  
}

function addOnceArrowMarker(svg, id, reversed = true) {
  if (svg.select(`marker#${id}`).size()) {
    return;
  }

  const unit = 0.0075;
  // `M 0,0 4,2 0,4 1,2`; => each number multiplied by unit
  const reducer = (acc, current) => acc + " " + current.map(x => x * unit).join(",")
  const arrow = [[0,0], [4,2], [0,4], [1,2]].reduce(reducer, "M");
  const arrowReversed = [[0,2], [4,4], [3,2], [4,0]].reduce(reducer, "M");;

    svg.append("defs").append("marker")
      .attr("id", id)
      .attr("refX", 2 * unit)
      .attr("refY", 2 * unit)
      // .attr("markerWidth", 0.10)
      // .attr("markerHeight", 0.10)
      .attr("markerUnits", "userSpaceOnUse")
      .attr("orient", "auto")
      .append("path")
      .attr("d", reversed ? arrowReversed : arrow)
      .style("fill", "black");
  }

function abbreviate(name, maxLength=10) {
  if (!name) {
    return null;
  }
  if (name.length > maxLength) {
    return name.slice(0, maxLength - 2) + "..";
  } 
  return name;
}


function updateTagBox(d) {
  const radius = 0.05;
  const branchBoxes = d.data.tags && d.data.tags.length ? 
    d.data.tags.map((branch,index) => {
      let branchType;
      let y = radius + 0.04 + index * 0.07;
      switch (branch) {
        case "master":
          branchType = "isMaster";
          break;
  
        default:
          branchType = "isBranch";
          break;
      }
      return `<rect class="${branchType}" rx="0.01" ry="0.01" x="-0.1" y="${y}" width="0.2" height="0.06"></rect>`
    }) : []; 
  const headBox = "" // d.data.head ? `<rect class="isHead" rx="0.01" ry="0.01" x="-0.05" y="-0.16" width="0.1" height="0.06"></rect>` : "";
  return [...branchBoxes, headBox].join("");
}

function updateTagText(d){
  const radius = 0.05;
  const branchTexts = d.data.tags && d.data.tags.length ? 
    d.data.tags.map((tag,index) => {
      return `<text class="branchText" dy="${radius + 0.02 + index * 0.07 + 0.06}">${abbreviate(tag)}</text>`
    }) : [];
  const headText = d.data.head ? `<text class="headText" dy="${-radius - 0.02}">HEAD</text>`: ""
  return [...branchTexts, headText].join("")
}

/**
 * 
 * @param {*} transition 
 * @param {*} callback 
 * d3.selectAll("g").transition().call(endall, function() { console.log("all done") })
 */
function endall(transition, callback) { 
  if (typeof callback !== "function") throw new Error("Wrong callback in endall");
  if (transition.size() === 0) { callback() }
  let n = 0; 
  transition 
      .each(function() { ++n; }) 
      .on("end", function() { if (!--n) callback.apply(this, arguments); }); 
} 



const connectedPainter = connect(mapStateToProps)(Painter)
export default connectedPainter;
// export default Painter;