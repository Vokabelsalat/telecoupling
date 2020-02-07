colorBrewerScheme8Qualitative = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00'];

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