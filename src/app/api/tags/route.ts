import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tag from '@/models/Tag';

export async function GET() {
  try {
    await connectDB();
    const tags = await Tag.find().sort({ usageCount: -1, name: 1 });
    
    // Set cache control headers to prevent stale data
    const headers = new Headers();
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return NextResponse.json(tags, { headers });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Error fetching tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Tag name is required and must be a string' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim().toLowerCase();
    if (!trimmedName) {
      return NextResponse.json(
        { error: 'Tag name cannot be empty' },
        { status: 400 }
      );
    }

    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: trimmedName });
    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag already exists' },
        { status: 409 }
      );
    }

    const tag = await Tag.create({ name: trimmedName });
    
    // Set cache control headers
    const headers = new Headers();
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return NextResponse.json(tag, { headers });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Error creating tag' },
      { status: 500 }
    );
  }
} 