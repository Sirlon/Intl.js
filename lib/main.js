"use strict";

Object.seal(Object.defineProperties(exports, {
    default: {
        get: function() {
            return src$main$$default;
        },

        enumerable: true
    }
}));

var src$core$$ = require("./core");

// hack to export the polyfill as global Intl if needed
if (!this.Intl) {
    this.Intl = src$core$$.default;
    src$core$$.default.__applyLocaleSensitivePrototypes();
}

var src$main$$default = src$core$$.default;

//# sourceMappingURL=main.js.map