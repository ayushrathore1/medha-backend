const React = require('react');
const { Html, Head, Body, Container, Section, Text, Button, Hr } = require('react-email');
const h = React.createElement;

// ── Design Tokens ──
const cream = '#FAF8F3';
const green = '#22C55E';
const navy = '#0D0D2B';
const bodyText = '#4A4A4A';
const muted = '#8B8070';
const promptBg = '#F5F0E8';
const promptBorder = '#E0D9CC';
const badgeBorder = '#E8E4DC';
const doodleStroke = '#8B8070';

// ── Inline SVG Doodles (all stroke-only, no external images) ──

// Wavy horizontal divider line
const wavyLineSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="280" height="20" viewBox="0 0 280 20"><path d="M0 10 Q17 2 35 10 Q53 18 70 10 Q87 2 105 10 Q123 18 140 10 Q157 2 175 10 Q193 18 210 10 Q227 2 245 10 Q263 18 280 10" fill="none" stroke="' + doodleStroke + '" stroke-width="1.5" opacity="0.2"/></svg>';

// 4-point star burst
const starBurstSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M14 2 L16 11 L25 9 L18 14 L25 19 L16 17 L14 26 L12 17 L3 19 L10 14 L3 9 L12 11 Z" fill="none" stroke="' + doodleStroke + '" stroke-width="1.5" stroke-linejoin="round" opacity="0.22"/></svg>';

// Loose spiral
const spiralSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><path d="M25 25 C25 20 30 18 33 21 C36 24 34 30 29 31 C23 32 18 27 19 21 C20 14 27 11 34 13 C41 15 43 24 40 31 C37 38 28 42 21 39" fill="none" stroke="' + doodleStroke + '" stroke-width="1.5" stroke-linecap="round" opacity="0.18"/></svg>';

// Doodle arrow pointing down-right (toward CTA)
const doodleArrowSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="50" viewBox="0 0 60 50"><path d="M5 8 Q15 5 25 12 Q35 20 42 18 Q48 16 52 22 L52 28" fill="none" stroke="' + doodleStroke + '" stroke-width="2" stroke-linecap="round" opacity="0.3"/><path d="M46 25 L52 30 L56 23" fill="none" stroke="' + doodleStroke + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/></svg>';

// Small circle cluster
const circleClusterSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="20" viewBox="0 0 50 20"><circle cx="8" cy="10" r="3" fill="none" stroke="' + doodleStroke + '" stroke-width="1.5" opacity="0.15"/><circle cx="24" cy="8" r="5" fill="none" stroke="' + doodleStroke + '" stroke-width="1.5" opacity="0.15"/><circle cx="40" cy="12" r="2" fill="none" stroke="' + doodleStroke + '" stroke-width="1.5" opacity="0.15"/></svg>';

// Helper: render inline SVG as a div with dangerouslySetInnerHTML
function InlineSvg({ svg, style = {} }) {
  return h('div', {
    dangerouslySetInnerHTML: { __html: svg },
    style: { lineHeight: '0', fontSize: '0', ...style },
  });
}

/**
 * Scattered pill badge — positioned absolutely with rotation
 */
function ScatteredBadge({ text, top, left, right, rotate }) {
  const posStyle = {};
  if (top !== undefined) posStyle.top = top;
  if (left !== undefined) posStyle.left = left;
  if (right !== undefined) posStyle.right = right;

  return h('div', {
    style: {
      position: 'absolute',
      ...posStyle,
      transform: `rotate(${rotate || 0}deg)`,
      WebkitTransform: `rotate(${rotate || 0}deg)`,
      MsTransform: `rotate(${rotate || 0}deg)`,
      backgroundColor: '#ffffff',
      border: `1.5px solid ${badgeBorder}`,
      borderRadius: '999px',
      padding: '6px 14px',
      fontSize: '13px',
      fontWeight: '500',
      color: navy,
      whiteSpace: 'nowrap',
      fontFamily: "'Inter', -apple-system, sans-serif",
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      zIndex: '1',
    },
  }, text);
}

/**
 * MEDHA Re-Engagement Email v2
 *
 * Cream background, scattered badge pills, rich inline SVG doodles,
 * text wordmark logo, asymmetric layout, casual friend tone, one CTA.
 *
 * @param {object} props
 * @param {string} [props.name] - User's first name
 * @param {string} [props.feedbackUrl] - URL to feedback form
 */
function ReEngagementEmail({ name, feedbackUrl }) {
  const greeting = name || 'hey you';
  const ctaHref = feedbackUrl || 'https://medha-revision.vercel.app/suggest';

  return h(Html, null,
    h(Head, null),
    h(Body, {
      style: {
        margin: '0',
        padding: '0',
        backgroundColor: cream,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        WebkitTextSizeAdjust: '100%',
      },
    },
      h('div', { style: { backgroundColor: cream, padding: '40px 16px' } },
        h(Container, {
          style: {
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E8E4DC',
            boxShadow: '0 2px 20px rgba(13,13,43,0.03)',
            overflow: 'hidden',
            position: 'relative',
          },
        },

          // ═══════════════════════════════════════
          // [1] HEADER — Wordmark + Scattered Badges
          // ═══════════════════════════════════════

          // Wordmark: MEDHA●
          h('div', {
            style: { textAlign: 'center', paddingTop: '36px', paddingBottom: '4px' },
          },
            h(Text, {
              style: {
                fontSize: '22px',
                fontWeight: '800',
                color: navy,
                letterSpacing: '-0.5px',
                margin: '0',
                display: 'inline',
              },
            }, 'MEDHA'),
            h('span', {
              style: {
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#FF6B00',
                marginLeft: '2px',
                verticalAlign: 'middle',
                marginBottom: '2px',
              },
            })
          ),

          // Scattered badge cluster
          h('div', {
            style: {
              position: 'relative',
              height: '120px',
              margin: '0 20px',
            },
          },
            h(ScatteredBadge, { text: 'Exams Done ✓', top: '8px', left: '15px', rotate: -6 }),
            h(ScatteredBadge, { text: 'Party Done ✓', top: '48px', left: '170px', rotate: 4 }),
            h(ScatteredBadge, { text: 'New UI ✨', top: '14px', right: '25px', rotate: -3 }),
            h(ScatteredBadge, { text: 'PYQs upgraded 🔥', top: '72px', left: '30px', rotate: 5 }),
            h(ScatteredBadge, { text: 'Skills Learnt ✓', top: '68px', right: '40px', rotate: -4 }),
          ),


          // ═══════════════════════════════════════
          // [2] HERO — Big left-aligned headline
          // ═══════════════════════════════════════

          h('div', {
            style: { padding: '10px 36px 0 36px', position: 'relative' },
          },
            // Spiral doodle — top right of hero
            h(InlineSvg, {
              svg: spiralSvg,
              style: { position: 'absolute', top: '0', right: '20px' },
            }),

            h(Text, {
              style: {
                fontSize: '38px',
                fontWeight: '800',
                color: navy,
                lineHeight: '1.2',
                margin: '0 0 6px 0',
                letterSpacing: '-1px',
                textAlign: 'left',
              },
            }, `yo ${greeting} 👋`),
            h(Text, {
              style: {
                fontSize: '26px',
                fontWeight: '700',
                color: navy,
                lineHeight: '1.25',
                margin: '0 0 12px 0',
                letterSpacing: '-0.5px',
                textAlign: 'left',
                maxWidth: '440px',
              },
            }, 'remember us? we built something.'),
            h(Text, {
              style: {
                fontSize: '15px',
                color: muted,
                lineHeight: '1.6',
                margin: '0 0 16px 0',
                textAlign: 'left',
              },
            }, 'you signed up back in january. a lot has changed since then.'),

            // Wavy line doodle divider
            h(InlineSvg, {
              svg: wavyLineSvg,
              style: { margin: '4px 0 0 0' },
            })
          ),


          // ═══════════════════════════════════════
          // [3] BODY COPY — with star burst doodles
          // ═══════════════════════════════════════

          h('div', {
            style: { padding: '24px 36px 8px 36px', position: 'relative' },
          },
            // Star burst doodles scattered around this section
            h(InlineSvg, {
              svg: starBurstSvg,
              style: { position: 'absolute', top: '10px', right: '30px' },
            }),
            h(InlineSvg, {
              svg: starBurstSvg,
              style: { position: 'absolute', top: '70px', left: '10px' },
            }),
            h(InlineSvg, {
              svg: starBurstSvg,
              style: { position: 'absolute', bottom: '20px', right: '60px' },
            }),

            // Circle cluster
            h(InlineSvg, {
              svg: circleClusterSvg,
              style: { position: 'absolute', top: '50px', right: '15px' },
            }),

            h(Text, {
              style: {
                fontSize: '16px',
                color: bodyText,
                lineHeight: '1.7',
                margin: '0 0 16px 0',
                textAlign: 'left',
                maxWidth: '480px',
              },
            }, "we've been heads-down building — upgrading notes, smarter PYQs, better search. but honestly? we want to build what YOU actually need."),
            h(Text, {
              style: {
                fontSize: '16px',
                color: bodyText,
                lineHeight: '1.7',
                margin: '0 0 4px 0',
                textAlign: 'left',
                maxWidth: '480px',
              },
            }, 'not what we think you need.')
          ),


          // ═══════════════════════════════════════
          // [4] SUGGESTION PROMPT BOX
          // ═══════════════════════════════════════

          h('div', {
            style: { padding: '20px 36px 8px 36px' },
          },
            h('div', {
              style: {
                backgroundColor: promptBg,
                border: `1.5px solid ${promptBorder}`,
                borderRadius: '16px',
                padding: '20px 24px',
              },
            },
              h(Text, {
                style: {
                  color: navy,
                  fontSize: '15px',
                  fontWeight: '700',
                  margin: '0 0 12px 0',
                },
              }, '💬 tell us stuff like:'),
              h(Text, {
                style: {
                  color: bodyText,
                  fontSize: '14px',
                  lineHeight: '1.9',
                  margin: '0',
                },
              },
                '→ "I wish I had XYZ before my last exam"',
                h('br'),
                '→ "make it do [this] and I\'d use it daily"',
                h('br'),
                '→ "I literally just need [feature] and nothing else"',
                h('br'),
                '→ or just roast us. that\'s fine too 🤣'
              )
            )
          ),


          // ═══════════════════════════════════════
          // [5] CTA — with doodle arrow
          // ═══════════════════════════════════════

          h('div', {
            style: { padding: '24px 36px 8px 36px' },
          },
            h(Text, {
              style: {
                fontSize: '15px',
                color: bodyText,
                lineHeight: '1.7',
                margin: '0 0 20px 0',
                textAlign: 'left',
              },
            }, 'hit reply or smash the button. takes 30 sec. we read every single one. 🫶'),

            // CTA wrapper with doodle arrow
            h('div', {
              style: { textAlign: 'center', position: 'relative', padding: '8px 0 16px 0' },
            },
              // Doodle arrow pointing at button
              h(InlineSvg, {
                svg: doodleArrowSvg,
                style: {
                  position: 'absolute',
                  top: '-18px',
                  left: 'calc(50% - 90px)',
                },
              }),

              h(Button, {
                href: ctaHref,
                style: {
                  backgroundColor: green,
                  color: '#FFFFFF',
                  borderRadius: '999px',
                  padding: '14px 36px',
                  fontSize: '16px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  display: 'inline-block',
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(34,197,94,0.25)',
                },
              }, 'tell us what you want →')
            )
          ),

          // Wavy line divider
          h('div', { style: { padding: '0 36px', margin: '8px 0' } },
            h(InlineSvg, { svg: wavyLineSvg })
          ),


          // ═══════════════════════════════════════
          // [6] UPGRADE TEASER
          // ═══════════════════════════════════════

          h('div', {
            style: { padding: '16px 36px 8px 36px' },
          },
            h(Text, {
              style: {
                fontSize: '13px',
                fontWeight: '600',
                color: muted,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                margin: '0 0 10px 0',
              },
            }, "what's already new ✨"),
            h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
              h('span', {
                style: {
                  display: 'inline-block',
                  backgroundColor: cream,
                  border: `1px solid ${badgeBorder}`,
                  borderRadius: '999px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: muted,
                  marginRight: '6px',
                  marginBottom: '4px',
                },
              }, 'smarter notes'),
              h('span', {
                style: {
                  display: 'inline-block',
                  backgroundColor: cream,
                  border: `1px solid ${badgeBorder}`,
                  borderRadius: '999px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: muted,
                  marginRight: '6px',
                  marginBottom: '4px',
                },
              }, 'faster PYQ search'),
              h('span', {
                style: {
                  display: 'inline-block',
                  backgroundColor: cream,
                  border: `1px solid ${badgeBorder}`,
                  borderRadius: '999px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: muted,
                  marginBottom: '4px',
                },
              }, 'cleaner UI')
            )
          ),


          // ═══════════════════════════════════════
          // [7] FOOTER
          // ═══════════════════════════════════════

          h('div', {
            style: {
              padding: '20px 36px 28px 36px',
              borderTop: '1px solid #E8E4DC',
              marginTop: '16px',
            },
          },
            // Circle cluster doodle in footer
            h(InlineSvg, {
              svg: circleClusterSvg,
              style: { margin: '0 0 10px 0', opacity: '0.6' },
            }),

            h(Text, {
              style: {
                fontSize: '13px',
                color: muted,
                margin: '0 0 4px 0',
                lineHeight: '1.5',
              },
            }, '— team medha'),
            h(Text, {
              style: {
                fontSize: '12px',
                color: '#B0B0B0',
                margin: '0 0 12px 0',
              },
            }, 'made with chaos + caffeine ☕'),
            h(Text, {
              style: {
                fontSize: '11px',
                color: '#C8C8C8',
                margin: '0',
              },
            },
              "you signed up on medha — that's why you got this. ",
              h('a', {
                href: 'https://medha-revision.vercel.app/unsubscribe',
                style: { color: '#AAAAAA', textDecoration: 'underline' },
              }, 'unsubscribe')
            )
          )
        ) // end Container
      ) // end outer div
    ) // end Body
  ); // end Html
}

module.exports = { ReEngagementEmail };
