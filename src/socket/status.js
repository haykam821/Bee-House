const chalk = require("chalk");

const Socket = require("./socket.js");

const doneColor = chalk.blueBright;
const caretColor = chalk.yellowBright;
const caret = caretColor("ʌ");

function statusLog(logger, json) {
	logger(doneColor(json.lastWritten + " ") + caret + " " + json.firstRemaining);
}

class StatusSocket extends Socket {
	constructor() {
		super("status", "wss://ouijabeederboard.com/ws");
	}

	handle(dataBuf, logger) {
		const data = dataBuf.toString();
		if (data === "ping" || data === "pong") return;

		const json = JSON.parse(data);

		logger("progress is %d (%d%%, %d%% over last 24-hour period)", json.progress, json.percent, json.percent24);
		statusLog(logger, json);
	}
}
module.exports = StatusSocket;