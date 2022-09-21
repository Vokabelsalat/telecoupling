import TreeMap from "./TreeMapNew";
import { useState } from "react";

export default function TreeMapView(props) {
  const { width, height, data, instrument, genus, family, kingdom } = props;

  console.log(data, kingdom);

  const [rootNode, setRootNode] = useState();

  const filterData = (i_data, i_filter) => {
    if (
      i_data.filterDepth === i_filter.data.filterDepth &&
      i_data.name === i_filter.data.name
    ) {
      return i_data;
    } else {
      if (i_data.children && i_data.filterDepth < i_filter.data.filterDepth) {
        let test = i_data.children.map((e) => {
          return filterData(e, i_filter);
        });
        return test.find(
          (element) => element !== null && element !== undefined
        );
      } else {
        return null;
      }
    }
  };

  let tmpData = data;

  if (rootNode) {
    tmpData = filterData(data, rootNode);
  }

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "white" }}>
      <TreeMap
        width={width}
        height={height}
        data={tmpData}
        setRootNode={setRootNode}
      />
    </div>
  );
}
