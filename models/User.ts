import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
    username: string;
    guessedCGPA: number;
    actualCGPA: number | null;
    isAdmin: boolean;
    sem5Guessed: number;
    sem5Actual: number | null;
    sem4Guessed: number;
    sem4Actual: number | null;
}

const UserSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        guessedCGPA: { type: Number, required: true },
        actualCGPA: { type: Number, default: null },
        isAdmin: { type: Boolean, default: false },
        sem5Guessed: { type: Number, default: 0 },
        sem5Actual: { type: Number, default: null },
        sem4Guessed: { type: Number, default: 0 },
        sem4Actual: { type: Number, default: null },
    },
    { timestamps: true }
);

// Prevent overwrite on HMR
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
