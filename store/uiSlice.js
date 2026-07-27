import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { isDrawerOpen: false },
  reducers: {
    openDrawer: (state) => { state.isDrawerOpen = true; },
    closeDrawer: (state) => { state.isDrawerOpen = false; },
  },
});

export const { openDrawer, closeDrawer } = uiSlice.actions;
export default uiSlice.reducer;