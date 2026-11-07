import Icon from "./Icon.jsx";

export default function MetricsGrid({ algorithm, frame, count }) {
  const isSkyline = algorithm === "Manhattan Skyline";
  const uniqueHull = new Set(frame.hull).size;

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-icon purple">
          <Icon name="code" size={18} />
        </div>
        <div>
          <span>Time complexity</span>
          <strong>
            {algorithm === "Jarvis March" ? "O(nh)" : "O(n log n)"}
            <small>
              {algorithm === "Jarvis March" ? "output-sensitive" : "worst case"}
            </small>
          </strong>
        </div>
        <span
          className="metric-info"
          title={
            algorithm === "Jarvis March"
              ? "n is the input size; h is the number of hull vertices."
              : "The conceptual algorithm includes sorting and an efficient active-set or stack implementation."
          }
        >
          i
        </span>
      </div>
      <div className="metric-card">
        <div className="metric-icon peach">
          <Icon name={isSkyline ? "sweep" : "polygon"} size={18} />
        </div>
        <div>
          <span>{isSkyline ? "Active buildings" : "Hull vertices"}</span>
          <strong>
            {isSkyline ? frame.activeBuildings.length : uniqueHull}
            <small>
              {isSkyline ? `of ${count} buildings` : `of ${count} points`}
            </small>
          </strong>
        </div>
      </div>
      <div className="metric-card">
        <div className="metric-icon mint-icon">
          <Icon name="search" size={18} />
        </div>
        <div>
          <span>{isSkyline ? "Edges processed" : "Orientation tests"}</span>
          <strong>
            {frame.checks}
            <small>{isSkyline ? "sweep events" : "cross products"}</small>
          </strong>
        </div>
      </div>
    </div>
  );
}
