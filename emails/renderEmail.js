const { render } = require('react-email');

/**
 * Render a React Email component to an HTML string.
 * @param {React.ReactElement} component - The React element to render
 * @returns {Promise<string>} - The rendered HTML string
 */
async function renderEmail(component) {
  return await render(component);
}

module.exports = { renderEmail };
