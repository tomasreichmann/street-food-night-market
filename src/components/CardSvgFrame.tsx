import { useId } from 'react';
import { coinIconSrc, resourceIcons } from '../assets/icon-map';
import type { DishCard } from '../content/schema';

const CARD_OUTER_WIDTH = 69;
const CARD_OUTER_HEIGHT = 94;
const CARD_CUT_X = 3;
const CARD_CUT_Y = 3;
const CARD_CUT_WIDTH = 63;
const CARD_CUT_HEIGHT = 88;
const CARD_CUT_RADIUS = 3;
const ART_HEIGHT = 69;
const ICON_SIZE = 8.44;
const ICON_MARGIN = 1.8;
const RESOURCE_COST_ICON_SIZE = 9.84;
const COIN_ICON_SIZE = ICON_SIZE;
const ICON_OUTLINE_COLOR = '#fff9df';
const ICON_OUTLINE_RADIUS = 0.22;
const TITLE_FONT_SIZE = 4.45;
const TITLE_LINE_HEIGHT = 4.9;
const TITLE_MAX_CHARS_PER_LINE = 17;
const BONUS_FONT_SIZE = 2.85;
const BONUS_LINE_HEIGHT = 3.2;
const BONUS_MAX_CHARS_PER_LINE = 27;
const CUSTOMER_BADGE_FONT_WEIGHT = 700;
const TIER_STAR_SIZE = 2.33;
const TIER_STAR_GAP = 0.35;
const BOTTOM_REQUIREMENT_CENTER_Y = 81.5;
const BOTTOM_REQUIREMENT_ART_HEIGHT = RESOURCE_COST_ICON_SIZE;
const BOTTOM_REQUIREMENT_ART_WIDTH =
  (BOTTOM_REQUIREMENT_ART_HEIGHT * CARD_OUTER_WIDTH) / CARD_OUTER_HEIGHT;

type CardFooter =
  | {
      kind: 'none';
    }
  | {
      kind: 'cost';
      cost: DishCard['cost'];
    }
  | {
      kind: 'customer';
      coinCount?: number;
      payoutDisplay?: PayoutDisplay;
    };

type PayoutDisplay = {
  lines: string[];
  ariaLabel: string;
};

type RequirementIcon = {
  src: string;
  count?: number;
};

type CardSvgFrameProps = {
  accentSoft: string;
  artSrc?: string;
  artIconSrc: string;
  endgameBonus?: string;
  footer: CardFooter;
  kind: 'resource' | 'dish' | 'customer';
  requirementArtSrc?: string;
  requirementIcons?: RequirementIcon[];
  requirementLabel?: string;
  requirementPrefix?: string;
  requirementSeparator?: string;
  tagIcons?: string[];
  tier?: number;
  title: string;
  typeIconSrc: string;
};

function flattenCostIcons(cost: DishCard['cost']) {
  return Object.entries(cost).flatMap(([resource, amount]) =>
    Array.from({ length: amount }, (_, index) => ({ resource, index })),
  );
}

function measureCenteredRow(count: number, iconSize: number, gap: number) {
  const totalWidth = count * iconSize + Math.max(0, count - 1) * gap;
  const startX = (CARD_OUTER_WIDTH - totalWidth) / 2;
  return { startX };
}

function wrapTitle(title: string) {
  return wrapText(title, TITLE_MAX_CHARS_PER_LINE);
}

function wrapText(text: string, maxCharsPerLine: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];

  for (const word of words) {
    const currentLine = lines.at(-1);
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (!currentLine) {
      lines.push(word);
      continue;
    }

    if (nextLine.length <= maxCharsPerLine) {
      lines[lines.length - 1] = nextLine;
      continue;
    }

    lines.push(word);
  }

  return lines.length > 0 ? lines : [text];
}

function CardTitle({ title }: { title: string }) {
  const lines = wrapTitle(title);
  const firstLineY =
    ICON_SIZE / 2 - ((lines.length - 1) * TITLE_LINE_HEIGHT) / 2;

  return (
    <text
      x={ICON_SIZE + 1.25}
      y={firstLineY}
      fill="#fffaf3"
      fontSize={TITLE_FONT_SIZE}
      fontWeight={800}
      dominantBaseline="middle"
    >
      {lines.map((line, index) => (
        <tspan
          key={`${line}-${index}`}
          x={ICON_SIZE + 1.25}
          dy={index === 0 ? 0 : TITLE_LINE_HEIGHT}
        >
          {line}
        </tspan>
      ))}
    </text>
  );
}

function getStarPoints(centerX: number, centerY: number, outerRadius: number) {
  const innerRadius = outerRadius * 0.45;

  return Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const radius = index % 2 === 0 ? outerRadius : innerRadius;

    return `${centerX + Math.cos(angle) * radius},${centerY + Math.sin(angle) * radius}`;
  }).join(' ');
}

function TierStars({ tier }: { tier?: number }) {
  if (!tier || tier <= 0) {
    return null;
  }

  const visibleTier = Math.min(tier, 3);
  const totalWidth =
    visibleTier * TIER_STAR_SIZE + Math.max(0, visibleTier - 1) * TIER_STAR_GAP;
  const startX = ICON_SIZE / 2 - totalWidth / 2 + TIER_STAR_SIZE / 2;
  const centerY = ICON_SIZE + 2.45;

  return (
    <g aria-hidden="true">
      {Array.from({ length: visibleTier }, (_, index) => (
        <polygon
          key={index}
          data-card-part="tier-star"
          points={getStarPoints(
            startX + index * (TIER_STAR_SIZE + TIER_STAR_GAP),
            centerY,
            TIER_STAR_SIZE / 2,
          )}
          fill="#e4b55a"
          stroke="#fff9df"
          strokeWidth={0.12}
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
}

function CostIconRow({
  cost,
  pictureBrightnessId,
}: {
  cost: DishCard['cost'];
  pictureBrightnessId: string;
}) {
  const icons = flattenCostIcons(cost);
  const gap = 0.55;
  const { startX } = measureCenteredRow(
    icons.length,
    RESOURCE_COST_ICON_SIZE,
    gap,
  );
  const centerY = 81.5;

  return (
    <g aria-hidden="true">
      {icons.map((entry, index) => (
        <g
          key={`${entry.resource}-${entry.index}`}
          filter={`url(#${pictureBrightnessId})`}
        >
          <image
            data-card-part="cost-icon"
            href={resourceIcons[entry.resource as keyof typeof resourceIcons]}
            x={startX + index * (RESOURCE_COST_ICON_SIZE + gap)}
            y={centerY - RESOURCE_COST_ICON_SIZE / 2}
            width={RESOURCE_COST_ICON_SIZE}
            height={RESOURCE_COST_ICON_SIZE}
          />
        </g>
      ))}
    </g>
  );
}

function DishTypeColumn({
  icons,
  pictureBrightnessId,
}: {
  icons: string[];
  pictureBrightnessId: string;
}) {
  return (
    <g aria-hidden="true">
      {icons.slice(0, 4).map((src, index) => (
        <g key={`${src}-${index}`} filter={`url(#${pictureBrightnessId})`}>
          <image
            href={src}
            x={CARD_CUT_X + CARD_CUT_WIDTH - ICON_MARGIN - ICON_SIZE}
            y={CARD_CUT_Y + ICON_MARGIN + index * (ICON_SIZE + 0.8)}
            width={ICON_SIZE}
            height={ICON_SIZE}
            filter="url(#card-icon-outline)"
          />
        </g>
      ))}
    </g>
  );
}

function TopRightCoinAmount({
  payoutDisplay,
  pictureBrightnessId,
}: {
  payoutDisplay: PayoutDisplay;
  pictureBrightnessId: string;
}) {
  const startY = CARD_CUT_Y + ICON_MARGIN - 0.05;
  const iconX = CARD_CUT_X + CARD_CUT_WIDTH - ICON_MARGIN - COIN_ICON_SIZE;
  const textX = iconX + COIN_ICON_SIZE / 2;
  const textY = startY + COIN_ICON_SIZE / 2;
  const isMultiLine = payoutDisplay.lines.length > 1;
  const fontSize = isMultiLine ? 3 : 5.2;
  const lineHeight = isMultiLine ? 2.85 : 0;
  const firstLineY = isMultiLine
    ? textY - ((payoutDisplay.lines.length - 1) * lineHeight) / 2
    : textY;

  return (
    <g aria-label={payoutDisplay.ariaLabel}>
      <g filter={`url(#${pictureBrightnessId})`}>
        <image
          aria-hidden="true"
          href={coinIconSrc}
          x={iconX}
          y={startY}
          width={COIN_ICON_SIZE}
          height={COIN_ICON_SIZE}
          filter="url(#card-icon-outline)"
        />
      </g>
      {payoutDisplay.lines.map((line, index) => (
        <text
          key={`${line}-${index}`}
          data-card-part="coin-amount"
          x={textX}
          y={firstLineY + index * lineHeight}
          fill="#fffaf3"
          fontSize={fontSize}
          fontWeight={CUSTOMER_BADGE_FONT_WEIGHT}
          textAnchor="middle"
          dominantBaseline="middle"
          paintOrder="stroke fill"
          stroke="#3b322c"
          strokeOpacity={0.95}
          strokeWidth={0.3}
          strokeLinejoin="round"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function BottomRequirementIcons({
  icons,
  pictureBrightnessId,
  prefix,
  separator = '/',
}: {
  icons: RequirementIcon[];
  pictureBrightnessId: string;
  prefix?: string;
  separator?: string;
}) {
  if (icons.length === 0) {
    return null;
  }

  const visibleIcons = icons.slice(0, 4);
  const rowHeight = 17.8;
  const x = CARD_CUT_X;
  const y = BOTTOM_REQUIREMENT_CENTER_Y - rowHeight / 2;

  return (
    <foreignObject
      data-card-part="bottom-requirements-html"
      x={x}
      y={y}
      width={CARD_CUT_WIDTH}
      height={rowHeight}
      requiredExtensions="http://www.w3.org/1999/xhtml"
      aria-hidden="true"
    >
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#3b322c',
          fontSize: 6.1,
          fontWeight: 800,
          lineHeight: 1,
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {prefix ? (
          <span data-card-part="requirement-prefix">{prefix}</span>
        ) : null}
        {visibleIcons.map((icon, index) => (
          <span
            key={`${icon.src}-${index}`}
            data-card-part="bottom-type-icon"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: icon.count ? '0.14em' : 0,
              flexShrink: 0,
              filter: `url(#${pictureBrightnessId})`,
            }}
          >
            {icon.count ? (
              <span
                data-card-part="requirement-count"
                style={{
                  minWidth: '0.95em',
                  textAlign: 'center',
                }}
              >
                {icon.count}
              </span>
            ) : null}
            <img
              src={icon.src}
              alt=""
              aria-hidden="true"
              style={{
                width: '1.575em',
                height: '1.575em',
                display: 'block',
                filter: 'url(#card-icon-outline)',
              }}
            />
            {index < visibleIcons.length - 1 ? (
              <span
                data-card-part="bottom-type-separator"
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  marginInline: separator === '+' ? '0.18em' : '0.1em',
                }}
              >
                {separator}
              </span>
            ) : null}
          </span>
        ))}
      </div>
    </foreignObject>
  );
}

function BottomRequirementArt({
  artSrc,
  clipId,
  pictureBrightnessId,
}: {
  artSrc: string;
  clipId: string;
  pictureBrightnessId: string;
}) {
  const x = (CARD_OUTER_WIDTH - BOTTOM_REQUIREMENT_ART_WIDTH) / 2;
  const y = BOTTOM_REQUIREMENT_CENTER_Y - BOTTOM_REQUIREMENT_ART_HEIGHT / 2;

  return (
    <g aria-hidden="true">
      <g
        filter={`url(#${pictureBrightnessId})`}
        clipPath={`url(#${clipId})`}
        transform={`translate(${x} ${y})`}
      >
        <image
          data-card-part="bottom-requirement-art"
          href={artSrc}
          x={0}
          y={0}
          width={BOTTOM_REQUIREMENT_ART_WIDTH}
          height={BOTTOM_REQUIREMENT_ART_HEIGHT}
          preserveAspectRatio="xMidYMid slice"
        />
      </g>
      <rect
        x={x}
        y={y}
        width={BOTTOM_REQUIREMENT_ART_WIDTH}
        height={BOTTOM_REQUIREMENT_ART_HEIGHT}
        rx={1.4}
        ry={1.4}
        fill="none"
        stroke="#3b322c"
        strokeOpacity={0.18}
        strokeWidth={0.22}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

function EndgameBonus({
  bonusWashId,
  endgameBonus,
}: {
  bonusWashId: string;
  endgameBonus?: string;
}) {
  if (!endgameBonus) {
    return null;
  }

  const lines = wrapText(endgameBonus, BONUS_MAX_CHARS_PER_LINE).slice(0, 2);
  const firstLineY = 62.4 - ((lines.length - 1) * BONUS_LINE_HEIGHT) / 2;

  return (
    <g>
      <rect
        data-card-part="endgame-bonus-bg"
        x={0}
        y={54.5}
        width={CARD_OUTER_WIDTH}
        height={14.5}
        fill={`url(#${bonusWashId})`}
      />
      <text
        data-card-part="endgame-bonus-text"
        x={CARD_OUTER_WIDTH / 2}
        y={firstLineY}
        fill="#fffaf3"
        fontSize={BONUS_FONT_SIZE}
        fontWeight={CUSTOMER_BADGE_FONT_WEIGHT}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {lines.map((line, index) => (
          <tspan
            key={`${line}-${index}`}
            x={CARD_OUTER_WIDTH / 2}
            dy={index === 0 ? 0 : BONUS_LINE_HEIGHT}
          >
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function IllustrationArt({
  artIconSrc,
  artSrc,
  pictureBrightnessId,
}: {
  artIconSrc: string;
  artSrc?: string;
  pictureBrightnessId: string;
}) {
  const iconSize = 22;

  return (
    <g aria-hidden="true">
      {artSrc ? (
        <g filter={`url(#${pictureBrightnessId})`}>
          <image
            data-card-part="illustration"
            href={artSrc}
            x={0}
            y={0}
            width={CARD_OUTER_WIDTH}
            height={ART_HEIGHT}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      ) : (
        <g filter={`url(#${pictureBrightnessId})`}>
          <image
            href={artIconSrc}
            x={(CARD_OUTER_WIDTH - iconSize) / 2}
            y={(ART_HEIGHT - iconSize) / 2}
            width={iconSize}
            height={iconSize}
            opacity={0.92}
          />
        </g>
      )}
    </g>
  );
}

export function CardSvgFrame({
  accentSoft,
  artSrc,
  artIconSrc,
  footer,
  kind,
  requirementArtSrc,
  requirementIcons,
  requirementLabel,
  requirementPrefix,
  requirementSeparator,
  tagIcons = [],
  tier,
  title,
  typeIconSrc,
  endgameBonus,
}: CardSvgFrameProps) {
  const uid = useId().replace(/:/g, '');
  const bgId = `card-bg-${uid}`;
  const topWashId = `card-top-wash-${uid}`;
  const leftWashId = `card-left-wash-${uid}`;
  const rightWashId = `card-right-wash-${uid}`;
  const bottomWashId = `card-bottom-wash-${uid}`;
  const pictureBrightnessId = `card-picture-brightness-${uid}`;
  const requirementArtClipId = `card-requirement-art-clip-${uid}`;
  const bonusWashId = `card-bonus-wash-${uid}`;
  const clipId = `card-clip-${uid}`;

  return (
    <svg
      className="card-svg"
      viewBox={`0 0 ${CARD_OUTER_WIDTH} ${CARD_OUTER_HEIGHT}`}
      role="img"
      aria-label={
        requirementLabel
          ? `${kind} card: ${title}; wants ${requirementLabel}`
          : `${kind} card: ${title}`
      }
      preserveAspectRatio="none"
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            x={0}
            y={0}
            width={CARD_OUTER_WIDTH}
            height={CARD_OUTER_HEIGHT}
            rx={CARD_CUT_RADIUS}
            ry={CARD_CUT_RADIUS}
          />
        </clipPath>

        <linearGradient id={bgId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentSoft} />
          <stop offset="40%" stopColor="#fff8ef" />
          <stop offset="100%" stopColor="#f6ead8" />
        </linearGradient>

        <linearGradient id={topWashId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b120f" stopOpacity="0.94" />
          <stop offset="46%" stopColor="#1b120f" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#1b120f" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={leftWashId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1b120f" stopOpacity="0.72" />
          <stop offset="48%" stopColor="#1b120f" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1b120f" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={rightWashId} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#1b120f" stopOpacity="0.56" />
          <stop offset="48%" stopColor="#1b120f" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1b120f" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={bottomWashId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffaf4" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#fffaf4" stopOpacity="1" />
        </linearGradient>

        <linearGradient id={bonusWashId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b120f" stopOpacity="0" />
          <stop offset="100%" stopColor="#1b120f" stopOpacity="0.72" />
        </linearGradient>

        <filter
          id={pictureBrightnessId}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
        >
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.1" />
            <feFuncG type="linear" slope="1.1" />
            <feFuncB type="linear" slope="1.1" />
          </feComponentTransfer>
        </filter>

        <clipPath id={requirementArtClipId}>
          <rect
            x={0}
            y={0}
            width={BOTTOM_REQUIREMENT_ART_WIDTH}
            height={BOTTOM_REQUIREMENT_ART_HEIGHT}
            rx={1.4}
            ry={1.4}
          />
        </clipPath>

        <filter
          id="card-icon-outline"
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius={ICON_OUTLINE_RADIUS}
            result="dilated"
          />
          <feFlood
            floodColor={ICON_OUTLINE_COLOR}
            floodOpacity="1"
            result="flood"
          />
          <feComposite
            in="flood"
            in2="dilated"
            operator="in"
            result="outline"
          />
          <feMerge>
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g data-card-part="card-art" clipPath={`url(#${clipId})`}>
        <rect
          width={CARD_OUTER_WIDTH}
          height={CARD_OUTER_HEIGHT}
          fill={`url(#${bgId})`}
        />
        <IllustrationArt
          artIconSrc={artIconSrc}
          artSrc={artSrc}
          pictureBrightnessId={pictureBrightnessId}
        />
        <rect
          x={0}
          y={0}
          width={CARD_OUTER_WIDTH}
          height={36}
          fill={`url(#${topWashId})`}
        />
        <rect
          x={0}
          y={0}
          width={16.5}
          height={ART_HEIGHT}
          fill={`url(#${leftWashId})`}
        />
        <rect
          x={CARD_OUTER_WIDTH - 16.5}
          y={0}
          width={16.5}
          height={ART_HEIGHT}
          fill={`url(#${rightWashId})`}
        />
        <rect
          x={0}
          y={69}
          width={CARD_OUTER_WIDTH}
          height={25}
          fill={`url(#${bottomWashId})`}
        />
        {kind === 'customer' ? (
          <EndgameBonus bonusWashId={bonusWashId} endgameBonus={endgameBonus} />
        ) : null}

        <g
          transform={`translate(${CARD_CUT_X + ICON_MARGIN} ${CARD_CUT_Y + ICON_MARGIN})`}
        >
          <g filter={`url(#${pictureBrightnessId})`}>
            <image
              href={typeIconSrc}
              x={0}
              y={0}
              width={ICON_SIZE}
              height={ICON_SIZE}
              filter="url(#card-icon-outline)"
            />
          </g>
          {kind === 'customer' ? <TierStars tier={tier} /> : null}
          <CardTitle title={title} />
        </g>

        {kind === 'dish' ? (
          <DishTypeColumn
            icons={tagIcons}
            pictureBrightnessId={pictureBrightnessId}
          />
        ) : null}
        {kind === 'customer' &&
        footer.kind === 'customer' &&
        requirementArtSrc ? (
          <BottomRequirementArt
            artSrc={requirementArtSrc}
            clipId={requirementArtClipId}
            pictureBrightnessId={pictureBrightnessId}
          />
        ) : null}
        {kind === 'customer' &&
        footer.kind === 'customer' &&
        !requirementArtSrc ? (
          <BottomRequirementIcons
            icons={requirementIcons ?? tagIcons.map((src) => ({ src }))}
            pictureBrightnessId={pictureBrightnessId}
            prefix={requirementPrefix}
            separator={requirementSeparator}
          />
        ) : null}
        {kind === 'customer' && footer.kind === 'customer' ? (
          <TopRightCoinAmount
            payoutDisplay={
              footer.payoutDisplay ?? {
                lines: [`${footer.coinCount ?? ''}`],
                ariaLabel: `${footer.coinCount ?? ''} coins`,
              }
            }
            pictureBrightnessId={pictureBrightnessId}
          />
        ) : null}
        {kind === 'dish' && footer.kind === 'cost' ? (
          <CostIconRow
            cost={footer.cost}
            pictureBrightnessId={pictureBrightnessId}
          />
        ) : null}

        <rect
          x={CARD_CUT_X}
          y={CARD_CUT_Y}
          width={CARD_CUT_WIDTH}
          height={CARD_CUT_HEIGHT}
          rx={CARD_CUT_RADIUS}
          fill="none"
          stroke="#3b322c"
          strokeOpacity={0.45}
          strokeWidth={0.28}
          strokeDasharray="1.25 1.25"
          vectorEffect="non-scaling-stroke"
          className="card-svg__cutline"
        />
      </g>
    </svg>
  );
}
