const previewEnabledValue = process.env.EXPO_PUBLIC_UI_PREVIEW;
const previewScreenValue = process.env.EXPO_PUBLIC_UI_PREVIEW_SCREEN;

const isTruthyPreviewFlag =
  previewEnabledValue === 'true' ||
  previewEnabledValue === '1' ||
  previewEnabledValue === 'yes' ||
  previewEnabledValue === 'on';

// In local development, default to preview mode unless explicitly disabled.
export const DEV_PREVIEW_ENABLED =
  isTruthyPreviewFlag || (__DEV__ && previewEnabledValue !== 'false');

export const DEV_PREVIEW_USER = {
  id: 'dev-preview-user',
  username: 'preview.user',
  fullname: 'UI Preview User',
  email: 'preview@example.com',
  phone: '0123456789',
  address: 'Ho Chi Minh City',
  birth_date: '2000-01-01',
  gender: 'male',
  activity_level: 'moderately_active',
  target_goal: 'maintain',
  avatar_url: 'https://i.pravatar.cc/150?img=12',
};

const normalizePreviewScreen = (value) => {
  if (!value) return 'home';
  return value.trim().toLowerCase();
};

export const DEV_PREVIEW_SCREEN = normalizePreviewScreen(previewScreenValue);

const AUTH_SCREEN_MAP = {
  login: 'Login',
  register: 'Register',
  forgotpassword: 'ForgotPassword',
  'forgot-password': 'ForgotPassword',
};

const APP_PREVIEW_MAP = {
  home: { tab: 'Home' },
  meals: { tab: 'Meals' },
  health: { tab: 'Health', healthScreen: 'HealthCenter' },
  workout: { tab: 'Health', healthScreen: 'Workout' },
  dashboard: { tab: 'Dashboard' },
  forum: { tab: 'Forum' },
  profile: { tab: 'More', moreScreen: 'Profile' },
  docs: { tab: 'More', moreScreen: 'Docs' },
  aichat: { tab: 'More', moreScreen: 'AIChat' },
  'ai-chat': { tab: 'More', moreScreen: 'AIChat' },
};

export function getPreviewAuthRoute() {
  return AUTH_SCREEN_MAP[DEV_PREVIEW_SCREEN] || null;
}

export function getPreviewAppConfig() {
  return APP_PREVIEW_MAP[DEV_PREVIEW_SCREEN] || APP_PREVIEW_MAP.home;
}

export function isPreviewingAuthScreen() {
  return !!getPreviewAuthRoute();
}
