import mongoose from "mongoose"


export const checkListSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        checked: {
            type: Boolean,
            required: true
        }
    }
)

export const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true
        },
        description: {
            type: String,
            trim: true,
        },
        dueDate: {
            type: Date,
        },
        completed: {
            type: Boolean,
            required: true
        },
        stageId: {
            type: mongoose.Schema.ObjectId,
            ref: 'TaskStage'
        },
        userIds: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }],
        checklist: [checkListSchema],
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
    }
);

export const Task = mongoose.model('Task', taskSchema);

