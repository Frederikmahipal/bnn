import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import File from '@/models/File';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    const tags = searchParams.getAll('tags');
    
    let query: any = {};

    // Add text search if search term is provided
    if (searchTerm) {
      // Search in title and description using text index
      query.$or = [
        { $text: { $search: searchTerm } },
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { price: isNaN(Number(searchTerm)) ? undefined : Number(searchTerm) },
        { documentDate: isNaN(Date.parse(searchTerm)) ? undefined : new Date(searchTerm) }
      ].filter(Boolean);
    }

    // Add tag filtering if tags are provided
    if (tags.length > 0) {
      query.tags = { $all: tags };
    }

    const documents = await File.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Error fetching documents' },
      { status: 500 }
    );
  }
} 