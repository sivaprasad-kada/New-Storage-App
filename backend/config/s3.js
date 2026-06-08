import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    HeadObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Using dummy credentials as requested
export const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export const createUploadSignedUrl = async ({ key, contentType }) => {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        ContentType: contentType,
    });
    
    console.log("Access Key ID:", process.env.AWS_ACCESS_KEY_ID);
    console.log("Secret Access Key:", process.env.AWS_SECRET_ACCESS_KEY);
    console.log(`Generating S3 Upload URL for ${key} in ${process.env.AWS_REGION} bucket ${process.env.AWS_S3_BUCKET}`);

    const url = await getSignedUrl(s3Client, command, {
        expiresIn: 300,
        // signableHeaders removed to allow default signing (including Host)
    });

    return url;
};

export const createGetSignedUrl = async ({
    key,
    download = false,
    filename,
}) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        ResponseContentDisposition: `${download ? "attachment" : "inline"}; filename=${encodeURIComponent(filename)}`,
    });

    const url = await getSignedUrl(s3Client, command, {
        expiresIn: 300,
    });

    return url;
};

export const getS3FileMetaData = async (key) => {
    const command = new HeadObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
    });

    return await s3Client.send(command);
};

export const deleteS3File = async (key) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
    });

    return await s3Client.send(command);
};

export const deleteS3Files = async (keys) => {
    const command = new DeleteObjectsCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Delete: {
            Objects: keys,
            Quiet: false, // set true to skip individual delete responses
        },
    });

    return await s3Client.send(command);
};
