import mongoose from "mongoose"

export const quoteItemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true
        },
        unitPrice: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        quoteId: {
            type: mongoose.Schema.ObjectId,
            required: true
        }
    }
);

export const quoteItems = mongoose.model('QuoteItem', quoteItemSchema);

