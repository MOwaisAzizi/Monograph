// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
// import { Camera, LocationManager, Map, Marker } from '@maplibre/maplibre-react-native';

// const HERAT = { lat: 34.3482, lng: 62.1997 };
// const MAP_STYLE_URL = 'https://demotiles.maplibre.org/style.json';

// const locationFrom = (value) => {
//   const coordinates = value?.geoPosition?.coordinates || value?.coordinates;
//   return Array.isArray(coordinates) && coordinates.length === 2
//     ? { lng: Number(coordinates[0]), lat: Number(coordinates[1]) }
//     : null;
// };

// const reverseGeocode = async (lat, lng) => {
//   try {
//     const response = await fetch(
//       `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
//       { headers: { Accept: 'application/json' } },
//     );
//     const result = await response.json();
//     const address = result?.address || {};
//     return {
//       fullAddress: result?.display_name || '',
//       area: address.suburb || address.city_district || address.city || address.county || '',
//       street: [address.road, address.neighbourhood || address.hamlet].filter(Boolean).join(', '),
//       details: [address.house_number, address.building, address.amenity].filter(Boolean).join(', '),
//     };
//   } catch {
//     return null;
//   }
// };

// // Extra controlled props keep the component reusable while its public picker API remains simple.
// export default function LocationPickerMap({
//   mode,
//   initialLocation,
//   onLocationSelected,
//   fields = {},
//   onFieldsChange,
//   styleURL = MAP_STYLE_URL,
// }) {
//   const [selected, setSelected] = useState(() => locationFrom(initialLocation));
//   const [findingLocation, setFindingLocation] = useState(false);

//   useEffect(() => setSelected(locationFrom(initialLocation)), [initialLocation]);

//   const selectLocation = async ({ lat, lng }) => {
//     setSelected({ lat, lng });
//     const address = await reverseGeocode(lat, lng);
//     if (address && onFieldsChange) {
//       onFieldsChange((current) => ({
//         ...current,
//         ...(mode === 'profile'
//           ? { fullAddress: current.fullAddress || address.fullAddress }
//           : {
//               area: current.area || address.area,
//               street: current.street || address.street,
//               details: current.details || address.details,
//             }),
//       }));
//     }
//   };

//   const useCurrentLocation = async () => {
//     try {
//       setFindingLocation(true);
//       const allowed = await LocationManager.requestPermissions();
//       if (!allowed) return Alert.alert('Location permission', 'Location permission was not granted.');
//       const position = await LocationManager.getCurrentPosition();
//       if (!position) return Alert.alert('Location unavailable', 'Your current location could not be determined.');
//       selectLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
//     } catch {
//       Alert.alert('Location unavailable', 'Your current location could not be determined.');
//     } finally {
//       setFindingLocation(false);
//     }
//   };

//   const updateField = (key, value) => onFieldsChange?.((current) => ({ ...current, [key]: value }));

//   return (
//     <View className="gap-3 rounded-2xl border border-[#d7e1e0] bg-white p-3">
//       <Text className="text-[13px] font-semibold text-[#213233]">Choose location</Text>
//       <View className="h-64 overflow-hidden rounded-xl">
//         <Map mapStyle={styleURL} onPress={(event) => selectLocation(event.nativeEvent.lngLat)}>
//           <Camera centerCoordinate={[selected?.lng || HERAT.lng, selected?.lat || HERAT.lat]} zoomLevel={12} />
//           {selected ? (
//             <Marker id="selected-location" lngLat={[selected.lng, selected.lat]}>
//               <View className="h-5 w-5 rounded-full border-2 border-white bg-[#c0392b]" />
//             </Marker>
//           ) : null}
//         </Map>
//       </View>
//       <View className="flex-row gap-2">
//         <Pressable onPress={useCurrentLocation} disabled={findingLocation} className="flex-1 rounded-xl border border-[#0f6b75] px-3 py-3">
//           <Text className="text-center text-[12px] font-semibold text-[#0f6b75]">{findingLocation ? 'Locating...' : 'Use my current location'}</Text>
//         </Pressable>
//         <Pressable onPress={() => selected && onLocationSelected(selected.lat, selected.lng)} disabled={!selected} className={`flex-1 rounded-xl px-3 py-3 ${selected ? 'bg-[#0f6b75]' : 'bg-[#aababa]'}`}>
//           <Text className="text-center text-[12px] font-semibold text-white">Confirm location</Text>
//         </Pressable>
//       </View>
//       {mode === 'profile' ? (
//         <TextInput value={fields.fullAddress || ''} onChangeText={(value) => updateField('fullAddress', value)} placeholder="Full address" placeholderTextColor="#8ba0a0" className="rounded-xl border border-[#d9e5e4] px-3 py-3 text-[#213233]" />
//       ) : (
//         <View className="gap-2">
//           <TextInput value={fields.area || ''} onChangeText={(value) => updateField('area', value)} placeholder="Area / District" placeholderTextColor="#8ba0a0" className="rounded-xl border border-[#d9e5e4] px-3 py-3 text-[#213233]" />
//           <TextInput value={fields.street || ''} onChangeText={(value) => updateField('street', value)} placeholder="Street / Landmark" placeholderTextColor="#8ba0a0" className="rounded-xl border border-[#d9e5e4] px-3 py-3 text-[#213233]" />
//           <TextInput value={fields.details || ''} onChangeText={(value) => updateField('details', value)} placeholder="Details" placeholderTextColor="#8ba0a0" className="rounded-xl border border-[#d9e5e4] px-3 py-3 text-[#213233]" />
//         </View>
//       )}
//     </View>
//   );
// }
