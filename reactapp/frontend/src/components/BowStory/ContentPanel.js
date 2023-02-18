import { positions } from "@mui/system";
import { forwardRef } from "react";

const ContentPanel = forwardRef((props, ref) => {
  const { children } = props;

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        overflowY: "scroll"
      }}
    >
      {children}
    </div>
  );
});

ContentPanel.displayName = "ContentPanel";

export default ContentPanel;
