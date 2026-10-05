export interface ProfileTheme {
  preset: string;
  primaryColor: string;
  backgroundColor: string;
  backgroundType: 'color' | 'gradient' | 'dark';
  cardStyle: 'rounded' | 'pill' | 'sharp' | 'glass';
  buttonStyle: 'filled' | 'outline' | 'soft' | 'glass';
  fontFamily: 'system' | 'serif' | 'mono';
}

export const DEFAULT_THEME: ProfileTheme = {
  preset: 'default',
  primaryColor: '#0284c7',
  backgroundColor: '#f8fafc',
  backgroundType: 'color',
  cardStyle: 'rounded',
  buttonStyle: 'filled',
  fontFamily: 'system',
};

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  theme: ProfileTheme;
  previewBg: string;
  previewPrimary: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    name: 'Thanh lịch (Mặc định)',
    description: 'Phong cách tối giản, sáng sủa và trang nhã',
    previewBg: '#f8fafc',
    previewPrimary: '#0284c7',
    theme: {
      preset: 'default',
      primaryColor: '#0284c7',
      backgroundColor: '#f8fafc',
      backgroundType: 'color',
      cardStyle: 'rounded',
      buttonStyle: 'filled',
      fontFamily: 'system',
    },
  },
  {
    id: 'ocean',
    name: 'Đại dương sâu',
    description: 'Gradient xanh dương cao cấp hiện đại',
    previewBg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    previewPrimary: '#38bdf8',
    theme: {
      preset: 'ocean',
      primaryColor: '#38bdf8',
      backgroundColor: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
      backgroundType: 'gradient',
      cardStyle: 'glass',
      buttonStyle: 'glass',
      fontFamily: 'system',
    },
  },
  {
    id: 'emerald',
    name: 'Ngọc bích thiên nhiên',
    description: 'Tông xanh lục tươi mát, tràn đầy năng lượng',
    previewBg: '#f0fdf4',
    previewPrimary: '#059669',
    theme: {
      preset: 'emerald',
      primaryColor: '#059669',
      backgroundColor: '#f0fdf4',
      backgroundType: 'color',
      cardStyle: 'rounded',
      buttonStyle: 'soft',
      fontFamily: 'system',
    },
  },
  {
    id: 'sunset',
    name: 'Hoàng hôn rực rỡ',
    description: 'Ấm áp, nổi bật với cam vàng pastel',
    previewBg: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
    previewPrimary: '#ea580c',
    theme: {
      preset: 'sunset',
      primaryColor: '#ea580c',
      backgroundColor: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
      backgroundType: 'gradient',
      cardStyle: 'pill',
      buttonStyle: 'filled',
      fontFamily: 'system',
    },
  },
  {
    id: 'dark',
    name: 'Huyền bí ban đêm',
    description: 'Chế độ tối sang trọng, tương phản cao',
    previewBg: '#09090b',
    previewPrimary: '#a855f7',
    theme: {
      preset: 'dark',
      primaryColor: '#a855f7',
      backgroundColor: '#09090b',
      backgroundType: 'dark',
      cardStyle: 'rounded',
      buttonStyle: 'outline',
      fontFamily: 'system',
    },
  },
  {
    id: 'glass',
    name: 'Kính mờ thời thượng',
    description: 'Hiệu ứng kính mờ glassmorphism trên nền gradient',
    previewBg: 'linear-gradient(135deg, #e0e7ff 0%, #fae8ff 100%)',
    previewPrimary: '#6366f1',
    theme: {
      preset: 'glass',
      primaryColor: '#6366f1',
      backgroundColor: 'linear-gradient(135deg, #e0e7ff 0%, #fae8ff 100%)',
      backgroundType: 'gradient',
      cardStyle: 'glass',
      buttonStyle: 'glass',
      fontFamily: 'system',
    },
  },
  {
    id: 'minimal',
    name: 'Tối giản thuần khiết',
    description: 'Trắng đen cổ điển, sắc nét và chuyên nghiệp',
    previewBg: '#ffffff',
    previewPrimary: '#000000',
    theme: {
      preset: 'minimal',
      primaryColor: '#18181b',
      backgroundColor: '#ffffff',
      backgroundType: 'color',
      cardStyle: 'sharp',
      buttonStyle: 'outline',
      fontFamily: 'system',
    },
  },
];

export function parseTheme(raw: unknown): ProfileTheme {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_THEME;
  }
  const obj = raw as Partial<ProfileTheme>;
  const matchedPreset = THEME_PRESETS.find((p) => p.id === obj.preset)?.theme || DEFAULT_THEME;

  return {
    preset: obj.preset || matchedPreset.preset,
    primaryColor: obj.primaryColor || matchedPreset.primaryColor,
    backgroundColor: obj.backgroundColor || matchedPreset.backgroundColor,
    backgroundType: obj.backgroundType || matchedPreset.backgroundType,
    cardStyle: obj.cardStyle || matchedPreset.cardStyle,
    buttonStyle: obj.buttonStyle || matchedPreset.buttonStyle,
    fontFamily: obj.fontFamily || matchedPreset.fontFamily,
  };
}
