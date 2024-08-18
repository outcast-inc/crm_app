import mongoose from "mongoose"

export const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            trim: true,
            required: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        jobTitle: {
            type: String,
            trim: true,
        },
        timezone: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            trim: true,
            required: true,
        },
        avatarUrl: {
            type: String,
            trim: true,
        },
        createdAt: {
            type: Date,
            required: true,
            default: new Date(),
        },
        updatedAt: {
            type: Date,
            required: true,
            default: new Date(),
        },
        createdById: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'User'
        }
    }
);

export const User = mongoose.model('User', userSchema);

