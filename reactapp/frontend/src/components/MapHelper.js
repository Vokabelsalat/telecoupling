import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/leaflet.markercluster.js";
import "leaflet.pattern/dist/leaflet.pattern.js";
import * as groupedLayers from "leaflet-groupedlayercontrol";

import * as d3 from "d3";

import {
  pushOrCreate,
  serializeXmlNode,
  pushOrCreateWithoutDuplicates
} from "../utils/utils";
import { tooltipClasses } from "@mui/material";

var colorsys = require("colorsys");

var biomes = [
  "Tropical & Subtropical Moist Broadleaf Forests",
  "Tropical & Subtropical Dry Broadleaf Forests",
  "Tropical & Subtropical Coniferous Forests",
  "Temperate Broadleaf & Mixed Forests",
  "Temperate Conifer Forests",
  "Boreal Forests/Taiga",
  "Tropical & Subtropical Grasslands, Savannas & Shrublands",
  "Temperate Grasslands, Savannas & Shrublands",
  "Flooded Grasslands & Savannas",
  "Montane Grasslands & Shrublands",
  "Tundra",
  "Mediterranean Forests, Woodlands & Scrub",
  "Deserts & Xeric Shrublands",
  "Mangroves"
];

class MapHelper {
  constructor(
    id,
    getTreeThreatLevel,
    initWidth,
    setDiversityScale,
    treeThreatType,
    setFilter,
    colorBlind,
    setMapSearchBarData,
    lastSpeciesThreats
  ) {
    this.id = id;
    this.initWidth = initWidth;
    this.setDiversityScale = setDiversityScale;
    this.getTreeThreatLevel = getTreeThreatLevel;
    this.treeThreatType = treeThreatType;
    this.setFilter = setFilter;
    this.setMapSearchBarData = setMapSearchBarData;
    this.lastSpeciesThreats = lastSpeciesThreats;

    this.speciesCountries = null;
    this.highlightCountriesLayer = null;

    this.treeClusterCache = {};
    this.rmax = 25;
    this.colorBlind = colorBlind;

    this.countriesToID = {};

    this.activeLayer = "Countries";

    this.init();
  }

  init() {
    d3.select("#" + this.id).style("width", this.initWidth + "px");

    this.mymap = L.map(this.id, {
      worldCopyJump: false,
      minZoom: 0,
      maxZoom: 20,
      crs: L.CRS.EPSG4326
    }).setView([0, 0], 2);

    this.mymap.on("overlayadd", this.overlayadd.bind(this));

    var wmsLayer = L.tileLayer.wms("https://ahocevar.com/geoserver/wms", {
      layers: "ne:NE1_HR_LC_SR_W_DR"
    });

    this.control = L.control
      .groupedLayers(
        {},
        {
          "Tile Layers": {
            WMS: wmsLayer
          }
        },
        { collapsed: true }
      )
      .addTo(this.mymap);

    this.setUpCountries();
    this.setUpEcoRegions();
    this.setUpHexagons();
    this.setUpCapitals();
  }

  resetSelected(type) {
    switch (type) {
      case "countries":
        this.diversityCountries.eachLayer((layer) => {
          layer.feature.selected = false;
          layer.setStyle({
            weight: 1,
            color: "rgb(244,244,244)"
          });
        });
        this.mymap.closePopup();
        this.setFilter({ country: null });
        break;

      default:
        break;
    }
  }

  setSelected(type, feature, external = false) {
    switch (type) {
      case "countries":
        if (this.diversityCountries) {
          this.diversityCountries.eachLayer((layer) => {
            if (
              feature &&
              ((feature.properties.bgciName !== undefined &&
                feature.properties.bgciName ===
                  layer.feature.properties.bgciName) ||
                feature.properties.ROMNAM === layer.feature.properties.ROMNAM ||
                feature.properties.MAPLAB === layer.feature.properties.MAPLAB)
            ) {
              layer.feature.selected = true;
              layer.setStyle({
                weight: 2,
                color: "var(--highlightpurple)"
              });
              layer.bringToFront();
            } else {
              layer.feature.selected = false;
              layer.setStyle({
                weight: 1,
                color: "rgb(244,244,244)"
              });
            }
          });
        }
        if (!external) {
          this.setFilter({
            country: [
              {
                bgciName: feature.properties.bgciName,
                MAPLAB: feature.properties.MAPLAB,
                ROMNAM: feature.properties.ROMNAM
              }
            ].filter((e) => e !== undefined)
          });
        }
        break;
      default:
        break;
    }
  }

  setUpEcoRegions() {
    let tooltip = this.tooltip.bind(this);
    let tooltipMove = this.tooltipMove.bind(this);
    let boundHighlight = this.highlightPolygons.bind(this);

    let highlightStyle = function (layer, highlight) {
      return {
        color: highlight ? "var(--highlightpurple)" : "rgb(244,244,244)",
        weight: highlight ? 2 : 1
      };
    };

    fetch("/WWF_Terrestrial_Ecoregions2017-3.json")
      .then((res) => res.json())
      .then((data) => {
        function filterByEco(feature) {
          if (parseInt(feature.properties.BIOME) !== 98) return true;
        }

        let ecos = L.geoJson(data, {
          style: {
            opacity: 0.1,
            fillOpacity: 0.65,
            strokeWidth: "2px"
          },
          className: "ecoRegion",
          filter: filterByEco,
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              let biom = parseInt(feature.properties.BIOME) - 1;
              let popupText = feature.properties.ECO_NAME;

              if (biom < 14) {
                popupText += "<br>Biome: " + biomes[biom];
              }
              /* layer.bindPopup(popupText); */

              feature.options = { popupText: popupText, type: "ecoregion" };

              let color = "rgba(255,255,255,0.0)";

              if (biom === 98) {
                color = "rgb(255,255,255)";
              } else {
                //color = watermarkColorSheme[biom];
                color = "rgb(255,0,0)";
              }

              layer.setStyle({
                fillColor: color,
                color: color
              });
            }
          }
        })
          .on("mouseover", function (d) {
            tooltip(d, true);
            //boundHighlight(d.layer, true);
            d.layer.setStyle(highlightStyle(d.layer, true));
            d.layer.bringToFront();
          })
          .on("mouseout", function (d) {
            tooltip(d, false);
            //boundHighlight(d.layer, false);
            d.layer.setStyle(highlightStyle(d.layer, false));
          })
          .on("mousemove", function (d) {
            tooltipMove(d);
            //boundHighlight(d.layer, true);
            d.layer.setStyle(highlightStyle(d.layer, true));
            d.layer.bringToFront();
          });

        this.ecoRegions = ecos;

        this.control.addOverlay(
          this.ecoRegions,
          "Terrestrial Ecoregions",
          "Diversity"
        );

        //this.updateEcoRegions();
      });
  }

  tooltipMove(event) {
    let tooltip = d3.select(".tooltip");
    tooltip
      .style("left", event.originalEvent.pageX + 25 + "px")
      .style("top", event.originalEvent.pageY + 25 + "px");
  }

  getTooltip(layer) {
    let text = "";
    switch (layer.feature.options.type) {
      case "country":
        if (layer.feature.properties.hasOwnProperty("bgciName")) {
          text = "<b>" + layer.feature.properties.bgciName + "</b>";
        } else if (layer.feature.properties.hasOwnProperty("ROMNAM")) {
          text = "<b>" + layer.feature.properties.ROMNAM + "</b>";
        }

        if (layer.feature.options.hasOwnProperty("species")) {
          text += "<br>" + layer.feature.options.species.length + " Species";

          if (layer.feature.options.species.length < 8) {
            text += ": <br><i>";
            text += layer.feature.options.species.join("<br>");
          }
        }

        text += "<br><i>Click to filter!</i>";
        break;
      case "hexagon":
        if (layer.feature.options.hasOwnProperty("species")) {
          text = layer.feature.options.species.length + " Species";

          if (layer.feature.options.species.length < 8) {
            text += ": <br>";
            text += layer.feature.options.species.join("<br>");
          }
        }
        break;
      case "ecoregion":
        if (layer.feature.options.hasOwnProperty("popupText")) {
          text = "<b>" + layer.feature.options.popupText + "</b>";
        }

        if (layer.feature.options.hasOwnProperty("species")) {
          text += "<br>" + layer.feature.options.species.length + " Species";

          if (layer.feature.options.species.length < 8) {
            text += ": <br>";
            text += layer.feature.options.species.join("<br>");
          }
        }
        break;
      default:
        break;
    }

    return text;
  }

  tooltip(event, highlight) {
    let tooltip = d3.select(".tooltip");

    if (highlight) {
      tooltip
        .html(this.getTooltip(event.layer))
        .style("display", "block")
        .style("left", event.originalEvent.pageX + 25 + "px")
        .style("top", event.originalEvent.pageY + 25 + "px");
    } else {
      tooltip.style("display", "none");
    }
  }

  setUpCountries() {
    let boundHighlight = this.highlightPolygons.bind(this);
    let tooltip = this.tooltip.bind(this);
    let tooltipMove = this.tooltipMove.bind(this);
    let setSelected = this.setSelected.bind(this);
    let resetSelected = this.resetSelected.bind(this);

    fetch("/UN_Worldmap_FeaturesToJSON10percentCorrected.json")
      .then((res) => res.json())
      .then((data) => {
        let mapSearchBarData = [];
        let mapSearchBarDataKeys = [];
        this.diversityCountries = L.geoJson(data, {
          style: {
            fillOpacity: 0.65,
            strokeWidth: "2px"
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              let popupText =
                feature.properties.ROMNAM + "<br>" + feature.properties.MAPLAB;
              /* layer.bindPopup(popupText); */

              let color = "rgb(0,0,0)";

              layer.setStyle({
                fillColor: color,
                color: color
              });

              feature.options = { type: "country" };
              layer.options.polyID = feature.properties.ISO3CD;

              if (!mapSearchBarDataKeys.includes(feature.properties.ISO3CD)) {
                mapSearchBarData.push({
                  type: "country",
                  ROMNAM: feature.properties.ROMNAM,
                  MAPLAB: feature.properties.MAPLAB,
                  bgciName: feature.properties.bgciName,
                  polyID: feature.properties.ISO3CD
                });
                mapSearchBarDataKeys.push(feature.properties.ISO3CD);
              }
            }
          }
        })
          .on("mouseover", function (d) {
            tooltip(d, true);
            boundHighlight(d.layer, true);
          })
          .on("mouseout", function (d) {
            tooltip(d, false);
            boundHighlight(d.layer, false);
          })
          .on("mousemove", function (d) {
            tooltipMove(d);
            boundHighlight(d.layer, true);
          })
          .on("click", function (d) {
            if (d.layer.feature.selected) {
              resetSelected("countries");
            } else {
              setSelected("countries", d.layer.feature);
            }
          });

        this.setMapSearchBarData(mapSearchBarData);

        this.highlightCountriesLayer = L.geoJson(data, {
          style: {
            color: "rgb(244, 244, 244)",
            fillColor: "white",
            fillOpacity: 1.0,
            weight: 1
          }
        });

        for (let feature of data.features) {
          pushOrCreate(
            this.countriesToID,
            feature.properties.MAPLAB,
            feature.id
          );
          pushOrCreate(
            this.countriesToID,
            feature.properties.ROMNAM,
            feature.id
          );
          pushOrCreate(
            this.countriesToID,
            feature.properties.bgciName,
            feature.id
          );
        }

        this.highlightCountriesLayer.addTo(this.mymap);

        this.control.addOverlay(
          this.diversityCountries,
          "Countries",
          "Diversity"
        );
        this.diversityCountries.addTo(this.mymap);
        this.updateDiversity();
        this.updateThreatPiesCountries(true);
      });
  }

  setUpCapitals() {
    fetch("/POPP_capitals_FeaturesToJSON.json")
      .then((res) => res.json())
      .then((data) => {
        this.iso3ToCapital = {};
        for (let feat of data.features) {
          this.iso3ToCapital[feat.properties.ISO3CD] = feat;
        }

        let boundHighlight = this.highlightPolygons.bind(this);

        this.countryClusterLayer = L.markerClusterGroup({
          iconCreateFunction: this.defineClusterIconThreat.bind(this),
          chunkedLoading: true,
          tree: "CLUSTER",
          type: "Cluster",
          removeOutsideVisibleBounds: true,
          maxClusterRadius: this.rmax * 2,
          showCoverageOnHover: false
        })
          .on("mouseover", function (d) {
            boundHighlight(d.layer, true);
          })
          .on("mouseout", function (d) {
            boundHighlight(d.layer, false);
          })
          .on("clustermouseover", function (d) {
            boundHighlight(d.layer, true);
          })
          .on("clustermouseout", function (d) {
            boundHighlight(d.layer, false);
          });

        this.countryClusterLayer.addTo(this.mymap);
      });
  }

  defineClusterIconThreat(cluster) {
    var children = cluster.getAllChildMarkers();
    let treeThreatType = this.treeThreatType ? "economically" : "ecologically";
    let lastSpeciesThreats = this.lastSpeciesThreats;

    let data = [...new Set(children.map((e) => e.options.data).flat())].map(
      (e) => lastSpeciesThreats[e][treeThreatType]
    );
    let n = data.length; //Get number of markers in cluster
    data = d3
      .nest()
      .key(function (d) {
        return d.abbreviation;
      })
      .entries(data, d3.map);
    let strokeWidth = 1; //Set clusterpie stroke width
    let r = Math.min(
      this.rmax -
        2 * strokeWidth -
        (n < 10 ? 12 : n < 100 ? 8 : n < 1000 ? 4 : 0),
      this.rmax
    );
    let iconDim = (r + strokeWidth) * 2; //...and divIcon dimensions (leaflet really want to know the size)

    let colorBlind = this.colorBlind;
    let cacheKey =
      data.reduce((prev, curr) => prev + (curr.key + curr.values.length), "") +
      colorBlind;

    let html;
    if (Object.keys(this.treeClusterCache).includes(cacheKey)) {
      html = this.treeClusterCache[cacheKey];
    } else {
      //bake some svg markup
      html = this.bakeTheThreatPie({
        data: data,
        valueFunc: function (d) {
          return d.values.length;
        },
        outerRadius: r,
        innerRadius: r - 8,
        pieClass: "cluster-pie",
        pieLabelClass: "marker-cluster-pie-label",
        strokeColor: function (d) {
          return d.data.values[0].getColor(colorBlind);
        },
        color: function (d) {
          return d.data.values[0].getColor(colorBlind);
        }
      });

      this.treeClusterCache[cacheKey] = html;
    }
    //Create a new divIcon and assign the svg markup to the html property
    let myIcon = new L.DivIcon({
      html: html,
      className: "marker-cluster",
      iconSize: new L.Point(iconDim, iconDim),
      childrenIsoS: children.map((e) => e.options.iso3)
    });

    return myIcon;
  }

  bakeTheThreatPie(options) {
    let treeThreatType = this.treeThreatType ? "economically" : "ecologically";
    let lastSpeciesThreats = this.lastSpeciesThreats;

    if (!options.data || !options.valueFunc) {
      return "";
    }

    var data = options.data,
      valueFunc = options.valueFunc,
      r = options.outerRadius, //Default outer radius = 28px
      rInner = options.innerRadius ? options.innerRadius : r - 10, //Default inner radius = r-10
      strokeWidth = options.strokeWidth ? options.strokeWidth : 1, //Default stroke is 1
      pathClassFunc = options.pathClassFunc
        ? options.pathClassFunc
        : function () {
            return "";
          }, //Class for each path
      pathTitleFunc = options.pathTitleFunc
        ? options.pathTitleFunc
        : function () {
            return "";
          }, //Title for each path
      pieClass = options.pieClass ? options.pieClass : "marker-cluster-pie", //Class for the whole pie
      pieLabel = options.pieLabel ? options.pieLabel : d3.sum(data, valueFunc), //Label for the whole pie
      pieLabelClass = options.pieLabelClass
        ? options.pieLabelClass
        : "marker-cluster-pie-label", //Class for the pie label
      color = options.color,
      origo = r + strokeWidth, //Center coordinate
      w = origo * 2, //width and height of the svg element
      h = w,
      donut = d3.pie(),
      arc = d3.arc().innerRadius(rInner).outerRadius(r);

    let div = document.createElementNS("http://www.w3.org/1999/xhtml", "div");

    //Create an svg element
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    //Create the pie chart

    var vis = d3
      .select(svg)
      .data([data])
      .attr("class", pieClass)
      .attr("width", w + 2)
      .attr("height", h + 2)
      .style("position", "absolute");

    let donutData = donut.value(valueFunc).sort((a, b) => {
      return b.hasOwnProperty("values") && a.hasOwnProperty("values")
        ? b.values[0].numvalue - a.values[0].numvalue
        : lastSpeciesThreats[b][treeThreatType].numvalue -
            lastSpeciesThreats[a][treeThreatType].numvalue;
    });

    var arcs = vis
      .selectAll("g.arc")
      .data(donutData)
      .enter()
      .append("svg:g")
      //.attr('class', 'arc')
      .attr("class", function (d) {
        return "arc";
      })
      .attr("transform", "translate(" + origo + "," + origo + ")");

    arcs
      .append("svg:path")
      .attr("class", pathClassFunc)
      .attr("stroke-width", strokeWidth)
      .attr("fill", color)
      .attr("stroke", color)
      .attr("background", color)
      .attr("border-color", color)
      .attr("d", arc)
      .append("svg:title")
      .text(pathTitleFunc);

    var svg2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    //Create the pie chart
    var vis2 = d3
      .select(svg2)
      .attr("class", pieClass + " text")
      .attr("width", w + 2)
      .attr("height", h + 2)
      .style("position", "absolute");

    vis2
      .append("circle")
      .attr("cx", origo)
      .attr("cy", origo)
      .attr("r", rInner - 1)
      .attr("fill", "white")
      .style("fill-opacity", "50%");

    vis2
      .append("text")
      .attr("x", origo)
      .attr("y", origo)
      .attr("class", pieLabelClass + "text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .text(pieLabel);

    div.appendChild(svg);
    div.appendChild(svg2);

    //Return the svg-markup rather than the actual element
    return serializeXmlNode(div);
  }

  setUpHexagons() {
    fetch("/hexagon_2_Project.json")
      .then((res) => res.json())
      .then((data) => {
        this.hexagonData = data;

        this.hexagons = L.layerGroup([]);
        this.control.addOverlay(this.hexagons, "Hexagons", "Diversity");
        //this.updateHexagons();
      });
  }

  getScaledIndex(value, scale) {
    let index = 0;
    for (let e of scale) {
      if (value <= e.scaleValue) {
        return index;
      }
      index++;
    }
    return Math.min(scale.length - 1, index);
  }

  updateDiversity() {
    if (this.diversityCountries !== undefined) {
      let heatMapData = {};

      for (let speciesName of Object.keys(this.speciesCountries)) {
        /* if (
          this.filteredSpecies &&
          !this.filteredSpecies.includes(speciesName)
        ) {
          continue;
        } */

        let speciesCountries = this.speciesCountries[speciesName];

        for (let country of speciesCountries) {
          if (this.countriesToID.hasOwnProperty(country)) {
            let countryIDs = this.countriesToID[country];
            for (let countryID of countryIDs) {
              pushOrCreateWithoutDuplicates(
                heatMapData,
                countryID.toString(),
                speciesName
              );
            }
          }
        }
      }

      let heatMapLength = Object.keys(heatMapData).length;
      let heatMapMax = Math.max(
        ...Object.values(heatMapData).map((e) => e.length)
      );

      let scaleSteps = Math.min(15, heatMapMax);
      let scale = [];

      let treeThreatType = this.treeThreatType;

      for (let i = 0; i < scaleSteps + 1; i++) {
        let scaleValue = i * (heatMapMax / scaleSteps);
        let scaleOpacity = scaleValue / heatMapMax;

        let scaleColor = "";

        scaleColor = colorsys.hsvToHex(210, scaleOpacity * 100, 100);

        scale.push({ scaleColor, scaleValue: Math.ceil(scaleValue) });
      }

      this.diversityColorScale = scale;
      this.setDiversityScale(this.diversityColorScale, "countries");

      let getScaledIndex = this.getScaledIndex.bind(this);

      function calculateStlyle(feature) {
        if (heatMapData.hasOwnProperty(feature.id.toString())) {
          let a = heatMapData[feature.id.toString()];
          const aCount = Object.fromEntries(
            new Map(
              [...new Set(a)].map((x) => [x, a.filter((y) => y === x).length])
            )
          );
          let maxKey = Object.keys(aCount).reduce((a, b) =>
            aCount[a] > aCount[b] ? a : b
          );

          let val = a.length;
          let scaledIndex = getScaledIndex(val, scale);

          feature.options.species = a;

          return {
            color: feature.selected
              ? "var(--highlightpurple)"
              : "rgb(244,244,244)",
            weight: feature.selected ? 2 : 1,
            stroke: 1,
            opacity: 1,
            fillOpacity: 1,
            fillColor: scale[scaledIndex].scaleColor,
            fill: scale[scaledIndex].scaleColor
          };
        } else {
          return {
            color: "rgb(244, 244, 244)",
            stroke: 1,
            opacity: 1,
            weight: 1,
            fillOpacity: 1,
            fillColor: "white"
          };
        }
      }

      this.diversityCountries.eachLayer((layer) => {
        layer.setStyle(calculateStlyle(layer.feature));
      });
    }
  }

  updateThreatPiesCountries(first = false) {
    let treeThreatType = this.treeThreatType ? "economically" : "ecologically";
    let lastSpeciesThreats = this.lastSpeciesThreats;
    if (this.countryClusterLayer) this.countryClusterLayer.clearLayers();

    let heatMapData = {};

    for (let speciesName of Object.keys(this.speciesCountries)) {
      let speciesCountries = this.speciesCountries[speciesName];

      for (let country of speciesCountries) {
        if (this.countriesToID.hasOwnProperty(country)) {
          let countryIDs = this.countriesToID[country];
          for (let countryID of countryIDs) {
            pushOrCreateWithoutDuplicates(
              heatMapData,
              countryID.toString(),
              speciesName
            );
          }
        }
      }
    }

    let maxCount = Math.max(...Object.values(heatMapData).map((e) => e.length));
    let colorBlind = this.colorBlind;

    if (this.highlightCountriesLayer) {
      this.highlightCountriesLayer.eachLayer((layer) => {
        //calculate the clusterthreatpie
        if (heatMapData.hasOwnProperty(layer.feature.id.toString())) {
          let data = heatMapData[layer.feature.id.toString()];
          /* let data = [...new Set(heatMapData[layer.feature.id.toString])].map((e) =>
            this.getTreeThreatLevel(e, treeThreatType)
          ); */
          let n = data.length; //Get number of markers in cluster
          let strokeWidth = 1; //Set clusterpie stroke width
          let r = Math.min(
            this.rmax -
              2 * strokeWidth -
              (n < 10 ? 12 : n < 100 ? 8 : n < 1000 ? 4 : 0),
            this.rmax
          ); //Calculate clusterpie radius...
          let iconDim = (r + strokeWidth) * 2; //...and divIcon dimensions (leaflet really want to know the size)

          if (
            this.iso3ToCapital[layer.feature.properties.ISO3CD] !== undefined
          ) {
            let captialCoordinates =
              this.iso3ToCapital[layer.feature.properties.ISO3CD].geometry
                .coordinates;
            let newLayer = L.marker(
              [captialCoordinates[1], captialCoordinates[0]],
              {
                data: data,
                polyID: layer.feature.properties.ISO3CD,
                icon: new L.DivIcon({
                  html: this.bakeTheThreatPie({
                    data: data,
                    valueFunc: function (d) {
                      return data.length;
                    },
                    strokeWidth: 2,
                    outerRadius: r,
                    innerRadius: r - 8,
                    pieClass: "cluster-pie",
                    pieLabel: n,
                    pieLabelClass: "marker-cluster-pie-label",
                    strokeColor: function (d) {
                      return lastSpeciesThreats[d.data][
                        treeThreatType
                      ].getColor(colorBlind);
                    },
                    color: function (d) {
                      return lastSpeciesThreats[d.data][
                        treeThreatType
                      ].getColor(colorBlind);
                    }
                    /* pathClassFunc: function (d) { return "category-path category-" + d.data.key.replaceSpecialCharacters(); },
                                    pathTitleFunc: function (d) { return d.data.key + ' (' + d.data.values.length + ' accident' + (d.data.values.length != 1 ? 's' : '') + ')'; } */
                  }),
                  iconSize: new L.Point(iconDim, iconDim)
                })
              }
            );
            this.countryClusterLayer.addLayer(newLayer);
          } else {
            /* console.log(
              "ISO Code not in iso3toCapital",
              layer.feature.properties.ISO3CD
            ); */
          }
        }
      });
      if (first) {
        this.mymap.fitBounds(this.countryClusterLayer.getBounds(), {
          padding: [50, 50]
        });
      }
    }
  }

  updateEcoRegions() {
    if (this.speciesEcoRegions !== undefined && this.ecoRegions) {
      let heatMapData = {};

      for (let speciesName of Object.keys(this.speciesEcoRegions)) {
        let speciesEcoRegions = this.speciesEcoRegions[speciesName];

        for (let region of speciesEcoRegions) {
          pushOrCreate(heatMapData, region.toString(), speciesName);
        }
      }

      let heatMapLength = Object.keys(heatMapData).length;
      let heatMapMax = Math.max(
        ...Object.values(heatMapData).map((e) => e.length)
      );

      let scaleSteps = Math.min(10, heatMapMax);
      let scale = [];

      for (let i = 0; i < scaleSteps + 1; i++) {
        let scaleValue = i * (heatMapMax / scaleSteps);
        let scaleOpacity = scaleValue / heatMapMax;

        let scaleColor = "";

        scaleColor = colorsys.hsvToHex(210, scaleOpacity * 100, 100);

        scale.push({ scaleColor, scaleValue: Math.ceil(scaleValue) });
      }

      this.diversityColorScale = scale;
      this.setDiversityScale(this.diversityColorScale, "ecoregions");

      let getScaledIndex = this.getScaledIndex.bind(this);

      function calculateStlyle(feature) {
        if (heatMapData.hasOwnProperty(feature.properties.ECO_ID.toString())) {
          let a = heatMapData[feature.properties.ECO_ID.toString()];
          const aCount = Object.fromEntries(
            new Map(
              [...new Set(a)].map((x) => [x, a.filter((y) => y === x).length])
            )
          );
          let maxKey = Object.keys(aCount).reduce((a, b) =>
            aCount[a] > aCount[b] ? a : b
          );

          let val = heatMapData[feature.properties.ECO_ID.toString()].length;
          let scaledIndex = getScaledIndex(val, scale);

          feature.options.species = a;

          return {
            color: "white",
            stroke: 1,
            opacity: 1,
            weight: 1,
            fillOpacity: 1,
            fillColor: scale[scaledIndex].scaleColor,
            fill: scale[scaledIndex].scaleColor
          };
        } else {
          return {
            color: "rgb(244, 244, 244)",
            stroke: 1,
            opacity: 1,
            weight: 1,
            fillOpacity: 1,
            fillColor: "white"
          };
        }
      }

      this.ecoRegions.eachLayer((layer) => {
        layer.setStyle(calculateStlyle(layer.feature));
      });
    }
    this.updateThreatPiesEcoRegions();
  }

  updateThreatPiesEcoRegions() {
    let treeThreatType = this.treeThreatType ? "economically" : "ecologically";
    let lastSpeciesThreats = this.lastSpeciesThreats;
    if (this.countryClusterLayer) this.countryClusterLayer.clearLayers();

    if (this.speciesEcoRegions !== undefined && this.ecoRegions) {
      let heatMapData = {};

      for (let speciesName of Object.keys(this.speciesEcoRegions)) {
        let speciesEcoRegions = this.speciesEcoRegions[speciesName];

        for (let region of speciesEcoRegions) {
          pushOrCreateWithoutDuplicates(
            heatMapData,
            region.toString(),
            speciesName
          );
        }
      }

      let colorBlind = this.colorBlind;

      let maxCount = Math.max(
        ...Object.values(heatMapData).map((e) => e.length)
      );

      if (this.ecoRegions !== undefined) {
        this.ecoRegions.eachLayer((layer) => {
          //calculate the clusterthreatpie
          if (
            heatMapData.hasOwnProperty(
              layer.feature.properties.ECO_ID.toString()
            )
          ) {
            let data = heatMapData[layer.feature.properties.ECO_ID.toString()];
            /* let data = [...new Set(heatMapData[layer.feature.id.toString])].map((e) =>
            this.getTreeThreatLevel(e, treeThreatType)
          ); */
            let n = data.length; //Get number of markers in cluster
            let strokeWidth = 1; //Set clusterpie stroke width
            let r = Math.min(
              this.rmax -
                2 * strokeWidth -
                (n < 10 ? 12 : n < 100 ? 8 : n < 1000 ? 4 : 0),
              this.rmax
            ); //Calculate clusterpie radius...
            let iconDim = (r + strokeWidth) * 2; //...and divIcon dimensions (leaflet really want to know the size)

            let coordinates = layer.getBounds().getCenter();
            if (coordinates) {
              let newLayer = L.marker([coordinates.lat, coordinates.lng], {
                data: data,
                polyID: layer.feature.properties.ECO_ID,
                icon: new L.DivIcon({
                  html: this.bakeTheThreatPie({
                    data: data,
                    valueFunc: function (d) {
                      return data.length;
                    },
                    strokeWidth: 2,
                    outerRadius: r,
                    innerRadius: r - 8,
                    pieClass: "cluster-pie",
                    pieLabel: n,
                    pieLabelClass: "marker-cluster-pie-label",
                    strokeColor: function (d) {
                      return lastSpeciesThreats[d.data][
                        treeThreatType
                      ].getColor(colorBlind);
                    },
                    color: function (d) {
                      return lastSpeciesThreats[d.data][
                        treeThreatType
                      ].getColor(colorBlind);
                    }
                  }),
                  iconSize: new L.Point(iconDim, iconDim)
                })
              });
              this.countryClusterLayer.addLayer(newLayer);
            }
          }
        });
      }
    }
  }

  updateHexagons() {
    let highlightStyle = function (layer, highlight) {
      return {
        color: highlight ? "var(--highlightpurple)" : "rgb(244,244,244)",
        weight: highlight ? 2 : 1
      };
    };

    if (this.hexagonData && this.hexagons && this.speciesHexagons) {
      let heatMapData = {};

      let speciesNames = Object.keys(this.speciesHexagons);
      let cacheKey = JSON.stringify(speciesNames);

      if (this.hexagonCache && cacheKey === this.hexagonCache["key"]) {
        this.diversityColorScale = this.hexagonCache["scale"];
        this.setDiversityScale(this.diversityColorScale);
      } else {
        this.hexagonCache = { key: cacheKey };

        for (let speciesName of speciesNames) {
          let hexagonsIDs = this.speciesHexagons[speciesName];

          for (let hexID of hexagonsIDs) {
            pushOrCreate(heatMapData, hexID.toString(), speciesName);
          }
        }

        let heatMapLength = Object.keys(heatMapData).length;
        let heatMapMax = Math.max(
          ...Object.values(heatMapData).map((e) => e.length)
        );

        let scaleSteps = Math.min(10, heatMapMax);
        let scale = [];

        for (let i = 0; i < scaleSteps + 1; i++) {
          let scaleValue = i * (heatMapMax / scaleSteps);
          let scaleOpacity = scaleValue / heatMapMax;

          let scaleColor = "";

          scaleColor = colorsys.hsvToHex(210, scaleOpacity * 100, 100);

          scale.push({ scaleColor, scaleValue: Math.ceil(scaleValue) });
        }

        this.hexagonCache["scale"] = scale;
        this.diversityColorScale = scale;
        this.setDiversityScale(this.diversityColorScale, "hexagons");
        let boundHighlight = this.highlightPolygons.bind(this);

        let getScaledIndex = this.getScaledIndex.bind(this);
        let tooltip = this.tooltip.bind(this);
        let tooltipMove = this.tooltipMove.bind(this);

        function calculateStlyle(feature) {
          if (
            heatMapData.hasOwnProperty(feature.properties.HexagonID.toString())
          ) {
            let a = heatMapData[feature.properties.HexagonID.toString()];
            const aCount = Object.fromEntries(
              new Map(
                [...new Set(a)].map((x) => [x, a.filter((y) => y === x).length])
              )
            );
            let maxKey = Object.keys(aCount).reduce((a, b) =>
              aCount[a] > aCount[b] ? a : b
            );

            feature.options = { type: "hexagon", species: a };

            let val =
              heatMapData[feature.properties.HexagonID.toString()].length;
            let scaledIndex = getScaledIndex(val, scale);

            return {
              color: "white",
              stroke: 1,
              opacity: 1,
              weight: 1,
              fillOpacity: 1,
              fillColor: scale[scaledIndex].scaleColor,
              fill: scale[scaledIndex].scaleColor
            };
          } else {
            return {
              color: "rgb(244, 244, 244)",
              stroke: 1,
              opacity: 1,
              weight: 1,
              fillOpacity: 1,
              fillColor: "white"
            };
          }
        }

        if (this.hexagonData) {
          let hexas = L.geoJson(this.hexagonData, {
            style: calculateStlyle,
            filter: function (e) {
              if (
                heatMapData.hasOwnProperty(e.properties.HexagonID.toString())
              ) {
                return true;
              } else {
                return false;
              }
            },
            className: "hexagon",
            onEachFeature: (feature, layer) => {
              layer.options.polyID = feature.properties.HexagonID;
            }
          })

            .on("mouseover", function (d) {
              tooltip(d, true);
              d.layer.setStyle(highlightStyle(d.layer, true));
              d.layer.bringToFront();
            })
            .on("mouseout", function (d) {
              tooltip(d, false);
              d.layer.setStyle(highlightStyle(d.layer, false));
              d.layer.bringToFront();
            })
            .on("mousemove", function (d) {
              tooltipMove(d);
              d.layer.setStyle(highlightStyle(d.layer, true));
              d.layer.bringToFront();
            });

          this.hexagons.clearLayers();
          hexas.eachLayer((feature) => {
            this.hexagons.addLayer(feature);
          });
          //this.hexagons.bringToFront();
        }
      }
    }
  }

  overlayadd(event) {
    let typ = event.group.name;
    let layerName = event.name;
    this.activeLayer = layerName;

    switch (layerName) {
      case "Hexagons":
        if (this.ecoRegions && this.diversityCountries) {
          this.mymap.removeLayer(this.diversityCountries);
          this.mymap.removeLayer(this.ecoRegions);
          this.control._update();
          this.updateHexagons();
        }
        break;
      case "Countries":
        if (this.hexagons && this.ecoRegions) {
          this.mymap.removeLayer(this.hexagons);
          this.mymap.removeLayer(this.ecoRegions);
          this.control._update();
          this.updateDiversity();
        }
        break;
      case "Terrestrial Ecoregions":
        if (this.hexagons && this.diversityCountries) {
          this.mymap.removeLayer(this.diversityCountries);
          this.mymap.removeLayer(this.hexagons);
          this.control._update();
          this.updateEcoRegions();
        }
        break;
      default:
        break;
    }

    this.updateThreatPies();
  }

  setLastSpeciesThreats(lastSpeciesThreats) {
    this.lastSpeciesThreats = lastSpeciesThreats;
    this.updateThreatPies();
  }

  highlightPolygons(layers, highlight) {
    let highlightStyle = function (layer, highlight) {
      return {
        color: highlight ? "var(--highlightpurple)" : "rgb(244,244,244)",
        weight: highlight ? 2 : 1
      };
    };

    let polygons = null;

    try {
      polygons = layers.getAllChildMarkers().map((e) => e.options.polyID);
    } catch (error) {
      polygons = [layers.options.polyID];
    }

    switch (this.activeLayer) {
      case "Hexagons":
        /* if (this.hexagons !== undefined) {
          this.hexagons.eachLayer((layer) => {
            if (polygons.includes(layer.feature.properties.HexagonID)) {
              layer.setStyle(highlightStyle(layer, highlight));
              layer.bringToFront();
            } else {
              layer.setStyle(highlightStyle(layer, false));
            }
          });
        } */
        break;
      case "Countries":
        if (this.diversityCountries !== undefined) {
          this.diversityCountries.eachLayer((layer) => {
            if (layer.feature.selected) {
              layer.setStyle(highlightStyle(layer, true));
              layer.bringToFront();
            } else if (polygons.includes(layer.feature.properties.ISO3CD)) {
              layer.setStyle(highlightStyle(layer, highlight));
              layer.bringToFront();
            } else {
              layer.setStyle(highlightStyle(layer, false));
            }
          });
          //this.diversityCountries.bringToFront();
        }
        break;
      case "Terrestrial Ecoregions":
        if (this.ecoRegions !== undefined) {
          this.ecoRegions.eachLayer((layer) => {
            if (polygons.includes(layer.feature.properties.ECO_ID)) {
              layer.setStyle(highlightStyle(layer, highlight));
              layer.bringToFront();
            } else {
              layer.setStyle(highlightStyle(layer, false));
            }
          });
          //this.ecoRegions.bringToFront();
        }
        break;
      default:
        break;
    }
  }

  addSpeciesHexagons() {
    //console.log("addSpeciesHexagons");
  }

  addTreeCountries() {
    //console.log("addTreeCountries");
  }

  removeSpeciesCountries() {
    //console.log("addTreeCountries");
  }

  setSpeciesCountries(speciesCountries) {
    this.speciesCountries = speciesCountries;
  }

  setEcoRegions(speciesEcoRegions) {
    this.speciesEcoRegions = speciesEcoRegions;
  }

  setSpeciesHexagons(speciesHexagons) {
    this.speciesHexagons = speciesHexagons;
  }

  setTreeThreatType(treeThreatType) {
    this.treeThreatType = treeThreatType;
    this.updateThreatPies();
  }

  updateColorBlind(colorBlind) {
    this.colorBlind = colorBlind;
    this.updateThreatPies();
  }

  updateThreatPies() {
    switch (this.activeLayer) {
      case "Hexagons":
        this.updateThreatPiesEcoRegions();
        break;
      case "Countries":
        this.updateThreatPiesCountries();
        break;
      case "Terrestrial Ecoregions":
        this.updateThreatPiesEcoRegions();
        break;
      default:
        break;
    }
  }

  updateDiversityPolygons(/* filteredSpecies */) {
    //this.filteredSpecies = filteredSpecies;
    switch (this.activeLayer) {
      case "Hexagons":
        this.updateHexagons();
        break;
      case "Countries":
        this.updateDiversity();
        break;
      case "Terrestrial Ecoregions":
        this.updateEcoRegions();
        break;
      default:
        break;
    }
  }
}

export default MapHelper;
