// Chart Params
var svgWidth = 960;
var svgHeight = 500;

var margin = { top: 20, right: 40, bottom: 60, left: 50 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .attr("class", "chart");

  // Initial Params
var chosenXAxis = "poverty" 

  // function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}
// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "Poverty Rating Level";
  }
  else (chosenXAxis === "age") {
    label = "Age:";
  }
  else (chosenXAxis === "income") {
    label = "Income:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv").then(function(data, err) {
  if (err) throw err;

// parse data
data.forEach(function(data) {
  data.obesity = +data.obesity;
  data.poverty = +data.poverty;
  data.healthcare = +data.healthcare;
  data.age = +data.age;
  data.income = +data.income
});

 // xLinearScale function above csv import
 var xLinearScale = xScale(data, chosenXAxis);

// Create y scale function
var yLinearScale = d3.scaleLinear()
.domain([0, d3.max(data, d => d.chosenYAxis)])
.range([height, 0]);

// Create initial axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// append x axis
var xAxis = chartGroup.append("g")
.classed("x-axis", true)
.attr("transform", `translate(0, ${height})`)
.call(bottomAxis);

// append y axis
chartGroup.append("g")
.call(leftAxis);

// append initial circles
var circlesGroup = chartGroup.selectAll("circle")
.data(data)
.enter()
.append("circle")
.attr("cx", d => xLinearScale(d[chosenXAxis]))
.attr("cy", d => yLinearScale(d.chosenYAxis))
.attr("r", 20)
.attr("fill", "pink")
.attr("opacity", ".5");

// Create group for three x-axis labels
var labelsGroup = chartGroup.append("g")
.attr("transform", `translate(${width / 2}, ${height + 20})`);

var povertyLabel = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 20)
.attr("value", "poverty") // value to grab for event listener
.classed("active", true)
.text("Poverty Rating Level (%)");

var ageLabel = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 40)
.attr("value", "age") // value to grab for event listener
.classed("inactive", true)
.text("Age");

var incomeLabel = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 40)
.attr("value", "income") // value to grab for event listener
.classed("inactive", true)
.text("Income");

// append y axis
chartGroup.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 0 - margin.left)
.attr("x", 0 - (height / 2))
.attr("dy", "1em")
.classed("axis-text", true)
.text("Healthcare Rating Level");

// updateToolTip function above csv import
var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

 // x axis labels event listener
 labelsGroup.selectAll("text")
 .on("click", function() {
   // get value of selection
   var value = d3.select(this).attr("value");
   if (value !== chosenXAxis) {

     // replaces chosenXAxis with value
     chosenXAxis = value;

      // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
          .classed("active", true)
          .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});

// // function used for updating xAxis var upon click on axis label
// function renderAxes(newXScale, xAxis) {
//   var bottomAxis = d3.axisBottom(newXScale);

//   xAxis.transition()
//     .duration(1000)
//     .call(bottomAxis);

//   return xAxis;
// }

// var xText = d3.select(".xText");
// xText
// .append("text")
// .attr("data-axis", "x")
// .text("poverty");

// xText
// .append("text")
// .attr("data-axis", "x")
// .text("age");

// xText
// .append("text")
// .attr("data-axis", "x")
// .text("income");

//  // append y axis
//  chartGroup.append("text")
//  .attr("transform", "rotate(-90)")
//  .attr("y", 0 - margin.left)
//  .attr("x", 0 - (height / 2))
//  .attr("dy", "1em")
//  .classed("axis-text", true)
//  .text("Healthcare Rating Level");

// // updateToolTip function above csv import
// var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
// var yText = d3.select(".yText");



// yText
// .append("text")
// .attr("data-axis", "y")
// .text("healthcare");

// yText
// .append("text")
// .attr("data-axis", "y")
// .text("obesity");

// yText
// .append("text")
// .attr("data-axis", "y")
// .text("smoking");

// var xLinearScale = xScale (data, xText); 
// var yLinearScale = yScale (data, yText); 
// var bottomAxis = d3.axisBottom(xLinearScale);
// var leftAxis = d3.axisLeft(yLinearScale);  

// // Import data from an external CSV file and parse and cast
// d3.csv("assets/data/data.csv").then(function(data) {
//  visualise(data);   
// });
//   // data.forEach(element => {
//   //       element.poverty = +element.poverty;
//   //       element.healthcare = +element.healthcare; 
//   //       element.age = +element.age;
//   //       element.income = +element.income; 
//   //       element.obesity = +element.obesity; 
//   //   })
//   //  Visualise  
//     // console.log(data [0].poverty); 
// var dataX
// // We called a "visualize" function on the data obtained with d3's .csv method.
//    // This function handles the visual manipulation of all elements dependent on the data.
//    // PART 1: Essential Local Variables and Functions
//      // =================================
//      // curX and curY will determine what data gets represented in each axis.
//      // We designate our defaults here, which carry the same names
//      // as the headings in their matching .csv data file.
     
   
//      // We also save empty variables for our the min and max values of x and y.
//      // this will allow us to alter the values in functions and remove repetitious c
    
//    function visualise(data){
//    var tooltip = d3
//    .tip
//    .attr()
//    .offset()
//    .html(function (d) {id x = "poverty" then ()})

//    if x = "poverty"

//    3. Create our visualization function
//    // ====================================
//    /
//    function visualize(theData) {
//      ode.
     
   
//      // This function allows us to set up tooltip rules (see d3-tip.js).
//      var toolTip = d3
//        .tip()
//        .attr()
//        .offset()
//        .html(function(d) {
//          // x key
         
//          // Grab the state name.
         
//          // Snatch the y value's key and value.
         
//          // If the x key is poverty
//          if () {
//            // Grab the x key and a version of the value formatted to show percentage
           
//          }
//          else {
//            // Otherwise
//            // Grab the x key and a version of the value formatted to include commas after every third digit.
           
//          }
//          // Display what we capture.
         
//        });
//      // Call the toolTip function.
     
// }
// // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.


// //   append an SVG group translet doing math to take in the numb er tht imput to calculate the lines 
  
// var chartGroup = svg.append("g")
// .attr("transform", `translate(${margin.left}, ${margin.top})`);

  
//   // Create scaling functions

//   var xScale = d3.scaleLinear()
//   .domain([0, d3.max(xText)])
//   .range([0, width]);

//     var yScale = d3.scaleLinear()
//   .domain([0, d3.max(yText)])
//   .range([height, 0]);

// // function xScale(data, xText) {
// //   var xLinearScale = d3.scaleLinear()
// //     .domain([0, d3.max(data, d => d.xText)])
// //     .range([0, width]);
// //     return xLinearScale
// // }

// // function yscale(data, yText) {
// //   var yLinearScale = d3.scaleLinear()
// //     .domain([0, d3.max(data, d => d.yText)])
// //     .range([height, 0]);
// //     return yLinearScale
// // }

// // Create axis functions to render axis 

// function renderxAxis (xScale, xAxis){
//     var bottomAxis = d3.axisBottom(xScale); 
//     xAxis.transition().duration (100).call(bottomAxis);
//     return xAxis
// }

// // Render y-axis
// function renderYAxis (yScale, yAxis){
//     var leftAxis = d3.axisLeft(yScale); 
//     yAxis.transition().duration (100).call(leftAxis);
//     return yAxis
// }


// var xAxis = 
// chartGroup.append("g")
// .attr("transform", `translate(0, ${height})`)
// .call(bottomAxis);

// // Add y1-axis to the left side of the display
// var yAxis = 
// chartGroup.append("g")
// .attr("transform", `translate(0, 0)`)
// // // Define the color of the axis text
// // .classed("green", true)
// .call(leftAxis);

// // append circles to data points
// var circlesGroup = chartGroup.selectAll("circle")
//   .data(data)
//   .enter()
//   .append("circle")
//   .attr("cx", d=> xLinearScale(d[xText]))
//   .attr("cy", d=> yLinearScale(d[yText]))
//   .attr("r", "10")
//   .attr("fill", "#69b3a2")
//   .attr("opacity", ".5");
  










  