import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const files = await prisma.sftpFile.findMany({
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(
      files.map((f) => ({
        ...f,
        rel_path: f.relPath,
        file_size: f.fileSize,
        file_type: f.fileType,
        row_count: f.rowCount,
        sheet_names: f.sheetNames,
        uploaded_by: f.uploadedBy,
        last_modified: f.lastModified ? f.lastModified.toISOString() : null,
        created_at: f.createdAt.toISOString(),
      }))
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

