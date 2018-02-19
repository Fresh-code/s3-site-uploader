# S3 Site Uploader

This library is intended to re-upload directory contents to AWS S3 bucket and invalidates AWS CloudFront cache.
 
## Install

```bash
npm install -g s3-site-uploader
```

## Configuration

s3-site-uploader supports dotenv configuration which either takes AWS authentication info from environment variables:

```
ACCESS_KEY_ID - AWS Access Key
SECRET_ACCESS_KEY - AWS Secret Key
BUCKET_NAME - Name of S3 bucket to upload site to
DISTRIBUTION_ID - ID of CloudFlare distribution to invalidate (optional)
```

or from `.env` properties file. 

## Run

Call application with a path to upload directory

```bash
s3-site-uploader /path/to/directory
```