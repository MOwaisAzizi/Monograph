import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { ScreenShell, TextField } from '../components/ui';

const DEFAULT_COORDS = [62.1907, 34.3529];

const BUSINESS_TYPES = [
  'restaurant',
  'cafe',
  'bakery',
  'fast_food',
  'clothing_store',
  'shoe_store',
  'electronics_store',
  'mobile_store',
  'supermarket',
  'pharmacy',
  'cosmetics_store',
  'furniture_store',
  'bookstore',
  'beauty_salon',
  'barbershop',
  'repair_shop',
  'car_wash',
  'car_dealer',
  'car_rental',
  'mechanic',
  'hotel',
  'guest_house',
  'clinic',
  'gym',
];

const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Only these two cities are supported for now.
const CITY_OPTIONS = ['herat', 'kabul'];

function buildTranslation(titleEn, titleFa, titlePs, description = '') {
  return {
    en: { title: titleEn, description },
    fa: { title: titleFa, description },
    ps: { title: titlePs, description },
  };
}

function buildDefaultWorkingHours() {
  return WEEK_DAYS.map((day) => ({ day, open: '09:00', close: '18:00', isClosed: false }));
}

function SubmitButton({ label, onPress, loading }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className={`mt-3 rounded-2xl px-4 py-3 ${loading ? 'bg-[#96afb0]' : 'bg-[#0f6b75]'}`}
    >
      <Text className="text-center text-[13px] font-semibold text-white">
        {loading ? 'Submitting...' : label}
      </Text>
    </Pressable>
  );
}

function SectionLabel({ children }) {
  return <Text className="mt-4 mb-1 text-[12px] font-semibold text-[#314243]">{children}</Text>;
}

// Generic dropdown: tap the field to open a bottom-sheet list of options.
// `options` can be plain strings or objects — pass getLabel/getValue to
// tell it how to read a display label and a value out of each option.
function SelectField({
  label,
  placeholder,
  value,
  options,
  onSelect,
  loading = false,
  getLabel = (option) => option,
  getValue = (option) => option,
}) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => getValue(option) === value);
  const displayLabel = selectedOption ? getLabel(selectedOption) : placeholder;

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={loading}
        className="flex-row items-center justify-between rounded-2xl border border-[#d7e1e0] bg-white px-4 py-3"
      >
        <Text className={`text-[13px] ${selectedOption ? 'text-[#314243]' : 'text-[#99acac]'}`}>
          {loading ? 'Loading...' : displayLabel}
        </Text>
        <Text className="text-[11px] text-[#99acac]">▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable className="max-h-[70%] rounded-t-3xl bg-white p-4" onPress={() => {}}>
            {label ? (
              <Text className="mb-2 text-[13px] font-semibold text-[#314243]">{label}</Text>
            ) : null}
            <ScrollView>
              {options.length === 0 ? (
                <Text className="py-3 text-[12px] text-[#99acac]">No options available.</Text>
              ) : (
                options.map((option) => {
                  const optionValue = getValue(option);
                  const optionLabel = getLabel(option);
                  const isSelected = optionValue === value;
                  return (
                    <Pressable
                      key={optionValue}
                      onPress={() => {
                        onSelect(optionValue);
                        setOpen(false);
                      }}
                      className={`rounded-xl px-3 py-3 ${isSelected ? 'bg-[#e5f1f1]' : ''}`}
                    >
                      <Text
                        className={`text-[13px] ${isSelected ? 'font-semibold text-[#0f6b75]' : 'text-[#314243]'}`}
                      >
                        {optionLabel}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ListEditor({ items, onChange, placeholder, addLabel, keyboardType }) {
  const updateAt = (index, value) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const removeAt = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <View>
      {items.map((value, index) => (
        <View key={index} className="mb-2 flex-row items-center gap-2">
          <View className="flex-1">
            <TextField
              placeholder={placeholder}
              value={value}
              onChangeText={(text) => updateAt(index, text)}
              keyboardType={keyboardType}
              autoCapitalize="none"
            />
          </View>
          <Pressable
            onPress={() => removeAt(index)}
            className="rounded-full bg-[#f1e4e4] px-3 py-2"
          >
            <Text className="text-[11px] font-semibold text-[#a33d3d]">Remove</Text>
          </Pressable>
        </View>
      ))}
      <Pressable
        onPress={() => onChange([...items, ''])}
        className="self-start rounded-full border border-[#0f6b75] px-3 py-2"
      >
        <Text className="text-[11px] font-semibold text-[#0f6b75]">{addLabel}</Text>
      </Pressable>
    </View>
  );
}

function SocialEditor({ items, onChange }) {
  const updateAt = (index, field, value) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const removeAt = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <View>
      {items.map((entry, index) => (
        <View key={index} className="mb-2 gap-2">
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <TextField
                placeholder="Platform (e.g. instagram)"
                value={entry.platform}
                onChangeText={(text) => updateAt(index, 'platform', text)}
                autoCapitalize="none"
              />
            </View>
            <Pressable
              onPress={() => removeAt(index)}
              className="rounded-full bg-[#f1e4e4] px-3 py-2"
            >
              <Text className="text-[11px] font-semibold text-[#a33d3d]">Remove</Text>
            </Pressable>
          </View>
          <TextField
            placeholder="URL"
            value={entry.url}
            onChangeText={(text) => updateAt(index, 'url', text)}
            autoCapitalize="none"
          />
        </View>
      ))}
      <Pressable
        onPress={() => onChange([...items, { platform: '', url: '' }])}
        className="self-start rounded-full border border-[#0f6b75] px-3 py-2"
      >
        <Text className="text-[11px] font-semibold text-[#0f6b75]">Add social link</Text>
      </Pressable>
    </View>
  );
}

function AttributeEditor({ items, onChange }) {
  const updateAt = (index, field, value) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const removeAt = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <View>
      {items.map((entry, index) => (
        <View key={index} className="mb-2 gap-2">
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <TextField
                placeholder="Attribute key (e.g. size, color)"
                value={entry.key}
                onChangeText={(text) => updateAt(index, 'key', text)}
                autoCapitalize="none"
              />
            </View>
            <Pressable
              onPress={() => removeAt(index)}
              className="rounded-full bg-[#f1e4e4] px-3 py-2"
            >
              <Text className="text-[11px] font-semibold text-[#a33d3d]">Remove</Text>
            </Pressable>
          </View>
          <TextField
            placeholder="Value (e.g. Large, red, 42, true)"
            value={entry.value}
            onChangeText={(text) => updateAt(index, 'value', text)}
          />
        </View>
      ))}
      <Pressable
        onPress={() => onChange([...items, { key: '', value: '' }])}
        className="self-start rounded-full border border-[#0f6b75] px-3 py-2"
      >
        <Text className="text-[11px] font-semibold text-[#0f6b75]">Add attribute</Text>
      </Pressable>
    </View>
  );
}

// `attributes[].value` is Schema.Types.Mixed on the backend — coerce numbers/
// booleans from plain text input so e.g. "42" becomes 42, not "42".
function coerceAttributeValue(raw) {
  const trimmed = raw.trim();
  if (trimmed === '') return '';
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (!Number.isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed);
  return trimmed;
}

function WorkingHoursEditor({ items, onChange }) {
  const updateAt = (index, field, value) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  return (
    <View>
      {items.map((row, index) => (
        <View key={row.day} className="mb-2 rounded-2xl border border-[#e3ebea] p-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px] font-semibold capitalize text-[#314243]">{row.day}</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-[11px] text-[#99acac]">Closed</Text>
              <Switch
                value={row.isClosed}
                onValueChange={(value) => updateAt(index, 'isClosed', value)}
              />
            </View>
          </View>

          {!row.isClosed ? (
            <View className="mt-2 flex-row gap-2">
              <View className="flex-1">
                <TextField
                  placeholder="Open (HH:mm)"
                  value={row.open}
                  onChangeText={(text) => updateAt(index, 'open', text)}
                />
              </View>
              <View className="flex-1">
                <TextField
                  placeholder="Close (HH:mm)"
                  value={row.close}
                  onChangeText={(text) => updateAt(index, 'close', text)}
                />
              </View>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export default function AddListingScreen() {
  const [tab, setTab] = useState('business');

  const [businessTitleEn, setBusinessTitleEn] = useState('');
  const [businessTitleFa, setBusinessTitleFa] = useState('');
  const [businessTitlePs, setBusinessTitlePs] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [businessType, setBusinessType] = useState('restaurant');
  const [city, setCity] = useState('herat');
  const [phones, setPhones] = useState(['']);
  const [email, setEmail] = useState('');
  const [workingHours, setWorkingHours] = useState(buildDefaultWorkingHours());
  const [socialLinks, setSocialLinks] = useState([]);
  const [mediaUrls, setMediaUrls] = useState(['']);

  const [itemTitleEn, setItemTitleEn] = useState('');
  const [itemTitleFa, setItemTitleFa] = useState('');
  const [itemTitlePs, setItemTitlePs] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [itemCity, setItemCity] = useState('herat');
  const [categoryId, setCategoryId] = useState('');
  const [itemNote, setItemNote] = useState('');
  const [itemAttributes, setItemAttributes] = useState([]);
  const [itemMediaUrls, setItemMediaUrls] = useState(['']);

  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const auth = useSelector((state) => state.auth);

  const authHeader = useMemo(() => {
    if (!auth?.accessToken) return null;
    return { Authorization: `Bearer ${auth.accessToken}` };
  }, [auth?.accessToken]);

  // Populate the Business/Category dropdowns on the item form once the
  // user is logged in. The endpoint returns the current user's shops.
  // own businesses and GET /category returns the full category list —
  // adjust the endpoints/params if yours differ.
  useEffect(() => {
    if (!authHeader) return;

    let cancelled = false;

    const loadBusinesses = async () => {
      try {
        setLoadingBusinesses(true);
        const response = await api.baseURL.get('/shops?owner=me', { headers: authHeader });
        console.log('response');
        console.log(response);
        const list = response?.data?.data.shops || [];
        if (!cancelled) setBusinesses(Array.isArray(list) ? list : []);
      } catch (error) {
        console.log('Error loading businesses:', error);
      } finally {
        if (!cancelled) setLoadingBusinesses(false);
      }
    };

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await api.baseURL.get('/category');
        console.log('Category response:');
        const list = response?.data.data?.categories || [];
        console.log(list);
        console.log('Category response:');

        if (!cancelled) setCategories(Array.isArray(list) ? list : []);
      } catch (error) {
        console.log('Error loading categories:', error);
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    };

    loadBusinesses();
    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [authHeader]);

  const ensureAuth = () => {
    if (!authHeader) {
      Alert.alert('Login required', 'Please log in first. This action is user-specific.');
      return false;
    }

    return true;
  };

  const resetBusinessForm = () => {
    setBusinessTitleEn('');
    setBusinessTitleFa('');
    setBusinessTitlePs('');
    setBusinessDescription('');
    setBusinessType('restaurant');
    setCity('herat');
    setPhones(['']);
    setEmail('');
    setWorkingHours(buildDefaultWorkingHours());
    setSocialLinks([]);
    setMediaUrls(['']);
  };

  const submitBusiness = async () => {
    if (!ensureAuth()) return;

    if (!businessTitleEn.trim() || !businessTitleFa.trim() || !businessTitlePs.trim()) {
      Alert.alert('Missing fields', 'Please add business titles for EN, FA, and PS.');
      return;
    }

    const cleanedPhones = phones.map((p) => p.trim()).filter(Boolean);
    const cleanedMedia = mediaUrls.map((u) => u.trim()).filter(Boolean);
    const cleanedSocial = socialLinks
      .map((entry) => ({ platform: entry.platform.trim(), url: entry.url.trim() }))
      .filter((entry) => entry.platform && entry.url);
    const cleanedHours = workingHours.map((row) => ({
      day: row.day,
      isClosed: row.isClosed,
      open: row.isClosed ? null : row.open.trim(),
      close: row.isClosed ? null : row.close.trim(),
    }));

    try {
      setSubmitting(true);

      const social = cleanedSocial.reduce((acc, entry) => {
        acc[entry.platform] = entry.url;
        return acc;
      }, {});

      await api.baseURL.post(
        '/shops',
        {
          translation: buildTranslation(
            businessTitleEn.trim(),
            businessTitleFa.trim(),
            businessTitlePs.trim(),
            businessDescription.trim(),
          ),
          shopType: businessType,
          city: city.trim() || 'herat',
          phone: cleanedPhones,
          email: email.trim() || undefined,
          workingHours: cleanedHours,
          social,
          // Assumes mediaSchema accepts { url }. Adjust if your schema differs.
          media: cleanedMedia.map((url) => ({ url })),
          location: {
            geoPosition: {
              type: 'Point',
              coordinates: DEFAULT_COORDS,
            },
          },
        },
        { headers: authHeader },
      );

      resetBusinessForm();
      navigation.navigate('MainTabs', { screen: 'Home' });

      Alert.alert('Success', 'Business added successfully for your account.');
    } catch (error) {
      console.log('Error adding business:', error);
      const message =
        error?.response?.data?.message || 'Could not add business. Check your input and try again.';
      Alert.alert('Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitItem = async () => {
    if (!ensureAuth()) return;

    if (!itemTitleEn.trim() || !itemTitleFa.trim() || !itemTitlePs.trim() || !businessId.trim()) {
      Alert.alert('Missing fields', 'Please fill EN/FA/PS titles and business ID.');
      return;
    }

    const cleanedAttributes = itemAttributes
      .map((entry) => ({ key: entry.key.trim(), value: entry.value }))
      .filter((entry) => entry.key)
      .map((entry) => ({ key: entry.key, value: coerceAttributeValue(String(entry.value)) }));
    const cleanedMedia = itemMediaUrls.map((u) => u.trim()).filter(Boolean);

    try {
      setSubmitting(true);

      await api.baseURL.post(
        '/item',
        {
          translation: buildTranslation(
            itemTitleEn.trim(),
            itemTitleFa.trim(),
            itemTitlePs.trim(),
            itemDescription.trim(),
          ),
          price: Number(itemPrice || 0),
          shop: businessId.trim(),
          category: categoryId.trim() || undefined,
          city: itemCity.trim() || 'herat',
          note: itemNote.trim() || undefined,
          attributes: cleanedAttributes,
          // Assumes mediaSchema accepts { url }. Adjust if your schema differs.
          media: cleanedMedia.map((url) => ({ url })),
          location: {
            geoPosition: {
              type: 'Point',
              coordinates: DEFAULT_COORDS,
            },
          },
        },
        { headers: authHeader },
      );

      setItemTitleEn('');
      setItemTitleFa('');
      setItemTitlePs('');
      setItemDescription('');
      setItemPrice('');
      setBusinessId('');
      setItemCity('herat');
      setCategoryId('');
      setItemNote('');
      setItemAttributes([]);
      setItemMediaUrls(['']);

      navigation.navigate('MainTabs', { screen: 'Home' });
      Alert.alert('Success', 'Item added successfully for your account.');
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'Could not add item. Ensure business ID belongs to your account.';
      Alert.alert('Failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenShell contentClassName="px-5 pb-8 pt-4">
      <Text className="text-[12px] text-[#99acac]">
        Add a shop (business) or item. Each record is linked to the logged-in user.
      </Text>

      <View className="mt-4 flex-row gap-2">
        <Pressable
          onPress={() => setTab('business')}
          className={`rounded-full border px-4 py-2 ${
            tab === 'business' ? 'border-[#0f6b75] bg-[#0f6b75]' : 'border-[#d7e1e0] bg-white'
          }`}
        >
          <Text
            className={`text-[12px] font-semibold ${tab === 'business' ? 'text-white' : 'text-[#314243]'}`}
          >
            Add Business
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setTab('item')}
          className={`rounded-full border px-4 py-2 ${
            tab === 'item' ? 'border-[#0f6b75] bg-[#0f6b75]' : 'border-[#d7e1e0] bg-white'
          }`}
        >
          <Text
            className={`text-[12px] font-semibold ${tab === 'item' ? 'text-white' : 'text-[#314243]'}`}
          >
            Add Item
          </Text>
        </Pressable>
      </View>

      {tab === 'business' ? (
        <View className="mt-4 gap-3">
          <TextField
            placeholder="Business title (EN)"
            value={businessTitleEn}
            onChangeText={setBusinessTitleEn}
          />
          <TextField
            placeholder="Business title (FA)"
            value={businessTitleFa}
            onChangeText={setBusinessTitleFa}
          />
          <TextField
            placeholder="Business title (PS)"
            value={businessTitlePs}
            onChangeText={setBusinessTitlePs}
          />
          <TextField
            placeholder="Description"
            value={businessDescription}
            onChangeText={setBusinessDescription}
            multiline
          />

          <SectionLabel>Business type</SectionLabel>
          <SelectField
            label="Select business type"
            placeholder="Select business type"
            value={businessType}
            options={BUSINESS_TYPES}
            onSelect={setBusinessType}
            getLabel={(type) => type.replace(/_/g, ' ')}
            getValue={(type) => type}
          />

          <SectionLabel>City</SectionLabel>
          <SelectField
            label="Select city"
            placeholder="Select city"
            value={city}
            options={CITY_OPTIONS}
            onSelect={setCity}
            getLabel={(c) => c.charAt(0).toUpperCase() + c.slice(1)}
            getValue={(c) => c}
          />

          <SectionLabel>Email</SectionLabel>
          <TextField
            placeholder="Business email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <SectionLabel>Phone numbers</SectionLabel>
          <ListEditor
            items={phones}
            onChange={setPhones}
            placeholder="Phone number"
            addLabel="Add phone number"
            keyboardType="phone-pad"
          />

          <SectionLabel>Working hours</SectionLabel>
          <WorkingHoursEditor items={workingHours} onChange={setWorkingHours} />

          <SectionLabel>Social links</SectionLabel>
          <SocialEditor items={socialLinks} onChange={setSocialLinks} />

          <SectionLabel>Media (image URLs)</SectionLabel>
          <ListEditor
            items={mediaUrls}
            onChange={setMediaUrls}
            placeholder="Image URL"
            addLabel="Add image URL"
          />

          <SubmitButton label="Submit Business" onPress={submitBusiness} loading={submitting} />
        </View>
      ) : (
        <View className="mt-4 gap-3">
          <TextField
            placeholder="Item title (EN)"
            value={itemTitleEn}
            onChangeText={setItemTitleEn}
          />
          <TextField
            placeholder="Item title (FA)"
            value={itemTitleFa}
            onChangeText={setItemTitleFa}
          />
          <TextField
            placeholder="Item title (PS)"
            value={itemTitlePs}
            onChangeText={setItemTitlePs}
          />
          <TextField
            placeholder="Description"
            value={itemDescription}
            onChangeText={setItemDescription}
            multiline
          />
          <TextField
            placeholder="Price"
            value={itemPrice}
            onChangeText={setItemPrice}
            keyboardType="decimal-pad"
          />
          <SectionLabel>Business</SectionLabel>
          <SelectField
            label="Select your business"
            placeholder="Select business"
            value={businessId}
            options={businesses}
            onSelect={setBusinessId}
            loading={loadingBusinesses}
            getLabel={(b) => b?.translation?.en?.title || b?.name || b?._id}
            getValue={(b) => b?._id}
          />

          <SectionLabel>Category</SectionLabel>
          <SelectField
            label="Select category"
            placeholder="Select category (optional)"
            value={categoryId}
            options={categories}
            onSelect={setCategoryId}
            loading={loadingCategories}
            getLabel={(c) => c?.translation?.en?.title || c?.name || c?._id}
            getValue={(c) => c?._id}
          />

          <SectionLabel>City</SectionLabel>
          <SelectField
            label="Select city"
            placeholder="Select city"
            value={itemCity}
            options={CITY_OPTIONS}
            onSelect={setItemCity}
            getLabel={(c) => c.charAt(0).toUpperCase() + c.slice(1)}
            getValue={(c) => c}
          />
          <TextField
            placeholder="Note (max 500 characters, optional)"
            value={itemNote}
            onChangeText={setItemNote}
            multiline
            maxLength={500}
          />

          <SectionLabel>Attributes</SectionLabel>
          <AttributeEditor items={itemAttributes} onChange={setItemAttributes} />

          <SectionLabel>Media (image URLs)</SectionLabel>
          <ListEditor
            items={itemMediaUrls}
            onChange={setItemMediaUrls}
            placeholder="Image URL"
            addLabel="Add image URL"
          />

          <SubmitButton label="Submit Item" onPress={submitItem} loading={submitting} />
        </View>
      )}

      {submitting ? <ActivityIndicator className="mt-4" /> : null}
    </ScreenShell>
  );
}
