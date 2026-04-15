import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name:{
        type: String,
        required: [true, "Name is required"]
    },
    surname:{
        type: String,
        required: [true, "Surname is required"]
    },
    phone:{
        type: String,
        required: [true, "Phone is required"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    status:{
        type: Boolean,
        default: true
    },
    
},
    {
    timestamps: true,
    versionKey: false
    }
);

userSchema.methods.toJSON = function () {
    const { __v, password, _id, ...user } = this.toObject();
    user.uid = _id;
    return user;
}

export default model("User", userSchema);