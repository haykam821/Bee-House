const { commands: log } = require("./log.js");

class CommandManager {
	constructor(app) {
		this.app = app;
		this.commands = {};
	}

	async execute(input) {
		const parts = input.toString().split(" ");

		const commandName = parts[0];
		const command = this.commands[commandName];
		if (typeof command === "function") {
			try {
				const context = {
					app: this.app,
					args: parts.slice(1),
					input,
					log,
				};
				await command(context);
			} catch (error) {
				log("failed to execute command '%s': %s", commandName, error.toString());
			}
		} else {
			log("unknown command '%s'", commandName);
		}
	}

	register(name, handler) {
		if (typeof handler !== "function") {
			throw new TypeError("Handler for command '" + name + "' must be a function");
		}
		this.commands[name] = handler.bind(null);
	}

	registerDefaults() {
		this.register("help", this.handleHelp);
		this.register("config", this.handleConfig);
		this.register("log", this.handleLog);
	}

	handleHelp(context) {
		const commandNames = Object.keys(context.app.commands.commands);
		context.log("The following %d commands are available:", commandNames.length);

		for (const commandName of commandNames) {
			context.log("- %s", commandName);
		}
	}

	handleConfig(context) {
		const key = context.args[0];
		if (!key) {
			context.log("A key to set must be provided");
			return;
		}

		const value = context.args.slice(1).join(" ");
		if (!value) {
			context.log("A new value for the key must be provided");
			return;
		}

		if (typeof context.app.config[key] === "string") {
			context.app.config[key] = value;
			context.log("Set the config option '%s' to '%s'", key, value);
		} else {
			context.log("Unknown config option '%s'", key);
		}
	}

	handleLog(context) {
		context.log("The following arguments were passed to this command: %o", context.args);
	}
}
module.exports = CommandManager;