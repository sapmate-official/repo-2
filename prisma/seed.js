const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to Neon PostgreSQL...');
  
  // 1. Admin user
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
        email: 'contact@alkaabusiness.com',
        address: 'Headquarters Campus Main Road',
        currency: '₹',
        invoicePrefix: 'ADM',
        apiKey: 'alkaa_live_9a7bc418e26d03f',
      },
    });
    console.log('✅ Admin user created: admin / admin123');
  } else {
    console.log('ℹ️ Admin user already exists.');
  }

  // 2. Default accounts
  const accountCount = await prisma.account.count();
  if (accountCount === 0) {
    await prisma.account.createMany({
      data: [
        { name: 'Cash in Hand', type: 'cash', balance: 0 },
        { name: 'Primary Bank Account', type: 'bank', balance: 0 },
        { name: 'Business UPI (GPay/PhonePe)', type: 'upi', balance: 0 },
      ],
    });
    console.log('✅ Created 3 default financial accounts (Cash, Bank, UPI)');
  } else {
    console.log(`ℹ️ Accounts already exist (${accountCount} accounts).`);
  }

  // 3. Default staff
  const staffCount = await prisma.staff.count();
  if (staffCount === 0) {
    await prisma.staff.createMany({
      data: [
        { name: 'Counselor Rahul', role: 'Senior Admissions Counselor', phone: '+91 98111 22233', monthlySalary: 25000 },
        { name: 'Sales Agent Priya', role: 'Course Sales Executive', phone: '+91 98444 55566', monthlySalary: 20000 },
      ],
    });
    console.log('✅ Created default counselors (Rahul, Priya)');
  } else {
    console.log(`ℹ️ Staff already exist (${staffCount} staff).`);
  }

  console.log('🎉 Neon database is fully initialized and ready!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

