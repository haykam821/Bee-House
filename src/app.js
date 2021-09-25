const { main: log, commands: commandsLog } = require("./utils/log.js");
const got = require("./utils/got.js");
const CommandManager = require("./utils/command-manager.js");
const CommentsSocket = require("./socket/comments.js");
const StatusSocket = require("./socket/status.js");
const readline = require("readline");

/**
 * Parses a comment ID, adding `t1_` if necessary.
 * @param {string} id The comment ID to parse.
 * @returns {string} The parsed comment ID.
 */
function parseCommentId(id) {
	if (id.startsWith("t1_")) {
		return id;
	} else {
		return "t1_" + id;
	}
}

class BeeHouseApp {
	constructor(config) {
		this.config = config;

		this.lastComment = null;

		this.commands = new CommandManager(this);
		this.commands.registerDefaults();

		this.commands.register("reply", this.handleReply);
		this.commands.register("replyto", this.handleReplyTo);

		this.inputHandler = readline.createInterface(process.stdin);
	}

	async start() {
		log("starting Bee House");

		this.acceptInput();
		commandsLog("started listening for commands");

		const commentsSocketUrl = await CommentsSocket.getCommentsSocketUrl(this.config.post);
		this.commentsSocket = new CommentsSocket(this, commentsSocketUrl);

		this.statusSocket = new StatusSocket();

		if (Array.isArray(this.config.initialCommands)) {
			for (const command of this.config.initialCommands) {
				commandsLog("executing initial command: '%s'", command);
				await this.commands.execute(command);
			}
		}
	}

	acceptInput() {
		this.inputHandler.question("", input => {
			this.commands.execute(input);
			this.acceptInput();
		});
	}

	handleReply(context) {
		if (context.app.lastComment === null) {
			context.log("There is no comment to reply to");
			return;
		}
		context.app.attemptCommandReply(context, context.app.lastComment.name, context.args.join(" "));
	}

	handleReplyTo(context) {
		context.app.attemptCommandReply(context, context.args[0], context.args.slice(1).join(" "));
	}

	async attemptCommandReply(context, parent, body) {
		body = body.trim();

		// Ensure comment body length is correct
		if (body.length === 0) {
			context.log("Comment body is empty");
			return;
		} else if (body.length !== 1) {
			context.log("Comment body must be exactly one character");
			return;
		}

		context.log("Attempting to respond to '%s' with '%s'", parent, body);
		try {
			const response = await context.app.comment(parent, body);
			if (response.error === 401) {
				context.log("Failed to respond to '%s': token may have expired", parent);
			} else if (response.error !== undefined && response.error !== 200) {
				context.log("Failed to respond to '%s' with code %d: %s", parent, response.error, response.message);
			}
		} catch (error) {
			context.log("Failed to respond to '%s': %s", parent, error.toString());
		}
	}

	async comment(parent, body) {
		parent = parseCommentId(parent);

		const response = await got.post("https://oauth.reddit.com/api/comment.json", {
			form: {
				/* eslint-disable camelcase */
				api_type: "json",
				return_rtjson: true,
				text: body,
				thing_id: parent,
				/* eslint-enable camelcase */
			},
			headers: {
				Authorization: this.config.token,
			},
			responseType: "json",
			searchParams: "raw_json=1",
			throwHttpErrors: false,
		});
		return response.body;
	}
}
module.exports = BeeHouseApp;
