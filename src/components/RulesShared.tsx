import type { CSSProperties, ReactNode } from 'react';
import {
  cardIcons,
  coinIconSrc,
  dishTypeIcons,
  resourceIcons,
} from '../assets/icon-map';
import { CardPreview } from './CardPreview';
import type {
  CustomerCard,
  DishCard,
  ResourceDefinition,
} from '../content/schema';
import layoutStyles from '../App.module.css';
import styles from './RulesShared.module.css';
import { cx } from '../utils/cx';

export type ComponentPillTone =
  | 'coin'
  | 'customer'
  | 'dish'
  | 'resource'
  | 'task';

export function RulesSection({
  eyebrow,
  heading,
  children,
  testId,
}: {
  eyebrow: string;
  heading: string;
  children: ReactNode;
  testId?: string;
}) {
  return (
    <section className={styles.section} data-testid={testId}>
      <div className={styles.heading}>
        <p className={cx(layoutStyles.eyebrow, styles.headingEyebrow)}>
          {eyebrow}
        </p>
        <h2>{heading}</h2>
      </div>
      {children}
    </section>
  );
}

export function RulesIcon({ label, src }: { label: string; src: string }) {
  return <img className={styles.icon} src={src} alt={label} />;
}

const pillToneClass: Record<ComponentPillTone, string> = {
  coin: styles.pillCoin,
  customer: styles.pillCustomer,
  dish: styles.pillDish,
  resource: styles.pillResource,
  task: styles.pillTask,
};

export function ComponentPill({
  children,
  className,
  iconLabel,
  iconSrc,
  tone,
}: {
  children: ReactNode;
  className?: string;
  iconLabel: string;
  iconSrc: string;
  tone: ComponentPillTone;
}) {
  return (
    <span className={cx(styles.pill, pillToneClass[tone], className)}>
      <RulesIcon src={iconSrc} label={iconLabel} />
      <span>{children}</span>
    </span>
  );
}

export function ResourcePill({ resource }: { resource: ResourceDefinition }) {
  return (
    <ComponentPill
      iconLabel={`${resource.label} resource`}
      iconSrc={resourceIcons[resource.id as keyof typeof resourceIcons]}
      tone="resource"
    >
      {resource.label}
    </ComponentPill>
  );
}

export function DishPill({ dish }: { dish: DishCard }) {
  return (
    <ComponentPill iconLabel="Dish card" iconSrc={cardIcons.dish} tone="dish">
      {dish.title}
    </ComponentPill>
  );
}

export function CoinPill({ children }: { children: ReactNode }) {
  return (
    <ComponentPill iconLabel="Coins" iconSrc={coinIconSrc} tone="coin">
      {children}
    </ComponentPill>
  );
}

export function ActionCard({
  children,
  className,
  iconLabel,
  iconSrc,
  title,
}: {
  children: ReactNode;
  className?: string;
  iconLabel: string;
  iconSrc: string;
  title: string;
}) {
  return (
    <article className={cx(styles.actionCard, className)}>
      <div className={styles.actionHeader}>
        <RulesIcon src={iconSrc} label={iconLabel} />
        <h3>{title}</h3>
      </div>
      {children}
    </article>
  );
}

export function ActionExample({
  className,
  from,
  label,
  to,
}: {
  className?: string;
  from: ReactNode;
  label: string;
  to: ReactNode;
}) {
  return (
    <div className={cx(styles.example, className)}>
      <span className={styles.exampleLabel}>{label}</span>
      <div className={styles.exampleFlow}>
        <div>{from}</div>
        <strong aria-hidden="true">-&gt;</strong>
        <div>{to}</div>
      </div>
    </div>
  );
}

export function TypeIconPill({ label, tag }: { label: string; tag: string }) {
  return (
    <ComponentPill
      iconLabel={`${label} type`}
      iconSrc={dishTypeIcons[tag as keyof typeof dishTypeIcons]}
      tone="dish"
    >
      {label}
    </ComponentPill>
  );
}

export function WantsExampleCard({
  className,
  customer,
  description,
  dishes,
  wantsText,
}: {
  className?: string;
  customer: CustomerCard;
  description: string;
  dishes: DishCard[];
  wantsText: string;
}) {
  return (
    <article className={cx(styles.wantsCard, className)}>
      <div className={styles.wantsPreview}>
        <CardPreview
          kind="customer"
          item={customer}
          dishes={dishes}
          cornerRadius={0}
        />
      </div>
      <div className={styles.wantsCopy}>
        <p className={layoutStyles.eyebrow}>{customer.title}</p>
        <h3>{wantsText}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}

export function LegendItem({
  index,
  text,
  title,
}: {
  index: number;
  text: string;
  title: string;
}) {
  return (
    <li className={styles.legendItem}>
      <strong>{index}</strong>
      <span>
        <b>{title}</b>
        {text}
      </span>
    </li>
  );
}

type CardLegendMarker = {
  label: string;
  style: CSSProperties;
};

export function CardLegend({
  card,
  className,
  items,
  kind,
  markers,
  title,
}: {
  card: ReactNode;
  className?: string;
  items: Array<{ title: string; text: string }>;
  kind: 'customer' | 'dish';
  markers: CardLegendMarker[];
  title: string;
}) {
  return (
    <article className={cx(styles.cardLegend, className)}>
      <div className={styles.legendPreview}>
        <p className={layoutStyles.eyebrow}>{title}</p>
        <div className={styles.legendStage}>
          {card}
          {markers.map((marker, index) => (
            <span
              key={marker.label}
              aria-hidden="true"
              className={styles.legendMarker}
              data-testid={`rules-card-legend-marker-${kind}-${index + 1}`}
              style={marker.style}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>
      <ol className={styles.legendList}>
        {items.map((item, index) => (
          <LegendItem
            key={item.title}
            index={index + 1}
            title={item.title}
            text={item.text}
          />
        ))}
      </ol>
    </article>
  );
}
