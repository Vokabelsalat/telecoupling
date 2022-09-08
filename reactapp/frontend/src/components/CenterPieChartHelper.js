import * as d3 from "d3";
import {
  polarToCartesian,
  describeArc,
  getStartAndEnd,
  getAngle
} from "../utils/orchestraUtils";
import {
  getRandomInt,
  getGroupFileAndRotationFromID,
  replaceSpecialCharacters,
  serializeXmlNode
} from "../utils/utils";

class CenterPieChartD3 {
  constructor(param) {
    this.id = param.id;
    this.data = param.data;
    this.colorBlind = param.colorBlind;
    this.treeThreatType = param.treeThreatType;
    this.getTreeThreatLevel = param.getTreeThreatLevel;

    d3.selection.prototype.moveToFront = function () {
      this.each(function () {
        this.parentNode.appendChild(this);
      });
    };

    this.paint();
  }

  paint() {
    d3.selectAll("#" + this.id + " > *").remove();

    let svg = d3
      .select("#" + this.id)
      .append("svg")
      .attr("width", 70)
      .attr("height", 70)
      .attr("x", 0)
      .attr("y", 0);

    let threats = [];
    for (let species of Object.keys(this.data)) {
      let threat = this.getTreeThreatLevel(species, this.treeThreatType);
      if (threat) threats.push(threat);
    }

    this.appendPie(svg, threats);
  }

  bakeTheThreatPie(options) {
    /*data and valueFunc are required*/
    if (!options.data || !options.valueFunc) {
      return "";
    }

    var data = options.data,
      valueFunc = options.valueFunc,
      r = options.outerRadius, //Default outer radius = 28px
      rInner = options.innerRadius ? options.innerRadius : r - 10, //Default inner radius = r-10
      strokeWidth = options.strokeWidth ? options.strokeWidth : 1, //Default stroke is 1
      pathClassFunc = options.pathClassFunc
        ? options.pathClassFunc
        : function () {
            return "";
          }, //Class for each path
      pathTitleFunc = options.pathTitleFunc
        ? options.pathTitleFunc
        : function () {
            return "";
          }, //Title for each path
      pieClass = options.pieClass ? options.pieClass : "marker-cluster-pie", //Class for the whole pie
      pieLabel = options.pieLabel ? options.pieLabel : d3.sum(data, valueFunc), //Label for the whole pie
      pieLabelClass = options.pieLabelClass
        ? options.pieLabelClass
        : "marker-cluster-pie-label", //Class for the pie label
      color = options.color,
      origo = r + strokeWidth, //Center coordinate
      w = origo * 2, //width and height of the svg element
      h = w,
      donut = d3.pie(),
      arc = d3.arc().innerRadius(rInner).outerRadius(r);

    /* let div = document.createElementNS("http://www.w3.org/1999/xhtml", "div"); */
    let div = d3.create("svg:g");

    //Create an svg element
    /* var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg'); */
    /* let svg = d3.create("g"); */
    //Create the pie chart

    var vis = div
      .append("svg:g")
      .data([data])
      .attr("class", pieClass)
      .attr("width", w + 2)
      .attr("height", h + 2)
      .style("position", "absolute");

    let donutData = donut.value(valueFunc).sort((a, b) => {
      return b.hasOwnProperty("values") && a.hasOwnProperty("values")
        ? b.values[0].numvalue - a.values[0].numvalue
        : b.numvalue - a.numvalue;
    });

    var arcs = vis
      .selectAll("g.arc")
      .data(donutData)
      .enter()
      .append("svg:g")
      //.attr('class', 'arc')
      .attr("class", function (d) {
        return "arc";
      })
      .attr("transform", "translate(" + origo + "," + origo + ")");

    arcs
      .append("svg:path")
      .attr("class", pathClassFunc)
      .attr("stroke-width", strokeWidth)
      .attr("fill", color)
      .attr("stroke", color)
      .attr("background", color)
      .attr("border-color", color)
      .attr("d", arc)
      .append("svg:title")
      .text(pathTitleFunc);

    /* var svg2 = document.createElementNS("http://www.w3.org/2000/svg", 'svg'); */
    /* var svg2 = d3.create('g'); */

    //Create the pie chart
    var vis2 = div
      .append("svg:g")
      .attr("class", pieClass + " text")
      .attr("width", w + 2)
      .attr("height", h + 2)
      .style("position", "absolute");

    vis2
      .append("circle")
      .attr("cx", origo)
      .attr("cy", origo)
      .attr("r", rInner - 1)
      .attr("fill", "white")
      .style("fill-opacity", "50%");

    vis2
      .append("text")
      .attr("x", origo)
      .attr("y", origo)
      .attr("class", pieLabelClass + "text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .style("font-size", options.instrument ? "5" : "initital")
      .style("font-weight", "bold")
      .style("display", options.data.length === 0 ? "none" : "block")
      .text(pieLabel);

    /* div.appendChild(svg);
        div.appendChild(svg2);*/ /*  */

    //Return the svg-markup rather than the actual element
    /* return serializeXmlNode(div.node()); */
    return div;
  }

  appendPie(group, threats) {
    let data = d3
      .nest()
      .key(function (d) {
        return d.abbreviation;
      })
      .entries(threats, d3.map);

    let colorBlind = this.colorBlind;
    let pie = this.bakeTheThreatPie({
      data: data,
      strokeWidth: 2,
      outerRadius: 31,
      innerRadius: 18,
      instrument: false,
      color: function (d) {
        return d.data.values[0].getColor(colorBlind);
      },
      pieClass: "clusterPie",
      pieLabelClass: "marker-cluster-pie-label",
      valueFunc: function (d) {
        return d.values.length;
      }
    });

    let innerGroup = group
      .append("g")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", "50px")
      .attr("height", "50px")
      .attr("class", "pieChartTest");

    innerGroup.node().appendChild(pie.node());

    /*  let textBox = textPathForPie.node().getBBox();
    let svgNode = innerGroup;
    let iconBox = svgNode.node().getBBox();

    let scale = (width ? 7 : 30) / iconBox.height; */

    /* let angle = (start + (end - start) / 2 - 360) % 180;

    let cx = iconBox.x + iconBox.width / 2;
    let cy = iconBox.y + iconBox.height / 2;
 */
    //svgNode.classed("icon", true);

    /* svgNode.attr(
      "transform",
      "translate(" +
        textBox.x +
        " " +
        textBox.y +
        ") rotate(" +
        angle +
        ") scale(" +
        scale +
        ") translate(" +
        -cx +
        " " +
        -cy +
        ")"
    ); */
  }
}

const CenterPieChartHelper = {
  draw: (input) => {
    new CenterPieChartD3(input);
  },
  reset: (id) => {
    d3.selectAll("#" + id + " > *").remove();
  }
};

export default CenterPieChartHelper;
