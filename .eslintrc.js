module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
    },
    "globals": {
        "FileTransfer": true
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