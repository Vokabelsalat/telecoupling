import * as d3 from "d3";
import {
  getRandomInt,
  getGroupFileAndRotationFromID,
  pushOrCreate,
  pushOrCreateWithoutDuplicates,
  dangerSorted
} from "../utils/utils";
import {
  getIucnColor,
  citesAppendixSorted,
  iucnCategoriesSorted,
  citesAssessment,
  iucnAssessment,
  bgciAssessment
} from "../utils/timelineUtils";

class D3BarChart {
  constructor(param) {
    this.id = param.id;
    this.data = param.data;

    this.zoomArray = [];

    this.margin = {
      top: 10,
      right: 40,
      bottom: 10,
      left: 10
    };

    this.initWidth = window.innerWidth / 2;
    this.initHeight = window.innerHeight / 2;

    this.currentTransform = [
      this.initWidth / 2,
      this.initHeight / 2,
      this.initHeight
    ];

    this.padding = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
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
      .attr(
        "transform",
        "translate(" + this.padding.left + "," + this.padding.top + ")"
      );

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

  zoom(d) {
    this.zoomArray.push(d.data.name);
    this.transition(d);
  }

  transition(d) {
    console.log(d);
    if (d) {
      const i = d3.interpolateZoom(this.currentTransform, [
        d.x0,
        d.y0,
        Math.max(d.y1 - d.y0, d.x1 - d.x0)
      ]);

      console.log(i);

      this.svg
        .transition()
        .delay(250)
        .duration(i.duration)
        .attrTween(
          "transform",
          () => (t) => this.transform((this.currentTransform = i(t)))
        )
        .on("end", this.transition);
    }
  }

  transform([x, y, w]) {
    return `
        translate(${this.initWidth / 2}, ${this.initHeight / 2})
        scale(${this.initHeight / w})
        translate(${-x}, ${-y})
        `;
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

      var root = d3.hierarchy(data).sum(function (d) {
        return d.value;
      }); // Here the size of each leave is given in the 'value' field in input data

      // Then d3.treemap computes the position of each element of the hierarchy
      d3
        .treemap()
        .round(true)
        .size([width, height])
        .paddingInner(-2)
        .paddingOuter(6)
        .paddingTop(20)
        .paddingRight(10)(root);

      let kingdomWrappers = svg
        .selectAll(".kingdomWrapper")
        .data(
          root.descendants().filter((d) => {
            return d.depth == 1 && d.children && d.children.length > 0;
          })
        )
        .enter()
        .append("rect")
        .attr("class", "kingdomWrapper")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .style("stroke", "black")
        .style("fill", "white")
        .on("click", this.zoom.bind(this));

      let familyWrappers = svg
        .selectAll(".familyWrapper")
        .data(
          root.descendants().filter((d) => {
            return d.depth == 2 && d.children && d.children.length > 0;
          })
        )
        .enter()
        .append("rect")
        .attr("class", "familyWrapper")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .style("stroke", "black")
        .style("fill", "none");

      let genusWrappers = svg
        .selectAll(".genusWrappers")
        .data(
          root.descendants().filter((d) => {
            return d.depth == 3 && d.children && d.children.length > 0;
          })
        )
        .enter()
        .append("rect")
        .attr("class", "familyWrapper")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .style("stroke", "black")
        .style("fill", "none");

      if (this.zoomArray.length === 0) {
        let nodeContaines = svg
          .selectAll(".nodeImgContainer")
          .data(
            root.descendants().filter((d) => {
              return d.depth == 3 && d.children && d.children.length > 0;
            })
          )
          .enter()
          .append("foreignObject")
          .attr("class", "nodeImgContainer")
          .attr("x", function (d) {
            return d.x0;
          })
          .attr("y", function (d) {
            return d.y0;
          })
          .attr("width", function (d) {
            return d.x1 - d.x0;
          })
          .attr("height", function (d) {
            return d.y1 - d.y0;
          })
          .append("xhtml:div")
          .attr("class", "nodeImgContainerDiv")
          .html((d) => {
            let link = d.data.children.sort((a, b) => a.value - b.value)[0]
              .link;
            return (
              '<div class="nodeText">' +
              "" +
              '</div><img class="nodeImage" style="vertical-align:text-top" src="' +
              link +
              '"/>'
            );
          });
        /* .on('click', d => {console.log("CLICK", d);}) */
      }

      /* let nodeContaines = svg
                .selectAll(".nodeImgContainer")
                .data(root.leaves().filter((d) => { return d.value > 0; }))
                .enter()
                .append("foreignObject")
                .attr("class", "nodeImgContainer")
                .attr('x', function (d) { return d.x0; })
                .attr('y', function (d) { return d.y0; })
                .attr('width', function (d) { return d.x1 - d.x0; })
                .attr('height', function (d) { return d.y1 - d.y0; })
                .append('xhtml:div')
                .attr("class", "nodeImgContainerDiv")
                .html(d => '<div class="nodeText">' + d.data.name + '</div>') //<a target="_blank" href="' + d.data.link + '"><img class="nodeImage" style="vertical-align:text-top" src="' + d.data.link + '"/></a>
            //<div class="nodeValue">'+d.data.value+'</div> */

      /*             let nodeIconContaines = nodeContaines
                .append('xhtml:div')
                .attr("class", "nodeIconContainerDiv")
                .style("width", "20px")
                .style("height", "20px")
                .style("left", "5px")
                .style("top", "5px")
                .style("position", "absolute"); */

      /*             nodeIconContaines.each(function(d, i) {
                let node = d3.select(this);

                let color = d.data.economically !== undefined ? d.data.economically.getColor() : "gray";
                let secondColor = d.data.ecologically !== undefined ? d.data.ecologically.getColor() : "gray";

                 if (d.data.Kingdom === "Animalia") {
                    d3.svg("/animalIcon.svg").then(function (xml) {
                        let icon = node.node().appendChild(xml.documentElement);
                        d3.select(icon).attr("width", 20).attr("height", 15).attr("y", 2.5);

                        d3.select(icon).select(".left").select("path").style("fill", color)
                        d3.select(icon).select(".right").select("path").style("fill", secondColor)
                    });
                }
                else {
                    d3.svg("/plantIcon2.svg").then(function (xml) {
                        let icon = node.node().appendChild(xml.documentElement);
                        d3.select(icon).attr("width", 20).attr("height", 15).attr("y", 2.5);

                        d3.select(icon).select(".left").select("path").style("fill", color)
                        d3.select(icon).select(".right").select("path").style("fill", secondColor) 
                    });
                } 
            }); */

      svg
        .selectAll("titles")
        .data(
          root.descendants().filter(function (d) {
            return d.depth == 1 && d.children && d.children.length > 0;
          })
        )
        .enter()
        .append("text")
        .attr("x", function (d) {
          return d.x0 + 6;
        })
        .attr("y", function (d) {
          return d.y0 + 15;
        })
        .text(function (d) {
          return d.data.name;
        })
        .style("font-family", "sans-serif")
        .attr("fill", "black");

      svg
        .selectAll("titles")
        .data(
          root.descendants().filter(function (d) {
            return d.depth == 2 && d.children && d.children.length > 0;
          })
        )
        .enter()
        .append("text")
        .attr("x", function (d) {
          return d.x0 + 6;
        })
        .attr("y", function (d) {
          return d.y0 + 15;
        })
        .text(function (d) {
          return d.data.name;
        })
        .style("font-size", "smaller")
        .style("font-family", "sans-serif")
        .attr("fill", "black");

      if (this.zoomArray.length > 0) {
        svg
          .selectAll("titles")
          .data(
            root.descendants().filter(function (d) {
              return d.depth == 3 && d.children && d.children.length > 0;
            })
          )
          .enter()
          .append("text")
          .attr("x", function (d) {
            return d.x0 + 6;
          })
          .attr("y", function (d) {
            return d.y0 + 15;
          })
          .text(function (d) {
            return d.data.name;
          })
          .style("font-size", "smaller")
          .style("font-family", "sans-serif")
          .attr("fill", "black");
      }
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
};

export default BarChartHelper;
