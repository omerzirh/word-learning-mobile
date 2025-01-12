import { useColorScheme } from 'react-native';

export interface ThemeColors {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  card: string;
  border: string;
  success: string;
  error: string;
}

const lightTheme: ThemeColors = {
  background: '#f5f5f5',
  text: '#000000',
  primary: '#007AFF',
  secondary: '#666666',
  card: '#ffffff',
  border: '#e5e5ea',
  success: '#34c759',
  error: '#ff3b30',
};

const darkTheme: ThemeColors = {
  background: '#000000',
  text: '#ffffff',
  primary: '#0a84ff',
  secondary: '#999999',
  card: '#1c1c1e',
  border: '#38383a',
  success: '#32d74b',
  error: '#ff453a',
};

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkTheme : lightTheme;

  return {
    isDark,
    colors,
  };
}; 