import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import File from '@/models/File';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'files'
    });

    // Get file metadata first
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(params.id) }).toArray();
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const file = files[0];
    const downloadStream = bucket.openDownloadStream(
      new mongoose.Types.ObjectId(params.id)
    );

    const chunks: Buffer[] = [];

    // Wait for the stream to complete
    await new Promise((resolve, reject) => {
      downloadStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      downloadStream.on('error', reject);
      downloadStream.on('end', resolve);
    });

    // Combine chunks into a single buffer
    const fileData = Buffer.concat(chunks);

    // Get the content type from metadata or file info
    const contentType = file.metadata?.contentType || file.contentType || 'application/octet-stream';

    // Create response with appropriate headers
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=31536000'
    });

    return new NextResponse(fileData, { headers });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error downloading file' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const formData = await request.formData();
    const uploadedFile = formData.get('file') as File | null;
    const metadataStr = formData.get('metadata') as string;
    
    if (!metadataStr) {
      return NextResponse.json(
        { error: 'No metadata provided' },
        { status: 400 }
      );
    }

    const metadata = JSON.parse(metadataStr);
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

    // Prepare update data
    const updateData: any = {
      title: metadata.title,
      description: metadata.description || '',
      tags: Array.isArray(metadata.tags) ? metadata.tags : [],
      price: metadata.price ? parseFloat(metadata.price) : undefined,
      documentDate: metadata.documentDate ? new Date(metadata.documentDate) : new Date(),
    };

    // If there's a new file, update the attachment
    if (uploadedFile) {
      updateData.fileName = uploadedFile.name;
      updateData.attachment = {
        name: uploadedFile.name,
        type: uploadedFile.type,
        size: uploadedFile.size,
        url: fileUrl
      };
    }

    // Update the document
    const updatedDoc = await File.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDoc.toJSON());
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error updating document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // First, get the document to check if it has an attachment
    const document = await File.findById(params.id);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // If there's an attachment, delete the file from GridFS
    if (document.attachment?.url) {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not established');
      }

      const bucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: 'files'
      });

      // Extract the file ID from the URL
      const fileId = document.attachment.url.split('/').pop();
      if (fileId) {
        try {
          await bucket.delete(new mongoose.Types.ObjectId(fileId));
        } catch (error) {
          console.error('Error deleting file from GridFS:', error);
          // Continue with document deletion even if file deletion fails
        }
      }
    }

    // Delete the document
    await File.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error deleting document' },
      { status: 500 }
    );
  }
} 