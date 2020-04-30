let sourceColorMap = {};

let index = 0;
//let colorString = colorBrewerScheme8Qualitative.map(e => '<div style="display:inline-block; width:20px; height:20px; background-color:' + e + '">' + (index++) + '</div>');
let colorString = Object.keys(iucnColors).map(
  (e) =>
    '<div style="display:inline-block; width:30px; height:20px; background-color:' +
    iucnColors[e].bg +
    "; color: " +
    iucnColors[e].fg +
    '">' +
    e +
    "</div>"
);

let zoomLevel = 0;
let maxZoomLevel = 2;

let setZoomLevel = (setValue) => {
  zoomTimelines(setValue - zoomLevel);
}

let zoomTimelines = (add) => {
  zoomLevel += add;
  zoomLevel = Math.max(0, zoomLevel);
  zoomLevel = Math.min(maxZoomLevel, zoomLevel);

  switch (zoomLevel) {
    case 0:
      /* $(".visWrapper").css("display", "table-row");*/
      $(".visHeader").css("border-top", "1px solid black");
      $(".visContent").css("border-top", "1px solid black");
      $(".visHeader").css("border-bottom", "1px solid black");
      $(".visContent").css("border-bottom", "1px solid black");
      $(".tradeTimeline").hide();
      $(".visContent").css("display", "table-cell");
      $(".visHeader").css("display", "table-cell");
      $(".visHeader").css("vertical-align", "middle");
      $(".visHeader").css("width", "150px");
      $(".timelineHeader").css("margin-top", "0");
      $("#overAllSvg").css("margin-left", "150px");
      $("#overAllSvg").css("display", "block");
      $("#overAllSvg").show();
      break;
    case 1:
      collapseTimelines(true);
      break;
    case 2:
      collapseTimelines(false);
      break;
    default:
      break;
  }

  $("#zoomLevel").text((zoomLevel + 1) + "/" + (maxZoomLevel + 1));
  console.log("ZOOM", zoomLevel);

}

let collapsed = false;
let collapseTimelines = (setValue = null) => {
  if (setValue !== null) {
    collapsed = setValue
  }
  else {
    collapsed = !collapsed;
  }

  if (collapsed) {
    /* $(".visWrapper").css("display", "table-row");*/
    $(".visHeader").css("border-top", "1px solid black");
    $(".visContent").css("border-top", "1px solid black");
    $(".visHeader").css("border-bottom", "1px solid black");
    $(".visContent").css("border-bottom", "1px solid black");
    $(".tradeTimeline").hide();
    $(".visContent").css("display", "table-cell");
    $(".visHeader").css("display", "table-cell");
    $(".visHeader").css("vertical-align", "middle");
    $(".visHeader").css("width", "150px");
    $(".timelineHeader").css("margin-top", "0");
    $("#overAllSvg").css("margin-left", "150px");
    $("#overAllSvg").css("display", "block");
    $("#overAllSvg").show();
  } else {
    $(".visHeader").css("border", "none");
    $(".visContent").css("border", "none");
    $(".visContent").css("display", "block");
    $(".visHeader").css("display", "block");
    $(".timelineHeader").css("margin-top", "10px");
    $(".timelineHeader").css("margin-top", "default");
    $(".tradeTimeline").show();
    $("#overAllSvg").hide();
  }
};

$.get("timelinedata.json", function (tradeData) {
  $("body").append("<div id='legends'>");
  $("#legends").append("<div>").append(colorString.join(""));

  //########### CREATING DATA ###########
  let minYear = 9999;
  let maxYear = -9999;

  for (let speciesName of Object.keys(tradeData).values()) {
    let speciesObject = tradeData[speciesName];

    let [data, groupedBySource] = getTimelineTradeDataFromSpecies(speciesObject);
    let listingData = getTimelineListingDataFromSpecies(speciesObject);
    let iucnData = getTimelineIUCNDataFromSpecies(speciesObject);
    let threatData = getTimelineThreatsDataFromSpecies(speciesObject);

    tradeData[speciesName].timeTrade = [data, groupedBySource];
    tradeData[speciesName].timeListing = listingData;

    tradeData[speciesName].timeIUCN = iucnData;
    tradeData[speciesName].timeThreat = threatData;

    let allCircleData = [];
    allCircleData.push(...listingData);
    allCircleData.push(...iucnData);
    allCircleData.push(...threatData);

    let domainYears = data.map(function (d) {
      return d.year;
    });

    domainYears.push(...allCircleData.map((d) => d.year));

    let extent = d3.extent(domainYears);

    minYear = Math.min(minYear, extent[0]);
    maxYear = Math.max(maxYear, extent[1]);

    tradeData[speciesName].allCircleData = allCircleData;
    tradeData[speciesName].timeExtent = extent;

    /*break;*/
  }

  let dangerColorLegend = Object.keys(dangerColorMap).map(
    (k) =>
      '<div style="display:inline-block; width:30px; height:20px; background-color:' +
      dangerColorMap[k].bg +
      "; color: " +
      dangerColorMap[k].fg +
      '">' +
      k +
      "</div>"
  );

  let sourceColorLegend = Object.keys(sourceToDangerMap).map(
    (k) =>
      '<div style="display:inline-block; width:30px; height:20px; background-color:' +
      dangerColorMap[sourceToDangerMap[k]].bg +
      "; color: " +
      dangerColorMap[sourceToDangerMap[k]].fg +
      '">' +
      k +
      "</div>"
  );
  $("#legends").append("<div>" + sourceColorLegend.join("") + "</div>");

  $("#legends").append("<div>" + dangerColorLegend.join("") + "</div>");

  $("#legends").append('<button class="inline noselect" onclick="zoomTimelines(-1)">-</button>');
  $("#legends").append('<button class="inline noselect" onclick="zoomTimelines(1)">+</button>');
  $("#legends").append('<div class="inline">Zoom: <div class="inline" id="zoomLevel"></div></div>');

  let yearDiff = maxYear - minYear;
  let xDomain = Array(yearDiff + 1)
    .fill()
    .map((_, i) => minYear - 1 + i + 1);

  // create a tooltip
  var Tooltip = d3
    .select("#page-wrapper")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("max-width", "250px");

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function (d) {
    Tooltip.style("opacity", 1);
  };
  var bisectDate = d3.bisector(function (d) {
    return d.date;
  }).left;

  var mousemove = function (d) {
    var parentOffset = $(this).closest("svg").offset();

    let htmlText = "";
    let leftAdd = 0;
    let topAdd = 0;

    if (Array.isArray(d)) {
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
    } else {
      switch (d.type) {
        case "trade":
          htmlText = "Amount of trades: " + d.count + " in " + d.year;
          topAdd = 25;
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
        default:
          // statements_def
          break;
      }
    }

    Tooltip.html(htmlText)
      .style("left", leftAdd + d3.mouse(this)[0] + 85 + "px")
      .style("top", parentOffset.top + d3.mouse(this)[1] + 10 + topAdd + "px");
  };
  var mouseleave = function (d) {
    d3.select(this).style("fill", d3.select(this).attr("origFill"));
    Tooltip.style("opacity", 0);
  };

  let initWidth = 960;
  let initHeight = 150;

  var margin = {
    top: 10,
    right: 20,
    bottom: 20,
    left: 50,
  };

  let width = initWidth - margin.left - margin.right;
  let height = initHeight - margin.top - margin.bottom;

  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);

  x.domain(xDomain);

  $("#page-wrapper").append('<svg id="overAllSvg" width="' + initWidth + '" height="' + 30 + '">');
  let overAllSvgG = d3
    .select("#overAllSvg")
    .style("display", "none")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  overAllSvgG
    .append("g")
    /* .attr("transform", "translate(0," + height + ")") */
    .call(d3.axisBottom(x));

  for (let speciesName of Object.keys(tradeData).values()) {
    let speciesObject = tradeData[speciesName];

    let id = "timeline" + speciesName.replaceSpecialCharacters();

    $("#page-wrapper").append('<div id="' + id + 'Wrapper" class="visWrapper">');
    let $wrapper = $("#" + id + "Wrapper");
    $wrapper.append(
      "<div class='visHeader'><div class='timelineHeader'>" + speciesName + "</div></div>"
    );
    $wrapper.append("<div class='visContent'>");
    let $visContent = $($wrapper).find(".visContent").first();
    let $svg = $visContent.append(
      '<svg id="' +
      id +
      '" class="tradeTimeline" width="' +
      initWidth +
      '" height="' +
      initHeight +
      '">'
    );

    let [data, groupedBySource] = speciesObject.timeTrade;
    let listingData = speciesObject.timeListing;
    let iucnData = speciesObject.timeIUCN;
    let threatData = speciesObject.timeThreat;

    //let otherCircleData = listingData.concat(iucnData).concat(threatData);

    //########### BUILDING CHART ###########
    var svg = d3.select("#" + id);

    let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var y = d3.scaleLinear().rangeRound([height, 0]);

    var circleYearCount = {};

    let yearCount = (y, obj) => {
      let count = getOrCreate(obj, y.toString(), -1);
      obj[y.toString()] = ++count;
      return count;
    };

    y.domain([
      0,
      d3.max(data, function (d) {
        return Number(d.count);
      }),
    ]);

    let radius = Math.ceil(Math.min(x.bandwidth() / 2 - 5, height / 2));

    g.append("g")
      .attr("transform", "translate(0," + (data.length > 0 ? height : 0) + ")")
      .call(d3.axisBottom(x));

    if (data.length > 0) {
      g.append("g").call(d3.axisLeft(y).ticks(2));
      /*.append("text")
                  .attr("fill", "#000")
                  .attr("y", -margin.top)
                  .attr("x", 6)
                  .attr("dy", "0.71em")
                  .attr("text-anchor", "start")
                  .text(speciesName);*/
    } else {
      d3.select("#" + id).attr("height", 30);
    }

    /*     g.append("path")
      .datum(data)
      .attr("fill", "lime")
      .attr("stroke", "lime")
      .attr("stroke-width", 2.5)
      .attr(
        "d",
        d3
          .area()
          .x(function (d) {
            return x(d.year) + x.bandwidth() / 2;
          })
          .y0(y(0))
          .y1(function (d) {
            return y(d.count);
          })
      ); */

    /*  // Add the points
    g.append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(d.year) + x.bandwidth() / 2;
      })
      .attr("cy", function (d) {
        return y(d.count);
      })
      .attr("r", 1.5)
      .attr("fill", "lime")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave); */

    let sortedSources = Object.keys(groupedBySource).sort(
      (a, b) => groupedBySource[b].length - groupedBySource[a].length
    );

    let colorIndex = 0;

    let yearPlus = {};

    for (let source of sortedSources.values()) {

      let lineColor = dangerColorMap[sourceToDangerMap[source]] ? dangerColorMap[sourceToDangerMap[source]].bg : dangerColorMap["DD"].bg;

      let filteredData = {};

      for (let yearData of data.values()) {
        getOrCreate(filteredData, yearData.year.toString(), {
          trades: yearData.trades.filter((e) => e.Source === source),
          year: yearData.year,
          source: source,
        });
      }

      /* console.log("filtered", filteredData); */

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
            .x(function (d) {
              return x(d.year) + x.bandwidth() / 2;
            })
            .y0(function (d) {
              return y(getOrCreate(yearPlus, d.year.toString(), 0));
            })
            .y1(function (d) {
              let oldValue = getOrCreate(yearPlus, d.year.toString(), 0);
              let count = d.trades.length;
              yearPlus[d.year.toString()] = count + oldValue;
              let yValue = y(count + oldValue);
              d.yValue = yValue;
              return yValue;
            })
        )
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
    }

    // ############# CITES #############

    if (iucnData.length > 0) {
      let circleYearCountIUCN = {};

      let $iucnSvg = $visContent.append(
        '<svg id="' + id + 'CITES" width="960" height="' + 2 * radius + '">'
      );
      let maxCount = 0;

      svgCITES = d3.select("#" + id + "CITES");

      svgCITES.style("display", "block");

      g = svgCITES.append("g").attr("transform", "translate(" + margin.left + "," + 0 + ")");

      let rect = g
        .append("rect")
        .attr("width", width)
        .attr("height", (maxCount + 1) * 2 * radius + 1)
        .attr("fill", "none")
        .attr("stroke", "gray");
      //.style("fill", "url(#mainGradient)")
      /*.style("stroke", "black")*/
      //.style("fill", "url(#myGradient)");

      elem = g.selectAll("g myCircleText").data(listingData);

      elemEnter = elem
        .enter()
        .append("g")
        .attr("class", "noselect")
        .attr("transform", function (d) {
          let count = yearCount(d.year, circleYearCountIUCN);
          maxCount = Math.max(maxCount, count);
          rect.attr("height", (maxCount + 1) * 2 * radius + 1);
          svgCITES.attr("height", (maxCount + 1) * 2 * radius + 1);
          return "translate(" + x(Number(d.year)) + "," + (radius * 2 * count + 1) + ")";
        })
        .attr("x", function (d) {
          return x(Number(d.year));
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

      let text = g
        .append("text")
        .attr("transform", "translate(-5," + ((maxCount + 1) * 2 * radius + 1) / 2 + ")")
        .style("text-anchor", "end")
        .style("dominant-baseline", "central")
        .style("font-size", "9")
        .text("CITES");

      //let radius = (height - y(1)) / 2;
      elemEnter
        .append("rect")
        .attr("class", "pinarea")
        .attr("height", 2 * radius)
        /* .attr("width", function (d) {
          return width - x(Number(d.year));
        }) */
        .attr("width", function (d) {
          return width - x(Number(d.year));
        })
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
                  return iucnColors["CR"].bg;
                case "II":
                  return iucnColors["EN"].bg;
                case "III":
                  return iucnColors["NT"].bg;
                default:
                  break;
              }
              break;
          }
        })
        .style("stroke", "gray");

      elemEnter
        .append("text")
        .attr("class", "circleLabel noselect")
        .text(function (d) {
          return d.text;
        })
        .attr("x", function (d) {
          return x.bandwidth() / 2;
        })
        .attr("y", function (d) {
          return radius;
        })
        .style("font-size", radius)
        .attr("width", function (d) {
          return width - x(Number(d.year));
        }).style("fill", function (d) {
          switch (d.type) {
            case "listingHistory":
              switch (d.appendix) {
                case "I":
                  return iucnColors["CR"].fg;
                case "II":
                  return iucnColors["EN"].fg;
                case "III":
                  return iucnColors["NT"].fg;
                default:
                  break;
              }
              break;
          }
        })
        .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif"));
    }

    // ############# IUCN #############

    if (iucnData.length > 0) {
      let circleYearCountIUCN = {};

      let $iucnSvg = $visContent.append(
        '<svg id="' + id + 'IUCN" width="960" height="' + 2 * radius + '">'
      );
      let maxCount = 0;

      /*            $("#"+id+"IUCN").append("<defs>\
                                  <linearGradient id='myGradient' gradientTransform='rotate(90)'>\
                                    <stop offset='5%'  stop-color='gold' />\
                                    <stop offset='95%' stop-color='red' />\
                                  </linearGradient\
                                </defs>");*/

      svgIUCN = d3.select("#" + id + "IUCN");

      svgIUCN.style("display", "block");

      // Define the gradient
      var gradient = svgIUCN
        .append("svg:defs")
        .append("svg:linearGradient")
        .attr("gradientTransform", "rotate(90)")
        .attr("id", "gradient");

      // Define the gradient colors
      gradient
        .append("svg:stop")
        .attr("offset", "0%")
        .attr("stop-color", "white")
        .attr("stop-opacity", 1);

      gradient
        .append("svg:stop")
        .attr("offset", "5%")
        .attr("stop-color", "white")
        .attr("stop-opacity", 0.1);

      gradient
        .append("svg:stop")
        .attr("offset", "95%")
        .attr("stop-color", "gray")
        .attr("stop-opacity", 0.2);

      g = svgIUCN.append("g").attr("transform", "translate(" + margin.left + "," + 0 + ")");

      let rect = g
        .append("rect")
        .attr("width", width)
        .attr("height", (maxCount + 1) * 2 * radius + 1)
        .attr("fill", "none")
        .attr("stroke", "gray");
      //.style("fill", "url(#mainGradient)")
      /*.style("stroke", "black")*/
      //.style("fill", "url(#myGradient)");

      elem = g.selectAll("g myCircleText").data(iucnData);

      elemEnter = elem
        .enter()
        .append("g")
        .attr("class", "noselect")
        .attr("transform", function (d) {
          let count = yearCount(d.year, circleYearCountIUCN);
          maxCount = Math.max(maxCount, count);
          rect.attr("height", (maxCount + 1) * 2 * radius + 1);
          svgIUCN.attr("height", (maxCount + 1) * 2 * radius + 1);
          return "translate(" + x(Number(d.year)) + "," + (radius * 2 * count + 1) + ")";
        })
        .attr("x", function (d) {
          return x(Number(d.year));
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

      let text = g
        .append("text")
        .attr("transform", "translate(-5," + ((maxCount + 1) * 2 * radius + 1) / 2 + ")")
        .style("text-anchor", "end")
        .style("dominant-baseline", "central")
        .style("font-size", "9")
        .text("IUCN");

      //let radius = (height - y(1)) / 2;
      elemEnter
        .append("rect")
        .attr("class", "pinarea")
        .attr("height", 2 * radius)
        .attr("width", function (d) {
          return width - x(Number(d.year));
        })
        /*.attr("r", radius)*/
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
          return x.bandwidth() / 2;
        })
        .attr("y", function (d) {
          return radius;
        })
        .style("font-size", radius)
        .style("fill", getIucnColorForeground)
        .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif"));
    }

    // ############# THREATS #############
    if (threatData.length > 0) {
      let circleYearCountThreats = {};

      let $threatSvg = $visContent.append(
        '<svg id="' + id + 'Threat" width="960" height="' + (2 * radius + 1) + '">'
      );
      maxCount = 0;
      svgThreat = d3.select("#" + id + "Threat");

      svgThreat.style("display", "block");

      g = svgThreat.append("g").attr("transform", "translate(" + margin.left + "," + 0 + ")");

      rect = g
        .append("rect")
        .attr("width", width)
        .attr("height", (maxCount + 1) * 2 * radius + 1)
        .style("border", "1px solid black")
        .style("border-top", "none")
        /*.style("stroke", "lightblue")*/
        .style("fill", "none")
        .style("stroke", "gray");

      elem = g.selectAll("g myCircleText").data(threatData);

      elemEnter = elem
        .enter()
        .append("g")
        .attr("class", "noselect")
        .attr("transform", function (d) {
          let count = yearCount(d.year, circleYearCountThreats);
          maxCount = Math.max(maxCount, count);
          if (zoomLevel > 0) {
            rect.attr("height", (maxCount + 1) * 2 * radius + 1);
            svgThreat.attr("height", (maxCount + 1) * 2 * radius + 1);
            return "translate(" + x(Number(d.year)) + "," + radius * 2 * count + ")";
          }
          else {
            return "translate(" + (x(Number(d.year)) + (count - 1) * 3) + "," + 0 + ")";
          }
        })
        .attr("x", function (d) {
          return x(Number(d.year));
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

      let text = g
        .append("text")
        .attr("transform", "translate(-5," + (svgThreat.attr("height") / 2) + ")")
        .style("text-anchor", "end")
        .style("dominant-baseline", "central")
        .style("font-size", "9")
        .text("Threats");

      //let radius = (height - y(1)) / 2;
      elemEnter
        .filter((d) => d.scope === "Global")
        .append("rect")
        .attr("class", "pinare")
        .attr("height", 2 * radius)
        .attr("width", function (d) {
          return width - x(Number(d.year));
        })
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
        .attr("width", Math.sqrt(2 * (radius * radius)))
        .attr("height", Math.sqrt(2 * (radius * radius)))
        .attr("transform", "translate(" + x.bandwidth() / 2 + ",0) rotate(45)")
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
          return x.bandwidth() / 2;
        })
        .attr("y", function (d) {
          return radius;
        })
        .style("font-size", radius - 1)
        /* .style("fill", getIucnColorForeground) */
        .style("fill", (d) => {
          return dangerColorMap[d.danger].fg;
        })
        .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif"));
    }
  }
  setZoomLevel(0);
});
