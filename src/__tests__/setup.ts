// src/__tests__/setup.ts
// Global test setup — runs before every test file.
// Place at: frontend/src/__tests__/setup.ts

// ─── Mock expo-secure-store ───────────────────────────────
// We use an in-memory store so tests don't touch the real Keychain/Keystore.
const secureStore: Record<string, string> = {};

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn((key: string, value: string) => {
    secureStore[key] = value;
    return Promise.resolve();
  }),
  getItemAsync: jest.fn((key: string) => {
    return Promise.resolve(secureStore[key] ?? null);
  }),
  deleteItemAsync: jest.fn((key: string) => {
    delete secureStore[key];
    return Promise.resolve();
  }),
}));

// ─── Mock expo-router ────────────────────────────────────
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
  }),
  useSegments: () => [],
  useLocalSearchParams: () => ({}),
  Link: ({ children }: { children: React.ReactNode }) => children,
  Slot: () => null,
}));

// ─── Mock expo-font ──────────────────────────────────────
jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
  loadAsync: jest.fn(() => Promise.resolve()),
}));

// ─── Mock expo-splash-screen ─────────────────────────────
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

// ─── Mock expo-constants ─────────────────────────────────
jest.mock('expo-constants', () => ({
  default: { expoConfig: { name: 'MedLink' } },
}));

// ─── Mock react-native AsyncStorage ─────────────────────
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// ─── Mock i18n ───────────────────────────────────────────
jest.mock('../i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn() },
  }),
  default: {
    changeLanguage: jest.fn(() => Promise.resolve()),
    t: (key: string) => key,
  },
}));

// ─── Mock @expo/vector-icons ─────────────────────────────
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
  MaterialIcons: () => null,
}));

// ─── Mock lucide-react-native ────────────────────────────
jest.mock('lucide-react-native', () => new Proxy({}, {
  get: () => () => null,
}));

// ─── Silence console.warn/log in tests (optional) ───────
global.console.warn = jest.fn();
global.console.log = jest.fn();

// ─── Static asset mock ───────────────────────────────────
// frontend/src/__tests__/__mocks__/fileMock.js  (also create this file)