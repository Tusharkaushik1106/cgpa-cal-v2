import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.name) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { actualCGPA, semester } = await req.json();

    if (actualCGPA === undefined || actualCGPA === null) {
        return NextResponse.json({ error: "Missing actualCGPA" }, { status: 400 });
    }

    await dbConnect();

    const updateField = semester === 4 ? { sem4Actual: parseFloat(actualCGPA) } : { sem5Actual: parseFloat(actualCGPA) };

    const user = await User.findOneAndUpdate(
        { username: session.user.name },
        updateField,
        { new: true }
    );

    return NextResponse.json({ success: true, user });
}
