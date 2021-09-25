const ws = require("ws");
const { createLogger } = require("../utils/log.js");

class Socket {
	constructor(path, url) {
		this.logger = createLogger(path);

		const socket = new ws(url);
		socket.on("open", () => this.logger("socket opened"));
		socket.on("close", () => this.logger("socket closed"));

		socket.on("message", data => {
			try {
				this.handle(data, this.logger);
			} catch (error) {
				this.logger("failed to handle message: %s", error.toString());
			}
		});
	}

	handle() {
		throw new Error("Handler for socket not implemented");
	}
}
module.exports = Socket;