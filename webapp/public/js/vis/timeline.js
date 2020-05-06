class TimelineView {
  constructor(param) {

    this.tradeData = param;
    this.kind = "timelineview"
    this.sourceColorMap = {};

    this.zoomLevel = 0;
    this.maxZoomLevel = 1;

    this.collapsed = false;

    this.colorString = Object.keys(iucnColors).map(
      (e) =>
        '<div style="display:inline-block; width:30px; height:20px; background-color:' +
        iucnColors[e].bg +
        "; color: " +
        iucnColors[e].fg +
        '">' +
        e +
        "</div>"
    );
  }
  setZoomLevel(setValue) {
    zoomTimelines(setValue - this.zoomLevel);
  }

  zoomTimelines(add) {
    this.zoomLevel += add;
    this.zoomLevel = Math.max(0, this.zoomLevel);
    this.zoomLevel = Math.min(this.maxZoomLevel, this.zoomLevel);

    switch (this.zoomLevel) {
      case 0:
        collapseTimelines(true)
        break;
      case 1:
        collapseTimelines(false);
        break;
      case 2:
        break;
      default:
        break;
    }
  }

  collapseTimelines(setValue = null) {
    if (setValue !== null) {
      this.collapsed = setValue
    }
    else {
      this.collapsed = !this.collapsed;
    }

    if (this.collapsed) {
      /* $(".visWrapper").css("display", "table-row");*/
      $(".visHeader").css("border-top", "1px solid black");
      $(".visContent").css("border-top", "1px solid black");
      $(".visHeader").css("border-bottom", "1px solid black");
      $(".visContent").css("border-bottom", "1px solid black");
      $(".tradeTimeline").hide();
      $(".visContent").css("display", "table-cell");
      $(".visHeader").css("display", "table-cell");
      $(".visHeader").css("vertical-align", "middle");
      $(".visHeader").css("width", "150px");
      $(".timelineHeader").css("margin-top", "0");
      $("#overAllSvg").css("margin-left", "150px");
      $("#overAllSvg").css("display", "block");
      $("#overAllSvg").show();
    } else {
      $(".visHeader").css("border", "none");
      $(".visContent").css("border", "none");
      $(".visContent").css("display", "block");
      $(".visHeader").css("display", "block");
      $(".timelineHeader").css("margin-top", "10px");
      $(".timelineHeader").css("margin-top", "default");
      $(".tradeTimeline").show();
      $("#overAllSvg").hide();
    }
  }

  view() {
    return m("div", { id: "legends" }, [
      m("div", { id: "zoomLevel" }, (this.zoomLevel + 1) + "/" + (this.maxZoomLevel + 1)),
      m("div", { id: "colorLegend" }, Object.keys(iucnColors).map(
        e =>
          (
            <main>
              <h1>Hello world</h1>
            </main>
          )
        /*    '<div style="display:inline-block; width:30px; height:20px; background-color:' +
         iucnColors[e].bg +
         "; color: " +
         iucnColors[e].fg +
         '">' +
         e +
         "</div>" */
      ))
    ])
  }
  oncreate() {

  }
}

class Timeline {
  constructor(vnode) {
    this.kind = "timeline"
  }

  view() {
    return m("div", `Hello from a ${this.kind}`)
  }
  oncreate() {
    console.log(`A ${this.kind} was created`)
  }
}

class TimelineDatagenerator {
  constructor(input) {
    this.filename = input; //TODO rewrite as object input from index.ejs
    this.processData(this.filename);

    this.minYear = 9999;
    this.maxYear = -9999;
    this.domainYears = [];

    this.sourceColorMap = {};

    this.data = {};
  }

  getData() {
    return this.data;
  }

  processData(input) {
    $.get(input, function (tradeData) {
      /* $("body").append("<div id='legends'>");
      $("#legends").append("<div>").append(colorString.join("")); */

      //########### CREATING DATA ###########

      for (let speciesName of Object.keys(tradeData).values()) {
        let speciesObject = tradeData[speciesName];

        let [data, groupedBySource] = getTimelineTradeDataFromSpecies(speciesObject, this.sourceColorMap);
        let listingData = getTimelineListingDataFromSpecies(speciesObject);
        let iucnData = getTimelineIUCNDataFromSpecies(speciesObject);
        let threatData = getTimelineThreatsDataFromSpecies(speciesObject);

        tradeData[speciesName].timeTrade = [data, groupedBySource];
        tradeData[speciesName].timeListing = listingData;

        tradeData[speciesName].timeIUCN = iucnData;
        tradeData[speciesName].timeThreat = threatData;

        let allCircleData = [];
        allCircleData.push(...listingData);
        allCircleData.push(...iucnData);
        allCircleData.push(...threatData);

        let domainYears = data.map(function (d) {
          return d.year;
        });

        domainYears.push(...allCircleData.map((d) => d.year));

        this.domainYears = domainYears;

        let extent = d3.extent(domainYears);

        this.minYear = Math.min(this.minYear, extent[0]);
        this.maxYear = Math.max(this.maxYear, extent[1]);

        tradeData[speciesName].allCircleData = allCircleData;
        tradeData[speciesName].timeExtent = extent;

        this.data = tradeData;
        return this.data;
      }
    }.bind(this));
  }
};


let generator = new TimelineDatagenerator("timelinedata.json");
m.mount(document.body, new TimelineView(generator.getData()));

