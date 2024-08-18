import { TaskStage } from "../schema/taskStageSchema.js";
import { filterCheck, pagingFormat, sortFormat } from "../utils.js";
import { createOneAudit } from "./audit.js";

// Queries

export async function countTaskStages() {
    return await TaskStage.countDocuments();
}

export async function filterCount(filter) {
    return await TaskStage.aggregate([{ $match: filter }]).count("title")
}

export async function findTaskStages(paging, filter, sorting) {
    const optimizedFilter = filterCheck(filter)
    const optimizedPaging = pagingFormat(paging)
    const optimizedSort = sortFormat(sorting)

    let taskStageCount = 0

    let aggregateAttribs = []

    aggregateAttribs.push({
        $lookup: {
            from: "tasks",
            localField: "_id",
            foreignField: "stageId",
            as: "tasksAggregate"
        }
    });

    aggregateAttribs.push({
        $addFields: {
            "tasksAggregate.count.id": {
                $size: "$tasksAggregate._id"
            }
        }
    })
    
    if(optimizedFilter){
        aggregateAttribs.push({$match: optimizedFilter})
        taskStageCount = await filterCount(optimizedFilter)
        taskStageCount = taskStageCount.length > 0 ? taskStageCount[0].title : 0
    } else {
        taskStageCount = await countTaskStages()
    }
    if(Object.keys(optimizedSort).length > 0) {
        aggregateAttribs.push({$sort: optimizedSort})
    }
    if(optimizedPaging) {
        aggregateAttribs = aggregateAttribs.concat(optimizedPaging)
    }

    let pageInfo = {
        hasNextPage: (paging.limit + paging?.offset) < taskStageCount, 
        hasPreviousPage: paging.offset ? paging.offset > 0 : false
    }
    
    const nodes = await TaskStage.aggregate(aggregateAttribs);
    const totalCount = nodes.length;

    return {nodes, totalCount, pageInfo};
}

export async function findTaskStage(id) {
    return await TaskStage.findById(id);
}


// Mutations

// CREATE
export async function createOneTaskStage(
    taskStage,
    createdById
) {
    const newTaskStage = await TaskStage.create({
        ...taskStage,
        createdById,
        createdAt: new Date(),
        updatedAt: new Date(), 
    });

    let auditChanges = []
    Object.entries(taskStage).forEach((value) => auditChanges.push({
        field: value[0],
        to: value[1]
    }))

    await createOneAudit(
        {
            targetEntity: "TaskStage",
            targetId: newTaskStage._id,
            changes: auditChanges,
            userId: createdById,
            action: "CREATE"
        }
    )

    return newTaskStage;
}

export async function createManyTaskStages(
    taskStages,
    createdById
) {
    const newTaskStages = taskStages.map(async(taskStage) => await createOneTaskStage(
        taskStage,
        createdById,
    ))
    return newTaskStages;
}

// UPDATE
export async function updateOneTaskStage(id, update, updatedById){
    Object.keys(update).forEach((k) => update[k] == '' && delete update[k]);
    const oldValues = await TaskStage.findById(id);
    const taskStage = TaskStage.findByIdAndUpdate(id, {...update, updatedById, updatedAt: new Date()});
    
    let auditChanges = []
    Object.entries(update).forEach((value) => auditChanges.push({
        field: value[0],
        from: oldValues[value[1]],
        to: value[1]
    }))

    await createOneAudit(
        {
            targetEntity: "TaskStage",
            targetId: id,
            changes: auditChanges,
            userId: updatedById,
            action: "UPDATE"
        }
    )
    
    return await taskStage;
}

export async function updateManyTaskStages(filter, update, updatedById) {
    const updatedFilter = filterCheck(filter)
    const taskStages = await TaskStage.aggregate([{
        $match: updatedFilter
    }]);

    const updatedTaskStages = taskStages.map(async (taskStage) => await updateOneTaskStage(taskStage._id, update, updatedById))

    return updatedTaskStages;
}

// DELETE
export async function deleteOneTaskStage(id) {
    return await TaskStage.findByIdAndDelete(id);
}

export async function deleteManyTaskStages(filter) {
    const updatedFilter = filterCheck(filter);
    const taskStages = await TaskStage.aggregate([{
        $match: updatedFilter
    }]);

    taskStages.map(async (taskStage) => await deleteOneTaskStage(taskStage._id));

    return taskStages;
}
