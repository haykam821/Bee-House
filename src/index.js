const getConfig = require("./utils/config.js");
const BeeHouseApp = require("./app.js");

async function start() {
	const config = await getConfig();
	if (config === null) return;

	const app = new BeeHouseApp(config);
	await app.start();
}
start();