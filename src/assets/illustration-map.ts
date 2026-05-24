import animeClubIllustration from './illustrations/customers/anime-club.png';
import businessExecutiveIllustration from './illustrations/customers/business-executive.png';
import celebrityChefIllustration from './illustrations/customers/celebrity-chef.png';
import dockWorkerIllustration from './illustrations/customers/dock-worker.png';
import festivalJudgeIllustration from './illustrations/customers/festival-judge.png';
import foodBloggerIllustration from './illustrations/customers/food-blogger.png';
import hungryStudentIllustration from './illustrations/customers/hungry-student.png';
import kPopBandFemaleIllustration from './illustrations/customers/k-pop-band-female.png';
import maidCafeMaidIllustration from './illustrations/customers/maid-cafe-maid.png';
import monkIllustration from './illustrations/customers/monk.png';
import nightMarketKidIllustration from './illustrations/customers/night-market-kid.png';
import nightShiftNurseIllustration from './illustrations/customers/night-shift-nurse.png';
import salarymanIllustration from './illustrations/customers/salary-man.png';
import seafoodLoverIllustration from './illustrations/customers/seafood-lover.png';
import soupRegularIllustration from './illustrations/customers/soup-regular.png';
import streetMusicianIllustration from './illustrations/customers/street-musician.png';
import sumoWrestlerIllustration from './illustrations/customers/sumo-wrestler.png';
import teaAuntieIllustration from './illustrations/customers/tea-auntie.png';
import templeCaretakerIllustration from './illustrations/customers/temple-caretaker.png';
import touristIllustration from './illustrations/customers/tourist.png';
import chickenSkewersIllustration from './illustrations/dishes/chicken-skewers.png';
import curryBowlIllustration from './illustrations/dishes/curry-bowl.png';
import deluxeBaoSetIllustration from './illustrations/dishes/deluxe-bao-set.png';
import dessertTeaSetIllustration from './illustrations/dishes/dessert-tea-set.png';
import dumplingsIllustration from './illustrations/dishes/dumplings.png';
import festivalBanquetIllustration from './illustrations/dishes/festival-banquet.png';
import imperialTastingMenuIllustration from './illustrations/dishes/imperial-tasting-menu.png';
import mushroomHotpotIllustration from './illustrations/dishes/mushroom-hotpot.png';
import ramenIllustration from './illustrations/dishes/ramen.png';
import ricePlateIllustration from './illustrations/dishes/rice-plate.png';
import royalSeafoodFeastIllustration from './illustrations/dishes/royal-seafood-feast.png';
import seafoodNoodlesIllustration from './illustrations/dishes/seafood-noodles.png';
import sashimiIllustration from './illustrations/dishes/sashimi.png';
import oysterPlateIllustration from './illustrations/dishes/oyster-plate.png';

import sushiPlatterIllustration from './illustrations/dishes/sushi-platter.png';
import sweetBunIllustration from './illustrations/dishes/sweet-bun.png';
import teaIllustration from './illustrations/dishes/tea.png';

const dishIllustrations: Record<string, string> = {
  'chicken-skewers': chickenSkewersIllustration,
  'curry-bowl': curryBowlIllustration,
  'deluxe-bao-set': deluxeBaoSetIllustration,
  'dessert-tea-set': dessertTeaSetIllustration,
  dumplings: dumplingsIllustration,
  'festival-banquet': festivalBanquetIllustration,
  'imperial-tasting-menu': imperialTastingMenuIllustration,
  'mushroom-hotpot': mushroomHotpotIllustration,
  'ramen-bowl': ramenIllustration,
  'rice-plate': ricePlateIllustration,
  'royal-seafood-feast': royalSeafoodFeastIllustration,
  'seafood-noodles': seafoodNoodlesIllustration,
  sashimi: sashimiIllustration,
  'oyster-plate': oysterPlateIllustration,
  'sushi-platter': sushiPlatterIllustration,
  'sweet-bun': sweetBunIllustration,
  tea: teaIllustration,
};

const customerIllustrations: Record<string, string> = {
  'anime-club': animeClubIllustration,
  'business-executive': businessExecutiveIllustration,
  'celebrity-chef': celebrityChefIllustration,
  'dock-worker': dockWorkerIllustration,
  dockworker: dockWorkerIllustration,
  'festival-judge': festivalJudgeIllustration,
  'food-blogger': foodBloggerIllustration,
  'hungry-student': hungryStudentIllustration,
  'k-pop-band-female': kPopBandFemaleIllustration,
  'maid-cafe-maid': maidCafeMaidIllustration,
  monk: monkIllustration,
  'night-market-kid': nightMarketKidIllustration,
  'night-shift-nurse': nightShiftNurseIllustration,
  salaryman: salarymanIllustration,
  'seafood-lover': seafoodLoverIllustration,
  'soup-regular': soupRegularIllustration,
  'street-musician': streetMusicianIllustration,
  'sumo-wrestler': sumoWrestlerIllustration,
  'tea-auntie': teaAuntieIllustration,
  'temple-caretaker': templeCaretakerIllustration,
  tourist: touristIllustration,
};

export function getDishIllustration(dishId: string) {
  return dishIllustrations[dishId];
}

export function getCustomerIllustration(customerId: string) {
  return customerIllustrations[customerId];
}
