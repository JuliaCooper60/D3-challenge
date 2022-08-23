// Chart Params
var svgWidth = 960;
var svgHeight = 500;

var margin = { top: 20, right: 40, bottom: 60, left: 50 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Import data from an external CSV file and parse and cast
d3.csv("assets/data/data.csv").then(function(data) {
    data.forEach(element => {
        element.poverty = +element.poverty;
        element.healthcare = +element.healthcare; 
        element.age = +element.age;
        element.income = +element.income; 
        element.obesity = +element.obesity; 
    })
    var xLinearScale = xScale (data, chosenXAxis) 
    var yLinearScale = yScale (data, chosenYAxis) 
    var bottomAxis = d3.axisBottom(xLinearScale)
    var leftAxis = d3.axisLeft(yLinearScale);  
    // console.log(data [0].poverty); 

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

//   append an SVG group translet doing math to take in the numb er tht imput to calculate the lines 
  
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

  // Create scaling functions

//   var xScale = d3.scaleLinear()
//   .domain([0, d3.maxchosenXaxis])
//   .range([0, width]);

//     var yScale = d3.scaleLinear()
//   .domain([0, d3.max(chosenYAxis)])
//   .range([height, 0]);

function xScale(data, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.chosenXAxis)])
    .range([0, width]);
    return xLinearScale
}

function yscale(data, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.chosenYAxis)])
    .range([height, 0]);
    return yLinearScale
}

// Create axis functions to render axis 

function renderXAxis (xScale, xAxis){
    var bottomAxis = d3.axisBottom(xScale); 
    xAxis.transition().duration (100).call(bottomAxis);
    return xAxis
}

// Render y-axis
function renderYAxis (yScale, yAxis){
    var leftAxis = d3.axisLeft(yScale); 
    yAxis.transition().duration (100).call(leftAxis);
    return yAxis
}


var xAxis = 
chartGroup.append("g")
.attr("transform", `translate(0, ${height})`)
.call(bottomAxis);

// Add y1-axis to the left side of the display
var yAxis = 
chartGroup.append("g")
.attr("transform", `translate(0, 0)`)
// // Define the color of the axis text
// .classed("green", true)
.call(leftAxis);

// append circles to data points
var circlesGroup = chartGroup.selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", d=> xLinearScale(d[chosenXAxis]))
  .attr("cy", d=> yLinearScale(d[chosenYAxis]))
  .attr("r", "10")
  .attr("fill", "#69b3a2")
  .attr("opacity", ".5");
  

});









  