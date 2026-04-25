import { Schema, model } from "mongoose";
import { hash } from "argon2";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    surname: {
      type: String,
      required: [function() { return this.authProvider === 'local'; }, "Surname is required"],
    },
    phone: {
      type: String,
      required: [function() { return this.authProvider === 'local'; }, "Phone is required"],
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [function() { return this.authProvider === 'local'; }, "Password is required"],
    },
    image: {
      type: String,
      default: function() {
        const name = this.name ? encodeURIComponent(this.name) : 'User';
        return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=150`;
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: Boolean,
      default: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.pre("save", async function(next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  try {
    this.password = await hash(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.toJSON = function () {
  const { __v, password, _id, ...user } = this.toObject();
  user.uid = _id;
  return user;
};

export default model("User", userSchema);
