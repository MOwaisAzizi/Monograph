import React from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function ScreenShell({ children, scroll = true, contentClassName = '', backgroundClassName = 'bg-[#123534]' }) {
    const content = scroll ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName={contentClassName}>
            {children}
        </ScrollView>
    ) : (
        <View className={contentClassName}>{children}</View>
    );

    return <SafeAreaView className={`flex-1 ${backgroundClassName}`}>{content}</SafeAreaView>;
}

export function ScreenHeader({ title, subtitle, onBack, rightAction, rightIcon = 'search', align = 'left' }) {
    const alignClass = align === 'center' ? 'items-center' : 'items-start';

    return (
        <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
            <View className={`flex-1 ${alignClass}`}>
                <View className="flex-row items-center gap-3">
                    {onBack ? (
                        <Pressable onPress={onBack} className="h-8 w-8 items-center justify-center rounded-full bg-white/85">
                            <Ionicons name="chevron-back" size={16} color="#203030" />
                        </Pressable>
                    ) : null}
                    <View>
                        <Text className="text-[18px] font-bold text-[#233334]">{title}</Text>
                        {subtitle ? <Text className="mt-1 text-[11px] text-[#7f9292]">{subtitle}</Text> : null}
                    </View>
                </View>
            </View>

            {rightAction ? (
                <Pressable onPress={rightAction} className="h-8 w-8 items-center justify-center rounded-full bg-white/85">
                    <Ionicons name={rightIcon} size={16} color="#203030" />
                </Pressable>
            ) : null}
        </View>
    );
}

export function SectionHeader({ title, actionLabel, onAction }) {
    return (
        <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-[15px] font-bold text-[#243233]">{title}</Text>
            {actionLabel ? (
                <Pressable onPress={onAction}>
                    <Text className="text-[11px] font-semibold text-[#16717d]">{actionLabel}</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

export function Chip({ label, active = false, onPress, compact = false }) {
    return (
        <Pressable
            onPress={onPress}
            className={`rounded-full border px-3 ${compact ? 'py-1' : 'py-1.5'} ${active ? 'border-[#0f6b75] bg-[#0f6b75]' : 'border-[#d7e1e0] bg-white'
                }`}
        >
            <Text className={`text-[11px] font-semibold ${active ? 'text-white' : 'text-[#506364]'}`}>{label}</Text>
        </Pressable>
    );
}

export function IconCircleButton({ icon, onPress, active = false }) {
    return (
        <Pressable
            onPress={onPress}
            className={`h-9 w-9 items-center justify-center rounded-full ${active ? 'bg-[#0f6b75]' : 'bg-white/85'}`}
        >
            <Ionicons name={icon} size={16} color={active ? '#fff' : '#304244'} />
        </Pressable>
    );
}

export function TextField(props) {
    return (
        <View className="rounded-2xl border border-[#d9e5e4] bg-white px-4 py-3">
            <TextInput
                placeholderTextColor="#8ba0a0"
                {...props}
                className="p-0 text-[13px] text-[#213233]"
            />
        </View>
    );
}

export function StatTile({ value, label }) {
    return (
        <View className="flex-1 rounded-2xl bg-white px-4 py-3">
            <Text className="text-[16px] font-bold text-[#1f3132]">{value}</Text>
            <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[1px] text-[#7c9090]">{label}</Text>
        </View>
    );
}

export function ActionPill({ label, onPress, active = false }) {
    return (
        <Pressable
            onPress={onPress}
            className={`rounded-full border px-4 py-2 ${active ? 'border-[#0f6b75] bg-[#0f6b75]' : 'border-[#d7e1e0] bg-white'}`}
        >
            <Text className={`text-[12px] font-semibold ${active ? 'text-white' : 'text-[#314243]'}`}>{label}</Text>
        </Pressable>
    );
}