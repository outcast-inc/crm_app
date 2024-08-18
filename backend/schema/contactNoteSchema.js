import mongoose from "mongoose"

export const contactNoteSchema = new mongoose.Schema(
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
        contactId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Contact'
        }
    }
);

export const ContactNote = mongoose.model('ContactNote', contactNoteSchema);

