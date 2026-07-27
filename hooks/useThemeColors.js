import { useSelector } from 'react-redux';
import { lightColors, darkColors } from '../theme/colors';

export default function useThemeColors() {
  const mode = useSelector((state) => state.theme.mode);
  return mode === 'dark' ? darkColors : lightColors;
}

export function useThemeMode() {
  return useSelector((state) => state.theme.mode);
}