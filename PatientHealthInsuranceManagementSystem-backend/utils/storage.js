const { TOKEN_HEADER, AZURE_STORAGE_KEY } = require('./constants');
const { DecodeAuthToken } = require('../models/user');
const azure = require('azure-storage');
const dataUriToBuffer = require('data-uri-to-buffer');
const FileType = require('file-type');
const empty = require('is-empty');
const winston = require('winston');
const blobService = azure.createBlobService("apollocare", AZURE_STORAGE_KEY);

// This method is in here b/c
// patients, doctors, and insurance users
// can all do this.
// Don't write it 3 times,
// Extract it to a single location.
async function UpdateProfilePic(req, res) {
	// Token Validation
	let token = DecodeAuthToken(req.header(TOKEN_HEADER));
	if (token.id != req.body.id) return res.status(401).send({ error: "Token Invalid" });

	// Data Validation
	if (empty(req.body.img)) return res.status(400).send({ error: "Image data is required." });

	container = token.usertype + token.id;

	UploadFile(container, 'profile', req.body.img)
		.then((message) => {
			return res.status(200).send({ result: message.result, response: message.response });
		}).catch((error) => {
			return res.status(500).send({ error: error.message });
		});
}

async function UploadFile(container, name, stream) {
	const buffer = dataUriToBuffer(stream);
	const filetype = await FileType.fromBuffer(buffer);
	const options = { contentSettings: { contentType: filetype.mime } }

	return new Promise(async function (resolve, reject) {
		blobService.createContainerIfNotExists(container, { publicAccessLevel: 'blob' }, function (error, existResult, existResponse) {
			if (error) {
				winston.error(error);
				return reject(error);
			}
			blobService.createBlockBlobFromText(container, name, buffer, options, function (error, textResult, textResponse) {
				if (error) {
					winston.error(error);
					reject(error);
				}
				return resolve({ result: textResult, response: textResponse });
			});
		});
	});
}


module.exports = { UpdateProfilePic, UploadFile };
