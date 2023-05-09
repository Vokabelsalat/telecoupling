import { minIndex } from "d3";
import { useState } from "react";

export default function TreeMapTile(props) {
  const { node, parentTop = 0, parentLeft = 0 } = props;

  const getMaxChild = (children) => {
    const sorted = children.sort((a, b) => {
      if (a.data.image && b.data.image) {
        return b.value - a.value;
      } else if (a.data.image && !b.data.image) {
        return -1;
      } else if (b.data.image && !a.data.image) {
        return 1;
      } else {
        return b.value - a.value;
      }
    });
    const max = sorted[0];
    if (max.children) {
      return getMaxChild(max.children);
    } else {
      return max;
    }
  };

  const max = node.children ? getMaxChild(node.children) : node;

  /* const speciesLevel =
    node.parent == null && node.children == null ? true : false; */
  const speciesLevel =
    node.data.mediaUrls != null && node.parent == null ? true : false;

  let content = <></>;

  const [visibleIndex, setVisibleIndex] = useState(0);

  if (speciesLevel === false) {
    content = (
      <img
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
        src={max.data.image}
      />
    );
  } else {
    content = (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          display: "flex"
        }}
      >
        {node.data.mediaUrls.map((entry, index) => {
          return (
            <img
              style={{
                display:
                  visibleIndex % node.data.mediaUrls.length === index
                    ? "block"
                    : "none",
                width: "auto",
                height: "100%"
              }}
              src={entry}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => {
            setVisibleIndex(visibleIndex - 1);
          }}
        >
          {"<"}
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => {
            setVisibleIndex(visibleIndex + 1);
          }}
        >
          {">"}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: node.x0 - parentLeft,
        top: node.y0 - parentTop,
        width: node.x1 - node.x0,
        height: node.y1 - node.y0,
        backgroundColor: "gray",
        border: "solid 1px black"
      }}
    >
      {content}
    </div>
  );
}
