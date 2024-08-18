import mongoose from "mongoose"

export const contactSchema = new mongoose.Schema(
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
        avatarUrl: {
            type: String,
            trim: true,
        },
        stage: {
            type: String,
            trim: true,
            required: true,
        },
        status: {
            type: String,
            trim: true,
            required: true,
        },
        score: {
            type: Number,
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
        },
        updatedById: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        salesOwnerId: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'User'
        },
        companyId: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'Company'
        }
    }
);

export const Contact = mongoose.model('Contact', contactSchema);

