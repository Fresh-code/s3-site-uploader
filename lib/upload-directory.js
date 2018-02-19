'use strict';

const LIMIT_CONCURRENT_FILES = 5;

const async = require('async');
const fs = require('fs');
const path = require('path');

const show = require('./output');
const removeModule = require('./remove');
const utils = require('./utils');
const aws = require('./aws');

let s3 = aws.getS3();
let cloudfront = aws.getCloudFront();

const _walkFilesSync = (dir, filelist) => {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  const resolveDir = path.resolve(dir);
  files.forEach((file) => {
    try {
      const str = `${dir}/${file}`;
    if (fs.statSync(str.toString()).isDirectory()) {
      filelist = _walkFilesSync(`${dir}/${file}`, filelist);
    }
    else {
      filelist.push(`${dir}/${file}`);
    }
  } catch (error) {
      const errorMsg = `Cannot read directory ${resolveDir}/${file} or doesn't exist`;
      show.error(errorMsg, false);
    }
  });
    return filelist;
};

const _uploadFile = (rootDir) => {
  return (file, done) => {
    let fileWithoutLocalPath = file.slice(rootDir.length + 1, file.length);
    show.progress(`Uploading ${fileWithoutLocalPath}...`);

    fs.readFile(file, (err, data) => {
      if (err) {
        show.error(`[fs] ${err}`, true);
      }
      const fileExtension = utils.getFileExtension(file);
      const metaData = utils.getContentType(fileExtension);

      const params = {
        ACL: 'public-read',
        ContentType: metaData,
        Body: data,
        Bucket: process.env.BUCKET_NAME,
        Key: fileWithoutLocalPath
      };

      if(fileExtension.match(/(css|js|jpg|jpeg|png|gif|svg|ttf)$/i)) {
        params.CacheControl = 'max-age=2592000000';
      }

      const onUpload = (err, data) => {
        if (err) {
          done(err);
        }
        else {
          show.progress(`Uploaded ${fileWithoutLocalPath}...`);
        }
        done(null, data.Location);
      };

      s3.upload(params, onUpload);
    });
  }
};

const _createInvalidation = () => {
  let distributionId = process.env.DISTRIBUTION_ID;
  if(!distributionId){
    return;
  }
  let params;
  try {
    params = {
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: Date.now().toString(),
        Paths: {
          Quantity: 1,
          Items: ['/*']
        }
      }
    };
    show.info(`[cloudfront] Create an invalidation...`);
  } catch (err) {
    show.error(err, false);
  }
  cloudfront.createInvalidation(params, (err, data) => {
    if (err) { show.error(err, true); }
    else { show.info(`[cloudfront] Invalidation was created`); }
  });
};

module.exports = async(directoryPath) => {
  show.info(`[fs] Reading directory...`);
  const directoryPathResolve = path.resolve(directoryPath);
  show.info(`[config] Directory to upload:\n\t ${directoryPathResolve}`);

  show.info(`[fs] Reading directory...`);
  let fileList = _walkFilesSync(directoryPath);
  show.info(`[fs] Got ${fileList.length} files to upload\n`);

  await removeModule.clearBucket(s3, process.env.BUCKET_NAME).then(clean => {
    if (fileList.length && clean) {
      async.mapLimit(fileList, LIMIT_CONCURRENT_FILES, _uploadFile(directoryPath), (err, filesUploaded) => {
        if (err) {
          return show.error(err, true);
        }
        show.progress('> All files uploaded successfully!', true);
        show.info(`\n[result] URLs of uploaded files\n${filesUploaded.join('\n')}`);

        _createInvalidation();
      });
    }
  });
};
