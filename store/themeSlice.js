import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadThemeMode } from './themeStorage';

export const hydrateTheme = createAsyncThunk(
  'theme/hydrateTheme',
  async () => {
    const mode = await loadThemeMode();
    return mode;
  }
);

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: 'light',
    hydrated: false,
  },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateTheme.fulfilled, (state, action) => {
      if (action.payload === 'light' || action.payload === 'dark') {
        state.mode = action.payload;
      }
      state.hydrated = true;
    });
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;