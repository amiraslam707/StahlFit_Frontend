import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';
import uiReducer from './uiSlice';
import chatPersistMiddleware from './chatPersistMiddleware';

import themeReducer from './themeSlice';
import themePersistMiddleware from './themePersistMiddleware';


export const store = configureStore({
  reducer: {
    chat: chatReducer,
    ui: uiReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(chatPersistMiddleware).concat(chatPersistMiddleware, themePersistMiddleware),
});

export default store;