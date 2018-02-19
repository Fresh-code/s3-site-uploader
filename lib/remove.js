const show = require('./output');

const listBuckets = (client) => {
  client.listBuckets({}, (err, data) => {
    const buckets = data.Buckets;
    const owners = data.Owner;
    for (let i = 0; i < buckets.length; ++i) {
      const bucket = buckets[i];
      show.info(`${bucket.Name} created on ${bucket.CreationDate}`);
    }
    for (let i = 0; i < owners.length; ++i) {
      show.info(`${owners[i].ID} ${owners[i].DisplayName}`);
    }
  });
};

const deleteBucket = (client, bucket) => {
  client.deleteBucket({Bucket: bucket}, (err, data) => {
    if (err) {
      show.error(`[s3] Error deleting bucket ${err}`, false);
    } else {
      show.info(`[s3] Delete the bucket ${data}`);
    }
  });
};

const clearBucket = (client, bucket) => {
  return client.listObjects({Bucket: bucket}).promise()
    .then(data => {
      if (!data.Contents.length) {
        return true;
      }
      let promises = data.Contents.map(item => {
        const deleteParams = {Bucket: bucket, Key: item.Key};

        return client.deleteObject(deleteParams).promise()
          .then(data => {
            show.info(`[s3] Deleted ${deleteParams.Key}`);
          }).catch(err => {
            show.error(`[s3] Delete err ${deleteParams.Key}: ${err}`, false);
          });
      });
      return Promise.all(promises);
    }).catch(err => {
      show.error(`[s3] Get objects err: ${err}`, false);
    });
};

module.exports = {
  listBuckets,
  deleteBucket,
  clearBucket
};