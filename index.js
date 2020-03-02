const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const github = require('@actions/github');

try {
  const inputBucket = core.getInput('bucket');
  const inputPath = core.getInput('path');
  const inputKey = core.getInput('key');
  const key = path.join(github.context.sha, inputKey);

  const stream = fs.createWriteStream(inputPath);

  AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });
  s3 = new AWS.S3({ apiVersion: process.env.AWS_API_VERISON || '2006-03-01' });

  s3.getObject({ Bucket: inputBucket, Key: key }, (err, data) => {
   if (err) {
     throw err;
   }
    core.info(`Downloading ${data.Location} to ${inputPath}`);

   data.stream.pipe(stream);

   stream.on('error', err => { throw err; });
 });
} catch (error) {
  core.setFailed(error.message);
}
