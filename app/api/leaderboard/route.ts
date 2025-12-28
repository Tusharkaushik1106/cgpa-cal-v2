import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    await dbConnect();

    // Fetch all users to display them regardless of status, client side will filter/sort
    const users = await User.find({})
        .select("username guessedCGPA actualCGPA sem5Guessed sem5Actual sem4Guessed sem4Actual isAdmin");

    return NextResponse.json(users);
}
