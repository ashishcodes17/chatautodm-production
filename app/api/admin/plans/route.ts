import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDatabase } from "@/lib/mongodb"

const ADMIN_EMAILS = [
  "ashishgampala@gmail.com",
  "ashishgamer473@gmail.com",
]

// GET - Fetch all users with their plans
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const userSession = cookieStore.get("user_session")

    if (!userSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userSession.value)

    if (!ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const db = await getDatabase()

    // Get all instagram accounts with their plans
    const accounts = await db
      .collection("instagram_accounts")
      .find({}, {
        projection: {
          _id: 1,
          username: 1,
          workspaceId: 1,
          userId: 1,
          plan: 1,
          followersCount: 1,
          dmUsed: 1,
          monthlyDmUsed: 1,
          createdAt: 1,
          upgradedAt: 1,
        }
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Enrich with workspace name
    const enrichedAccounts = await Promise.all(
      accounts.map(async (account) => {
        const workspace = await db.collection("workspaces").findOne(
          { _id: account.workspaceId },
          { projection: { name: 1, plan: 1 } }
        )
        
        return {
          ...account,
          workspaceName: workspace?.name || account.username,
          workspacePlan: workspace?.plan || null,
          currentPlan: account.plan || 'freeby',
        }
      })
    )

    return NextResponse.json({ accounts: enrichedAccounts })
  } catch (error) {
    console.error("Failed to fetch plans:", error)
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 })
  }
}

// POST - Update user plan
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const userSession = cookieStore.get("user_session")

    if (!userSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(userSession.value)

    if (!ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { accountId, newPlan } = await request.json()

    if (!accountId || !newPlan) {
      return NextResponse.json({ error: "Missing accountId or newPlan" }, { status: 400 })
    }

    if (!['freeby', 'pro', 'elite'].includes(newPlan)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get the account
    const account = await db.collection("instagram_accounts").findOne({ _id: accountId })

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Update instagram account plan
    await db.collection("instagram_accounts").updateOne(
      { _id: accountId },
      {
        $set: {
          plan: newPlan,
          upgradedAt: new Date(),
        }
      }
    )

    // Update workspace plan (if exists)
    if (account.workspaceId) {
      await db.collection("workspaces").updateOne(
        { _id: account.workspaceId },
        {
          $set: {
            plan: newPlan,
            upgradedAt: new Date(),
          }
        }
      )
    }

    console.log(`✅ Admin upgraded @${account.username} to ${newPlan} plan`)

    return NextResponse.json({
      success: true,
      message: `Successfully updated @${account.username} to ${newPlan} plan`,
      account: {
        username: account.username,
        oldPlan: account.plan || 'freeby',
        newPlan,
      }
    })
  } catch (error) {
    console.error("Failed to update plan:", error)
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 })
  }
}
