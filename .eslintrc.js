module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "mocha": true,
        "node": true
    },
    "globals": {
        "FileTransfer": true,
        "cordova": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "no-console": [
            "warn"
        ],
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
