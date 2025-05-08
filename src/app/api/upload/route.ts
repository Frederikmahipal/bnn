import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import File from '@/models/File';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const uploadedFile = formData.get('file') as File | null;
    const metadataStr = formData.get('metadata') as string;
    console.log('Received metadata string:', metadataStr);
    
    if (!metadataStr) {
      return NextResponse.json(
        { error: 'No metadata provided' },
        { status: 400 }
      );
    }

    const metadata = JSON.parse(metadataStr);
    console.log('Parsed metadata:', metadata);

    let fileUrl: string | undefined;

    // Handle file upload if a file is provided
    if (uploadedFile) {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not established');
      }

      // Convert file to buffer
      const bytes = await uploadedFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create GridFS bucket
      const bucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: 'files'
      });

      // Upload file to GridFS
      const uploadStream = bucket.openUploadStream(uploadedFile.name, {
        metadata: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          price: metadata.price,
          documentDate: metadata.documentDate,
          contentType: uploadedFile.type,
          size: uploadedFile.size
        }
      });

      // Write buffer to upload stream
      uploadStream.write(buffer);
      uploadStream.end();

      // Wait for upload to complete
      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      fileUrl = `/api/files/${uploadStream.id}`;
    }

    // Prepare metadata for File document
    const fileData = {
      fileName: uploadedFile?.name,
      title: metadata.title,
      description: metadata.description || '',
      tags: Array.isArray(metadata.tags) ? metadata.tags : [],
      price: metadata.price ? parseFloat(metadata.price) : undefined,
      documentDate: metadata.documentDate ? new Date(metadata.documentDate) : undefined,
      attachment: uploadedFile ? {
        name: uploadedFile.name,
        type: uploadedFile.type,
        size: uploadedFile.size,
        url: fileUrl
      } : undefined
    };

    console.log('Creating file document with data:', fileData);

    // Create file document with metadata
    const fileDoc = new File(fileData);
    await fileDoc.save();

    console.log('Created file document:', fileDoc.toJSON());

    return NextResponse.json(fileDoc.toJSON());
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error uploading file' },
      { status: 500 }
    );
  }
} 