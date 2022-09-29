import TreeMap from "./TreeMapNew";
import { useState } from "react";

export default function TreeMapHeader(props) {
  const { species, genus, family, kingdom, filterTreeMap } = props;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        display: "grid",
        gridTemplateColumns: "auto auto auto auto auto",
        gridTemplateRows: "auto"
      }}
    >
      {kingdom && (
        <>
          <div
            style={{
              backgroundColor: "blue",
              color: "white",
              cursor: "pointer"
            }}
            onClick={() => {
              filterTreeMap(null);
            }}
          >
            Reset
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto",
              gridTemplateRows: "auto auto",
              cursor: "pointer"
            }}
            onClick={() => {
              filterTreeMap({ data: { name: kingdom, filterDepth: 1 } });
            }}
          >
            <div style={{ fontWeight: "bold" }}>Kingdom</div>
            <div style={{}}>{kingdom}</div>
          </div>
        </>
      )}
      {family && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto",
            gridTemplateRows: "auto auto",
            cursor: "pointer"
          }}
          onClick={() => {
            filterTreeMap({ data: { name: family, filterDepth: 2 } });
          }}
        >
          <div style={{ fontWeight: "bold" }}>Family</div>
          <div style={{}}>{family}</div>
        </div>
      )}
      {genus && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto",
            gridTemplateRows: "auto auto",
            cursor: "pointer"
          }}
          onClick={() => {
            filterTreeMap({ data: { name: genus, filterDepth: 3 } });
          }}
        >
          <div style={{ fontWeight: "bold" }}>Genus</div>
          <div style={{}}>{genus}</div>
        </div>
      )}
      {species && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto",
            gridTemplateRows: "auto auto",
            cursor: "pointer"
          }}
          onClick={() => {
            filterTreeMap({ data: { name: species, filterDepth: 4 } });
          }}
        >
          <div style={{ fontWeight: "bold" }}>Species</div>
          <div style={{}}>{species}</div>
        </div>
      )}
    </div>
  );
}
