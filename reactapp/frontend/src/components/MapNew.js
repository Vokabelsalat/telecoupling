import { useEffect, useState } from "react";
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
  LayersControl,
  Marker
} from "react-leaflet";

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
  const { width, height } = props;

  const [countriesGeoJson, setCountriesGeoJson] = useState(null);
  const [ecoRegionsGeoJson, setEcoRegionsGeoJson] = useState(null);
  const [orchestraGeoJson, setOrchestraGeoJson] = useState(null);

  useEffect(() => {
    fetch("/UN_Worldmap-2.json")
      .then((res) => res.json())
      .then(function (geojson) {
        setCountriesGeoJson(geojson);
      });

    fetch("/WWF_Terrestrial_Ecoregions2017-3.json")
      .then((res) => res.json())
      .then(function (geojson) {
        setEcoRegionsGeoJson(geojson);
      });

    fetch("/Orchestras_worldwide.json")
      .then((res) => res.json())
      .then(function (geojson) {
        setOrchestraGeoJson(geojson);
      });
  }, []);

  console.log("orchestraGeoJson", orchestraGeoJson);

  return (
    <div style={{ width: "100%", height: `${height}px` }}>
      <MapContainer
        center={center}
        zoom={1}
        maxZoom={10}
        scrollWheelZoom={false}
        style={{ height: height }}
      >
        <LayersControl position="topright">
          {/* <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        /> */}
          {/* <Circle center={center} pathOptions={fillBlueOptions} radius={200} />
        <CircleMarker
          center={[51.51, -0.12]}
          pathOptions={redOptions}
          radius={20}
        >
          <Popup>Popup in CircleMarker</Popup>
        </CircleMarker>
        <Polyline pathOptions={limeOptions} positions={polyline} />
        <Polyline pathOptions={limeOptions} positions={multiPolyline} />
        <Polygon pathOptions={purpleOptions} positions={polygon} />
        <Polygon pathOptions={purpleOptions} positions={multiPolygon} />
        <Rectangle bounds={rectangle} pathOptions={blackOptions} /> */}

          {/* <Polygon pathOptions={purpleOptions} positions={multiPolygon} /> */}
          {countriesGeoJson && (
            <LayersControl.Overlay name="Countries" checked>
              <GeoJSON
                key="countriesgeojson"
                pathOptions={(element) => {
                  return fillBlueOptions;
                }}
                data={countriesGeoJson}
              />
            </LayersControl.Overlay>
          )}

          {ecoRegionsGeoJson && (
            <LayersControl.Overlay name="Terrestical Ecoregions" checked>
              <GeoJSON
                key="ecoregionsgeojson"
                pathOptions={(element) => {
                  return purpleOptions;
                }}
                data={ecoRegionsGeoJson}
              />
            </LayersControl.Overlay>
          )}

          {/* {orchestraGeoJson && orchestraGeoJson.features.length > 0 && ( */}
          {/*  <MarkerClusterGroup>
            <Marker position={[49.8397, 24.0297]} />
            <Marker position={[52.2297, 21.0122]} />
            <Marker position={[51.5074, -0.0901]} />
          </MarkerClusterGroup> */}
          {/* )} */}

          {/* {orchestraGeoJson && (
            <LayersControl.Overlay name="Orchestras Worldwide">
              <GeoJSON
                key="ecoregionsgeojson"
                pathOptions={(element) => {
                  return purpleOptions;
                }}
                data={orchestraGeoJson}
              />
            </LayersControl.Overlay>
          )}*/}
        </LayersControl>
      </MapContainer>
    </div>
  );
}
