const React = require('react');
const { Text, Heading, Section, Button, Hr, Link } = require('react-email');
const { MedhaLayout } = require('./components/Layout');
const { colors, fontFamilyInter } = require('./components/styles');
const h = React.createElement;

/**
 * Team Invitation Email
 * Sent when an admin invites a user to join the Medha team.
 * @param {object} props
 * @param {string} props.firstName - Recipient's first name
 * @param {string} props.code - 6-digit invitation code
 * @param {string} props.joinLink - Full join team URL
 */
function TeamInvitationEmail({ firstName, code, joinLink }) {
  return h(MedhaLayout, {
    preview: `Ayush Rathore has invited you to join the MEDHA REVISION team! Use invite code ${code} to join.`,
    variant: 'dark',
    showHeader: false,
    showFooter: false,
  },
    // ── Custom Brand Header ──
    h('div', {
      style: { textAlign: 'center', padding: '40px 20px 0 20px' },
    },
      h('div', {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        },
      },
        h('div', {
          style: {
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ff6b00',
            display: 'inline-block',
          },
        }),
        h('span', {
          style: {
            fontWeight: '900',
            fontSize: '24px',
            letterSpacing: '-1px',
            color: colors.black,
            fontFamily: fontFamilyInter,
          },
        }, 'MEDHA')
      )
    ),

    // ── Main Content ──
    h(Heading, {
      as: 'h1',
      style: {
        fontFamily: fontFamilyInter,
        color: colors.black,
        fontWeight: '800',
        fontSize: '32px',
        letterSpacing: '-0.05em',
        textAlign: 'center',
        margin: '30px 0 20px 0',
      },
    }, "You're Invited!"),

    h(Text, {
      style: {
        textAlign: 'center',
        color: '#4a4a4a',
        fontWeight: '500',
        fontSize: '16px',
        fontFamily: fontFamilyInter,
      },
    }, `Hi ${firstName},`),

    // ── Invitation Card ──
    h('div', {
      style: {
        backgroundColor: colors.white,
        border: `1px solid ${colors.darkBorder}`,
        borderRadius: '16px',
        padding: '30px',
        margin: '25px 0',
        textAlign: 'center',
      },
    },
      h(Text, {
        style: {
          margin: '0',
          fontSize: '18px',
          color: colors.black,
          fontFamily: fontFamilyInter,
          lineHeight: '1.6',
        },
      },
        h('strong', null, 'Ayush Rathore'),
        ' is inviting you to join the ',
        h('span', {
          style: { color: '#ff6b00', fontWeight: '800', letterSpacing: '0.5px' },
        }, 'MEDHA'),
        ' team!'
      )
    ),

    h(Text, {
      style: {
        textAlign: 'center',
        color: '#4a4a4a',
        fontSize: '16px',
        lineHeight: '1.6',
        fontFamily: fontFamilyInter,
      },
    }, "We're building a platform that helps college students prep faster for end-sem exams with the right resources and structure. Click below to accept the invitation."),

    // ── CTA Button ──
    h('div', { style: { textAlign: 'center', margin: '40px 0' } },
      h(Button, {
        href: joinLink,
        style: {
          backgroundColor: colors.black,
          color: colors.white,
          padding: '14px 30px',
          borderRadius: '50px',
          fontWeight: '600',
          fontSize: '16px',
          fontFamily: fontFamilyInter,
        },
      }, 'Accept Invitation')
    ),

    // ── Invitation Code ──
    h(Text, {
      style: {
        textAlign: 'center',
        margin: '0',
        fontSize: '15px',
        color: '#4a4a4a',
        fontFamily: fontFamilyInter,
      },
    }, 'Or, use this invitation code if asked:'),
    h('div', { style: { textAlign: 'center', margin: '20px 0' } },
      h('span', {
        style: {
          backgroundColor: '#f9f9f9',
          color: colors.black,
          border: `1px solid ${colors.darkBorder}`,
          padding: '10px 24px',
          borderRadius: '12px',
          fontFamily: "'Courier New', monospace",
          fontSize: '22px',
          fontWeight: '700',
          letterSpacing: '4px',
        },
      }, code)
    ),

    h(Text, {
      style: {
        textAlign: 'center',
        fontSize: '14px',
        color: '#888888',
        marginTop: '30px',
        fontFamily: fontFamilyInter,
      },
    }, 'Note: You must have an account with this email address to join the team.'),

    // ── Signature ──
    h(Hr, { style: { borderTop: `1px solid ${colors.darkBorder}`, margin: '30px 0' } }),
    h('div', { style: { textAlign: 'center' } },
      h(Text, {
        style: { margin: '0', color: '#4a4a4a', fontSize: '15px', letterSpacing: '0.5px' },
      }, 'Thanks,'),
      h(Text, {
        style: {
          color: colors.black,
          fontSize: '16px',
          fontWeight: '700',
          fontFamily: fontFamilyInter,
          margin: '8px 0 0 0',
        },
      }, 'Ayush Rathore'),
      h(Text, {
        style: { fontSize: '14px', color: '#888888', fontWeight: '500', margin: '4px 0 0 0' },
      }, 'MEDHA Revision')
    ),

    // ── Custom Footer ──
    h('div', {
      style: {
        textAlign: 'center',
        padding: '30px',
        backgroundColor: '#f9f9f9',
        borderTop: `1px solid ${colors.darkBorder}`,
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        fontSize: '12px',
        color: '#888888',
        marginTop: '30px',
      },
    },
      h('div', {
        style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '10px' },
      },
        h('div', {
          style: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff6b00', display: 'inline-block' },
        }),
        h('strong', { style: { color: colors.black } }, 'MEDHA')
      ),
      h(Text, { style: { margin: '10px 0 0 0' } },
        h(Link, {
          href: 'https://medha-revision.vercel.app/',
          style: { color: '#4a4a4a', textDecoration: 'none', fontWeight: '600' },
        }, 'Visit the Website')
      )
    )
  );
}

module.exports = { TeamInvitationEmail };
