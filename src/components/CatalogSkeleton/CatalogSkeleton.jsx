import inlineStyles from "../../styles/inlineStyles.js";
function CatalogSkeleton({ count = 12 }) {
  return (
    <div style={inlineStyles("grid grid-cols-4 mb-4 mr-4 gap-2")}>
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          style={inlineStyles("overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]")}
        >
          <div style={inlineStyles("aspect-[2/3] animate-pulse bg-white/10")} />

          <div style={inlineStyles("p-4")}>
            <div style={inlineStyles("h-4 w-4/5 animate-pulse rounded bg-white/10")} />
            <div style={{...(inlineStyles("h-3 w-2/5 animate-pulse rounded bg-white/10")), ...{"marginTop":"12px"}}} />
          </div>
        </article>
      ))}
    </div>
  );
}

export default CatalogSkeleton;
