import * as d3 from "d3";
import { getOrCreate, dangerColorMap, sourceToDangerMap, iucnToDangerMap, pushOrCreate, dangerSorted } from '../utils/utils'
import { getIucnColor, getIucnColorForeground, iucnCategoriesSorted } from '../utils/timelineUtils'

class D3Timeline {
    constructor(param) {
        this.id = this.justTrade === true ? param.id + "JustTrade" : param.id;
        this.data = param.data;
        this.sourceColorMap = param.sourceColorMap;
        this.domainYears = param.domainYears;
        this.zoomLevel = param.zoomLevel;
        this.setZoomLevel = param.setZoomLevel;
        this.speciesName = param.speciesName;
        this.maxPerYear = param.maxPerYear;
        this.justTrade = param.justTrade;

        this.pieStyle = param.pieStyle;

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
            //case 0:
            default:
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
            /*  default:
                 this.wrapper.style("display", "block");
                 speciesNameDiv
                     .style("display", "block");
                 break; */
        }

        if (this.id.toLowerCase().includes("scale")) {
            if (this.speciesName === "scaleTop") {
                speciesNameDiv.style("border-top", "none");
                this.wrapper.style("border-top", "none");
            }
        }
        else {
            speciesNameDiv
                .text(this.speciesName)
                .style("cursor", "pointer")
                .on("click", () => {
                    if (this.zoomLevel === 0) {
                        this.setZoomLevel(2);
                    }
                    else {
                        this.setZoomLevel(0);
                    }
                })
        }



        /* d3.select("#" + this.id)
            .append("svg")
            .attr("height", 30)
            .attr("width", this.initWidth)
            .style("display", "block"); */
    }

    appendCitesTradeStacked(tradeData, groupedBySource) {

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
                .attr("stroke", "grey")
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

    appendCitesTrade(tradeData, groupedBySource) {

        let svgCITESTrade = this.wrapper
            .append("svg")
            .attr("id", this.id + "Trade")
            .attr("width", this.initWidth)
            .attr("height", this.height)
            .style("display", "block");

        svgCITESTrade.style("display", "block");

        let g = svgCITESTrade.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        g.append("path")
            .datum(Object.values(tradeData))
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d) {
                    return this.x(d.year) + this.x.bandwidth() / 2
                }.bind(this))
                .y(function (d) { return this.y(d.count) }.bind(this))
            );
    }

    appendCitesHeatMap(listingData) {
        let listingHeatMap = {};

        let yearCount = {};
        for (let entry of listingData) {
            let year = entry.year.toString();
            pushOrCreate(getOrCreate(listingHeatMap, year, {}), entry.appendix, entry);
            pushOrCreate(yearCount, year, 1);
        }

        let heatMapData = [];
        let maxKeyPrevious = null;
        let maxValuePrevious = null;

        let maxSpecies = Math.max(...Object.values(yearCount).map(e => e.length));

        for (let year of Object.keys(listingHeatMap).sort((a, b) => parseInt(a) - parseInt(b))) {
            let yearData = listingHeatMap[year.toString()];
            let push = true;

            let maxKey = Object.keys(yearData).reduce((a, b) => yearData[a].length > yearData[b].length ? a : b);
            let maxValue = yearData[maxKey];

            if (maxKeyPrevious !== null) {
                if (maxValue.length < maxValuePrevious.length) {
                    maxKey = maxKeyPrevious;
                    maxValue = maxValuePrevious;
                    push = false;
                }
            }

            maxKeyPrevious = maxKey;
            maxValuePrevious = maxValue;

            let tmp = maxValue[0];

            tmp.opacity = maxValue.length / maxSpecies;

            if (push)
                heatMapData.push(tmp);
        }

        listingData = heatMapData;

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
            .attr("height", rowHeight - 2)
            .attr("y", 1)
            /* .attr("width", function (d) {
              return width - x(Number(d.year));
            }) */
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            .style("fill", "white");

        elemEnter
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight - 2)
            .attr("y", 1)
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
            .style("stroke-width", 1)
            .style("stroke", function (d) {
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
                    default:
                        break;
                }
            })
            .style("fill-opacity", (d) => d.opacity)
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
                    default:
                        break;
                }
            });

        /*  if (this.zoomLevel > 0) {
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
                         default:
                             break;
                     }
                 })
                 .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif")); 
    }*/
    }

    appendCites(listingData) {

        let speciesListing = {};

        let listingKeys = [];
        let newListingData = [];

        let genusListing = null;
        for (let listing of listingData.sort((a, b) => parseInt(a.year) - parseInt(b.year))) {
            let push = true;
            let name = `${listing.genus} ${listing.species}`.trim();

            if (listing.rank === "GENUS") {
                genusListing = name;
                push = false;
            }

            let listingKey = `${listing.year}${listing.appendix}${listing.genus}${listing.species}`;
            listing.sciName = name;
            if (speciesListing.hasOwnProperty(name)) {
                if (!listingKeys.includes(listingKey)) {
                    speciesListing[name].push(listing);
                    if (push) {
                        newListingData.push(listing);
                    }
                }
            }
            else {
                speciesListing[name] = [listing];
                if (push) {
                    newListingData.push(listing);
                }
            }

            listingKeys.push(listingKey);
        }


        let speciesCount = Object.keys(speciesListing).length;

        if (genusListing) {
            speciesCount -= 1;
        }

        let speciesNamesSorted = Object.keys(speciesListing)
            .filter(key => key !== genusListing)
            .sort((a, b) => {
                return Math.min(...speciesListing[b].map(e => parseInt(e.year))) - Math.min(...speciesListing[a].map(e => parseInt(e.year)))
            });

        let circleYearCountIUCN = {};

        let rowHeight = this.radius + 1;

        let svgCITES = this.wrapper
            .append("svg")
            .attr("id", this.id + "Cites")
            .attr("width", this.initWidth)
            .attr("height", (speciesCount) * rowHeight)
            .style("display", "block");

        let maxCount = 0;

        svgCITES.style("display", "block");

        let g = svgCITES.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + 0 + ")")
            .attr("height", (speciesCount) * rowHeight);

        let rect = g
            .append("rect")
            .attr("width", this.width)
            .attr("height", (speciesCount) * rowHeight)
            .attr("stroke", "gray")
            .style("fill", "none");/*  */
        //.style("fill", "url(#mainGradient)")
        /*.style("stroke", "black")*/
        //.style("fill", "url(#myGradient)");


        appendCitesRects.bind(this)(newListingData);
        if (genusListing) {
            appendCitesRects.bind(this)(speciesListing[genusListing]);
        }

        g
            .append("text")
            .attr("transform", "translate(-5," + ((maxCount + 1) * rowHeight) / 2 + ")")
            .style("text-anchor", "end")
            .style("dominant-baseline", "central")
            .style("font-size", "9")
            .text("CITES");

        function appendCitesRects(lData) {
            let elem = g.selectAll("g myCircleText").data(lData);

            let elemEnter = elem
                .enter()
                .append("g")
                .attr("class", "noselect")
                .attr("transform", function (d) {
                    let rowNum = speciesNamesSorted.indexOf(d.sciName);
                    let count = this.yearCount(d.year, circleYearCountIUCN);
                    maxCount = Math.max(maxCount, count);
                    return "translate(" + (this.x(Number(d.year)) + this.x.bandwidth() / 2) + "," + (rowHeight * rowNum) + ")";
                }.bind(this))
                .attr("x", function (d) {
                    return this.x(Number(d.year) + this.x.bandwidth() / 2);
                }.bind(this))
                .on("mouseover", this.mouseover)
                .on("mousemove", this.mousemove)
                .on("mouseleave", this.mouseleave);


            //let radius = (height - y(1)) / 2;
            elemEnter
                .append("rect")
                .attr("class", "pinarea")
                .attr("height", (d) => d.rank === "GENUS" ? (speciesCount + 1) * rowHeight : rowHeight)
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
                //.style("fill-opacity", (d) => d.rank === "GENUS" ? 0.5 : 1.0)
                .style("fill", function (d) {
                    switch (d.type) {
                        case "listingHistory":
                            if (d.rank !== "GENUS") {
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
                            }
                            else {
                                svgCITES
                                    .append('defs')
                                    .append('pattern')
                                    .attr('id', 'diagonalHatch')
                                    .attr('patternUnits', 'userSpaceOnUse')
                                    .attr('width', 14)
                                    .attr('height', 24)
                                    .attr("patternTransform", "rotate(45)")
                                    .append('line')
                                    .attr("x1", 0)
                                    .attr("y", 0)
                                    .attr("x2", 0)
                                    .attr("y2", 24)
                                    .attr("stroke", () => {
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
                                    }
                                    )
                                    .attr('stroke-width', 2);

                                return "url(#diagonalHatch)";
                            }
                            break;
                        default:
                            break;
                    }
                })
                .style("stroke", function (d) {
                    switch (d.type) {
                        case "listingHistory":
                            /*  if (d.rank === "GENUS") {
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
                             }
                             else { */
                            return "gray";
                            /* } */
                            break;
                        default:
                            break;
                    }
                }).style("stroke-width", function (d) {
                    switch (d.type) {
                        case "listingHistory":
                            /*     if (d.rank === "GENUS") {
                                    return 3;
                                }
                                else { */
                            return 1;
                            /* } */
                            break;
                        default:
                            break;
                    }
                });

            /* if (this.zoomLevel > 0) {
                texts = elemEnter
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
                            default:
                                break;
                        }
                    })
                    .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif"));
        }*/
        }
    }

    appendIUCNHeatMap(iucnData) {
        let iucnHeatMap = {};

        let yearCount = {};
        for (let entry of iucnData) {
            let year = entry.year.toString();
            pushOrCreate(getOrCreate(iucnHeatMap, year, {}), entry.code, entry);
            pushOrCreate(yearCount, year, 1);
        }

        let heatMapData = [];
        let maxKeyPrevious = null;
        let maxValuePrevious = null;

        let maxSpecies = Math.max(...Object.values(yearCount).map(e => e.length));

        for (let year of Object.keys(iucnHeatMap).sort((a, b) => parseInt(a) - parseInt(b))) {
            let yearData = iucnHeatMap[year.toString()];
            let push = true;

            let maxKey = Object.keys(yearData).reduce((a, b) => yearData[a].length > yearData[b].length ? a : b);
            let maxValue = yearData[maxKey];

            /* if (maxKeyPrevious !== null) {
                if (maxValue.length < maxValuePrevious.length) {
                    maxKey = maxKeyPrevious;
                    maxValue = maxValuePrevious;
                    push = false;
                }
            } */

            maxKeyPrevious = maxKey;
            maxValuePrevious = maxValue;

            let tmp = maxValue[0];

            tmp.opacity = maxValue.length / maxSpecies;

            if (push)
                heatMapData.push(tmp);
        }

        let listingData = heatMapData;

        let circleYearCountIUCN = {};

        let rowHeight = 2 * this.radius + 1;

        let svgCITES = this.wrapper
            .append("svg")
            .attr("id", this.id + "IUCN")
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
            .text("IUCN");

        //let radius = (height - y(1)) / 2;
        elemEnter
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight - 2)
            .attr("y", 1)
            /* .attr("width", function (d) {
              return width - x(Number(d.year));
            }) */
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            .style("fill", "white");
        /*.attr("r", radius)*/
        /*.attr("cx", function(d) {
                            return x.bandwidth() / 2;
                        })
                        .attr("cy", function(d) {
                            return radius;
                        })*/


        elemEnter
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight - 2)
            .attr("y", 1)
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
            .style("stroke-width", 1)
            .style("stroke", function (d) {
                switch (d.type) {
                    case "iucn":
                        return getIucnColor(d);
                    default:
                        break;
                }
            })
            .style("fill-opacity", (d) => d.opacity)
            .style("fill", function (d) {
                switch (d.type) {
                    case "iucn":
                        return getIucnColor(d);
                    default:
                        break;
                }
            });

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
                        default:
                            break;
                    }
                })
                .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif"));
        }
    }

    appendIUCN(iucnData) {

        let speciesListing = {};

        let listingKeys = [];
        let newListingData = [];

        for (let listing of iucnData.sort((a, b) => parseInt(a.year) - parseInt(b.year))) {

            let listingKey = `${listing.year}${listing.code}${listing.sciName}`;
            if (speciesListing.hasOwnProperty(listing.sciName)) {
                if (!listingKeys.includes(listingKey)) {
                    speciesListing[listing.sciName].push(listing);
                    newListingData.push(listing);
                }
            }
            else {
                speciesListing[listing.sciName] = [listing];
                newListingData.push(listing);
            }

            listingKeys.push(listingKey);
        }

        /*  for (let species of Object.keys(speciesListing)) {
             speciesListing[species] = speciesListing[species].sort((a, b) => {
                 if (a.year === b.year) {
                     console.log(a, b, iucnCategoriesSorted.indexOf(a.code), iucnCategoriesSorted.indexOf(b.code));
     
                     if (iucnCategoriesSorted.indexOf(a.code) < iucnCategoriesSorted.indexOf(b.code)) {
                         return false;
                     }
                     else {
                         return true;
                     }
                 }
                 else {
                     return true;
                 }
             });
         } */

        let speciesCount = Object.keys(speciesListing).length;

        let speciesNamesSorted = Object.keys(speciesListing)
            .sort((a, b) => {
                if (Math.min(...speciesListing[b].map(e => parseInt(e.year))) > Math.min(...speciesListing[a].map(e => parseInt(e.year)))) {
                    return 1;
                }
                else if (Math.min(...speciesListing[b].map(e => parseInt(e.year))) < Math.min(...speciesListing[a].map(e => parseInt(e.year)))) {
                    return -1;
                }
                else {
                    if (iucnCategoriesSorted.indexOf(speciesListing[b][0].code) < 0) {
                        console.log("HERE", speciesListing[b][0].code);
                    }
                    return iucnCategoriesSorted.indexOf(speciesListing[b][0].code) - iucnCategoriesSorted.indexOf(speciesListing[a][0].code);
                }
            });

        let circleYearCountIUCN = {};

        let rowHeight = this.radius + 1;

        let svgCITES = this.wrapper
            .append("svg")
            .attr("id", this.id + "IUCN")
            .attr("width", this.initWidth)
            .attr("height", (speciesCount) * rowHeight)
            .style("display", "block");

        let maxCount = 0;

        svgCITES.style("display", "block");

        let g = svgCITES.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + 0 + ")")
            .attr("height", (speciesCount) * rowHeight);

        let rect = g
            .append("rect")
            .attr("width", this.width)
            .attr("height", (speciesCount) * rowHeight)
            .attr("stroke", "gray")
            .style("fill", "none");


        appendCitesRects.bind(this)(newListingData);

        g
            .append("text")
            .attr("transform", "translate(-5," + ((maxCount + 1) * rowHeight) / 2 + ")")
            .style("text-anchor", "end")
            .style("dominant-baseline", "central")
            .style("font-size", "9")
            .text("IUCN");

        function appendCitesRects(lData) {
            let elem = g.selectAll("g myCircleText").data(lData);

            let elemEnter = elem
                .enter()
                .append("g")
                .attr("class", "noselect")
                .attr("transform", function (d) {
                    let rowNum = speciesNamesSorted.indexOf(d.sciName);
                    let count = this.yearCount(d.year, circleYearCountIUCN);
                    maxCount = Math.max(maxCount, count);
                    return "translate(" + (this.x(Number(d.year)) + this.x.bandwidth() / 2) + "," + (rowHeight * rowNum) + ")";
                }.bind(this))
                .attr("x", function (d) {
                    return this.x(Number(d.year) + this.x.bandwidth() / 2);
                }.bind(this))
                .on("mouseover", this.mouseover)
                .on("mousemove", this.mousemove)
                .on("mouseleave", this.mouseleave);


            //let radius = (height - y(1)) / 2;
            elemEnter
                .append("rect")
                .attr("class", "pinarea")
                .attr("height", rowHeight)
                .attr("width", function (d) {
                    return this.width - this.x(Number(d.year));
                }.bind(this))
                .style("fill", function (d) {
                    switch (d.type) {
                        case "iucn":
                            return getIucnColor(d);
                        default:
                            break;
                    }
                })
                .style("stroke", function (d) {
                    switch (d.type) {
                        case "iucn":
                            return "gray";
                        default:
                            break;
                    }
                });
        }
    }

    appendThreatHeatMapNew(threatData) {
        let threatHeatMap = {};

        let yearCount = {};
        for (let entry of threatData) {
            let year = entry.year.toString();
            pushOrCreate(getOrCreate(threatHeatMap, year, {}), entry.threatened, entry);
            pushOrCreate(yearCount, year, 1);
        }

        let heatMapData = [];
        let maxKeyPrevious = null;
        let maxValuePrevious = null;

        let maxSpecies = Math.max(...Object.values(yearCount).map(e => e.length));

        for (let year of Object.keys(threatHeatMap).sort((a, b) => parseInt(a) - parseInt(b))) {
            let yearData = threatHeatMap[year.toString()];
            let push = true;

            let maxKey = Object.keys(yearData).reduce((a, b) => yearData[a].length > yearData[b].length ? a : b);
            let maxValue = yearData[maxKey];

            /* if (maxKeyPrevious !== null) {
                if (maxValue.length < maxValuePrevious.length) {
                    maxKey = maxKeyPrevious;
                    maxValue = maxValuePrevious;
                    push = false;
                }
            } */

            maxKeyPrevious = maxKey;
            maxValuePrevious = maxValue;

            let tmp = maxValue[0];

            tmp.opacity = maxValue.length / maxSpecies;

            if (push)
                heatMapData.push(tmp);
        }

        let listingData = heatMapData;

        let circleYearCountIUCN = {};

        let rowHeight = 2 * this.radius + 1;

        let svgCITES = this.wrapper
            .append("svg")
            .attr("id", this.id + "THREATS")
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
            .text("Threats");

        //let radius = (height - y(1)) / 2;
        elemEnter
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight - 2)
            .attr("y", 1)
            /* .attr("width", function (d) {
              return width - x(Number(d.year));
            }) */
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            .style("fill", "white");
        /*.attr("r", radius)*/
        /*.attr("cx", function(d) {
                            return x.bandwidth() / 2;
                        })
                        .attr("cy", function(d) {
                            return radius;
                        })*/


        elemEnter
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight - 2)
            .attr("y", 1)
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
            .style("stroke-width", 1)
            .style("stroke", function (d) {
                switch (d.type) {
                    case "threat":
                        return dangerColorMap[d.danger].bg;
                    default:
                        break;
                }
            })
            .style("fill-opacity", (d) => d.opacity)
            .style("fill", function (d) {
                switch (d.type) {
                    case "threat":
                        return dangerColorMap[d.danger].bg;
                    default:
                        break;
                }
            });

        /* if (this.zoomLevel > 0) {
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
                        case "threat":
                            return dangerColorMap[d.danger].fg;
                        default:
                            break;
                    }
                })
                .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif"));
    }*/
    }

    appendThreatsWithSubSpecies(threatData) {

        let speciesListing = {};

        let newListingData = [];

        for (let listing of threatData.sort((a, b) => parseInt(a.year) - parseInt(b.year))) {
            let push = true;
            let name = `${listing.genusSpecies}`.trim();

            if (listing.scope !== "Global") {
                push = false;
            }

            listing.sciName = name;
            if (speciesListing.hasOwnProperty(name)) {
                speciesListing[name].push(listing);
                if (push) {
                    newListingData.push(listing);
                }
            }
            else {
                speciesListing[name] = [listing];
                if (push) {
                    newListingData.push(listing);
                }
            }
        }

        let speciesCount = Object.keys(speciesListing).length;

        let speciesNamesSorted = Object.keys(speciesListing)
            .sort((a, b) => {
                if (Math.min(...speciesListing[b].map(e => parseInt(e.year))) > Math.min(...speciesListing[a].map(e => parseInt(e.year)))) {
                    return 1;
                }
                else if (Math.min(...speciesListing[b].map(e => parseInt(e.year))) < Math.min(...speciesListing[a].map(e => parseInt(e.year)))) {
                    return -1;
                }
                else {
                    if (dangerSorted.indexOf(speciesListing[b][0].danger) < 0) {
                        console.log("HERE", speciesListing[b][0].danger);
                    }
                    return dangerSorted.indexOf(speciesListing[b][0].danger) - dangerSorted.indexOf(speciesListing[a][0].danger);
                }
            });

        threatData = newListingData;

        // ############# THREATS #############
        let circleYearCountThreats = {};
        let rowHeight = 0.5 * this.radius + 1;

        let svgThreat = this.wrapper
            .append("svg")
            .attr("id", this.id + "Threat")
            .attr("width", this.initWidth)
            .attr("height", (speciesCount) * rowHeight);

        let maxCount = 0;

        svgThreat.style("display", "block");

        let g = svgThreat.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        let rect = g
            .append("rect")
            .attr("width", this.width)
            .attr("height", speciesCount * rowHeight)
            .style("fill", "none")
            .style("stroke", "gray");

        let elem = g.selectAll("g myCircleText").data(threatData);

        let elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                let rowNum = speciesNamesSorted.indexOf(d.genusSpecies);
                let count = this.yearCount(d.year, circleYearCountThreats);
                maxCount = Math.max(maxCount, count);
                return "translate(" + (this.x(Number(d.year)) + this.x.bandwidth() / 2) + "," + (rowHeight * rowNum) + ")";
                /* .attr("transform", function (d) {
                    let count = this.yearCount(d.year, circleYearCountThreats);
                    maxCount = Math.max(maxCount, count);
                    rect.attr("height", (maxCount + 1) * rowHeight);
                    svgThreat.attr("height", (maxCount + 1) * rowHeight);
                    return "translate(" + (this.x(Number(d.year)) + this.x.bandwidth() / 2) + "," + rowHeight * count + ")"; */
            }.bind(this))
            .attr("x", function (d) {
                return this.x(Number(d.year)) + this.x.bandwidth() / 2;
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);

        g.append("text")
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
            .attr("height", rowHeight)
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

        /* elemEnter
            .filter((d) => d.scope !== "Global")
            .append("rect")
            .attr("class", "pinpoint")
            .attr("width", Math.sqrt(rowHeight / 2 * rowHeight / 2 * 2))
            .attr("height", Math.sqrt(rowHeight / 2 * rowHeight / 2 * 2))
            .attr("transform", "translate(" + this.x.bandwidth() / 2 + ",0) rotate(45)")
            .style("fill", (d) => {
                return dangerColorMap[d.danger].bg;
            })
            .style("stroke-width", "0.5")
            .style("stroke", "gray"); */

        /*  elemEnter
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
             .style("fill", (d) => {
                 return dangerColorMap[d.danger].fg;
             })
             .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif"));*/
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

        g.append("text")
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
            .attr("width", Math.sqrt(rowHeight / 2 * rowHeight / 2 * 2))
            .attr("height", Math.sqrt(rowHeight / 2 * rowHeight / 2 * 2))
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

    appendThreatHeatMap(threatData) {

        let threatHeatMap = {};

        let yearCount = {};
        for (let entry of threatData) {
            if (entry.scope === "Global") {
                let year = entry.year.toString();
                pushOrCreate(getOrCreate(threatHeatMap, year, {}), entry.threatened, entry);
                pushOrCreate(yearCount, year, 1);
            }
        }

        let heatMapData = [];
        let maxKeyPrevious = null;
        let maxValuePrevious = null;

        let maxSpecies = Math.max(...Object.values(yearCount).map(e => e.length));

        for (let year of Object.keys(threatHeatMap).sort((a, b) => parseInt(a) - parseInt(b))) {
            let yearData = threatHeatMap[year.toString()];
            let push = true;

            let maxKey = Object.keys(yearData).reduce((a, b) => yearData[a].length > yearData[b].length ? a : b);
            let maxValue = yearData[maxKey];

            if (maxKeyPrevious !== null) {
                if (maxValue.length < maxValuePrevious.length) {
                    maxKey = maxKeyPrevious;
                    maxValue = maxValuePrevious;
                    push = false;
                }
            }

            maxKeyPrevious = maxKey;
            maxValuePrevious = maxValue;

            let tmp = maxValue[0];

            tmp.opacity = maxValue.length / maxSpecies;

            if (push)
                heatMapData.push(tmp);
        }

        threatData = heatMapData;

        // ############# THREATS #############
        let rowHeight = 2 * this.radius + 1;
        let strokeWidth = 0.5;

        // let circleYearCountThreats = {};

        let svgThreat = this.wrapper
            .append("svg")
            .attr("id", this.id + "Threat")
            .attr("width", this.initWidth)
            .attr("height", rowHeight);

        let maxCount = 0;

        svgThreat.style("display", "block");

        let g = svgThreat.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        g.append("rect")
            .attr("width", this.width)
            .attr("height", rowHeight)
            .style("fill", "none")
            .style("stroke", "grey");

        g.append("text")
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
            .style("fill-opacity", (d) => {
                return d.opacity;
            })
            .style("stroke-width", strokeWidth + "px")
            .style("stroke", "gray");

        elemEnter
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight - 2)
            .attr("y", 1)
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
            .style("stroke-width", 1)
            .style("stroke", function (d) {
                switch (d.type) {
                    case "threat":
                        return dangerColorMap[d.danger].bg;
                    default:
                        break;
                }
            })
            .style("fill-opacity", (d) => d.opacity)
            .style("fill", function (d) {
                switch (d.type) {
                    case "threat":
                        return dangerColorMap[d.danger].bg;
                    default:
                        break;
                }
            });

        /*  elem = g.selectAll("g myCircleText").data(piedData);
 
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
             .style("stroke-width", strokeWidth + "px"); */
    }

    appendThreatPies(threatData) {

        // ############# THREATS #############
        let rowHeight = 2 * this.radius + 1;
        let strokeWidth = 0.5;

        // let circleYearCountThreats = {};

        let svgThreat = this.wrapper
            .append("svg")
            .attr("id", this.id + "Threat")
            .attr("width", this.initWidth)
            .attr("height", rowHeight);

        let maxCount = 0;

        svgThreat.style("display", "block");

        let g = svgThreat.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        g.append("rect")
            .attr("width", this.width)
            .attr("height", rowHeight)
            .style("fill", "none")
            .style("stroke", "grey");

        g.append("text")
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

    appendThreatBars(threatData) {
        // ############# THREATS #############
        let rowHeight = 2 * this.radius + 1;
        let strokeWidth = 0.5;

        // let circleYearCountThreats = {};

        let svgThreat = this.wrapper
            .append("svg")
            .attr("id", this.id + "Threat")
            .attr("width", this.initWidth)
            .attr("height", rowHeight);

        let maxCount = 0;

        svgThreat.style("display", "block");

        let g = svgThreat.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        g.append("rect")
            .attr("width", this.width)
            .attr("height", rowHeight)
            .style("fill", "none")
            .style("stroke", "grey");

        g.append("text")
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

        let barScale = d3.scaleLinear()
            .domain([0, this.maxPerYear])
            .range([this.x.bandwidth(), 0]);

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
                return "translate(" + (this.x(parseInt(d.year)) + this.x.bandwidth() / 2) + "," + 0 + ")";
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
                let data = {};
                Object.keys(dangerColorMap).forEach((key, i) => {
                    data[key] = d.data.hasOwnProperty(key) ? d.data[key].length : 0;
                });
                var stackedData = d3.stack()
                    .keys(Object.keys(dangerColorMap))
                    ([data]);

                return stackedData;
            })
            .enter()
            .append("rect")
            .attr("width", (d) => {
                return barScale(d[0][0]) - barScale(d[0][1]);
            })
            .attr("height", rowHeight)
            .attr("x", function (d) {
                return this.x.bandwidth() + 4 * strokeWidth - barScale(d[0][0]);
            }.bind(this))
            .attr('fill', function (d) {
                return dangerColorMap[d.key].bg;
            })
            .attr("stroke", "none")

        elemEnter
            .append("rect")
            .attr("width", this.x.bandwidth() + 2 * strokeWidth)
            .attr("height", rowHeight - 2 * strokeWidth)
            .attr("transform", "translate(" + 3 * strokeWidth + "," + strokeWidth + ")")
            .style("fill", "none")
            .style("stroke", "grey");
    }

    appendThreatVerticalBars(threatData) {
        // ############# THREATS #############
        let localMaxPerYear = Math.max(...Object.values(threatData).map(e => e.maxPerYear));

        let rowHeight = localMaxPerYear * 2 * this.radius + 1;
        let strokeWidth = 0.5;

        // let circleYearCountThreats = {};

        let svgThreat = this.wrapper
            .append("svg")
            .attr("id", this.id + "Threat")
            .attr("width", this.initWidth)
            .attr("height", rowHeight);

        let maxCount = 0;

        svgThreat.style("display", "block");

        let g = svgThreat.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        g.append("rect")
            .attr("width", this.width)
            .attr("height", rowHeight)
            .style("fill", "none")
            .style("stroke", "grey");

        g.append("text")
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

        let barScale = d3.scaleLinear()
            .domain([0, localMaxPerYear])
            .range([rowHeight, 0]);

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
                return "translate(" + (this.x(parseInt(d.year))) + "," + 0 + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(parseInt(d.year));
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);

        elemEnter
            .selectAll('whatever')
            .data(function (d) {
                let data = {};
                Object.keys(dangerColorMap).forEach((key, i) => {
                    data[key] = d.data.hasOwnProperty(key) ? d.data[key].length : 0;
                });
                var stackedData = d3.stack()
                    .keys(Object.keys(dangerColorMap))
                    ([data]);

                let newStackedData = [];
                for (let entry of stackedData.values()) {
                    if (entry[0].data[entry.key] > 1) {
                        for (let i = entry[0][0]; i < entry[0][1]; i++) {
                            let newEntry = { 0: { 0: i, 1: i + 1, data: entry[0].data }, key: entry.key, index: entry.index };
                            newStackedData.push(newEntry);
                        }
                    }
                    else {
                        newStackedData.push(entry);
                    }
                }
                return newStackedData;
            })
            .enter()
            .append("rect")
            .attr("width", this.x.bandwidth() / 2)
            .attr("height", (d) => {
                return barScale(d[0][0]) - barScale(d[0][1]);
            })
            .attr("x", 2)
            .attr("y", function (d) {
                return barScale(d[0][1]);
            }.bind(this))
            .attr('fill', function (d) {
                return dangerColorMap[d.key].bg;
            })
            .attr("stroke", "grey")
            .attr("stroke-width", strokeWidth)

        /* elemEnter
            .append("rect")
            .attr("width", this.x.bandwidth() / 2 + 2 * strokeWidth)
            .attr("height", rowHeight - 2 * strokeWidth)
            .attr("transform", "translate(" + 3 * strokeWidth + "," + strokeWidth + ")")
            .style("fill", "none")
            .style("stroke", "grey"); */
    }

    mouseover(d) {
        d3.select(".tooltip").style("display", "block");
    }

    mousemove(d) {
        //var parentOffset = $(this).closest("svg").offset();
        var parentOffset = d3.select(d3.select(this).node().closest("svg")).node().getBoundingClientRect();

        /* console.log(d3.event.pageX, d3.event); */


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

        switch (d.type) {
            case "trade":
                htmlText = "Amount of trades: " + d.count + " in " + d.year;
                topAdd = 25;
                break;
            case "listingHistory":
                htmlText = d.sciName + "<br>" + d.year + " : Appendix " + d.appendix;
                leftAdd = parseInt(d3.select(this).attr("x"));
                break;
            case "iucn":
                htmlText = d.sciName + "<br>" + d.year + " : " + d.category;
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
                leftAdd = parseInt(d3.select(this).attr("x"));
                break;
            default:
                // statements_def
                break;
        }
        /* } */

        d3.select(".tooltip").html(htmlText)
            /* .style("left", leftAdd + d3.mouse(this)[0] + 85 + "px")
            .style("top", parentOffset.top + d3.mouse(this)[1] + 10 + topAdd + "px"); */
            .style("left", (d3.event.pageX + 25) + "px")
            .style("top", (d3.event.pageY + topAdd) + "px");

    }

    mouseleave(d) {
        d3.select(this).style("fill", d3.select(this).attr("origFill"));
        d3.select(".tooltip").style("display", "none");
    }

    paint() {
        this.clearAndReset();

        this.width = this.initWidth - this.margin.left - this.margin.right;
        this.height = this.initHeight - this.margin.top - this.margin.bottom;

        if (this.zoomLevel === 0 && this.justTrade === true) {
            this.height = this.height / 2.5;
        }

        let yearDiff = this.domainYears.maxYear - this.domainYears.minYear;

        let xDomain = Array(yearDiff + 1)
            .fill()
            .map((_, i) => this.domainYears.minYear - 1 + i + 1);

        this.x = d3.scaleBand().rangeRound([0, this.width]).padding(0.1);

        this.x.domain(xDomain);

        this.y = d3.scaleLinear().rangeRound([this.height, 0]);

        // var circleYearCount = {};

        if (this.data) {
            let [data, groupedBySource] = this.data.timeTrade;

            this.y.domain([
                0,
                d3.max(data, function (d) {
                    return Number(d.count);
                }),
            ]);

            if (this.justTrade === true) {
                if (this.zoomLevel > 0) {
                    this.appendCitesTradeStacked(data, groupedBySource);
                }
                else {
                    this.appendCitesTrade(data, groupedBySource);
                }
            }
            else {

                if (this.zoomLevel > 0) {
                    this.radius = Math.ceil(Math.min(this.x.bandwidth() / 2 - 5, this.height / 2));
                    this.fontSize = this.radius;
                }
                else {
                    this.radius = Math.ceil(Math.min(this.x.bandwidth() / 6, this.height / 2));
                    this.fontSize = 9;
                }

                if (this.data.timeListing.length) {
                    if (this.zoomLevel > 0) {
                        this.appendCites(this.data.timeListing);
                    }
                    else {
                        this.appendCitesHeatMap(this.data.timeListing);
                    }
                }

                if (this.data.timeIUCN.length) {
                    if (this.zoomLevel > 0) {
                        this.appendIUCN(this.data.timeIUCN);
                    }
                    else {
                        this.appendIUCNHeatMap(this.data.timeIUCN);
                    }
                }

                if (this.data.timeThreat.length) {
                    if (this.zoomLevel === 0) {
                        switch (this.pieStyle) {
                            case "pie":
                                //this.appendThreatPies(this.data.timeThreat);
                                this.appendThreatHeatMap(this.data.timeThreat);
                                break;
                            case "bar":
                                this.appendThreatBars(this.data.timeThreat);
                                break;
                            case "ver":
                                this.appendThreatVerticalBars(this.data.timeThreat);
                                break;
                            default:
                                break;
                        }
                    }
                    else {
                        //this.appendThreats(this.data.timeThreat);
                        this.appendThreatsWithSubSpecies(this.data.timeThreat);
                    }
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