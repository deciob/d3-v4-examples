'use strict';

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const strength = 0.2;
const nodeRadius = 3;

const simulation = d3.forceSimulation()
    .force("x", d3.forceX().strength(strength))
    .force("y", d3.forceY().strength(strength))
    .force("link", d3.forceLink().id(d => d.id))
    .force("charge", d3.forceManyBody())
    //.force("collide", d3.forceCollide().radius(5).iterations(2))
    .force("center", d3.forceCenter(width / 2, height / 2));

function prepareData(data) {
  var graph = {};
  graph.nodes = d3.set(data.map(d => d.target).concat(data.map(d => d.source)))
    .values().map(d => ({id: +d}));
  graph.links = data;
  return graph;
}

function dragstarted() {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart()
  simulation.fix(d3.event.subject);
}

function dragged() {
  simulation.fix(d3.event.subject, d3.event.x, d3.event.y);
}

function dragended() {
  if (!d3.event.active) simulation.alphaTarget(0);
  simulation.unfix(d3.event.subject);
}

function drawLink(d) {
  context.moveTo(d.source.x, d.source.y);
  context.lineTo(d.target.x, d.target.y);
}

function drawNode(d) {
  context.moveTo(d.x + 3, d.y);
  context.arc(d.x, d.y, nodeRadius, 0, 2 * Math.PI);
}

fetch('../data/USairport500.csv')
  .then((res) => res.text())
  .then((res) => {
    const rawData = d3.csvParse(res, d => ({
      source: +d.source,
      target: +d.target,
      value: +d.value,
    }));
    const graph = prepareData(rawData);
    //console.log(graph);

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    d3.select(canvas)
        .call(d3.drag()
            .container(canvas)
            .subject(dragsubject)
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    function ticked() {
      context.clearRect(0, 0, width, height);

      context.beginPath();
      graph.links.forEach(drawLink);
      context.strokeStyle = "rgba(120,120,120,0.8)";
      context.lineWidth = 0.3;
      context.stroke();

      context.beginPath();
      graph.nodes.forEach(drawNode);
      context.fillStyle =  "rgba(240,59,32,1)";
      context.fill();
      context.strokeStyle = "#fff";
      context.stroke();
    }

    function dragsubject() {
      return simulation.find(d3.event.x, d3.event.y);
    }
  });
