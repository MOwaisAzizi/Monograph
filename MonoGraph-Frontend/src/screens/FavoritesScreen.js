import React from 'react';
import { Text, View } from 'react-native';
import { ScreenShell, ScreenHeader } from '../components/ui';

export default function FavoritesScreen({ navigation }) {
    return (
        <ScreenShell contentClassName="px-5 pb-6 pt-4">
            <ScreenHeader title="Favorites" rightAction={() => navigation.navigate('Search')} />
            <View className="mt-8 rounded-[24px] border border-dashed border-white/20 bg-white/5 px-4 py-5">
                <Text className="text-[12px] text-[#89a1a1]">Favorite items and shops will appear here when backend data is connected.</Text>
            </View>
        </ScreenShell>
    );
}