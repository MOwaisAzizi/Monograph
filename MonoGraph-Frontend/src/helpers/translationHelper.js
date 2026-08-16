export function buildTranslation(titleEn, titleFa, titlePs, description = '') {
  return {
    en: { title: titleEn, description },
    fa: { title: titleFa, description },
    ps: { title: titlePs, description },
  };
}
