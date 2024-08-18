import mongoose from "mongoose"

export const taskCommentSchema = new mongoose.Schema(
    {
        comment: {
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
        taskId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Task'
        }
    }
);

export const TaskComment = mongoose.model('TaskComment', taskCommentSchema);

