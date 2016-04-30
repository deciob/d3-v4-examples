'use strict';

const margin = {top: 20, right: 30, bottom: 40, left: 120};
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
const percentFormat = d3.format('.0%');
const countryLength = 10;
const startYear = 2013;

const delay = function(d, i) {
  return i * 50;
};

function getTopVals(data, _top) {
  const top = _top || 10;
  const topData = {};
  Object.keys(data).forEach((k) => {
    topData[+k] = data[+k].sort((a, b) => b.value - a.value).splice(0, top);
  });
  return topData;
}

function removeEmptyData(data) {
  Object.keys(data).forEach((k) => {
    data[+k] = data[+k].filter(d => d.value);
    if (data[+k].length === 0) {
      delete data[+k];
    }
  });
  return data;
}

function prepareData(data) {
  const allDataPts = data.reduce((accumulator, d) => {
    Object.keys(d).forEach((k) => {
      if (!Number.isInteger(+k)) {return;}
      const value = +d[+k] / 100;
      const newEntry = {
        value,
        countryCode: d.countryCode,
        countryName: d.countryName,
      };
      if (accumulator[+k]) {
        accumulator[+k].push(newEntry);
      } else {
        accumulator[+k] = [newEntry];
      }
    });
    return accumulator;
  }, {});

  return removeEmptyData(allDataPts);
}

function xAccessor(d) {
  return d.value;
}

function yAccessor(d) {
  return d.countryName;
}

const xScale = d3.scaleLinear()
    .range([0, width])
    .domain([0, 1]);

const yScale = d3.scaleBand()
    .rangeRound([0, height], 0.1)
    .padding(0.1);

function drawXAxis(el, data) {
  el.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(xScale).tickFormat(percentFormat));
}

function drawYAxis(el, data, t) {
  let axis = el.select('.axis--y');
  if (axis.empty()) {
    axis = el.append('g')
      .attr('class', 'axis axis--y');
  }

  axis.transition(t)
      .call(d3.axisLeft(yScale))
    .selectAll('g')
      .delay(delay);
}

function drawBars(el, data, t) {
  let barsG = el.select('.bars-g');
  if (barsG.empty()) {
    barsG = el.append('g')
      .attr('class', 'bars-g');
  }

  const bars = barsG
    .selectAll('.bar')
    .data(data, yAccessor);
  bars.exit()
    .remove();
  bars.enter()
    .append('rect')
      .classed('bar', true)
      .attr('x', 0)
      .attr('y', d => yScale(yAccessor(d)))
      .attr('width', d => xScale(xAccessor(d)))
      .attr('height', yScale.bandwidth())
    .merge(bars).transition(t)
      .attr('y', d => yScale(yAccessor(d)))
      .attr('width', d => xScale(xAccessor(d)))
      .attr('height', yScale.bandwidth())
      .delay(delay);
}


const svg = d3.select('.chart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


const data = fetch('../data/income-share-held-by-highest-10-percent.csv')
.then((res) => res.text())
.then((res) => {
  const data = prepareData(d3.csvParse(res));
  const years = Object.keys(data).map(d => d);
  const top20 = getTopVals(data, countryLength);
  const top20Countries = top20[startYear];

  yScale.domain(top20Countries.map(yAccessor));

  d3.select('.year').text(startYear);
  drawXAxis(svg, top20Countries);
  drawYAxis(svg, top20Countries);
  drawBars(svg, top20Countries);

  const interval = d3.interval((elapsed) => {
    const idx = parseInt(d3.randomUniform(0, years.length - 1)());
    const year = years[idx];
    const currentData = top20[year];
    const t = d3.transition().duration(750);
    yScale.domain(currentData.map(yAccessor));
    d3.select('.year').text(year);
    drawYAxis(svg, currentData, t);
    drawBars(svg, currentData, t);
    //if (elapsed > 3000) { interval.stop(); }
  }, 2000);
});
