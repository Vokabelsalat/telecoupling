import { padding } from "@mui/system";
import { forwardRef, useMemo, useRef, useEffect } from "react";
import ReactAudioPlayer from "react-audio-player";
import { ImageSource } from "react-map-gl";
// import { useOnParent } from "./useOnParent";

export const Content = (props) => {
  const {
    title,
    authors,
    type,
    text,
    image,
    imageArray,
    audio,
    quote,
    fontStyle,
    alignment,
    height,
    width,
    playAudio = false,
    mobile = false
  } = props;

  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current != null) {
      if (playAudio) {
        audioRef.current.audioEl.current.play();
      } else {
        audioRef.current.audioEl.current.pause();
      }
    }
  }, [playAudio]);

  const { titlePrimary, titleSecondary, textPrimary, textSecondary } =
    useMemo(() => {
      switch (fontStyle) {
        case "classic":
        default:
          return {
            titlePrimary: "Great Vibes",
            titleSecondary: "Montserrat",
            textPrimary: "Libre Baskerville",
            textSecondary: "Source Sans Pro"
          };
      }
    }, [fontStyle]);

  const { textAlign, blockText } = useMemo(() => {
    switch (alignment) {
      case "centerBlockText":
        return { textAlign: "center", blockText: true };
      case "center":
        return { textAlign: "center", blockText: false };
      case "right":
        return { textAlign: "end" };
      case "left":
      default:
        return { textAlign: "start" };
    }
  }, [alignment]);

  const html = useMemo(() => {
    switch (type) {
      case "storyTitle":
        return (
          <div
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              padding: "10px",
              height: "100%",
              display: "grid",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexFlow: "column",
              gap: "5px"
            }}
          >
            <div
              style={{
                fontSize: "-webkit-xxx-large",
                fontFamily: titlePrimary
                //marginTop: "-50%"
              }}
            >
              {title}
            </div>
            {authors !== undefined && (
              <div style={{ fontFamily: titleSecondary, fontSize: "larger" }}>
                {authors}
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexFlow: "column"
              }}
            >
              <div
                style={{
                  fontSize: "initial",
                  fontFamily: titleSecondary,
                  alignSelf: "center"
                }}
              >
                Scroll to experience the story.
              </div>
              <div class="mouse-icon">
                <div class="wheel"></div>
              </div>
            </div>
          </div>
        );
      case "end":
        return (
          <div
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              fontSize: "-webkit-xxx-large",
              fontFamily: titlePrimary,
              padding: "10px",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {title}
          </div>
        );
      case "fullSizeQuote":
        return (
          <div
            style={{
              //verticalAlign: "middle",
              display: "grid",
              gridTemplateColumns: "auto",
              gridTemplateRows: "1fr 1fr auto",
              // gap: "10px",
              padding: "10px",
              textAlign: textAlign,
              height: "100%",
              alignItems: "center"
            }}
          >
            {image !== undefined && (
              <div
                className="vignette-radial"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  alignItems: "center",
                  backgroundImage: `url('${image.url}')`,
                  backgroundSize: "cover"
                }}
              ></div>
            )}
            <div>
              <div
                style={{
                  fontSize: "-webkit-xxx-large",
                  fontFamily: titlePrimary
                }}
              >
                {quote.text}
              </div>
              <div
                style={{
                  marginTop: "1em",
                  fontSize: "x-large",
                  fontFamily: titleSecondary
                }}
              >
                "{quote.translation}"
              </div>
              <div
                style={{
                  fontFamily: titleSecondary,
                  color: "gray",
                  marginTop: "1em",
                  fontSize: "large"
                }}
              >
                {quote.author}
              </div>
            </div>
            {audio !== undefined && (
              <div
                style={{
                  marginTop: "15px",
                  width: image.width ? image.width : "50%",
                  display: "grid",
                  gridTemplateColumns: "auto",
                  gridTemplateRows: "auto auto auto",
                  gap: "10px",
                  justifySelf: textAlign,
                  justifyItems: textAlign
                }}
              >
                <ReactAudioPlayer
                  ref={audioRef}
                  src={audio.url}
                  controls
                  preload="auto"
                />
                <div style={{ width: "100%", fontSize: "large" }}>
                  {audio.caption}
                </div>
                <div
                  className="copyrightQuote"
                  style={{ width: "100%", color: "gray" }}
                >
                  {audio.copyright}
                </div>
              </div>
            )}
          </div>
        );
      case "text":
        return (
          <div
            style={{
              //verticalAlign: "middle",
              display: "grid",
              gridTemplateColumns: "auto",
              gridTemplateRows: "auto auto auto",
              gap: "10px",
              padding: "10px",
              textAlign: textAlign
            }}
          >
            <div
              style={{
                fontSize: "large",
                fontFamily: textPrimary,
                marginBottom: "5px"
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "large",
                fontFamily: textSecondary,
                textAlign: blockText ? "justify" : "center"
              }}
            >
              {text}
            </div>
            {image !== undefined && (
              <div
                style={{
                  marginTop: "15px",
                  width: image.width ? image.width : "50%",
                  display: "grid",
                  gridTemplateColumns: "auto",
                  gridTemplateRows: "auto auto auto",
                  gap: "10px",
                  justifySelf: textAlign
                }}
              >
                <img style={{ width: "100%" }} src={image.url}></img>
                <div style={{ width: "100%", fontSize: "large" }}>
                  {image.caption}
                </div>
                <div
                  className="copyrightQuote"
                  style={{ width: "100%", color: "gray" }}
                >
                  {image.copyright}
                </div>
              </div>
            )}
            {imageArray !== undefined && (
              <div
                style={{
                  marginTop: "15px",
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: `${imageArray
                    .map((i) => {
                      return i.width ?? "auto";
                    })
                    .join(" ")}`,
                  gridTemplateRows: "auto auto auto",
                  gap: "10px",
                  justifySelf: textAlign
                }}
              >
                {imageArray.map((image, index) => {
                  return (
                    <>
                      <img
                        style={{
                          gridColumn: index + 1,
                          gridRow: 1,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover"
                        }}
                        src={image.url}
                      ></img>
                      <div
                        style={{
                          gridColumn: index + 1,
                          gridRow: 2,
                          width: "100%",
                          fontSize: "large"
                        }}
                      >
                        {image.caption}
                      </div>
                      <div
                        className="copyrightQuote"
                        style={{
                          width: "100%",
                          color: "gray",
                          gridColumn: index + 1,
                          gridRow: 3
                        }}
                      >
                        {image.copyright}
                      </div>
                    </>
                  );
                })}
              </div>
            )}
            {audio !== undefined && (
              <div
                style={{
                  marginTop: "15px",
                  display: "grid",
                  gridTemplateColumns: "auto",
                  gridTemplateRows: "auto auto auto",
                  gap: "10px",
                  justifySelf: textAlign,
                  justifyItems: textAlign
                }}
              >
                <ReactAudioPlayer
                  ref={audioRef}
                  src={audio.url}
                  controls
                  preload="auto"
                />
                <div style={{ width: "100%", fontSize: "large" }}>
                  {audio.caption}
                </div>
                <div
                  className="copyrightQuote"
                  style={{ width: "100%", color: "gray" }}
                >
                  {audio.copyright}
                </div>
              </div>
            )}
          </div>
        );
      case "clear":
        return <></>;
      case "restart":
        return (
          <a style={{ textDecoration: "none", textAlign: textAlign }} href="#0">
            <div style={{ color: "#ab6318", fontSize: "50px" }}>&#8682;</div>
            Restart the Story
          </a>
        );
      default:
        return <div>Nothin to see here...</div>;
    }
  });

  return (
    <div
      className={`content`}
      style={{
        padding: "5%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: height ?? "100%",
        width: width ?? "unset"
      }}
    >
      {html}
    </div>
  );
};

/* Content.displayName = "Content";

export default Content;
 */
