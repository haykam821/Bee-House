const got = require("../utils/got.js");
const { main: log } = require("../utils/log.js");
const Socket = require("./socket.js");

class CommentsSocket extends Socket {
	constructor(app, url) {
		super("comments", url);
		this.app = app;
	}

	handle(data, logger) {
		const json = JSON.parse(data);
		if (json.type === "new_comment") {
			this.app.lastComment = json.payload;
			logger("received comment from u/%s: '%s'", json.payload.author, json.payload.body);
		}
	}
}
module.exports = CommentsSocket;

/**
 * Gets the comments socket URL for a post by its ID.
 * @param {string} postId The post ID to get the comments socket URL for.
 * @returns {Promise<string>} A promise resolving to the comments socket URL.
 */
async function getCommentsSocketUrl(postId) {
	log("getting socket url for post '%s'", postId);

	try {
		const url = "https://gateway.reddit.com/desktopapi/v1/postcomments/" + postId;
		const response = await got.get(url, {
			responseType: "json",
		});

		if (response.body.posts) {
			const post = response.body.posts["t3_" + postId];
			if (post) {
				log("got socket url for post '%s': %s", postId, post.liveCommentsWebsocket);
				return post.liveCommentsWebsocket;
			}
		}

		log("failed to get socket url for post '%s' because the post information response was invalid: %o", postId, response.body);
	} catch (error) {
		log("failed to get socket url for post '%s': %o", postId, error.toString());
	}
}
module.exports.getCommentsSocketUrl = getCommentsSocketUrl;
