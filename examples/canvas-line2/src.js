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
  newRow.date = +(new Date(`${row.year}, ${row.month}`));
  newRow.value = +(row.tenYearAnomaly || 0);
  newRow.unc = +(row.tenYearUnc || 0);
  return newRow;
}

function prepareData(res) {
  const parsedRes = d3.csvParse(res)
  return parsedRes.map(prepareRow);
}

function drawLine(data) {
  context.clearRect(-10, -10, canvas.width , canvas.height);

  context.beginPath();
  line(data);
  context.lineWidth = 1;
  context.strokeStyle = "steelblue";
  context.stroke();
}

const interpolatorButton = document.getElementById('interpolator-button');

//fetch('./data/nitrogen-dioxide-2016-09-01-161001120009.csv')
//fetch('./data/nitrogen-dioxide-oct-2015-2016.csv')
fetch('./data/Complete_TAVG_complete.csv')
  .then((res) => res.text())
  .then((res) => {
    const data = prepareData(res);
    //const anomalySet = true;
    //const dataObj = {
    //  anomalySet: data,
    //};

    const yDomainData = data.map(d => d.value).concat(data.map(d => d.unc));

    x.domain(d3.extent(data, d => d.date));
    y.domain(d3.extent(yDomainData));

    drawLine(data);

    function toggleInterpolation() {
     const interpolatorScale = d3.scaleLinear().range([0, 1]).domain([0, 3000]);
     const startValues = data.map(d => d.value);
     const endValues = data.map(d => d.unc);
     const valuesInterpolator = d3.interpolateArray(startValues, endValues);

     var t = d3.interval(function(elapsed) {
       const step = interpolatorScale(elapsed);
       const interpolatedValues = valuesInterpolator(step);
       const interpolatedData = data.map((d, idx) => {
         const newObj = {
           date: d.date,
         };
         newObj.value = interpolatedValues[idx];
         return newObj;
       });
       drawLine(interpolatedData);
       if (elapsed > 3000) t.stop();
     }, 33);
    }

    interpolatorButton.onclick = toggleInterpolation;
  });
