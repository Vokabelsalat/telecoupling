String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
String.prototype.replaceSpecialCharacters = function (search, replacement) {
    var target = this;
    return target.replace(/[ &\/\\#,+()$~%.'":*?<>{}]/g, '_');
};

module.exports = {
    pushOrCreate: (obj, key, value) => {
        if (Object.keys(obj).includes(key)) {
            obj[key].push(value);
        } else {
            obj[key] = [value];
        }
        return obj;

    },
    getOrCreate: (obj, key, set) => {
        if (obj.hasOwnProperty(key)) {
            return obj[key];
        } else {
            obj[key] = set;
            return obj[key];
        }
    },
    threatenedToDangerMap: {
        "extinct": "EX",
        "threatened": "TH",
        "possibly threatened": "PT",
        "not threatened": "nT",
        "data deficient": "DD"

    },
    sourceToDangerMap: {
        "I": "EX",
        "W": "TH",
        "A": "PT",
        "O": "PT",
        "D": "PT",
        "Y": "PT",
        "U": "DD"
    },
    colorBrewerScheme8Qualitative: ['rgb(166,206,227)', 'rgb(31,120,180)', 'rgb(178,223,138)', 'rgb(51,160,44)', 'rgb(251,154,153)', 'rgb(227,26,28)', 'rgb(253,191,111)', 'rgb(255,127,0)'],
    //colorBrewerScheme8Qualitative: ['rgb(228,26,28)','rgb(55,126,184)','rgb(77,175,74)','rgb(152,78,163)','rgb(255,127,0)','rgb(255,255,51)','rgb(166,86,40)','rgb(247,129,191)'],
    colorBrewerScheme14Qualitative: ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)', 'rgb(179,222,105)', 'rgb(252,205,229)', 'rgb(217,217,217)', 'rgb(188,128,189)', 'rgb(204,235,197)', 'rgb(255,237,111)', 'rgb(150,150,150)', 'rgb(0,0,0)'],
    watermarkColorSheme: ["rgb(0, 119, 68)", "rgb(188, 174, 70)", "rgb(157, 196, 85)", "rgb(34, 106, 90)", "rgb(0, 103, 115)", "rgb(136, 180, 149)", "rgb(234, 157, 64)", "rgb(247, 208, 66)", "rgb(114, 191, 179)", "rgb(191, 157, 117)", "rgb(188, 213, 148)", "rgb(210, 37, 49)", "rgb(217, 117, 96)", "rgb(212, 29, 113"],
};