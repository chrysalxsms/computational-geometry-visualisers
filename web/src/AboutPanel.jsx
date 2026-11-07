import Icon from "./Icon.jsx";
import { presetNote } from "./geometry.js";

export default function AboutPanel({ algorithm, onBack }) {
  const isSkyline = algorithm === "Manhattan Skyline";

  return (
    <section className="about-panel">
      <span className="section-kicker">
        {isSkyline ? "SWEEP LINE" : "CONVEX HULL"}
      </span>
      <h2>
        {algorithm === "Jarvis March"
          ? "Jarvis March"
          : algorithm === "Graham Scan"
            ? "Graham Scan"
            : "Manhattan Skyline"}
      </h2>
      <p>
        {algorithm === "Jarvis March"
          ? "Jarvis March, also called gift wrapping, starts at the leftmost point and repeatedly scans every other point to find the next outermost vertex. Collinear ties are resolved by choosing the farthest point. It finishes when it returns to the starting vertex."
          : algorithm === "Graham Scan"
            ? "Graham Scan chooses the lowest point as a pivot, sorts the remaining points by polar angle, and processes them with a stack. A non-left turn removes the middle vertex. The result is a counterclockwise convex boundary; collinear interior points are discarded."
            : "The Manhattan skyline algorithm sweeps through sorted building-edge events. A max-heap holds the buildings it has passed the start of, with the tallest on top; buildings that have ended are only removed once they reach the top (lazy deletion). When the height on top of the heap changes, the skyline gets two corners: the old height and the new height at the same x. Events at the same x-coordinate are processed one by one: starts before ends, tallest start first."}
      </p>
      <h3>Experiment with the input</h3>
      <p>
        {presetNote(algorithm, "Best case")}{" "}
        {presetNote(algorithm, "Worst case")}
      </p>
      <div className="about-note">
        <Icon name="info" size={16} />
        <span>
          {isSkyline
            ? "The pseudocode uses a max-heap with lazy removal or a balanced multiset."
            : "Orientation is determined by the sign of the 2D cross product."}
        </span>
      </div>
      <button className="primary-button" onClick={onBack}>
        Back to visualization <Icon name="arrow" size={15} />
      </button>
    </section>
  );
}
