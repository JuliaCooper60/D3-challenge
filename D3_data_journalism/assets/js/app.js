// Chart Params to set dimensions
var svgWidth = 960;
var svgHeight = 500;

var margin = { top: 100, right: 100, bottom: 100, left: 100 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,and shift the latter by left and top margins.
// added functionality to enable dynamic shrinking

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", " 0 0 950 500")
  .classed("svg-content", true);

  // Append an SVG group
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

  // function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  if (chosenXAxis != "income") {
  var xLinearScale = d3.scaleLinear()
//   Use the -1 / 10000 and +1 and +10000 to make a buffer so circles are not on the edge of the graph
    .domain([d3.min(data, d => d[chosenXAxis]) -1, 
      d3.max(data, d => d[chosenXAxis]) +1
    ])
    .range([0, width]);

  } else {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) - 10000, d3.max(data, d => d[chosenXAxis]) + 10000])
        .range([0, width]);
}
  return xLinearScale;
}

function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
      // .domain(d3.extent(data, d => d[chosenYAxis]))
      .domain([d3.min(data, d => d[chosenYAxis]) - 1, 
        d3.max(data, d => d[chosenYAxis]) + 1])
      .range([height, 0]);

  return yLinearScale;

}

function calcLinear(values_x, values_y) {
  var sum_x = 0;
  var sum_y = 0;
  var sum_xy = 0;
  var sum_xx = 0;
  var sum_yy = 0;
  var count = 0;

  /*
   * Use those variables for faster read/write access.
   */
  var x = 0;
  var y = 0;
  var values_length = values_x.length;

  if (values_length != values_y.length) {
      throw new Error("The parameters values_x and values_y need to have same size!");
  }

  if (values_length === 0) {
      return [
          [],
          []     
      ];
  }

  /*
   * create the required numerticl points and calculate the sum for each of the parts necessary.
  
 */ for (var i = 0; i < values_length; i++) {
      x = values_x[i];
      y = values_y[i];
      sum_x += x;
      sum_y += y;
      sum_xx += x * x;
      sum_yy += y * y;
      sum_xy += x * y;
      count++;
  }

  /*
   * Calculate m and b for the formula:
   * y = x * m + b
   */
  var m = ((sum_x / count) * (sum_y / count) - sum_xy / count) / ((sum_x / count) * (sum_x / count) - (sum_xx / count));
  var b = (sum_y / count) - (m * (sum_x / count));


  /*
   * Create the x and y result line 
   */
  var result_values_x = [];
  var result_values_y = [];
  var seLine = 0;
  var seY = 0;

  for (var i = 0; i < values_length; i++) {
      x = values_x[i];
      y = values_y[i];
      yr = x * m + b;
      seLine += (y - yr) * (y - yr);
      seY += (y - (sum_y / count)) * (y - (sum_y / count));

      result_values_x.push(x);
      result_values_y.push(yr);
  }

  var r2 = Math.pow((count * sum_xy - sum_x * sum_y) / Math.sqrt((count * sum_xx - sum_x * sum_x) * (count * sum_yy - sum_y * sum_y)), 2);
  console.log(r2);
  
  return [{
          "x": d3.min(result_values_x),
          "y": d3.min(result_values_y)
      },
      {
          "x": d3.max(result_values_x),
          "y": d3.max(result_values_y)
      },
      r2
  ]

}

// add in function for updating axes upon click on axis label
function renderXAxis(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

  return xAxis;
}

function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
      .duration(1000)
      .call(leftAxis);

  return yAxis;
}

// add function for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis])); 
  return circlesGroup;
}

function renderCirclesText(circlesGroupText, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroupText.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));

  return circlesGroupText;
}

function renderTrend(rSquared, newValues_x, newValues_y) {

  trendData = calcLinear(newValues_x, newValues_y);
 
     // display r-square on the chart
     rSquared.transition()
         .duration(1000)
         .text("R-squared: " + trendData[2].toFixed(2))        
         .attr("x", width * .8)
         .attr("y", height * .05);
 
     return rSquared;
 }
// Build data table - see data.html 
 function buildTable(data) {
  var tbody = d3.select("tbody");
  // clear table
  tbody.html("");

  // Next, loop through each object in the data
  // and append a row and cells for each value in the row
  data.forEach((dataRow) => {
    // Append a row to the table body
    var row = tbody.append("tr");
    row.attr("class", "table-primary");
    // Loop through each field in the dataRow and add
    // each value as a table cell (td)
    Object.values(dataRow).forEach((val) => {
      var cell = row.append("td");
      cell.text(val);
    });
  });
}

// add function for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var xLabel = ''
  var yLabel = ''
//   console.log(chosenXAxis);
  switch (chosenXAxis) {

      case "poverty":
          xLabel = "Percentage in Poverty";
          break;
      case "income":
          xLabel = "Median Income";
          break;
      case "age":
          xLabel = "Median Age";
          break;

  }
  switch (chosenYAxis) {
      case "healthcare":
          yLabel = "Percentage that Lacks Healthcare";
          break;
      case "obesity":
          yLabel = "Percentage datae";
          break;
      case "smokes":
          yLabel = "Percentage of Smokers";
          break;
  }
  // console.log(xLabel);
//   Create content for tooltips

  var toolTip = d3.tip()
  .attr("class", "tooltip")
  .offset([85, -90])
  .html(function(d) {
      return (`${d.state}<br>${yLabel}: ${d[chosenYAxis]}<br>${xLabel}: ${d[chosenXAxis]}`);
  });

circlesGroup.call(toolTip);

circlesGroup.on("mouseover", (d, i, n) => toolTip.show(d, n[i]));
circlesGroup.on("mouseout", (d, i, n) => toolTip.hide(d, n[i]));

return circlesGroup;
}

// Read the data
d3.csv("assets/data/data.csv").then(function(data) {
    var tabulate = function (data,columns) {
        var table = d3.select('body').append('table')
          var thead = table.append('thead')
          var tbody = table.append('tbody')
      
          thead.append('tr')
            .selectAll('th')
              .data(columns)
              .enter()
            .append('th')
              .text(function (d) { return d })
      
          var rows = tbody.selectAll('tr')
              .data(data)
              .enter()
            .append('tr')
      
          var cells = rows.selectAll('td')
              .data(function(row) {
                  return columns.map(function (column) {
                      return { column: column, value: row[column] }
                })
            })
            .enter()
          .append('td')
            .text(function (d) { return d.value })
      
        return table;
      }
      
      d3.csv('data.csv',function (data) {
          var columns = ['variable','aror','asd','maxdd']
        tabulate(data,columns)
      })

    // parse data
    data.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // populate data table - see data.html
    buildTable(data);
  
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(0, 0)`)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "#69b3a2")
        .attr("opacity", ".5");

    var circlesGroupText = chartGroup.selectAll()
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .text(d => d.abbr)
        .attr("fill", "#343a40")
        .style("font-size", "8px")
        .style("text-anchor", "middle");

    var values_x = data.map(d => d[chosenXAxis]);
    var values_y = data.map(d => d[chosenYAxis]);

    var trendData = calcLinear(values_x, values_y);

    // display r-square on the chart
    var rSquared = chartGroup.append("text")
        .text("R-squared: " + trendData[2].toFixed(2))
        .attr("class", "text-label")
        .attr("x", width * .8)
        .attr("y", height * .05);

    // Create group for  3 x- axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

// Create group for  3 y- axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90) translate(-100, -8)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")  
        .classed("axis-text", true)
        .style("text-anchor", "middle")

    var healthcareLabel = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var obesityLabel = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", -40)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obese (%)");

    var smokerLabel = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", -60)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokers (%)");

// updateToolTip function above csv import
circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, data);

// x axis labels event listener
xLabelsGroup.selectAll("text")
    .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // console.log(chosenXAxis);

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(data, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            circlesGroupText = renderCirclesText(circlesGroupText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesGroupText);

            // Update R squared
            values_x = data.map(d => d[chosenXAxis]);
            values_y = data.map(d => d[chosenYAxis]);
            rSquared = renderTrend(rSquared, values_x, values_y);

            // changes classes to change bold text
            switch (chosenXAxis) {
                case "poverty":
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    break;
                case "age":
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    break;
                case "income":
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    break;
            }
        }
        // y axis labels event listener
        yLabelsGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {

                    // replaces chosenXAxis with value
                    chosenYAxis = value;

                    // console.log(chosenYAxis);

                    // functions here found above csv import
                    // updates y scale for new data
                    yLinearScale = yScale(data, chosenYAxis);

                    // updates y axis with transition
                    yAxis = renderYAxis(yLinearScale, yAxis);

                    // updates circles with new y values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                    circlesGroupText = renderCirclesText(circlesGroupText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                    // Update R squared
                    values_x = data.map(d => d[chosenXAxis]);
                    values_y = data.map(d => d[chosenYAxis]);

                    rSquared = renderTrend(rSquared, values_x, values_y);

                    // changes classes to change bold text
                    switch (chosenYAxis) {
                        case "healthcare":
                            healthcareLabel
                                .classed("active", true)
                                .classed("inactive", false);
                            smokerLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            obesityLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            break;
                        case "obesity":
                            healthcareLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            smokerLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            obesityLabel
                                .classed("active", true)
                                .classed("inactive", false);
                            break;
                        case "smokes":
                            healthcareLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            smokerLabel
                                .classed("active", true)
                                .classed("inactive", false);
                            obesityLabel
                                .classed("active", false)
                                .classed("inactive", true);
                            break;
                        
                    }
                }
            });
    });

});




































































// // function used for updating circles group with new tooltip
// function updateToolTip(chosenXAxis, circlesGroup) {

//   var label;

//   if (chosenXAxis === "poverty") {
//     label = "Poverty Rating Level";
//   }
//   else (chosenXAxis === "age")
//    {
//     label = "Age:";
//   }
//   else 
//   {
//   // (chosenXAxis === "income") 
//   {
//     label = "Income:";
//   }

//   var toolTip = d3.tip()
//     .attr("class", "tooltip")
//     .offset([80, -60])
//     .html(function(d) {
//       return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
//     });

//   circlesGroup.call(toolTip);

//   circlesGroup.on("mouseover", function(data) {
//     toolTip.show(data);
//   })
//     // onmouseout event
//     .on("mouseout", function(data, index) {
//       toolTip.hide(data);
//     });

//   return circlesGroup;
// }

// // Retrieve data from the CSV file and execute everything below
// d3.csv("data.csv").then(function(data, err) {
//   if (err) throw err;

// // parse data
// data.forEach(function(data) {
//   data.obesity = +data.obesity;
//   data.poverty = +data.poverty;
//   data.healthcare = +data.healthcare;
//   data.age = +data.age;
//   data.income = +data.income
// });

//  // xLinearScale function above csv import
//  var xLinearScale = xScale(data, chosenXAxis);

// // Create y scale function
// var yLinearScale = d3.scaleLinear()
// .domain([0, d3.max(data, d => d.chosenYAxis)])
// .range([height, 0]);

// // Create initial axis functions
// var bottomAxis = d3.axisBottom(xLinearScale);
// var leftAxis = d3.axisLeft(yLinearScale);

// // append x axis
// var xAxis = chartGroup.append("g")
// .classed("x-axis", true)
// .attr("transform", `translate(0, ${height})`)
// .call(bottomAxis);

// // append y axis
// chartGroup.append("g")
// .call(leftAxis);

// // append initial circles
// var circlesGroup = chartGroup.selectAll("circle")
// .data(data)
// .enter()
// .append("circle")
// .attr("cx", d => xLinearScale(d[chosenXAxis]))
// .attr("cy", d => yLinearScale(d.chosenYAxis))
// .attr("r", 20)
// .attr("fill", "pink")
// .attr("opacity", ".5");

// // Create group for three x-axis labels
// var labelsGroup = chartGroup.append("g")
// .attr("transform", `translate(${width / 2}, ${height + 20})`);

// var povertyLabel = labelsGroup.append("text")
// .attr("x", 0)
// .attr("y", 20)
// .attr("value", "poverty") // value to grab for event listener
// .classed("active", true)
// .text("Poverty Rating Level (%)");

// var ageLabel = labelsGroup.append("text")
// .attr("x", 0)
// .attr("y", 40)
// .attr("value", "age") // value to grab for event listener
// .classed("inactive", true)
// .text("Age");

// var incomeLabel = labelsGroup.append("text")
// .attr("x", 0)
// .attr("y", 40)
// .attr("value", "income") // value to grab for event listener
// .classed("inactive", true)
// .text("Income");

// // append y axis
// chartGroup.append("text")
// .attr("transform", "rotate(-90)")
// .attr("y", 0 - margin.left)
// .attr("x", 0 - (height / 2))
// .attr("dy", "1em")
// .classed("axis-text", true)
// .text("Healthcare Rating Level");

// // updateToolTip function above csv import
// var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

//  // x axis labels event listener
//  labelsGroup.selectAll("text")
//  .on("click", function() {
//    // get value of selection
//    var value = d3.select(this).attr("value");
//    if (value !== chosenXAxis) {

//      // replaces chosenXAxis with value
//      chosenXAxis = value;

//       // console.log(chosenXAxis)

//         // functions here found above csv import
//         // updates x scale for new data
//         xLinearScale = xScale(data, chosenXAxis);

//         // updates x axis with transition
//         xAxis = renderAxes(xLinearScale, xAxis);

//         // updates circles with new x values
//         circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

//         // updates tooltips with new info
//         circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

//         // changes classes to change bold text
//         if (chosenXAxis === "age") {
//           ageLabel
//             .classed("active", true)
//             .classed("inactive", false);
//           povertyLabel
//             .classed("active", false)
//             .classed("inactive", true);
//           incomeLabel
//             .classed("active", false)
//             .classed("inactive", true);
//         }
//         else {
//           ageLabel
//             .classed("active", false)
//             .classed("inactive", true);
//           povertyLabel
//             .classed("active", true)
//             .classed("inactive", false);
//           incomeLabel
//           .classed("active", false)
//           .classed("inactive", true);
//         }
//         else {
//           ageLabel
//             .classed("active", false)
//             .classed("inactive", true);
//           povertyLabel
//             .classed("active", false)
//             .classed("inactive", true);
//           incomeLabel
//           .classed("active", true)
//           .classed("inactive", false);
//         }
//       }
//     });
// }).catch(function(error) {
//   console.log(error);
// });

// // // function used for updating xAxis var upon click on axis label
// // function renderAxes(newXScale, xAxis) {
// //   var bottomAxis = d3.axisBottom(newXScale);

// //   xAxis.transition()
// //     .duration(1000)
// //     .call(bottomAxis);

// //   return xAxis;
// // }

// // var xText = d3.select(".xText");
// // xText
// // .append("text")
// // .attr("data-axis", "x")
// // .text("poverty");

// // xText
// // .append("text")
// // .attr("data-axis", "x")
// // .text("age");

// // xText
// // .append("text")
// // .attr("data-axis", "x")
// // .text("income");

// //  // append y axis
// //  chartGroup.append("text")
// //  .attr("transform", "rotate(-90)")
// //  .attr("y", 0 - margin.left)
// //  .attr("x", 0 - (height / 2))
// //  .attr("dy", "1em")
// //  .classed("axis-text", true)
// //  .text("Healthcare Rating Level");

// // // updateToolTip function above csv import
// // var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
// // var yText = d3.select(".yText");



// // yText
// // .append("text")
// // .attr("data-axis", "y")
// // .text("healthcare");

// // yText
// // .append("text")
// // .attr("data-axis", "y")
// // .text("obesity");

// // yText
// // .append("text")
// // .attr("data-axis", "y")
// // .text("smoking");

// // var xLinearScale = xScale (data, xText); 
// // var yLinearScale = yScale (data, yText); 
// // var bottomAxis = d3.axisBottom(xLinearScale);
// // var leftAxis = d3.axisLeft(yLinearScale);  

// // // Import data from an external CSV file and parse and cast
// // d3.csv("assets/data/data.csv").then(function(data) {
// //  visualise(data);   
// // });
// //   // data.forEach(element => {
// //   //       element.poverty = +element.poverty;
// //   //       element.healthcare = +element.healthcare; 
// //   //       element.age = +element.age;
// //   //       element.income = +element.income; 
// //   //       element.obesity = +element.obesity; 
// //   //   })
// //   //  Visualise  
// //     // console.log(data [0].poverty); 
// // var dataX
// // // We called a "visualize" function on the data obtained with d3's .csv method.
// //    // This function handles the visual manipulation of all elements dependent on the data.
// //    // PART 1: Essential Local Variables and Functions
// //      // =================================
// //      // curX and curY will determine what data gets represented in each axis.
// //      // We designate our defaults here, which carry the same names
// //      // as the headings in their matching .csv data file.
     
   
// //      // We also save empty variables for our the min and max values of x and y.
// //      // this will allow us to alter the values in functions and remove repetitious c
    
// //    function visualise(data){
// //    var tooltip = d3
// //    .tip
// //    .attr()
// //    .offset()
// //    .html(function (d) {id x = "poverty" then ()})

// //    if x = "poverty"

// //    3. Create our visualization function
// //    // ====================================
// //    /
// //    function visualize(theData) {
// //      ode.
     
   
// //      // This function allows us to set up tooltip rules (see d3-tip.js).
// //      var toolTip = d3
// //        .tip()
// //        .attr()
// //        .offset()
// //        .html(function(d) {
// //          // x key
         
// //          // Grab the state name.
         
// //          // Snatch the y value's key and value.
         
// //          // If the x key is poverty
// //          if () {
// //            // Grab the x key and a version of the value formatted to show percentage
           
// //          }
// //          else {
// //            // Otherwise
// //            // Grab the x key and a version of the value formatted to include commas after every third digit.
           
// //          }
// //          // Display what we capture.
         
// //        });
// //      // Call the toolTip function.
     
// // }
// // // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.


// // //   append an SVG group translet doing math to take in the numb er tht imput to calculate the lines 
  
// // var chartGroup = svg.append("g")
// // .attr("transform", `translate(${margin.left}, ${margin.top})`);

  
// //   // Create scaling functions

// //   var xScale = d3.scaleLinear()
// //   .domain([0, d3.max(xText)])
// //   .range([0, width]);

// //     var yScale = d3.scaleLinear()
// //   .domain([0, d3.max(yText)])
// //   .range([height, 0]);

// // // function xScale(data, xText) {
// // //   var xLinearScale = d3.scaleLinear()
// // //     .domain([0, d3.max(data, d => d.xText)])
// // //     .range([0, width]);
// // //     return xLinearScale
// // // }

// // // function yscale(data, yText) {
// // //   var yLinearScale = d3.scaleLinear()
// // //     .domain([0, d3.max(data, d => d.yText)])
// // //     .range([height, 0]);
// // //     return yLinearScale
// // // }

// // // Create axis functions to render axis 

// // function renderxAxis (xScale, xAxis){
// //     var bottomAxis = d3.axisBottom(xScale); 
// //     xAxis.transition().duration (100).call(bottomAxis);
// //     return xAxis
// // }

// // // Render y-axis
// // function renderYAxis (yScale, yAxis){
// //     var leftAxis = d3.axisLeft(yScale); 
// //     yAxis.transition().duration (100).call(leftAxis);
// //     return yAxis
// // }


// // var xAxis = 
// // chartGroup.append("g")
// // .attr("transform", `translate(0, ${height})`)
// // .call(bottomAxis);

// // // Add y1-axis to the left side of the display
// // var yAxis = 
// // chartGroup.append("g")
// // .attr("transform", `translate(0, 0)`)
// // // // Define the color of the axis text
// // // .classed("green", true)
// // .call(leftAxis);

// // // append circles to data points
// // var circlesGroup = chartGroup.selectAll("circle")
// //   .data(data)
// //   .enter()
// //   .append("circle")
// //   .attr("cx", d=> xLinearScale(d[xText]))
// //   .attr("cy", d=> yLinearScale(d[yText]))
// //   .attr("r", "10")
// //   .attr("fill", "#69b3a2")
// //   .attr("opacity", ".5");
  










  