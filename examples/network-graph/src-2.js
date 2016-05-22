'use strict';

const canvas = document.querySelector("canvas");
const meter = document.querySelector("#progress");
const context = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
const nodeRadius = 2;
const searchRadius = 5;

const worker = new Worker("worker-2.js");

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

function ticked(data) {
  const progress = data.progress;
  meter.style.width = 100 * progress + "%";
}

function drawLink(d) {
  context.moveTo(d.source.x, d.source.y);
  context.lineTo(d.target.x, d.target.y);
}

function drawNode(d) {
  context.moveTo(d.x + 3, d.y);
  context.arc(d.x, d.y, nodeRadius, 0, 2 * Math.PI);
}

function mousemoved(simulation) {
  const a = this.parentNode;
  const m = d3.mouse(this);
  const d = simulation.find(m[0] - width / 2, m[1] - height / 2, searchRadius);
  if (!d) return a.removeAttribute("title");
  a.setAttribute("title", d.id);
}

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

    worker.postMessage({
      nodes: graph.nodes,
      links: graph.links,
    });

    worker.onmessage = function(event) {
      switch (event.data.type) {
        case "tick": return ticked(event.data);
        case "end": return ended(event.data);
      }
    };

    function ended(data) {
      const nodes = data.nodes;
      const links = data.links;

      meter.style.display = "none";

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
        .on("mousemove", mousemoved.bind(this, data.simulation));
    }
  });
