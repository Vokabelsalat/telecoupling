console.log("RUNNING");

function getTimelineTradeDataFromSpecies(speciesObject) {
    if (speciesObject.hasOwnProperty("trade")) {
        //subkeys
        let groupedByYear = {};
        for (let subkey of Object.keys(speciesObject["trade"]).values()) {
            let tradeArray = speciesObject["trade"][subkey];
            for (let trade of tradeArray.values()) {
                let year = trade.Year;
                pushOrCreate(groupedByYear, year.toString(), trade);
            }
        }

        let returnData = [];

        let years = Object.keys(groupedByYear).map(e => parseInt(e));
        let yearMin = Math.min(...years);
        let yearMax = Math.max(...years);

        for (let year = yearMin; year <= yearMax; year++) {
            returnData.push({ year, count: groupedByYear.hasOwnProperty(year.toString()) ? groupedByYear[year.toString()].length : 0, type: "trade" });
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

        let years = Object.keys(groupedByYear).map(e => parseInt(e));
        let yearMin = Math.min(...years);
        let yearMax = Math.max(...years);

        for (let year = yearMin; year <= yearMax; year++) {
            if (groupedByYear.hasOwnProperty(year.toString())) {
                let count = 0;
                returnData.push(...groupedByYear[year.toString()].map(
                    e => {
                        return { year: year, code: e.code, text: e.code, category: e.category, count: count++, type: "iucn" };
                    }
                ));
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

        let years = Object.keys(groupedByYear).map(e => parseInt(e));
        let yearMin = Math.min(...years);
        let yearMax = Math.max(...years);

        for (let year = yearMin; year <= yearMax; year++) {
            if (groupedByYear.hasOwnProperty(year.toString())) {
                let count = 0;
                returnData.push(...groupedByYear[year.toString()].map(
                    e => {
                        return { year: year, appendix: e["Appendix"], text: e["Appendix"], count: count++, type: "listingHistory" };
                    }
                ));
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
            if (year)
                pushOrCreate(groupedByYear, year.toString(), entry);
        }

        let returnData = [];

        let years = Object.keys(groupedByYear).map(e => parseInt(e));
        let yearMin = Math.min(...years);
        let yearMax = Math.max(...years);

        for (let year = yearMin; year <= yearMax; year++) {
            if (groupedByYear.hasOwnProperty(year.toString())) {
                let count = 0;
                returnData.push(...groupedByYear[year.toString()].map(
                    e => {
                        if (e.consAssCategory) {
                            if (e.consAssCategory.length > 2) {
                                let split = e.consAssCategory.split(" ");
                                e.consAssCategory = split.map(e => e.charAt()).join("");
                            }
                        }

                        return { year: year, scopo: e.bgciScope, count: count++, threatened: e.threatened, consAssCategory: e.consAssCategory, text: e.consAssCategory, type: "threat" };
                    }
                ));
            }
        }
        return returnData;
    } else {
        return [];
    }
}

//########### CREATING DATA ###########

let index = 0;
let colorString = colorBrewerScheme8Qualitative.map(e => '<div style="display:inline-block; width:20px; height:20px; background-color:' + e + '">' + (index++) + '</div>');

$.get("timelinedata.json", function(tradeData) {

    $(".page-wrapper").first().append("<div>").append(colorString.join(""));

    for (let speciesName of Object.keys(tradeData).values()) {
        let speciesObject = tradeData[speciesName];

        let id = "timeline" + speciesName.replaceSpecialCharacters();

        let $wrapper = $(".page-wrapper").first().append('<div id="timelineWrapper" class="visWrapper">');
        let $svg = $(".page-wrapper").first().append('<svg id="'+id+'" width="960" height="250">');

        console.log(speciesName, speciesObject);

        //########### BUILDING CHART ###########
        var svg = d3.select("#"+id);

        var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        };

        let width = +svg.attr("width") - margin.left - margin.right;
        let height = +svg.attr("height") - margin.top - margin.bottom;
        let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleBand()
            .rangeRound([0, width])
            .padding(0.1);

        var y = d3.scaleLinear()
            .rangeRound([height, 0]);


        let data = getTimelineTradeDataFromSpecies(speciesObject);
        let listingData = getTimelineListingDataFromSpecies(speciesObject);
        let iucnData = getTimelineIUCNDataFromSpecies(speciesObject);
        let threatData = getTimelineThreatsDataFromSpecies(speciesObject);
        console.log("timedata", listingData);
        console.log("iucndata", iucnData);
        console.log("threats", threatData);

        let allCircleData = [];
        allCircleData.push(...listingData);
        allCircleData.push(...iucnData);
        allCircleData.push(...threatData);

        var circleYearCount = {};

        let yearCount = (y) => {
            let count = getOrCreate(circleYearCount, y.toString(), -1);
            circleYearCount[y.toString()] = ++count;
            return count;
        };

        let domainYears = data
            .map(function(d) { return d.year; });

        /*domainYears.push(...listingData.map(d => d.year));
        domainYears.push(...iucnData.map(d => d.year));
        domainYears.push(...threatData.map(d => d.year));*/
        domainYears.push(...allCircleData.map(d => d.year));
        domainYears = domainYears.sort();

        console.log(domainYears);

        x.domain(domainYears);
        y.domain([0, d3.max(data, function(d) {
            return Number(d.count);
        })]);

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))

        g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text(speciesName);

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {
                return x(Number(d.year));
            })
            .attr("y", function(d) {
                return y(Number(d.count));
            })
            .attr("width", x.bandwidth())
            .attr("height", function(d) {
                return height - y(Number(d.count));
            });


        let elem = g.selectAll("g myCircleText")
            .data(allCircleData);


        let radius = Math.min(x.bandwidth() / 2 - 4, height/2);

        var elemEnter = elem.enter()
            .append("g")
            .attr("transform", function(d) { return "translate(" + x(Number(d.year)) + "," + (height - (radius * 2 * yearCount(d.year))) + ")" });

        //let radius = (height - y(1)) / 2;
        elemEnter.append("circle")
            .attr("class", "pinpoint")
            .attr("r", radius)
            .attr("cx", function(d) {
                return x.bandwidth() / 2;
            })
            .attr("cy", function(d) {
                return -radius;
            })
            .style("fill", function(d) {
                switch (d.type) {
                    case "listingHistory":
                        switch (d.appendix) {
                            case "I":
                                return colorBrewerScheme8Qualitative[5];
                            case "II":
                                return colorBrewerScheme8Qualitative[7];
                            case "III":
                                return colorBrewerScheme8Qualitative[3];
                            default:
                                break;
                        }
                        break;
                    case "iucn":
                        switch (d.code) {
                            case "LC":
                                return colorBrewerScheme8Qualitative[0];
                            case "NT":
                                return colorBrewerScheme8Qualitative[2];
                            case "VU":
                                return colorBrewerScheme8Qualitative[3];
                            case "EN":
                                return colorBrewerScheme8Qualitative[6];
                            case "CR":
                                return colorBrewerScheme8Qualitative[7];
                            case "EW":
                                return colorBrewerScheme8Qualitative[4];
                            case "EX":
                                return colorBrewerScheme8Qualitative[5];
                            default:
                                break;
                        }
                        break;
                    case "threat":
                        switch (d.consAssCategory) {
                            case "LC":
                                return colorBrewerScheme8Qualitative[0];
                            case "NT":
                                return colorBrewerScheme8Qualitative[2];
                            case "VU":
                                return colorBrewerScheme8Qualitative[3];
                            case "EN":
                                return colorBrewerScheme8Qualitative[6];
                            case "CR":
                                return colorBrewerScheme8Qualitative[7];
                            case "EW":
                                return colorBrewerScheme8Qualitative[4];
                            case "EX":
                                return colorBrewerScheme8Qualitative[5];
                            default:
                                break;
                        }
                        break;
                }
            });

        elemEnter.append("text")
            .attr("class", "circleLabel noselect")
            .text(function(d) { return d.text })
            .attr("x", function(d) {
                return x.bandwidth() / 2;
            })
            .attr("y", function(d) {
                return -radius;
            })
            .style("font-size", radius)
            .style("font-family", d => d.type === "listingHistory" ? "serif" : "sans-serif");

    }
});