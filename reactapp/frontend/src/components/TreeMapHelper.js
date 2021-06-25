import * as d3 from "d3";
import { getRandomInt, getGroupFileAndRotationFromID, pushOrCreate, pushOrCreateWithoutDuplicates, dangerSorted } from '../utils/utils'
import { getIucnColor, citesAppendixSorted, iucnCategoriesSorted } from '../utils/timelineUtils'

class D3BarChart {
    constructor(param) {
        this.id = param.id;
        this.data = param.data;

        this.margin = {
            top: 10,
            right: 40,
            bottom: 10,
            left: 10,
        };

        this.initWidth = window.innerWidth / 2;
        this.initHeight = window.innerHeight / 2;

        this.padding = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
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

        this.width = this.initWidth - this.margin.left - this.margin.right;
        this.height = this.initHeight - this.margin.top - this.margin.bottom;

        let content = d3.select("#" + this.id);

        let svg = content
            .append("svg")
            .attr("id", "chartArea")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("border", "solid 1px gray");

        this.svg = svg
            .append("g")
            .attr("transform",
                "translate(" + this.padding.left + "," + this.padding.top + ")");

        /*  this.svg.append("text")
             .text(this.text)
             .attr("transform",
                 "translate(" + this.margin.left + "," + this.margin.top + ")");
  */


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
        let width = this.width - this.padding.left - this.padding.right;
        let height = this.height - this.padding.top - this.padding.bottom;
        let colorFunction = this.colorFunction;

        let defs = svg.append("defs");

        if (data !== undefined && Object.keys(data).length > 0) {
            /* svg.select(".xticks").selectAll(".tick").selectAll("text").remove();

            xticks.data(this.data)
                .append("svg:image")
                .attr("xlink:href", function (d) {
                    let returnPath = "/" + getGroupFileAndRotationFromID(d.group).filename;
                    return returnPath;
                })
                .attr("width", 20)
                .attr("height", 20)
                .attr("x", -10)
                .attr("y", 45); */

            var root = d3.hierarchy(data).sum(function (d) { return d.value }) // Here the size of each leave is given in the 'value' field in input data

            // Then d3.treemap computes the position of each element of the hierarchy
            d3.treemap()
                .round(true)
                .size([width, height])
                .paddingInner(-2)
                .paddingOuter(6)
                .paddingTop(27)
                .paddingRight(27)
                (root)

            svg
                .selectAll(".nodeImgContainer")
                .data(root.leaves())
                .enter()
                .append("foreignObject")
                .attr("class", "nodeImgContainer")
                .attr('x', function (d) { return d.x0; })
                .attr('y', function (d) { return d.y0; })
                .attr('width', function (d) { return d.x1 - d.x0; })
                .attr('height', function (d) { return d.y1 - d.y0; })
                .append('xhtml:div')
                .attr("class", "nodeImgContainerDiv")
                .html(d => '<div class="nodeText">' + d.data.name + '</div><a target="_blank" href="' + d.data.link + '"><img class="nodeImage" src="' + d.data.link + '"/></a>')
            /* <div class="nodeValue">'+d.data.value+'</div> */

            svg
                .selectAll("titles")
                .data(root.descendants().filter(function (d) { return d.depth == 1 }))
                .enter()
                .append("text")
                .attr("x", function (d) { return d.x0 + 6 })
                .attr("y", function (d) { return d.y0 + 20 })
                .text(function (d) { return d.data.name })
                .style("font-family", "sans-serif")
                .attr("fill", "black")

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