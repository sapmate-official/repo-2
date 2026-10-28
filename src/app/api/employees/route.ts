import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required to view the workforce employee directory' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const department = searchParams.get('department')?.trim() || '';
    const presence = searchParams.get('presence')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';

    const where: any = {};
    if (department && department !== 'all') {
      where.department = department;
    }
    if (presence && presence !== 'all') {
      where.presence = presence;
    }
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }

    const rawEmployees = await prisma.staff.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        incentives: true,
      },
    });

    const employees = await Promise.all(
      rawEmployees.map(async (s) => {
        const [salesAgg, studentsCount, user] = await Promise.all([
          prisma.invoice.aggregate({
            where: { counselorStaffId: s.id },
            _count: { id: true },
            _sum: { netAmount: true },
          }),
          prisma.person.count({
            where: { counselorStaffId: s.id, type: 'student' },
          }),
          s.userId
            ? prisma.user.findUnique({
                where: { id: s.userId },
                select: { username: true, role: true },
              })
            : null,
        ]);

        const incentivesDue = s.incentives
          .filter((i) => i.status === 'due')
          .reduce((sum, i) => sum + Number(i.amount), 0);

        const incentivesPaid = s.incentives
          .filter((i) => i.status === 'paid')
          .reduce((sum, i) => sum + Number(i.amount), 0);

        return {
          id: s.id,
          employee_id: s.employeeId || `EMP-${s.id}`,
          name: s.name,
          email: s.email || '',
          phone: s.phone || '',
          job_title: s.jobTitle || s.role || 'Staff',
          role: s.role || 'Course Counselor',
          department: s.department || 'General',
          location: s.location || 'Headquarters (HQ)',
          employment_type: s.employmentType || 'Full-Time',
          presence: s.presence || 'Present',
          cohorts: s.cohorts || 'None',
          courses: s.courses || '0 enrolled',
          dob: s.dob || '',
          joining_date: s.joiningDate || '',
          address: s.address || '',
          emergency_contact: s.emergencyContact || '',
          avatar: s.avatar || '',
          monthly_salary: Number(s.monthlySalary),
          incentive_rule: s.incentiveRule || '',
          status: s.status || 'active',
          system_access: s.systemAccess || 'none',
          user_id: s.userId,
          last_modified: (s.lastModified || s.createdAt).toISOString(),
          created_at: s.createdAt.toISOString(),
          username: user?.username || null,
          user_role: user?.role || null,
          sales_count: salesAgg._count.id,
          sales_amount: Number(salesAgg._sum.netAmount || 0),
          students_count: studentsCount,
          incentives_due: incentivesDue,
          incentives_paid: incentivesPaid,
        };
      })
    );

    const departments = Array.from(
      new Set(rawEmployees.map((s) => s.department).filter(Boolean))
    ).sort();

    return NextResponse.json({
      employees,
      totalCount: employees.length,
      departments,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const isSelfEdit = body.id && parseInt(body.id, 10) === auth.staffId;
    if (auth.role !== 'admin' && !isSelfEdit) {
      return NextResponse.json(
        { error: 'Admin access required to create or modify employees' },
        { status: 403 }
      );
    }

    const {
      id,
      employee_id,
      name,
      email,
      phone,
      job_title,
      department,
      location,
      employment_type,
      presence,
      cohorts,
      courses,
      dob,
      joining_date,
      address,
      emergency_contact,
      avatar,
      monthly_salary,
      base_salary,
      salary,
      incentive_rule,
      status,
      system_access,
      username,
      password,
    } = body;

    let targetId = id ? parseInt(id, 10) : null;
    const resolvedEmpId = employee_id?.trim() || null;

    if (!targetId && resolvedEmpId) {
      const match = await prisma.staff.findFirst({ where: { employeeId: resolvedEmpId } });
      if (match) targetId = match.id;
    }

    const existingStaff = targetId
      ? await prisma.staff.findUnique({ where: { id: targetId } })
      : null;

    // RBAC: If an employee is editing their own profile, prevent self-escalation
    if (auth.role !== 'admin') {
      const requestedSal =
        monthly_salary !== undefined
          ? parseFloat(monthly_salary)
          : base_salary !== undefined
          ? parseFloat(base_salary)
          : salary !== undefined
          ? parseFloat(salary)
          : undefined;
      if (requestedSal !== undefined && existingStaff && requestedSal !== Number(existingStaff.monthlySalary)) {
        return NextResponse.json(
          { error: 'Permission denied: Employees cannot modify their own salary' },
          { status: 403 }
        );
      }
      if (system_access !== undefined && existingStaff && system_access !== existingStaff.systemAccess) {
        return NextResponse.json(
          { error: 'Permission denied: Employees cannot elevate their own system access or change roles' },
          { status: 403 }
        );
      }
      if (incentive_rule !== undefined && existingStaff && incentive_rule.trim() !== existingStaff.incentiveRule) {
        return NextResponse.json(
          { error: 'Permission denied: Employees cannot modify their own incentive rules' },
          { status: 403 }
        );
      }
      if (job_title !== undefined && existingStaff && job_title.trim() !== existingStaff.jobTitle) {
        return NextResponse.json(
          { error: 'Permission denied: Employees cannot modify their own job title' },
          { status: 403 }
        );
      }
      if (department !== undefined && existingStaff && department.trim() !== existingStaff.department) {
        return NextResponse.json(
          { error: 'Permission denied: Employees cannot modify their own department' },
          { status: 403 }
        );
      }
    }

    const cleanName = (name || '').replace(/<[^>]*>?/gm, '').trim();
    if (!cleanName) {
      return NextResponse.json({ error: 'Employee name is required' }, { status: 400 });
    }

    const finalEmail = email !== undefined ? email.trim() : existingStaff?.email || '';
    const finalPhone = phone !== undefined ? phone.trim() : existingStaff?.phone || '';
    const finalJobTitle = job_title !== undefined ? job_title.trim() : existingStaff?.jobTitle || 'Staff';
    const finalDepartment = department !== undefined ? department.trim() : existingStaff?.department || 'General';
    const finalLocation = location !== undefined ? location.trim() : existingStaff?.location || 'Headquarters (HQ)';
    const finalEmploymentType = employment_type !== undefined ? employment_type : existingStaff?.employmentType || 'Full-Time';
    const finalPresence = presence !== undefined ? presence : existingStaff?.presence || 'Present';
    const finalCohorts = cohorts !== undefined ? cohorts.trim() : existingStaff?.cohorts || '';
    const finalCourses = courses !== undefined ? courses.trim() : existingStaff?.courses || '';
    const finalDob = dob !== undefined ? dob : existingStaff?.dob || '';
    const finalJoiningDate = joining_date !== undefined ? joining_date : existingStaff?.joiningDate || '';
    const finalAddress = address !== undefined ? address.trim() : existingStaff?.address || '';
    const finalEmergencyContact = emergency_contact !== undefined ? emergency_contact.trim() : existingStaff?.emergencyContact || '';
    const finalAvatar = avatar !== undefined ? avatar.trim() : existingStaff?.avatar || '';

    const rawSal = monthly_salary !== undefined ? monthly_salary : base_salary !== undefined ? base_salary : salary;
    const finalSalary = rawSal !== undefined ? parseFloat(rawSal) || 0 : existingStaff ? Number(existingStaff.monthlySalary) : 0;
    const finalIncentive = incentive_rule !== undefined ? incentive_rule.trim() : existingStaff?.incentiveRule || '';
    const finalStatus = status !== undefined ? status : existingStaff?.status || 'active';
    const finalSystemAccess = system_access !== undefined ? system_access : body.role !== undefined ? body.role : existingStaff?.systemAccess || 'none';

    let staffRecord: any;

    if (targetId) {
      staffRecord = await prisma.staff.update({
        where: { id: targetId },
        data: {
          employeeId: resolvedEmpId || existingStaff?.employeeId || `EMP-${targetId}`,
          name: cleanName,
          email: finalEmail,
          phone: finalPhone,
          jobTitle: finalJobTitle,
          role: finalJobTitle,
          department: finalDepartment,
          location: finalLocation,
          employmentType: finalEmploymentType,
          presence: finalPresence,
          cohorts: finalCohorts,
          courses: finalCourses,
          dob: finalDob,
          joiningDate: finalJoiningDate,
          address: finalAddress,
          emergencyContact: finalEmergencyContact,
          avatar: finalAvatar,
          monthlySalary: finalSalary,
          incentiveRule: finalIncentive,
          status: finalStatus,
          systemAccess: finalSystemAccess,
          lastModified: new Date(),
        },
      });
    } else {
      let nextEmpId = resolvedEmpId;
      if (!nextEmpId) {
        const count = await prisma.staff.count();
        nextEmpId = `EMP-${count + 1001}`;
      }

      staffRecord = await prisma.staff.create({
        data: {
          employeeId: nextEmpId,
          name: cleanName,
          email: finalEmail,
          phone: finalPhone,
          jobTitle: finalJobTitle,
          role: finalJobTitle,
          department: finalDepartment,
          location: finalLocation,
          employmentType: finalEmploymentType,
          presence: finalPresence,
          cohorts: finalCohorts,
          courses: finalCourses,
          dob: finalDob,
          joiningDate: finalJoiningDate,
          address: finalAddress,
          emergencyContact: finalEmergencyContact,
          avatar: finalAvatar,
          monthlySalary: finalSalary,
          incentiveRule: finalIncentive,
          status: finalStatus,
          systemAccess: finalSystemAccess,
          lastModified: new Date(),
        },
      });
    }

    const staffId = staffRecord.id;
    const linkedUserId = staffRecord.userId;

    if (finalSystemAccess === 'admin' || finalSystemAccess === 'employee') {
      const existingLinkedUser = linkedUserId
        ? await prisma.user.findUnique({ where: { id: linkedUserId } })
        : null;

      const loginUsername =
        username?.trim() ||
        existingLinkedUser?.username ||
        finalEmail?.trim() ||
        staffRecord.employeeId ||
        `user_${staffId}`;

      if (linkedUserId) {
        const conflict = await prisma.user.findFirst({
          where: { username: loginUsername, id: { not: linkedUserId } },
        });
        if (conflict) {
          return NextResponse.json(
            { error: `Username '${loginUsername}' is already taken by another user` },
            { status: 400 }
          );
        }

        const updateData: any = {
          username: loginUsername,
          role: finalSystemAccess,
          email: finalEmail,
        };
        if (password?.trim()) {
          updateData.passwordHash = bcrypt.hashSync(password.trim(), 10);
        }
        await prisma.user.update({
          where: { id: linkedUserId },
          data: updateData,
        });
      } else {
        const existingUser = await prisma.user.findUnique({
          where: { username: loginUsername },
        });
        if (existingUser && username?.trim()) {
          return NextResponse.json(
            { error: `Username '${loginUsername}' is already taken by another user` },
            { status: 400 }
          );
        }

        let finalUsername = loginUsername;
        if (existingUser) {
          finalUsername = `${loginUsername}_${staffId}`;
        }

        const hash = password?.trim()
          ? bcrypt.hashSync(password.trim(), 10)
          : bcrypt.hashSync('tempPass2026!', 10);

        const newUser = await prisma.user.create({
          data: {
            username: finalUsername,
            passwordHash: hash,
            email: finalEmail,
            role: finalSystemAccess,
            staffId: staffId,
          },
        });

        await prisma.staff.update({
          where: { id: staffId },
          data: { userId: newUser.id },
        });
      }
    } else if (finalSystemAccess === 'none' && linkedUserId) {
      await prisma.user.update({
        where: { id: linkedUserId },
        data: { role: 'none' },
      });
      await prisma.staff.update({
        where: { id: staffId },
        data: { systemAccess: 'none' },
      });
    }

    const saved = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    const user = saved?.userId
      ? await prisma.user.findUnique({
          where: { id: saved.userId },
          select: { username: true, role: true },
        })
      : null;

    return NextResponse.json({
      success: true,
      message: targetId ? 'Employee updated successfully' : 'Employee created successfully',
      employee: {
        ...saved,
        employee_id: saved?.employeeId || `EMP-${saved?.id}`,
        job_title: saved?.jobTitle || saved?.role || 'Staff',
        employment_type: saved?.employmentType || 'Full-Time',
        joining_date: saved?.joiningDate || '',
        emergency_contact: saved?.emergencyContact || '',
        incentive_rule: saved?.incentiveRule || '',
        system_access: saved?.systemAccess || 'none',
        user_id: saved?.userId,
        monthly_salary: Number(saved?.monthlySalary || 0),
        username: user?.username || null,
        user_role: user?.role || null,
      },
    });
  } catch (err: any) {
    const status = err.message && err.message.includes('already taken') ? 400 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

