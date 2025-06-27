import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const actions = await prisma.action.findMany({
            where: {
                status_slug: 'outstanding',
            },
            orderBy: {
                id: 'desc',
            },
            include: {
                business: {
                    select: {
                        business_name: true,
                    },
                },
                assigned_user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        profile_picture_filename: true,
                    },
                },
                status: {
                    select: {
                        name: true,
                    },
                },
                action_process: {
                    select: { description: true },
                },
            },
        });

        console.log('Fetched actions:', actions);
        return NextResponse.json(
            actions.map(action => ({
                ...action,
                id: action.id.toString(),
                business_id: action.business_id?.toString(),
                assigned_user_id: action.assigned_user_id?.toString(),
                status_slug: undefined,
                status_name: action.status?.name ?? 'Unknown',
                process_description: action.action_process?.description ?? '-',
            }))
        );
    } catch (error) {
        console.error('❌ Error in /api/actions:', error);
        return new NextResponse('Server error', { status: 500 });
    }
}