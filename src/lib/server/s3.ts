import Minio from 'minio';
import { S3_URL, S3_ACCESS, S3_SECRET } from '$env/static/private';

let minioClient = new Minio.Client({
	endPoint: S3_URL,
	useSSL: true,
	accessKey: S3_ACCESS,
	secretKey: S3_SECRET
});

export default minioClient;
