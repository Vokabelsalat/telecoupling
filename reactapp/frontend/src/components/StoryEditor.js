import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { useEffect, useState, useMemo, useCallback } from "react";
import { getFlagEmoji, langUnicode } from "./Tooltip";
import { Link } from "react-router-dom";
import { json } from "d3";
import Story from "./Story/Story";
import { serialize, deserialize } from "react-serialize";

export default function SearchBar(props) {
  const {} = props;

  const [jsoned, setJsoned] = useState(null);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    var textareaValue = document.getElementById("myTextarea").value;
    /* for (let splitText of textareaValue.split(": (")) {
      const paraSplit = splitText.split(")");
      const last = paraSplit[paraSplit.length - 1];
      console.log(paraSplit, last);
    }
     */

    var obj = [
      { type: "text", text: "Test" },
      { type: "text", text: "Test" }
    ];
    /* var stringed = JSON.stringify(obj);
      console.log(stringed); */
    var jsoned = JSON.parse(textareaValue);
    console.log(jsoned);
    setJsoned(jsoned);
  }, []);

  const content = useMemo(() => {
    if (jsoned) {
      return <Story storyName="test" contents={jsoned}></Story>;
    } else {
      return (
        <div>
          <form>
            <label for="myTextarea">Enter some text:</label>
            <br />
            <textarea id="myTextarea" rows="4" cols="50"></textarea>
            <br />
            <button type="button" onClick={handleSubmit}>
              Submit
            </button>
          </form>
          {/* <textarea value={}></textarea> */}
        </div>
      );
    }
  }, [handleSubmit, jsoned]);

  return { ...content };
}
