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