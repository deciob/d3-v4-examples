'use strict';

const nodes = [
  {id: '1', nodeType: 'entity', weight: 1, level: 0, linkNodeType: null, parentLinkNodes: null, furtherConnections: null},

  {id: '1l', nodeType: 'connector', weight: null, level: 0.5, linkNodeType: 'postcode', parentLinkNodes: null, furtherConnections: null},
  {id: '2l', nodeType: 'connector', weight: null, level: 0.5, linkNodeType: 'phone', parentLinkNodes: null, furtherConnections: null},

  {id: '2', nodeType: 'entity', weight: 0.7, level: 1, linkNodeType: null, parentLinkNodes: ['postcode'], furtherConnections: []},
  {id: '3', nodeType: 'entity', weight: 0.7, level: 1, linkNodeType: null, parentLinkNodes: ['postcode'], furtherConnections: ['8']},
  {id: '4', nodeType: 'entity', weight: 0.7, level: 1, linkNodeType: null, parentLinkNodes: ['postcode'], furtherConnections: []},

  {id: '5', nodeType: 'entity', weight: 0.6, level: 1, linkNodeType: null, parentLinkNodes: ['phone'], furtherConnections: ['8', '9', '10']},

  {id: '6', nodeType: 'entity', weight: 0.9, level: 1, linkNodeType: null, parentLinkNodes: ['postcode', 'phone'], furtherConnections: []},
  {id: '7', nodeType: 'entity', weight: 0.9, level: 1, linkNodeType: null, parentLinkNodes: ['postcode', 'phone'], furtherConnections: []},

  {id: '3l', nodeType: 'connector', weight: null, level: 1.5, linkNodeType: 'postcode', parentLinkNodes: null, furtherConnections: null},
  {id: '4l', nodeType: 'connector', weight: null, level: 1.5, linkNodeType: 'phone', parentLinkNodes: null, furtherConnections: null},

  {id: '8', nodeType: 'entity', weight: 0.6, level: 2, linkNodeType: null, parentLinkNodes: ['postcode'], furtherConnections: []},

  {id: '9', nodeType: 'entity', weight: 0.5, level: 2, linkNodeType: null, parentLinkNodes: ['phone'], furtherConnections: []},
  {id: '10', nodeType: 'entity', weight: 0.5, level: 2, linkNodeType: null, parentLinkNodes: ['phone'], furtherConnections: []},
];

const links = [
  {source: '1', target: '1l'},
  {source: '1', target: '2l'},
  {source: '1l', target: '2'},
  {source: '1l', target: '3'},
  {source: '1l', target: '4'},
  {source: '1l', target: '6'},
  {source: '1l', target: '7'},
  {source: '2l', target: '5'},
  {source: '2l', target: '6'},
  {source: '2l', target: '7'},
  {source: '3', target: '3l'},
  {source: '5', target: '3l'},
  {source: '5', target: '4l'},
  {source: '3l', target: '8'},
  {source: '4l', target: '9'},
  {source: '4l', target: '10'},
];

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;
const dist = height / 8; //90;
const startNodeRadius = 16;
const searchRadius = startNodeRadius;

const forceXScale = d3.scaleLinear()
    .range([0, width])
    .domain([0, 4 /*number of expansion levels*/]);

const forceX = d3.forceX()
    .strength(0.8)
    .x(function(d) {
      return forceXScale(d.level);
    });

const linkForce  = d3.forceLink(links)
    //.distance(dist)
    //.strength(2)
    .id(d => d.id);

const collisionForce = d3.forceCollide(20).strength(1).iterations(10);


const simulation = d3.forceSimulation(nodes)
      .force('link', linkForce)
      .force('collide', collisionForce)
      .force('x', forceX)
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
  let fill;
  switch (d.nodeType) {
    case 'entity':
      if (d.level === 0) {
        colour = 'rgba(0,0,0,1)';
        fill = 'rgba(0,0,0,1)';
        nodeRadius = startNodeRadius;
      } else {
        colour =  'rgba(103,169,207,1)';
        fill = 'rgba(103,169,207,1)';
        nodeRadius = startNodeRadius * .8;
      }
      break;
    case 'connector':
      colour = 'rgba(239,138,98,1)';
      fill = 'rgba(239,138,98,1)';
      nodeRadius = startNodeRadius * 0.6;
      break;
  }

  context.arc(d.x, d.y, nodeRadius, 0, 2 * Math.PI, false);
  context.fillStyle = fill;
  context.fill();
  context.strokeStyle = colour;
  context.stroke();
}

function ticked() {
  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(startNodeRadius, height / 2);

  context.beginPath();
  links.forEach(drawLink);
  context.strokeStyle = 'rgba(180,180,180,0.4)';
  context.lineWidth = 1;
  context.stroke();

  nodes.forEach(drawNode);

  context.restore();
}

function mousemoved() {
  const a = this.parentNode;
  const m = d3.mouse(this);
  const d = simulation.find(m[0] - width / 2, m[1] - height / 2, searchRadius);
  if (!d) return a.removeAttribute('title');
  a.setAttribute('title', d.id);
}

d3.select(canvas)
  .on('mousemove', mousemoved);
