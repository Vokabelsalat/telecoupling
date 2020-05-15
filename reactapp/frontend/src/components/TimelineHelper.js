import * as d3 from "d3";
import { getOrCreate } from '../utils/utils'
import { getIucnColor, getIucnColorForeground } from '../utils/timelineUtils'

class D3Timeline {
    constructor(param) {
        this.id = param.id;
        this.data = param.data;
        this.sourceColorMap = param.sourceColorMap;
        this.domainYears = param.domainYears;

        this.initWidth = 960;
        this.initHeight = 70;

        this.margin = {
            top: 10,
            right: 20,
            bottom: 20,
            left: 50,
        };

        this.paint();
    }

    yearCount(y, obj) {
        let count = getOrCreate(obj, y.toString(), -1);
        obj[y.toString()] = ++count;
        return count;
    }

    clearAndReset() {
        d3.select("#" + this.id + " > *").remove();
        d3.select("#" + this.id)
            .append("svg")
            .attr("class", "citesTrade")
            .attr("height", this.initHeight)
            .attr("width", this.initWidth)
            .style("display", "block");
    }

    appendIUCN(iucnData) {
        // ############# IUCN #############
        let circleYearCountIUCN = {};

        let content = d3.select("#" + this.id);
        let svgIUCN = content.append("svg")
            .attr("id", this.id + "IUCN")
            .attr("width", this.initWidth)
            .attr("height", 2 * this.radius)
            .style("display", "block");

        let maxCount = 0;

        let g = svgIUCN.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        let rect = g
            .append("rect")
            .attr("width", this.width)
            .attr("height", (maxCount + 1) * 2 * this.radius + 1)
            .attr("fill", "none")
            .attr("stroke", "gray");
        //.style("fill", "url(#mainGradient)")
        /*.style("stroke", "black")*/
        //.style("fill", "url(#myGradient)");

        let elem = g.selectAll("g myCircleText").data(iucnData);

        let elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                let count = this.yearCount(d.year, circleYearCountIUCN);
                maxCount = Math.max(maxCount, count);
                rect.attr("height", (maxCount + 1) * 2 * this.radius + 1);
                svgIUCN.attr("height", (maxCount + 1) * 2 * this.radius + 1);
                return "translate(" + this.x(Number(d.year)) + "," + (this.radius * 2 * count + 1) + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(Number(d.year));
            }.bind(this))
        /* .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave); */

        let text = g
            .append("text")
            .attr("transform", "translate(-5," + ((maxCount + 1) * 2 * this.radius + 1) / 2 + ")")
            .style("text-anchor", "end")
            .style("dominant-baseline", "central")
            .style("font-size", "9")
            .text("IUCN");

        //let radius = (height - y(1)) / 2;
        elemEnter
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", 2 * this.radius)
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
                /*.attr("r", radius)*/
            }.bind(this))
            /*.attr("cx", function(d) {
                                return x.bandwidth() / 2;
                            })
                            .attr("cy", function(d) {
                                return radius;
                            })*/
            .style("fill", getIucnColor)
            .style("stroke", "gray");

        elemEnter
            .append("text")
            .attr("class", "circleLabel noselect")
            .text(function (d) {
                return d.text;
            })
            .attr("x", function (d) {
                return this.x.bandwidth() / 2;
            }.bind(this))
            .attr("y", function (d) {
                return this.radius;
            }.bind(this))
            .style("font-size", this.radius)
            .style("fill", getIucnColorForeground)
            .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif"));
    }

    paint() {
        this.clearAndReset();

        let [data, groupedBySource] = this.data.timeTrade;

        this.width = this.initWidth - this.margin.left - this.margin.right;
        this.height = this.initHeight - this.margin.top - this.margin.bottom;

        let yearDiff = this.domainYears.maxYear - this.domainYears.minYear;
        let xDomain = Array(yearDiff + 1)
            .fill()
            .map((_, i) => this.domainYears.minYear - 1 + i + 1);

        this.x = d3.scaleBand().rangeRound([0, this.width]).padding(0.1);

        this.x.domain(xDomain);

        this.y = d3.scaleLinear().rangeRound([this.height, 0]);

        let svg = d3.select("#" + this.id + " > svg");

        let g = svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        var circleYearCount = {};

        this.y.domain([
            0,
            d3.max(data, function (d) {
                return Number(d.count);
            }),
        ]);

        this.radius = Math.ceil(Math.min(this.x.bandwidth() / 2 - 5, this.height / 2));

        g.append("g")
            .attr("transform", "translate(0," + (data.length > 0 ? this.height : 0) + ")")
            .call(d3.axisBottom(this.x));

        if (this.data.timeIUCN.length) {
            this.appendIUCN(this.data.timeIUCN);
        }

    }
}

const draw = (input) => {
    new D3Timeline(input);
};

export default draw;