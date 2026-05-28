import { describe, expect, it } from 'vitest';
import {
  getCustomerIllustration,
  getDishIllustration,
} from './illustration-map';

describe('illustration-map', () => {
  it('returns provided dish illustration assets by dish id', () => {
    expect(getDishIllustration('chicken-skewers')).toContain('chicken-skewers');
    expect(getDishIllustration('dessert-tea-set')).toContain('dessert-tea-set');
    expect(getDishIllustration('imperial-tasting-menu')).toContain(
      'imperial-tasting-menu',
    );
    expect(getDishIllustration('ramen-bowl')).toContain('ramen');
    expect(getDishIllustration('sake')).toContain('sake');
    expect(getDishIllustration('tea')).toContain('tea');
  });

  it('returns provided customer illustration assets by customer id', () => {
    expect(getCustomerIllustration('business-executive')).toContain(
      'business-executive',
    );
    expect(getCustomerIllustration('dock-worker')).toContain('dock-worker');
    expect(getCustomerIllustration('hungry-student')).toContain(
      'hungry-student',
    );
    expect(getCustomerIllustration('festival-judge')).toContain(
      'festival-judge',
    );
    expect(getCustomerIllustration('k-pop-band-female')).toContain(
      'k-pop-band-female',
    );
  });
});
