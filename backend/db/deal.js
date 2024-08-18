import mongoose from "mongoose";
import { Deal } from "../schema/dealSchema.js";
import { filterCheck, pagingFormat, sortFormat } from "../utils.js";
import { createOneAudit } from "./audit.js";


// Queries

export async function countDeals() {
    return await Deal.countDocuments();
}

export async function filterCount(filter) {
    return await Deal.aggregate([{ $match: filter }]).count("title")
}

export async function findDeals(paging, filter, sorting) {
    const optimizedFilter = filter ? filterCheck(filter) : {}
    const optimizedPaging = paging ? pagingFormat(paging) : []
    const optimizedSort = sorting ? sortFormat(sorting) : {}

    let dealCount = 0

    let aggregateAttribs = []

    aggregateAttribs.push({
        $lookup: {
            from: "companies",
            localField: "companyId",
            foreignField: "_id",
            as: "company"
        }
    })
    aggregateAttribs.push({
        $set: {
            company: { $first: "$company" }
        }
    })

    aggregateAttribs.push({
        $lookup: {
            from: "dealstages",
            localField: "stageId",
            foreignField: "_id",
            as: "stage",
        }
    })

    aggregateAttribs.push({
        $set: {
            stage: { $first: "$stage" }
        }
    })

    aggregateAttribs.push({
        $lookup: {
            from: "contacts",
            localField: "dealContactId",
            foreignField: "_id",
            as: "dealContact",
        }
    })

    aggregateAttribs.push({
        $set: {
            dealContact: { $first: "$dealContact" }
        }
    })

    aggregateAttribs.push({
        $lookup: {
            from: "users",
            localField: "dealOwnerId",
            foreignField: "_id",
            as: "dealOwner"
        }
    })

    aggregateAttribs.push({
        $set: {
            dealOwner: { $first: "$dealOwner" }
        }
    })
    
    if(optimizedFilter){
        aggregateAttribs.push({$match: optimizedFilter})
        dealCount = await filterCount(optimizedFilter)
        dealCount = dealCount.length > 0 ? dealCount[0].title : 0
    } else {
        dealCount = await countDeals();
    }
    if(Object.keys(optimizedSort).length > 0) {
        aggregateAttribs.push({$sort: optimizedSort})
    }
    if(optimizedPaging) {
        aggregateAttribs = aggregateAttribs.concat(optimizedPaging)
    }


    let pageInfo = {
        hasNextPage: (paging.limit + paging?.offset) < dealCount, 
        hasPreviousPage: paging.offset ? paging.offset > 0 : false
    }

    const nodes = await Deal.aggregate(aggregateAttribs);
    const totalCount = nodes.length;

    return {nodes, totalCount, pageInfo};
}

export async function findDeal(id) {
    const deals = await Deal.aggregate([
        {
            $match: { _id: { $eq : new mongoose.Types.ObjectId(id)}}
        },
        {
            $lookup: {
                from: "companies",
                localField: "companyId",
                foreignField: "_id",
                as: "company"
            }
        },
        {
            $set: {
                company: { $first: "$company" }
            }
        },
        {
            $lookup: {
                from: "contacts",
                localField: "company._id",
                foreignField: "companyId",
                as: "company.contacts.nodes"
            }
        },
        {
            $addFields: {
                "company.contacts.totalCount": {
                    $size: "$company.contacts.nodes"
                }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "dealOwnerId",
                foreignField: "_id",
                as: "dealOwner"
            }
        },
        {
            $set: {
                dealOwner: { $first: "$dealOwner" }
            }
        },
        {
            $lookup: {
                from: "contacts",
                localField: "dealContactId",
                foreignField: "_id",
                as: "dealContact"
            }
        },
        {
            $set: {
                dealContact: { $first: "$dealContact" }
            }
        }
    ]);
    if (deals) {
        return deals[0]
    }
    return null;
}

export async function DealGroupBy(id, attr) {
    return await Deal.aggregate([
        {
            $match: { stageId: id },
        },{
            $group: { _id: attr }
        }
    ]);
}

// Mutations

// CREATE
export async function createOneDeal(
    deal,
    createdById
) {
    const newDeal = await Deal.create({
        ...deal,
        notes: "",
        createdById,
        createdAt: new Date(),
        updatedAt: new Date(), 
    });

    let auditChanges = []
    Object.entries(deal).forEach((value) => auditChanges.push({
        field: value[0],
        to: value[1]
    }))

    await createOneAudit(
        {
            targetEntity: "Deal",
            targetId: newDeal._id,
            changes: auditChanges,
            userId: createdById,
            action: "CREATE"
        }
    )

    return newDeal;
}

export async function createManyDeals(
    deals,
    createdById
) {
    const newDeals = deals.map(async(deal) => await createOneDeal(
        deal,
        createdById,
    ))
    return newDeals;
}

// UPDATE
export async function updateOneDeal(id, update, updatedById){
    Object.keys(update).forEach((k) => update[k] == '' && delete update[k]);
    const oldValues = await Deal.findById(id);
    const deal = await Deal.findByIdAndUpdate(id, {...update, updatedById, updatedAt: new Date()});
    
    let auditChanges = []
    Object.entries(update).forEach((value) => auditChanges.push({
        field: value[0],
        from: oldValues[value[1]],
        to: value[1]
    }))

    await createOneAudit(
        {
            targetEntity: "Deal",
            targetId: id,
            changes: auditChanges,
            userId: updatedById,
            action: "UPDATE"
        }
    )

    return await findDeal(id);
}

export async function updateManyDeals(filter, update, updatedById) {
    const updatedFilter = filterCheck(filter)
    const deals = await Deal.aggregate([{
        $match: updatedFilter
    }]);

    const updatedDeals = deals.map(async (deal) => await updateOneDeal(deal._id, update, updatedById))

    return updatedDeals;
}

// DELETE
export async function deleteOneDeal(id) {
    return await Deal.findByIdAndDelete(id);
}

export async function deleteManyDeals(filter) {
    const updatedFilter = filterCheck(filter);
    const deals = await Deal.aggregate([{
        $match: updatedFilter
    }]);

    deals.map(async (deal) => await deleteOneDeal(deal._id));

    return deals;
}
