import prisma from './prisma';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  // 1. Ensure admin user exists
  const adminCount = await prisma.user.count({ where: { username: 'admin' } });
  if (adminCount === 0) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash,
        businessName: 'Alkaa Business +',
        tagline: 'Course Admissions & Smart Accounting',
        phone: '+91 98765 43210',
        email: 'Kabir.khan@shapenxt.com',
        address: 'Headquarters Campus Main Road',
        currency: '₹',
        invoicePrefix: 'ADM',
        apiKey: 'alkaa_live_9a7bc418e26d03f',
      },
    });
  }

  // 2. Ensure default financial accounts exist
  const accountCount = await prisma.account.count();
  if (accountCount === 0) {
    await prisma.account.createMany({
      data: [
        { name: 'Cash in Hand', type: 'cash', balance: 0 },
        { name: 'Primary Bank Account', type: 'bank', balance: 0 },
        { name: 'Business UPI (GPay/PhonePe)', type: 'upi', balance: 0 },
      ],
    });
  }

  // 3. Ensure default counselors/staff exist
  const staffCount = await prisma.staff.count();
  if (staffCount === 0) {
    await prisma.staff.createMany({
      data: [
        { name: 'Counselor Rahul', role: 'Senior Admissions Counselor', phone: '+91 98111 22233', monthlySalary: 25000 },
        { name: 'Sales Agent Priya', role: 'Course Sales Executive', phone: '+91 98444 55566', monthlySalary: 20000 },
      ],
    });
  }

  return { success: true, message: 'Database seeded successfully with default admin, accounts, and counselors!' };
}

