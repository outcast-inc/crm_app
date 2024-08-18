import mongoose from "mongoose"

export const eventCategorySchema = new mongoose.Schema(
    {
        title: {
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
        }
    }
);

export const EventCategory = mongoose.model('EventCategory', eventCategorySchema);

