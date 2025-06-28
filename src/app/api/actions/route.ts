// import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
//
// const prisma = new PrismaClient();
//
// export async function GET() {
//     try {
//         // 1. Fetch only OUTSTANDING actions (for table display)
//         const actions = await prisma.action.findMany({
//             where: {
//                 status_slug: 'outstanding',
//             },
//             orderBy: {
//                 id: 'desc',
//             },
//             include: {
//                 business: { select: { business_name: true } },
//                 assigned_user: {
//                     select: {
//                         first_name: true,
//                         last_name: true,
//                         profile_picture_filename: true,
//                     },
//                 },
//                 status: { select: { name: true } },
//                 action_process: { select: { description: true } },
//             },
//         });
//
//         // 2. Count how many COMPLETED actions exist
//         const totalCompleted = await prisma.action.count({
//             where: {
//                 status_slug: 'completed',
//             },
//         });
//
//         // 3. Return data with totalCompleted as metadata
//         return NextResponse.json({
//             actions: actions.map(action => ({
//                 ...action,
//                 id: action.id.toString(),
//                 business_id: action.business_id?.toString(),
//                 assigned_user_id: action.assigned_user_id?.toString(),
//                 status_name: action.status?.name ?? 'Unknown',
//                 process_description: action.action_process?.description ?? '-',
//             })),
//             totalCompleted,
//         });
//     } catch (error) {
//         console.error('❌ Error in /api/actions:', error);
//         return new NextResponse('Server error', { status: 500 });
//     }
// }
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sortField = url.searchParams.get('sortField') || 'id';
  const sortDirection = url.searchParams.get('sortDirection') === 'asc' ? 'asc' : 'desc';
  const search = url.searchParams.get('search')?.toLowerCase() ?? '';

  const sortMap: Record<string, any> = {
    id: { id: sortDirection },
    business_name: { business: { business_name: sortDirection } },
    process: { process: sortDirection },
    description: { description: sortDirection },
    due_at: { due_at: sortDirection },
    completed_at: { completed_at: sortDirection },
    status_slug: { status: { name: sortDirection } },
    assigned_user_id: { assigned_user: { first_name: sortDirection } },
  };

  const orderBy = sortMap[sortField] ?? { id: sortDirection };

  try {
    const actions = await prisma.action.findMany({
      where: {
        status_slug: 'outstanding',
        ...(search && {
          OR: [
            {
              id: {
                equals: /^\d+$/.test(search) ? Number(search) : undefined,
              },
            },
            {
              business: {
                business_name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            {
              description: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              action_process: {
                description: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            {
              assigned_user: {
                OR: [
                  {
                    first_name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    last_name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          ],
        }),
      },
      orderBy,
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
    });

    const totalCompleted = await prisma.action.count({
      where: {
        status_slug: 'completed',
      },
    });

    return NextResponse.json({
      actions: actions.map(action => ({
        ...action,
        id: action.id.toString(),
        business_id: action.business_id?.toString(),
        assigned_user_id: action.assigned_user_id?.toString(),
        status_name: action.status?.name ?? 'Unknown',
        process_description: action.action_process?.description ?? '-',
      })),
      totalCompleted,
    });
  } catch (error) {
    console.error('❌ Error in /api/actions:', error);
    return new NextResponse('Server error', { status: 500 });
  }
}

