import * as d3 from "d3";
import { getOrCreate, dangerColorMap, sourceToDangerMap, pushOrCreate } from '../utils/utils'
import { getIucnColor, getIucnColorForeground } from '../utils/timelineUtils'

class D3Timeline {
    constructor(param) {
        this.id = param.id;
        this.data = param.data;
        this.sourceColorMap = param.sourceColorMap;
        this.domainYears = param.domainYears;
        this.zoomLevel = param.zoomLevel;
        this.speciesName = param.speciesName;

        this.initWidth = 960;
        this.initHeight = 100;

        this.margin = {
            top: 10,
            right: 0,
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
        d3.selectAll("#" + this.id + " > *").remove();

        let content = d3.select("#" + this.id);

        let speciesNameDiv = content
            .append("div")
            .attr("class", "speciesNameDiv");


        this.wrapper = content
            .append("div")
            .attr("id", this.id + "wrapper");

        switch (this.zoomLevel) {
            case 0:
                this.wrapper
                    .style("display", "table-cell")
                    .style("border-top", "1px solid var(--black)")

                speciesNameDiv
                    .style("display", "table-cell")
                    .style("vertical-align", "middle")
                    .style("border-top", "1px solid var(--black)")
                    .style("font-size", 9 + "px")
                    .style("width", "150px");
                break;
            default:
                this.wrapper.style("display", "block");
                speciesNameDiv
                    .style("display", "block");
                break;
        }

        if (this.id.toLowerCase().includes("scale")) {
            if (this.speciesName === "scaleTop") {
                speciesNameDiv.style("border-top", "none");
                this.wrapper.style("border-top", "none");
            }
        }
        else {
            speciesNameDiv.text(this.speciesName);
        }



        /* d3.select("#" + this.id)
            .append("svg")
            .attr("height", 30)
            .attr("width", this.initWidth)
            .style("display", "block"); */
    }

    appendCitesTrade(tradeData, groupedBySource) {

        let svgCITESTrade = this.wrapper
            .append("svg")
            .attr("id", this.id + "Trade")
            .attr("width", this.initWidth)
            .attr("height", this.height)
            .style("display", "block");

        svgCITESTrade.style("display", "block");

        let g = svgCITESTrade.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        let sortedSources = Object.keys(groupedBySource).sort(
            (a, b) => groupedBySource[b].length - groupedBySource[a].length
        );

        let yearPlus = {};

        for (let source of sortedSources.values()) {

            let lineColor = dangerColorMap[sourceToDangerMap[source]] ? dangerColorMap[sourceToDangerMap[source]].bg : dangerColorMap["DD"].bg;

            let filteredData = {};

            for (let yearData of tradeData.values()) {
                getOrCreate(filteredData, yearData.year.toString(), {
                    trades: yearData.trades.filter((e) => e.Source === source),
                    year: yearData.year,
                    source: source,
                });
            }

            /* c
            onsole.log("filtered", filteredData); */

            g.append("path")
                .datum(Object.values(filteredData))
                .attr("fill", lineColor)
                .attr("origFill", lineColor)
                .attr("stroke", "none")
                /* .attr("stroke-width", 1) */
                .attr(
                    "d",
                    d3
                        .area()
                        .x((d) => { return this.x(d.year) + this.x.bandwidth() / 2; })
                        .y0((d) => {
                            return this.y(getOrCreate(yearPlus, d.year.toString(), 0));
                        })
                        .y1((d) => {
                            let oldValue = getOrCreate(yearPlus, d.year.toString(), 0);
                            let count = d.trades.length;
                            yearPlus[d.year.toString()] = count + oldValue;
                            let yValue = this.y(count + oldValue);
                            d.yValue = yValue;
                            return yValue;
                        })
                )
                .on("mouseover", this.mouseover)
                .on("mousemove", this.mousemove)
                .on("mouseleave", this.mouseleave);
        }
    }

    appendCites(listingData) {
        let circleYearCountIUCN = {};

        let rowHeight = 2 * this.radius + 1;

        let svgCITES = this.wrapper
            .append("svg")
            .attr("id", this.id + "Cites")
            .attr("width", this.initWidth)
            .attr("height", rowHeight)
            .style("display", "block");

        let maxCount = 0;

        svgCITES.style("display", "block");

        let g = svgCITES.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");


        let rect = g
            .append("rect")
            .attr("width", this.width)
            .attr("height", (maxCount + 1) * rowHeight)
            .attr("fill", "none")
            .attr("stroke", "gray");
        //.style("fill", "url(#mainGradient)")
        /*.style("stroke", "black")*/
        //.style("fill", "url(#myGradient)");

        let elem = g.selectAll("g myCircleText").data(listingData);


        let elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                let count = this.yearCount(d.year, circleYearCountIUCN);
                maxCount = Math.max(maxCount, count);
                rect.attr("height", (maxCount + 1) * rowHeight);
                svgCITES.attr("height", (maxCount + 1) * rowHeight);
                return "translate(" + (this.x(Number(d.year)) + this.x.bandwidth() / 2) + "," + (rowHeight * count) + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(Number(d.year) + this.x.bandwidth() / 2);
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);

        g
            .append("text")
            .attr("transform", "translate(-5," + ((maxCount + 1) * rowHeight) / 2 + ")")
            .style("text-anchor", "end")
            .style("dominant-baseline", "central")
            .style("font-size", "9")
            .text("CITES");

        //let radius = (height - y(1)) / 2;
        elemEnter
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight)
            /* .attr("width", function (d) {
              return width - x(Number(d.year));
            }) */
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            /*.attr("r", radius)*/
            /*.attr("cx", function(d) {
                                return x.bandwidth() / 2;
                            })
                            .attr("cy", function(d) {
                                return radius;
                            })*/
            .style("fill", function (d) {
                switch (d.type) {
                    case "listingHistory":
                        switch (d.appendix) {
                            case "I":
                                return getIucnColor({ text: "CR" });
                            case "II":
                                return getIucnColor({ text: "EN" });
                            case "III":
                                return getIucnColor({ text: "NT" });
                            default:
                                break;
                        }
                        break;
                }
            })
            .style("stroke", "gray");

        if (this.zoomLevel > 0) {
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
                .attr("width", function (d) {
                    return this.width - this.x(Number(d.year));
                }.bind(this))
                .style("fill", function (d) {
                    switch (d.type) {
                        case "listingHistory":
                            switch (d.appendix) {
                                case "I":
                                    return getIucnColorForeground({ text: "CR" });
                                case "II":
                                    return getIucnColorForeground({ text: "EN" });
                                case "III":
                                    return getIucnColorForeground({ text: "NT" });
                                default:
                                    break;
                            }
                            break;
                    }
                })
                .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif"));
        }
    }

    appendIUCN(iucnData) {
        // ############# IUCN #############
        let circleYearCountIUCN = {};
        let rowHeight = 2 * this.radius + 1;

        let svgIUCN = this.wrapper
            .append("svg")
            .attr("id", this.id + "IUCN")
            .attr("width", this.initWidth)
            .attr("height", rowHeight)
            .style("display", "block");

        let maxCount = 0;

        let g = svgIUCN.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        let rect = g
            .append("rect")
            .attr("width", this.width)
            .attr("height", (maxCount + 1) * rowHeight)
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
                rect.attr("height", (maxCount + 1) * rowHeight);
                svgIUCN.attr("height", (maxCount + 1) * rowHeight);
                return "translate(" + (this.x(Number(d.year)) + this.x.bandwidth() / 2) + "," + (rowHeight * count) + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(Number(d.year) + this.x.bandwidth() / 2);
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);

        g
            .append("text")
            .attr("transform", "translate(-5," + ((maxCount + 1) * rowHeight) / 2 + ")")
            .style("text-anchor", "end")
            .style("dominant-baseline", "central")
            .style("font-size", this.fontSize)
            .text("IUCN");

        //let radius = (height - y(1)) / 2;
        elemEnter
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight)
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

        if (this.zoomLevel > 0) {
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
                .style("font-size", this.fontSize)
                .style("fill", getIucnColorForeground)
                .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif"));
        }
    }

    appendThreats(threatData) {
        // ############# THREATS #############
        let circleYearCountThreats = {};
        let rowHeight = 2 * this.radius + 1;

        let svgThreat = this.wrapper
            .append("svg")
            .attr("id", this.id + "Threat")
            .attr("width", this.initWidth)
            .attr("height", rowHeight);

        let maxCount = 0;

        svgThreat.style("display", "block");

        let g = svgThreat.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        let rect = g
            .append("rect")
            .attr("width", this.width)
            .attr("height", (maxCount + 1) * rowHeight)
            .style("fill", "none")
            .style("stroke", "gray");

        let elem = g.selectAll("g myCircleText").data(threatData);

        let elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                let count = this.yearCount(d.year, circleYearCountThreats);
                maxCount = Math.max(maxCount, count);
                rect.attr("height", (maxCount + 1) * rowHeight);
                svgThreat.attr("height", (maxCount + 1) * rowHeight);
                return "translate(" + (this.x(Number(d.year)) + this.x.bandwidth() / 2) + "," + rowHeight * count + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(Number(d.year)) + this.x.bandwidth() / 2;
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);

        let text = g
            .append("text")
            .attr("transform", "translate(-5," + ((maxCount + 1) * rowHeight) / 2 + ")")
            .style("text-anchor", "end")
            .style("dominant-baseline", "central")
            .style("font-size", "9")
            .text("Threats");

        //let radius = (height - y(1)) / 2;
        elemEnter
            .filter((d) => d.scope === "Global")
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", 2 * this.radius)
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            /*.attr("r", radius)*/
            /*.attr("cx", function(d) {
                                return x.bandwidth() / 2;
                            })
                            .attr("cy", function(d) {
                                return radius;
                            })*/
            /* .style("fill", getIucnColor) */
            .style("fill", (d) => {
                return dangerColorMap[d.danger].bg;
            })
            .style("stroke", "gray");

        elemEnter
            .filter((d) => d.scope !== "Global")
            .append("rect")
            .attr("class", "pinpoint")
            .attr("width", Math.sqrt(rowHeight * rowHeight * 2))
            .attr("height", Math.sqrt(rowHeight * rowHeight * 2))
            .attr("transform", "translate(" + this.x.bandwidth() / 2 + ",0) rotate(45)")
            /* .style("fill", getIucnColor) */
            .style("fill", (d) => {
                return dangerColorMap[d.danger].bg;
            })
            .style("stroke-width", "0.5")
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
            .style("font-size", this.radius - 1)
            /* .style("fill", getIucnColorForeground) */
            .style("fill", (d) => {
                return dangerColorMap[d.danger].fg;
            })
            .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif"));
    }

    appendThreatPies(threatData) {
        // ############# THREATS #############
        let rowHeight = 2 * this.radius + 1;
        let strokeWidth = 0.5;

        let circleYearCountThreats = {};

        let svgThreat = this.wrapper
            .append("svg")
            .attr("id", this.id + "Threat")
            .attr("width", this.initWidth)
            .attr("height", rowHeight);

        let maxCount = 0;

        svgThreat.style("display", "block");

        let g = svgThreat.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        let rect = g
            .append("rect")
            .attr("width", this.width)
            .attr("height", rowHeight)
            .style("fill", "none")
            .style("stroke", "grey");

        let text = g
            .append("text")
            .attr("transform", "translate(-5," + ((maxCount + 1) * rowHeight) / 2 + ")")
            .style("text-anchor", "end")
            .style("dominant-baseline", "central")
            .style("font-size", "9")
            .text("Threats");

        let piedData = {};
        for (let threat of threatData.values()) {
            if (threat.scope !== "Global") {
                pushOrCreate(
                    getOrCreate(piedData, threat.year.toString(), {
                        year: threat.year.toString(),
                        type: "threatpie",
                        data: {}
                    }).data,
                    threat.danger,
                    threat
                );
            }
        }

        // Compute the position of each group on the pie:
        var pie = d3.pie()
            .value(function (d) {
                return d.value.length;
            });

        piedData = Object.values(piedData);

        let elem = g.selectAll("wayne").data(threatData);

        let elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                return "translate(" + (this.x(parseInt(d.year)) + this.x.bandwidth() / 2) + "," + (-strokeWidth) + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(parseInt(d.year)) + this.x.bandwidth() / 2;
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);


        elemEnter
            .filter((d) => {
                return d.scope === "Global"
            })
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight + 2 * strokeWidth)
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            .style("fill", (d) => {
                return dangerColorMap[d.danger].bg;
            })
            .style("stroke-width", strokeWidth + "px")
            .style("stroke", "gray");

        elem = g.selectAll("g myCircleText").data(piedData);

        strokeWidth = 0.5;

        elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                return "translate(" + (this.x(parseInt(d.year)) + this.x.bandwidth() / 2) + "," + ((rowHeight) / 2) + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(parseInt(d.year)) + this.x.bandwidth() / 2;
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);

        elemEnter
            .selectAll('whatever')
            .data(function (d) {
                return pie(d3.entries(d.data));
            })
            .enter()
            .append('path')
            .attr('d', d3.arc()
                .innerRadius(0)
                .outerRadius(rowHeight / 2 - 0.5 * strokeWidth)
            )
            .attr('fill', function (d) {
                return dangerColorMap[d.data.key].bg;
            })
            .attr("stroke", "var(--black)")
            .style("stroke-width", strokeWidth + "px");
    }

    mouseover(d) {
        d3.select(".tooltip").style("display", "block");
    }

    mousemove(d) {
        //var parentOffset = $(this).closest("svg").offset();
        var parentOffset = d3.select(d3.select(this).node().closest("svg")).node().getBoundingClientRect();

        let htmlText = "";
        let leftAdd = 0;
        let topAdd = 0;

        /*         if (Array.isArray(d)) {
                    d3.select(this).style("fill", "rgba(9, 94, 142, 1)");
        
                    let x0 = d3.mouse(this)[0];
        
                    let bandwidth = x.bandwidth();
                    let year = null;
                    for (let s of x.domain().values()) {
                        if (x(s) + bandwidth >= x0) {
                            year = s;
                            break;
                        }
                    }
        
                    d = d.filter((e) => e.year === year)[0];
        
                    htmlText = "Amount of trades from " + d.source + ": " + d.trades.length + " in " + year;
                    topAdd = 25;
                } else { */

        console.log(d);

        switch (d.type) {
            case "trade":
                htmlText = "Amount of trades: " + d.count + " in " + d.year;
                topAdd = 25;
                break;
            case "listingHistory":
                htmlText = d.year + " : Appendix " + d.appendix;
                leftAdd = parseInt(d3.select(this).attr("x"));
                break;
            case "iucn":
                htmlText = d.year + " : " + d.category;
                leftAdd = parseInt(d3.select(this).attr("x"));
                break;
            case "threat":
                htmlText =
                    d.year +
                    " : " +
                    d.consAssCategoryOrig +
                    " | " +
                    d.threatened +
                    " | " +
                    d.scope +
                    " | " +
                    d.reference +
                    (d.countries ? " | " + d.countries : "");
                leftAdd = parseInt(d3.select(this).attr("x"));
                break;
            case "threatpie":
                htmlText = d.year +
                    "<br>" +
                    Object.keys(d.data).map(key => d.data[key][0].threatened + " (" + d.data[key].length + ") " + d.data[key].filter(e => e.countries !== undefined).map(e => e.countries).join(", ")).join("<br>");
                break;
            default:
                // statements_def
                break;
        }
        /* } */

        d3.select(".tooltip").html(htmlText)
            .style("left", leftAdd + d3.mouse(this)[0] + 85 + "px")
            .style("top", parentOffset.top + d3.mouse(this)[1] + 10 + topAdd + "px");
    }

    mouseleave(d) {
        d3.select(this).style("fill", d3.select(this).attr("origFill"));
        d3.select(".tooltip").style("display", "none");
    }

    paint() {
        this.clearAndReset();

        this.width = this.initWidth - this.margin.left - this.margin.right;
        this.height = this.initHeight - this.margin.top - this.margin.bottom;

        let yearDiff = this.domainYears.maxYear - this.domainYears.minYear;
        let xDomain = Array(yearDiff + 1)
            .fill()
            .map((_, i) => this.domainYears.minYear - 1 + i + 1);

        this.x = d3.scaleBand().rangeRound([0, this.width]).padding(0.1);

        this.x.domain(xDomain);

        this.y = d3.scaleLinear().rangeRound([this.height, 0]);

        var circleYearCount = {};

        if (this.data) {
            let [data, groupedBySource] = this.data.timeTrade;

            this.y.domain([
                0,
                d3.max(data, function (d) {
                    return Number(d.count);
                }),
            ]);

            if (this.zoomLevel > 0) {
                this.radius = Math.ceil(Math.min(this.x.bandwidth() / 2 - 5, this.height / 2));
                this.fontSize = this.radius;
            }
            else {
                this.radius = Math.ceil(Math.min(this.x.bandwidth() / 6, this.height / 2));
                this.fontSize = 9;
            }


            if (this.zoomLevel > 0 && data.length >= 2) {
                this.appendCitesTrade(data, groupedBySource);
            }

            if (this.data.timeListing.length) {
                this.appendCites(this.data.timeListing);
            }

            if (this.data.timeIUCN.length) {
                this.appendIUCN(this.data.timeIUCN);
            }

            if (this.data.timeThreat.length) {
                if (this.zoomLevel === 0) {
                    this.appendThreatPies(this.data.timeThreat);
                }
                else {
                    this.appendThreats(this.data.timeThreat);
                }
            }
        }
        else if (this.id.includes("scale")) {
            let svgScale = this.wrapper
                .append("svg")
                .attr("id", this.id + "Scale")
                .attr("width", this.initWidth)
                .attr("height", "25px")
                .style("display", "block");

            let top = -1;
            let axis = d3.axisBottom(this.x);

            if (this.speciesName === "scaleTop") {
                top = 25;
                axis = d3.axisTop(this.x);
            }

            let g = svgScale.append("g").attr("transform", "translate(" + this.margin.left + "," + top + ")");

            g.append("g")
                .attr("transform", "translate(0," + 0 + ")")
                .call(axis);
        }
    }
}


const TimelineHelper = {
    draw: (input) => {
        new D3Timeline(input);
    },
    reset: (id) => {
        d3.selectAll("#" + id + " > *").remove();
    }
}

export default TimelineHelper;