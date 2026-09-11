import { create } from 'zustand';

interface BrandingState {
  appName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  textColor: string;
  theme: 'dark' | 'light';
  loadBranding: () => Promise<void>;
}

export const useBrandingStore = create<BrandingState>((set) => ({
  appName: 'JanSetu',
  logoUrl: '',
  primaryColor: '#D8D4C8',
  secondaryColor: '#C8C3B5',
  backgroundColor: '#F8F7F3',
  surfaceColor: '#FFFFFF',
  accentColor: '#2F2F2F',
  successColor: '#6D8B74',
  warningColor: '#C9A86A',
  errorColor: '#B56B6B',
  textColor: '#2F2F2F',
  theme: 'light',
  loadBranding: async () => {
    try {
      // Dynamic branding tokens loadable over-the-air
      set({
        appName: 'JanSetu',
        primaryColor: '#D8D4C8',
        secondaryColor: '#C8C3B5',
        backgroundColor: '#F8F7F3',
        surfaceColor: '#FFFFFF',
        accentColor: '#2F2F2F',
        successColor: '#6D8B74',
        warningColor: '#C9A86A',
        errorColor: '#B56B6B',
        textColor: '#2F2F2F',
        theme: 'light'
      });
    } catch (err) {
      console.warn('[BRANDING STORE] Failed to load dynamic branding:', err);
    }
  }
}));
