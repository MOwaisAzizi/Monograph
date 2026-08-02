import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_LANGUAGE, normalizeLanguage } from '../../i18n';

const languageSlice = createSlice({
    name: 'language',
    initialState: {
        currentLanguage: DEFAULT_LANGUAGE,
    },
    reducers: {
        setLanguage: (state, action) => {
            state.currentLanguage = normalizeLanguage(action.payload);
        },
    },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
