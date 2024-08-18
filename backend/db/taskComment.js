import { TaskComment } from "../schema/taskCommentSchema.js";
import { filterCheck, pagingFormat, sortFormat } from "../utils.js";
import { createOneAudit } from "./audit.js";


// Queries

export async function countTaskComments() {
    return await TaskComment.countDocuments();
}

export async function filterCount(filter) {
    return await TaskComment.aggregate([{ $match: filter }]).count("comment")
}

export async function findTaskComments(paging, filter, sorting) {
    const optimizedFilter = filterCheck(filter)
    const optimizedPaging = pagingFormat(paging)
    const optimizedSort = sortFormat(sorting)

    let taskCommentCount = 0 

    let aggregateAttribs = []

    aggregateAttribs.push({
        $lookup: {
            from: "tasks",
            localField: "taskId",
            foreignField: "_id",
            as: "task"
        }
    });

    aggregateAttribs.push({
        $set: {
            task: { $first: "$task" }
        }
    });

    aggregateAttribs.push({
        $lookup: {
            from: "users",
            localField: "createdById",
            foreignField: "_id",
            as: "createdBy"
        }
    });

    aggregateAttribs.push({
        $set: {
            createdBy: { $first: "$createdBy" }
        }
    })

    if(optimizedFilter){
        aggregateAttribs.push({$match: optimizedFilter})
        taskCommentCount = await filterCount(optimizedFilter)
        taskCommentCount = taskCommentCount.length > 0 ? taskCommentCount[0].comment : 0;
    } else {
        taskCommentCount = await countTaskComments()
    }
    if(Object.keys(optimizedSort).length > 0) {
        aggregateAttribs.push({$sort: optimizedSort})
    }
    if(optimizedPaging) {
        aggregateAttribs = aggregateAttribs.concat(optimizedPaging)
    }

    let pageInfo = {
        hasNextPage: (paging.limit + paging?.offset) < taskCommentCount, 
        hasPreviousPage: paging.offset ? paging.offset > 0 : false
    }
    
    const nodes = await TaskComment.aggregate(aggregateAttribs);
    const totalCount = nodes.length;

    return {nodes, totalCount, pageInfo};
}

export async function findTaskComment(id) {
    return await TaskComment.findById(id);
}

// Mutations

// CREATE
export async function createOneTaskComment(
    taskComment,
    createdById
) {
    const newTaskComment = await TaskComment.create({
        ...taskComment,
        createdById,
        createdAt: new Date(),
        updatedAt: new Date(), 
    });

    let auditChanges = []
    Object.entries(taskComment).forEach((value) => auditChanges.push({
        field: value[0],
        to: value[1]
    }))

    await createOneAudit(
        {
            targetEntity: "TaskComment",
            targetId: newTaskComment._id,
            changes: auditChanges,
            userId: createdById,
            action: "CREATE"
        }
    )

    return newTaskComment;
}

export async function createManyTaskComments(
    taskComments,
    createdById
) {
    const newTaskComments = taskComments.map(async(taskComment) => await createOneTaskComment(
        taskComment,
        createdById,
    ))
    return newTaskComments;
}

// UPDATE
export async function updateOneTaskComment(id, update, updatedById){
    Object.keys(update).forEach((k) => update[k] == '' && delete update[k]);
    const oldValues = await TaskComment.findById(id);
    const taskComment = TaskComment.findByIdAndUpdate(id, {...update, updatedById, updatedAt: new Date()});
    
    let auditChanges = []
    Object.entries(update).forEach((value) => auditChanges.push({
        field: value[0],
        from: oldValues[value[1]],
        to: value[1]
    }))

    await createOneAudit(
        {
            targetEntity: "TaskComment",
            targetId: id,
            changes: auditChanges,
            userId: updatedById,
            action: "UPDATE"
        }
    )
    
    return await taskComment;
}

export async function updateManyTaskComments(filter, update, updatedById) {
    const updatedFilter = filterCheck(filter)
    const taskComments = await TaskComment.aggregate([{
        $match: updatedFilter
    }]);

    const updatedTaskComments = taskComments.map(async (taskComment) => await updateOneTaskComment(taskComment._id, update, updatedById))

    return updatedTaskComments;
}

// DELETE
export async function deleteOneTaskComment(id) {
    return await TaskComment.findByIdAndDelete(id);
}

export async function deleteManyTaskComments(filter) {
    const updatedFilter = filterCheck(filter);
    const taskComments = await TaskComment.aggregate([{
        $match: updatedFilter
    }]);

    taskComments.map(async (taskComment) => await deleteOneTaskComment(taskComment._id));

    return taskComments;
}
