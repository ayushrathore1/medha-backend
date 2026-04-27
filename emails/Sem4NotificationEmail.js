const React = require('react');
const { Html, Head, Body, Container, Text, Button, Hr } = require('react-email');
const h = React.createElement;

// ── Design Tokens (same as ReEngagement) ──
const cream = '#FAF8F3';
const green = '#22C55E';
const navy = '#0D0D2B';
const bodyText = '#4A4A4A';
const muted = '#8B8070';
const promptBg = '#F5F0E8';
const promptBorder = '#E0D9CC';
const badgeBorder = '#E8E4DC';
const doodleStroke = '#8B8070';

// ── Colorful doodle strokes ──
const pinkStroke = '#F472B6';
const blueStroke = '#60A5FA';
const yellowStroke = '#FBBF24';
const greenStroke = '#7DC67A';
const purpleStroke = '#A78BFA';
const orangeStroke = '#FB923C';

// ── Inline SVG Doodles ──
const wavyLineSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="20" viewBox="0 0 280 20" preserveAspectRatio="none"><path d="M0 10 Q17 2 35 10 Q53 18 70 10 Q87 2 105 10 Q123 18 140 10 Q157 2 175 10 Q193 18 210 10 Q227 2 245 10 Q263 18 280 10" fill="none" stroke="' + doodleStroke + '" stroke-width="1.5" opacity="0.2"/></svg>';

const starBurstSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M14 2 L16 11 L25 9 L18 14 L25 19 L16 17 L14 26 L12 17 L3 19 L10 14 L3 9 L12 11 Z" fill="none" stroke="' + yellowStroke + '" stroke-width="1.5" stroke-linejoin="round" opacity="0.35"/></svg>';

const spiralSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 50 50"><path d="M25 25 C25 20 30 18 33 21 C36 24 34 30 29 31 C23 32 18 27 19 21 C20 14 27 11 34 13 C41 15 43 24 40 31 C37 38 28 42 21 39" fill="none" stroke="' + pinkStroke + '" stroke-width="1.5" stroke-linecap="round" opacity="0.25"/></svg>';

const circleClusterSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="20" viewBox="0 0 50 20"><circle cx="8" cy="10" r="3" fill="none" stroke="' + blueStroke + '" stroke-width="1.5" opacity="0.25"/><circle cx="24" cy="8" r="5" fill="none" stroke="' + pinkStroke + '" stroke-width="1.5" opacity="0.2"/><circle cx="40" cy="12" r="2" fill="none" stroke="' + purpleStroke + '" stroke-width="1.5" opacity="0.25"/></svg>';

const heartSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 28 28"><path d="M14 24 C10 19 3 15 3 10 C3 7 6 4 9 4 C11 4 13 5 14 7 C15 5 17 4 19 4 C22 4 25 7 25 10 C25 15 18 19 14 24Z" fill="none" stroke="' + pinkStroke + '" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/></svg>';

const zigzagSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="16" viewBox="0 0 60 16"><path d="M2 8 L10 3 L18 8 L26 3 L34 8 L42 3 L50 8 L58 3" fill="none" stroke="' + greenStroke + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.25"/></svg>';

const plusSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20"><path d="M10 3 L10 17 M3 10 L17 10" fill="none" stroke="' + blueStroke + '" stroke-width="2" stroke-linecap="round" opacity="0.25"/></svg>';

// Helper: render inline SVG
function InlineSvg({ svg, style = {} }) {
  return h('div', {
    dangerouslySetInnerHTML: { __html: svg },
    style: { lineHeight: '0', fontSize: '0', ...style },
  });
}

// Flow badge (inline-block, no absolute positioning — mobile safe)
function FlowBadge({ text, color }) {
  return h('span', {
    style: {
      display: 'inline-block',
      backgroundColor: '#ffffff',
      border: `1.5px solid ${color || badgeBorder}`,
      borderRadius: '999px',
      padding: '7px 14px',
      fontSize: '13px',
      fontWeight: '500',
      color: navy,
      whiteSpace: 'nowrap',
      fontFamily: "'Inter', -apple-system, sans-serif",
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      marginRight: '6px',
      marginBottom: '6px',
    },
  }, text);
}

// ── Timetable Data ──
const examSchedule = [
  { subject: 'Discrete Mathematics Structure', code: '4E1301', date: '29 Apr', day: 'wed' },
  { subject: 'Technical Communication / MEFA', code: '4E1303', date: '01 May', day: 'fri' },
  { subject: 'Microprocessor & Interfaces', code: '4E1304', date: '04 May', day: 'mon' },
  { subject: 'Database Management System', code: '4E1305', date: '06 May', day: 'wed' },
  { subject: 'Theory of Computation', code: '4E1306', date: '08 May', day: 'fri' },
  { subject: 'Data Comm. & Computer Networks', code: '4E1307', date: '12 May', day: 'tue' },
];

const dotColors = [greenStroke, orangeStroke, purpleStroke, blueStroke, pinkStroke, yellowStroke];

/**
 * 4th Semester Notification Email
 * Fully table-based layout for mobile email client compatibility.
 * @param {object} props
 * @param {string} [props.name] - User's first name
 */
function Sem4NotificationEmail({ name }) {
  const greeting = name || 'hey you';

  return h(Html, null,
    h(Head, null,
      // Responsive meta + media query for mobile padding
      h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }),
      h('style', {
        dangerouslySetInnerHTML: {
          __html: `
            @media only screen and (max-width: 620px) {
              .email-container { width: 100% !important; border-radius: 0 !important; border-left: none !important; border-right: none !important; }
              .email-padding { padding-left: 20px !important; padding-right: 20px !important; }
              .hero-title { font-size: 30px !important; }
              .hero-subtitle { font-size: 20px !important; }
              .exam-date { font-size: 14px !important; }
              .exam-subject { font-size: 14px !important; }
              .badge-area { text-align: center !important; }
            }
          `
        }
      })
    ),
    h(Body, {
      style: {
        margin: '0',
        padding: '0',
        backgroundColor: cream,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        WebkitTextSizeAdjust: '100%',
      },
    },

      // Outer wrapper table (full width, centered)
      h('table', {
        border: '0', width: '100%', cellPadding: '0', cellSpacing: '0',
        role: 'presentation',
        style: { backgroundColor: cream },
      },
        h('tbody', null,
          h('tr', null,
            h('td', { style: { padding: '32px 16px' }, align: 'center' },

              // ── Main card container ──
              h('table', {
                border: '0', cellPadding: '0', cellSpacing: '0',
                role: 'presentation',
                className: 'email-container',
                style: {
                  maxWidth: '600px',
                  width: '100%',
                  margin: '0 auto',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1px solid #E8E4DC',
                  boxShadow: '0 2px 20px rgba(13,13,43,0.03)',
                  borderCollapse: 'collapse',
                },
              },
                h('tbody', null,

                  // ═══════════════════════════════════════
                  // [1] HEADER — Wordmark
                  // ═══════════════════════════════════════
                  h('tr', null,
                    h('td', {
                      style: { textAlign: 'center', paddingTop: '32px', paddingBottom: '8px' },
                      className: 'email-padding',
                    },
                      h('span', {
                        style: {
                          fontSize: '22px',
                          fontWeight: '800',
                          color: navy,
                          letterSpacing: '-0.5px',
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
                    )
                  ),

                  // ═══════════════════════════════════════
                  // [2] BADGES — inline-block flow (mobile safe)
                  // ═══════════════════════════════════════
                  h('tr', null,
                    h('td', {
                      style: { padding: '8px 24px 16px 24px', textAlign: 'center' },
                      className: 'email-padding badge-area',
                    },
                      h(FlowBadge, { text: '4th Sem is LIVE 🚀', color: '#BBF7D0' }),
                      h(FlowBadge, { text: '6 Subjects ✓', color: '#BFDBFE' }),
                      h(FlowBadge, { text: 'AI Predictions 🤖', color: '#DDD6FE' }),
                      h(FlowBadge, { text: 'PYQ Analysis 📊', color: '#FDE68A' }),
                      h(FlowBadge, { text: 'Exams in 3 days 😱', color: '#FECDD3' }),
                    )
                  ),

                  // ═══════════════════════════════════════
                  // [3] HERO — Big headline
                  // ═══════════════════════════════════════
                  h('tr', null,
                    h('td', {
                      style: { padding: '8px 32px 0 32px' },
                      className: 'email-padding',
                    },
                      h(Text, {
                        className: 'hero-title',
                        style: {
                          fontSize: '36px',
                          fontWeight: '800',
                          color: navy,
                          lineHeight: '1.2',
                          margin: '0 0 6px 0',
                          letterSpacing: '-1px',
                        },
                      }, `yo ${greeting} 👋`),
                      h(Text, {
                        className: 'hero-subtitle',
                        style: {
                          fontSize: '22px',
                          fontWeight: '700',
                          color: navy,
                          lineHeight: '1.3',
                          margin: '0 0 12px 0',
                          letterSpacing: '-0.5px',
                        },
                      }, '4th sem just dropped on medha.'),
                      h(Text, {
                        style: {
                          fontSize: '16px',
                          color: muted,
                          lineHeight: '1.7',
                          margin: '0 0 16px 0',
                        },
                      }, "all 6 subjects. pyq analysis from 2022-2025. ai topic predictions. basically your exam cheat code (the legal kind 😅)"),
                      h(InlineSvg, { svg: wavyLineSvg })
                    )
                  ),

                  // ═══════════════════════════════════════
                  // [4] EXAM TIMETABLE (table-based)
                  // ═══════════════════════════════════════
                  h('tr', null,
                    h('td', {
                      style: { padding: '20px 32px 8px 32px' },
                      className: 'email-padding',
                    },
                      h(Text, {
                        style: {
                          fontSize: '14px',
                          fontWeight: '600',
                          color: muted,
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          margin: '0 0 10px 0',
                        },
                      }, "📅 your exam schedule"),

                      // Timetable card
                      h('table', {
                        border: '0', cellPadding: '0', cellSpacing: '0', width: '100%',
                        role: 'presentation',
                        style: {
                          backgroundColor: promptBg,
                          border: `1.5px solid ${promptBorder}`,
                          borderRadius: '16px',
                          borderCollapse: 'collapse',
                          overflow: 'hidden',
                        },
                      },
                        h('tbody', null,
                          // Shift info row
                          h('tr', null,
                            h('td', {
                              colSpan: '3',
                              style: {
                                padding: '14px 16px',
                                fontSize: '12px',
                                fontWeight: '700',
                                color: muted,
                                textAlign: 'center',
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                borderBottom: `1.5px solid ${promptBorder}`,
                              },
                            }, 'morning shift · 10:30 am — 1:30 pm')
                          ),

                          // Exam rows
                          ...examSchedule.map((exam, idx) =>
                            h('tr', { key: idx },
                              // Color dot + Date
                              h('td', {
                                style: {
                                  padding: '12px 8px 12px 16px',
                                  borderBottom: idx < examSchedule.length - 1 ? `1px dashed ${promptBorder}` : 'none',
                                  verticalAlign: 'top',
                                  whiteSpace: 'nowrap',
                                  width: '80px',
                                },
                              },
                                h('span', {
                                  style: {
                                    display: 'inline-block',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: dotColors[idx],
                                    verticalAlign: 'middle',
                                    marginRight: '8px',
                                  },
                                }),
                                h('span', {
                                  className: 'exam-date',
                                  style: {
                                    fontSize: '15px',
                                    fontWeight: '800',
                                    color: navy,
                                    verticalAlign: 'middle',
                                  },
                                }, exam.date),
                                h('br'),
                                h('span', {
                                  style: {
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    color: muted,
                                    paddingLeft: '16px',
                                  },
                                }, exam.day)
                              ),
                              // Subject + Code
                              h('td', {
                                style: {
                                  padding: '12px 16px 12px 8px',
                                  borderBottom: idx < examSchedule.length - 1 ? `1px dashed ${promptBorder}` : 'none',
                                  verticalAlign: 'top',
                                },
                              },
                                h('span', {
                                  className: 'exam-subject',
                                  style: {
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: bodyText,
                                    lineHeight: '1.4',
                                    display: 'block',
                                  },
                                }, exam.subject),
                                h('span', {
                                  style: {
                                    fontSize: '11px',
                                    color: '#B0B0B0',
                                    display: 'block',
                                    marginTop: '2px',
                                  },
                                }, exam.code)
                              )
                            )
                          )
                        )
                      ),

                      // Doodle accent below table
                      h('div', { style: { textAlign: 'center', marginTop: '8px' } },
                        h(InlineSvg, { svg: zigzagSvg, style: { display: 'inline-block' } })
                      )
                    )
                  ),


                  // ═══════════════════════════════════════
                  // [5] WHAT'S NEW — feature list
                  // ═══════════════════════════════════════
                  h('tr', null,
                    h('td', {
                      style: { padding: '20px 32px 8px 32px' },
                      className: 'email-padding',
                    },
                      h(Text, {
                        style: {
                          fontSize: '17px',
                          fontWeight: '700',
                          color: navy,
                          margin: '0 0 10px 0',
                        },
                      }, "what you'll find inside ✨"),

                      h(Text, {
                        style: {
                          fontSize: '15px',
                          color: bodyText,
                          lineHeight: '2',
                          margin: '0 0 4px 0',
                        },
                      },
                        '📊  multi-year pyq analysis (2022-2025)', h('br'),
                        '🤖  ai topic predictions — know what\'s likely coming', h('br'),
                        '📝  unit-wise question papers with marks', h('br'),
                        '📚  all 6 subjects ready to explore', h('br'),
                        '⚡  one-tap year comparison view'
                      )
                    )
                  ),


                  // ═══════════════════════════════════════
                  // [6] PRO TIP BOX
                  // ═══════════════════════════════════════
                  h('tr', null,
                    h('td', {
                      style: { padding: '12px 32px 8px 32px' },
                      className: 'email-padding',
                    },
                      h('table', {
                        border: '0', cellPadding: '0', cellSpacing: '0', width: '100%',
                        role: 'presentation',
                        style: {
                          backgroundColor: promptBg,
                          border: `1.5px solid ${promptBorder}`,
                          borderRadius: '16px',
                          borderCollapse: 'collapse',
                        },
                      },
                        h('tbody', null,
                          h('tr', null,
                            h('td', { style: { padding: '16px 20px' } },
                              h(Text, {
                                style: {
                                  color: navy,
                                  fontSize: '15px',
                                  fontWeight: '700',
                                  margin: '0 0 6px 0',
                                },
                              }, '💡 pro tip:'),
                              h(Text, {
                                style: {
                                  color: bodyText,
                                  fontSize: '15px',
                                  lineHeight: '1.7',
                                  margin: '0',
                                },
                              }, "start with subjects that have the highest unit weightage. medha shows you exactly which units matter most — so you study smart, not hard. 🎯")
                            )
                          )
                        )
                      )
                    )
                  ),


                  // ═══════════════════════════════════════
                  // [7] CTA BUTTON
                  // ═══════════════════════════════════════
                  h('tr', null,
                    h('td', {
                      style: { padding: '20px 32px 8px 32px' },
                      className: 'email-padding',
                    },
                      h(Text, {
                        style: {
                          fontSize: '16px',
                          color: bodyText,
                          lineHeight: '1.7',
                          margin: '0 0 20px 0',
                        },
                      }, "your first exam is 29th april. that's literally around the corner. go check the analysis before it's too late 🫶"),

                      h('table', {
                        border: '0', cellPadding: '0', cellSpacing: '0', width: '100%',
                        role: 'presentation',
                      },
                        h('tbody', null,
                          h('tr', null,
                            h('td', { align: 'center', style: { padding: '8px 0 16px 0' } },
                              h(Button, {
                                href: 'https://medha-revision.vercel.app/exams?sem=4',
                                style: {
                                  backgroundColor: green,
                                  color: '#FFFFFF',
                                  borderRadius: '999px',
                                  padding: '16px 36px',
                                  fontSize: '16px',
                                  fontWeight: '700',
                                  textDecoration: 'none',
                                  display: 'inline-block',
                                  border: 'none',
                                  boxShadow: '0 4px 14px rgba(34,197,94,0.25)',
                                },
                              }, 'open 4th sem analysis →')
                            )
                          )
                        )
                      )
                    )
                  ),

                  // Wavy line divider
                  h('tr', null,
                    h('td', {
                      style: { padding: '0 32px', margin: '4px 0' },
                      className: 'email-padding',
                    },
                      h(InlineSvg, { svg: wavyLineSvg })
                    )
                  ),


                  // ═══════════════════════════════════════
                  // [8] FEATURE TAGS
                  // ═══════════════════════════════════════
                  h('tr', null,
                    h('td', {
                      style: { padding: '14px 32px 8px 32px' },
                      className: 'email-padding',
                    },
                      h(Text, {
                        style: {
                          fontSize: '13px',
                          fontWeight: '600',
                          color: muted,
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          margin: '0 0 8px 0',
                        },
                      }, "also new on medha ✨"),

                      // Inline-block tags (naturally wrap on mobile)
                      h('div', null,
                        ...['multi-year toggle', 'ai predictions', 'question viewer', 'unit importance'].map((tag, i) =>
                          h('span', {
                            key: i,
                            style: {
                              display: 'inline-block',
                              backgroundColor: cream,
                              border: `1px solid ${badgeBorder}`,
                              borderRadius: '999px',
                              padding: '5px 14px',
                              fontSize: '12px',
                              fontWeight: '500',
                              color: muted,
                              marginRight: '4px',
                              marginBottom: '4px',
                            },
                          }, tag)
                        )
                      )
                    )
                  ),


                  // ═══════════════════════════════════════
                  // [9] WHATSAPP CTA
                  // ═══════════════════════════════════════
                  h('tr', null,
                    h('td', {
                      align: 'center',
                      style: { padding: '14px 32px 8px 32px' },
                      className: 'email-padding',
                    },
                      h(Text, {
                        style: {
                          fontSize: '15px',
                          color: bodyText,
                          margin: '0 0 12px 0',
                        },
                      }, "got doubts? join the gang 👇"),
                      h(Button, {
                        href: 'https://chat.whatsapp.com/JmtlAAnbEiX59FWeMDAvsj',
                        style: {
                          backgroundColor: '#25D366',
                          color: '#FFFFFF',
                          borderRadius: '999px',
                          padding: '11px 28px',
                          fontSize: '14px',
                          fontWeight: '600',
                          textDecoration: 'none',
                          display: 'inline-block',
                          border: 'none',
                        },
                      }, '💬 join whatsapp group')
                    )
                  ),


                  // ═══════════════════════════════════════
                  // [10] FOOTER
                  // ═══════════════════════════════════════
                  h('tr', null,
                    h('td', {
                      style: {
                        padding: '20px 32px 24px 32px',
                        borderTop: '1px solid #E8E4DC',
                      },
                      className: 'email-padding',
                    },
                      h(InlineSvg, {
                        svg: circleClusterSvg,
                        style: { margin: '0 0 8px 0', opacity: '0.6' },
                      }),
                      h(Text, {
                        style: {
                          fontSize: '15px',
                          color: bodyText,
                          margin: '0 0 4px 0',
                          lineHeight: '1.5',
                        },
                      }, 'go crush those exams 💪'),
                      h(Text, {
                        style: {
                          fontSize: '14px',
                          color: muted,
                          margin: '0 0 4px 0',
                          lineHeight: '1.5',
                        },
                      }, '— team medha'),
                      h(Text, {
                        style: {
                          fontSize: '13px',
                          color: '#B0B0B0',
                          margin: '0 0 10px 0',
                        },
                      }, 'your study buddy, always ❤️'),
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
                  )

                ) // end tbody
              ) // end main table
            ) // end center td
          ) // end tr
        ) // end tbody
      ) // end outer table

    ) // end Body
  ); // end Html
}

module.exports = { Sem4NotificationEmail };
