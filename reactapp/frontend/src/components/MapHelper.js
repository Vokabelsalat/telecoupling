import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as groupedLayers from 'leaflet-groupedlayercontrol';
import * as d3 from 'd3';
import { rgbToRGBA, serializeXmlNode, watermarkColorSheme, colorBrewerScheme8Qualitative } from '../utils/utils';

var categoryField = "tree";
var iconField = "tree";
var treeColors = {};
var values = [];
var biomes = ["Tropical & Subtropical Moist Broadleaf Forests", "Tropical & Subtropical Dry Broadleaf Forests", "Tropical & Subtropical Coniferous Forests", "Temperate Broadleaf & Mixed Forests", "Temperate Conifer Forests", "Boreal Forests/Taiga", "Tropical & Subtropical Grasslands, Savannas & Shrublands", "Temperate Grasslands, Savannas & Shrublands", "Flooded Grasslands & Savannas", "Montane Grasslands & Shrublands", "Tundra", "Mediterranean Forests, Woodlands & Scrub", "Deserts & Xeric Shrublands", "Mangroves"];

class MapHelper {
    constructor(id) {
        if (!MapHelper.instance) {
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

            MapHelper.instance = this;
            this.init();
            /* this.initTest(); */
        }
        else {
            console.log("GET");
        }

        return MapHelper.instance;
    }

    init() {
        this.mymap = L.map("mapid", {
            worldCopyJump: true
        }).setView([39.74739, -105], 2);
        //this.mymap = L.map("mapid").setView([51.505, -0.09], 13);

        this.achenSvgString = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"  width="590.074px" height="590.073px" viewBox="0 0 590.074 590.073" style="enable-background:new 0 0 590.074 590.073;fill:fillColor"     xml:space="preserve"><g>   <path d="M537.804,174.688c0-44.772-33.976-81.597-77.552-86.12c-12.23-32.981-43.882-56.534-81.128-56.534     c-16.304,0-31.499,4.59-44.514,12.422C319.808,17.949,291.513,0,258.991,0c-43.117,0-78.776,31.556-85.393,72.809       c-3.519-0.43-7.076-0.727-10.71-0.727c-47.822,0-86.598,38.767-86.598,86.598c0,2.343,0.172,4.638,0.354,6.933      c-24.25,15.348-40.392,42.333-40.392,73.153c0,27.244,12.604,51.513,32.273,67.387c-0.086,1.559-0.239,3.107-0.239,4.686        c0,47.822,38.767,86.598,86.598,86.598c14.334,0,27.817-3.538,39.723-9.696c16.495,11.848,40.115,26.67,51.551,23.715       c0,0,4.255,65.905,3.337,82.64c-1.75,31.843-11.303,67.291-18.025,95.979h104.117c0,0-15.348-63.954-16.018-85.307      c-0.669-21.354,6.675-60.675,6.675-60.675l36.118-37.36c13.903,9.505,30.695,14.908,48.807,14.908      c44.771,0,81.597-34.062,86.12-77.639c32.98-12.23,56.533-43.968,56.533-81.214c0-21.994-8.262-41.999-21.765-57.279        C535.71,195.926,537.804,185.561,537.804,174.688z M214.611,373.444c6.942-6.627,12.766-14.372,17.212-22.969l17.002,35.62      C248.816,386.096,239.569,390.179,214.611,373.444z M278.183,395.438c-8.798,1.597-23.782-25.494-34.416-47.517     c11.791,6.015,25.102,9.477,39.254,9.477c3.634,0,7.201-0.296,10.72-0.736C291.006,374.286,286.187,393.975,278.183,395.438z         M315.563,412.775c-20.35,5.651-8.167-36.501-2.334-60.904c4.218-1.568,8.301-3.413,12.183-5.604       c2.343,17.786,10.069,33.832,21.516,46.521C337.011,401.597,325.593,409.992,315.563,412.775z"/></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>';

        let obj = this;

        /*data = JSON.parse(data);
                    let mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                        maxZoom: 18,
                        id: 'mapbox/streets-v11',
                        accessToken: data.accessToken
                    });*/

        let osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            'attribution': 'Kartendaten &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Mitwirkende',
            'useCache': true
        });

        let stramen = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20,
            ext: 'png'
        });

        /*var groupedOverlays = {
            "Landmarks": {
                "Motorways": motorways,
                "Cities": cities
            },
            "Points of Interest": {
                "Restaurants": restaurants
            }
        };*/

        obj.control = L.control.groupedLayers({
            "OSM": osm,
            "Stramen": stramen
        }, obj.overlayMaps, { collapsed: false });

        //obj.control = L.control.layers(, obj.overlayMaps, { collapsed: false });
        obj.control.addTo(obj.mymap);

        stramen.addTo(obj.mymap);

        fetch("/data/countries10m.geo.json")
            .then(res => res.json())
            .then(data => {

                obj.countriesData = data;

                setTimeout(obj.processTreeQueue(), 10);
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

        fetch("/data/hotspots_2011_polygons-2.json")
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

            }.bind(this))

        fetch("/data/Terrestrial_Ecoregions_World-4.json")
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

                this.control.addOverlay(eco, "Terrestrial Ecoregions", "Additional");
            });

        fetch("/data/capitals.geo.json")
            .then(res => res.json())
            .then(data => {
                this.capitalsData = data;
                this.capitals = {};
                this.capitalsData.features.forEach(function (element, index) {
                    this.capitals[element.properties.iso2] = element;
                }.bind(this));
            });
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
        let r = this.rmax - 2 * strokeWidth - (n < 10 ? 12 : n < 100 ? 8 : n < 1000 ? 4 : 0); //Calculate clusterpie radius...
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
                pathClassFunc: function (d) { return "category-path category-" + d.data.key.replaceSpecialCharacters(); },
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

    addTreeCountries(treeName, countries) {
        let index = Object.keys(this.trees).length;
        if (Object.keys(this.trees).includes(treeName)) {
            this.trees[treeName].countries = countries;
        } else {
            let color = colorBrewerScheme8Qualitative[index];
            treeColors[treeName] = color;
            this.trees[treeName] = { countries: countries, index: index, color: color };

            if (this.countriesData) {
                this.addTreeLayer(treeName);
            } else {
                this.treeQueue.push([treeName, countries]);
            }
        }
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

            if (this.countriesData) {
                this.addTreeCoordinateControl(treeName);
            } else {
                this.treeCoordinateQueue.push([treeName, coordinates]);
            }
        }
    }

    addTreeCoordinateControl(treeName) {
        if (!this.treeClusterLayer) {
            let treeColor = this.trees[treeName].color;

            this.treeClusterLayer = L.markerClusterGroup({
                maxClusterRadius: 2 * this.rmax,
                iconCreateFunction: this.defineClusterIcon.bind(this) //this is where the magic happens
            });

            this.control.addOverlay(this.treeClusterLayer, "Trees", "Cluster", this.cluster.bind(this), this.decluster.bind(this));
        }

        let treeColor = this.trees[treeName].color;
        let newtreeClusterLayer = L.markerClusterGroup({
            iconCreateFunction: function (cluster) {
                return L.divIcon({ html: '<div class="clusterIcon" style="background-color: ' + treeColor.replace(")", ",0.75)") + '; border-color: ' + treeColor + '; transform: scale(' + (1 + 0.05 * (cluster.getChildCount() / 20)) + ')">' + cluster.getChildCount() + '</div>' });
            },
            tree: treeName,
            type: "Cluster"
        });

        this.trees[treeName].treeClusterLayer = newtreeClusterLayer;

        this.control.addOverlay(newtreeClusterLayer, "Trees", treeName, this.addTreeCoordinateLayer.bind(this, treeName), this.removeTreeCoordinateLayer.bind(this, treeName));
        this.colorLayerGroups();
    }

    addTreeExportControl(treeName) {
        let treeColor = this.trees[treeName].color;
        let newtreeClusterLayer = L.markerClusterGroup({
            iconCreateFunction: function (cluster) {
                return L.divIcon({ html: '<div class="clusterIcon" style="background-color: ' + treeColor.replace(")", ",0.75)") + '; border-color: ' + treeColor + '; transform: scale(' + (1 + 0.05 * (cluster.getChildCount() / 20)) + ')">' + cluster.getChildCount() + '</div>' });
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

        let treeColor = this.trees[treeName].color;

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

    addTreeLayer(treeName) {
        let countries = this.trees[treeName].countries;

        function filterByName(feature) {
            if (countries.includes(feature.properties.name)) return true;
        }

        let color = this.trees[treeName].color;

        var country = L.geoJson(this.countriesData, {
            filter: filterByName,
            clickable: false,
            fillPattern: this.stripes,
            style: {
                fill: color,
                color: color,
                opacity: 0.5,
                fillOpacity: 0.5
            }
        });

        this.control.addOverlay(country, "Regions", treeName);

        this.colorLayerGroups();
    }

    colorLayerGroups() {
        for (let key of Object.keys(this.trees)) {
            let color = this.trees[key].color;
            /* $(".leaflet-control-layers-group-name").filter(function () {
                return $(this).text() === key;
            }).first().closest(".leaflet-control-layers-group").css("border", "3px solid " + rgbToRGBA(color, 0.8)).css("background-color", rgbToRGBA(color, 0.5)); */
        }
    }
}

export default MapHelper;