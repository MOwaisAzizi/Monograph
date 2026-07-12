
import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    selected: null,
  },
  reducers: {
    setProducts: (state, action) => {
      state.items = action.payload;
    },
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
  },
});

export const { setProducts, setSelected } = productSlice.actions;
export default productSlice.reducer;
