const slugifyLib = require('slugify');

function makeSlug(text) {
  return slugifyLib(text || '', { lower: true, strict: true, trim: true });
}

module.exports = { makeSlug };
