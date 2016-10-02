'use strict';

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const margin = {top: 20, right: 20, bottom: 30, left: 50};
const width = canvas.width - margin.left - margin.right;
const height = canvas.height - margin.top - margin.bottom;

const x = d3.scaleTime()
    .range([0, width]);

const y = d3.scaleLinear()
    .range([height, 0]);

const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.value))
    //.curve(d3.curveCardinal.tension(0.5))
    //.curve(d3.curveStep)
    .context(context);

context.translate(margin.left, margin.top);

function prepareRow(row) {
  const newRow = {};
  const date = row.endDate.split('/').reverse().join('-');
  newRow.date = +(new Date(`${date}T${row.endTime}`));
  newRow.value = +(row.NO2 || 0);
  return newRow;
}

function prepareData(res) {
  const parsedRes = d3.csvParse(res)
  return parsedRes.map(prepareRow);
}

function drawLine(data) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.beginPath();
  line(data);
  context.lineWidth = 1;
  context.strokeStyle = "steelblue";
  context.stroke();
}

//fetch('./data/nitrogen-dioxide-2016-09-01-161001120009.csv')
//fetch('./data/nitrogen-dioxide-oct-2015-2016.csv')
fetch('./data/test.csv')
  .then((res) => res.text())
  .then((res) => {
    const data = prepareData(res);

    x.domain(d3.extent(data, d => d.date));
    y.domain([-50, d3.max(data, d => d.value) + 50]);

    drawLine(data);

    setTimeout(function () {
      const interpolatorScale = d3.scaleLinear().range([0, 1]).domain([0, 2000]);
      const startValues = data.map(d => d.value);
      const endValues = data.map(d => d.value * (Math.random() + 0.6));
      const valuesInterpolator = d3.interpolateArray(startValues, endValues);

      var t = d3.interval(function(elapsed) {
        const step = interpolatorScale(elapsed);
        const interpolatodValues = valuesInterpolator(step);
        const interpolatedData = data.map((d, idx) => {
          const newObj = {
            date: d.date,
          };
          newObj.value = interpolatodValues[idx];
          return newObj;
        });
        drawLine(interpolatedData);
        if (elapsed > 2000) t.stop();
      }, 50);
    }, 1000);
  });
