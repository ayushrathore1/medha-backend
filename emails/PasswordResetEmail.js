const React = require('react');
const { Text, Heading, Section, Button, Hr, Link } = require('react-email');
const { MedhaLayout } = require('./components/Layout');
const { colors, fontFamilySerif, fontFamily } = require('./components/styles');
const h = React.createElement;

/**
 * Password Reset Email
 * Used for both user-initiated and admin-triggered password resets.
 * @param {object} props
 * @param {string} props.name - User's name
 * @param {string} props.resetUrl - Password reset URL
 * @param {number} [props.ttlMinutes] - Token expiry in minutes (default 30)
 */
function PasswordResetEmail({ name, resetUrl, ttlMinutes = 30 }) {
  return h(MedhaLayout, {
    preview: `Reset your Medha Revision password. Link expires in ${ttlMinutes} minutes.`,
    variant: 'warm',
    decoration: '✨ 🔐 ✨',
  },
    // ── Title ──
    h(Heading, {
      as: 'h1',
      style: {
        fontFamily: fontFamilySerif,
        color: colors.warmAmber,
        margin: '0 0 20px 0',
        fontSize: '32px',
        textAlign: 'center',
        fontWeight: 'normal',
      },
    }, 'Reset Password'),

    // ── Greeting ──
    h(Text, {
      style: {
        textAlign: 'center',
        color: colors.warmTextMuted,
        fontSize: '16px',
        lineHeight: '1.7',
      },
    }, 'Hi ', h('strong', null, name || 'Student'), ', you requested to reset your password.'),

    // ── Relatable Message ──
    h('div', {
      style: {
        backgroundColor: colors.warmYellowBg,
        border: `1px dashed ${colors.warmYellowBorder}`,
        borderRadius: '16px',
        padding: '30px',
        margin: '25px 0',
        textAlign: 'center',
      },
    },
      h(Text, {
        style: {
          margin: '0',
          fontSize: '16px',
          color: '#92400e',
          fontFamily: fontFamilySerif,
          lineHeight: '1.6',
        },
      }, '"No worries! It happens to the best of us. Let\'s get you back to your revision."')
    ),

    // ── Instructions ──
    h(Text, {
      style: {
        textAlign: 'center',
        color: colors.warmText,
        fontSize: '16px',
        lineHeight: '1.7',
      },
    }, 'Click the button below to set a new password. This link is valid for ',
      h('strong', null, `${ttlMinutes} minutes`), '.'),

    // ── CTA Button ──
    h('div', {
      style: { textAlign: 'center', margin: '40px 0' },
    },
      h(Button, {
        href: resetUrl,
        style: {
          backgroundColor: colors.warmGold,
          color: colors.white,
          padding: '14px 30px',
          borderRadius: '50px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '16px',
        },
      }, 'Set New Password')
    ),

    // ── Disclaimer ──
    h(Text, {
      style: {
        margin: '0',
        textAlign: 'center',
        fontSize: '14px',
        color: colors.warmTextLight,
      },
    }, "If you didn't request this, you can safely ignore this email."),

    // ── Signature ──
    h(Hr, {
      style: { borderTop: `1px solid ${colors.warmFooterBorder}`, margin: '30px 0' },
    }),
    h('div', { style: { textAlign: 'center' } },
      h(Text, {
        style: {
          margin: '0',
          color: colors.warmTextLight,
          fontSize: '15px',
          letterSpacing: '0.5px',
        },
      }, 'Sent with warmth,'),
      h(Text, {
        style: {
          color: colors.warmTextDark,
          fontSize: '18px',
          fontWeight: '700',
          fontFamily: fontFamilySerif,
          margin: '8px 0 0 0',
        },
      }, 'Medha Revision')
    )
  );
}

module.exports = { PasswordResetEmail };
