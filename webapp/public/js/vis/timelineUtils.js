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
                            text: e.threatened ? threatenedToDangerMap[e.threatened.toLowerCase()] : null,
                            danger: e.threatened ? threatenedToDangerMap[e.threatened.toLowerCase()] : null,
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

function getTimelineTradeDataFromSpecies(speciesObject, sourceColorMap) {
    console.log(speciesObject);

    if (speciesObject.hasOwnProperty("trade")) {
        //subkeys
        let sciName =
            speciesObject.material[0].Genus.trim() + " " + speciesObject.material[0].Species.trim();

        let trades = [];

        let groupedByYear = {};
        let groupByExIm = {};
        let groupedBySource = {};
        for (let subkey of Object.keys(speciesObject["trade"]).values()) {
            let tradeArray = speciesObject["trade"][subkey];
            for (let trade of tradeArray.values()) {
                let year = trade.Year;
                trades.push(trade);
                pushOrCreate(groupedBySource, trade.Source, trade);
                getOrCreate(
                    sourceColorMap,
                    trade.Source,
                    colorBrewerScheme8Qualitative[Object.keys(sourceColorMap).length]
                );
                pushOrCreate(groupedByYear, year.toString(), trade);
                pushOrCreate(groupByExIm, trade.Exporter + "|" + trade.Importer, trade);
            }
        }

        /*   console.log(
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
               console.log(traderoutes);*/

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
                trades: groupedByYear.hasOwnProperty(year.toString()) ? groupedByYear[year.toString()] : [],
                type: "trade",
            });
        }
        return [returnData, groupedBySource];
    } else {
        return [[], []];
    }
}

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

let getIucnColor = function (d) {
    return iucnColors[d.text] ? iucnColors[d.text].bg : iucnColors["NE"].bg;
};

let getIucnColorForeground = function (d) {
    return iucnColors[d.text] ? iucnColors[d.text].fg : iucnColors["NE"].fg;
};

let threatenedToDangerMap = {
    "extinct": "EX",
    "threatened": "TH",
    "possibly threatened": "PT",
    "not threatened": "nT",
    "data deficient": "DD"

};

let sourceToDangerMap = {
    "I": "EX",
    "W": "TH",
    "A": "PT",
    "O": "PT",
    "D": "PT",
    "Y": "PT",
    "U": "DD"
};