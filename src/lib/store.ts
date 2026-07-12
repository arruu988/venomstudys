import { create } from 'zustand';

interface ViewerState {
  isOpen: boolean;
  driveUrl: string | null;
  title: string;
  testId: string | null;
  openViewer: (driveUrl: string, title: string, testId: string) => void;
  closeViewer: () => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  isOpen: false,
  driveUrl: null,
  title: '',
  testId: null,
  openViewer: (driveUrl, title, testId) => set({ isOpen: true, driveUrl, title, testId }),
  closeViewer: () => set({ isOpen: false, driveUrl: null, title: '', testId: null }),
}));

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  toggleTheme: () => set((state) => {
    const newDark = !state.isDark;
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { isDark: newDark };
  }),
}));
