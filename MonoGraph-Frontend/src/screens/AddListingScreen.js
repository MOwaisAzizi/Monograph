import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { ScreenShell, TextField } from '../components/ui';

const DEFAULT_COORDS = [62.1907, 34.3529];

function buildTranslation(titleEn, titleFa, titlePs, description = '') {
    return {
        en: { title: titleEn, description },
        fa: { title: titleFa, description },
        ps: { title: titlePs, description },
    };
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

export default function AddListingScreen() {
    const [tab, setTab] = useState('business');

    const [businessTitleEn, setBusinessTitleEn] = useState('');
    const [businessTitleFa, setBusinessTitleFa] = useState('');
    const [businessTitlePs, setBusinessTitlePs] = useState('');
    const [businessDescription, setBusinessDescription] = useState('');
    const [businessType, setBusinessType] = useState('restaurant');

    const [itemTitleEn, setItemTitleEn] = useState('');
    const [itemTitleFa, setItemTitleFa] = useState('');
    const [itemTitlePs, setItemTitlePs] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [businessId, setBusinessId] = useState('');

    const [submitting, setSubmitting] = useState(false);

    const auth = useSelector((state) => state.auth);

    const authHeader = useMemo(() => {
        if (!auth?.token) return null;
        return { Authorization: `Bearer ${auth.token}` };
    }, [auth?.token]);

    const ensureAuth = () => {
        if (!authHeader) {
            Alert.alert('Login required', 'Please log in first. This action is user-specific.');
            return false;
        }

        return true;
    };

    const submitBusiness = async () => {
        if (!ensureAuth()) return;

        if (!businessTitleEn.trim() || !businessTitleFa.trim() || !businessTitlePs.trim()) {
            Alert.alert('Missing fields', 'Please add business titles for EN, FA, and PS.');
            return;
        }

        try {
            setSubmitting(true);

            await api.post(
                '/business',
                {
                    translation: buildTranslation(
                        businessTitleEn.trim(),
                        businessTitleFa.trim(),
                        businessTitlePs.trim(),
                        businessDescription.trim(),
                    ),
                    businessType: businessType.trim() || 'restaurant',
                    location: {
                        geoPosition: {
                            type: 'Point',
                            coordinates: DEFAULT_COORDS,
                        },
                    },
                },
                { headers: authHeader },
            );

            setBusinessTitleEn('');
            setBusinessTitleFa('');
            setBusinessTitlePs('');
            setBusinessDescription('');
            setBusinessType('restaurant');

            Alert.alert('Success', 'Business added successfully for your account.');
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                'Could not add business. Check your input and try again.';
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

        try {
            setSubmitting(true);

            await api.post(
                '/item',
                {
                    translation: buildTranslation(
                        itemTitleEn.trim(),
                        itemTitleFa.trim(),
                        itemTitlePs.trim(),
                        itemDescription.trim(),
                    ),
                    price: Number(itemPrice || 0),
                    business: businessId.trim(),
                    attributes: [],
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
                    className={`rounded-full border px-4 py-2 ${tab === 'business' ? 'border-[#0f6b75] bg-[#0f6b75]' : 'border-[#d7e1e0] bg-white'
                        }`}
                >
                    <Text className={`text-[12px] font-semibold ${tab === 'business' ? 'text-white' : 'text-[#314243]'}`}>
                        Add Business
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => setTab('item')}
                    className={`rounded-full border px-4 py-2 ${tab === 'item' ? 'border-[#0f6b75] bg-[#0f6b75]' : 'border-[#d7e1e0] bg-white'
                        }`}
                >
                    <Text className={`text-[12px] font-semibold ${tab === 'item' ? 'text-white' : 'text-[#314243]'}`}>
                        Add Item
                    </Text>
                </Pressable>
            </View>

            {tab === 'business' ? (
                <View className="mt-4 gap-3">
                    <TextField placeholder="Business title (EN)" value={businessTitleEn} onChangeText={setBusinessTitleEn} />
                    <TextField placeholder="Business title (FA)" value={businessTitleFa} onChangeText={setBusinessTitleFa} />
                    <TextField placeholder="Business title (PS)" value={businessTitlePs} onChangeText={setBusinessTitlePs} />
                    <TextField placeholder="Description" value={businessDescription} onChangeText={setBusinessDescription} multiline />
                    <TextField
                        placeholder="Business type (e.g. restaurant, cafe)"
                        value={businessType}
                        onChangeText={setBusinessType}
                    />

                    <SubmitButton label="Submit Business" onPress={submitBusiness} loading={submitting} />
                </View>
            ) : (
                <View className="mt-4 gap-3">
                    <TextField placeholder="Item title (EN)" value={itemTitleEn} onChangeText={setItemTitleEn} />
                    <TextField placeholder="Item title (FA)" value={itemTitleFa} onChangeText={setItemTitleFa} />
                    <TextField placeholder="Item title (PS)" value={itemTitlePs} onChangeText={setItemTitlePs} />
                    <TextField placeholder="Description" value={itemDescription} onChangeText={setItemDescription} multiline />
                    <TextField
                        placeholder="Price"
                        value={itemPrice}
                        onChangeText={setItemPrice}
                        keyboardType="decimal-pad"
                    />
                    <TextField
                        placeholder="Business ID (must be yours)"
                        value={businessId}
                        onChangeText={setBusinessId}
                        autoCapitalize="none"
                    />

                    <SubmitButton label="Submit Item" onPress={submitItem} loading={submitting} />
                </View>
            )}

            {submitting ? <ActivityIndicator className="mt-4" /> : null}
        </ScreenShell>
    );
}
