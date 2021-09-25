const { cosmiconfig } = require("cosmiconfig");

const { configuration: log } = require("./log.js");

async function getConfig() {
	const explorer = cosmiconfig("beehouse", {
		searchPlaces: [
			"package.json",
			"config.json",
			".beehouserc",
			".beehouserc.json",
			".beehouserc.yaml",
			".beehouserc.yml",
			".beehouserc.js",
			".beehouserc.cjs",
			"beehouse.config.js",
			"beehouse.config.cjs",
		],
	});

	const result = await explorer.search();

	log("loaded configuration from '%s'", result.filepath);
	log("loaded configuration: %O", result.config);

	if (!result.config.token) {
		log("configuration does not specify a token");
		return null;
	} else if (!result.config.post) {
		log("configuration does not specify a post");
		return null;
	}

	return result.config;
}
module.exports = getConfig;