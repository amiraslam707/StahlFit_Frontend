import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@ai_chat_theme_mode';

export async function loadThemeMode() {
  try {
    const value = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch (error) {
    console.log('Failed to load theme mode:', error);
    return null;
  }
}

export async function saveThemeMode(mode) {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (error) {
    console.log('Failed to save theme mode:', error);
  }
}