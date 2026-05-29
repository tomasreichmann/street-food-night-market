import type { ReactNode } from 'react';
import qrCodeRulesSrc from './assets/qr-code-rules.png';
import {
  RulesActionsSection,
  RulesGoalSection,
  RulesLegendSection,
  RulesScoringSection,
  RulesSetupSection,
  RulesWantsSection,
} from './components/RulesContent';
import { getRulesContent } from './components/rulesContentModel';
import type { GameContent } from './content/schema';
import { RulesHeroStats } from './RulesRoute';
import layoutStyles from './App.module.css';
import rulesStyles from './Rules.module.css';
import styles from './RulesPrintRoute.module.css';
import { cx } from './utils/cx';

type RulesPrintRouteProps = {
  content: GameContent;
};

function PrintPage({ children }: { children: ReactNode }) {
  return (
    <article className={styles.page} data-testid="rules-print-page">
      {children}
    </article>
  );
}

export function RulesPrintRoute({ content }: RulesPrintRouteProps) {
  const rules = getRulesContent(content);

  if (!rules) {
    return null;
  }

  const printClasses = {
    actionCard: styles.actionCard,
    cardLegend: styles.cardLegend,
    example: styles.example,
    symbolGuide: styles.symbolGuide,
    wantsCard: styles.wantsCard,
    wantsGrid: styles.wantsGrid,
  };

  return (
    <div className={styles.route}>
      <PrintPage>
        <section
          className={cx(layoutStyles.hero, rulesStyles.hero, styles.hero)}
        >
          <div className={layoutStyles.heroIntro}>
            <p className={layoutStyles.eyebrow}>Birthday night market rules</p>
            <h1>Street Food Night Market</h1>
            <p className={layoutStyles.heroCopy}>
              Move around the room, trade with other players, cook dishes, and
              serve visible customers before the market closes.
            </p>
          </div>
          <div className={styles.heroAside} aria-label="Print hero extras">
            <RulesHeroStats />
            <img
              className={styles.qr}
              src={qrCodeRulesSrc}
              alt="Rules QR code"
            />
          </div>
        </section>

        <RulesGoalSection />
        <RulesSetupSection content={content} />
      </PrintPage>

      <PrintPage>
        <RulesActionsSection rules={rules} classOverrides={printClasses} />
      </PrintPage>

      <PrintPage>
        <RulesWantsSection
          content={content}
          rules={rules}
          classOverrides={printClasses}
        />
      </PrintPage>

      <PrintPage>
        <RulesScoringSection />
      </PrintPage>

      <PrintPage>
        <RulesLegendSection
          content={content}
          rules={rules}
          classOverrides={printClasses}
        />
      </PrintPage>
    </div>
  );
}
