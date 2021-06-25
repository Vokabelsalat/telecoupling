import * as d3 from "d3";
import { polarToCartesian, describeArc, getStartAndEnd, getAngle } from '../utils/orchestraUtils'
import { getRandomInt, getGroupFileAndRotationFromID } from '../utils/utils'

class D3Orchestra {
    constructor(param) {
        this.id = param.id;
        this.instrumentGroup = param.instrumentGroup;
        this.instrument = param.instrument;
        this.mainPart = param.mainPart;
        this.setInstrumentAndMainPart = param.setInstrumentAndMainPart;
        this.setInstrument = param.setInstrument;
        this.setInstrumentGroup = param.setInstrumentGroup;

        this.initWidth = window.innerWidth / 2;
        this.initHeight = window.innerHeight / 2;

        this.positionX = this.initWidth / 2;
        this.positionY = this.initHeight / 2 + 100;

        this.padding = 20;

        this.animationTime = 600;

        this.margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 40,
        };

        d3.selection.prototype.moveToFront = function () {
            this.each(function () {
                this.parentNode.appendChild(this);
            });
        };

        this.paint();
    }

    clickMainArc(id, group, dst) {
        let path = group.select("#" + id + "path");
        let icon = group.select(".icon");

        d3.select("#backButton").style("display", "block");

        /* bindMouseOver(d3.selectAll('g.arcgroup:not(.subarc)'), mouseover); */

        /* clickedgroup.on("mouseover", null); */

        dst.selectAll(".subarc").style("display", "none").transition().duration(this.animationTime / 5).style("opacity", 0.0);
        dst.selectAll(".text").style("opacity", 1.0); //.transition().duration(animationTime/2)
        dst.selectAll(".icon").style("opacity", 1.0);

        icon.style("opacity", "0.0");
        d3.select("#" + id + "text").style("display", "initial").style("opacity", 0.0);
        group.selectAll(".subarc").style("display", "initial").transition().duration(this.animationTime / 5).style("opacity", 1.0);

        setTimeout(() => this.zoomAndRotate(path), this.animationTime / 1.5);

        this.setInstrumentGroup(id);
    }

    describeArc(x, y, radius, startAngle, endAngle, direction = 0, withoutM = false) {

        var start = polarToCartesian(x, y, radius, endAngle);
        var end = polarToCartesian(x, y, radius, startAngle);

        if (direction === 0) {
            let tmp = start;
            start = end;
            end = tmp;
        }

        var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        let d;

        if (withoutM) {
            d = [
                "L", start.x, start.y,
                "A", radius, radius, 0, largeArcFlag, direction, end.x, end.y
            ].join(" ");
        }
        else {
            d = [
                "M", start.x, start.y,
                "A", radius, radius, 0, largeArcFlag, direction, end.x, end.y
            ].join(" ");
        }


        return d;
    }

    describeLine(x, y, endX, endY, withoutM) {
        if (withoutM)
            return ["L", endX, endY].join(" ");
        else
            return ["M", x, y, "L", endX, endY].join(" ");
    }

    appendSelectArc(dst, id, text, color, strokewidth, x, y, width, start, end, direction, fontSize, classStr = "") {
        let group = dst.append("g")
            .style("cursor", "pointer")
            .attr("id", id + "arcgroup")
            .attr("name", text === "" ? "General" : text)
            .attr("class", "arcgroup");

        let upper = describeArc(x, y, width + strokewidth / 2, start, end, direction);
        let lower = describeArc(x, y, width - strokewidth / 2, start, end, 0, true);

        let pathstr = [
            upper,
            lower,
            "Z"
        ].join(" ");

        let path = group.append("path")
            .style("fill", color)
            .style("stroke", "rgb(95, 77, 73)")
            .attr("origStroke", "rgb(95, 77, 73)")
            .style("stroke-width", "0.5")
            .attr("origStrokeWidth", "0.5")
            .attr("id", id + "path")
            .attr("class", "arc")
            .attr("start", start)
            .attr("end", end)
            .attr("radius", width)
            .attr("name", text)
            .attr("arcwidth", strokewidth)
            .attr("d", pathstr);

        path.classed(classStr, true);

        let groupAndFile;
        if (!classStr.includes("subarc")) {
            groupAndFile = getGroupFileAndRotationFromID(id);
            let instrumentGroup = groupAndFile.group;

            width = width + 10;

            fetch("http://localhost:9000/api/getInstrumentsFromGroup/" + instrumentGroup)
                .then(res => res.json())
                .then(data => {

                    let lowerAmount = false;
                    let newstroke;
                    if (data.length <= 4) {
                        lowerAmount = true;
                        newstroke = strokewidth / (data.length + 1);
                    }
                    else {
                        newstroke = strokewidth / (data.length + 2);
                    }

                    data = data.map(e => e.Instruments).sort((a, b) => {
                        return b.length - a.length;
                    });

                    let startRadius = width - 10 + strokewidth / 2 - newstroke / 2;

                    let newId = (text + instrumentGroup).replaceSpecialCharacters();
                    this.appendSelectArc(group,
                        newId,
                        text,
                        color,
                        (lowerAmount ? newstroke : newstroke * 2),
                        this.positionX,
                        this.positionY,
                        (lowerAmount ? startRadius : startRadius - (newstroke / 2)),
                        start,
                        end, 1, 10, "subarc heading");
                    d3.select("#" + newId + "text").style("text-decoration", "underline");

                    /*                    d3.select("#"+newId).transition().duration(animationTime * 1.5).style("opacity", 1.0);
                                    d3.select("#"+newId+"textPath").transition().duration(animationTime * 1.5).style("opacity", 1.0).style("text-decoration", "underline");
                    */
                    if (data.length === 0) {
                        group.on("click", null);
                    }


                    if (lowerAmount) {
                        startRadius += newstroke;
                    }

                    for (let i = 0; i < data.length; i++) {
                        let name = data[i];
                        if (name.trim() === "") {
                            name = "General";
                        }

                        newId = (name + instrumentGroup).replaceSpecialCharacters();
                        this.appendSelectArc(group, newId, name, "hsl(0, 100%, " + (50 + i * (45 / data.length)) + "%)", newstroke, this.positionX, this.positionY, startRadius - (newstroke) * (i + 2), start, end, 1,
                            Math.min(newstroke - 1, 7), "subarc");

                        /* d3.select("#"+newId).transition().duration(animationTime * 1.5).style("opacity", 1.0);
                         d3.select("#"+newId+"textPath").transition().duration(animationTime * 1.5).style("opacity", 1.0);*/
                    }
                });
        }


        dst.append("path")
            .style("fill", "none")
            .style("stroke", "none")
            .attr("id", id + "pathfortext")
            .attr("class", "arcTextPath")
            .attr("start", start)
            .attr("end", end)
            .attr("radius", width)
            .attr("name", text)
            .attr("d", describeArc(x, y, width, start, end, direction));

        let textElement = group
            .append("text")
            .attr("id", id + "text")
            .attr("class", classStr ? classStr + " text" : "text");

        textElement.append("textPath")
            .style("dominant-baseline", "central")
            .attr("class", "textonpath noselect")
            .attr("xlink:href", "#" + id + "pathfortext")
            .attr("font-size", fontSize)
            .attr("text-anchor", "middle")
            .attr("startOffset", "50%")
            .attr("id", id + "textPath")
            .text(text);

        textElement.classed(classStr, true);

        if (classStr.includes("subarc")) {
            textElement.style("opacity", "0.0").style("display", "none");
            path.style("opacity", "0.0").style("stroke", "none").attr("origStroke", "none").style("display", "none");
            group.classed("subarc", true);

            /* bindMouseOver(group, mouseover); */
            /* .on("mouseout", mouseout) */

            let thisWidth = this.width;
            let thisPadding = this.padding;
            let setInstrumentAndMainPart = this.setInstrumentAndMainPart;
            let setInstrument = this.setInstrument;
            let setInstrumentGroup = this.setInstrumentGroup;

            group.on("click", function () {
                let value = d3.select(this).attr("name");

                //func1($("#instrumentsSelect"), d3.select(this).attr("name"));
                /* $("#instrumentsSelect").val(value).change(); */

                setInstrument(value.trim());
                d3.event.stopPropagation();

                if (value.trim() === "String instrument bow") {

                    fetch("http://localhost:3000/stringinstrumentbow.svg")
                        .then(response => response.text())
                        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
                        .then(data => {
                            let svg = d3.select("#selectmainpartSVG");

                            svg
                                .attr("width", this.width)
                                .attr("height", this.height)
                                .style("display", "block");

                            var svgNode = d3.select(data.documentElement).select("g");

                            svg.append(() => svgNode.node());

                            //scale it to the height of svg window
                            let bbox = svgNode.node().getBBox();

                            let largest = Math.max(bbox.width, bbox.height);
                            let smallest = Math.min(bbox.width, bbox.height);

                            let scale = (thisWidth - 2 * thisPadding) / largest;

                            svgNode.attr("transform", "translate(" + (thisPadding) + " " + thisPadding + ") rotate(90) scale(" + (scale) + ", " + (-scale) + ")");

                            svg
                                .attr("height", smallest * scale + thisPadding * 2)
                                .attr("width", largest * scale + thisPadding * 2);

                            svgNode.selectAll("path")
                                .style("cursor", "pointer")
                                .attr("origFill", function (d) {
                                    return d3.select(this).style("fill");
                                })
                                .on("click", function () {

                                    let sel = d3.select(this);

                                    svgNode.selectAll("path").style("opacity", 0.2).classed("selected", false).style("fill", function (d) {
                                        return d3.select(this).attr("origFill");
                                    });
                                    sel.style("opacity", 1.0).style("fill", "var(--highlight)").classed("selected", true);

                                    let text = d3.select(this).select("title").text();
                                    setInstrumentAndMainPart(value.trim(), text);
                                })
                                .on("mouseover", function () {
                                    let sel = d3.select(this);
                                    d3.select("#selectmainpartSVG").selectAll("path:not(.selected)").style("opacity", 0.2);
                                    sel.style("opacity", 1.0);
                                })
                                .on("mouseout", function () {
                                    d3.select(this);
                                    if (d3.selectAll("path.selected").size() === 0) {
                                        d3.select("#selectmainpartSVG").selectAll("path:not(.selected)").style("opacity", 1.0);
                                    }
                                    else {
                                        d3.select("#selectmainpartSVG").selectAll("path:not(.selected)").style("opacity", 0.2);
                                    }
                                });
                        });
                }
                else {
                    d3.select("#selectmainpartSVG").selectAll("*").remove();
                }

                d3.select("#selectmainpartSVG").node().scrollIntoView({ "behavior": "smooth" });
            });

        }
        else {
            dst.append("path")
                .style("fill", "none")
                .style("stroke", "none")
                .attr("id", id + "textpathIcon")
                .attr("d", describeArc(x, y, width - 25, start, end, direction));

            let textElementForIcon = group
                .append("text")
                .attr("id", id + "textIcon")
                .attr("class", classStr ? classStr + " text" : "text");

            let textPathForIcon = textElementForIcon.append("textPath")
                .style("dominant-baseline", "central")
                .style("opacity", "0.0")
                .style("fill-opacity", "0.0")
                .attr("class", "textonpath noselect")
                .attr("xlink:href", "#" + id + "textpathIcon")
                .attr("font-size", 1)
                .attr("text-anchor", "middle")
                .attr("startOffset", "50%")
                .attr("id", id + "textPathIcon")
                .text("m");

            /*.style("opacity", "0.0")
            .style("fill-opacity", "0.0")*/
            let filename = groupAndFile.filename;
            let rot = groupAndFile.rotation;

            if (filename !== "") {
                fetch("/" + filename)
                    .then(response => response.text())
                    .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
                    .then(data => {

                        let textBox = textPathForIcon.node().getBBox();
                        var svgNode = d3.select(data.documentElement).select("g");
                        group.append(() => svgNode.node());
                        let iconBox = svgNode.node().getBBox();

                        let scale = 20 / iconBox.height;

                        /* let transX = (textBox.x - ((iconBox.width * scale) / 2) + textBox.width / 2);
                        let transY = (textBox.y + textBox.height); */

                        let angle = (start + ((end - start) / 2) - 360) % 180;

                        if (rot != 0) {
                            angle += rot;
                        }

                        let cx = iconBox.x + (iconBox.width / 2);
                        let cy = iconBox.y + (iconBox.height / 2);

                        /* var saclestr = scale + ',' + scale; */
                        /* var tx = -cx * (scale - 1);
                        var ty = -cy * (scale - 1); */
                        /* var translatestr = tx + ',' + ty; */

                        svgNode.classed("icon", true);

                        svgNode.attr("transform", "translate(" + (textBox.x) + " " + (textBox.y) + ") rotate(" + angle + ") scale(" + scale + ") translate(" + (-cx) + " " + (-cy) + ")");
                    });
            }

            group.on("click", function () {
                this.clickMainArc(id, group, dst)
            }.bind(this));

            group.moveToFront();
        }

        if (classStr.includes("heading")) {
            group.on("mouseover", null);
            group.on("mouseout", null);
            group.on("click", null);
            group.style("cursor", "initial");
        }
    }

    clearAndReset() {
        d3.selectAll("#" + this.id + " > *").remove();

        this.width = this.initWidth - this.margin.left - this.margin.right;
        this.height = this.initHeight - this.margin.top - this.margin.bottom;

        let content = d3.select("#" + this.id);
        let svg = content.append("svg")
            .attr("id", "selectChartSVG")
            .attr("height", this.height)
            .attr("width", this.width)
            .style("transform", "translate(" + this.margin.left + "px , " + 0 + "px)")
            .style("border", "solid 1px gray")

        this.container = svg.append("g")
            .attr("id", "wrapper");

        this.container.append("g")
            .attr("id", "selectChart");

        d3.select("#selectmainpartWrapper").append("svg")
            .attr("id", "selectmainpartSVG")
            .style("display", "none");

        /* svg.append("rect").attr("width", 10).attr("height", 10).style("fill", "lime"); */
    }

    zoomAndRotate(path, center = false) {
        var bbox = path.node().getBBox();

        let startEnd = getStartAndEnd(path.attr("d"));

        let strokewidth = parseInt(path.attr("arcwidth"));

        /* let angle = 0.0, distance = 0, toBeScaled = 0; */
        let distance;
        let toBeScaled;
        if (startEnd && strokewidth) {
            //distance = getDistance(startEnd.start.x, startEnd.start.y, startEnd.end.x, startEnd.end.y); //+ strokewidth / 2;
            distance = bbox.height;
            toBeScaled = (this.height / 1.5) / distance;
            /* angle = getAngle(startEnd.start.x, startEnd.start.y, startEnd.end.x, startEnd.end.y); */
        }
        else {
            distance = bbox.height;
            toBeScaled = (this.height / 1.5) / distance;
        }

        var cx = bbox.x + (bbox.width / 2),
            cy = bbox.y + (bbox.height / 2);   // finding center of element

        /* let differenceToCenterX = this.positionX - cx;
        let differenceToCenterY = this.positionY - cy; */

        /*     d3.select("#selectchart").append("rect")
             .style("fill", "blue")
             .attr("width", 3)
             .attr("height", 3)
             .attr("x", cx-1)
             .attr("y", cy-1);*/

        /*        d3.select("#selectchart").append("rect")
                .style("fill", "red")
                .attr("width", 3)
                .attr("height", 3)
                .attr("x", svgWidth/2-1)
                .attr("y", svgHeight/2-1);*/

        /*        if(isSafari) {
                    container.transition().duration(animationTime).attr('transform', 'translate('+ (cx) + ' ' + (cy) +') scale('+ toBeScaled + ' ' + toBeScaled +') rotate('+angle+') translate('+ (-cx) + ' ' + (-cy) +')');
                }
                else {
                    container.style("transform-box", "fill-box").style("transform-origin", "center").transition().duration(animationTime).attr('transform', 'scale('+ toBeScaled + ' ' + toBeScaled +') rotate('+angle+') translate('+ (differenceToCenterX) + ' ' + (differenceToCenterY) +')');
                }*/

        /* let box = this.container.node().getBBox();
        let boxCenterX = box.x + (box.width / 2);
        let boxCenterY = box.y + (box.height);

        let rotateCenterX = this.positionX;
        let rotateCenterY = this.positionY; */

        /*         d3.select("#selectchart").append("rect")
                .style("fill", "red")
                .attr("width", 3)
                .attr("height", 3)
                .attr("x", rotateCenterX-1)
                .attr("y", rotateCenterY-1);
        
                 d3.select("#selectchart").append("rect")
                .style("fill", "purple")
                .attr("width", 3)
                .attr("height", 3)
                .attr("x", differenceToCenterX)
                .attr("y", differenceToCenterY);*/

        var saclestr = toBeScaled + ',' + toBeScaled;
        var tx = -cx * (toBeScaled - 1);
        var ty = -cy * (toBeScaled - 1);
        var translatestr = tx + ',' + ty;

        d3.select("#selectChart").transition().duration(this.animationTime).attr("transform", "\
            translate("+ translatestr + ") scale(" + saclestr + ") \
            ");

        //translate(" + differenceToCenterX + " " + differenceToCenterY + ") \
        //rotate("+angle+" "+cx+" "+cy+") \

        /*         d3.select("svg").append("rect")
                .style("fill", "lime")
                .attr("width", 3)
                .attr("height", 3)
                .attr("x", positionX-1)
                .attr("y", positionY-1);*/
    }

    reset() {
        let selectchart = d3.select("#selectChart");
        d3.select("#backButton").style("display", "none");

        /* bindMouseOver(d3.selectAll('g.arcgroup:not(.subarc)'), mouseover); */

        selectchart.selectAll(".subarc").style("display", "none").transition().duration(this.animationTime / 5).style("opacity", 0.0);
        selectchart.selectAll(".text").style("opacity", 1.0);
        selectchart.selectAll(".icon").style("opacity", 1.0);

        this.zoomAndRotate(selectchart, true);

        this.setInstrumentGroup(undefined);
        this.setInstrument(undefined);
        this.setInstrumentAndMainPart(undefined, undefined);
    }

    paint() {
        this.clearAndReset();

        let backButton = d3.select("#selectChartSVG")
            .append("g")
            .attr("id", "backButton")
            .attr("transform", "translate(" + this.padding + " " + 10 + ")")
            .style("cursor", "pointer")
            .style("display", "none")
            .on("mouseover", function (e) {
                d3.select(this).select("path").style("stroke", "rgb(95, 77, 73)").style("stroke-opacity", 0.70).style("stroke-width", 2).style("stroke-linejoin", "round").style("fill", "var(--highlight)");
            })
            .on("mouseout", function (e) {
                d3.select(this).select("path").style("stroke", "var(--black)").style("stroke-opacity", 1).style("stroke-width", 0.5).style("stroke-linejoin", "miter").style("fill", "var(--main)");
            })
            .on("click", this.reset.bind(this));

        let backPath = backButton.append("path")
            .attr("d", "m 5 0 l 40 0 l 0 25 l -40 0 l -15 -12.5 z")
            .style("fill", "var(--main)")
            .style("stroke", "black")
            .style("stroke-width", 0.5);

        let pathForText = backButton.append("path")
            .attr("d", "m 5 12.5 l 40 0")
            .attr("id", "backPathForText");

        let backText = backButton
            .append("text")
            .append("textPath")
            .attr("xlink:href", "#backPathForText")
            .style("line-height", "1em")
            .style("stroke", "var(--black)")
            .style("fill", "var(--black)")
            .style("dominant-baseline", "middle")
            .attr("class", "textonpath noselect")
            .text("Back");

        let selectchart = d3.select("#selectChart");
        this.appendSelectArc(selectchart, "Keyboard", "Keyboard", "hsl(0, 100%, " + (50 + 30) + "%)", 70, this.positionX, this.positionY, 140, 300 - 1, 270, 1, 12);
        this.appendSelectArc(selectchart, "Percussion", "Percussion", "hsl(0, 100%, " + (50 + 20) + "%)", 70, this.positionX, this.positionY, 140, 330 - 1, 300, 1, 12);
        this.appendSelectArc(selectchart, "Woodwinds", "Woodwinds", "hsl(0, 100%, " + (50 + 10) + "%)", 70, this.positionX, this.positionY, 140, 390, 330, 1, 12);
        this.appendSelectArc(selectchart, "Brasses", "Brasses", "hsl(0, 100%, " + (50 + 20) + "%)", 70, this.positionX, this.positionY, 140, 420, 390 + 1, 1, 12);
        this.appendSelectArc(selectchart, "Plucked", "Plucked", "hsl(0, 100%, " + (50 + 30) + "%)", 70, this.positionX, this.positionY, 140, 450, 420 + 1, 1, 12);
        this.appendSelectArc(selectchart, "Strings", "Strings", "hsl(0, 100%, " + (50 + 35) + "%)", 90, this.positionX, this.positionY, 60 - 1 * 2, 90, 270, 1, 12);

        if (this.instrumentGroup !== undefined) {
            // wat for finishing appending the elements
            setTimeout(() => { d3.select(`#${this.instrumentGroup}arcgroup`).dispatch('click') }, 500);

            if (this.instrument !== undefined) {
                setTimeout(() => { d3.select(`#${this.instrument.replaceSpecialCharacters()}${this.instrumentGroup}arcgroup`).dispatch('click') }, 1000);

                if (this.mainPart !== undefined) {
                    setTimeout(() => { d3.select(`#${this.mainPart}`).dispatch('click') }, 1400);
                }
            }
        }
        else {
            this.zoomAndRotate(selectchart, true);
        }
    }
}


const TimelineHelper = {
    draw: (input) => {
        new D3Orchestra(input);
    },
    reset: (id) => {
        d3.selectAll("#" + id + " > *").remove();
    }
}

export default TimelineHelper;