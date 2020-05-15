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