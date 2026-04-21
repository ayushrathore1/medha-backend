const React = require('react');
const { Img, Text } = require('react-email');
const { colors, fontFamilyOutfit, links } = require('./styles');
const h = React.createElement;

/**
 * Shared Medha Header Component
 * Shows the Medha logo + optional decoration text above it.
 * @param {object} props
 * @param {string} [props.decoration] - Optional text like "✨ WELCOME ✨"
 * @param {string} [props.variant] - 'warm' (default) or 'dark'
 */
function MedhaHeader({ decoration, variant = 'warm' }) {
  const isDark = variant === 'dark';

  return h('div', {
    style: {
      textAlign: 'center',
      padding: '40px 20px 10px 20px',
    },
  },
    decoration && h(Text, {
      style: {
        fontFamily: fontFamilyOutfit,
        color: isDark ? colors.white : colors.warmGold,
        fontSize: '20px',
        fontWeight: '700',
        letterSpacing: '2px',
        margin: '0 0 12px 0',
      },
    }, decoration),
    h(Img, {
      src: isDark ? links.logoWhiteUrl : links.logoUrl,
      alt: 'Medha Revision',
      width: '110',
      style: {
        display: 'block',
        margin: '0 auto',
        outline: 'none',
        objectFit: 'contain',
      },
    })
  );
}

module.exports = { MedhaHeader };
