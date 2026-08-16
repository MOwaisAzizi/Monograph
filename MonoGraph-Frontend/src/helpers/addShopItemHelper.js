import { Platform } from 'react-native';
import { DEFAULT_COORDS, WEEK_DAYS } from '../const/generalConst';
import { buildTranslation } from './translationHelper';

export const buildDefaultWorkingHours = () => WEEK_DAYS.map((day) => ({ day, open: '09:00', close: '18:00', isClosed: false }));

export const parseAttributeValue = (raw = '') => {
  const value = String(raw).trim();
  if (value === '') return '';
  if (value === 'true') return true;
  if (value === 'false') return false;
  return Number.isNaN(Number(value)) ? value : Number(value);
};

export const appendMultipartValue = (formData, key, value) => {
  if (value === undefined || value === null || value === '') return;
  formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
};

export const toFormDataFile = async (asset, fallbackName) => {
  const name = asset.fileName || asset.name || fallbackName;
  const type = asset.mimeType || 'image/jpeg';
  if (Platform.OS !== 'web') return { uri: asset.uri, name, type };
  const response = await fetch(asset.uri);
  const blob = await response.blob();
  return new File([blob], name, { type: blob.type || type });
};

const translationFromForm = (form) => buildTranslation(form.titleEn.trim(), form.titleFa.trim(), form.titlePs.trim(), form.description.trim());

export const buildBusinessPayload = async ({ form, coverFile, profileFile }) => {
  const payload = new FormData();
  const social = form.socialLinks.reduce((result, entry) => {
    const platform = entry.platform.trim(); const url = entry.url.trim();
    if (platform && url) result[platform] = url;
    return result;
  }, {});
  appendMultipartValue(payload, 'translation', translationFromForm(form));
  appendMultipartValue(payload, 'category', form.categoryId);
  appendMultipartValue(payload, 'city', form.city || 'herat');
  appendMultipartValue(payload, 'phone', form.phones.map((phone) => phone.trim()).filter(Boolean));
  appendMultipartValue(payload, 'email', form.email.trim());
  appendMultipartValue(payload, 'workingHours', form.workingHours.map((row) => ({ ...row, open: row.isClosed ? null : row.open.trim(), close: row.isClosed ? null : row.close.trim() })));
  appendMultipartValue(payload, 'social', social);
  appendMultipartValue(payload, 'location', { geoPosition: { type: 'Point', coordinates: DEFAULT_COORDS } });
  if (coverFile) payload.append('cover', await toFormDataFile(coverFile, 'business-cover.jpg'));
  if (profileFile) payload.append('profile', await toFormDataFile(profileFile, 'business-profile.jpg'));
  return payload;
};

export const buildItemPayload = async ({ form, galleryFiles }) => {
  const payload = new FormData();
  appendMultipartValue(payload, 'translation', translationFromForm(form));
  appendMultipartValue(payload, 'price', Number(form.price || 0));
  appendMultipartValue(payload, 'shop', form.businessId.trim());
  appendMultipartValue(payload, 'category', form.categoryId.trim());
  appendMultipartValue(payload, 'city', form.city || 'herat');
  appendMultipartValue(payload, 'note', form.note.trim());
  appendMultipartValue(payload, 'attributes', form.attributes.filter((entry) => entry.key.trim()).map((entry) => ({ key: entry.key.trim(), value: parseAttributeValue(entry.value) })));
  appendMultipartValue(payload, 'location', { geoPosition: { type: 'Point', coordinates: DEFAULT_COORDS } });
  for (const file of galleryFiles) payload.append('media', await toFormDataFile(file, 'item-gallery.jpg'));
  return payload;
};

export const businessFormFromShop = (shop = {}) => ({
  titleEn: shop.translation?.en?.title || '', titleFa: shop.translation?.fa?.title || '', titlePs: shop.translation?.ps?.title || '', description: shop.translation?.en?.description || '',
  categoryId: shop.category?._id || shop.category || '', city: shop.city || 'herat', phones: shop.phone?.length ? shop.phone : [''], email: shop.email || '',
  workingHours: shop.workingHours?.length ? shop.workingHours : buildDefaultWorkingHours(), socialLinks: Object.entries(shop.social || {}).map(([platform, url]) => ({ platform, url })),
});

export const itemFormFromItem = (item = {}) => ({
  titleEn: item.translation?.en?.title || '', titleFa: item.translation?.fa?.title || '', titlePs: item.translation?.ps?.title || '', description: item.translation?.en?.description || '',
  price: item.price == null ? '' : String(item.price), businessId: item.shop?._id || item.shop || '', city: item.city || 'herat', categoryId: item.category?._id || item.category || '', note: item.note || '', attributes: item.attributes || [],
});
