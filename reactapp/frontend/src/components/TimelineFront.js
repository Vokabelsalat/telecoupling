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
              backgroundImage: `url(${dummyLink})`
            }}
          >
            <div
              className="dummyDiv"
              style={{
                height: "100%",
                writingMode: "unset",
                textOrientation: "unset",
                backgroundColor: "rgba(128, 128, 128, 0.26)",
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
