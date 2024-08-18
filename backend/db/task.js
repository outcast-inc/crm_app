import mongoose from "mongoose";
import { Task } from "../schema/taskSchema.js"
import { filterCheck, pagingFormat, sortFormat } from "../utils.js";
import { createOneAudit } from "./audit.js";
import { findTaskComments } from "./taskComment.js";



// Queries

export async function countTasks() {
    return await Task.countDocuments();
}

export async function filterCount(filter) {
    return await Task.aggregate([{ $match: filter }]).count("title")
}

export async function findTasks(paging, filter, sorting) {
    const optimizedFilter = filterCheck(filter)
    const optimizedPaging = pagingFormat(paging)
    const optimizedSort = sortFormat(sorting)

    let taskCount = 0;

    let aggregateAttribs = []

    aggregateAttribs.push({
        $lookup: {
            from: "users",
            let: { user_ids: "$userIds" },
            pipeline: [
                {
                    $match: { $expr: { $in: ["$_id", "$$user_ids"] } }
                }
            ],
            as: "users",
        }
    });

    aggregateAttribs.push({
        $lookup: {
            from: "TaskComment",
            localField: "_id",
            foreignField: "taskId",
            as: "comments.nodes"
        }
    })

    aggregateAttribs.push({
        $addFields: {
            "comments.totalCount" : {
                $size: "$comments.nodes"
            }
        }
    })

    if(optimizedFilter){
        aggregateAttribs.push({$match: optimizedFilter})
        taskCount = await filterCount(optimizedFilter)
        taskCount = taskCount.length > 0 ? taskCount[0].title : 0
    } else {
        taskCount = await countTasks()
    }
    if(optimizedSort) {
        aggregateAttribs.push({$sort: optimizedSort})
    }
    if(optimizedPaging) {
        aggregateAttribs = aggregateAttribs.concat(optimizedPaging)
    }

    let pageInfo = {
        hasNextPage: (paging.limit + paging?.offset) < taskCount, 
        hasPreviousPage: paging.offset ? paging.offset > 0 : false
    }
    
    const nodes = await Task.aggregate(aggregateAttribs);

    return {nodes, totalCount: taskCount, pageInfo};
}

export async function findTask(id) {
    // return await Task.findById(id);
    const task = await Task.aggregate([
        { $match: { _id: { $eq: new mongoose.Types.ObjectId(id) }} },
        {
            $lookup: {
                from: "taskstages",
                localField: "stageId",
                foreignField: "_id",
                as: "stage"
            }
        },
        {
            $lookup: {
                from: "users",
                let: { user_ids: "$userIds" },
                pipeline: [
                    {
                        $match: { $expr: { $in: ["$_id", "$$user_ids"] } }
                    }
                ],
                as: "users",
            }
        },
        { $set: { stage: {$first: "$stage"} } }
    ]);
    if(task) {
        return task[0]
    }
    return null
}

// Mutations

// CREATE
export async function createOneTask(
    task,
    createdById
) {
    const newTask = await Task.create({
        ...task,
        completed: false,
        createdById,
        createdAt: new Date(),
        updatedAt: new Date(), 
    });

    let auditChanges = [{ field: "completed", to: "false" }]
    Object.entries(task).forEach((value) => {
        let v = value[1]
        if(value[0] === "userIds") {
            v = value[1].join(",")
        }
        auditChanges.push({
            field: value[0],
            to: v
        })
    })

    await createOneAudit(
        {
            targetEntity: "Task",
            targetId: newTask._id,
            changes: auditChanges,
            userId: createdById,
            action: "CREATE"
        }
    )

    return newTask;
}

export async function createManyTasks(
    tasks,
    createdById
) {
    const newTasks = tasks.map(async(task) => await createOneTask(
        task,
        createdById,
    ))
    return newTasks;
}

// UPDATE
export async function updateOneTask(id, update, updatedById){
    Object.keys(update).forEach((k) => update[k] == '' && delete update[k]);
    const oldValues = await Task.findById(id);
    const task = await Task.findByIdAndUpdate(id, {...update, updatedById, updatedAt: new Date()});
    
    let auditChanges = []
    Object.entries(update).forEach((value) => {
        let v = value[1]
        if(value[0] === "userIds") {
            v = value[1].join(",")
        } 
        if(value[0] === "checklist") {
            value[1].map((checkitem, i) => (
                Object.entries(checkitem).forEach((listItem) => {
                    auditChanges.push({
                        field: `${value[0]}.${listItem[0]}`,
                        from: oldValues.checklist.length > 0 ? oldValues.checklist[i][listItem[0]] : "",
                        to: listItem[1]
                    })
                })
            ))
        } else {
            auditChanges.push({
                field: value[0],
                from: oldValues[value[1]],
                to: v
            })
        }
    })

    await createOneAudit(
        {
            targetEntity: "Task",
            targetId: id,
            changes: auditChanges,
            userId: updatedById,
            action: "UPDATE"
        }
    )
    
    return await findTask(id);
}

export async function updateManyTasks(filter, update, updatedById) {
    const updatedFilter = filterCheck(filter)
    const tasks = await Task.aggregate([{
        $match: updatedFilter
    }]);

    const updatedTasks = tasks.map(async (task) => await updateOneTask(task._id, update, updatedById))

    return updatedTasks;
}

// DELETE
export async function deleteOneTask(id) {
    return await Task.findByIdAndDelete(id);
}

export async function deleteManyTasks(filter) {
    const updatedFilter = filterCheck(filter);
    const tasks = await Task.aggregate([{
        $match: updatedFilter
    }]);

    tasks.map(async (task) => await deleteOneTask(task._id));

    return tasks;
}
