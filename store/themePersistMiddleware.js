import { saveThemeMode } from './themeStorage';

const PERSIST_ACTIONS = ['theme/toggleTheme', 'theme/setTheme'];

const themePersistMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (PERSIST_ACTIONS.includes(action.type)) {
    const state = store.getState();
    saveThemeMode(state.theme.mode);
  }

  return result;
};

export default themePersistMiddleware;