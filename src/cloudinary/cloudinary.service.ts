import { Injectable, Inject } from '@nestjs/common';
import { v2 } from 'cloudinary';
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryService {
    constructor(@Inject('CLOUDINARY') private cloudinary: typeof v2) { }

    uploadFile(file: Express.Multer.File): Promise<any> {
        return new Promise((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream(
                {
                    folder: 'oftisoft/avatars',
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    // Generic upload if we need to support other types
    uploadImage(file: Express.Multer.File, folder: string = 'oftisoft/uploads'): Promise<any> {
        return new Promise((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }
}
