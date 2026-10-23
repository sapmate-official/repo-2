import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const totalFiles = await prisma.sftpFile.count();
    const csvFiles = await prisma.sftpFile.count({ where: { fileType: 'csv' } });
    const excelFiles = await prisma.sftpFile.count({ where: { fileType: { in: ['xlsx', 'xls'] } } });

    return NextResponse.json({
      running: true,
      port: 2222,
      storageDirectory: 'D:\\Workspace\\flykites\\data\\storage\\flykites_user',
      defaultUser: 'alkaa_admin',
      stats: {
        totalFiles,
        csvFiles,
        excelFiles,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

