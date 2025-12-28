import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();

    // Check if user is logged in
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Double check admin status from DB to be safe
    await dbConnect();
    const currentUser = await User.findOne({ username: session.user.name });

    if (!currentUser?.isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { password } = await req.json();

    if (password !== "admin23") {
        return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    // Clear sem5Actual and actualCGPA for ALL users (Sem 4 data is preserved/locked)
    await User.updateMany({}, { sem5Actual: null, actualCGPA: null });

    return NextResponse.json({ success: true, message: "Semester 5 CGPA records cleared" });
}
