'use strict';

const AWS = require('aws-sdk');
const show = require('./output');

let awsConfig;

const init = () => {
  show.info('[aws] Initialize Amazon S3...');
  show.info('[config] Load config credentials and start AWS S3 Client');

  awsConfig = {accessKeyId: '', secretAccessKey: ''};
  awsConfig.accessKeyId = process.env.ACCESS_KEY_ID;
  awsConfig.secretAccessKey = process.env.SECRET_ACCESS_KEY;
  if (!awsConfig.accessKeyId || !awsConfig.secretAccessKey || !process.env.BUCKET_NAME) {
    console.log(`[warn] You have to specify ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME env variables`);
    process.exit(1);
  }
  AWS.config.update(awsConfig);
  show.info('[aws] Amazon S3 initialized');
};

const getS3 = () => {
  return new AWS.S3();
};

const getCloudFront = () => {
  return new AWS.CloudFront();
};

init();

module.exports = {
  getS3,
  getCloudFront
};