import mongoose from "mongoose"

export const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true
        },
        description: {
            type: String,
            trim: true,
            required: true
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        color: {
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
        categoryId: {
            type: mongoose.Schema.ObjectId,
            ref: 'EventCategory'
        },
        participantIds: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }]
    }
);

export const Event = mongoose.model('Event', eventSchema);

