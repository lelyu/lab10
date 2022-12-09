// @author Le Lyu lyule@bc.edu
// lab 10 based on lab 5

// create svg with margin convention
const margin = { top: 50, right: 20, bottom: 20, left: 50 };

const width = 650 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
// define a reverse variable

let reverse = false;


// CHART INIT ------------------------------
// by default type is stores
let type = document.querySelector("#group-by").value;
let svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("role", "graphics-document")
    .attr("aria-roledescription", "bar chart")
    .attr("tabindex", 0)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// create scales without domains
let xScale = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);

let yScale = d3.scaleLinear().range([height, 0]);

// create axes and axis title containers
svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`);

svg.append("g").attr("class", "y-axis");

svg
    .append("text")
    .attr("class", "y-axis-title")
    .attr("x", 15)
    .attr("y", -15)
    .attr("text-anchor", "end");

//update(type);

// (Later) Define update parameters: measure type, sorting direction

// CHART UPDATES ---------------------------------------------------------
function update(data, type, reverse) {
    // Change the measure dynamically:
    // d[type] where type is either "stores" or "revenue"
    // Update scale domains

    // sort the data
    if (!reverse) {
        data.sort((a, b) => b[type] - a[type]);
    } else if (reverse) {
        data.sort((a, b) => a[type] - b[type]);
    }

    xScale.domain(data.map((d) => d.company));
    yScale.domain([
        0,
        d3.max(data, function (d) {
            return d[type];
        }),
    ]);
    // yScale.domain([0, d3.max(data, (d) => d[type])]);
    const bars = svg.selectAll(".bar").data(data, (d) => d.company);
    // Implement the enter-update-exist sequence
    bars
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => xScale(d.company))
        .attr("y", height)
        .attr("width", xScale.bandwidth())
        .merge(bars)
        .transition()
        .duration(1000)
        .attr("x", (d) => xScale(d.company))
        .attr("y", (d) => yScale(d[type]))
        .attr("height", function (d) {
            return height - yScale(d[type]);
        })
        .style("fill", "lightblue");

    bars.exit().remove();

    // Manually update the axis title
    // Update axes and axis title
    let xAxis = d3.axisBottom(xScale);

    svg.select(".x-axis").call(xAxis);

    let yAxis = d3.axisLeft(yScale);

    svg.select(".y-axis").call(yAxis);
    if (type === "stores") {
        svg.select(".y-axis-title").text("Stores");
    } else if (type === "revenue") {
        svg.select(".y-axis-title").text("Billion USD");
    }

    d3.select(".chart")
        .select("svg")
        .attr(
            "aria-label",
            type === "stores"
                ? "bar chart showing eight different coffee stores' number worldwide"
                : "bar chart showing eight different coffee stores' revenue in billions worldwide"
        );

    d3.selectAll(".bar")
        .attr("role", "graphics-symbol")
        .attr("aria-roledescription", "bar element")
        .attr("aria-label", d => {
            return type === "stores" ? `${d.company} has ${d.stores} stores worldwide` : `${d.company} has ${d.revenue} billions revenue worldwide`
        }
        )
        .attr("tabindex", 0);
}

// CHART UPDATES ---------------------------------------------------------
// Loading data
// define a global variable d to store data
let d;
d3.csv("coffee-house-chains.csv", d3.autoType).then((data) => {
    // create initial bar chart
    // d is used to stored the data so that it could be passed later.
    d = data;
    update(data, type, reverse);
});

// a variable to store current selection
let currentSelection = type;

d3.select("#group-by").on("change", function () {
    currentSelection = this.value;
    update(d, this.value, reverse);
});

d3.select("#btn").on("click", function () {
    reverse = !reverse;
    update(d, currentSelection, reverse);
});


d3.select(".x-axis").attr("aria-hidden", "true");
d3.select(".y-axis").attr("aria-hidden", "true");
d3.select(".y-axis-title").attr("aria-hidden", "true");