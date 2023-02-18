import { padding } from "@mui/system";
import { forwardRef, useMemo } from "react";
// import { useOnParent } from "./useOnParent";

const Content = forwardRef((props, ref) => {
  const {
    title,
    type,
    text,
    image,
    quote,
    fontStyle,
    alignment,
    height,
    width
  } = props;

  const { titlePrimary, titleSecondary, textPrimary, textSecondary } =
    (function () {
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
    })();

  const { textAlign, blockText } = (function () {
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
  })();

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
        return (
          <div
            style={{
              textAlign: "center",
              verticalAlign: "middle",
              padding: "10px",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column"
            }}
          >
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
        padding: "8px",
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
