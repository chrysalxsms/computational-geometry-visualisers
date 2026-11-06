import Icon from "./Icon.jsx";
export default function ShortcutsModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
        <span className="section-kicker">WORKSPACE CONTROLS</span>
        <h2 id="modal-title">Keyboard shortcuts</h2>
        {[
          ["Play / pause", "Space"],
          ["Next step", "→"],
          ["Previous step", "←"],
          ["Reset", "R"],
          ["Find an algorithm", "Ctrl / ⌘ K"],
          ["Close dialog / stop adding", "Esc"],
        ].map(([label, key]) => (
          <div className="shortcut-row" key={key}>
            <span>{label}</span>
            <kbd>{key}</kbd>
          </div>
        ))}
      </section>
    </div>
  );
}
