const { sendEmail } = require('./sendEmail');

// CodeLearnn Brand Colors
const brandDark = '#0a0a0f';
const brandCardBg = '#12121a';
const brandBorder = '#2a2a3e';
const brandLime = '#c8fa3c';
const brandText = '#ffffff';
const brandMuted = '#a0a0b0';
const brandTeal = '#2dd4bf';

// CodeLearnn Links
const websiteUrl = 'https://www.codelearnn.com';
const waitlistUrl = 'https://www.codelearnn.com';
const vibeCodingGuideUrl = 'https://www.codelearnn.com/learning-guides/vibe-coding';
const twitterUrl = 'https://twitter.com/codelearnnhq';
const linkedinUrl = 'https://linkedin.com/company/codelearnn';
const feedbackEmail = 'weareteamclarity@gmail.com';
const unsubscribeUrl = 'https://www.codelearnn.com/unsubscribe';

/**
 * Send CodeLearnn Announcement + Vibe Coding Guide Email to Medha Revision users
 * @param {string} email - Recipient email
 * @param {string} userName - Optional recipient name for greeting
 * @returns {Promise<boolean>} - Success status
 */
const sendEarlyAccessEmail = async (email, userName) => {
  const greeting = userName ? userName : 'there';

  const mailOptions = {
    to: email,
    subject: "📖 Free Vibe Coding Guide + CodeLearnn Early Access for Medha Users!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: ${brandDark}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${brandDark};">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="100%" style="max-width: 600px; background-color: ${brandCardBg}; border-radius: 12px; border: 1px solid ${brandBorder};">
                <tr>
                  <td style="padding: 48px 40px;">

                    <!-- Medha → CodeLearnn Bridge Header -->
                    <div style="text-align: center; margin-bottom: 32px;">
                      <p style="color: ${brandMuted}; font-size: 13px; margin: 0 0 12px 0; letter-spacing: 0.5px; text-transform: uppercase;">From the makers of</p>
                      <div style="display: inline-block; margin-bottom: 12px;">
                        <span style="font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">Medha Revision</span>
                      </div>
                      <div style="margin: 10px 0; color: ${brandMuted}; font-size: 18px;">↓</div>
                      <div>
                        <span style="font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                          <span style="color: ${brandLime};">&lt;</span>CodeLearnn<span style="color: ${brandLime};">/&gt;</span>
                        </span>
                      </div>
                    </div>

                    <!-- Greeting -->
                    <p style="color: ${brandText}; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
                      Hey ${greeting}! 👋
                    </p>

                    <!-- Trust Bridge -->
                    <p style="color: ${brandText}; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                      You've been using <strong>Medha Revision</strong> to stay sharp — and we've loved building for you. Today, we're excited to share something we've been quietly building on the side. Something bigger.
                    </p>

                    <p style="color: ${brandMuted}; font-size: 15px; line-height: 1.7; margin: 0 0 32px 0;">
                      Introducing <span style="color: ${brandLime}; font-weight: 700;">&lt;CodeLearnn/&gt;</span> — the only learning OS that transforms scattered YouTube videos and random online courses into a structured, AI-validated roadmap that actually gets you job-ready.
                    </p>

                    <!-- Divider -->
                    <div style="border-top: 1px solid ${brandBorder}; margin: 8px 0 32px 0;"></div>

                    <!-- ===== VIBE CODING GUIDE — HERO SECTION ===== -->
                    <div style="background: linear-gradient(135deg, rgba(200, 250, 60, 0.08) 0%, rgba(200, 250, 60, 0.02) 100%); border: 2px solid rgba(200, 250, 60, 0.4); border-radius: 16px; padding: 32px; margin-bottom: 32px;">
                      
                      <div style="text-align: center; margin-bottom: 20px;">
                        <span style="display: inline-block; background-color: rgba(200, 250, 60, 0.15); border: 1px solid rgba(200, 250, 60, 0.3); padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; color: ${brandLime}; text-transform: uppercase; letter-spacing: 2px;">
                          🎁 FREE — NO SIGN-IN REQUIRED
                        </span>
                      </div>

                      <h2 style="color: #ffffff; font-size: 22px; font-weight: 700; text-align: center; margin: 0 0 8px 0;">
                        📖 The Vibe Coding Playbook
                      </h2>
                      <p style="color: ${brandLime}; font-size: 14px; font-weight: 600; text-align: center; margin: 0 0 20px 0;">
                        Your exclusive guide — free for Medha users
                      </p>

                      <p style="color: ${brandText}; font-size: 15px; line-height: 1.7; margin: 0 0 12px 0;">
                        Build and ship a real AI-powered app with <strong>no prior coding experience</strong>. This guide covers:
                      </p>

                      <div style="margin-bottom: 20px;">
                        <div style="margin-bottom: 8px;">
                          <span style="color: ${brandLime}; margin-right: 10px;">→</span>
                          <span style="color: ${brandText}; font-size: 14px;">Copy-paste prompts to build real projects</span>
                        </div>
                        <div style="margin-bottom: 8px;">
                          <span style="color: ${brandLime}; margin-right: 10px;">→</span>
                          <span style="color: ${brandText}; font-size: 14px;">Step-by-step deployment workflow</span>
                        </div>
                        <div style="margin-bottom: 8px;">
                          <span style="color: ${brandLime}; margin-right: 10px;">→</span>
                          <span style="color: ${brandText}; font-size: 14px;">Go from idea to shipped product in a weekend</span>
                        </div>
                        <div>
                          <span style="color: ${brandLime}; margin-right: 10px;">→</span>
                          <span style="color: ${brandText}; font-size: 14px;">The exact workflow used by students who landed internships</span>
                        </div>
                      </div>

                      <div style="text-align: center;">
                        <a href="${vibeCodingGuideUrl}" style="display: inline-block; background-color: ${brandLime}; color: #0a0a0a; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 700; letter-spacing: 0.2px;">
                          📖 Read the Free Guide →
                        </a>
                      </div>
                      <p style="color: ${brandMuted}; font-size: 12px; text-align: center; margin: 12px 0 0 0;">
                        No sign-up needed. Just click and start reading.
                      </p>
                    </div>

                    <!-- Divider -->
                    <div style="border-top: 1px solid ${brandBorder}; margin: 8px 0 32px 0;"></div>

                    <!-- ===== CODELEARNN EARLY ACCESS WAITLIST ===== -->
                    <div style="text-align: center; margin-bottom: 24px;">
                      <span style="display: inline-block; background-color: rgba(200, 250, 60, 0.1); border: 1px solid rgba(200, 250, 60, 0.3); padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 600; color: ${brandLime}; text-transform: uppercase; letter-spacing: 1.5px;">
                        🔒 Medha Users Get Priority Access
                      </span>
                    </div>

                    <h2 style="color: #ffffff; font-size: 18px; font-weight: 700; text-align: center; margin: 0 0 16px 0;">
                      CodeLearnn is launching soon — and you're first in line.
                    </h2>

                    <p style="color: ${brandMuted}; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0; text-align: center;">
                      As a Medha Revision user, you'll get <span style="color: ${brandLime}; font-weight: 600;">exclusive early access</span> before anyone else when we launch. Join the waitlist now to secure your spot.
                    </p>

                    <!-- Value Proposition Block -->
                    <div style="background-color: ${brandDark}; border: 1px solid ${brandBorder}; border-radius: 12px; padding: 28px; margin-bottom: 24px;">
                      <p style="color: ${brandLime}; font-size: 12px; font-family: monospace; margin: 0 0 16px 0; letter-spacing: 1px;">// what you'll get with CodeLearnn</p>

                      <div style="margin-bottom: 16px;">
                        <div style="margin-bottom: 10px;">
                          <span style="color: ${brandLime}; font-size: 14px; margin-right: 12px;">✓</span>
                          <span style="color: ${brandText}; font-size: 14px; line-height: 1.6;"><strong>AI-built career roadmaps</strong> — personalized learning paths based on your dream role, not random trends.</span>
                        </div>
                        <div style="margin-bottom: 10px;">
                          <span style="color: ${brandLime}; font-size: 14px; margin-right: 12px;">✓</span>
                          <span style="color: ${brandText}; font-size: 14px; line-height: 1.6;"><strong>Curated content, not chaos</strong> — no more random YouTube rabbit holes. Everything is structured and validated.</span>
                        </div>
                        <div style="margin-bottom: 10px;">
                          <span style="color: ${brandLime}; font-size: 14px; margin-right: 12px;">✓</span>
                          <span style="color: ${brandText}; font-size: 14px; line-height: 1.6;"><strong>Free for first 500 students.</strong> As a Medha user, you're already in the priority window.</span>
                        </div>
                      </div>
                    </div>

                    <!-- Waitlist CTA -->
                    <div style="text-align: center; margin-bottom: 16px;">
                      <a href="${waitlistUrl}" style="display: inline-block; background-color: transparent; border: 2px solid ${brandLime}; color: ${brandLime}; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-size: 15px; font-weight: 700; letter-spacing: 0.2px;">
                        ⚡ Join the CodeLearnn Waitlist →
                      </a>
                    </div>

                    <p style="color: ${brandMuted}; font-size: 12px; text-align: center; margin: 0 0 32px 0;">
                      <span style="color: #ff6b6b;">⏳</span> Medha users get first access when we launch — spots are limited.
                    </p>

                    <!-- Divider -->
                    <div style="border-top: 1px solid ${brandBorder}; margin: 8px 0 32px 0;"></div>

                    <!-- Dashboard Preview Card -->
                    <div style="background-color: ${brandDark}; border: 1px solid ${brandBorder}; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                      <div style="margin-bottom: 14px;">
                        <span style="color: ${brandMuted}; font-size: 12px; font-family: monospace;">● ● career_dashboard.tsx</span>
                        <span style="color: ${brandTeal}; font-size: 12px; margin-left: 12px;">v2.0</span>
                      </div>
                      <span style="background-color: rgba(45, 212, 191, 0.1); color: ${brandTeal}; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">COMING SOON</span>
                      <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 10px 0 4px 0;">Full Stack Dev Roadmap</p>
                      <p style="color: ${brandMuted}; font-size: 13px; margin: 0;">Your AI-built learning path — ready when we launch</p>
                    </div>

                    <!-- Divider -->
                    <div style="border-top: 1px solid ${brandBorder}; margin: 8px 0 32px 0;"></div>

                    <!-- Co-Builder Feedback -->
                    <h2 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
                      🛠️ You're a Co-Builder Here
                    </h2>

                    <p style="color: ${brandMuted}; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
                      We built Medha based on what students like you told us was broken. CodeLearnn is no different. Early users shape everything.
                    </p>

                    <p style="color: ${brandMuted}; font-size: 14px; line-height: 1.8; margin: 0 0 8px 0;">Tell us:</p>
                    <ul style="color: ${brandMuted}; font-size: 14px; line-height: 1.9; padding-left: 20px; margin: 0 0 20px 0;">
                      <li style="margin-bottom: 4px;">What's missing from how you learn right now?</li>
                      <li style="margin-bottom: 4px;">What would make you open CodeLearnn every single day?</li>
                      <li style="margin-bottom: 4px;">What did you wish Medha had, that we can build here?</li>
                    </ul>

                    <div style="background-color: rgba(200, 250, 60, 0.05); padding: 16px 20px; border-left: 3px solid ${brandLime}; border-radius: 4px; margin-bottom: 32px;">
                      <p style="color: ${brandText}; font-size: 14px; margin: 0;">
                        📧 Reply directly to this email or write to: <a href="mailto:${feedbackEmail}" style="color: ${brandLime}; text-decoration: none; font-weight: 600;">${feedbackEmail}</a>
                      </p>
                    </div>

                    <!-- Signature -->
                    <div style="margin-top: 16px;">
                      <p style="color: ${brandMuted}; font-size: 15px; line-height: 1.7; margin: 0 0 4px 0;">
                        You helped us build Medha. Let's build this one together too.
                      </p>
                      <p style="color: #ffffff; font-weight: 600; font-size: 15px; margin: 16px 0 4px 0;">– Team CodeLearnn</p>
                      <p style="color: ${brandMuted}; font-size: 13px; margin: 0;">From the makers of Medha Revision</p>
                    </div>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    <div style="border-top: 1px solid ${brandBorder}; padding-top: 24px; text-align: center;">
                      <p style="margin-bottom: 16px;">
                        <a href="${websiteUrl}" style="color: ${brandMuted}; text-decoration: none; font-size: 13px; margin: 0 12px;">Website</a>
                        <a href="${twitterUrl}" style="color: ${brandMuted}; text-decoration: none; font-size: 13px; margin: 0 12px;">Twitter</a>
                        <a href="${linkedinUrl}" style="color: ${brandMuted}; text-decoration: none; font-size: 13px; margin: 0 12px;">LinkedIn</a>
                      </p>
                      <p style="color: #404040; font-size: 11px; margin: 0;">
                        © ${new Date().getFullYear()} CodeLearnn. Learn like an engineer.
                      </p>
                      <p style="color: #303030; font-size: 11px; margin: 6px 0 0 0;">
                        You're receiving this because you use Medha Revision. <a href="${unsubscribeUrl}" style="color: #505050; text-decoration: underline;">Unsubscribe</a>
                      </p>
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    const info = await sendEmail(mailOptions);
    console.log(`✉️  Early access email sent to ${email} (${info.messageId})`);
    return { success: true, html: mailOptions.html, subject: mailOptions.subject };
  } catch (error) {
    console.error('Early access email send error:', error);
    return { success: false };
  }
};

module.exports = {
  sendEarlyAccessEmail
};
