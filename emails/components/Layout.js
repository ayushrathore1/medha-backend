const React = require('react');
const { Html, Head, Body, Container, Font, Preview } = require('react-email');
const { colors, fontFamily } = require('./styles');
const { MedhaHeader } = require('./MedhaHeader');
const { MedhaFooter } = require('./MedhaFooter');
const h = React.createElement;

/**
 * Shared Medha Email Layout
 * Wraps all emails with consistent structure: <Html>, <Head>, <Body>, background, container.
 * @param {object} props
 * @param {string} [props.preview] - Email preview text
 * @param {string} [props.variant] - 'warm' (default) or 'dark'
 * @param {string} [props.decoration] - Header decoration text (e.g. "✨ WELCOME ✨")
 * @param {boolean} [props.showHeader] - Show Medha header (default true)
 * @param {boolean} [props.showFooter] - Show Medha footer (default true)
 * @param {React.ReactNode} props.children - Email body content
 */
function MedhaLayout({ preview, variant = 'warm', decoration, showHeader = true, showFooter = true, children }) {
  const isDark = variant === 'dark';

  return h(Html, null,
    h(Head, null,
      h(Font, {
        fontFamily: 'Quicksand',
        fallbackFontFamily: 'Verdana',
        webFont: {
          url: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap',
          format: 'woff2',
        },
        fontWeight: 400,
        fontStyle: 'normal',
      }),
      h(Font, {
        fontFamily: 'Outfit',
        fallbackFontFamily: 'Georgia',
        webFont: {
          url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap',
          format: 'woff2',
        },
        fontWeight: 400,
        fontStyle: 'normal',
      })
    ),
    preview && h(Preview, null, preview),
    h(Body, {
      style: {
        margin: '0',
        padding: '50px 0',
        backgroundColor: isDark ? colors.otpBg : colors.warmBg,
        fontFamily: fontFamily,
        color: isDark ? colors.darkText : colors.warmText,
      },
    },
      h(Container, {
        style: {
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: isDark ? colors.white : colors.warmCardBg,
          borderRadius: '28px',
          border: `2px solid ${isDark ? colors.darkBorder : colors.warmBorder}`,
          boxShadow: isDark
            ? '0 4px 20px rgba(0,0,0,0.05)'
            : '0 15px 40px rgba(251,191,36,0.15), 0 5px 15px rgba(251,146,60,0.08)',
          overflow: 'hidden',
        },
      },
        showHeader && h(MedhaHeader, { decoration, variant }),
        h('div', {
          style: { padding: '35px 40px 25px 40px' },
        }, children),
        showFooter && h(MedhaFooter, { variant })
      )
    )
  );
}

module.exports = { MedhaLayout };
