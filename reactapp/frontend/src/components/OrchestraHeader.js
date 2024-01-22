export default function OrchestraHeader(props) {
  const {
    instrumentGroup,
    instrument,
    instrumentParts,
    instrumentPart,
    setInstrument,
    setInstrumentPart
  } = props;

  return (
    <div
      style={{
        width: "fit-content",
        backgroundColor: "white",
        display: "grid",
        gridTemplateColumns: "auto auto",
        gridTemplateRows: "auto",
        gridGap: "10px"
      }}
    >
      {instrumentGroup && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto",
              gridTemplateRows: "auto auto",
              cursor: "pointer",
              padding: "5px"
            }}
            onClick={() => {
              setInstrument(null);
              /* filterTreeMap({ data: { name: kingdom, filterDepth: 1 } }); */
            }}
          >
            <div style={{ fontWeight: "bold" }}>Instrument Group</div>
            <div style={{}}>{instrumentGroup}</div>
          </div>
        </>
      )}
      {instrument && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto",
            gridTemplateRows: "auto auto",
            cursor: "pointer",
            border: instrumentPart == null ? "2px solid purple" : "none",
            padding: "5px"
          }}
          onClick={() => {
            setInstrumentPart(null);
            /* filterTreeMap({ data: { name: family, filterDepth: 2 } }); */
          }}
        >
          <div style={{ fontWeight: "bold" }}>Instrument</div>
          <div style={{}}>{instrument}</div>
        </div>
      )}
    </div>
  );
}
