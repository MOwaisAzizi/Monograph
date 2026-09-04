import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { getText } from '../i18n';

export function ReviewStars({ rating, size = 14 }) {
    const rounded = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    return <Text style={{ color: '#d99c17', fontSize: size }}>{'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}</Text>;
}

export function RatingInput({ value, onChange }) {
    return (
        <View className="mt-2 flex-row">
            {[1, 2, 3, 4, 5].map((rating) => (
                <Pressable key={rating} onPress={() => onChange(rating)}>
                    <Text style={{ color: rating <= value ? '#d99c17' : '#d6e3e2', fontSize: 27 }}>★</Text>
                </Pressable>
            ))}
        </View>
    );
}

export function ReviewSection({ targetType, reviews, summary, user, onSave, language, navigation }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const maxCount = Math.max(...Object.values(summary.distribution || {}), 1);
    const targetLabel = targetType === 'item' ? getText(language, 'item') : getText(language, 'shop');

    const submit = async () => {
        if (!user) return navigation.navigate('Login');
        if (!comment.trim()) return Alert.alert(getText(language, 'writeReview'), getText(language, 'reviewCommentRequired'));
        try {
            setSaving(true);
            await onSave({ rating, comment: comment.trim() });
            setComment('');
            setShowForm(false);
        } catch (error) {
            Alert.alert(getText(language, 'reviewSaveFailed'), error.response?.data?.message || getText(language, 'tryAgain'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <View className="mt-5">
            <View className="flex-row gap-5">
                <View className="items-center justify-center">
                    <Text className="text-4xl font-bold text-[#eff5f4]">{summary.average.toFixed(1)}</Text>
                    <ReviewStars rating={summary.average} />
                    <Text className="mt-1 text-[11px] text-[#9ab0b0]">{summary.total} {getText(language, 'reviews')}</Text>
                </View>
                <View className="flex-1 justify-center">
                    {[5, 4, 3, 2, 1].map((value) => (
                        <View key={value} className="mb-2 flex-row items-center gap-2">
                            <Text className="w-5 text-[11px] text-[#a9bbbb]">{value}★</Text>
                            <View className="h-1.5 flex-1 overflow-hidden rounded bg-[#d6e3e2]">
                                <View style={{ width: `${((summary.distribution?.[value] || 0) / maxCount) * 100}%` }} className="h-full bg-[#d99c17]" />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
            {reviews.map((review) => (
                <View key={review._id} className="mt-4 border-t border-white/15 pt-4">
                    <Text className="font-semibold text-[#eff5f4]">{review.user?.fullname || getText(language, 'user')}</Text>
                    <View className="flex-row items-center gap-2"><ReviewStars rating={review.rating} size={12} /></View>
                    <Text className="mt-2 text-[13px] leading-5 text-[#c2d1d0]">{review.comment}</Text>
                </View>
            ))}
            {!reviews.length ? <Text className="mt-5 text-[12px] text-[#89a1a1]">{getText(language, 'noReviewsForTarget').replace('{target}', targetLabel)}</Text> : null}
            {showForm ? (
                <View className="rounded-2xl bg-white/10 p-4">
                    <Text className="font-semibold text-[#eff5f4]">{getText(language, 'yourRating')}</Text>
                    <RatingInput value={rating} onChange={setRating} />
                    <TextInput value={comment} onChangeText={setComment} placeholder={getText(language, 'shareExperience')} placeholderTextColor="#9ab0b0" multiline className="mt-2 min-h-[90px] rounded-xl bg-white px-3 py-3 text-[#314243]" />
                    <Pressable onPress={submit} disabled={saving} className="mt-3 rounded-xl bg-[#0f6b75] py-3"><Text className="text-center font-semibold text-white">{saving ? getText(language, 'saving') : getText(language, 'submitReview')}</Text></Pressable>
                </View>
            ) : null}
            <Pressable onPress={() => user ? setShowForm((value) => !value) : navigation.navigate('Login')} className="mt-5 rounded-2xl bg-[#d6e3e2] py-4">
                <Text className="text-center font-semibold text-[#0d4e57]">{showForm ? getText(language, 'cancelReview') : getText(language, 'addReview')}</Text>
            </Pressable>
        </View>
    );
}
