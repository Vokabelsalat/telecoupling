import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/leaflet.markercluster.js";
import "leaflet.pattern/dist/leaflet.pattern.js";
import * as groupedLayers from "leaflet-groupedlayercontrol";
import "proj4leaflet";
import proj4 from "proj4";

import * as d3 from "d3";

import {
  pushOrCreate,
  serializeXmlNode,
  pushOrCreateWithoutDuplicates
} from "../utils/utils";
import { filter } from "d3";
import { bgciAssessment, citesAssessment } from "../utils/timelineUtils";

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
    initHeight,
    setDiversityScale,
    treeThreatType,
    setFilter,
    colorBlind,
    setMapSearchBarData,
    setMapSearchMode,
    lastSpeciesSigns,
    getPopulationTrend,
    setEcoRegionStatistics
  ) {
    this.id = id;
    this.initWidth = initWidth;
    this.initHeight = initHeight;
    this.setDiversityScale = setDiversityScale;
    this.getTreeThreatLevel = getTreeThreatLevel;
    this.treeThreatType = treeThreatType;
    this.setFilter = setFilter;
    this.setMapSearchBarData = setMapSearchBarData;
    this.setMapSearchMode = setMapSearchMode;
    this.lastSpeciesSigns = lastSpeciesSigns;
    this.getPopulationTrend = getPopulationTrend;
    this.setEcoRegionStatistics = setEcoRegionStatistics;

    this.speciesCountries = null;
    this.highlightCountriesLayer = null;
    this.first = true;
    this.rescure = false;

    this.treeClusterCache = {};
    this.rmax = 25;
    this.colorBlind = colorBlind;

    this.countriesToID = {};

    this.activeLayer = "Countries";

    this.noCountryForBGCI = [];
    this.noCountryForOrchestra = [];

    this.inhabitedEcoRegion = [];

    this.orchestraCountries = [
      "Albania",
      "Algeria",
      "Andorra",
      "Argentina",
      "Armenia",
      "Australia",
      "Austria",
      "Azerbaijan",
      "Bahamas",
      "Bahrain",
      "Barbados",
      "Belarus",
      "Belgium",
      "Bolivia",
      "Bosnia and Herzegovina",
      "Brazil",
      "Bulgaria",
      "Canada",
      "Chile",
      "Switzerland",
      "Italy",
      "China",
      "United States",
      "Kazakhstan",
      "Colombia",
      "Democratic Republic of the Congo",
      "Costa Rica",
      "Croatia",
      "Cuba",
      "Cyprus",
      "Kingdom of the Netherlands",
      "Paraguay",
      "Czech Republic",
      "Thailand",
      "Serbia",
      "Germany",
      "Denmark",
      "Dominican Republic",
      "Ecuador",
      "Egypt",
      "El Salvador",
      "Estonia",
      "France",
      "Finland",
      "Norway",
      "Romania",
      "Hungary",
      "South Korea",
      "Mexico",
      "Moldova",
      "Portugal",
      "Ghana",
      "Greece",
      "Guatemala",
      "Haiti",
      "Qatar",
      "United Kingdom",
      "United Arab Emirates",
      "Tajikistan",
      "Japan",
      "Iceland",
      "India",
      "Iran",
      "Iraq",
      "Ireland",
      "Israel",
      "Jordan",
      "Vietnam",
      "Montenegro",
      "Hong Kong",
      "Indonesia",
      "Taiwan",
      "Malaysia",
      "Latvia",
      "Lebanon",
      "Lithuania",
      "Kuwait",
      "Ukraine",
      "Spain",
      "Malta",
      "Luxembourg",
      "Venezuela",
      "Morocco",
      "Myanmar",
      "New Zealand",
      "Monaco",
      "Russia",
      "Oman",
      "Palestinian National Authority",
      "Panama",
      "Peru",
      "Philippines",
      "Poland",
      "Puerto Rico",
      "Trinidad and Tobago",
      "North Korea",
      "Slovakia",
      "Slovenia",
      "South Africa",
      "Sri Lanka",
      "Sweden",
      "Syria",
      "San Marino",
      "Tunisia",
      "Turkey",
      "Singapore",
      "Republic of North Macedonia",
      "Georgia",
      "Mongolia",
      "Liechtenstein",
      "Uruguay"
    ];

    this.isoCountries = {};

    this.bgciCountries = [
      "Afghanistan",
      "Åland Islands",
      "Albania",
      "Algeria",
      "American Samoa",
      "Andorra",
      "Angola",
      "Anguilla",
      "Antigua and Barbuda",
      "Argentina",
      "Armenia",
      "Aruba",
      "Australia",
      "Austria",
      "Azerbaijan",
      "Bahamas",
      "Bahrain",
      "Bangladesh",
      "Barbados",
      "Belarus",
      "Belgium",
      "Belize",
      "Benin",
      "Bermuda",
      "Bhutan",
      "Bolivia, Plurinational State of",
      "Bonaire, Sint Eustatius and Saba",
      "Bosnia and Herzegovina",
      "Botswana",
      "Brazil",
      "British Indian Ocean Territory",
      "Brunei Darussalam",
      "Bulgaria",
      "Burkina Faso",
      "Burundi",
      "Cambodia",
      "Cameroon",
      "Canada",
      "Cape Verde",
      "Cayman Islands",
      "Central African Republic",
      "Chad",
      "Chile",
      "China",
      "Christmas Island",
      "Cocos (Keeling) Islands",
      "Colombia",
      "Comoros",
      "Congo",
      "Congo, The Democratic Republic of the",
      "Cook Islands",
      "Costa Rica",
      "Côte d'Ivoire",
      "Croatia",
      "Cuba",
      "Curaçao",
      "Cyprus",
      "Czechia",
      "Denmark",
      "Disputed Territory",
      "Djibouti",
      "Dominica",
      "Dominican Republic",
      "Ecuador",
      "Egypt",
      "El Salvador",
      "Equatorial Guinea",
      "Eritrea",
      "Estonia",
      "Eswatini",
      "Ethiopia",
      "Falkland Islands",
      "Faroe Islands",
      "Fiji",
      "Finland",
      "France",
      "French Guiana",
      "French Polynesia",
      "Gabon",
      "Gambia",
      "Georgia",
      "Germany",
      "Ghana",
      "Gibraltar",
      "Greece",
      "Greenland",
      "Grenada",
      "Guadeloupe",
      "Guam",
      "Guatemala",
      "Guernsey",
      "Guinea",
      "Guinea-Bissau",
      "Guyana",
      "Haiti",
      "Holy See",
      "Honduras",
      "Hong Kong SAR, China",
      "Hungary",
      "Iceland",
      "India",
      "Indonesia",
      "Iran, Islamic Republic of",
      "Iraq",
      "Ireland",
      "Isle of Man",
      "Israel",
      "Italy",
      "Jamaica",
      "Japan",
      "Jersey",
      "Jordan",
      "Kazakhstan",
      "Kenya",
      "Kiribati",
      "Korea, Democratic People's Republic of",
      "Korea, Republic of",
      "Kuwait",
      "Kyrgyzstan",
      "Lao People's Democratic Republic",
      "Latvia",
      "Lebanon",
      "Lesotho",
      "Liberia",
      "Libya",
      "Liechtenstein",
      "Lithuania",
      "Luxembourg",
      "Macao",
      "Madagascar",
      "Malawi",
      "Malaysia",
      "Maldives",
      "Mali",
      "Malta",
      "Marshall Islands",
      "Martinique",
      "Mauritania",
      "Mauritius",
      "Mayotte",
      "Mexico",
      "Micronesia, Federated States of",
      "Moldova",
      "Monaco",
      "Mongolia",
      "Montenegro",
      "Montserrat",
      "Morocco",
      "Mozambique",
      "Myanmar",
      "Namibia",
      "Nauru",
      "Nepal",
      "Netherlands",
      "New Caledonia",
      "New Zealand",
      "Nicaragua",
      "Niger",
      "Nigeria",
      "Niue",
      "Norfolk Island",
      "North Macedonia",
      "Northern Mariana Islands",
      "Norway",
      "Oman",
      "Pakistan",
      "Palau",
      "Palestine, State of",
      "Panama",
      "Papua New Guinea",
      "Paraguay",
      "Peru",
      "Philippines",
      "Pitcairn",
      "Poland",
      "Portugal",
      "Puerto Rico",
      "Qatar",
      "Réunion",
      "Romania",
      "Russian Federation",
      "Rwanda",
      "Saint Barthélemy",
      "Saint Helena, Ascension and Tristan da Cunha",
      "Saint Kitts and Nevis",
      "Saint Lucia",
      "Saint Martin",
      "Saint Pierre and Miquelon",
      "Saint Vincent and the Grenadines",
      "Samoa",
      "San Marino",
      "Sao Tomé and Principe",
      "Saudi Arabia",
      "Senegal",
      "Serbia",
      "Seychelles",
      "Sierra Leone",
      "Singapore",
      "Sint Maarten",
      "Slovakia",
      "Slovenia",
      "Solomon Islands",
      "Somalia",
      "South Africa",
      "South Sudan",
      "Spain",
      "Sri Lanka",
      "Sudan",
      "Suriname",
      "Svalbard and Jan Mayen",
      "Sweden",
      "Switzerland",
      "Syrian Arab Republic",
      "Taiwan, Province of China",
      "Tajikistan",
      "Tanzania, United Republic of",
      "Thailand",
      "Timor-Leste",
      "Togo",
      "Tokelau",
      "Tonga",
      "Trinidad and Tobago",
      "Tunisia",
      "Turkey",
      "Turkmenistan",
      "Turks and Caicos Islands",
      "Tuvalu",
      "Uganda",
      "Ukraine",
      "United Arab Emirates",
      "United Kingdom",
      "United States",
      "United States Minor Outlying Islands",
      "Uruguay",
      "Uzbekistan",
      "Vanuatu",
      "Venezuela, Bolivarian Republic of",
      "Viet Nam",
      "Virgin Islands, British",
      "Virgin Islands, U.S.",
      "Wallis and Futuna",
      "Western Sahara",
      "Yemen",
      "Zambia",
      "Zimbabwe"
    ];

    this.init();
  }

  init() {
    d3.select("#" + this.id)
      .style("width", this.initWidth + "px")
      .style("height", this.initHeight + "px");

    let resolutions = [
      32768, 16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2,
      1, 0.5
      /* 65536, 32768, 16384, 8192, 4096, 2048, 1024, 512, 256, 128 */
    ];

    /*  var crs = new L.Proj.CRS(
      "EPSG:54009",
      "+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs",
      {
        resolutions,
        origin: [100, 0]
      }
    ); */

    this.mymap = L.map(this.id, {
      worldCopyJump: false,
      minZoom: 0,
      maxZoom: resolutions.length
      /* crs: crs */
    }).setView([0, 0], 0);

    this.mymap.on("overlayadd", this.overlayadd.bind(this));

    var wmsLayer = L.tileLayer.wms("https://ahocevar.com/geoserver/wms", {
      layers: "ne:NE1_HR_LC_SR_W_DR"
    });

    this.control = L.control
      .groupedLayers(
        {},
        {
          /* "Tile Layers": {
            WMS: wmsLayer
          } */
        },
        { collapsed: true }
      )
      .addTo(this.mymap);

    this.setUpEverything();
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
              feature.properties.title === layer.feature.properties.ROMNAM
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
      case "eco":
        if (this.ecoRegions) {
          let filterRegions = [];

          if (feature) {
            if (feature.properties.ecoArray !== undefined) {
              filterRegions = feature.properties.ecoArray
                .flat()
                .map((e) => parseInt(e))
                .filter((e) => this.inhabitedEcoRegion.includes(parseInt(e)));
            } else {
              filterRegions = [feature.properties.value];
            }
          }

          this.ecoRegions.eachLayer((layer) => {
            if (
              feature &&
              filterRegions.includes(parseInt(layer.feature.properties.ECO_ID))
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

  setUpEverything() {
    fetch("/countryDictionary.json")
      .then((res) => res.json())
      .then((data) => {
        this.countryDictionary = data;

        this.bgciToISO3 = {};
        this.iso2ToISO3 = {};
        this.orchestraToISO3 = {};
        for (let country of Object.values(data)) {
          if (country.BGCI) {
            this.bgciToISO3[country.BGCI] = country.ISO3;
          }
          if (country.ISO2) {
            this.iso2ToISO3[country.ISO2] = country.ISO3;
          }
          if (country.orchestraCountry) {
            this.orchestraToISO3[country.orchestraCountry] = country.ISO3;
          }
        }

        this.iso3ToPopulation = {};
        fetch("/population.json")
          .then((res) => res.json())
          .then((data) => {
            for (let iso2 of Object.keys(data)) {
              let country = data[iso2];

              if (this.iso2ToISO3.hasOwnProperty(iso2)) {
                let iso3 = this.iso2ToISO3[iso2];
                this.iso3ToPopulation[iso3] = country.pop2022 * 1000;
              }
            }
          });

        this.setUpCountries();
        this.setUpEcoRegions();
        this.setUpHexagons();
        this.setUpCapitals();
        this.setUpOrchestras();
      });
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

        let mapSearchBarData = [];
        let mapSearchBarDataKeys = [];

        this.ecoToBiom = {};
        this.biomToEco = {};

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

              this.ecoToBiom[feature.properties.ECO_ID.toString()] =
                feature.properties.BIOME_NAME;

              pushOrCreateWithoutDuplicates(
                this.biomToEco,
                feature.properties.BIOME_NAME,
                feature.properties.ECO_ID.toString()
              );

              if (!mapSearchBarDataKeys.includes(feature.properties.ECO_ID)) {
                mapSearchBarData.push({
                  type: "eco",
                  ECO_NAME: feature.properties.ECO_NAME,
                  title: feature.properties.ECO_NAME,
                  ECO_ID: feature.properties.ECO_ID,
                  value: feature.properties.ECO_ID
                });
                mapSearchBarDataKeys.push(feature.properties.ECO_ID);
              }

              feature.options = {
                popupText: popupText,
                type: "ecoregion"
              };

              layer.options.polyID = feature.properties.ECO_ID;

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
            boundHighlight(d.layer, true);
            /* d.layer.setStyle(highlightStyle(d.layer, true));
            d.layer.bringToFront(); */
          })
          .on("mouseout", function (d) {
            tooltip(d, false);
            boundHighlight(d.layer, false);
            /* d.layer.setStyle(highlightStyle(d.layer, false)); */
          })
          .on("mousemove", function (d) {
            tooltipMove(d);
            boundHighlight(d.layer, true);
            /* d.layer.setStyle(highlightStyle(d.layer, true));
            d.layer.bringToFront(); */
          });

        for (let biom of Object.keys(this.biomToEco)) {
          mapSearchBarData.push({
            type: "biom",
            title: biom,
            value: [this.biomToEco[biom]]
          });
        }

        this.setMapSearchBarData("eco", mapSearchBarData);

        this.ecoRegions = ecos;

        this.control.addOverlay(
          this.ecoRegions,
          "Terrestrial Ecoregions",
          "Diversity"
        );

        this.rescureEcoRegions = L.layerGroup();
        this.control.addOverlay(
          this.rescureEcoRegions,
          "Ecoregion Protection Potential",
          "Extra"
        );

        //this.updateEcoRegions();
      });
  }

  tooltipMove(event) {
    let windowHeight = window.innerHeight;
    let windowWidth = window.innerWidth;
    let add = 25;

    let tooltip = d3.select(".tooltip");
    let height = tooltip.node().getBoundingClientRect().height;
    let width = tooltip.node().getBoundingClientRect().width;
    tooltip
      .style(
        "left",
        Math.min(windowWidth - width, event.originalEvent.pageX + 25) + "px"
      )
      .style(
        "top",
        Math.min(windowHeight - height, event.originalEvent.pageY + 25) + "px"
      );
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
          text +=
            "<br>" +
            layer.feature.options.species.length +
            (this.activeLayer === "Orchestras Worldwide"
              ? " Orchestras"
              : " Species");

          if (layer.feature.options.species.length < 8) {
            text += ": <br><i>";
            text = text + layer.feature.options.species.join("<br>") + "</i>";
          }
        }

        text += "<br><i>Click to filter!</i>";
        break;
      case "hexagon":
        if (layer.feature.options.hasOwnProperty("species")) {
          text = layer.feature.options.species.length + " Species";

          if (layer.feature.options.species.length < 8) {
            text += ": <br><i>";
            text = text + layer.feature.options.species.join("<br>") + "</i>";
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
            text += ": <br><i>";
            text = text + layer.feature.options.species.join("<br>") + "</i>";
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

    fetch("/UN_Worldmap-2.json")
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

              this.isoCountries[feature.properties.ISO3CD] = {
                ROMNAM: feature.properties.ROMNAM,
                MAPLAB: feature.properties.MAPLAB,
                ISO3: feature.properties.ISO3CD
              };

              if (!mapSearchBarDataKeys.includes(feature.properties.ISO3CD)) {
                mapSearchBarData.push({
                  type: "country",
                  title: feature.properties.ROMNAM,
                  value: feature.properties.ROMNAM,
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

        this.setMapSearchBarData("country", mapSearchBarData);

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
          pushOrCreate(
            this.countriesToID,
            feature.properties.ISO3CD,
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
      });
  }

  setUpIsoCountries() {
    fetch("/isoCountries.json")
      .then((res) => res.json())
      .then((data) => {
        for (let country of data) {
          if (this.isoCountries.hasOwnProperty(country.ISO3)) {
            this.isoCountries[country.ISO3].ISO2 = country.ISO2;
            this.isoCountries[country.ISO3].Numeric = country.Numeric;
            this.isoCountries[country.ISO3].isoName = country.Country;

            let countryObject = this.isoCountries[country.ISO3];
            for (let bgciName of this.bgciCountries) {
              if (bgciName === countryObject.ROMNAM) {
                this.isoCountries[country.ISO3].BGCI = bgciName;
              } else if (bgciName === countryObject.MAPLAB) {
                this.isoCountries[country.ISO3].BGCI = bgciName;
              } else if (bgciName === countryObject.isoName) {
                this.isoCountries[country.ISO3].BGCI = bgciName;
              }
            }

            if (this.isoCountries[country.ISO3].BGCI === undefined) {
              this.isoCountries[country.ISO3].BGCI = "replaceME";
            }

            for (let orchestraCountry of this.orchestraCountries) {
              if (orchestraCountry === countryObject.ROMNAM) {
                this.isoCountries[country.ISO3].orchestraCountry =
                  orchestraCountry;
              } else if (orchestraCountry === countryObject.MAPLAB) {
                this.isoCountries[country.ISO3].orchestraCountry =
                  orchestraCountry;
              } else if (orchestraCountry === countryObject.isoName) {
                this.isoCountries[country.ISO3].orchestraCountry =
                  orchestraCountry;
              }
            }

            if (
              this.isoCountries[country.ISO3].orchestraCountry === undefined
            ) {
              this.isoCountries[country.ISO3].orchestraCountry = "replaceME";
            }
          }
        }

        for (let bgciName of this.bgciCountries) {
          let hit = false;
          for (let isoCountry of Object.values(this.isoCountries)) {
            if (bgciName === isoCountry.ROMNAM) {
              hit = true;
            } else if (bgciName === isoCountry.MAPLAB) {
              hit = true;
            } else if (bgciName === isoCountry.isoName) {
              hit = true;
            }
          }
          if (hit === false) {
            this.noCountryForBGCI.push(bgciName);
          }
        }

        for (let orchestraCountry of this.orchestraCountries) {
          let hit = false;
          for (let isoCountry of Object.values(this.isoCountries)) {
            if (orchestraCountry === isoCountry.ROMNAM) {
              hit = true;
            } else if (orchestraCountry === isoCountry.MAPLAB) {
              hit = true;
            } else if (orchestraCountry === isoCountry.isoName) {
              hit = true;
            }
          }
          if (hit === false) {
            this.noCountryForOrchestra.push(orchestraCountry);
          }
        }

        fetch("/POPP_capitals_FeaturesToJSON.json")
          .then((res) => res.json())
          .then((data) => {
            for (let key of Object.keys(this.isoCountries)) {
              let country = this.isoCountries[key];
              for (let cap of data.features) {
                if (cap.properties.ISO3CD === country.ISO3) {
                  this.isoCountries[key].capital = cap.properties.ROMNAM;
                }
              }

              if (this.isoCountries[key].capital === undefined) {
                this.isoCountries[key].capital = "replaceME";
              }
            }
          });
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
            /* d.target.setStyle(highlightStyle(d.layer, true)); */
            /* d.layer.bringToFront(); */
            boundHighlight(d.layer, false);
          });

        this.countryClusterLayer.addTo(this.mymap);
      });
  }

  setUpOrchestras() {
    fetch("/Orchestras_worldwide.json")
      .then((res) => res.json())
      .then((data) => {
        this.orchstras = {};
        let orchestraCountries = {};
        let markers = [];
        for (let feat of data.features) {
          this.orchstras[feat.properties.FID] = feat;

          orchestraCountries[feat.properties.Country] = 1;

          let coords = feat.geometry.coordinates;
          //let marker = L.marker([coords[1], coords[0]]);
          //this.iso3ToCapital[layer.feature.properties.ISO3CD].geometry.coordinates;

          let radius = Math.min(this.rmax - 2 * 2 - 12, this.rmax);

          let marker = L.marker([coords[1], coords[0]], {
            properties: feat.properties,
            data: [{ typ: "orchstra" }],
            icon: new L.DivIcon({
              html: this.bakeTheOrchestraPie({
                data: [{ typ: "orchstra" }],
                valueFunc: function (d) {
                  return [d].length;
                },
                strokeWidth: 2,
                outerRadius: radius,
                innerRadius: radius - 8,
                pieClass: "cluster-pie",
                pieLabel: 1,
                pieLabelClass: "marker-cluster-pie-label",
                strokeColor: function (d) {
                  return "rgb(185,126,193)";
                },
                color: function (d) {
                  return "rgb(185,126,193)";
                }
              }),
              iconSize: new L.Point(radius, radius)
            })
          });
          markers.push(marker);
        }

        this.orchestraClusterLayer = L.markerClusterGroup({
          iconCreateFunction: this.defineClusterIconOrchestra.bind(this),
          tree: "Orchestras",
          type: "Orchestras",
          chunkedLoading: true,
          removeOutsideVisibleBounds: true,
          maxClusterRadius: this.rmax * 2.5,
          showCoverageOnHover: false
        });

        this.orchestraClusterLayer.addLayers(markers);

        /* .on("mouseover", function (d) {
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
          }); */

        /* this.orchestraClusterLayer.addTo(this.mymap); */

        //orchestraLayer

        this.orchestraLayer = L.layerGroup();
        this.orchestraLayer.addTo(this.mymap);

        this.control.addOverlay(
          this.orchestraClusterLayer,
          "Orchestras Worldwide",
          "Extra"
        );
      });
  }

  bakeTheOrchestraPie(options) {
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

    let donutData = donut.value(valueFunc);

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
      .attr("r", rInner)
      .attr("fill", "white");
    /* .style("fill-opacity", "50%"); */

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

  defineClusterIconThreat(cluster) {
    var children = cluster.getAllChildMarkers();
    let treeThreatType = this.treeThreatType ? "economically" : "ecologically";
    let lastSpeciesSigns = this.lastSpeciesSigns;

    /* let data = [...new Set(children.map((e) => e.options.data).flat())].map(
      (e) => lastSpeciesSigns[e][treeThreatType]
    ); */
    let data = children.map((e) => e.options.data).flat();

    let dataWithoutDuplicates = {};
    data.map((e) => {
      dataWithoutDuplicates[e.species] = e;
    });

    dataWithoutDuplicates = Object.values(dataWithoutDuplicates);

    let n = dataWithoutDuplicates.length; //Get number of markers in cluster
    let nestedData = d3
      .nest()
      .key(function (d) {
        return d.threat.abbreviation;
      })
      .entries(dataWithoutDuplicates, d3.map);

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
      nestedData.reduce(
        (prev, curr) => prev + (curr.key + curr.values.length),
        ""
      ) + colorBlind;

    let html;
    if (Object.keys(this.treeClusterCache).includes(cacheKey)) {
      html = this.treeClusterCache[cacheKey];
    } else {
      //bake some svg markup
      html = this.bakeTheThreatPie({
        data: nestedData,
        valueFunc: function (d) {
          return d.values.length;
        },
        outerRadius: r,
        innerRadius: r - 8,
        pieClass: "cluster-pie",
        pieLabelClass: "marker-cluster-pie-label",
        strokeColor: function (d) {
          return d.data.values[0].threat.getColor(colorBlind);
        },
        color: function (d) {
          return d.data.values[0].threat.getColor(colorBlind);
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
      origo = r + strokeWidth + 1, //Center coordinate
      w = origo * 2, //width and height of the svg element
      h = w,
      donut = d3.pie(),
      arc = d3.arc().innerRadius(rInner).outerRadius(r);

    let div = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
    d3.select(div).attr("class", "cluster-pie-wrapper");

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
      if (b.hasOwnProperty("values") && a.hasOwnProperty("values")) {
        return b.values[0].threat.numvalue - a.values[0].threat.numvalue;
      } else {
        return b.threat.numvalue - a.threat.numvalue;
      }
    });

    vis
      .append("circle")
      .attr("cx", origo)
      .attr("cy", origo)
      .attr("r", r + 1)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("fill", "none");

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
      .attr("r", rInner)
      .attr("fill", "white");
    /* .style("fill-opacity", "50%"); */

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

  defineClusterIconOrchestra(cluster) {
    var children = cluster.getAllChildMarkers();

    let data = children.map((e) => {
      return { typ: "orchestra" };
    });

    let n = data.length; //Get number of markers in cluster
    data = d3
      .nest()
      .key(function (d) {
        return d.typ;
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
          /* return d.data.values[0].getColor(colorBlind); */
          return "rgb(185,126,193)";
        },
        color: function (d) {
          /* return d.data.values[0].getColor(colorBlind); */
          return "rgb(185,126,193)";
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

  getScaledIndex(value, scale, reverse = false) {
    let index = 0;
    for (let e of scale) {
      if (reverse) {
        if (value > e.scaleValue) {
          return index;
        }
      } else {
        if (value <= e.scaleValue) {
          return index;
        }
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

      let scale = [];
      let test = d3
        .scaleLinear()
        .domain([0, heatMapMax])
        .ticks(Math.min(15, heatMapMax));

      for (let val of test.slice(0, test.length - 1)) {
        let scaleOpacity = val / heatMapMax;
        let scaleColor = colorsys.hsvToHex(210, scaleOpacity * 100, 100);

        scale.push({ scaleColor, scaleValue: val });
      }

      let scaleColor = colorsys.hsvToHex(210, 100, 100);
      scale.push({ scaleColor, scaleValue: heatMapMax });

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
    let lastSpeciesSigns = this.lastSpeciesSigns;
    let getTreeThreatLevel = this.getTreeThreatLevel.bind(this);
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

          data = [...new Set(data)].map((e) => {
            if (lastSpeciesSigns.hasOwnProperty(e)) {
              return {
                threat: lastSpeciesSigns[e][treeThreatType],
                species: e
              };
            } else {
              return { threat: citesAssessment.get("DD"), species: e };
            }
          });
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
                      return d.data.threat.getColor(colorBlind);
                    },
                    color: function (d) {
                      return d.data.threat.getColor(colorBlind);
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

      if (this.first && this.countryClusterLayer.getLayers().length > 0) {
        this.mymap.fitBounds(this.countryClusterLayer.getBounds(), {
          padding: [50, 50]
        });
        this.first = false;
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

      this.inhabitedEcoRegion = Object.keys(heatMapData).map((e) =>
        parseInt(e)
      );

      let heatMapLength = Object.keys(heatMapData).length;
      let heatMapMax = Math.max(
        ...Object.values(heatMapData).map((e) => e.length)
      );

      let treeThreatType = this.treeThreatType;

      let scale = [];
      let test = d3
        .scaleLinear()
        .domain([0, heatMapMax])
        .ticks(Math.min(10, heatMapMax));

      for (let val of test.slice(0, test.length - 1)) {
        let scaleOpacity = val / heatMapMax;
        let scaleColor = colorsys.hsvToHex(210, scaleOpacity * 100, 100);

        scale.push({ scaleColor, scaleValue: val });
      }

      let scaleColor = colorsys.hsvToHex(210, 100, 100);
      scale.push({ scaleColor, scaleValue: heatMapMax });

      if (this.rescure) {
        scale = [
          {
            scaleColor: bgciAssessment.get("DD").getColor(),
            scaleValue: 0,
            scaleLabel: "Data Deficient"
          },
          {
            scaleColor: bgciAssessment.get("nT").getColor(),
            scaleValue: 1,
            scaleLabel: "Half Protected"
          },
          {
            scaleColor: bgciAssessment.get("PT").getColor(),
            scaleValue: 2,
            scaleLabel: "Could Reach Half Protected"
          },
          {
            scaleColor: bgciAssessment.get("TH").getColor(),
            scaleValue: 3,
            scaleLabel: "Could Recover"
          },
          {
            scaleColor: bgciAssessment.get("EX").getColor(),
            scaleValue: 4,
            scaleLabel: "Imperiled"
          }
        ];
      }

      this.diversityColorScale = scale;
      this.setDiversityScale(
        this.diversityColorScale,
        this.rescure ? "rescure" : "ecoregions"
      );

      let getScaledIndex = this.getScaledIndex.bind(this);
      let rescure = this.rescure;

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

          let val;

          if (rescure) {
            val = parseInt(feature.properties.NNH);
          } else {
            val = heatMapData[feature.properties.ECO_ID.toString()].length;
          }

          let scaledIndex = getScaledIndex(val, scale);

          feature.options.species = a;

          let fillColor = "lime";
          let color = "lime";

          fillColor = scale[scaledIndex].scaleColor;
          color = scale[scaledIndex].scaleColor;

          return {
            color: feature.selected
              ? "var(--highlightpurple)"
              : "rgb(244,244,244)",
            weight: feature.selected ? 2 : 1,
            stroke: 1,
            opacity: 1,
            fillOpacity: 1,
            fillColor: fillColor,
            fill: color
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

      if (rescure) {
        this.rescureEcoRegions.eachLayer((layer) => {
          layer.setStyle(calculateStlyle(layer.feature));
        });
      } else {
        this.ecoRegions.eachLayer((layer) => {
          layer.setStyle(calculateStlyle(layer.feature));
        });
      }
    }
    this.updateThreatPiesEcoRegions();
  }

  toggleEcoRegions() {
    if (this.rescure) {
      this.ecoRegions.eachLayer((layer) => {
        this.rescureEcoRegions.addLayer(layer);
      });
    } else {
      this.rescureEcoRegions.eachLayer((layer) => {
        this.ecoRegions.addLayer(layer);
      });
    }
  }

  updateThreatPiesEcoRegions() {
    let treeThreatType = this.treeThreatType ? "economically" : "ecologically";
    let lastSpeciesSigns = this.lastSpeciesSigns;
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

      let getPopulationTrend = this.getPopulationTrend.bind(this);
      let setEcoRegionStatistics = this.setEcoRegionStatistics.bind(this);
      let ecoRegionStatistics = [];

      if (this.ecoRegions !== undefined) {
        this.ecoRegions.eachLayer((layer) => {
          //calculate the clusterthreatpie
          if (
            heatMapData.hasOwnProperty(
              layer.feature.properties.ECO_ID.toString()
            )
          ) {
            let data = heatMapData[layer.feature.properties.ECO_ID.toString()];

            data = [...new Set(data)].map((e) => {
              if (lastSpeciesSigns.hasOwnProperty(e)) {
                return {
                  species: e,
                  threat: lastSpeciesSigns[e][treeThreatType]
                };
              } else {
                return { species: e, threat: citesAssessment.get("DD") };
              }
            });

            /* let threatLevels = data.map((e) => {
              return lastSpeciesSigns[e][treeThreatType];
            }); */

            /*       ecoRegionStatistics.push([
              layer.feature.properties.ECO_NAME,
              layer.feature.properties.ECO_ID,
              data.length,
              data.filter((e) => e.numvalue in [0, 1]).length,
              data.filter((e) => e.numvalue === 2).length,
              data.filter((e) => e.numvalue === 3).length,
              data
                .map((species) => {
                  return getPopulationTrend(species);
                })
                .filter((trend) => trend === "Decreasing").length,
              data
                .map((species) => {
                  return getPopulationTrend(species);
                })
                .filter((trend) => trend !== undefined).length,
              layer.feature.properties.NNH_NAME
            ]);
 */
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
                      return d.data.threat.getColor(colorBlind);
                    },
                    color: function (d) {
                      return d.data.threat.getColor(colorBlind);
                    }
                  }),
                  iconSize: new L.Point(iconDim, iconDim)
                })
              });
              this.countryClusterLayer.addLayer(newLayer);
            }
          }
        });
        setEcoRegionStatistics(ecoRegionStatistics);
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

        let scale = [];
        let test = d3
          .scaleLinear()
          .domain([0, heatMapMax])
          .ticks(Math.min(10, heatMapMax));

        for (let val of test.slice(0, test.length - 1)) {
          let scaleOpacity = val / heatMapMax;
          let scaleColor = colorsys.hsvToHex(210, scaleOpacity * 100, 100);

          scale.push({ scaleColor, scaleValue: val });
        }

        let scaleColor = colorsys.hsvToHex(210, 100, 100);
        scale.push({ scaleColor, scaleValue: heatMapMax });

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

  updateOrchestrasWithPopulation(first = false) {
    if (this.diversityCountries !== undefined) {
      let heatMapData = {};
      let heatMapDataPopulation = {};

      for (let orchestra of Object.values(this.orchstras)) {
        let country = orchestra.properties.Country;
        let countryISO = this.orchestraToISO3[country];

        if (countryISO) {
          if (this.countriesToID.hasOwnProperty(countryISO)) {
            let countryIDs = this.countriesToID[countryISO];
            for (let countryID of countryIDs) {
              pushOrCreateWithoutDuplicates(
                heatMapData,
                countryID.toString(),
                orchestra.properties.address
              );

              if (this.iso3ToPopulation.hasOwnProperty(countryISO)) {
                let population = this.iso3ToPopulation[countryISO];
                heatMapDataPopulation[countryID.toString()] = Math.floor(
                  population / heatMapData[countryID.toString()].length
                );
              }
            }
          }
        }
      }

      heatMapData = heatMapDataPopulation;

      let heatMapLength = Object.keys(heatMapData).length;
      let heatMapMax = Math.max(...Object.values(heatMapData).map((e) => e));
      let heatMapMin = Math.min(...Object.values(heatMapData).map((e) => e));

      let scale = [];
      let test = d3
        .scaleLog()
        .domain([heatMapMin, heatMapMax])
        .ticks(Math.min(15, heatMapMax));

      /* for (let val of test.slice(0, test.length - 1)) {
        let scaleOpacity = val / heatMapMax;
        let scaleColor = colorsys.hsvToHex(210, scaleOpacity * 100, 100);

        scale.push({ scaleColor, scaleValue: val });
      }

      let scaleColor = colorsys.hsvToHex(210, 100, 100);
      scale.push({ scaleColor, scaleValue: heatMapMax }); */

      let scaleColor = colorsys.hsvToHex(210, 100, 100);
      scale.push({ scaleColor, scaleValue: heatMapMin });

      for (let val of test.slice(1, test.length)) {
        let scaleOpacity = 1 - val / heatMapMax;
        let scaleColor = colorsys.hsvToHex(210, scaleOpacity * 100, 100);

        scale.push({ scaleColor, scaleValue: val });
      }

      this.diversityColorScale = scale;
      this.setDiversityScale(this.diversityColorScale, "orchestras");

      let getScaledIndex = this.getScaledIndex.bind(this);

      function calculateStlyle(feature) {
        if (heatMapData.hasOwnProperty(feature.id.toString())) {
          let a = heatMapData[feature.id.toString()];
          const aCount = a; /* Object.fromEntries(
            new Map(
              [...new Set(a)].map((x) => [x, a.filter((y) => y === x).length])
            )
          ); */
          /* let maxKey = Object.keys(aCount).reduce((a, b) =>
            aCount[a] > aCount[b] ? a : b
          ); */

          /* let val = 0;
          if (this.iso3ToPopulation.hasOwnProperty(feature.properties.ISO3CD)) {
            let population = this.iso3ToPopulation[feature.properties.ISO3CD];

            val = population / a.length;
          } */

          let val = a;
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

  toggleDiverstiyCountries(orchestra = false) {
    if (orchestra) {
      this.diversityCountries.eachLayer((layer) => {
        this.orchestraLayer.addLayer(layer);
      });
    } else {
      this.orchestraLayer.eachLayer((layer) => {
        this.diversityCountries.addLayer(layer);
      });
    }
  }

  updateOrchestras(first = false) {
    if (this.diversityCountries !== undefined) {
      let heatMapData = {};

      for (let orchestra of Object.values(this.orchstras)) {
        let country = orchestra.properties.Country;
        let countryISO = this.orchestraToISO3[country];

        if (countryISO) {
          if (this.countriesToID.hasOwnProperty(countryISO)) {
            let countryIDs = this.countriesToID[countryISO];
            for (let countryID of countryIDs) {
              pushOrCreateWithoutDuplicates(
                heatMapData,
                countryID.toString(),
                orchestra.properties.address
              );
            }
          }
        }
      }

      let heatMapLength = Object.keys(heatMapData).length;
      let heatMapMax = Math.max(
        ...Object.values(heatMapData).map((e) => e.length)
      );

      let scale = [];
      let test = d3
        .scaleLinear()
        .domain([0, heatMapMax])
        .ticks(Math.min(15, heatMapMax));

      for (let val of test.slice(0, test.length - 1)) {
        let scaleOpacity = val / heatMapMax;
        let scaleColor = colorsys.hsvToHex(210, scaleOpacity * 100, 100);

        scale.push({ scaleColor, scaleValue: val });
      }

      let scaleColor = colorsys.hsvToHex(210, 100, 100);
      scale.push({ scaleColor, scaleValue: heatMapMax });

      this.diversityColorScale = scale;
      this.setDiversityScale(this.diversityColorScale, "orchestras");

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

      this.orchestraLayer.eachLayer((layer) => {
        layer.setStyle(calculateStlyle(layer.feature));
      });
    }
  }

  overlayadd(event) {
    let typ = event.group.name;
    let layerName = event.name;
    this.activeLayer = layerName;

    switch (layerName) {
      case "Hexagons":
        if (this.ecoRegions && this.diversityCountries) {
          this.countryClusterLayer.addTo(this.mymap);
          this.mymap.removeLayer(this.diversityCountries);
          this.mymap.removeLayer(this.ecoRegions);
          this.mymap.removeLayer(this.rescureEcoRegions);
          this.mymap.removeLayer(this.orchestraClusterLayer);
          this.mymap.removeLayer(this.orchestraLayer);
          this.rescure = false;
          this.control._update();
          this.setMapSearchMode("hexagon");
          this.updateHexagons();
        }
        break;
      case "Countries":
        if (this.hexagons && this.ecoRegions) {
          this.toggleDiverstiyCountries(false);
          this.countryClusterLayer.addTo(this.mymap);
          this.mymap.removeLayer(this.hexagons);
          this.mymap.removeLayer(this.ecoRegions);
          this.mymap.removeLayer(this.rescureEcoRegions);
          this.mymap.removeLayer(this.orchestraClusterLayer);
          this.mymap.removeLayer(this.orchestraLayer);
          this.rescure = false;
          this.control._update();
          this.setMapSearchMode("country");
          this.updateDiversity();
        }
        break;
      case "Terrestrial Ecoregions":
        if (this.hexagons && this.diversityCountries) {
          this.countryClusterLayer.addTo(this.mymap);
          this.mymap.removeLayer(this.diversityCountries);
          this.mymap.removeLayer(this.hexagons);
          this.mymap.removeLayer(this.rescureEcoRegions);
          this.mymap.removeLayer(this.orchestraClusterLayer);
          this.mymap.removeLayer(this.orchestraLayer);
          this.rescure = false;
          this.control._update();
          this.setMapSearchMode("eco");
          this.toggleEcoRegions();
          this.updateEcoRegions();
        }
        break;
      case "Orchestras Worldwide":
        if (this.hexagons && this.ecoRegions) {
          this.orchestraLayer.addTo(this.mymap);
          this.mymap.removeLayer(this.hexagons);
          this.mymap.removeLayer(this.ecoRegions);
          this.mymap.removeLayer(this.rescureEcoRegions);
          this.mymap.removeLayer(this.countryClusterLayer);
          this.mymap.removeLayer(this.diversityCountries);
          this.rescure = false;
          this.control._update();
          this.setMapSearchMode("country");
          this.toggleDiverstiyCountries(true);
          this.updateOrchestras();
        }
        break;
      case "Ecoregion Protection Potential":
        if (this.hexagons && this.diversityCountries) {
          this.countryClusterLayer.addTo(this.mymap);
          this.mymap.removeLayer(this.diversityCountries);
          this.mymap.removeLayer(this.hexagons);
          this.mymap.removeLayer(this.ecoRegions);
          this.mymap.removeLayer(this.orchestraClusterLayer);
          this.mymap.removeLayer(this.orchestraLayer);
          this.control._update();
          this.setMapSearchMode("eco");
          this.rescure = true;
          this.toggleEcoRegions();
          this.updateEcoRegions();
        }
        break;
      default:
        break;
    }

    this.updateThreatPies();
  }

  setlastSpeciesSigns(lastSpeciesSigns) {
    this.lastSpeciesSigns = lastSpeciesSigns;
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
            if (layer.feature.selected) {
              layer.setStyle(highlightStyle(layer, true));
              layer.bringToFront();
            } else if (polygons.includes(layer.feature.properties.ECO_ID)) {
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
      case "Orchestras Worldwide":
        /* this.updateOrchestras(); */
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
      case "Orchestras Worldwide":
        this.updateOrchestras();
        break;
      default:
        break;
    }
  }
}

export default MapHelper;
