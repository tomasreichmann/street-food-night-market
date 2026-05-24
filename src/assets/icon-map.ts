import coinIcon from './icons/coin.png';
import customerIcon from './icons/customer.png';
import dessertIcon from './icons/dessert.png';
import dishIcon from './icons/dish.png';
import drinkIcon from './icons/drink.png';
import grillIcon from './icons/grill.png';
import meatIcon from './icons/meat.png';
import mushroomIcon from './icons/mushroom.png';
import noodleIcon from './icons/noodle.png';
import premiumIcon from './icons/premium.png';
import riceIcon from './icons/rice.png';
import seafoodIcon from './icons/seafood.png';
import shellIcon from './icons/shell.png';
import skewerIcon from './icons/skewer.png';
import soupIcon from './icons/soup.png';
import stewIcon from './icons/stew.png';
import weedIcon from './icons/weed.png';
import woodIcon from './icons/wood.png';

export const resourceIcons = {
  sea: shellIcon,
  greens: weedIcon,
  fuel: woodIcon,
  fungi: mushroomIcon,
  meat: meatIcon,
} as const;

export const resourceTones = {
  sea: {
    accent: 'var(--color-blue-500)',
    accentSoft: 'var(--color-blue-100)',
  },
  greens: {
    accent: 'var(--color-green-500)',
    accentSoft: 'var(--color-green-100)',
  },
  fuel: {
    accent: 'var(--color-brown-500)',
    accentSoft: 'var(--color-cream-100)',
  },
  fungi: {
    accent: 'var(--color-pink-500)',
    accentSoft: 'var(--color-pink-100)',
  },
  meat: {
    accent: 'var(--color-red-500)',
    accentSoft: 'var(--color-red-100)',
  },
} as const;

export const cardIcons = {
  dish: dishIcon,
  customer: customerIcon,
} as const;

export const dishTypeIcons = {
  noodle: noodleIcon,
  noodles: noodleIcon,
  soup: soupIcon,
  seafood: seafoodIcon,
  rice: riceIcon,
  grill: grillIcon,
  skewer: skewerIcon,
  stew: stewIcon,
  drink: drinkIcon,
  dessert: dessertIcon,
  sweet: dessertIcon,
  vegetarian: weedIcon,
  meat: meatIcon,
  premium: premiumIcon,
} as const;

export const coinIconSrc = coinIcon;
