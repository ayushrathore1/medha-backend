const React = require('react');
const { Html, Head, Body, Container, Preview, Text, Heading, Section, Button, Link, Hr } = require('react-email');
const { colors, clLinks } = require('./components/styles');
const h = React.createElement;

// CodeLearnn brand shorthand
const cl = colors;

/**
 * Arrow bullet item for the early access email
 */
function ArrowItem({ text }) {
  return h('div', { style: { marginBottom: '8px' } },
    h('span', { style: { color: cl.clLime, marginRight: '10px' } }, '→'),
    h('span', { style: { color: cl.clText, fontSize: '14px' } }, text)
  );
}

/**
 * Checkmark feature item
 */
function CheckItem({ title, description }) {
  return h('div', { style: { marginBottom: '10px' } },
    h('span', { style: { color: cl.clLime, fontSize: '14px', marginRight: '12px' } }, '✓'),
    h('span', { style: { color: cl.clText, fontSize: '14px', lineHeight: '1.6' } },
      h('strong', null, title), ` — ${description}`
    )
  );
}

/**
 * Early Access / CodeLearnn Announcement Email
 * Sent to Medha Revision users to announce CodeLearnn.
 * @param {object} props
 * @param {string} [props.name] - Recipient name (optional)
 */
function EarlyAccessEmail({ name }) {
  const greeting = name || 'there';
  const year = new Date().getFullYear();

  return h(Html, null,
    h(Head, null),
    h(Preview, null, '📖 Free Vibe Coding Guide + CodeLearnn Early Access for Medha Users!'),
    h(Body, {
      style: {
        margin: '0',
        padding: '0',
        backgroundColor: cl.clDark,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      },
    },
      h('div', {
        style: { backgroundColor: cl.clDark, padding: '40px 20px', textAlign: 'center' },
      },
        h(Container, {
          style: {
            maxWidth: '600px',
            backgroundColor: cl.clCardBg,
            borderRadius: '12px',
            border: `1px solid ${cl.clBorder}`,
            textAlign: 'left',
          },
        },
          h('div', { style: { padding: '48px 40px' } },

            // ── Medha → CodeLearnn Bridge Header ──
            h('div', { style: { textAlign: 'center', marginBottom: '32px' } },
              h(Text, {
                style: { color: cl.clMuted, fontSize: '13px', margin: '0 0 12px 0', letterSpacing: '0.5px', textTransform: 'uppercase' },
              }, 'From the makers of'),
              h('div', { style: { marginBottom: '12px' } },
                h('span', { style: { fontSize: '22px', fontWeight: '700', color: cl.clText, letterSpacing: '-0.3px' } }, 'Medha Revision')
              ),
              h('div', { style: { margin: '10px 0', color: cl.clMuted, fontSize: '18px' } }, '↓'),
              h('div', null,
                h('span', { style: { fontSize: '32px', fontWeight: '700', color: cl.clText, letterSpacing: '-0.5px' } },
                  h('span', { style: { color: cl.clLime } }, '<'), 'CodeLearnn', h('span', { style: { color: cl.clLime } }, '/>')
                )
              )
            ),

            // ── Greeting ──
            h(Text, {
              style: { color: cl.clText, fontSize: '18px', lineHeight: '1.6', margin: '0 0 20px 0' },
            }, `Hey ${greeting}! 👋`),

            // ── Trust Bridge ──
            h(Text, {
              style: { color: cl.clText, fontSize: '16px', lineHeight: '1.7', margin: '0 0 16px 0' },
            }, "You've been using ", h('strong', null, 'Medha Revision'), " to stay sharp — and we've loved building for you. Today, we're excited to share something we've been quietly building on the side. Something bigger."),
            h(Text, {
              style: { color: cl.clMuted, fontSize: '15px', lineHeight: '1.7', margin: '0 0 32px 0' },
            }, 'Introducing ', h('span', { style: { color: cl.clLime, fontWeight: '700' } }, '<CodeLearnn/>'),
              " — the only learning OS that transforms scattered YouTube videos and random online courses into a structured, AI-validated roadmap that actually gets you job-ready."
            ),

            // ── Divider ──
            h(Hr, { style: { borderTop: `1px solid ${cl.clBorder}`, margin: '8px 0 32px 0' } }),

            // ── Vibe Coding Guide Hero Section ──
            h('div', {
              style: {
                background: 'linear-gradient(135deg, rgba(200,250,60,0.08) 0%, rgba(200,250,60,0.02) 100%)',
                border: '2px solid rgba(200,250,60,0.4)',
                borderRadius: '16px',
                padding: '32px',
                marginBottom: '32px',
              },
            },
              h('div', { style: { textAlign: 'center', marginBottom: '20px' } },
                h('span', {
                  style: {
                    display: 'inline-block',
                    backgroundColor: 'rgba(200,250,60,0.15)',
                    border: '1px solid rgba(200,250,60,0.3)',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: cl.clLime,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                  },
                }, '🎁 FREE — NO SIGN-IN REQUIRED')
              ),
              h(Heading, {
                as: 'h2',
                style: { color: cl.clText, fontSize: '22px', fontWeight: '700', textAlign: 'center', margin: '0 0 8px 0' },
              }, '📖 The Vibe Coding Playbook'),
              h(Text, {
                style: { color: cl.clLime, fontSize: '14px', fontWeight: '600', textAlign: 'center', margin: '0 0 20px 0' },
              }, 'Your exclusive guide — free for Medha users'),
              h(Text, {
                style: { color: cl.clText, fontSize: '15px', lineHeight: '1.7', margin: '0 0 12px 0' },
              }, 'Build and ship a real AI-powered app with ', h('strong', null, 'no prior coding experience'), '. This guide covers:'),
              h('div', { style: { marginBottom: '20px' } },
                h(ArrowItem, { text: 'Copy-paste prompts to build real projects' }),
                h(ArrowItem, { text: 'Step-by-step deployment workflow' }),
                h(ArrowItem, { text: 'Go from idea to shipped product in a weekend' }),
                h(ArrowItem, { text: 'The exact workflow used by students who landed internships' })
              ),
              h('div', { style: { textAlign: 'center' } },
                h(Button, {
                  href: clLinks.vibeCodingGuide,
                  style: {
                    backgroundColor: cl.clLime,
                    color: '#0a0a0a',
                    padding: '16px 40px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '700',
                    letterSpacing: '0.2px',
                  },
                }, '📖 Read the Free Guide →')
              ),
              h(Text, {
                style: { color: cl.clMuted, fontSize: '12px', textAlign: 'center', margin: '12px 0 0 0' },
              }, 'No sign-up needed. Just click and start reading.')
            ),

            // ── Divider ──
            h(Hr, { style: { borderTop: `1px solid ${cl.clBorder}`, margin: '8px 0 32px 0' } }),

            // ── CodeLearnn Early Access Waitlist ──
            h('div', { style: { textAlign: 'center', marginBottom: '24px' } },
              h('span', {
                style: {
                  display: 'inline-block',
                  backgroundColor: 'rgba(200,250,60,0.1)',
                  border: '1px solid rgba(200,250,60,0.3)',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: cl.clLime,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                },
              }, '🔒 Medha Users Get Priority Access')
            ),
            h(Heading, {
              as: 'h2',
              style: { color: cl.clText, fontSize: '18px', fontWeight: '700', textAlign: 'center', margin: '0 0 16px 0' },
            }, "CodeLearnn is launching soon — and you're first in line."),
            h(Text, {
              style: { color: cl.clMuted, fontSize: '15px', lineHeight: '1.7', margin: '0 0 24px 0', textAlign: 'center' },
            }, 'As a Medha Revision user, you\'ll get ',
              h('span', { style: { color: cl.clLime, fontWeight: '600' } }, 'exclusive early access'),
              ' before anyone else when we launch. Join the waitlist now to secure your spot.'
            ),

            // ── Value Proposition ──
            h('div', {
              style: {
                backgroundColor: cl.clDark,
                border: `1px solid ${cl.clBorder}`,
                borderRadius: '12px',
                padding: '28px',
                marginBottom: '24px',
              },
            },
              h(Text, {
                style: { color: cl.clLime, fontSize: '12px', fontFamily: 'monospace', margin: '0 0 16px 0', letterSpacing: '1px' },
              }, '// what you\'ll get with CodeLearnn'),
              h(CheckItem, {
                title: 'AI-built career roadmaps',
                description: 'personalized learning paths based on your dream role, not random trends.',
              }),
              h(CheckItem, {
                title: 'Curated content, not chaos',
                description: 'no more random YouTube rabbit holes. Everything is structured and validated.',
              }),
              h(CheckItem, {
                title: 'Free for first 500 students.',
                description: "As a Medha user, you're already in the priority window.",
              })
            ),

            // ── Waitlist CTA ──
            h('div', { style: { textAlign: 'center', marginBottom: '16px' } },
              h(Button, {
                href: clLinks.waitlist,
                style: {
                  backgroundColor: 'transparent',
                  border: `2px solid ${cl.clLime}`,
                  color: cl.clLime,
                  padding: '14px 36px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '700',
                  letterSpacing: '0.2px',
                },
              }, '⚡ Join the CodeLearnn Waitlist →')
            ),
            h(Text, {
              style: { color: cl.clMuted, fontSize: '12px', textAlign: 'center', margin: '0 0 32px 0' },
            }, h('span', { style: { color: '#ff6b6b' } }, '⏳'), ' Medha users get first access when we launch — spots are limited.'),

            // ── Divider ──
            h(Hr, { style: { borderTop: `1px solid ${cl.clBorder}`, margin: '8px 0 32px 0' } }),

            // ── Dashboard Preview Card ──
            h('div', {
              style: {
                backgroundColor: cl.clDark,
                border: `1px solid ${cl.clBorder}`,
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px',
              },
            },
              h('div', { style: { marginBottom: '14px' } },
                h('span', { style: { color: cl.clMuted, fontSize: '12px', fontFamily: 'monospace' } }, '● ● career_dashboard.tsx'),
                h('span', { style: { color: cl.clTeal, fontSize: '12px', marginLeft: '12px' } }, 'v2.0')
              ),
              h('span', {
                style: {
                  backgroundColor: 'rgba(45,212,191,0.1)',
                  color: cl.clTeal,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                },
              }, 'COMING SOON'),
              h(Text, {
                style: { color: cl.clText, fontSize: '18px', fontWeight: '600', margin: '10px 0 4px 0' },
              }, 'Full Stack Dev Roadmap'),
              h(Text, {
                style: { color: cl.clMuted, fontSize: '13px', margin: '0' },
              }, 'Your AI-built learning path — ready when we launch')
            ),

            // ── Divider ──
            h(Hr, { style: { borderTop: `1px solid ${cl.clBorder}`, margin: '8px 0 32px 0' } }),

            // ── Co-Builder Feedback ──
            h(Heading, {
              as: 'h2',
              style: { color: cl.clText, fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0' },
            }, '🛠️ You\'re a Co-Builder Here'),
            h(Text, {
              style: { color: cl.clMuted, fontSize: '15px', lineHeight: '1.7', margin: '0 0 16px 0' },
            }, 'We built Medha based on what students like you told us was broken. CodeLearnn is no different. Early users shape everything.'),
            h(Text, {
              style: { color: cl.clMuted, fontSize: '14px', lineHeight: '1.8', margin: '0 0 8px 0' },
            }, 'Tell us:'),
            h('ul', {
              style: { color: cl.clMuted, fontSize: '14px', lineHeight: '1.9', paddingLeft: '20px', margin: '0 0 20px 0' },
            },
              h('li', { style: { marginBottom: '4px' } }, "What's missing from how you learn right now?"),
              h('li', { style: { marginBottom: '4px' } }, 'What would make you open CodeLearnn every single day?'),
              h('li', { style: { marginBottom: '4px' } }, 'What did you wish Medha had, that we can build here?')
            ),

            // ── Feedback CTA ──
            h('div', {
              style: {
                backgroundColor: 'rgba(200,250,60,0.05)',
                padding: '16px 20px',
                borderLeft: `3px solid ${cl.clLime}`,
                borderRadius: '4px',
                marginBottom: '32px',
              },
            },
              h(Text, {
                style: { color: cl.clText, fontSize: '14px', margin: '0' },
              }, '📧 Reply directly to this email or write to: ',
                h(Link, {
                  href: `mailto:${clLinks.feedbackEmail}`,
                  style: { color: cl.clLime, textDecoration: 'none', fontWeight: '600' },
                }, clLinks.feedbackEmail)
              )
            ),

            // ── Signature ──
            h('div', { style: { marginTop: '16px' } },
              h(Text, {
                style: { color: cl.clMuted, fontSize: '15px', lineHeight: '1.7', margin: '0 0 4px 0' },
              }, 'You helped us build Medha. Let\'s build this one together too.'),
              h(Text, {
                style: { color: cl.clText, fontWeight: '600', fontSize: '15px', margin: '16px 0 4px 0' },
              }, '– Team CodeLearnn'),
              h(Text, {
                style: { color: cl.clMuted, fontSize: '13px', margin: '0' },
              }, 'From the makers of Medha Revision')
            )
          ),

          // ── Footer ──
          h('div', {
            style: {
              padding: '0 40px 40px 40px',
            },
          },
            h('div', {
              style: {
                borderTop: `1px solid ${cl.clBorder}`,
                paddingTop: '24px',
                textAlign: 'center',
              },
            },
              h(Text, { style: { marginBottom: '16px' } },
                h(Link, {
                  href: clLinks.website,
                  style: { color: cl.clMuted, textDecoration: 'none', fontSize: '13px', margin: '0 12px' },
                }, 'Website'),
                h(Link, {
                  href: clLinks.twitter,
                  style: { color: cl.clMuted, textDecoration: 'none', fontSize: '13px', margin: '0 12px' },
                }, 'Twitter'),
                h(Link, {
                  href: clLinks.linkedin,
                  style: { color: cl.clMuted, textDecoration: 'none', fontSize: '13px', margin: '0 12px' },
                }, 'LinkedIn')
              ),
              h(Text, {
                style: { color: '#404040', fontSize: '11px', margin: '0' },
              }, `© ${year} CodeLearnn. Learn like an engineer.`),
              h(Text, {
                style: { color: '#303030', fontSize: '11px', margin: '6px 0 0 0' },
              }, "You're receiving this because you use Medha Revision. ",
                h(Link, {
                  href: clLinks.unsubscribe,
                  style: { color: '#505050', textDecoration: 'underline' },
                }, 'Unsubscribe')
              )
            )
          )
        )
      )
    )
  );
}

module.exports = { EarlyAccessEmail };
