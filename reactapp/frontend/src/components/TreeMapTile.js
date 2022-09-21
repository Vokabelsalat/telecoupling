export default function TreeMapTile(props) {
  const { node, parentTop = 0, parentLeft = 0 } = props;

  const getMaxChild = (children) => {
    const max = children.reduce(function (prev, current) {
      return prev.value > current.value ? prev : current;
    });
    if (max.children) {
      return getMaxChild(max.children);
    } else {
      return max;
    }
  };

  const max = node.children ? getMaxChild(node.children) : node;

  return (
    <div
      style={{
        position: "absolute",
        left: node.x0 - parentLeft,
        top: node.y0 - parentTop,
        width: node.x1 - node.x0,
        height: node.y1 - node.y0,
        backgroundColor: "rgba(255,0,0,0.2)",
        border: "solid 1px black"
      }}
    >
      <img
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
        src={max.data.image}
      />
    </div>
  );
}
