/**
 * Shared Medha Email Design Tokens & Styles
 * ─────────────────────────────────────────
 * Centralized brand colors and reusable inline styles for all email templates.
 */

// ── Brand Colors (Warm Theme) ──
const colors = {
  // Warm palette (Welcome, Feature, Reset emails)
  warmBg: '#fffaf0',
  warmCardBg: '#ffffff',
  warmBorder: '#fde68a',
  warmAccent: '#ea580c',
  warmAccentAlt: '#c2410c',
  warmAmber: '#b45309',
  warmGold: '#d97706',
  warmYellowBg: '#fffbeb',
  warmYellowBorder: '#fbbf24',
  warmFooterBg: '#fffcf2',
  warmFooterBorder: '#fef3c7',
  warmText: '#57534e',
  warmTextDark: '#78350f',
  warmTextMuted: '#78716c',
  warmTextLight: '#a8a29e',

  // Dark palette (OTP, Dark-themed emails)
  darkBg: '#1A1A2E',
  darkCardBg: '#F9F6F1',
  darkBorder: '#E8E4DC',
  darkAccent: '#7DC67A',
  darkAccentAlt: '#8B5CF6',
  darkText: '#1A1A2E',
  darkTextMuted: '#6B6B6B',
  darkTextLight: '#9A9A9A',
  otpBg: '#F2EDE4',

  // CodeLearnn palette
  clDark: '#0a0a0f',
  clCardBg: '#12121a',
  clBorder: '#2a2a3e',
  clLime: '#c8fa3c',
  clText: '#ffffff',
  clMuted: '#a0a0b0',
  clTeal: '#2dd4bf',

  // General
  white: '#ffffff',
  black: '#1a1a1a',
  whatsappGreen: '#25D366',
};

// ── Shared Style Objects ──
const fontFamily = "'Quicksand', 'Segoe UI', Candara, 'Bitstream Vera Sans', 'DejaVu Sans', Geneva, sans-serif";
const fontFamilyOutfit = "'Outfit', 'Quicksand', 'Georgia', 'Times New Roman', serif";
const fontFamilySerif = "'Georgia', 'Times New Roman', serif";
const fontFamilyMono = "'Courier New', monospace";
const fontFamilySystem = "'Segoe UI', Roboto, Arial, sans-serif";
const fontFamilyInter = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// ── Medha Links ──
const links = {
  website: 'https://medha-revision.vercel.app/',
  medhaStudy: 'https://medha.study',
  whatsappGroup: 'https://chat.whatsapp.com/JmtlAAnbEiX59FWeMDAvsj',
  logoUrl: 'https://ik.imagekit.io/ayushrathore1/MEDHA%20Revision%20Logo%20(5)/6.svg?updatedAt=1767677218473',
  logoWhiteUrl: 'https://ik.imagekit.io/ayushrathore1/MEDHA%20Revision%20Logo%20(5)/8.svg?updatedAt=1767677218616',
};

// ── CodeLearnn Links ──
const clLinks = {
  website: 'https://www.codelearnn.com',
  waitlist: 'https://www.codelearnn.com',
  vibeCodingGuide: 'https://www.codelearnn.com/learning-guides/vibe-coding',
  twitter: 'https://twitter.com/codelearnnhq',
  linkedin: 'https://linkedin.com/company/codelearnn',
  feedbackEmail: 'weareteamclarity@gmail.com',
  unsubscribe: 'https://www.codelearnn.com/unsubscribe',
};

module.exports = {
  colors,
  fontFamily,
  fontFamilyOutfit,
  fontFamilySerif,
  fontFamilyMono,
  fontFamilySystem,
  fontFamilyInter,
  links,
  clLinks,
};
