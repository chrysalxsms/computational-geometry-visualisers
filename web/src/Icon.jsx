export default function Icon({ name, size = 18 }) {
  const paths = {
    polygon: (
      <>
        <path d="m5 8 8-5 7 9-5 8-11-4L5 8Z" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="13" cy="3" r="1.5" />
        <circle cx="20" cy="12" r="1.5" />
        <circle cx="15" cy="20" r="1.5" />
        <circle cx="4" cy="16" r="1.5" />
      </>
    ),
    sweep: (
      <>
        <path d="M3 20V9h5v11m0 0V4h7v16m0 0v-8h6v8M2 20h20M12 2v20" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    play: <path d="m9 5 11 7-11 7V5Z" fill="currentColor" stroke="none" />,
    pause: <path d="M8 5v14M16 5v14" strokeWidth="4" />,
    next: (
      <>
        <path d="m5 5 10 7-10 7V5Z" />
        <path d="M19 5v14" />
      </>
    ),
    back: (
      <>
        <path d="m19 5-10 7 10 7V5Z" />
        <path d="M5 5v14" />
      </>
    ),
    reset: <path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" />,
    shuffle: (
      <path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2 0 3.5-2 5-5m2-3c1.5-2.5 3-4 5-4h3m-4-4 4 4-4 4" />
    ),
    code: <path d="m7 6-6 6 6 6m10-12 6 6-6 6m-4-15-2 18" />,
    book: (
      <path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15" />
    ),
    keyboard: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h.01M18 13h.01M8 16h8" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10v.1" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
