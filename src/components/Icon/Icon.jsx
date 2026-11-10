const paths = {
  back: <path d="m15 18-6-6 6-6M9 12h12" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  close: <path d="m18 6-12 12M6 6l12 12" />,
  play: <path d="m8 5 12 7-12 7z" fill="currentColor" stroke="none" />,
  plus: <path d="M12 5v14M5 12h14" />,
  maximize: (
    <>
      <g id="Complete">
        <g id="maximize">
          <g>
            <path
              d="M3,8V5A2,2,0,0,1,5,3H8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              stroke="currentColor"
            />
            <path
              d="M21,16v3a2,2,0,0,1-2,2H16"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              stroke="currentColor"
            />
            <path
              d="M3,16v3a2,2,0,0,0,2,2H8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              stroke="currentColor"
            />
            <path
              d="M21,8V5a2,2,0,0,0-2-2H16"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              stroke="currentColor"
            />
          </g>
        </g>
      </g>
    </>
  ),
};

function Icon({ name, style = {}, size = 24 }) {
  return (
    <svg
      aria-hidden="true"
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export default Icon;
