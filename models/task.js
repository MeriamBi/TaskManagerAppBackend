import mongoose from "mongoose";
const { Schema, model } = mongoose;
import mongoosePaginate from 'mongoose-paginate-v2';


const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
        },
        dueDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['To Do', 'In Progress', 'Done'],
            default: 'To Do',
        },
        priority: {
            type: String,
            enum: ['High', 'Medium', 'Low'],
            default: 'Medium',
        },
        category: {
            type: String,
            enum: ['Work', 'Personal', 'Errands'],
            default: 'Work',
        },
        completionFlag: {
            type: Boolean,
            default: false,
        },
        image: {
            type: String,
        },
    },
    {
        timestamps: true
    }
)

taskSchema.plugin(mongoosePaginate);
export default model('Task', taskSchema);