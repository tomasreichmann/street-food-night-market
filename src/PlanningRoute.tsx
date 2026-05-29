import { CardPlanningTable } from './components/CardPlanningTable';
import type { GameContent } from './content/schema';

type PlanningRouteProps = {
  content: GameContent;
};

export function PlanningRoute({ content }: PlanningRouteProps) {
  return (
    <div>
      <CardPlanningTable content={content} />
    </div>
  );
}
