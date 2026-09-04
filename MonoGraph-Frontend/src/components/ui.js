import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ScreenShell({ children, scroll = true, contentClassName = '' }) {
  const content = scroll ? (
    <ScrollView
      className="flex-1"
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className={contentClassName}>{children}</View>
    </ScrollView>
  ) : (
    <View className={`flex-1 ${contentClassName}`}>{children}</View>
  );

  return <View className="flex-1 bg-[#eef5f5]">{content}</View>;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightAction,
  rightIcon = 'search',
  align = 'left',
}) {
  const insets = useSafeAreaInsets();
  const alignClass = align === 'center' ? 'items-center' : 'items-start';

  return (
    <View style={{ paddingTop: insets.top + 8 }} className="flex-row items-center justify-between px-5 pb-4">
      <View className={`flex-1 ${alignClass}`}>
        <View className="flex-row items-center gap-3">
          {onBack ? (
            <Pressable
              onPress={onBack}
              className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-white/85"
            >
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
        <Pressable
          onPress={rightAction}
          className="h-8 w-8 items-center justify-center rounded-full bg-white/85"
        >
          <Ionicons name={rightIcon} size={16} color="#203030" />
        </Pressable>
      ) : null}
    </View>
  );
}

export function DetailHeaderActions({ onBack, onFavorite, favoriteActive = false, isRTL = false }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingTop: insets.top + 8 }}
      className={`absolute inset-x-4 top-0 flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
    >
      <HeaderBackButton onPress={onBack} isRTL={isRTL} className="bg-white/60" />
      <Pressable onPress={onFavorite} className="h-9 w-9 items-center justify-center rounded-full bg-white/60">
        <Ionicons name={favoriteActive ? 'heart' : 'heart-outline'} size={16} color="#2a3535" />
      </Pressable>
    </View>
  );
}

export function HeaderBackButton({ onPress, isRTL = false, className = '' }) {
  return (
    <Pressable onPress={onPress} className={`h-9 w-9 items-center justify-center rounded-full ${className}`}>
      <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={16} color="#2a3535" />
    </Pressable>
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
      <Text className={`text-[11px] font-semibold ${active ? 'text-white' : 'text-[#506364]'}`}>
        {label}
      </Text>
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
      <Text className="mt-1 text-[10px] font-semibold uppercase tracking-[1px] text-[#7c9090]">
        {label}
      </Text>
    </View>
  );
}

export function ActionPill({ label, onPress, active = false }) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-4 py-2 ${active ? 'border-[#0f6b75] bg-[#0f6b75]' : 'border-[#d7e1e0] bg-white'}`}
    >
      <Text className={`text-[12px] font-semibold ${active ? 'text-white' : 'text-[#314243]'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SubmitButton({
  label,
  onPress,
  loading,
  loadingLabel = 'Submitting...',
  className = '',
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className={`mt-3 rounded-2xl px-4 py-3 ${loading ? 'bg-[#96afb0]' : 'bg-[#0f6b75]'} ${className}`}
    >
      <Text className="text-center text-[13px] font-semibold text-white">
        {loading ? loadingLabel : label}
      </Text>
    </Pressable>
  );
}

export function SectionLabel({ children }) {
  return <Text className="mt-4 mb-1 text-[12px] font-semibold text-[#314243]">{children}</Text>;
}

export function ImagePickerButton({ label, onPress, selectedCount = 0 }) {
  return (
    <Pressable onPress={onPress} className="rounded-2xl border border-[#d7e1e0] bg-white px-4 py-3">
      <Text className="text-[12px] font-semibold text-[#0f6b75]">
        {selectedCount > 0 ? `${label} (${selectedCount})` : label}
      </Text>
    </Pressable>
  );
}

export function SelectField({
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
          <Pressable className="max-h-[70%] rounded-t-3xl bg-white p-4" onPress={() => { }}>
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

export function ListEditor({ items, onChange, placeholder, addLabel, keyboardType }) {
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

export function SocialEditor({ items, onChange }) {
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

export function AttributeEditor({ items, onChange }) {
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

export function WorkingHoursEditor({ items, onChange }) {
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
