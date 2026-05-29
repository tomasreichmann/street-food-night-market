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
import layoutStyles from './App.module.css';
import styles from './Rules.module.css';
import { cx } from './utils/cx';

type RulesRouteProps = {
  content: GameContent;
};

function RulesHeroStats() {
  return (
    <div className={styles.heroAside} aria-label="Game stats">
      <div className={styles.heroStat}>
        <span>Players</span>
        <strong>15-20</strong>
      </div>
      <div className={styles.heroStat}>
        <span>Time</span>
        <strong>60 min</strong>
      </div>
      <div className={styles.heroStat}>
        <span>Win</span>
        <strong>Most points</strong>
      </div>
    </div>
  );
}

export function RulesRoute({ content }: RulesRouteProps) {
  const rules = getRulesContent(content);

  if (!rules) {
    return null;
  }

  return (
    <div className={styles.route}>
      <section className={cx(layoutStyles.hero, styles.hero)}>
        <div className={layoutStyles.heroIntro}>
          <p className={layoutStyles.eyebrow}>Birthday night market rules</p>
          <h1>Street Food Night Market</h1>
          <p className={layoutStyles.heroCopy}>
            Move around the room, trade with other players, cook dishes, and
            serve visible customers before the market closes.
          </p>
        </div>

        <RulesHeroStats />
      </section>

      <RulesGoalSection />
      <RulesSetupSection content={content} />
      <RulesActionsSection rules={rules} />
      <RulesWantsSection content={content} rules={rules} />
      <RulesScoringSection />
      <RulesLegendSection content={content} rules={rules} />
    </div>
  );
}

export { RulesHeroStats };
