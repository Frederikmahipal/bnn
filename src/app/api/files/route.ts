import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    
    // Get files from our File collection
    const files = await File.find().sort({ createdAt: -1 });
    
    // Get GridFS bucket
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'files'
    });
    
    // Get all GridFS files
    const gridFSFiles = await bucket.find().toArray();
    
    // Map GridFS files to a lookup object by filename
    const gridFSFilesMap = gridFSFiles.reduce<Record<string, any>>((acc, gridFile) => {
      if (gridFile.filename) {
        acc[gridFile.filename] = gridFile;
      }
      return acc;
    }, {});
    
    // Return files with their metadata
    const filesWithMetadata = files.map(file => {
      const fileObj = file.toObject();
      const gridFile = fileObj.fileName ? gridFSFilesMap[fileObj.fileName] : undefined;
      
      return {
        ...fileObj,
        title: fileObj.title || fileObj.fileName,
        description: fileObj.description || '',
        tags: fileObj.tags || [],
        price: fileObj.price,
        documentDate: fileObj.documentDate || fileObj.createdAt,
        gridFSMetadata: gridFile?.metadata || {}
      };
    });

    return NextResponse.json(filesWithMetadata);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Error fetching files' },
      { status: 500 }
    );
  }
} 