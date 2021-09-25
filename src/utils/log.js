const debug = require("debug");

function createLogger(path) {
	const logger = debug("beescript:" + path);
	logger.enabled = true;
	return logger;
}
module.exports.createLogger = createLogger;

module.exports.main = createLogger("main");
module.exports.commands = createLogger("commands");
module.exports.configuration = createLogger("configuration");