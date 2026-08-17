import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import api from '../services/api';
import {
  AttributeEditor,
  ImagePickerButton,
  ListEditor,
  ScreenShell,
  SectionLabel,
  SelectField,
  SocialEditor,
  SubmitButton,
  TextField,
  WorkingHoursEditor,
} from '../components/ui';
import { CITIES } from '../const/generalConst';
import {
  buildBusinessPayload,
  buildDefaultWorkingHours,
  buildItemPayload,
  businessFormFromShop,
  itemFormFromItem,
} from '../helpers/addShopItemHelper';
import { useCategories } from '../hooks/useCategories';
import { useMyItems } from '../hooks/useMyItems';
import { useMyShops } from '../hooks/useMyShops';

export default function AddListingScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState('business');

  const [businessTitleEn, setBusinessTitleEn] = useState('');
  const [businessTitleFa, setBusinessTitleFa] = useState('');
  const [businessTitlePs, setBusinessTitlePs] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [businessCategoryId, setBusinessCategoryId] = useState('');
  const [city, setCity] = useState('herat');
  const [phones, setPhones] = useState(['']);
  const [email, setEmail] = useState('');
  const [workingHours, setWorkingHours] = useState(buildDefaultWorkingHours());
  const [socialLinks, setSocialLinks] = useState([]);

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
  const [editingBusinessId, setEditingBusinessId] = useState('');
  const [editingItemId, setEditingItemId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [businessCoverFile, setBusinessCoverFile] = useState(null);
  const [businessProfileFile, setBusinessProfileFile] = useState(null);
  const [itemGalleryFiles, setItemGalleryFiles] = useState([]);
  const auth = useSelector((state) => state.auth);
  const currentLanguage = useSelector((state) => state.language.currentLanguage);

  const authHeader = useMemo(() => {
    if (!auth?.accessToken) return null;
    return { Authorization: `Bearer ${auth.accessToken}` };
  }, [auth?.accessToken]);

  const { shops, loading: loadingShops } = useMyShops(authHeader);
  const { categories, loading: loadingCategories } = useCategories(currentLanguage);
  const { items: ownedItems } = useMyItems(authHeader);

  const ensureAuth = () => {
    if (!authHeader) {
      Alert.alert('Login required', 'Please log in first. This action is user-specific.');
      return false;
    }

    return true;
  };

  const resetBusinessForm = () => {
    setEditingBusinessId('');
    setBusinessTitleEn('');
    setBusinessTitleFa('');
    setBusinessTitlePs('');
    setBusinessDescription('');
    setBusinessCategoryId('');
    setCity('herat');
    setPhones(['']);
    setEmail('');
    setWorkingHours(buildDefaultWorkingHours());
    setSocialLinks([]);
  };

  const resetItemForm = () => {
    setEditingItemId('');
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
    setItemGalleryFiles([]);
  };

  const fillBusinessForm = useCallback((shop) => {
    if (!shop) return;
    const form = businessFormFromShop(shop);
    setEditingBusinessId(shop._id || '');
    setBusinessTitleEn(form.titleEn);
    setBusinessTitleFa(form.titleFa);
    setBusinessTitlePs(form.titlePs);
    setBusinessDescription(form.description);
    setBusinessCategoryId(form.categoryId);
    setCity(form.city);
    setPhones(form.phones);
    setEmail(form.email);
    setWorkingHours(form.workingHours);
    setSocialLinks(form.socialLinks);
    setBusinessCoverFile(null);
    setBusinessProfileFile(null);
  }, []);

  const fillItemForm = useCallback((item) => {
    if (!item) return;
    const form = itemFormFromItem(item);
    setEditingItemId(item._id || '');
    setItemTitleEn(form.titleEn);
    setItemTitleFa(form.titleFa);
    setItemTitlePs(form.titlePs);
    setItemDescription(form.description);
    setItemPrice(form.price);
    setBusinessId(form.businessId);
    setItemCity(form.city);
    setCategoryId(form.categoryId);
    setItemNote(form.note);
    setItemAttributes(form.attributes);
    setItemGalleryFiles([]);
  }, []);

  const pickLocalImage = async (kind) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted)
      return Alert.alert('Permission needed', 'Please allow access to your photo library.');
    const isGallery = kind === 'item-gallery';
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: !isGallery,
      allowsMultipleSelection: isGallery,
    });
    if (result.canceled || !result.assets?.length) return;
    if (kind === 'business-cover') setBusinessCoverFile(result.assets[0]);
    else if (kind === 'business-profile') setBusinessProfileFile(result.assets[0]);
    else setItemGalleryFiles(result.assets);
  };

  const submitBusiness = async () => {
    if (!ensureAuth()) return;
    if (![businessTitleEn, businessTitleFa, businessTitlePs].every((title) => title.trim()))
      return Alert.alert('Missing fields', 'Please add business titles for EN, FA, and PS.');
    try {
      setSubmitting(true);
      const payload = await buildBusinessPayload({
        form: {
          titleEn: businessTitleEn,
          titleFa: businessTitleFa,
          titlePs: businessTitlePs,
          description: businessDescription,
          categoryId: businessCategoryId,
          city,
          phones,
          email,
          workingHours,
          socialLinks,
        },
        coverFile: businessCoverFile,
        profileFile: businessProfileFile,
      });
      const isUpdating = Boolean(editingBusinessId);
      await (isUpdating
        ? api.baseURL.patch(`/shop/${editingBusinessId}`, payload, { headers: authHeader })
        : api.baseURL.post('/shop', payload, { headers: authHeader }));
      resetBusinessForm();
      navigation.navigate('MainTabs', { screen: 'Home' });
      Alert.alert(
        'Success',
        isUpdating ? 'Business updated successfully.' : 'Business added successfully.',
      );
    } catch (error) {
      Alert.alert('Failed', error?.response?.data?.message || 'Could not save business.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitItem = async () => {
    if (!ensureAuth()) return;
    if (![itemTitleEn, itemTitleFa, itemTitlePs, businessId].every((value) => value.trim()))
      return Alert.alert('Missing fields', 'Please fill EN/FA/PS titles and select a business.');
    try {
      setSubmitting(true);
      const payload = await buildItemPayload({
        form: {
          titleEn: itemTitleEn,
          titleFa: itemTitleFa,
          titlePs: itemTitlePs,
          description: itemDescription,
          price: itemPrice,
          businessId,
          city: itemCity,
          categoryId,
          note: itemNote,
          attributes: itemAttributes,
        },
        galleryFiles: itemGalleryFiles,
      });
      const isUpdating = Boolean(editingItemId);
      await (isUpdating
        ? api.baseURL.patch(`/item/${editingItemId}`, payload, { headers: authHeader })
        : api.baseURL.post('/item', payload, { headers: authHeader }));
      resetItemForm();
      navigation.navigate('MainTabs', { screen: 'Home' });
      Alert.alert(
        'Success',
        isUpdating ? 'Item updated successfully.' : 'Item added successfully.',
      );
    } catch (error) {
      Alert.alert('Failed', error?.response?.data?.message || 'Could not save item.');
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
            {editingBusinessId ? 'Update Business' : 'Add Business'}
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
            {editingItemId ? 'Update Item' : 'Add Item'}
          </Text>
        </Pressable>
      </View>

      {tab === 'business' ? (
        <View className="mt-4 gap-3">
          {shops.length > 0 && (
            <>
              <SectionLabel>Update an existing business</SectionLabel>
              <SelectField
                label="Select business to update"
                placeholder="Select business to update"
                value={editingBusinessId}
                options={shops}
                onSelect={(id) => fillBusinessForm(shops.find((business) => business._id === id))}
                getLabel={(business) => business?.translation?.en?.title || business?._id}
                getValue={(business) => business?._id}
              />
            </>
          )}
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

          <SectionLabel>Category</SectionLabel>
          <SelectField
            label="Select business category"
            placeholder="Select business category"
            value={businessCategoryId}
            options={categories}
            onSelect={setBusinessCategoryId}
            loading={loadingCategories}
            getLabel={(category) =>
              category?.translation?.en?.title || category?.name || category?._id
            }
            getValue={(category) => category?._id}
          />

          <SectionLabel>City</SectionLabel>
          <SelectField
            label="Select city"
            placeholder="Select city"
            value={city}
            options={CITIES}
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

          <SectionLabel>Media</SectionLabel>
          <View className="gap-2">
            <ImagePickerButton
              label={businessCoverFile ? 'Change cover image' : 'Add cover image'}
              onPress={() => pickLocalImage('business-cover')}
              selectedCount={businessCoverFile ? 1 : 0}
            />
            <ImagePickerButton
              label={businessProfileFile ? 'Change profile image' : 'Add profile image'}
              onPress={() => pickLocalImage('business-profile')}
              selectedCount={businessProfileFile ? 1 : 0}
            />
          </View>

          <SubmitButton
            label={editingBusinessId ? 'Update Business' : 'Submit Business'}
            onPress={submitBusiness}
            loading={submitting}
          />
        </View>
      ) : (
        <View className="mt-4 gap-3">
          {ownedItems.length > 0 && (
            <>
              <SectionLabel>Update an existing item</SectionLabel>
              <SelectField
                label="Select item to update"
                placeholder="Select item to update"
                value={editingItemId}
                options={ownedItems}
                onSelect={(id) => fillItemForm(ownedItems.find((item) => item._id === id))}
                getLabel={(item) => item?.translation?.en?.title || item?._id}
                getValue={(item) => item?._id}
              />
            </>
          )}
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
            options={shops}
            onSelect={setBusinessId}
            loading={loadingShops}
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
            options={CITIES}
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

          <SectionLabel>Media</SectionLabel>
          <ImagePickerButton
            label={itemGalleryFiles.length > 0 ? 'Add item image' : 'Add item image'}
            onPress={() => pickLocalImage('item-gallery')}
            selectedCount={itemGalleryFiles.length}
          />

          <SubmitButton
            label={editingItemId ? 'Update Item' : 'Submit Item'}
            onPress={submitItem}
            loading={submitting}
          />
        </View>
      )}

      {submitting ? <ActivityIndicator className="mt-4" /> : null}
    </ScreenShell>
  );
}
