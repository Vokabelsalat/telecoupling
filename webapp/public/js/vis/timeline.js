console.log("RUNNING");

function getRoutes(origTade, allTrades) {
  let routes = {};
  let origKey = Object.values(origTade).join("").replaceSpecialCharacters();
  for (let trade of allTrades) {
    if (origTrade.Importer === trade.Exporter) {
      if (origTade.Year === trade.Year) {
        console.log(origTrade, trade);
      }
    }
  }
}

function getTimelineTradeDataFromSpecies(speciesObject) {
  console.log(speciesObject);

  if (speciesObject.hasOwnProperty("trade")) {
    //subkeys
    let sciName =
      speciesObject.material[0].Genus.trim() + " " + speciesObject.material[0].Species.trim();

    let trades = [];
    let groupedBySource = {};

    let groupedByYear = {};
    let groupByExIm = {};
    for (let subkey of Object.keys(speciesObject["trade"]).values()) {
      let tradeArray = speciesObject["trade"][subkey];
      for (let trade of tradeArray.values()) {
        let year = trade.Year;
        trades.push(trade);
        pushOrCreate(groupedByYear, year.toString(), trade);
        pushOrCreate(groupedBySource, trade.Source, trade);
        pushOrCreate(groupByExIm, trade.Exporter + "|" + trade.Importer, trade);
      }
    }

    console.log(
      trades.filter((e) => e.Source === "W"),
      trades.length
    );

    console.log(groupedBySource);

    console.log(sciName);
    console.log(groupByExIm);

    let groupByMiddleMan = {};

    for (let exImKey of Object.keys(groupByExIm).values()) {
      for (let exImKeySecond of Object.keys(groupByExIm).values()) {
        if (exImKey !== exImKeySecond && exImKey.split("|")[1] === exImKeySecond.split("|")[0]) {
          pushOrCreate(
            groupByMiddleMan,
            exImKey.split("|")[1],
            exImKey + "|" + exImKeySecond.split("|")[1]
          );
        }
      }
    }

    console.log(groupByMiddleMan);

    let traderoutes = {};

    for (let middleman of Object.keys(groupByMiddleMan).values()) {
      let exImKeys = groupByMiddleMan[middleman];

      for (let exImKeyTriple of exImKeys.values()) {
        let split = exImKeyTriple.split("|");
        let tradeKeys = [];

        let first = split[0];
        let third = split[2];

        if (groupByExIm.hasOwnProperty(first + "|" + middleman)) {
          for (let tradeFirst of groupByExIm[first + "|" + middleman].values()) {
            let firstYear = tradeFirst.Year;

            if (groupByExIm.hasOwnProperty(middleman + "|" + third)) {
              let tradeSeconds = groupByExIm[middleman + "|" + third].filter(
                (e) => e.Year === firstYear || e.Year === firstYear + 1
              );
              if (tradeSeconds.length > 0) {
                let tradeKey = Object.values(tradeFirst).join("").replaceSpecialCharacters();
                if (!tradeKeys.includes(tradeKey)) {
                  pushOrCreate(traderoutes, exImKeyTriple, tradeFirst);
                  tradeKeys.push(tradeKey);
                }
              }

              for (let trade of tradeSeconds.values()) {
                let tradeKey = Object.values(trade).join("").replaceSpecialCharacters();
                if (!tradeKeys.includes(tradeKey)) {
                  pushOrCreate(traderoutes, exImKeyTriple, trade);
                  tradeKeys.push(tradeKey);
                }
              }
            }
          }
        }
      }
    }
    console.log(traderoutes);

    let returnData = [];

    let years = Object.keys(groupedByYear).map((e) => parseInt(e));
    let yearMin = Math.min(...years);
    let yearMax = Math.max(...years);

    for (let year = yearMin; year <= yearMax; year++) {
      returnData.push({
        year,
        count: groupedByYear.hasOwnProperty(year.toString())
          ? groupedByYear[year.toString()].length
          : 0,
        type: "trade",
      });
    }
    return returnData;
  } else {
    return [];
  }
}

function getTimelineIUCNDataFromSpecies(speciesObject) {
  if (speciesObject.hasOwnProperty("iucn")) {
    //subkeys
    let groupedByYear = {};
    for (let subkey of Object.keys(speciesObject["iucn"]).values()) {
      let tradeArray = speciesObject["iucn"][subkey];
      for (let iucn of tradeArray.values()) {
        let year = iucn.year;
        pushOrCreate(groupedByYear, year.toString(), iucn);
      }
    }

    let returnData = [];

    let years = Object.keys(groupedByYear).map((e) => parseInt(e));
    let yearMin = Math.min(...years);
    let yearMax = Math.max(...years);

    let getPositionOfIUCN = (e) => {
      let index = Object.keys(iucnColors).indexOf(e.code);
      if (index < 0) {
        return 99;
      }

      return index;
    };

    for (let year = yearMin; year <= yearMax; year++) {
      if (groupedByYear.hasOwnProperty(year.toString())) {
        let count = 0;
        let addData = groupedByYear[year.toString()].map((e) => {
          for (let cat of Object.keys(iucnColors)) {
            if (e.code.toLowerCase().includes(cat.toLowerCase())) {
              e.code = cat;
            }
          }

          if (e.code === "NT" && e.category.toLowerCase().includes("not")) {
            e.code = "nT";
          }

          return {
            year: year,
            code: e.code,
            text: e.code,
            category: e.category,
            count: count++,
            type: "iucn",
          };
        });

        for (let entry of addData
          .sort((a, b) => {
            return getPositionOfIUCN(a) - getPositionOfIUCN(b);
          })
          .values()) {
          returnData.push(entry);
          break;
        }
      }
    }
    return returnData;
  } else {
    return [];
  }
}

function getTimelineListingDataFromSpecies(speciesObject) {
  if (speciesObject.hasOwnProperty("listingHistory")) {
    var parseTime = d3.timeParse("%d/%m/%Y");
    let groupedByYear = {};
    for (let entry of speciesObject["listingHistory"].values()) {
      let dateString = entry.EffectiveAt;
      let date = parseTime(dateString);
      let year = date.getFullYear();
      pushOrCreate(groupedByYear, year.toString(), entry);
    }

    let returnData = [];

    let years = Object.keys(groupedByYear).map((e) => parseInt(e));
    let yearMin = Math.min(...years);
    let yearMax = Math.max(...years);

    for (let year = yearMin; year <= yearMax; year++) {
      if (groupedByYear.hasOwnProperty(year.toString())) {
        let count = 0;
        returnData.push(
          ...groupedByYear[year.toString()].map((e) => {
            return {
              year: year,
              appendix: e["Appendix"],
              text: e["Appendix"],
              count: count++,
              type: "listingHistory",
            };
          })
        );
      }
    }
    return returnData;
  } else {
    return [];
  }
}

function getTimelineThreatsDataFromSpecies(speciesObject) {
  if (speciesObject.hasOwnProperty("threats")) {
    let groupedByYear = {};
    for (let entry of speciesObject["threats"].values()) {
      let year = entry.assessmentYear;
      if (year) pushOrCreate(groupedByYear, year.toString(), entry);
    }

    let returnData = [];

    let years = Object.keys(groupedByYear).map((e) => parseInt(e));
    let yearMin = Math.min(...years);
    let yearMax = Math.max(...years);

    for (let year = yearMin; year <= yearMax; year++) {
      if (groupedByYear.hasOwnProperty(year.toString())) {
        let count = 0;
        returnData.push(
          ...groupedByYear[year.toString()].map((e) => {
            if (e.consAssCategory) {
              e.consAssCategoryOrig = e.consAssCategory;
              if (e.consAssCategory.length > 2) {
                let split = e.consAssCategory.split(" ");
                e.consAssCategory = split.map((e) => e.charAt()).join("");

                for (let cat of Object.keys(iucnColors)) {
                  if (e.consAssCategory.toLowerCase().includes(cat)) {
                    e.consAssCategory = cat;
                  }
                }
              }

              if (
                e.consAssCategory === "NT" &&
                e.consAssCategoryOrig.toLowerCase().includes("not")
              ) {
                e.consAssCategory = "nT";
              }
            }
            return {
              year: year,
              scope: e.bgciScope,
              count: count++,
              threatened: e.threatened,
              consAssCategory: e.consAssCategory,
              text: e.consAssCategory,
              consAssCategoryOrig: e.consAssCategoryOrig,
              type: "threat",
              reference: e.reference,
              countries: e.countries,
            };
          })
        );
      }
    }
    return returnData.filter((e) => !e.reference.includes("IUCN"));
  } else {
    return [];
  }
}

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

let getIucnColor = function (d) {
  return iucnColors[d.text] ? iucnColors[d.text].bg : iucnColors["NE"].bg;
};

let getIucnColorForeground = function (d) {
  return iucnColors[d.text] ? iucnColors[d.text].fg : iucnColors["NE"].fg;
};

let collapsed = false;
let collapseTimelines = () => {
  collapsed = !collapsed;

  if (collapsed) {
    /* $(".visWrapper").css("display", "table-row");*/
    $(".visHeader").css("border-top", "1px solid black");
    $(".visContent").css("border-top", "1px solid black");
    $(".visHeader").css("border-bottom", "1px solid black");
    $(".visContent").css("border-bottom", "1px solid black");
    $(".citesTimeline").hide();
    $(".visContent").css("display", "table-cell");
    $(".visHeader").css("display", "table-cell");
    $(".visHeader").css("vertical-align", "middle");
    $(".visHeader").css("width", "150px");
    $(".timelineHeader").css("margin-top", "0");
    $("#overAllSvg").css("margin-left", "150px");
    $("#overAllSvg").css("display", "block");
    $("#overAllSvg").show();
  } else {
    $(".visContent").css("display", "block");
    $(".visHeader").css("display", "block");
    $(".timelineHeader").css("margin-top", "default");
    $(".citesTimeline").show();
    $("#overAllSvg").hide();
  }
};

$.get("timelinedata.json", function (tradeData) {
  $("#page-wrapper").append("<div>").append(colorString.join(""));
  $("#page-wrapper")
    .append("<div>")
    .append('<button onclick="collapseTimelines()">Collapse!</button>');

  //########### CREATING DATA ###########
  let minYear = 9999;
  let maxYear = -9999;

  for (let speciesName of Object.keys(tradeData).values()) {
    let speciesObject = tradeData[speciesName];

    let data = getTimelineTradeDataFromSpecies(speciesObject);
    let listingData = getTimelineListingDataFromSpecies(speciesObject);
    let iucnData = getTimelineIUCNDataFromSpecies(speciesObject);
    let threatData = getTimelineThreatsDataFromSpecies(speciesObject);

    tradeData[speciesName].timeTrade = data;
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
  var mousemove = function (d) {
    var parentOffset = $(this).closest("svg").offset();

    let htmlText = "";
    let leftAdd = 0;
    let topAdd = 0;

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

    Tooltip.html(htmlText)
      .style("left", leftAdd + d3.mouse(this)[0] + 85 + "px")
      .style("top", parentOffset.top + d3.mouse(this)[1] + 10 + topAdd + "px");
  };
  var mouseleave = function (d) {
    Tooltip.style("opacity", 0);
  };

  let initWidth = 960;
  let initHeight = 70;

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
        '" class="citesTimeline" width="' +
        initWidth +
        '" height="' +
        initHeight +
        '">'
    );

    let data = speciesObject.timeTrade;
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

    let elem = g.selectAll("g myCircleText").data(listingData);

    let radius = Math.ceil(Math.min(x.bandwidth() / 2 - 5, height / 2));

    var elemEnter = elem
      .enter()
      .append("g")
      .attr("transform", function (d) {
        return (
          "translate(" +
          x(Number(d.year)) +
          "," +
          0 /*(height - (radius * 2 * yearCount(d.year, circleYearCount)))*/ +
          ")"
        );
      });

    //let radius = (height - y(1)) / 2;
    elemEnter
      .append("rect")
      .attr("class", "pinarea")
      .attr("height", height)
      .attr("width", function (d) {
        return width - x(Number(d.year));
      })
      /*.attr("r", radius)
            .attr("cx", function(d) {
                return x.bandwidth() / 2;
            })
            .attr("cy", function(d) {
                return -radius;
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
      .style("font-size", radius + 2)
      .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif"));

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

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 2.5)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d.year) + x.bandwidth() / 2;
          })
          .y(function (d) {
            return y(d.count);
          })
      );

    // Add the points
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
      .attr("fill", "#69b3a2")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

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

      // Define the gradient
      var gradient = svgThreat
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
        .attr("offset", "25%")
        .attr("stop-color", "white")
        .attr("stop-opacity", 0.1);

      gradient
        .append("svg:stop")
        .attr("offset", "95%")
        .attr("stop-color", "gray")
        .attr("stop-opacity", 0.2);

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
          rect.attr("height", (maxCount + 1) * 2 * radius + 1);
          svgThreat.attr("height", (maxCount + 1) * 2 * radius + 1);
          return "translate(" + x(Number(d.year)) + "," + radius * 2 * count + ")";
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
        .style("fill", getIucnColor)
        .style("stroke", "gray");

      elemEnter
        .filter((d) => d.scope !== "Global")
        .append("rect")
        .attr("class", "pinpoint")
        .attr("width", Math.sqrt(2 * (radius * radius)))
        .attr("height", Math.sqrt(2 * (radius * radius)))
        .attr("transform", "translate(" + x.bandwidth() / 2 + ",0) rotate(45)")
        .style("fill", getIucnColor)
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
        .style("fill", getIucnColorForeground)
        .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif"));
    }
  }
});
