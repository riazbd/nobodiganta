import { common } from './common';
import { pages } from './pages';
import { widgets } from './widgets';
import { admin } from './admin';

/**
 * Merged Bengali locale — flat dot-notation key object.
 * Import this in lib/i18n.js as the 'bn' locale.
 */
export const bn = {
  ...common,
  ...pages,
  ...widgets,
  ...admin,
};
