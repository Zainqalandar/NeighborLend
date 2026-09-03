import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      required: true,
      type: String,
      minLength: 3,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    password: {
      required: true,
      type: String,
      minlength: 6,
      select: false
    },
    phone: String,
    address: String,
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
