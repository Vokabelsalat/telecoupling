import { padding } from "@mui/system";
import { forwardRef, useMemo, useRef, useEffect } from "react";
import ReactAudioPlayer from "react-audio-player";
// import { useOnParent } from "./useOnParent";

const Content = forwardRef((props, ref) => {
  const {
    title,
    type,
    text,
    image,
    audio,
    quote,
    fontStyle,
    alignment,
    height,
    width,
    playAudio = false
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
              fontSize: "xxx-large",
              fontFamily: titlePrimary,
              padding: "10px",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {title}
          </div>
        );
      case "end":
        return (
          <div
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              fontSize: "xxx-large",
              fontFamily: titlePrimary,
              padding: "10px",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {title}
          </div>
        );
      case "fullSizeQuote":
        console.log(type, image);
        return (
          <div
            style={{
              //verticalAlign: "middle",
              display: "grid",
              gridTemplateColumns: "auto",
              gridTemplateRows: "auto auto auto",
              gap: "10px",
              padding: "10px",
              textAlign: textAlign,
              height: "100vh"
            }}
          >
            {image !== undefined && (
              <div
                style={{
                  width: image.width ? image.width : "50%",
                  justifySelf: textAlign,
                  marginBottom: "15px"
                }}
              >
                <div className="vignette-radial">
                  <img style={{ width: "100%" }} src={image.url}></img>
                </div>
              </div>
            )}
            <div
              style={{
                fontSize: "xxx-large",
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
      case "clear":
        return <></>;
      case "restart":
        return (
          <a style={{ textDecoration: "none", textAlign: textAlign }} href="#0">
            <span style={{ fontSize: "50px" }}>&#8682;</span>
            <br />
            Restart
          </a>
        );
      default:
        return <div>Nothin to see here...</div>;
    }
  }, [type, title, image, text]);

  return (
    <div
      ref={ref}
      className={`content`}
      style={{
        padding: "5%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: height ?? null,
        width: width ?? null
      }}
    >
      {html}
    </div>
  );
});

Content.displayName = "Content";

export default Content;
