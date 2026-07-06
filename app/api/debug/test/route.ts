import { db } from '@/lib/db'
import { user as userTable } from '@/lib/db/schema'

export async function GET() {
  try {
    const users = await db.select().from(userTable).limit(1)
    return Response.json({
      status: 'success',
      message: 'Database connection working',
      userCount: users.length,
    })
  } catch (error: any) {
    return Response.json(
      {
        status: 'error',
        message: error.message,
        error: error.toString(),
      },
      { status: 500 }
    )
  }
}
