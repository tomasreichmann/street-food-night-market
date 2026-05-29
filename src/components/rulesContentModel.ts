import type {
  CustomerCard,
  DishCard,
  GameContent,
  ResourceDefinition,
} from '../content/schema';
import { findById } from './rulesUtils';

export type RulesContent = {
  businessExecutive: CustomerCard;
  featuredCustomer: CustomerCard;
  foodBlogger: CustomerCard;
  fuel: ResourceDefinition;
  greens: ResourceDefinition;
  maidCafeMaid: CustomerCard;
  meat: ResourceDefinition;
  ramen: DishCard;
  salaryman: CustomerCard;
  sashimi: DishCard;
  seafood: ResourceDefinition;
  sumoWrestler: CustomerCard;
  sushi: DishCard;
  umami: ResourceDefinition;
};

export function getRulesContent(content: GameContent): RulesContent | null {
  const resourcesById = new Map(
    content.resources.map((resource) => [resource.id, resource]),
  );
  const greens = resourcesById.get('greens') ?? content.resources[0];
  const umami = resourcesById.get('fungi') ?? content.resources[1];
  const fuel = resourcesById.get('fuel') ?? content.resources[2];
  const seafood = resourcesById.get('sea') ?? content.resources[3];
  const meat = resourcesById.get('meat') ?? content.resources[4];
  const ramen = findById(content.dishes, 'ramen-bowl');
  const sushi = findById(content.dishes, 'sushi-platter');
  const sashimi = findById(content.dishes, 'sashimi');
  const featuredCustomer = findById(content.customers, 'seafood-lover');
  const salaryman = findById(content.customers, 'salaryman');
  const maidCafeMaid = findById(content.customers, 'maid-cafe-maid');
  const sumoWrestler = findById(content.customers, 'sumo-wrestler');
  const foodBlogger = findById(content.customers, 'food-blogger');
  const businessExecutive = findById(content.customers, 'business-executive');

  if (
    !greens ||
    !umami ||
    !fuel ||
    !seafood ||
    !meat ||
    !ramen ||
    !sushi ||
    !sashimi ||
    !featuredCustomer ||
    !salaryman ||
    !maidCafeMaid ||
    !sumoWrestler ||
    !foodBlogger ||
    !businessExecutive
  ) {
    return null;
  }

  return {
    businessExecutive,
    featuredCustomer,
    foodBlogger,
    fuel,
    greens,
    maidCafeMaid,
    meat,
    ramen,
    salaryman,
    sashimi,
    seafood,
    sumoWrestler,
    sushi,
    umami,
  };
}
