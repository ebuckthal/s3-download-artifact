const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const github = require('@actions/github');

async function run() {
  try {
    const inputBucket = core.getInput('bucket');
    const inputPath = core.getInput('path');
    const inputKey = core.getInput('key');
    const key = path.join(
      github.context.repository,
      github.context.sha,
      inputKey,
    );

    AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });
    s3 = new AWS.S3({
      apiVersion: process.env.AWS_API_VERISON || '2006-03-01',
    });

    await new Promise((resolve, reject) => {
      const s3Stream = s3
        .getObject({ Bucket: inputBucket, Key: key })
        .createReadStream();
      const fileStream = fs.createWriteStream(inputPath);

      s3Stream.on('error', reject);
      fileStream.on('error', reject);
      fileStream.on('close', () => resolve());
      s3Stream.pipe(fileStream);
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
