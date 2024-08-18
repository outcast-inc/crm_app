import mongoose from "mongoose"

export const dealSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true
        },
        value: {
            type: Number,
        },
        notes: {
            type: String,
            trim: true,
        },
        closeDateYear: {
            type: Number,
        },
        closeDateMonth: {
            type: Number,
        },
        closeDateDay: {
            type: Number,
        },
        stageId: {
            type: mongoose.Schema.ObjectId,
            ref: "DealStage"
        },
        dealOwnerId: {
            type:  mongoose.Schema.ObjectId,
            required: true,
            ref: "User"
        },
        dealContactId: {
            type:  mongoose.Schema.ObjectId,
            required: true,
            ref: "Contact"
        },
        companyId: {
            type:  mongoose.Schema.ObjectId,
            required: true,
            ref: "Company"
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
        }
    }
);

export const Deal = mongoose.model('Deal', dealSchema);

