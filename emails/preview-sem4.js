const React = require('react');
const h = React.createElement;
const { renderEmail } = require('./renderEmail');
const { Sem4NotificationEmail } = require('./Sem4NotificationEmail');
const fs = require('fs');
const path = require('path');

async function preview() {
  try {
    const html = await renderEmail(
      h(Sem4NotificationEmail, { name: 'Ayush' })
    );
    const outPath = path.join(__dirname, 'preview-sem4.html');
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`✅ Preview saved to ${outPath} (${html.length} chars)`);
  } catch (e) {
    console.error('❌ Render failed:', e.message);
    console.error(e.stack);
  }
}

preview();
