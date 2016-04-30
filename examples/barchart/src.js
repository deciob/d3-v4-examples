'use strict';

const margin = {top: 20, right: 30, bottom: 40, left: 120};
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
const percentFormat = d3.format('.0%');

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
      const value = +d[+k];
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
    .rangeRound([0, height], 0.1);

function drawXAxis(el, data) {
  el.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(xScale).tickFormat(percentFormat));
}

function drawYAxis(el, data) {
  let axis = el.select('axis--y');
  if (axis.empty()) {
    axis = el.append('g')
      .attr('class', 'axis axis--y');
  }

  axis.call(d3.axisLeft(yScale));
}


const svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


const data = fetch('../data/income-share-held-by-highest-10-percent.csv')
.then((res) => res.text())
.then((res) => {
  const data = prepareData(d3.csvParse(res));
  const top20 = getTopVals(data, 20);
  const top20Countries2013 = top20[2013];

  yScale.domain(top20Countries2013.map(d => d.countryName));

  drawXAxis(svg, top20Countries2013);
  drawYAxis(svg, top20Countries2013);
  //console.log(top20);
});
