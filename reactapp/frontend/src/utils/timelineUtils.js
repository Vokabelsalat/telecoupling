
/* let iucnColors = {
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
}; */

let iucnColors = {
    "EX": { bg: "rgb(216,29,4)", fg: "rgb(255,255,255)" },
    "EW": { bg: "rgb(216,29,4)", fg: "rgb(255,255,255)" },
    "RE": { bg: "rgb(216,29,4)", fg: "rgb(255,255,255)" },
    "CR": { bg: "rgb(252,127,63)", fg: "rgb(255,255,255)" },
    "EN": { bg: "rgb(252,127,63)", fg: "rgb(255,255,255)" },
    "VU": { bg: "rgb(252,127,63)", fg: "rgb(255,255,255)" },
    "NT": { bg: "rgb(249,232,18)", fg: "rgb(0,0,0)" },
    "LC": { bg: "rgb(97,198,89)", fg: "rgb(0,0,0)" },
    "DD": { bg: "rgb(209,209,198)", fg: "rgb(0,0,0)" },
    "NA": { bg: "rgb(193,181,165)", fg: "rgb(0,0,0)" },
    "NE": { bg: "rgb(255,255,255)", fg: "rgb(0,0,0)" }
};

function getIucnColor(d) {
    return iucnColors[d.text] ? iucnColors[d.text].bg : iucnColors["DD"].bg;
};

function getIucnColorForeground(d) {
    return iucnColors[d.text] ? iucnColors[d.text].fg : iucnColors["DD"].fg;
};

module.exports.iucnCategoriesSorted = ["EX", "EW", "RE", "CR", "EN", "A", "E", "VU", "V", "NT", "LC", "nT", "DD", "NA", "NE"];
//module.exports.iucnCategoriesSorted = ["EX", "EW", "RE", "CR", "EN", "VU", "V", "NT", "LC", "nT", "DD", "NA", "NE"];
module.exports.citesAppendixSorted = ["I", "II", "III"];
module.exports.citesScore = function (appendix) {
    switch (appendix) {
        case "I":
            return 1.0;
            break;
        case "II":
            return 2 / 3;
            break;
        case "III":
            return 1 / 3;
            break;
        default:
            return 0.0;
            break;
    }
};
module.exports.citesScoreReverse = function (value) {
    if (value > 2 / 3) {
        return "I";
    }
    else if (value > 1 / 3) {
        return "II";
    }
    else if (value > 0.0) {
        return "III";
    }
    else {
        return "DD";
    }
};
module.exports.iucnColors = iucnColors;
module.exports.getIucnColor = getIucnColor;
module.exports.getIucnColorForeground = getIucnColorForeground;
module.exports.iucnScore = function (category) {
    if (["EX", "EW", "RE"].includes(category)) {
        return 1.0;
    }
    else if ("CR" === category) {
        return 0.6;
    }
    else if ("EN" === category) {
        return 0.6;
    }
    else if ("VU" === category) {
        return 0.6;
    }
    else if ("NT" === category) {
        return 0.2;
    }
    else if ("LC" === category) {
        return 0.0;
    }
    else {
        return -1;
    }
};
module.exports.iucnScoreReverse = function (value) {
    if (value > 0.8) {
        return "EX";
    }
    else if (value > 0.6) {
        return "CR";
    }
    /* else if (value > 0.4) {
        return "EN";
    }
    else if (value > 0.2) {
        return "VU";
    } */
    else if (value > 0.0) {
        return "NT";
    }
    else if (value === 0.0) {
        return "LC";
    }
    else if (value < 0) {
        return "DD";
    }
    else {
        return "DD";
    }
};
module.exports.iucnCategories = {
    "EX": "Extinct",
    "EW": "Extinct in the Wild",
    "CR": "Critical Endangered",
    "EN": "Endangered",
    "VU": "Vulnerable",
    "NT": "Near Threatened",
    "LC": "Least Concern",
    "DD": "Data Deficient",
    "NE": "Not Evaluated"
};

module.exports.threatScore = function (danger) {
    switch (danger) {
        case "EX":
            return 1.0;
            break;
        case "TH":
            return 2 / 3;
            break;
        case "PT":
            return 1 / 3;
            break;
        case "nT":
            return 0.0;
            break;
        default:
            return -1;
            break;
    }
};
module.exports.threatScoreReverse = function (value) {
    if (value === 1.0) {
        return "EX";
    }
    else if (value > 2 / 3) {
        return "TH";
    }
    else if (value > 1 / 3) {
        return "PT";
    }
    else if (value > 0.0) {
        return "nT";
    }
    else {
        return "DD";
    }
};