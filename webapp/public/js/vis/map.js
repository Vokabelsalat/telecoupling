class BGCIMap {
    constructor(id) {
        if (!BGCIMap.instance) {
            this._data = [];
            this._id = id;
            this.trees = {};
            this.treeQueue = [];
            this.treeCoordinateQueue = [];
            this.treeColor = {};

            BGCIMap.instance = this;
            this.init();
        }

        return BGCIMap.instance;
    }

    init() {
        this.mymap = L.map("mapid", {
            worldCopyJump: true
        }).setView([39.74739, -105], 2);
        //this.mymap = L.map("mapid").setView([51.505, -0.09], 13);

        this.achenSvgString = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"	 width="590.074px" height="590.073px" viewBox="0 0 590.074 590.073" style="enable-background:new 0 0 590.074 590.073;fill:fillColor"	 xml:space="preserve"><g>	<path d="M537.804,174.688c0-44.772-33.976-81.597-77.552-86.12c-12.23-32.981-43.882-56.534-81.128-56.534		c-16.304,0-31.499,4.59-44.514,12.422C319.808,17.949,291.513,0,258.991,0c-43.117,0-78.776,31.556-85.393,72.809		c-3.519-0.43-7.076-0.727-10.71-0.727c-47.822,0-86.598,38.767-86.598,86.598c0,2.343,0.172,4.638,0.354,6.933		c-24.25,15.348-40.392,42.333-40.392,73.153c0,27.244,12.604,51.513,32.273,67.387c-0.086,1.559-0.239,3.107-0.239,4.686		c0,47.822,38.767,86.598,86.598,86.598c14.334,0,27.817-3.538,39.723-9.696c16.495,11.848,40.115,26.67,51.551,23.715		c0,0,4.255,65.905,3.337,82.64c-1.75,31.843-11.303,67.291-18.025,95.979h104.117c0,0-15.348-63.954-16.018-85.307		c-0.669-21.354,6.675-60.675,6.675-60.675l36.118-37.36c13.903,9.505,30.695,14.908,48.807,14.908		c44.771,0,81.597-34.062,86.12-77.639c32.98-12.23,56.533-43.968,56.533-81.214c0-21.994-8.262-41.999-21.765-57.279		C535.71,195.926,537.804,185.561,537.804,174.688z M214.611,373.444c6.942-6.627,12.766-14.372,17.212-22.969l17.002,35.62		C248.816,386.096,239.569,390.179,214.611,373.444z M278.183,395.438c-8.798,1.597-23.782-25.494-34.416-47.517		c11.791,6.015,25.102,9.477,39.254,9.477c3.634,0,7.201-0.296,10.72-0.736C291.006,374.286,286.187,393.975,278.183,395.438z		 M315.563,412.775c-20.35,5.651-8.167-36.501-2.334-60.904c4.218-1.568,8.301-3.413,12.183-5.604		c2.343,17.786,10.069,33.832,21.516,46.521C337.011,401.597,325.593,409.992,315.563,412.775z"/></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g></svg>';

        let obj = this;

        $.post("/requestMapboxToken", function(data) {
            data = JSON.parse(data);
            /*            let mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
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
        });

        $.getJSON("/countries10m.geo.json", function(data) {
            obj.countriesData = data;

            setTimeout(obj.processTreeQueue(), 10);
        });
    }

    processTreeQueue() {
        let length = this.treeQueue.length;
        this.treeQueue = this.treeQueue.reverse();
        for (let i = 0; i < length; i++) {
            let [treeName, countries] = this.treeQueue.pop();
            this.addTreeLayer(treeName, colorBrewerScheme8Qualitative[i]);
        }
    }

    processTreeCoordinateQueue() {
        let length = this.processTreeCoordinateQueue.length;
        this.processTreeCoordinateQueue = this.processTreeCoordinateQueue.reverse();
        for (let i = 0; i < length; i++) {
            let [treeName, coordinates] = this.processTreeCoordinateQueue.pop();
            this.addTreeCoordinateLayer(treeName, colorBrewerScheme8Qualitative[i]);
        }
    }

    addTreeCountries(treeName, countries) {
        if (Object.keys(this.trees).includes(treeName)) {
            this.trees[treeName].countries = countries;
        } else {
            this.trees[treeName] = { countries: countries };
        }

        if (this.countriesData) {
            this.addTreeLayer(treeName);
        } else {
            this.treeQueue.push([treeName, countries]);
        }
    }

    addTreeCoordinates(treeName, coordinates) {
        if (Object.keys(this.trees).includes(treeName)) {
            this.trees[treeName].coordinates = coordinates;
        } else {
            this.trees[treeName] = { coordinates: coordinates };
        }

        if (this.countriesData) {
            this.addTreeCoordinateLayer(treeName);
        } else {
            this.processTreeCoordinateQueue.push([treeName, coordinates]);
        }
    }

    addTreeCoordinateLayer(treeName, color) {
        let coordinates = this.trees[treeName].coordinates;

        let treeColor = this.treeColor[treeName];
        var layerGroup = L.markerClusterGroup({
            iconCreateFunction: function(cluster) {
                return L.divIcon({ html: '<div class="clusterIcon" style="background-color: ' + treeColor.replace(")", ",0.75)") + '; border-color: ' + treeColor + '; transform: scale(' + (1 + 0.05 * (cluster.getChildCount() / 20)) + ')">' + cluster.getChildCount() + '</div>' });
            }
        });

        let iconUrl = encodeURI("data:image/svg+xml," + this.achenSvgString).replace('#','%23').replace("fillColor", treeColor.replace(")", ",0.8)"));

        let markerIcon = L.icon({
        	iconUrl: iconUrl,
            iconSize: [18, 75], // size of the icon
            iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
            popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
        });

        for (let i = 0; i < coordinates.length; i++) {
            let marker = L.marker([coordinates[i][0], coordinates[i][1]], {icon: markerIcon});
            layerGroup.addLayer(marker);
        }

        this.control.addOverlay(layerGroup, "Trees", treeName);

        this.colorLayerGroups();
    }

    addTreeLayer(treeName, color) {
        let countries = this.trees[treeName].countries;

        function filterByName(feature) {
            if (countries.includes(feature.properties.name)) return true;
        }

        var country = L.geoJson(this.countriesData, {
            filter: filterByName,
            clickable: false,
            style: {
                fill: color,
                color: color,
                opacity: 0.5,
                fillOpacity: 0.5
            }
        });

        this.control.addOverlay(country, "Regions", treeName);

        this.treeColor[treeName] = color;

        this.colorLayerGroups();
    }

    colorLayerGroups() {
        for (let key of Object.keys(this.treeColor)) {
            let color = this.treeColor[key];
            $(".leaflet-control-layers-group-name").filter(function() {
                return $(this).text() === key;
            }).first().closest(".leaflet-control-layers-group").css("border", "3px solid " + color.replace(")", ",0.8)")).css("background-color", color.replace(")", ",0.5)"));
        }
    }
}