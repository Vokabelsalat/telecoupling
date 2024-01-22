import { useEffect, useRef, useState, cloneElement } from "react";

export default function TimelineFront(props) {
  const { speciesName, imageLink, dummyLink } = props;

  return (
    <>
      {imageLink ? (
        <div
          style={{
            height: "100%",
            width: "100%",
            overflow: "hidden",
            backgroundImage: `url(${imageLink})`
          }}
        />
      ) : (
        dummyLink !== null && (
          <div
            style={{
              height: "100%",
              width: "100%",
              overflow: "hidden",
              backgroundImage: `url(${dummyLink})`,
              position: "relative"
            }}
          >
            <div
              className="proxyText"
              style={{
                fontSize: "small"
              }}
            >
              PROXY
            </div>
          </div>
        )
      )}
    </>
  );
}
