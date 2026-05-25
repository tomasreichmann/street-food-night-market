const DEFAULT_CROP_MARK_LENGTH_MM = 1;

export type PrintCropMarkRect = {
  bottom: number;
  key: string;
  left: number;
  right: number;
  top: number;
};

type PrintCropMarksProps = {
  pageHeightMm: number;
  pageWidthMm: number;
  rects: PrintCropMarkRect[];
};

function renderCropMarksForRect(
  rect: PrintCropMarkRect,
  pageWidthMm: number,
  markLengthMm: number,
) {
  const { bottom, key, left, right, top } = rect;

  return (
    <g key={key}>
      <line x1={left} y1={top - markLengthMm} x2={left} y2={top} />
      <line x1={0} y1={top} x2={left} y2={top} />
      <line x1={right} y1={top - markLengthMm} x2={right} y2={top} />
      <line x1={right} y1={top} x2={pageWidthMm} y2={top} />
      <line x1={left} y1={bottom} x2={left} y2={bottom + markLengthMm} />
      <line x1={0} y1={bottom} x2={left} y2={bottom} />
      <line x1={right} y1={bottom} x2={right} y2={bottom + markLengthMm} />
      <line x1={right} y1={bottom} x2={pageWidthMm} y2={bottom} />
    </g>
  );
}

export function PrintCropMarks({
  pageHeightMm,
  pageWidthMm,
  rects,
}: PrintCropMarksProps) {
  return (
    <svg
      className="print-sheet__marks"
      viewBox={`0 0 ${pageWidthMm} ${pageHeightMm}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <g
        className="print-sheet__crop-marks"
        fill="none"
        stroke="#1f1d1b"
        strokeWidth="0.4"
        vectorEffect="non-scaling-stroke"
      >
        {rects.map((rect) =>
          renderCropMarksForRect(rect, pageWidthMm, DEFAULT_CROP_MARK_LENGTH_MM),
        )}
      </g>
    </svg>
  );
}
