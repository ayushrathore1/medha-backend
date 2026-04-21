const React = require('react');
const { Text, Heading, Section, Button, Link, Hr } = require('react-email');
const { MedhaLayout } = require('./components/Layout');
const { colors, fontFamily, fontFamilyOutfit, links } = require('./components/styles');
const h = React.createElement;

/**
 * Feature item for the welcome email
 */
function FeatureItem({ emoji, title, description }) {
  return h('div', {
    style: {
      padding: '16px 20px',
      margin: '8px 0',
      backgroundColor: '#fffef9',
      borderLeft: `4px solid ${colors.warmYellowBorder}`,
      borderRadius: '12px',
    },
  },
    h(Text, {
      style: {
        color: '#92400e',
        fontSize: '17px',
        fontWeight: '700',
        fontFamily: fontFamilyOutfit,
        margin: '0',
      },
    }, `${emoji} ${title}`),
    h(Text, {
      style: {
        margin: '6px 0 0 0',
        fontSize: '15px',
        color: colors.warmTextMuted,
        lineHeight: '1.6',
      },
    }, description)
  );
}

/**
 * Welcome Email
 * Sent when a new user registers on Medha.
 * @param {object} props
 * @param {string} props.name - User's display name
 */
function WelcomeEmail({ name }) {
  return h(MedhaLayout, {
    preview: `Welcome to Medha Revision, ${name}! Start your smarter study journey.`,
    variant: 'warm',
    decoration: '✨ WELCOME ✨',
  },
    // ── Greeting ──
    h(Heading, {
      as: 'h1',
      style: {
        fontFamily: fontFamilyOutfit,
        color: colors.warmAccentAlt,
        fontWeight: '600',
        letterSpacing: '0.5px',
        fontSize: '32px',
        textAlign: 'center',
        margin: '0 0 8px 0',
      },
    }, `Thank You, ${name}! 🎉`),
    h(Heading, {
      as: 'h2',
      style: {
        fontFamily: fontFamilyOutfit,
        color: '#92400e',
        fontWeight: '500',
        fontSize: '19px',
        textAlign: 'center',
        margin: '0 0 25px 0',
      },
    }, 'for joining Medha Revision'),
    h(Text, {
      style: {
        textAlign: 'center',
        color: colors.warmTextMuted,
        fontSize: '16px',
        lineHeight: '1.6',
        margin: '0 0 20px 0',
      },
    }, "You've taken the first step towards a smarter way of studying! 🚀\nHere's everything you can explore on Medha:"),

    // ── Features ──
    h('div', { style: { marginTop: '35px' } },
      h(FeatureItem, {
        emoji: '📊',
        title: 'RTU Paper Analysis',
        description: 'Know exactly what to study with unit-wise weightage and question breakdowns for the last 3 years.',
      }),
      h(FeatureItem, {
        emoji: '🎥',
        title: 'Best Video Lecture Recommendations',
        description: "Curated playlists of the best video lectures from top educators—no more endless searching!",
      }),
      h(FeatureItem, {
        emoji: '🎧',
        title: 'Learn Concepts Easily',
        description: 'Tough topics simplified! Read short PDFs or listen to Audio Overviews in Hindi & English.',
      }),
      h(FeatureItem, {
        emoji: '📚',
        title: 'Notes & Study Materials',
        description: 'Access comprehensive notes for all RTU subjects, organized and ready to download.',
      }),
      h(FeatureItem, {
        emoji: '📝',
        title: 'Previous Year Question Papers',
        description: 'Practice with real RTU papers and solutions to ace your exams with confidence.',
      }),
      h(FeatureItem, {
        emoji: '🤖',
        title: 'AI Chatbot',
        description: "Have a doubt? Ask our AI chatbot trained specially for your RTU syllabus—instant help, anytime!",
      })
    ),

    // ── WhatsApp CTA ──
    h('div', {
      style: {
        background: `linear-gradient(135deg, ${colors.warmYellowBg} 0%, #fef3c7 100%)`,
        border: `2px solid ${colors.warmYellowBorder}`,
        borderRadius: '20px',
        padding: '28px',
        margin: '30px 0',
        textAlign: 'center',
      },
    },
      h(Text, {
        style: {
          margin: '0 0 12px 0',
          fontSize: '18px',
          color: '#92400e',
          fontWeight: '700',
          fontFamily: fontFamilyOutfit,
        },
      }, '💬 Join Our WhatsApp Community'),
      h(Text, {
        style: {
          margin: '0 0 18px 0',
          fontSize: '15px',
          color: '#78350f',
          fontFamily: fontFamily,
          lineHeight: '1.6',
        },
      }, 'Connect with fellow RTU students, share notes, get video lecture suggestions, and receive important updates instantly!'),
      h(Button, {
        href: links.whatsappGroup,
        style: {
          backgroundColor: colors.whatsappGreen,
          color: colors.white,
          padding: '13px 32px',
          borderRadius: '25px',
          fontSize: '15px',
          fontWeight: '600',
          fontFamily: fontFamilyOutfit,
        },
      }, '📱 Join WhatsApp Group')
    ),

    // ── Main CTA ──
    h('div', { style: { textAlign: 'center', marginTop: '35px' } },
      h(Button, {
        href: links.website,
        style: {
          background: `linear-gradient(135deg, ${colors.warmAccent} 0%, ${colors.warmAccentAlt} 100%)`,
          color: colors.white,
          padding: '16px 40px',
          borderRadius: '30px',
          fontSize: '17px',
          fontWeight: '600',
          fontFamily: fontFamilyOutfit,
        },
      }, '🚀 Start Studying Now')
    ),
    h(Text, {
      style: {
        margin: '35px 0 0 0',
        textAlign: 'center',
        fontWeight: '600',
        color: colors.warmAccent,
        fontSize: '16px',
        fontFamily: fontFamily,
      },
    }, "Let's make this semester the best one yet! ✨"),

    // ── Signature ──
    h(Hr, {
      style: {
        borderTop: `2px solid ${colors.warmFooterBorder}`,
        margin: '35px 0',
      },
    }),
    h('div', { style: { textAlign: 'center' } },
      h(Text, {
        style: {
          margin: '0',
          color: colors.warmTextLight,
          fontSize: '15px',
          letterSpacing: '0.5px',
          fontFamily: fontFamily,
        },
      }, 'Warm Regards,'),
      h(Text, {
        style: {
          color: colors.warmTextDark,
          fontSize: '20px',
          fontWeight: '700',
          fontFamily: fontFamilyOutfit,
          margin: '8px 0 0 0',
        },
      }, 'Team Medha Revision'),
      h(Text, {
        style: {
          fontSize: '14px',
          color: colors.warmGold,
          margin: '4px 0 0 0',
        },
      }, 'Your Smart Study Companion ❤️')
    )
  );
}

module.exports = { WelcomeEmail };
