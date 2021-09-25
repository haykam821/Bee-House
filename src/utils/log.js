const debug = require("debug");

/**
 * Creates and enables a logger with a given path.
 * @param {string} path The path of the logger.
 */
function createLogger(path) {
	const logger = debug("beescript:" + path);
	logger.enabled = true;
	return logger;
}
module.exports.createLogger = createLogger;

module.exports.main = createLogger("main");
module.exports.commands = createLogger("commands");
module.exports.configuration = createLogger("configuration");
