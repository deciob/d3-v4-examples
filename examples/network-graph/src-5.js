'use strict';

const nodes = [
  {index: 0,  type: 'rootNode', weight: 1,   level: 0},
  {index: 1,  type: 'linkNode', weight: 0.2, level: 0.5},
  {index: 2,  type: 'node',     weight: 0.7, level: 1},
  {index: 3,  type: 'node',     weight: 0.7, level: 1},
  {index: 4,  type: 'node',     weight: 0.7, level: 1},
  {index: 5,  type: 'node',     weight: 0.7, level: 1},
  {index: 6,  type: 'node',     weight: 0.7, level: 1},
  {index: 7,  type: 'node',     weight: 0.7, level: 1},

  {index: 8,  type: 'linkNode', weight: 0.2, level: 1.5},
  {index: 9,  type: 'node',     weight: 0.7, level: 2},
  {index: 10, type: 'node',     weight: 0.7, level: 2},
  {index: 11, type: 'linkNode', weight: 0.2, level: 1.5},
  {index: 12, type: 'node',     weight: 0.7, level: 2, connections: true},

  {index: 13,  type: 'linkNode', weight: 0.2, level: 2},
];

const links = [
  {source: 0,  target: 1},
  {source: 1,  target: 2},
  {source: 1,  target: 3},
  {source: 1,  target: 4},
  {source: 1,  target: 5},
  {source: 1,  target: 6},
  {source: 1,  target: 7},

  {source: 5,  target: 8},
  {source: 8,  target: 9},
  {source: 8,  target: 10},
  {source: 7,  target: 11},
  {source: 11, target: 12},

  {source: 10,  target: 13},
  {source: 12, target: 13},
];

const nodesExpansion = [
  {index: 14,  type: 'linkNode', weight: 0.2, level: 2.5},
  {index: 15,  type: 'node',     weight: 0.7, level: 3},
  {index: 16,  type: 'node',     weight: 0.7, level: 3},
  {index: 17,  type: 'node',     weight: 0.7, level: 3},
  {index: 18,  type: 'node',     weight: 0.7, level: 3},

  {index: 19,  type: 'linkNode', weight: 0.2, level: 2.5},
];

const linksExpansion = [
  {source: 12,  target: 14},
  {source: 14,  target: 15},
  {source: 14,  target: 16},
  {source: 14,  target: 17},
  {source: 14,  target: 18},

  {source: 19,  target: 17},
  {source: 19,  target: 9},
];

function clone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  const copy = obj.constructor();
  Object.keys(obj).forEach(attr => {
    copy[attr] = clone(obj[attr]);
  });
  return copy;
}

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const searchRadius = 20;

function freezeCurrentNodes(nodes) {
  return nodes.map(function(d) {
    d.fx = d.x;
    d.fy = d.y;
    return d;
  });
}

function expandCurrentNodes(nodes) {
  return nodes.concat(nodesExpansion);
}

function expandCurrentLinks(nodes) {
  return nodes.concat(linksExpansion);
}

function mousemoved() {
  const a = this.parentNode;
  const m = d3.mouse(this);
  const d = simulation.find(m[0] - width / 2, m[1] - height / 2, searchRadius);
  if (!d) return a.removeAttribute("title");
  a.setAttribute("title", d.index);
}

let expanded = false;
let frozenNodes;

function onClick() {
  const m = d3.mouse(this);
  const d = simulation.find(m[0] - width / 2, m[1] - height / 2, searchRadius);
  if (d && d.connections) {
    let newNodes;
    let newLinks;

    if (!frozenNodes) {
      frozenNodes = freezeCurrentNodes(clone(nodes));
    }

    if (!expanded) {
      newNodes = expandCurrentNodes(frozenNodes);
      newLinks = expandCurrentLinks(clone(links));
      expanded = true;
    } else {
      newNodes = frozenNodes;
      newLinks = links;
      expanded = false;
    }

    const localForceLink = d3.forceLink()
      .distance(10)
      .links(newLinks);

    const localSimulation = d3.forceSimulation(newNodes)
        .force("link", localForceLink)
        .force("charge", charge)
        .force("collide", d3.forceCollide().radius(25).iterations(1))
        .force("x", forceX)
        .stop();

    fireSimulation(localSimulation, newNodes, newLinks);
  }
}

d3.select(canvas)
  .on("mousemove", mousemoved);

d3.select(canvas)
  .on("click", onClick);


const forceLink = d3.forceLink()
  //.id(d => d.id)
  //.strength(.1)
  .distance(10)
  .links(links);

const forceXScale = d3.scaleLinear()
    .range([-width/2 + 40, width/2 - 40])
    .domain([0, 7]);

const forceX = d3.forceX()
    .strength(0.8)
    .x(function(d) {
      return forceXScale(d.level);
    });

//const forceY = d3.forceY()
//    .strength(0.8)
//    .y(function(d) {
//      if (d.id === "1") {
//        return 0;
//      }
//      return d.y;
//    });

const charge = d3.forceManyBody()
    .strength(-270);


const  simulation = d3.forceSimulation(nodes)
      .force("link", forceLink)
      .force("charge", charge)
      .force("collide", d3.forceCollide().radius(25).iterations(1))
      .force("x", forceX)
      //.force("y", forceY)
      //.on('tick', ticked)
      .stop();

function fireSimulation(simulation, nodes, links) {
  for (var i = 0; i < 60; i++) {
    simulation.tick();
    ticked(nodes, links);
  }
}

fireSimulation(simulation, nodes, links);

function drawLink(d) {
  context.moveTo(d.source.x, d.source.y);
  context.lineTo(d.target.x, d.target.y);
}

function drawNode(d) {
  context.beginPath();
  context.lineWidth = 2;

  let colour;
  let nodeRadius;
  switch (d.type) {
    case 'rootNode':
      colour = "rgba(0,0,0,1)"
      nodeRadius = 10;
      break;
    case 'linkNode':
      colour = "rgba(239,138,98,1)"
      nodeRadius = 5;
      break;
    case 'node':
      colour =  "rgba(103,169,207,1)"
      nodeRadius = 8;
      break;
  }

  context.arc(d.x, d.y, nodeRadius, 0, 2 * Math.PI, false);

  context.fillStyle = d.connections ? "rgba(103,169,207,1)" : "#fff";
  context.fill();

  context.strokeStyle = colour;
  context.stroke();
}

function ticked(nodes, links) {
  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);

  context.beginPath();
  links.forEach(drawLink);
  context.strokeStyle = "rgba(120,120,120,0.6)";
  context.lineWidth = 0.5;
  context.stroke();

  nodes.forEach(drawNode);

  context.restore();
}

//ticked.bind(null, nodes, links);
