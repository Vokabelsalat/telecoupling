
let iucnColors = {
    "EX": { bg: "rgb(0,0,0)", fg: "rgb(255,255,255)" },
    "EW": { bg: "rgb(84,35,68)", fg: "rgb(255,255,255)" },
    "RE": { bg: "rgb(155,79,150)", fg: "rgb(255,255,255)" },
    "CR": { bg: "rgb(216,29,4)", fg: "rgb(255,255,255)" },
    "EN": { bg: "rgb(252,127,63)", fg: "rgb(255,255,255)" },
    "VU": { bg: "rgb(249,232,18)", fg: "rgb(0,0,0)" },
    "NT": { bg: "rgb(204,226,37)", fg: "rgb(0,0,0)" },
    "LC": { bg: "rgb(97,198,89)", fg: "rgb(0,0,0)" },
    "DD": { bg: "rgb(209,209,198)", fg: "rgb(0,0,0)" },
    "NA": { bg: "rgb(193,181,165)", fg: "rgb(0,0,0)" },
    "NE": { bg: "rgb(255,255,255)", fg: "rgb(0,0,0)" }
};

function getIucnColor(d) {
    return iucnColors[d.text] ? iucnColors[d.text].bg : iucnColors["NE"].bg;
};

function getIucnColorForeground(d) {
    return iucnColors[d.text] ? iucnColors[d.text].fg : iucnColors["NE"].fg;
};

module.exports.iucnCategoriesSorted = ["EX", "EW", "RE", "CR", "EN", "A", "E", "VU", "V", "NT", "LC", "nT", "DD", "NA", "NE"];
//module.exports.iucnCategoriesSorted = ["EX", "EW", "RE", "CR", "EN", "VU", "V", "NT", "LC", "nT", "DD", "NA", "NE"];
module.exports.citesAppendixSorted = ["I", "II", "III"];
module.exports.iucnColors = iucnColors;
module.exports.getIucnColor = getIucnColor;
module.exports.getIucnColorForeground = getIucnColorForeground;