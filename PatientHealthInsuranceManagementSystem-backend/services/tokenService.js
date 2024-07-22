const constants = require('../utils/constants');
const twilio = require('twilio');

const AccessToken = twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;

function TokenGenerator(identity) {
    const appName = 'ApolloCare Chat';

    // Create a "grant" which enables a client to use Chat as a given user
    const chatGrant = new ChatGrant({
        serviceSid: constants.TWILIO_CHAT_SERVICE_SID,
    });

    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    const token = new AccessToken(
        constants.TWILIO_ACCOUNT_SID,
        constants.TWILIO_API_KEY,
        constants.TWILIO_API_SECRET
    );

    token.addGrant(chatGrant);
    token.identity = identity;

    return token;
}

module.exports = { generate: TokenGenerator };