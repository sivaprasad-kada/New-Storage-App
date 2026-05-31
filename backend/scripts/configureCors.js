import "dotenv/config";
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const run = async () => {
    const bucketName = process.env.AWS_S3_BUCKET;

    if (!bucketName) {
        console.error("Error: AWS_S3_BUCKET is not defined in .env");
        return;
    }

    console.log(`Configuring CORS for bucket: ${bucketName}...`);

    const command = new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedHeaders: ["*"],
                    AllowedMethods: ["PUT", "POST", "DELETE", "GET", "HEAD"],
                    AllowedOrigins: ["*"], // Allow ALL origins to be absolutely sure
                    ExposeHeaders: ["ETag"],
                    MaxAgeSeconds: 3000,
                },
            ],
        },
    });

    try {
        await s3Client.send(command);
        console.log(" Successfully updated S3 CORS configuration!");
    } catch (err) {
        console.error(" Error updating CORS configuration:", err);
    }
};

run();
