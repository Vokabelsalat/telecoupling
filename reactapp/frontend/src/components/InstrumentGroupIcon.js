import { useEffect, useRef, useState } from "react";

const groupToFileName = {
  Strings: "strings2.svg",
  Plucked: "plucked2.svg",
  Percussion: "percussion2.svg",
  Keyboard: "keyboard2.svg",
  Brasses: "brasses2.svg",
  Woodwinds: "woodwinds2.svg"
};

export default function InstrumentGroupIcon(props) {
  const { group, position } = props;

  const ref = useRef(null);

  const fileName = groupToFileName[group];

  const [transformString, setTransformString] = useState("");

  useEffect(() => {
    fetch("/" + fileName)
      .then((response) => response.text())
      .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
      .then((data) => {
        const iconData = data.querySelector("g");
        if (ref) {
          if (ref.current) {
            ref.current.appendChild(iconData);
          }
        }
      });
  }, [fileName]);

  useEffect(() => {
    const ownWidth = ref.current.getBBox().width;
    const ownHeight = ref.current.getBBox().height;

    console.log(position, ownWidth, ownHeight);

    setTransformString(`translate(${position.x} ${position.y})`);
  });

  return <g transform={`${transformString}`} ref={ref}></g>;
}
