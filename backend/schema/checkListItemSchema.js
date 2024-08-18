import mongoose from "mongoose"

export const checkListItemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true
        },
        checked: {
            type: Boolean,
            required: true
        },
        taskId: {
            type: mongoose.Schema.ObjectId,
            required: true
        }
    }
);

export const checkListItems = mongoose.model('CheckListItem', checkListItemSchema);

