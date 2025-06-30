import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const perPage = parseInt(url.searchParams.get('perPage') || '10');
  const sortField = url.searchParams.get('sortField') || 'id';
  const sortDirection = url.searchParams.get('sortDirection') === 'asc' ? 'asc' : 'desc';
  const search = url.searchParams.get('search')?.toLowerCase() ?? '';
  const status = url.searchParams.get('status');
  const assigned = url.searchParams.get('assigned')?.toLowerCase();

  const sortMap: Record<string, any> = {
    id: { id: sortDirection },
    business_name: { business: { business_name: sortDirection } },
    process_description: { action_process: { description: sortDirection } },
    description: { description: sortDirection },
    due_at: { due_at: sortDirection },
    completed_at: { completed_at: sortDirection },
    status_slug: { status: { name: sortDirection } },
    assigned_user_id: { assigned_user: { first_name: sortDirection } },
  };

  const orderBy = sortMap[sortField] ?? { id: sortDirection };

  // Combined OR conditions
  const orConditions: any[] = [];

if (search) {
  const searchLC = search.toLowerCase();

  if (/^\d+$/.test(searchLC)) {
    orConditions.push({ id: Number(searchLC) });
  }

  orConditions.push(
    {
      business: {
        business_name: {
          contains: searchLC,
        },
      },
    },
    {
      description: {
        contains: searchLC,
      },
    },
    {
      action_process: {
        description: {
          contains: searchLC,
        },
      },
    },
    {
      assigned_user: {
        is: {
          first_name: {
            contains: searchLC,
          },
        },
      },
    },
    {
      assigned_user: {
        is: {
          last_name: {
            contains: searchLC,
          },
        },
      },
    }
  );
}

if (assigned) {
  const assignedLC = assigned.toLowerCase();

  orConditions.push(
    {
      assigned_user: {
        is: {
          first_name: {
            contains: assignedLC,
          },
        },
      },
    },
    {
      assigned_user: {
        is: {
          last_name: {
            contains: assignedLC,
          },
        },
      },
    }
  );
}

const where = {
  ...(status && { status_slug: status }),
  ...(orConditions.length > 0 && { OR: orConditions }),
};

  try {
    const [actions, totalCount, totalCompleted] = await Promise.all([
      prisma.action.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          business: { select: { business_name: true } },
          assigned_user: {
            select: {
              first_name: true,
              last_name: true,
              profile_picture_filename: true,
            },
          },
          status: { select: { name: true } },
          action_process: { select: { description: true } },
        },
      }),
      prisma.action.count({ where }),
      prisma.action.count({ where: { status_slug: 'completed' } }),
    ]);

    const totalPages = Math.ceil(totalCount / perPage);

    return NextResponse.json({
      actions: actions.map((action) => ({
        ...action,
        id: action.id.toString(),
        business_id: action.business_id?.toString(),
        assigned_user_id: action.assigned_user_id?.toString(),
        status_name: action.status?.name ?? 'Unknown',
        process_description: action.action_process?.description ?? '-',
      })),
      totalCompleted,
      totalPages,
    });
  } catch (error) {
    console.error('❌ Error in /api/actions:', error);
    return new NextResponse('Server error', { status: 500 });
  }
}