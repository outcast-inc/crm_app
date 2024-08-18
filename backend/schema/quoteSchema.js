import mongoose from "mongoose"

export const quoteItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    unitPrice: {
        type: Number,
        required: true,
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
        type: Number
    }
})

export const quoteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true
        },
        items: [quoteItemSchema],
        status: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        subTotal: {
            type: Number,
            required: true
        },
        tax: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
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
        salesOwnerId: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'User'
        },
        contactId: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'Contact'
        },
        companyId: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: 'Company'
        },
    }
);

export const Quote = mongoose.model('Quote', quoteSchema);

