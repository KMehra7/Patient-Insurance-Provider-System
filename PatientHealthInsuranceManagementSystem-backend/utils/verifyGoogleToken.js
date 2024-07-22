const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("669027125073-9hm16et2k1jq5jgockuo1h88ff1sjc47.apps.googleusercontent.com");

module.exports = async (token) => {
	return new Promise(async (resolve, reject) => {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: "669027125073-9hm16et2k1jq5jgockuo1h88ff1sjc47.apps.googleusercontent.com"
		});
		resolve(ticket.getPayload());
	});
}