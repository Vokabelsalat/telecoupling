class BGCIMap {
    constructor(id) {
        if (!BGCIMap.instance) {
            this._data = [];
            this._id = id;
            this.trees = {};
            this.treeQueue = [];
            this.treeCoordinateQueue = [];
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

            obj.control = L.control.layers({
                "OSM": osm,
                "Stramen": stramen
            }, obj.overlayMaps, { collapsed: false });
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
            this.treeCoordinateQueue.push([treeName, coordinates]);
        }
    }

    addTreeCoordinateLayer(treeName, color) {
        let coordinates = this.trees[treeName].coordinates;

        var layerGroup = L.layerGroup();

        for (let i = 0; i < coordinates.length; i++) {
            let marker = L.marker([coordinates[i][0], coordinates[i][1]]);
            layerGroup.addLayer(marker);
        }

        this.control.addOverlay(layerGroup, "<span style='color: black; padding:2px; background-color:" + color + "'>" + treeName + " Trees</span>");
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

        this.control.addOverlay(country, "<span style='color: black; padding:2px; background-color:" + color + "'>" + treeName + "</span>");
    }
}