import mongoose from "mongoose"

export const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true
        },
        avatarUrl: {
            type: String,
            trim: true,
        },
        totalRevenue: {
            type: Number,
            default: 0
        },
        companySize: {
            type: String,
            trim: true,
        },
        industry: {
            type: String,
            trim: true,
        },
        businessType: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
        },
        website: {
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
    }
);

export const Company = mongoose.model('Company', companySchema);

