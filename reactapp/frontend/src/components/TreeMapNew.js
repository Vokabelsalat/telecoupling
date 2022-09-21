import * as d3 from "d3";
import { useState } from "react";
import TreeMapLevel from "./TreeMapLevel";

export default function TreeMap(props) {
  const { width, height, data, setRootNode } = props;

  var root = d3.hierarchy(data).sum(function (d) {
    return d.value;
  }); // Here the size of each leave is given in the 'value' field in input data

  // Then d3.treemap computes the position of each element of the hierarchy
  d3.treemap().size([width, height]).padding(2)(root);

  return (
    <div
      style={{
        width: width,
        height: height,
        backgroundColor: "white"
      }}
    >
      {root.children &&
        root.children.map((node, index) => {
          return (
            <TreeMapLevel
              key={`treeMapLevel${node.data.name}${index}`}
              node={node}
              setRootNode={setRootNode}
            />
          );
        })}
    </div>
  );
}
