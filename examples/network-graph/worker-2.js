importScripts("https://d3js.org/d3-collection.v0.1.min.js");
importScripts("https://d3js.org/d3-dispatch.v0.4.min.js");
importScripts("https://d3js.org/d3-quadtree.v0.7.min.js");
importScripts("https://d3js.org/d3-timer.v0.4.min.js");
importScripts("https://d3js.org/d3-force.v0.6.min.js");

onmessage = function(event) {
  const nodes = event.data.nodes;
  const links = event.data.links;

  const strength = 2.5;
  const alphaMin = 0.01; // [0,1] default 0.001
  const alphaDecay = 0.093; // [0,1] default 0.0228;
  const searchRadius = 5;

  const forceLink = d3_force.forceLink(links)
    .id(d => d.id)
    .strength(d => d.strength)
    //.distance(1000)
    .distance(d => d.distance);

  const simulation = d3_force.forceSimulation(nodes)
      .alphaMin(alphaMin)
      .alphaDecay(alphaDecay)
      .force("x", d3_force.forceX().strength(strength))
      .force("y", d3_force.forceY().strength(strength))
      .force("link", forceLink)
      .force("charge", d3_force.forceManyBody())
      .stop();

  for (let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) /
    Math.log(1 - simulation.alphaDecay())); i < n; ++i
  ) {
    postMessage({type: "tick", progress: i / n});
    simulation.tick();
  }

  postMessage(
    {type: "end", nodes, links}
  );
};
