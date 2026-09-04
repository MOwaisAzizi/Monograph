import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const HERAT = { lat: 34.3482, lng: 62.1997 };

const locationFrom = (value) => {
    const coordinates = value?.geoPosition?.coordinates || value?.coordinates;
    return Array.isArray(coordinates) && coordinates.length === 2
        ? { lng: Number(coordinates[0]), lat: Number(coordinates[1]) }
        : null;
};

const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { headers: { Accept: 'application/json' } },
        );
        const result = await response.json();
        const address = result?.address || {};
        return {
            fullAddress: result?.display_name || '',
            area: address.suburb || address.city_district || address.city || address.county || '',
            street: [address.road, address.neighbourhood || address.hamlet].filter(Boolean).join(', '),
            details: [address.house_number, address.building, address.amenity].filter(Boolean).join(', '),
        };
    } catch {
        return null;
    }
};

export default function LocationPickerMap({
    mode,
    initialLocation,
    onLocationSelected,
    fields = {},
    onFieldsChange,
}) {
    const [selected, setSelected] = useState(() => locationFrom(initialLocation));
    const [region, setRegion] = useState({
        latitude: selected?.lat ?? HERAT.lat,
        longitude: selected?.lng ?? HERAT.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    const [findingLocation, setFindingLocation] = useState(false);

    useEffect(() => {
        const nextSelected = locationFrom(initialLocation);
        setSelected(nextSelected);
        if (nextSelected) {
            setRegion({
                latitude: nextSelected.lat,
                longitude: nextSelected.lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        }
    }, [initialLocation]);

    const selectLocation = async ({ lat, lng }) => {
        const mapped = { lat, lng };
        setSelected(mapped);
        setRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        });

        const address = await reverseGeocode(lat, lng);
        if (address && onFieldsChange) {
            onFieldsChange((current) => ({
                ...current,
                ...(mode === 'profile'
                    ? { fullAddress: current.fullAddress || address.fullAddress }
                    : {
                        area: current.area || address.area,
                        street: current.street || address.street,
                        details: current.details || address.details,
                    }),
            }));
        }
    };

    const useCurrentLocation = async () => {
        try {
            setFindingLocation(true);
            const geolocation = globalThis.navigator?.geolocation;
            if (!geolocation) {
                Alert.alert('Location unavailable', 'Your device does not support geolocation.');
                return;
            }

            geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    selectLocation({ lat: latitude, lng: longitude });
                    setFindingLocation(false);
                },
                () => {
                    Alert.alert('Location unavailable', 'Your current location could not be determined.');
                    setFindingLocation(false);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
            );
        } catch {
            Alert.alert('Location unavailable', 'Your current location could not be determined.');
        } finally {
            setFindingLocation(false);
        }
    };

    const updateField = (key, value) => onFieldsChange?.((current) => ({ ...current, [key]: value }));

    const markerCoordinate = useMemo(
        () => (selected ? { latitude: selected.lat, longitude: selected.lng } : null),
        [selected],
    );

    return (
        <View className="gap-3 rounded-2xl border border-[#d7e1e0] bg-white p-3">
            <Text className="text-[13px] font-semibold text-[#213233]">Choose location</Text>
            <View className="h-64 overflow-hidden rounded-xl">
                <MapView
                    style={{ flex: 1 }}
                    region={region}
                    onPress={(event) => selectLocation({
                        lat: event.nativeEvent.coordinate.latitude,
                        lng: event.nativeEvent.coordinate.longitude,
                    })}
                    showsUserLocation={false}
                >
                    {markerCoordinate ? (
                        <Marker coordinate={markerCoordinate}>
                            <View className="h-5 w-5 rounded-full border-2 border-white bg-[#c0392b]" />
                        </Marker>
                    ) : null}
                </MapView>
            </View>
            <View className="flex-row gap-2">
                <Pressable
                    onPress={useCurrentLocation}
                    disabled={findingLocation}
                    className="flex-1 rounded-xl border border-[#0f6b75] px-3 py-3"
                >
                    <Text className="text-center text-[12px] font-semibold text-[#0f6b75]">
                        {findingLocation ? 'Locating...' : 'Use my current location'}
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => selected && onLocationSelected?.(selected.lat, selected.lng)}
                    disabled={!selected}
                    className={`flex-1 rounded-xl px-3 py-3 ${selected ? 'bg-[#0f6b75]' : 'bg-[#aababa]'}`}
                >
                    <Text className="text-center text-[12px] font-semibold text-white">Confirm location</Text>
                </Pressable>
            </View>
            {mode === 'profile' ? (
                <TextInput
                    value={fields.fullAddress || ''}
                    onChangeText={(value) => updateField('fullAddress', value)}
                    placeholder="Full address"
                    placeholderTextColor="#8ba0a0"
                    className="rounded-xl border border-[#d9e5e4] px-3 py-3 text-[#213233]"
                />
            ) : (
                <View className="gap-2">
                    <TextInput
                        value={fields.area || ''}
                        onChangeText={(value) => updateField('area', value)}
                        placeholder="Area / District"
                        placeholderTextColor="#8ba0a0"
                        className="rounded-xl border border-[#d9e5e4] px-3 py-3 text-[#213233]"
                    />
                    <TextInput
                        value={fields.street || ''}
                        onChangeText={(value) => updateField('street', value)}
                        placeholder="Street / Landmark"
                        placeholderTextColor="#8ba0a0"
                        className="rounded-xl border border-[#d9e5e4] px-3 py-3 text-[#213233]"
                    />
                    <TextInput
                        value={fields.details || ''}
                        onChangeText={(value) => updateField('details', value)}
                        placeholder="Details"
                        placeholderTextColor="#8ba0a0"
                        className="rounded-xl border border-[#d9e5e4] px-3 py-3 text-[#213233]"
                    />
                </View>
            )}
        </View>
    );
}

