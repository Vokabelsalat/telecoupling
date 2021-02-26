import * as d3 from "d3";
import { getRandomInt } from '../utils/utils'
import { getIucnColor } from '../utils/timelineUtils'

class D3BarChart {
    constructor(param) {
        this.id = param.id;
        this.data = param.data;
        this.colorFunction = param.colorFunction;

        this.initWidth = 200;
        this.initHeight = 200;


        this.margin = {
            top: 10,
            right: 10,
            bottom: 90,
            left: 40,
        };

        d3.selection.prototype.moveToFront = function () {
            this.each(function () {
                this.parentNode.appendChild(this);
            });
        };

        this.paint();
    }

    clearAndReset() {
        d3.selectAll("#" + this.id + " > *").remove();

        this.width = this.initWidth;
        this.height = this.initHeight;

        let content = d3.select("#" + this.id);
        this.svg = content
            .append("svg")
            .attr("id", "chartArea")
            .style("border", "solid 1px gray")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + this.margin.left + "," + this.margin.top + ")");

        /*   this.container = svg.append("g")
              .attr("id", "wrapper");
  
          this.container.append("g")
              .attr("id", "selectChart");
  
          d3.select("#selectmainpartWrapper").append("svg")
              .attr("id", "selectmainpartSVG")
              .style("display", "none"); */

    }


    paint() {
        this.clearAndReset();

        let svg = this.svg;
        let data = this.data;
        let height = this.height;
        let colorFunction = this.colorFunction;

        if (data !== undefined) {
            // X axis
            var x = d3.scaleBand()
                .range([0, this.width])
                .domain(data.map(function (d) { return d.category; }))
                .padding(0.2);
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

            // Add Y axis
            var y = d3.scaleLinear()
                .domain([0, Math.max(...data.map(e => e.value))])
                .range([height, 0]);
            svg.append("g")
                .call(d3.axisLeft(y));

            // Bars
            svg.selectAll("mybar")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", function (d) { return x(d.category); })
                .attr("width", x.bandwidth())
                .attr("fill", function (d) {
                    return colorFunction(d.category);
                })
                // no bar at the beginning thus:
                .attr("height", function (d) { return height - y(0); }) // always equal to 0
                .attr("y", function (d) { return y(0); })

            // Animation
            svg.selectAll("rect")
                .transition()
                .duration(800)
                .attr("y", function (d) { return y(d.value); })
                .attr("height", function (d) { return height - y(d.value); })
                .delay(function (d, i) { return (i * 100) })
        }
    }
}

const BarChartHelper = {
    draw: (input) => {
        new D3BarChart(input);
    },
    reset: (id) => {
        d3.selectAll("#" + id + " > *").remove();
    }
}

export default BarChartHelper;