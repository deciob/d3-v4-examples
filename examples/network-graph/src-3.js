'use strict';

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const nodeRadius = 3;
const searchRadius = 30;
const strength = 2.5;

const forceLink = d3.forceLink()
  .id(d => d.id)
  .strength(d => d.strength)
  .distance(d => d.distance);

const simulation = d3.forceSimulation()
    //.alphaMin(0.01)      // [0,1] default 0.001
    //.alpha(0.5)          // [0,1] default 1;
    .alphaDecay(0.2)     // [0,1] default 0.0228;
    .force("x", d3.forceX().strength(strength))
    .force("y", d3.forceY().strength(strength))
    .force("collide", d3.forceCollide().radius(4).iterations(2))
    .force("link", forceLink)
    .force("charge", d3.forceManyBody());

function prepareData(data) {
  const graph = {};
  const extent = d3.extent(data, d => d.value);
  const scaleStrength = d3.scaleLinear()
    .range([0, 4])
    .domain(extent);
  const scaleDistance = d3.scaleLinear()
    .range([600, 0])
    .domain(extent);

  graph.nodes = d3.set(data.map(d => d.target).concat(data.map(d => d.source)))
    .values().map(d => ({id: +d}));
  graph.links = data.map(d => {
    d.strength = scaleStrength(d.value);
    d.distance = scaleDistance(d.value);
    return d
  });
  return graph;
}

function drawLink(d) {
  context.moveTo(d.source.x, d.source.y);
  context.lineTo(d.target.x, d.target.y);
}

function drawNode(d) {
  context.moveTo(d.x + 3, d.y);
  context.arc(d.x, d.y, nodeRadius, 0, 2 * Math.PI);
}

function mousemoved() {
  const a = this.parentNode;
  const m = d3.mouse(this);
  const d = simulation.find(m[0] - width / 2, m[1] - height / 2, searchRadius);
  if (!d) return a.removeAttribute("title");
  a.setAttribute("title", d.id);
}

//queue()
//  .defer(d3.csv, "/data/cities.csv")
//  .defer(d3.tsv, "/data/animals.tsv")
//  .await(analyze);

fetch('../data/openflights.csv')
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
        .on('tick', ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
      const nodes = graph.nodes;
      const links = graph.links;
      const mousemovedCurry = R.curry(mousemoved);

      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(width / 2, height / 2);

      context.beginPath();
      links.forEach(drawLink);
      context.strokeStyle = "rgba(120,120,120,0.1)";
      context.lineWidth = 0.1;
      context.stroke();

      context.beginPath();
      nodes.forEach(drawNode);
      context.fillStyle =  "rgba(240,59,32,0.8)";
      context.fill();
      context.strokeStyle = "rgba(240,59,32,0.8)";
      context.stroke();

      context.restore();

      d3.select(canvas)
        .on("mousemove", mousemoved);
    }
  });
