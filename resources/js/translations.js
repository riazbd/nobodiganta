/**
 * Backward-compatibility stub.
 * All translation logic has moved to lib/i18n.js + locales/.
 * Existing call sites using t('key', lang) and tArray('key', lang) work unchanged.
 */
export { t, tArray, tPlural } from './lib/i18n';
