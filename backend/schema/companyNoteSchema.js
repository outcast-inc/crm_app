import mongoose from "mongoose"

export const companyNoteSchema = new mongoose.Schema(
    {
        note: {
            type: String,
            trim: true,
            required: true
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
        companyId: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'Company'
        },
    }
);

export const CompanyNote = mongoose.model('CompanyNote', companyNoteSchema);

