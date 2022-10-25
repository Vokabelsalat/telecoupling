import { replaceSpecialCharacters } from "../utils/utils";
import PieChartNew from "./PieChartNew";
import { useEffect, useState, useRef } from "react";
import maplibregl from "maplibre-gl";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Circle,
  Rectangle,
  Polygon,
  Popup,
  GeoJSON,
  LayersControl
} from "react-leaflet";

import ReactMapGL, {
  NavigationControl,
  ScaleControl,
  Source,
  Layer,
  Marker
} from "react-map-gl";

import MarkerClusterGroup from "react-leaflet-cluster";

const center = [51.505, -0.09];

const polyline = [
  [51.505, -0.09],
  [51.51, -0.1],
  [51.51, -0.12]
];

const multiPolyline = [
  [
    [51.5, -0.1],
    [51.5, -0.12],
    [51.52, -0.12]
  ],
  [
    [51.5, -0.05],
    [51.5, -0.06],
    [51.52, -0.06]
  ]
];

const polygon = [
  [51.515, -0.09],
  [51.52, -0.1],
  [51.52, -0.12]
];

const multiPolygon = [
  [
    [51.51, -0.12],
    [51.51, -0.13],
    [51.53, -0.13]
  ],
  [
    [51.51, -0.05],
    [51.51, -0.07],
    [51.53, -0.07]
  ]
];

const rectangle = [
  [51.49, -0.08],
  [51.5, -0.06]
];

/* const customIcon = new L.Icon({
  iconUrl: require("../images/location.svg").default,
  iconSize: new L.Point(40, 47)
}); */

// NOTE: iconCreateFunction is running by leaflet, which is not support ES6 arrow func syntax
// eslint-disable-next-line
const createClusterCustomIcon = function (cluster) {
  /* return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: L.point(33, 33, true)
  }); */
  return <></>;
};

const fillBlueOptions = { fillColor: "blue" };
const blackOptions = { color: "black" };
const limeOptions = { color: "lime" };
const purpleOptions = { color: "purple", fillColor: "white" };
const redOptions = { color: "red" };

export default function Map(props) {
  const {
    width,
    height,
    speciesCountries,
    colorBlind,
    getSpeciesThreatLevel,
    threatType
  } = props;

  const [countriesGeoJson, setCountriesGeoJson] = useState(null);
  const [ecoRegionsGeoJson, setEcoRegionsGeoJson] = useState(null);
  const [orchestraGeoJson, setOrchestraGeoJson] = useState(null);
  const [capitalsGeoJSON, setCapitalsGeoJSON] = useState(null);
  const [capitalsToISO, setCapitalsToISO] = useState(null);
  const [countriesDictionary, setCountriesDictionary] = useState(null);
  const [orchestrasToISO3, setOrchestrasToISO3] = useState(null);
  const [orchestraHeatMap, setOrchestraHeatMap] = useState(null);
  const [orchestraHeatMapMax, setOrchestraHeatMapMax] = useState(null);
  const [showOrchestra, setShowOrchestra] = useState(false);
  const [showCountries, setShowCountries] = useState(true);
  const [capitalThreatMarkers, setCapitalThreatMarkers] = useState(null);

  useEffect(() => {
    fetch("/UN_Worldmap-2.json")
      .then((res) => res.json())
      .then(function (geojson) {
        /* let tmpISOToCountries = {};
        let tmpCountriesToISO = {};
        for (let country of geojson.features) {
          console.log(country);
        } */
        setCountriesGeoJson(geojson);
      });

    fetch("/countryDictionary.json")
      .then((res) => res.json())
      .then(function (json) {
        /* let tmpISOToCountries = {};
        let tmpCountriesToISO = {}; */
        let tmpOrchestraToISO3 = {};
        for (let country of Object.values(json)) {
          tmpOrchestraToISO3[country["orchestraCountry"]] = country["ISO3"];
        }
        setCountriesDictionary(json);
        setOrchestrasToISO3(tmpOrchestraToISO3);
      });

    fetch("/WWF_Terrestrial_Ecoregions2017-3.json")
      .then((res) => res.json())
      .then(function (geojson) {
        setEcoRegionsGeoJson(geojson);
      });

    fetch("/POPP_capitals_FeaturesToJSON.json")
      .then((res) => res.json())
      .then(function (geojson) {
        let tmpCapToISO = {};
        for (let cap of geojson.features) {
          tmpCapToISO[cap["id"].toString()] = cap["properties"]["ISO3CD"];
        }
        setCapitalsToISO(tmpCapToISO);
        setCapitalsGeoJSON(geojson);
      });

    fetch("/Orchestras_worldwide.json")
      .then((res) => res.json())
      .then(function (geojson) {
        setOrchestraGeoJson(geojson);
      });
  }, []);

  /* 
  console.log("countries", countriesGeoJson);
  console.log("speciesCountries", speciesCountries);
  console.log("capitalsToISO", capitalsToISO);*/
  /* console.log("captials", capitalsGeoJSON);
  console.log("countriesDictionary", countriesDictionary); */

  useEffect(() => {
    if (orchestraGeoJson && orchestrasToISO3 && countriesGeoJson) {
      let tmpOrchestraHeatMap = {};
      let tmpOrchestraHeatMapMax = 0;
      for (let orchestra of orchestraGeoJson.features) {
        let iso = orchestrasToISO3[orchestra.properties.Country];
        if (tmpOrchestraHeatMap.hasOwnProperty(iso)) {
          tmpOrchestraHeatMap[iso] = tmpOrchestraHeatMap[iso] + 1;
        } else {
          tmpOrchestraHeatMap[iso] = 1;
        }

        if (tmpOrchestraHeatMap[iso] > tmpOrchestraHeatMapMax) {
          tmpOrchestraHeatMapMax = tmpOrchestraHeatMap[iso];
        }
      }

      for (let country of countriesGeoJson.features) {
        country.properties.orchstraCount =
          tmpOrchestraHeatMap[country.properties["ISO3CD"]] != null
            ? tmpOrchestraHeatMap[country.properties["ISO3CD"]]
            : 0;
      }

      setOrchestraHeatMap(tmpOrchestraHeatMap);
      /* console.log("tmpOrchestraHeatMapMax", tmpOrchestraHeatMapMax); */
      setOrchestraHeatMapMax(tmpOrchestraHeatMapMax);
      setCountriesGeoJson(countriesGeoJson);
      /* console.log("countriesGeoJson", countriesGeoJson); */
    }
  }, [orchestraGeoJson, orchestrasToISO3, countriesGeoJson]);

  const [countriesToSpecies, setCountriesToSpecies] = useState(null);

  useEffect(() => {
    const tmpIsoToSpecies = {};
    for (let species of Object.keys(speciesCountries)) {
      const countries = speciesCountries[species];
      for (let speciesCountry of countries) {
        for (let country of Object.values(countriesDictionary)) {
          if (Object.values(country).includes(speciesCountry)) {
            if (tmpIsoToSpecies.hasOwnProperty(country.ISO3)) {
              tmpIsoToSpecies[country.ISO3].push(species);
            } else {
              tmpIsoToSpecies[country.ISO3] = [species];
            }
          }
        }
      }
    }
    setCountriesToSpecies(tmpIsoToSpecies);
  }, [speciesCountries, countriesDictionary]);

  const mapRef = useRef(null);

  const mag1 = ["<", ["get", "FID"], 50];
  const mag2 = ["all", [">=", ["get", "FID"], 50], ["<", ["get", "FID"], 100]];
  const mag3 = ["all", [">=", ["get", "FID"], 100], ["<", ["get", "FID"], 150]];
  const mag4 = ["all", [">=", ["get", "FID"], 150], ["<", ["get", "FID"], 200]];
  const mag5 = [">=", ["get", "FID"], 200];

  const colors = ["#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c"];

  // objects for caching and keeping track of HTML marker objects (for performance)

  function updateMarkers() {
    const newMarkers = {};
    //const features = mapRef.current.querySourceFeatures("capitalssource");
    const features = mapRef.current.querySourceFeatures("threatCapitalsSource");
    //console.log(features);

    // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
    // and add it to the map if it's not there already
    for (const feature of features) {
      const coords = feature.geometry.coordinates;
      const props = feature.properties;
      if (!props.cluster) continue;
      const id = props.cluster_id;

      let data = Object.fromEntries(
        [
          ...new Set(
            props.countries.match(/.{1,3}/g).flatMap((e) => {
              return countriesToSpecies[e];
            })
          )
        ].map((spec) => {
          return [spec, {}];
        })
      );

      let marker = capitalThreatMarkers[id];
      if (!marker) {
        /* const el = createDonutChart(props); */
        const el = (
          <PieChartNew
            id={replaceSpecialCharacters(`cluster${id}PieChart`)}
            data={data}
            getThreatLevel={getSpeciesThreatLevel}
            threatType={threatType}
            colorBlind={colorBlind}
            size={70}
          />
        );
        marker = capitalThreatMarkers[id] = {
          element: el,
          lng: coords[0],
          lat: coords[1]
        };
      }
      newMarkers[id] = marker;

      //if (!markersOnScreen[id]) marker.addTo(mapRef.current);
    }
    // for every marker we've added previously, remove those that are no longer visible
    /* for (const id in markersOnScreen) {
      if (!newMarkers[id]) markersOnScreen[id].remove();
    } */
    setCapitalThreatMarkers(newMarkers);
  }

  function createDonutChart(props) {
    const offsets = [];
    const counts = [props.mag1, props.mag2, props.mag3, props.mag4, props.mag5];
    const countries = props.countries;
    let total = 0;
    for (const count of counts) {
      offsets.push(total);
      total += count;
    }
    const fontSize =
      total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16;
    const r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
    const r0 = Math.round(r * 0.6);
    const w = r * 2;

    /*     let html = `<div>

    for (let i = 0; i < counts.length; i++) {
      html += donutSegment(
        offsets[i] / total,
        (offsets[i] + counts[i]) / total,
        r,
        r0,
        colors[i]
      );
    }
    html += `<circle cx="${r}" cy="${r}" r="${r0}" fill="white" />
    <text dominant-baseline="central" transform="translate(${r}, ${r})">
    ${total.toLocaleString()}
    </text>
    </div>`; */

    /*    const el = document.createElement("div");
    el.innerHTML = html; */
    //return el.firstChild;

    return (
      <svg
        width={`${w}`}
        height={`${w}`}
        viewBox={`0 0 ${w} ${w}`}
        textAnchor="middle"
      >
        {Array.from({ length: counts.length }, (item, index) => index).map(
          (i) => {
            return donutSegment(
              offsets[i] / total,
              (offsets[i] + counts[i]) / total,
              r,
              r0,
              colors[i]
            );
          }
        )}
        <text dominant-baseline="central" transform={`translate(${r}, ${r})`}>
          {total.toLocaleString()}
        </text>
      </svg>
    );
  }

  function donutSegment(start, end, r, r0, color) {
    if (end - start === 1) end -= 0.00001;
    const a0 = 2 * Math.PI * (start - 0.25);
    const a1 = 2 * Math.PI * (end - 0.25);
    const x0 = Math.cos(a0),
      y0 = Math.sin(a0);
    const x1 = Math.cos(a1),
      y1 = Math.sin(a1);
    const largeArc = end - start > 0.5 ? 1 : 0;

    return (
      <path
        d={`M ${r + r0 * x0} ${r + r0 * y0} L ${r + r * x0} ${
          r + r * y0
        } A ${r} ${r} 0 ${largeArc} 1 ${r + r * x1} ${r + r * y1} L ${
          r + r0 * x1
        } ${r + r0 * y1} A ${r0} ${r0} 0 ${largeArc} 0 ${r + r0 * x0} ${
          r + r0 * y0
        }`}
        fill={`${color}`}
      />
    );
  }

  return (
    <div style={{ width: "100%", height: `${height}px` }}>
      <ReactMapGL
        ref={mapRef}
        reuseMaps
        mapLib={maplibregl}
        //initialViewState={mapViewport}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        //mapStyle="https://demotiles.maplibre.org/style.json"
        /* onMove={(e) => {
          setMapViewport({ ...e.viewState });
        }}
        onMoveEnd={() => {
          if (onMoveEnd) {
            onMoveEnd();
          }
        }} */
        onRender={() => {
          if (capitalsGeoJSON) {
            updateMarkers();
          }
        }}
      >
        <NavigationControl />
        <ScaleControl />
        {/*         <Source type="geojson" data={countriesGeoJson}>
          <Layer
            {...{
              id: "countries",
              type: "fill",
              paint: {
                "fill-outline-color": "purple",
                "fill-color": "purple",
                "fill-opacity": 0.5
              }
            }}
            />
          
            ["/", ["get", "population"], ["get", "sq-km"]],

          </Source> */}

        {orchestraHeatMap && orchestraHeatMapMax && showOrchestra && (
          <Source id="countriessource" type="geojson" data={countriesGeoJson}>
            <Layer
              {...{
                id: "countries",
                type: "fill",
                source: "countriessource",
                paint: {
                  "fill-color": [
                    "interpolate",
                    ["linear"],
                    ["get", "orchstraCount"],
                    0,
                    "rgba(0,0,0,0)",
                    orchestraHeatMapMax,
                    "rgba(0,0,255,0.8)"
                  ]
                }
              }}
            />
          </Source>
        )}

        {showOrchestra && (
          <Source
            type="geojson"
            id="capitalssource"
            data={capitalsGeoJSON}
            cluster={true}
            clusterMaxZoom={14}
          >
            <Layer
              {...{
                id: "orchestras",
                type: "circle",
                source: "capitalssource",
                filter: ["has", "point_count"],
                paint: {
                  "circle-color": "purple",
                  "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    5,
                    25,
                    20,
                    100,
                    30,
                    750,
                    35
                  ]
                }
              }}
            />

            <Layer
              {...{
                id: "orchestrasCount",
                type: "symbol",
                source: "capitalssource",
                filter: ["has", "point_count"],
                layout: {
                  "text-field": "{point_count_abbreviated}",
                  "text-size": 12
                }
              }}
            />

            <Layer
              {...{
                id: "unclustered-orchestras",
                type: "circle",
                source: "capitalssource",
                filter: ["!", ["has", "point_count"]],
                paint: {
                  "circle-color": "purple",
                  "circle-radius": 8,
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#fff"
                }
              }}
            />
          </Source>
        )}

        {/*    <Source type="geojson" data={ecoRegionsGeoJson}>
          <Layer
            {...{
              id: "ecoRegions",
              type: "fill",
              paint: {
                "fill-outline-color": "blue",
                "fill-color": "blue",
                "fill-opacity": 0.5
              }
            }}
          />
        </Source> */}
        {/* <Source
          type="geojson"
          id="orchestrassource"
          data={orchestraGeoJson}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer
            {...{
              id: "orchestras",
              type: "circle",
              source: "orchestrassource",
              filter: ["has", "point_count"],
              paint: {
                "circle-color": "purple",
                "circle-radius": [
                  "step",
                  ["get", "point_count"],
                  5,
                  25,
                  20,
                  100,
                  30,
                  750,
                  35
                ]
              }
            }}
          />

          <Layer
            {...{
              id: "orchestrasCount",
              type: "symbol",
              source: "orchestrassource",
              filter: ["has", "point_count"],
              layout: {
                "text-field": "{point_count_abbreviated}",
                "text-size": 12
              }
            }}
          />

          <Layer
            {...{
              id: "unclustered-orchestras",
              type: "circle",
              source: "orchestrassource",
              filter: ["!", ["has", "point_count"]],
              paint: {
                "circle-color": "purple",
                "circle-radius": 4,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#fff"
              }
            }}
          />
        </Source> */}

        {showCountries && (
          <Source
            type="geojson"
            id="threatCapitalsSource"
            data={capitalsGeoJSON}
            cluster={true}
            clusterRadius={50}
            clusterProperties={{
              countries: ["concat", ["get", "ISO3CD"]]
            }}
            /* clusterProperties={{
              // keep separate counts for each magnitude category in a cluster
              mag1: ["+", ["case", mag1, 1, 0]],
              mag2: ["+", ["case", mag2, 1, 0]],
              mag3: ["+", ["case", mag3, 1, 0]],
              mag4: ["+", ["case", mag4, 1, 0]],
              mag5: ["+", ["case", mag5, 1, 0]]
            }} */
          >
            <Layer
              {...{
                id: "threatCapitals",
                source: "threatCapitalsSource",
                type: "circle",
                filter: ["!=", "cluster", true],
                paint: {
                  "circle-color": colors[2],
                  "circle-radius": 12,
                  "circle-opacity": 0.8
                }
              }}
            />

            <Layer
              {...{
                id: "threatCapitals_labels",
                source: "threatCapitalsSource",
                type: "symbol",
                filter: ["!=", "cluster", true],
                layout: {
                  "text-field": "{point_count_abbreviated}",
                  "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                  "text-size": 10
                },
                paint: {
                  "text-color": "white"
                }
              }}
            />
          </Source>
        )}

        {capitalThreatMarkers &&
          Object.values(capitalThreatMarkers).map((element, index) => {
            return (
              <Marker
                key={`marker-${index}`}
                longitude={element.lng}
                latitude={element.lat}
                anchor="center"
              >
                {element.element}
              </Marker>
            );
          })}
      </ReactMapGL>
    </div>
  );
}
