

var IntlPolyfill = require('./core');

// hack to export the polyfill as global Intl if needed
if (!this.Intl) {
    this.Intl = IntlPolyfill;
    IntlPolyfill.__applyLocaleSensitivePrototypes();
}

module.exports = IntlPolyfill;
