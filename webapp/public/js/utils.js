colorBrewerScheme8Qualitative = ['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)'];
//colorBrewerScheme8Qualitative = ['rgb(228,26,28)','rgb(55,126,184)','rgb(77,175,74)','rgb(152,78,163)','rgb(255,127,0)','rgb(255,255,51)','rgb(166,86,40)','rgb(247,129,191)'];

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.replaceSpecialCharacters = function(search, replacement) {
    var target = this;
  	return target.replace(/[ &\/\\#,+()$~%.'":*?<>{}]/g,'_');
};

function is(obj) {
	return obj !== null && obj !== undefined;
}

function pushOrCreate(obj, key, value) {
	if(Object.keys(obj).includes(key)) {
		obj[key].push(value);
	}
	else {
		obj[key] = [value];
	}

	return obj;
}