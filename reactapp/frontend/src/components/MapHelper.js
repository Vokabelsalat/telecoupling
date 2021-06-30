import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.pattern/dist/leaflet.pattern.js'
import * as groupedLayers from 'leaflet-groupedlayercontrol';
import * as d3 from 'd3';
import { rgbToRGBA, serializeXmlNode, watermarkColorSheme, colorBrewerScheme8Qualitative, dangerColorMap, pushOrCreate, iucnToDangerMap, scaleValue, replaceSpecialCharacters } from '../utils/utils';
import { threatScore, threatScoreReverse, getCitesColor, getIucnColor, citesAppendixSorted } from '../utils/timelineUtils';
import { tree } from 'd3';
var colorsys = require('colorsys');

var categoryField = "tree";
var iconField = "tree";
var treeColors = {};
var values = [];
var biomes = ["Tropical & Subtropical Moist Broadleaf Forests", "Tropical & Subtropical Dry Broadleaf Forests", "Tropical & Subtropical Coniferous Forests", "Temperate Broadleaf & Mixed Forests", "Temperate Conifer Forests", "Boreal Forests/Taiga", "Tropical & Subtropical Grasslands, Savannas & Shrublands", "Temperate Grasslands, Savannas & Shrublands", "Flooded Grasslands & Savannas", "Montane Grasslands & Shrublands", "Tundra", "Mediterranean Forests, Woodlands & Scrub", "Deserts & Xeric Shrublands", "Mangroves"];

class MapHelper {
    constructor(id, getTreeThreatLevel, initWidth, setDiversityScale, heatMap, diversity) {
        this._data = [];
        this._id = id;
        this.trees = {};
        this.treeQueue = [];
        this.treeCoordinateQueue = [];
        this.treeExportQueue = [];
        this.treeCoordinateControls = [];
        this.isTreeClustered = false;
        this.rmax = 30;
        this.treeClusterCache = {};
        this.getTreeThreatLevel = getTreeThreatLevel;
        this.setDiversityScale = setDiversityScale;
        this.initWidth = initWidth;
        this.addHotSpots = false;
        this.addEcoregions = true;
        this.addAllCountries = true;
        this.treeThreatType = true;
        this.heatMap = heatMap;
        this.diversity = diversity;

        this.activeSpecies = {};

        this.stripes = {};
        this.speciesImageLinks = {};

        this.diversityRegions = {};
        this.diversityCountries = {};

        this.hoverSpecies = [];

        MapHelper.instance = this;
        this.init();
        /* this.initTest(); */

    }

    init() {
        d3.select("#" + this._id)
            .style("width", this.initWidth + "px");

        this.mymap = L.map(this._id, {
            worldCopyJump: true,
        }).setView([39.74739, -105], 2);
        //this.mymap = L.map("mapid").setView([51.505, -0.09], 13);

        this.mymap.on("overlayadd", this.overlayadd.bind(this));
        this.mymap.on("overlayremove", this.overlayremove.bind(this));

        this.mymap.createPane('labels');
        this.mymap.getPane('labels').style.zIndex = 650;
        this.mymap.getPane('labels').style.pointerEvents = 'none';

        this.achenSvgString = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"  width="590.074px" height="590.073px" viewBox="0 0 590.074 590.073" style="enable-background:new 0 0 590.074 590.073;fill:fillColor"     xml:space="preserve"><g>   <path d="M537.804,174.688c0-44.772-33.976-81.597-77.552-86.12c-12.23-32.981-43.882-56.534-81.128-56.534     c-16.304,0-31.499,4.59-44.514,12.422C319.808,17.949,291.513,0,258.991,0c-43.117,0-78.776,31.556-85.393,72.809       c-3.519-0.43-7.076-0.727-10.71-0.727c-47.822,0-86.598,38.767-86.598,86.598c0,2.343,0.172,4.638,0.354,6.933      c-24.25,15.348-40.392,42.333-40.392,73.153c0,27.244,12.604,51.513,32.273,67.387c-0.086,1.559-0.239,3.107-0.239,4.686        c0,47.822,38.767,86.598,86.598,86.598c14.334,0,27.817-3.538,39.723-9.696c16.495,11.848,40.115,26.67,51.551,23.715       c0,0,4.255,65.905,3.337,82.64c-1.75,31.843-11.303,67.291-18.025,95.979h104.117c0,0-15.348-63.954-16.018-85.307      c-0.669-21.354,6.675-60.675,6.675-60.675l36.118-37.36c13.903,9.505,30.695,14.908,48.807,14.908      c44.771,0,81.597-34.062,86.12-77.639c32.98-12.23,56.533-43.968,56.533-81.214c0-21.994-8.262-41.999-21.765-57.279        C535.71,195.926,537.804,185.561,537.804,174.688z M214.611,373.444c6.942-6.627,12.766-14.372,17.212-22.969l17.002,35.62      C248.816,386.096,239.569,390.179,214.611,373.444z M278.183,395.438c-8.798,1.597-23.782-25.494-34.416-47.517     c11.791,6.015,25.102,9.477,39.254,9.477c3.634,0,7.201-0.296,10.72-0.736C291.006,374.286,286.187,393.975,278.183,395.438z         M315.563,412.775c-20.35,5.651-8.167-36.501-2.334-60.904c4.218-1.568,8.301-3.413,12.183-5.604       c2.343,17.786,10.069,33.832,21.516,46.521C337.011,401.597,325.593,409.992,315.563,412.775z"/></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>';

        /*data = JSON.parse(data);
                    let mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                        maxZoom: 18,
                        id: 'mapbox/streets-v11',
                        accessToken: data.accessToken
                    });*/

        /* let osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            'attribution': 'Kartendaten &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Mitwirkende',
            'useCache': true
        });*/

        /* let stramen = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 2,
            maxZoom: 20,
            ext: 'png',
        });
 */
        let CartoDB_PositronNoLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            minZoom: 2,
            maxZoom: 20
        });

        var CartoDB_PositronOnlyLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            minZoom: 2,
            maxZoom: 20,
            pane: "labels"
        });

        /* var Stamen_TonerLabels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 2,
            maxZoom: 20,
            ext: 'png',
            pane: "labels"
        }); */

        /*var groupedOverlays = {
            "Landmarks": {
                "Motorways": motorways,
                "Cities": cities
            },
            "Points of Interest": {
                "Restaurants": restaurants
            }
        };*/

        this.control = L.control.groupedLayers({
            /*      "OSM": osm, */
            /* "Stramen": stramen, */
            /* CartoDB: CartoDB_PositronNoLabels */
        }, this.overlayMaps, { collapsed: true });

        //obj.control = L.control.layers(, obj.overlayMaps, { collapsed: false });

        let addAllCountries = this.addAllCountries;

        //CartoDB_PositronNoLabels.addTo(this.mymap);
        /* Stamen_TonerLabels.addTo(this.mymap); */
        CartoDB_PositronOnlyLabels.addTo(this.mymap);

        this.control.addTo(this.mymap);

        fetch("/UN_Worldmap_FeaturesToJSON10percentCorrected.json")
            .then(res => res.json())
            .then(data => {
                if (addAllCountries) {

                    /* this.countryClusterLayer = L.markerClusterGroup({
                        maxClusterRadius: 2 * this.rmax,
                        iconCreateFunction: this.defineClusterIcon.bind(this), //this is where the magic happens
                        chunkedLoading: true
                    }); */

                    this.countryClusterLayer = L.markerClusterGroup({
                        iconCreateFunction: this.defineClusterIconThreat.bind(this),
                        chunkedLoading: true,
                        tree: "CLUSTER",
                        type: "Cluster"
                    });

                    //this.control.addOverlay(this.countryClusterLayer, 'Cluster', "Countries");

                    this.allCountries = L.geoJson(data, {
                        style: {
                            /*fill: "rgba(255, 0, 0, 0.3)",
                            color: "rgb(255, 0, 0)",*/
                            opacity: 0.1,
                            fillOpacity: 0.65,
                            strokeWidth: "2px"
                        },
                        onEachFeature: (feature, layer) => {
                            if (feature.properties) {
                                let popupText = feature.properties.ROMNAM + "<br>" + feature.properties.MAPLAB;
                                layer.bindPopup(popupText);

                                let color = "rgb(255,0,0)";

                                layer.setStyle({
                                    'fillColor': color,
                                    'color': color
                                });

                                /*  layer.on('mouseover', function () {
                                     this.setStyle({
                                         'fillColor': '#0000ff',
                                         "color": '#0000ff'
                                     });
                                 });
     
                                 layer.on('mouseout', function () {
                                     this.setStyle({
                                         'fillColor': color,
                                     });
                                 }); */
                            }
                        }
                    });
                    this.allCountriesLayer = this.control.addOverlay(this.allCountries, this.diversity ? "Diversity" : "Threat", "Additional");

                    this.allCountries.addTo(this.mymap);
                    this.countryClusterLayer.addTo(this.mymap);
                }

                this.countriesData = data;
                setTimeout(this.processTreeQueue(), 10);
            });

        /*$.post("/getMusicalChairs", function (data) {
            data = JSON.parse(data);
     
            let locationMapping = {};
            for (let orchestra of data.orchestras) {
                let found = false;
                let country = orchestra.country;
                let city = orchestra.city;
     
                for (let location of data.locations) {
                    if (location.location.includes(city + ",") && (location.location.includes(country) || country === "United States")) {
                        locationMapping = pushOrCreate(locationMapping, country, { city, location, cert: 100 });
                        found = true;
                        break;
                    } else if (location.location.includes(city + ",")) {
                        locationMapping = pushOrCreate(locationMapping, country, { city, location, cert: 80 });
                        found = true;
                        break;
                    }
                }
                if (found === false) {
                    //console.log("NOT MATCHED", city +" : "+ country);
                }
            }
     
            console.log(locationMapping);
        });*/

        if (this.addHotSpots) {
            fetch("/hotspots_2011_polygons-2.json")
                .then(res => res.json())
                .then(function (data) {
                    function filterByType(feature) {
                        if (feature.properties.TYPE !== "outer_limit") return true;
                    }

                    let hotSpots = L.geoJson(data, {
                        style: {
                            fill: "rgba(255, 0, 0)",
                            color: "rgb(255, 0, 0)",
                            opacity: 0.5,
                            fillOpacity: 0.5,
                            strokeWidth: 2,
                            stroke: null
                        },
                        filter: filterByType,
                        onEachFeature: (feature, layer) => {
                            if (feature.properties) {
                                layer.bindPopup(feature.properties.NAME);
                            }

                            layer.on('mouseover', function () {
                                this.setStyle({
                                    'fillColor': '#0000ff',
                                    "color": '#0000ff'
                                });
                            });
                            layer.on('mouseout', function () {
                                this.setStyle({
                                    'fillColor': '#ff0000',
                                    'color': '#ff0000'
                                });
                            });
                        }
                    });

                    this.control.addOverlay(hotSpots, "Biodiversity Hot Spots", "Additional");

                }.bind(this));
        }

        let addEcos = this.addEcoregions;
        fetch("/wwf_terr_ecos_Project_Featur10percentCorrected.json")
            .then(res => res.json())
            .then(data => {
                function filterByEco(feature) {
                    if (parseInt(feature.properties.BIOME) !== 98) return true;
                }

                let eco = L.geoJson(data, {
                    style: {
                        /*fill: "rgba(255, 0, 0, 0.3)",
                        color: "rgb(255, 0, 0)",*/
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
                            layer.bindPopup(popupText);

                            let color = "rgba(255,255,255,0.0)";

                            if (biom === 98) {
                                color = "rgb(255,255,255)";
                            } else {
                                color = watermarkColorSheme[biom];
                            }
                            //color = rgbToRGBA(color, 0.8);

                            layer.setStyle({
                                'fillColor': color,
                                'color': color
                            });

                            layer.on('mouseover', function () {
                                this.setStyle({
                                    'fillColor': '#0000ff',
                                    "color": '#0000ff'
                                });
                            });

                            layer.on('mouseout', function () {
                                this.setStyle({
                                    'fillColor': color,
                                    'color': color
                                });
                            });
                        }
                    }
                });
                this.ecoData = data;

                if (addEcos) {
                    this.control.addOverlay(eco, "Terrestrial Ecoregions", "Additional");
                }
            });


        fetch("/capitals.geo.json")
            .then(res => res.json())
            .then(data => {
                this.capitalsData = data;
                this.capitals = {};
                this.capitalsData.features.forEach(function (element, index) {
                    this.capitals[element.properties.iso2] = element;
                }.bind(this));
            });

        /* fetch("/intersectionsOfEcoAndCountries.geo.json")
            .then(res => res.json())
            .then(data => {
                this.intersections = data;
            });
        */
        this.addTreeCountries("HeatMap", []);
    }

    defineFeature(feature, latlng) {
        var categoryVal = feature.options[categoryField],
            iconVal = feature.options[iconField];
        var myClass = 'marker category-' + categoryVal.replaceSpecialCharacters() + ' icon-' + iconVal.replaceSpecialCharacters();

        var myIcon = L.divIcon({
            className: myClass,
            //iconSize: null
        });

        var myIcon = feature.getIcon();

        myIcon.options.className = myClass;

        let treeName = feature.options.tree;
        return L.marker(latlng, { icon: myIcon, tree: treeName, color: this.trees[treeName] });
    }

    defineFeaturePopup(feature, layer) {
        /* var props = feature.properties,
             fields = metadata.fields,
             popupContent = '';
     
         popupFields.map(function(key) {
             if (props[key]) {
                 var val = props[key],
                     label = fields[key].name;
                 if (fields[key].lookup) {
                     val = fields[key].lookup[val];
                 }
                 popupContent += '<span class="attribute"><span class="label">' + label + ':</span> ' + val + '</span>';
             }
         });
         popupContent = '<div class="map-popup">' + popupContent + '</div>';
         layer.bindPopup(popupContent, { offset: L.point(1, -2) });*/
    }
    defineClusterIcon(cluster) {
        var children = cluster.getAllChildMarkers();
        let data = d3.nest().key(function (d) { return d.options[categoryField]; }).entries(children, d3.map);
        let n = children.length; //Get number of markers in cluster
        let strokeWidth = 1; //Set clusterpie stroke width
        let r = Math.min(this.rmax - 2 * strokeWidth - (n < 10 ? 12 : n < 100 ? 8 : n < 1000 ? 4 : 0), this.rmax); //Calculate clusterpie radius...
        let iconDim = (r + strokeWidth) * 2; //...and divIcon dimensions (leaflet really want to know the size)

        let cacheKey = data.reduce((prev, curr) => prev + (curr.key + curr.values.length), "");

        let html;
        if (Object.keys(this.treeClusterCache).includes(cacheKey)) {
            html = this.treeClusterCache[cacheKey];
        } else {
            //bake some svg markup
            html = this.bakeThePie({
                data: data,
                valueFunc: function (d) { return d.values.length; },
                strokeWidth: 2,
                outerRadius: r,
                innerRadius: r - 8,
                pieClass: 'cluster-pie',
                pieLabel: n,
                pieLabelClass: 'marker-cluster-pie-label',
                strokeColor: function (d) { /**/ return treeColors[d.data.key]; },
                color: function (d) { /**/ return rgbToRGBA(treeColors[d.data.key], 0.75); },
                pathClassFunc: function (d) {
                    return "category-path category-" + d.data.key.replaceSpecialCharacters();
                },
                pathTitleFunc: function (d) { return d.data.key + ' (' + d.data.values.length + ' accident' + (d.data.values.length != 1 ? 's' : '') + ')'; }
            });

            this.treeClusterCache[cacheKey] = html;
        }
        //Create a new divIcon and assign the svg markup to the html property
        let myIcon = new L.DivIcon({
            html: html,
            className: 'marker-cluster',
            iconSize: new L.Point(iconDim, iconDim)
        });
        return myIcon;
    }

    /*function that generates a svg markup for the pie chart*/
    bakeThePie(options) {
        /*data and valueFunc are required*/
        if (!options.data || !options.valueFunc) {
            return '';
        }
        var data = options.data,
            valueFunc = options.valueFunc,
            r = options.outerRadius ? options.outerRadius : 28, //Default outer radius = 28px
            rInner = options.innerRadius ? options.innerRadius : r - 10, //Default inner radius = r-10
            strokeWidth = options.strokeWidth ? options.strokeWidth : 1, //Default stroke is 1
            pathClassFunc = options.pathClassFunc ? options.pathClassFunc : function () { return ''; }, //Class for each path
            pathTitleFunc = options.pathTitleFunc ? options.pathTitleFunc : function () { return ''; }, //Title for each path
            pieClass = options.pieClass ? options.pieClass : 'marker-cluster-pie', //Class for the whole pie
            pieLabel = options.pieLabel ? options.pieLabel : d3.sum(data, valueFunc), //Label for the whole pie
            pieLabelClass = options.pieLabelClass ? options.pieLabelClass : 'marker-cluster-pie-label', //Class for the pie label
            color = options.color ? options.color : "red",
            strokeColor = options.strokeColor ? options.strokeColor : "red",

            origo = (r + strokeWidth), //Center coordinate
            w = origo * 2, //width and height of the svg element
            h = w,
            donut = d3.pie(),
            arc = d3.svg.arc().innerRadius(rInner).outerRadius(r);

        let div = document.createElementNS("http://www.w3.org/1999/xhtml", "div");

        //Create an svg element
        var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        //Create the pie chart
        var vis = d3.select(svg)
            .data([data])
            .attr('class', pieClass)
            .attr('width', w + 2)
            .attr('height', h + 2)
            .style('position', "absolute");

        var arcs = vis.selectAll('g.arc')
            .data(donut.value(valueFunc))
            .enter().append('svg:g')
            .attr('class', 'arc')
            .attr('transform', 'translate(' + origo + ',' + origo + ')');

        /*         let arc2 = d3.svg.arc().innerRadius(r-2).outerRadius(r).startAngle(45 * (Math.PI/180)) //converting from degs to radians
            .endAngle(3); //just radians;
     
                arcs.append('svg:path')
                    .attr('fill', "rgba(0,0,0,0.8)")
                    .attr('stroke', "rgba(0,0,0,0.5)")
                    .attr('transform', "translate(2,2)")
                    .attr('d', arc2);*/


        arcs.append('svg:path')
            .attr('class', pathClassFunc)
            .attr('stroke-width', strokeWidth)
            .attr('fill', color)
            .attr('stroke', strokeColor)
            .attr('background', color)
            .attr('border-color', color)
            .attr('d', arc)
            .append('svg:title')
            .text(pathTitleFunc);

        var svg2 = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        //Create the pie chart
        var vis2 = d3.select(svg2)
            .attr('class', pieClass + " text")
            .attr('width', w + 2)
            .attr('height', h + 2)
            .style('position', "absolute");

        vis2.append('text')
            .attr('x', origo)
            .attr('y', origo)
            .attr('class', pieLabelClass + "text")
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .text(pieLabel);

        div.appendChild(svg);
        div.appendChild(svg2);

        //Return the svg-markup rather than the actual element
        return serializeXmlNode(div);
    }


    defineClusterIconThreat(cluster) {
        var children = cluster.getAllChildMarkers();
        let data = children.map(e => e.options.data).flat();
        data = d3.nest().key(function (d) { return d.abbreviation; }).entries(data, d3.map);
        let n = children.length; //Get number of markers in cluster
        let strokeWidth = 1; //Set clusterpie stroke width
        let r = Math.min(this.rmax - 2 * strokeWidth - (n < 10 ? 12 : n < 100 ? 8 : n < 1000 ? 4 : 0), this.rmax); //Calculate clusterpie radius...
        let iconDim = (r + strokeWidth) * 2; //...and divIcon dimensions (leaflet really want to know the size)

        let cacheKey = data.reduce((prev, curr) => prev + (curr.key + curr.values.length), "");

        let html;
        if (Object.keys(this.treeClusterCache).includes(cacheKey)) {
            html = this.treeClusterCache[cacheKey];
        } else {
            //bake some svg markup
            html = this.bakeTheThreatPie({
                data: data,
                valueFunc: function (d) { return d.values.length; },
                strokeWidth: 2,
                outerRadius: r,
                innerRadius: r - 8,
                pieClass: 'cluster-pie',
                pieLabel: n,
                pieLabelClass: 'marker-cluster-pie-label',
                strokeColor: function (d) { return d.data.values[0].getColor(); },
                color: function (d) { return d.data.values[0].getColor(); },
                /* pathClassFunc: function (d) { return "category-path category-" + d.data.key.replaceSpecialCharacters(); },
                pathTitleFunc: function (d) { return d.data.key + ' (' + d.data.values.length + ' accident' + (d.data.values.length != 1 ? 's' : '') + ')'; } */
            });

            this.treeClusterCache[cacheKey] = html;
        }
        //Create a new divIcon and assign the svg markup to the html property
        let myIcon = new L.DivIcon({
            html: html,
            className: 'marker-cluster',
            iconSize: new L.Point(iconDim, iconDim)
        });
        return myIcon;
    }

    /*function that generates a svg markup for the pie chart*/
    bakeTheThreatPie(options) {
        /*data and valueFunc are required*/
        if (!options.data || !options.valueFunc) {
            return '';
        }
        var data = options.data,
            valueFunc = options.valueFunc,
            r = options.outerRadius ? options.outerRadius : 28, //Default outer radius = 28px
            rInner = options.innerRadius ? options.innerRadius : r - 10, //Default inner radius = r-10
            strokeWidth = options.strokeWidth ? options.strokeWidth : 1, //Default stroke is 1
            pathClassFunc = options.pathClassFunc ? options.pathClassFunc : function () { return ''; }, //Class for each path
            pathTitleFunc = options.pathTitleFunc ? options.pathTitleFunc : function () { return ''; }, //Title for each path
            pieClass = options.pieClass ? options.pieClass : 'marker-cluster-pie', //Class for the whole pie
            pieLabel = options.pieLabel ? options.pieLabel : d3.sum(data, valueFunc), //Label for the whole pie
            pieLabelClass = options.pieLabelClass ? options.pieLabelClass : 'marker-cluster-pie-label', //Class for the pie label
            color = options.color,
            origo = (r + strokeWidth), //Center coordinate
            w = origo * 2, //width and height of the svg element
            h = w,
            donut = d3.pie(),
            arc = d3.arc().innerRadius(rInner).outerRadius(r);


        let div = document.createElementNS("http://www.w3.org/1999/xhtml", "div");

        //Create an svg element
        var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        //Create the pie chart
        var vis = d3.select(svg)
            .data([data])
            .attr('class', pieClass)
            .attr('width', w + 2)
            .attr('height', h + 2)
            .style('position', "absolute");

        var arcs = vis.selectAll('g.arc')
            .data(donut.value(valueFunc))
            .enter().append('svg:g')
            .attr('class', 'arc')
            .attr('transform', 'translate(' + origo + ',' + origo + ')');

        /*         let arc2 = d3.svg.arc().innerRadius(r-2).outerRadius(r).startAngle(45 * (Math.PI/180)) //converting from degs to radians
            .endAngle(3); //just radians;
     
                arcs.append('svg:path')
                    .attr('fill', "rgba(0,0,0,0.8)")
                    .attr('stroke', "rgba(0,0,0,0.5)")
                    .attr('transform', "translate(2,2)")
                    .attr('d', arc2);*/


        arcs.append('svg:path')
            .attr('class', pathClassFunc)
            .attr('stroke-width', strokeWidth)
            .attr('fill', color)
            .attr('stroke', color)
            .attr('background', color)
            .attr('border-color', color)
            .attr('d', arc)
            .append('svg:title')
            .text(pathTitleFunc);

        var svg2 = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        //Create the pie chart
        var vis2 = d3.select(svg2)
            .attr('class', pieClass + " text")
            .attr('width', w + 2)
            .attr('height', h + 2)
            .style('position', "absolute");

        vis2.append('text')
            .attr('x', origo)
            .attr('y', origo)
            .attr('class', pieLabelClass + "text")
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .text(pieLabel);

        div.appendChild(svg);
        div.appendChild(svg2);

        //Return the svg-markup rather than the actual element
        return serializeXmlNode(div);
    }

    processTreeQueue() {
        let length = this.treeQueue.length;
        this.treeQueue = this.treeQueue.reverse();
        for (let i = 0; i < length; i++) {
            let [treeName, countries] = this.treeQueue.pop();
            this.addTreeLayer(treeName);
        }
    }

    processTreeExportQueue() {
        let length = this.treeExportQueue.length;
        this.treeExportQueue = this.treeExportQueue.reverse();
        for (let i = 0; i < length; i++) {
            let [treeName, iexports] = this.treeExportQueue.pop();
            this.addTreeExportLayer(treeName);
        }
    }

    processTreeCoordinateQueue() {
        let length = this.treeCoordinateQueue.length;
        this.treeCoordinateQueue = this.treeCoordinateQueue.reverse();
        for (let i = 0; i < length; i++) {
            let [treeName, coordinates] = this.treeCoordinateQueue.pop();
            this.addTreeCoordinateControl(treeName);
        }
    }

    /* getAddedSpecies() {
        return this.trees
    } */

    addTreeCountries(treeName, countries, speciesCountries = null) {

        let index = Object.keys(this.trees).length;
        let add = false;


        if (Object.keys(this.trees).includes(treeName)) {
            if (!this.trees[treeName].hasOwnProperty("countries")) {
                add = true;
            }
        } else {
            let color = colorBrewerScheme8Qualitative[index];
            treeColors[treeName] = color;
            this.trees[treeName] = { index: index, color: color };
            add = true;
        }

        if (add) {
            this.trees[treeName].countries = countries;
            if (speciesCountries !== null) {
                this.trees[treeName].speciesCountries = speciesCountries;
            }

            if (this.diversity) {
                this.updateDiversity(this.diversity, this.diversityMode, this.diversityAttribute);
            }
            else {
                /* this.updateRegions(); */
                this.updateHeatMap(true, this.treeThreatType);
            }

            //if (this.countriesData && this.intersections !== undefined) {
            if (this.countriesData) {
                this.addTreeLayer(treeName);
            } else {
                this.treeQueue.push([treeName, countries]);
            }
        }
    }

    removeSpeciesCountries(treeName) {
        if (this.trees.hasOwnProperty(treeName)) {
            for (let layer of this.control._layers) {
                if (layer.name === "Countries" && layer.group.name === treeName) {
                    delete this.trees[treeName].countries;
                    this.mymap.removeLayer(this.trees[treeName].treeCountriesLayer);
                    this.control.removeLayer(this.trees[treeName].treeCountriesLayer);
                }
            }
        }
    }

    removeSpeciesEcoRegions(treeName) {
        if (this.trees.hasOwnProperty(treeName)) {
            for (let layer of this.control._layers) {
                if (layer.name === "Eco Regions" && layer.group.name === treeName) {
                    /* delete this.trees[treeName].countries; */
                    this.mymap.removeLayer(this.trees[treeName].treeEcosLayer);
                    this.control.removeLayer(this.trees[treeName].treeEcosLayer);

                    delete this.activeSpecies[treeName];
                }
            }
        }
    }

    getTrees() {
        return this.trees;
    }

    addExportCountries(treeName, iexports) {
        let index = Object.keys(this.trees).length;
        if (Object.keys(this.trees).includes(treeName)) {
            this.trees[treeName].exports = iexports;
        } else {
            let color = colorBrewerScheme8Qualitative[index];
            treeColors[treeName] = color;
            this.trees[treeName] = { exports: iexports, index: index, color: color };
        }

        if (this.countriesData) {
            this.addTreeExportControl(treeName);
        } else {
            this.treeExportQueue.push([treeName, iexports]);
        }
    }

    addTreeCoordinates(treeName, coordinates) {
        let index = Object.keys(this.trees).length;
        if (Object.keys(this.trees).includes(treeName)) {
            this.trees[treeName].coordinates = coordinates;
        } else {
            let color = colorBrewerScheme8Qualitative[index];
            treeColors[treeName] = color;
            this.trees[treeName] = { coordinates: coordinates, index: index, color: color };
        }

        if (this.countriesData) {
            this.addTreeCoordinateControl(treeName, coordinates.length);
        } else {
            this.treeCoordinateQueue.push([treeName, coordinates]);
        }
    }

    addTreeCoordinateControl(treeName, count) {
        if (!this.treeClusterLayer) {
            let treeColor = this.trees[treeName].color;

            this.treeClusterLayer = L.markerClusterGroup({
                maxClusterRadius: 2 * this.rmax,
                iconCreateFunction: this.defineClusterIcon.bind(this), //this is where the magic happens
                chunkedLoading: true
            });

            this.control.addOverlay(this.treeClusterLayer, "Trees", "Cluster", this.cluster.bind(this), this.decluster.bind(this));
        }

        let treeColor = this.trees[treeName].color;
        let newtreeClusterLayer = L.markerClusterGroup({
            iconCreateFunction: function (cluster) {
                return L.divIcon({ html: '<div class="clusterIcon" style="background-color: ' + treeColor.replace(")", ",0.75)") + '; border-color: ' + treeColor + '; transform: scale(' + Math.min(2.5, (0.7 + 0.01 * (cluster.getChildCount() / 20))) + ')">' + cluster.getChildCount() + '</div>' });
            },
            tree: treeName,
            type: "Cluster"
        });

        if (this.trees[treeName].treeClusterLayer === undefined) {
            this.trees[treeName].treeClusterLayer = newtreeClusterLayer;

            this.control.addOverlay(newtreeClusterLayer, `Trees (${count})`, treeName);
        }
        this.colorLayerGroups();
    }

    addTreeExportControl(treeName) {
        let treeColor = this.trees[treeName].color;
        let newtreeClusterLayer = L.markerClusterGroup({
            iconCreateFunction: function (cluster) {
                return L.divIcon({ html: '<div class="clusterIcon" style="background-color: ' + treeColor.replace(")", ",0.75)") + '; border-color: ' + treeColor + '; transform: scale(' + Math.min(2.5, (0.7 + 0.01 * (cluster.getChildCount() / 20))) + ')">' + cluster.getChildCount() + '</div>' });
            },
            tree: treeName,
            type: "Cluster"
        });

        this.trees[treeName].treeExportLayer = newtreeClusterLayer;

        this.addTreeExportLayer(treeName);

        this.control.addOverlay(newtreeClusterLayer, "Exports", treeName);
        this.colorLayerGroups();
    }

    cluster() {
        this.isTreeClustered = true;

        for (let treeName of Object.keys(this.trees).values()) {
            let layer = this.trees[treeName].treeClusterLayer;
            if (layer.options.type === "Cluster") {
                layer.eachLayer(function (marker) {
                    if (marker.options.type === "treeMarker") {
                        layer.removeLayer(marker);
                        let newMarker = this.defineFeature(marker, marker.getLatLng());
                        this.treeClusterLayer.addLayer(newMarker);
                    }
                }.bind(this));
            }
        }
    }

    decluster() {
        this.isTreeClustered = false;

        let already = [];

        this.treeClusterLayer.eachLayer(function (marker) {
            let treeName = marker.options.tree;

            if (!already.includes(treeName)) {
                already.push(treeName);
            }

            this.treeClusterLayer.removeLayer(marker);
        }.bind(this));

        for (let treeName of already.values()) {
            this.addTreeCoordinateLayer(treeName);
        }
    }

    removeTreeCoordinateLayer(treeName) {
        let layerGroup = this.isTreeClustered ? this.treeClusterLayer : this.trees[treeName].treeClusterLayer;

        if (layerGroup !== undefined) {
            layerGroup.eachLayer(function (marker) {
                if (marker.options.tree === treeName) {
                    layerGroup.removeLayer(marker);
                }
            });
        }

        this.colorLayerGroups();
    }

    addTreeCoordinateLayer(treeName) {

        let coordinates = this.trees[treeName].coordinates;

        let treeColor = this.trees[treeName].color;
        //let treeColor = "rgba(255,0,0)";

        let layerGroup = this.isTreeClustered ? this.treeClusterLayer : this.trees[treeName].treeClusterLayer;

        let iconUrl = encodeURI("data:image/svg+xml," + this.achenSvgString).replace('#', '%23').replace("fillColor", treeColor.replace(")", ",0.8)"));

        let markerIcon = L.icon({
            iconUrl: iconUrl,
            iconSize: [18, 18], // size of the icon
            //iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
            iconAnchor: [9, 18], // point of the icon which will correspond to marker's location
            //popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
            popupAnchor: [0, -18], // point from which the popup should open relative to the iconAnchor
        });

        for (let i = 0; i < coordinates.length; i++) {
            let marker = L.marker([coordinates[i][0], coordinates[i][1]], { icon: markerIcon, tree: treeName, type: "treeMarker" });
            marker.bindPopup(treeName).openPopup();
            layerGroup.addLayer(marker);
        }
    }

    addTreeExportLayer(treeName) {
        let iexports = this.trees[treeName].exports;

        let treeColor = this.trees[treeName].color !== undefined ? this.trees[treeName].color : "rgb(200,200,200)";

        let layerGroup = this.trees[treeName].treeExportLayer;

        let iconUrl = encodeURI("data:image/svg+xml," + this.achenSvgString).replace('#', '%23').replace("fillColor", treeColor.replace(")", ",0.8)"));

        let markerIcon = L.icon({
            iconUrl: iconUrl,
            iconSize: [18, 18], // size of the icon
            //iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
            iconAnchor: [9, 18], // point of the icon which will correspond to marker's location
            //popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
            popupAnchor: [0, -18], // point from which the popup should open relative to the iconAnchor
        });

        /*let processed = [];*/

        for (let isoCountry in iexports) {
            let countryExports = iexports[isoCountry];

            for (let entry of countryExports.values()) {
                if (isoCountry === "XX") {
                    let marker = L.marker(L.latLng([0, 0]), { tree: treeName, type: "ExportMarker" });
                    layerGroup.addLayer(marker);
                } else {
                    /*if (!processed.includes(isoCountry)) {*/
                    let coords = this.capitals[isoCountry].geometry.coordinates;
                    let marker = L.marker(L.latLng(coords[1], coords[0]), { tree: treeName, type: "ExportMarker" });
                    layerGroup.addLayer(marker);

                    if (entry.Importer !== "XX") {
                        coords = this.capitals[entry.Importer].geometry.coordinates;
                        marker = L.marker(L.latLng(coords[1], coords[0]), { tree: treeName, type: "ExportMarker" });
                        layerGroup.addLayer(marker);
                    }

                    /*processed.push(isoCountry);*/
                    /*}*/
                }


                /*L.geoJson(this.capitals, {
                    filter: function(e) {
                        if (e.properties.iso2 === isoCountry || countryExports.map(entry => entry.Importer).includes(e.properties.iso2)) {
                            if (!processed.includes(e.properties.iso2)) {
                                processed.push(e.properties.iso2);
                                return true;
                            }
                        }
                    },
                    onEachFeature: function(feature, layer) {
                        layer.bindPopup(isoCountry).openPopup();
                        layerGroup.addLayer(layer);
                    }
                });*/
            }
        }
    }

    addDistribution(species, data) {
        let dist = L.geoJson(data, {
            clickable: false,
            style: {
                color: "blue",
                /* opacity: opacity,
                fillOpacity: opacity */
            }
        });

        this.control.addOverlay(dist, "Distribution", species);
    }

    addTreeLayer(treeName) {

        /* let stripes = new L.Pattern({width: 1000, height: 1000}); 
        stripes.addTo(this.mymap)
        
        this.stripes[treeName] = stripes;
     
        let stripeSel = d3.select("#" + this._id).select("svg").select("defs").selectAll("pattern");
        let selSize = stripeSel.size();
     
        if(stripeSel) {
            let sel = stripeSel._groups[0][selSize - 1];
            d3.select(sel).html('<image href="'+this.speciesImageLinks[treeName]+'" x="0" y="0" width="1000" height="1000" preserveAspectRatio="xMinYMin slice" />');
        } */

        let countries = [...new Set(this.trees[treeName].countries)];

        if (this.trees[treeName].speciesCountries !== undefined) {
            countries = Object.values(this.trees[treeName].speciesCountries).flat();
        }

        let newRegions = [];
        let countryNames = [];
        let intersections = this.intersections;

        function filterByName(feature) {
            if (countryNames.includes(feature.properties.ROMNAM)) {
                return true;
            }
        }

        function filterByIntersection(feature) {
            if (newRegions.includes(feature.id)) {
                return true;
            }
        }

        let sumCat = this.getTreeThreatLevel(treeName, this.treeThreatType);
        let color;
        if (this.treeThreatType) {
            color = getCitesColor(sumCat);
        }
        else {
            color = dangerColorMap[sumCat].bg;
        }

        let regions = this.control._layers.filter(layer => layer.name === "Countries" && layer.group.name !== "HeatMap");
        let activeRegions = regions.filter(layer => layer.layer._map !== null);
        let opacity = 1 / (activeRegions.length + 1);
        opacity = scaleValue(opacity, [0, 1], [1, 3]) / 3;

        let newFeatureSet = [];
        let notFound = [];

        let mapCountries = {};
        let diversityCountries = [];

        for (let country of countries) {
            let hit = false;
            for (let feature of this.countriesData.features) {
                if (country === feature.properties.MAPLAB || country === feature.properties.ROMNAM || country === feature.properties.bgciName) {
                    if (mapCountries.hasOwnProperty(feature.properties.ISO3CD)) {
                        if (feature.properties.Shape_Area > mapCountries[feature.properties.ISO3CD].properties.Shape_Area) {
                            mapCountries[feature.properties.ISO3CD] = feature;
                        }
                    }
                    else {
                        mapCountries[feature.properties.ISO3CD] = feature;
                    }
                    diversityCountries.push(feature.id);

                    hit = true;
                    // if (intersections.hasOwnProperty(feature.properties.ROMNAM)) {
                    //    newRegions.push(...intersections[feature.properties.ROMNAM]);
                    //}
                }
            }

            if (hit === false) {
                notFound.push(country);
            }
        }

        /* this.diversityRegions[treeName] = [...new Set(newRegions)]; */
        this.diversityCountries[treeName] = diversityCountries;

        /* var country = L.geoJson(
            {
                "type": "FeatureCollection",
                "features": Object.values(mapCountries)
            }
            , {
                //filter: filterByName,
                clickable: false,
                style: {
                    fill: color,
                    color: color,
                    opacity: opacity,
                    fillOpacity: opacity,
                    //fill: "url(#img1)"
                }
            }); */

        /*  let ecos = L.geoJson(this.ecoData, {
             filter: filterByIntersection,
             style: {
                 fill: color,
                 fillColor: color,
                 color: "grey",
                 opacity: opacity,
                 fillOpacity: opacity
             }
         }); */

        /* this.control.addOverlay(country, "Countries", treeName);
        this.mymap.addLayer(country); */

        //this.trees[treeName].treeCountriesLayer = country;

        /* this.control.addOverlay(ecos, "Eco Regions", treeName);
        this.trees[treeName].treeEcosLayer = ecos; */

        this.activeSpecies[treeName] = true;

        if (this.diversity) {
            this.updateDiversity(this.diversity, this.diversityMode, this.diversityAttribute);
        }
        else {
            /* this.updateRegions(); */
            this.updateHeatMap(true, this.treeThreatType);
        }
    }

    setDiversity(div) {
        this.diversity = div;
    }

    setTreeThreatType(tree) {
        this.treeThreatType = tree;
    }

    highlight(speciesNames) {
        this.hoverSpecies = speciesNames;

        if (this.diversity) {
            this.updateDiversity(this.diversity, this.diversityMode, this.diversityAttribute);
        }
        else {
            /* this.updateRegions(); */
            this.updateHeatMap(true, this.treeThreatType);
        }
    }

    colorLayerGroups() {
        for (let key of Object.keys(this.trees)) {
            let color = this.trees[key].color;
            /* $(".leaflet-control-layers-group-name").filter(function () {
                return $(this).text() === key;
            }).first().closest(".leaflet-control-layers-group").css("border", "3px solid " + rgbToRGBA(color, 0.8)).css("background-color", rgbToRGBA(color, 0.5)); */
        }
    }

    updateHeatMap(active) {

        let treeThreatType = this.treeThreatType ? "economically" : "ecologically";

        this.countryClusterLayer.clearLayers();

        let heatMapData = {};
        let countryHeat = {};

        let scale = {};
        let maxCount = 0;

        for (let speciesName of Object.keys(this.activeSpecies)) {
            if (this.hoverSpecies.length > 0 && !this.hoverSpecies.includes(speciesName)) {
                continue;
            }

            let speciesRegions = this.diversityCountries[speciesName];
            for (let region of speciesRegions) {
                let threat = this.getTreeThreatLevel(speciesName, treeThreatType);
                if (!scale.hasOwnProperty(threat.getHashCode())) {
                    scale[threat.getHashCode()] = { threat, count: 1 };
                }
                else {
                    scale[threat.getHashCode()].count += 1;
                }
                maxCount++;

                pushOrCreate(heatMapData, region.toString(), threat);
            }
        }

        /* for (let country of Object.keys(heatMapData)) {
            let countryData;
            countryData = heatMapData[country].sort((a, b) => a.numvalue - b.numvalue); */
        //countryHeat[country] = countryData.length % 2 !== 0 ? countryData[Math.floor(countryData.length / 2)] : countryData[Math.floor(countryData.length / 2) - 1];
        /* } */

        let countries = Object.keys(heatMapData);

        scale = Object.values(scale).sort((a, b) => b.threat.sort - a.threat.sort).map(e => { return { scaleColor: e.threat.getColor(), scaleValue: e.threat.abbreviation + " (" + e.count + ")", scalePercentage: e.count / maxCount } });

        this.setDiversityScale(scale);

        function getZeroStyle() {
            return {
                color: "rgb(244, 244, 244)",
                stroke: 1,
                opacity: 1,
                weight: 1,
                fillOpacity: 1,
                fillColor: "white"
            };
        }

        function calculateStlyle(feature) {

            if (heatMapData.hasOwnProperty(feature.id)) {

                let val = heatMapData[feature.id].length;

                let countryData = heatMapData[feature.id.toString()].sort((a, b) => a.numvalue - b.numvalue);;
                let median = countryData.length % 2 !== 0 ? countryData[Math.floor(countryData.length / 2)] : countryData[Math.floor(countryData.length / 2) - 1];

                return {
                    color: "white",
                    stroke: 1,
                    opacity: 1,
                    weight: 1,
                    fillOpacity: 1,
                    fillColor: median.getColor(),
                };
            }
            else {
                return getZeroStyle();
            }
        }

        if (this.allCountries !== undefined) {
            this.allCountries.eachLayer(layer => {
                layer.setStyle(
                    calculateStlyle(layer.feature)
                )

                //calculate the clusterthreatpie
                if (heatMapData.hasOwnProperty(layer.feature.id)) {
                    let data = heatMapData[layer.feature.id];

                    this.countryClusterLayer.addLayer(L.marker(layer.getBounds().getCenter(), {
                        data: data,
                        icon: new L.DivIcon({
                            html: this.bakeTheThreatPie({
                                data: data,
                                valueFunc: function (d) { return 3; },
                                strokeWidth: 2,
                                outerRadius: 10,
                                innerRadius: 0,
                                pieClass: 'cluster-pie',
                                pieLabel: heatMapData[layer.feature.id].length,
                                pieLabelClass: 'marker-cluster-pie-label',
                                color: function (d) { return d.data.getColor(); }
                            }),
                            className: 'marker-cluster',
                            iconSize: new L.Point(8, 8)
                        })
                    }));
                }
            });
        }
    }

    updateRegions(add = 0) {
        return;
        let regions = this.control._layers.filter(layer => layer.name === "Countries" && layer.group.name !== "HeatMap");
        let activeRegions = regions.filter(layer => layer.layer._map !== null);

        let opacity = 1 / (activeRegions.length + add);
        opacity = scaleValue(opacity, [0, 1], [1, 3]) / 3;

        for (let layer of activeRegions) {
            let layerTreeName = layer.group.name;
            if (this.trees[layerTreeName].treeCountriesLayer) {
                this.trees[layerTreeName].treeCountriesLayer.setStyle({ fillOpacity: opacity, opacity: opacity });
            }
        }
    }

    removeAllCountrieLayers() {
        return;
        let oldregions = this.control._layers.filter(layer => layer.name === "Countries" && layer.group.name !== "HeatMap");
        for (let layer of oldregions) {
            let layerTreeName = layer.group.name;
            this.mymap.removeLayer(this.trees[layerTreeName].treeCountriesLayer);
        }
    }

    updateDiversity(active, diversityMode, diversityAttribute) {
        this.diversity = active;
        this.diversityMode = diversityMode;
        this.diversityAttribute = diversityAttribute;

        let heatMapData = {};

        for (let speciesName of Object.keys(this.activeSpecies)) {
            if (this.hoverSpecies.length > 0 && !this.hoverSpecies.includes(speciesName)) {
                continue;
            }

            let speciesRegions = this.diversityCountries[speciesName];

            for (let region of speciesRegions) {
                if (this.diversityMode) {
                    pushOrCreate(heatMapData, region.toString(), speciesName);
                }
                else {
                    let threat = this.getTreeThreatLevel(speciesName, this.treeThreatType);
                    if (threat === diversityAttribute || threat === iucnToDangerMap[diversityAttribute]) {
                        pushOrCreate(heatMapData, region.toString(), threat);
                    }
                }
            }
        }

        let heatMapLength = Object.keys(heatMapData).length;
        let heatMapMax = Math.max(...Object.values(heatMapData).map(e => e.length));

        let scaleSteps = Math.min(10, heatMapMax);
        let scale = [];

        let treeThreatType = this.treeThreatType;

        for (let i = 0; i < (scaleSteps + 1); i++) {
            let scaleValue = i * (heatMapMax / scaleSteps);
            let scaleOpacity = scaleValue / heatMapMax;

            let scaleColor = "";
            if (diversityMode) {
                scaleColor = "rgba(5,74,145," + scaleOpacity + ")";
            }
            else {
                scaleColor = treeThreatType ? getCitesColor(diversityAttribute) : (dangerColorMap[iucnToDangerMap[diversityAttribute]]).bg;

                let rgbValues = scaleColor.replace("rgb", "").replace("(", "").replace(")", "").split(",").map(e => parseInt(e.trim()));

                let hsvValues = colorsys.rgb_to_hsv(...rgbValues);
                scaleColor = colorsys.hsvToHex({ h: hsvValues.h, s: scaleOpacity * hsvValues.s, v: hsvValues.v });
            }

            scale.push({ scaleColor, scaleValue: Math.ceil(scaleValue) });
        }

        let getScaledIndex = function (value) {
            let index = 0;
            for (let e of scale) {

                if (value < e.scaleValue) {
                    return index;
                }
                index++;
            }
            return Math.min(scale.length - 1, index);
        }

        this.setDiversityScale(scale);

        function getZeroStyle() {
            return {
                color: "rgb(244, 244, 244)",
                stroke: 1,
                opacity: 1,
                weight: 1,
                fillOpacity: 1,
                fillColor: "white"
            };
        }

        function calculateStlyle(feature) {

            if (heatMapData.hasOwnProperty(feature.id)) {

                let a = heatMapData[feature.id];
                const aCount = Object.fromEntries(new Map([...new Set(a)].map(
                    x => [x, a.filter(y => y === x).length]
                )));
                let maxKey = Object.keys(aCount).reduce((a, b) => aCount[a] > aCount[b] ? a : b);

                if (diversityMode) {
                    return {
                        color: "white",
                        stroke: 1,
                        opacity: 1,
                        weight: 1,
                        fillOpacity: heatMapData[feature.id].length / heatMapMax,
                        fillColor: "rgb(5, 74, 145)",
                    };
                }
                else {

                    let val = heatMapData[feature.id].length;
                    let scaledIndex = getScaledIndex(val);

                    return {
                        color: "white",
                        stroke: 1,
                        opacity: 1,
                        weight: 1,
                        fillOpacity: 1,
                        fillColor: scale[scaledIndex].scaleColor,
                    };
                }
            }
            else {
                return getZeroStyle();
            }
        }

        if (this.allCountries !== undefined) {
            this.allCountries.eachLayer(layer => {
                layer.setStyle(
                    calculateStlyle(layer.feature)
                )
            });
        }
    }

    overlayadd(event) {
        let treeName = event.group.name;
        let typ = event.name;

        if (treeName !== "Cluster") {
            if (typ.includes("Trees")) {
                this.addTreeCoordinateLayer(treeName);
            }

            /* if (typ === "Countries") {
                this.updateRegions();
                this.updateDiversity();
            } */
        }
    }

    overlayremove(event) {
        let treeName = event.group.name;
        let typ = event.name;

        if (treeName !== "Cluster") {
            switch (typ) {
                case "Trees":
                    this.removeTreeCoordinateLayer(treeName);
                    break;

                case "Countries":
                    /* let regions = this.control._layers.filter(layer => layer.name === "Countries");
                    let activeRegions = regions.filter(layer => layer.layer._map !== null);
     
                    let opacity = 1 / (activeRegions.length - 1);
     
                    for (let layer of activeRegions) {
                        if (this.trees[layer.group.name].treeCountriesLayer) {
                            this.trees[layer.group.name].treeCountriesLayer.setStyle({ fillOpacity: opacity, opacity: opacity });
                        }
                    } */
                    /* this.updateRegions(-1); */
                    /* this.updateDiversity(); */
                    break;

                default:
                    break;
            }
        }
    }
}

export default MapHelper;