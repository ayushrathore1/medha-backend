const React = require('react');
const { Text, Link, Hr } = require('react-email');
const { colors, fontFamilyOutfit, links } = require('./styles');
const h = React.createElement;

/**
 * Shared Medha Footer Component
 * Shows "Made with ❤️" + website link + optional year.
 * @param {object} props
 * @param {string} [props.variant] - 'warm' (default) or 'dark'
 */
function MedhaFooter({ variant = 'warm' }) {
  const isDark = variant === 'dark';
  const year = new Date().getFullYear();

  return h('div', {
    style: {
      textAlign: 'center',
      padding: '28px 40px',
      backgroundColor: isDark ? colors.darkCardBg : colors.warmFooterBg,
      borderTop: `2px solid ${isDark ? colors.darkBorder : colors.warmFooterBorder}`,
      borderBottomLeftRadius: '28px',
      borderBottomRightRadius: '28px',
    },
  },
    h(Text, {
      style: {
        margin: '0',
        letterSpacing: '1.5px',
        fontFamily: fontFamilyOutfit,
        fontWeight: '600',
        fontSize: '12px',
        color: isDark ? colors.darkTextLight : colors.warmTextLight,
      },
    }, 'MADE WITH ❤️ BY ', h('strong', {
      style: { color: isDark ? colors.darkText : colors.warmAccent },
    }, 'MEDHA REVISION')),
    h(Text, {
      style: { margin: '12px 0 0 0' },
    },
      h(Link, {
        href: links.website,
        style: {
          color: isDark ? colors.darkAccent : colors.warmAccent,
          textDecoration: 'none',
          fontWeight: '700',
          fontFamily: fontFamilyOutfit,
          fontSize: '13px',
        },
      }, '🌐 Visit Website')
    )
  );
}

module.exports = { MedhaFooter };
