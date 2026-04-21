const React = require('react');
const { Text, Heading, Section } = require('react-email');
const { MedhaLayout } = require('./components/Layout');
const { colors, fontFamilyMono, fontFamilySystem } = require('./components/styles');
const h = React.createElement;

/**
 * OTP Verification Email
 * Used for both registration and login OTP flows.
 * @param {object} props
 * @param {string} props.code - 6-digit OTP code
 * @param {string} [props.type] - 'login' or 'verification' (default)
 * @param {number} [props.expiryMinutes] - OTP expiry time in minutes (default 10)
 */
function OtpEmail({ code, type = 'verification', expiryMinutes = 10 }) {
  const title = type === 'login' ? 'Login Verification' : 'Verify Your Email';
  const subtitle = type === 'login'
    ? 'Use this code to log in to your MEDHA account'
    : 'Use this code to complete your MEDHA registration';

  return h(MedhaLayout, {
    preview: `Your MEDHA verification code: ${code}`,
    variant: 'dark',
    showHeader: false,
    showFooter: false,
  },
    // ── Custom Dark Header ──
    h(Section, {
      style: {
        backgroundColor: colors.darkBg,
        padding: '28px 32px',
        borderRadius: '20px 20px 0 0',
        textAlign: 'center',
      },
    },
      h('div', {
        style: {
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${colors.darkAccent}, ${colors.darkAccentAlt})`,
          display: 'inline-block',
          textAlign: 'center',
          lineHeight: '44px',
          fontSize: '20px',
          fontWeight: '800',
          color: 'white',
        },
      }, 'M'),
      h(Text, {
        style: {
          fontSize: '20px',
          fontWeight: '700',
          color: 'white',
          letterSpacing: '1px',
          margin: '12px 0 0 0',
        },
      }, 'MEDHA'),
      h(Text, {
        style: {
          fontSize: '12px',
          color: colors.darkAccent,
          margin: '4px 0 0 0',
        },
      }, 'Your Study Companion')
    ),

    // ── Body ──
    h(Section, {
      style: {
        backgroundColor: 'white',
        padding: '40px 36px',
      },
    },
      h(Heading, {
        as: 'h1',
        style: {
          margin: '0 0 8px',
          fontSize: '24px',
          fontWeight: '700',
          color: colors.darkText,
          textAlign: 'center',
          fontFamily: fontFamilySystem,
        },
      }, title),
      h(Text, {
        style: {
          margin: '0 0 28px',
          fontSize: '15px',
          color: colors.darkTextMuted,
          textAlign: 'center',
          lineHeight: '1.5',
          fontFamily: fontFamilySystem,
        },
      }, subtitle),

      // ── OTP Code Box ──
      h('div', {
        style: {
          backgroundColor: colors.darkCardBg,
          border: `2px solid ${colors.darkAccent}`,
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          marginBottom: '28px',
        },
      },
        h(Text, {
          style: {
            fontSize: '36px',
            fontWeight: '800',
            letterSpacing: '12px',
            color: colors.darkText,
            fontFamily: fontFamilyMono,
            margin: '0',
          },
        }, code),
        h(Text, {
          style: {
            fontSize: '12px',
            color: colors.darkTextLight,
            marginTop: '8px',
            margin: '8px 0 0 0',
          },
        }, `Expires in ${expiryMinutes} minutes`)
      ),

      h(Text, {
        style: {
          margin: '0 0 8px',
          fontSize: '13px',
          color: colors.darkTextLight,
          textAlign: 'center',
          fontFamily: fontFamilySystem,
        },
      }, "If you didn't request this code, please ignore this email."),
      h(Text, {
        style: {
          margin: '0',
          fontSize: '13px',
          color: colors.darkTextLight,
          textAlign: 'center',
          fontFamily: fontFamilySystem,
        },
      }, 'Do not share this code with anyone.')
    ),

    // ── Footer ──
    h(Section, {
      style: {
        backgroundColor: colors.darkCardBg,
        padding: '24px 32px',
        borderRadius: '0 0 20px 20px',
        borderTop: `1px solid ${colors.darkBorder}`,
        textAlign: 'center',
      },
    },
      h(Text, {
        style: {
          margin: '0',
          fontSize: '11px',
          color: colors.darkTextLight,
          letterSpacing: '1px',
        },
      }, 'MADE WITH ❤️ BY MEDHA REVISION'),
      h(Text, { style: { margin: '8px 0 0' } },
        h('a', {
          href: 'https://medha-revision.vercel.app',
          style: {
            color: colors.darkAccent,
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: '600',
          },
        }, 'Visit Website')
      )
    )
  );
}

module.exports = { OtpEmail };
