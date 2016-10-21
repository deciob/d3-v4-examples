'use strict';

const data1 = {
  nodes: [
    {id: "1", type: 'rootNode', weight: 1, level: 0},
    {id: "1l", type: 'linkNode', weight: 0.2, level: 0.5},
    {id: "2", type: 'node', weight: 0.7, level: 1},
    {id: "3", type: 'node', weight: 0.7, level: 1},
    {id: "4", type: 'node', weight: 0.7, level: 1},
    {id: "5a", type: 'node', weight: 0.7, level: 1},
    {id: "6a", type: 'node', weight: 0.7, level: 1},
    {id: "7a", type: 'node', weight: 0.7, level: 1},
  ],
  links: [
    {source: "1", target: "1l"},
    {source: "1l", target: "2"},
    {source: "1l", target: "3"},
    {source: "1l", target: "4"},
    {source: "1l", target: "5a"},
    {source: "1l", target: "6a"},
    {source: "1l", target: "7a"},
  ],
};

const data2 = {
  nodes: [
    {id: "2l", type: 'linkNode', weight: 0.2, level: 2},
    {id: "3l", type: 'linkNode', weight: 0.2, level: 2},
    {id: "5", type: 'node', weight: 0.7, level: 2},
    {id: "6", type: 'node', weight: 0.7, level: 2},
    {id: "4lb", type: 'linkNode', weight: 0.2, level: 2},
  ],
  links: [
    {source: "2", target: "2l"},
    {source: "3", target: "3l"},
    {source: "2l", target: "5"},
    {source: "2l", target: "6"},
    {source: "3l", target: "5"},
    {source: "5", target: "4lb"},
    {source: "6", target: "4lb"},
  ],
};

const data3 = {
  nodes: [
    {id: "4l", type: 'linkNode', weight: 0.2, level: 2.5},
    {id: "7", type: 'node', weight: 0.7, level: 3},
    {id: "8", type: 'node', weight: 0.7, level: 3, connections: [9]},
    {id: "5lc", type: 'linkNode', weight: 0.2, level: 1.5},
  ],
  links: [
    {source: "5", target: "4l"},
    {source: "4l", target: "7"},
    {source: "4l", target: "8"},
    {source: "5lc", target: "4"},
    {source: "5lc", target: "8"},
  ],
};

const data4 = {
  nodes: [
    {id: "5l", type: 'linkNode', weight: 0.2, level: 3.5},
    {id: "9", type: 'node', weight: 0.7, level: 4},
  ],
  links: [
    {source: "8", target: "5l"},
    {source: "5l", target: "9"},
  ],
};

function clone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  // WARNING: will fail with angular Resources, call toJSON first!
  const copy = obj.constructor();
  Object.keys(obj).forEach(attr => {
    copy[attr] = clone(obj[attr]);
  });
  return copy;
}

let data = {
  nodes: clone(data1.nodes.concat(data2.nodes).concat(data3.nodes)),
  links: clone(data1.links.concat(data2.links).concat(data3.links)),
};

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const searchRadius = 20;
const strength = 2.5;

function mousemoved() {
  const a = this.parentNode;
  const m = d3.mouse(this);
  const d = simulation.find(m[0] - width / 2, m[1] - height / 2, searchRadius);
  if (!d) return a.removeAttribute("title");
  a.setAttribute("title", d.id);
}

function onClick() {
  //const a = this.parentNode;
  const m = d3.mouse(this);
  const d = simulation.find(m[0] - width / 2, m[1] - height / 2, searchRadius);

  if (d && d.connections) {

    let d = prepareData(data4);

    data = {
      nodes: clone(data.nodes.concat(data4.nodes)),
      links: clone(data.links.concat(data4.links)),
    };

    graph = prepareData(data);

    console.log(graph);

    //fireSimulation();
    forceLink.links(graph.links);
    simulation.nodes(graph.nodes).force('links', forceLink);
    //simulation.restart();
    fireSimulation();
  }
}

//d3.select(canvas)
//  .on("mousemove", mousemoved);

//d3.select(canvas)
//  .on("click", onClick);

function prepareData(data) {
  const graph = {};
  graph.nodes = data.nodes;
  graph.links = data.links.map(d => {
    d.strength = 0.5;
    d.distance = 500;
    d.source = d.source && d.source.x ? d.source : data.nodes.find(o => o.id === d.source);
    d.target = d.target && d.target.x ? d.target : data.nodes.find(o => o.id === d.target);
    return d
  });
  return graph;
}

let graph = prepareData(data);

const forceLink = d3.forceLink()
  //.id(d => d.id)
  //.strength(.1)
  .distance(10)
  .links(graph.links);

const forceXScale = d3.scaleLinear()
    .range([-width/2 + 40, width/2 - 40])
    .domain([0, 8]);

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
    .strength(-250);


const  simulation = d3.forceSimulation(graph.nodes)
      .force("link", forceLink)
      .force("charge", charge)
      .force("collide", d3.forceCollide().radius(25).iterations(1))
      .force("x", forceX)
      //.force("y", forceY)
      //.on('tick', ticked)
      .stop();

function fireSimulation() {
  for (var i = 0; i < 60; i++) {
    simulation.tick();
    ticked();
  }
}

fireSimulation();



function drawLink(d) {
  context.moveTo(d.source.x, d.source.y);
  context.lineTo(d.target.x, d.target.y);
}

function drawNode(d) {
  context.beginPath();

  let colour;
  let nodeRadius;
  switch (d.type) {
    case 'rootNode':
      colour = "rgba(0,0,0,0.6)"
      nodeRadius = 10;
      break;
    case 'linkNode':
      colour = "rgba(239,138,98,0.6)"
      nodeRadius = 5;
      break;
    case 'node':
      colour =  "rgba(103,169,207,0.6)"
      nodeRadius = 8;
      break;
  }

  context.arc(d.x, d.y, nodeRadius, 0, 2 * Math.PI, false);

  context.fillStyle = d.connections ? "rgba(103,169,207,1)" : "#fff";
  context.fill();

  context.strokeStyle = colour;
  context.stroke();
}

function ticked() {
  const nodes = graph.nodes;
  const links = graph.links;

  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);

  context.beginPath();
  links.forEach(drawLink);
  context.strokeStyle = "rgba(120,120,120,0.6)";
  context.lineWidth = 1;
  context.stroke();

  nodes.forEach(drawNode);

  context.restore();
}
