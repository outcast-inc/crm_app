import mongoose from "mongoose"

export const auditChangeSchema = new mongoose.Schema({
    field: {
        type: String,
        trim: true,
        required: true
    },
    from: {
        type: String,
        trim: true,
    },
    to: {
        type: String,
        trim: true,
    }
})

export const auditSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            trim: true,
            required: true
        },
        targetEntity: {
            type: String,
            trim: true,
            required: true
        },
        targetId: {
            type: mongoose.Schema.ObjectId,
            trim: true,
            required: true
        },
        changes: [auditChangeSchema],
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
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
    }
);

export const Audit = mongoose.model('Audit', auditSchema);

