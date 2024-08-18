import { DealStage } from "../schema/dealStageSchema.js";
import { filterCheck, pagingFormat, sortFormat } from "../utils.js";
import { createOneAudit } from "./audit.js";
import { DealGroupBy } from "./deal.js";


// Queries

export async function countDealStages() {
    return await DealStage.countDocuments();
}

export async function filterCount(filter) {
    return await DealStage.aggregate([{ $match: filter }]).count("title")
}

export async function findDealStages(paging, filter, sorting) {
    const optimizedFilter = filter ? filterCheck(filter) : {}
    const optimizedPaging = paging ? pagingFormat(paging) : []
    const optimizedSort = sorting ? sortFormat(sorting) : {}

    let dealStageCount = 0
    let aggregateAttribs = []

    aggregateAttribs.push({
        $lookup: {
            from: "deals",
            localField: "_id",
            foreignField: "stageId",
            as: "dealsAggregate"
        }
    })
    aggregateAttribs.push({
        $addFields: {
            "dealsAggregate.sum.value": {
                $sum: "$dealsAggregate.value"
            }
        }
    });
    
    if(optimizedFilter){
        aggregateAttribs.push({$match: optimizedFilter})
        dealStageCount = await filterCount(optimizedFilter)
        dealStageCount = dealStageCount.length > 0 ? dealStageCount[0].title : 0
    } else {
        dealStageCount = await countDealStages()
    }
    if(Object.keys(optimizedSort).length > 0) {
        aggregateAttribs.push({$sort: optimizedSort})
    }
    if(optimizedPaging) {
        aggregateAttribs = aggregateAttribs.concat(optimizedPaging)
    }

    let pageInfo = {
        hasNextPage: (paging.limit + paging?.offset) < dealStageCount, 
        hasPreviousPage: paging.offset ? paging.offset > 0 : false
    }
    
    const nodes = await DealStage.aggregate(aggregateAttribs);
    const newNodes = await findDealStageGroupBy(nodes);

    return {nodes: newNodes, totalCount: dealStageCount, pageInfo};
}

export async function findDealStageGroupBy(nodes) {
    const newNodes = nodes.map(async (node) => {
        const groupYear = await DealGroupBy(node._id, "$closeDateYear");
        const groupMonth = await DealGroupBy(node._id, "$closeDateMonth");
        const dealsAggregate = Object.assign({}, node.dealsAggregate[0], {
            groupBy: {
                closeDateYear: groupYear.length ? groupYear[0]._id : null,
                closeDateMonth: groupMonth.length ? groupMonth[0]._id : null
            }
        })
        node.dealsAggregate[0] = dealsAggregate
        return {...node};
    });
    return await newNodes;
}

export async function findDealStage(id) {
    return await DealStage.findById(id);
}

// Mutations

// CREATE
export async function createOneDealStage(
    dealStage,
    createdById
) {
    const newDealStage = await DealStage.create({
        ...dealStage,
        createdById,
        createdAt: new Date(),
        updatedAt: new Date(), 
    });

    let auditChanges = []
    Object.entries(dealStage).forEach((value) => auditChanges.push({
        field: value[0],
        to: value[1]
    }));
    

    const audit = await createOneAudit(
        {
            targetEntity: "DealStage",
            targetId: newDealStage._id,
            changes: auditChanges,
            userId: createdById,
            action: "CREATE"
        }
    )

    return newDealStage;
}

export async function createManyDealStages(
    dealStages,
    createdById
) {
    const newDealStages = dealStages.map(async(dealStage) => await createOneDealStage(
        dealStage,
        createdById,
    ))
    return newDealStages;
}

// UPDATE
export async function updateOneDealStage(id, update, updatedById){
    Object.keys(update).forEach((k) => update[k] == '' && delete update[k]);
    const oldValues = await DealStage.findById(id);
    const dealStage = DealStage.findByIdAndUpdate(id, {...update, updatedById, updatedAt: new Date()});
    
    let auditChanges = []
    Object.entries(update).forEach((value) => auditChanges.push({
        field: value[0],
        from: oldValues[value[1]],
        to: value[1]
    }))

    await createOneAudit(
        {
            targetEntity: "DealStage",
            targetId: id,
            changes: auditChanges,
            userId: updatedById,
            action: "UPDATE"
        }
    )
    
    return await dealStage;
}

export async function updateManyDealStages(filter, update, updatedById) {
    const updatedFilter = filterCheck(filter)
    const dealStages = await DealStage.aggregate([{
        $match: updatedFilter
    }]);

    const updatedDealStages = dealStages.map(async (dealStage) => await updateOneDealStage(dealStage._id, update, updatedById))

    return updatedDealStages;
}

// DELETE
export async function deleteOneDealStage(id) {
    return await DealStage.findByIdAndDelete(id);
}

export async function deleteManyDealStages(filter) {
    const updatedFilter = filterCheck(filter);
    const dealStages = await DealStage.aggregate([{
        $match: updatedFilter
    }]);

    dealStages.map(async (dealStage) => await deleteOneDealStage(dealStage._id));

    return dealStages;
}
