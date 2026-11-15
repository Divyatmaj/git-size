// Library entry point: `require("cli-git-size")`. Has no side effects.
const scanDirectory = require("./Scanner");
const analyzer = require("./Analyzer");
const formatter = require("./Formatter");

module.exports = {
    scanDirectory,
    ...analyzer,
    ...formatter,
};
