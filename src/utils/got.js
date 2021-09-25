const { default: got } = require("got");

module.exports = got.extend({
	headers: {
		"User-Agent": "Bee Script v1.0.0",
	},
});
