const React = require('react');
const h = React.createElement;
const { renderEmail } = require('./renderEmail');
const { OtpEmail } = require('./OtpEmail');
const { WelcomeEmail } = require('./WelcomeEmail');
const { PasswordResetEmail } = require('./PasswordResetEmail');
const { TeamInvitationEmail } = require('./TeamInvitationEmail');
const { EarlyAccessEmail } = require('./EarlyAccessEmail');

async function test() {
  const tests = [
    { name: 'OTP (login)', el: h(OtpEmail, { code: '492730', type: 'login', expiryMinutes: 10 }) },
    { name: 'OTP (verify)', el: h(OtpEmail, { code: '183956', type: 'verification', expiryMinutes: 10 }) },
    { name: 'Welcome', el: h(WelcomeEmail, { name: 'Ayush Rathore' }) },
    { name: 'Reset', el: h(PasswordResetEmail, { name: 'Ayush', resetUrl: 'https://medha.study/reset?token=abc123', ttlMinutes: 30 }) },
    { name: 'Team Invite', el: h(TeamInvitationEmail, { firstName: 'Priya', code: 'A7B3C1', joinLink: 'https://medha.study/join-team?email=test@test.com' }) },
    { name: 'Early Access', el: h(EarlyAccessEmail, { name: 'Rahul' }) },
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const html = await renderEmail(t.el);
      const hasDoctype = html.includes('DOCTYPE');
      console.log('PASS ' + t.name + ': ' + html.length + ' chars, DOCTYPE:' + hasDoctype);
      passed++;
    } catch (e) {
      console.error('FAIL ' + t.name + ': ' + e.message);
    }
  }
  console.log('\n' + passed + '/' + tests.length + ' templates rendered successfully');
}

test();
