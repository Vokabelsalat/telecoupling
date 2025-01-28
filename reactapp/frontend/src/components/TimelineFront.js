import { useEffect, useRef, useState, cloneElement } from "react";

export const createProxyPhoto = (dummyLink) => {
  if (dummyLink) {
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          overflow: "hidden",
          backgroundImage: `url(${dummyLink.link})`,
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
    );
  } else {
    return <></>;
  }
};

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
            backgroundImage: `url(${imageLink[0].link})`
          }}
        />
      ) : (
        dummyLink !== null && createProxyPhoto(dummyLink)
      )}
    </>
  );
}
