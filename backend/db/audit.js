import mongoose from "mongoose"
import { Audit } from "../schema/auditSchema.js";
import { filterCheck, pagingFormat, sortFormat } from "../utils.js";

// Queries

export async function countAudits() {
    return await Audit.countDocuments();
}

export async function filterCount(filter) {
    return await Audit.aggregate([{ $match: filter }]).count("name")
}

export async function findAudits(paging, filter, sorting) {
    const optimizedFilter = filterCheck(filter)
    const optimizedPaging = pagingFormat(paging)
    const optimizedSort = sortFormat(sorting)

    let auditCount = 0
    let aggregateAttribs = []

    aggregateAttribs.push({
        $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
        }
    });

    aggregateAttribs.push({
        $set: {
            user: { $first: "$user" }
        }
    })

    if(optimizedFilter){
        aggregateAttribs.push({$match: optimizedFilter})
        auditCount = await filterCount(optimizedFilter);
        auditCount = auditCount.length > 0 ? auditCount[0].name : 0
    } else {
        auditCount = await countAudits()
    }
    if(optimizedSort) {
        aggregateAttribs.push({$sort: optimizedSort})
    }
    if(optimizedPaging) {
        aggregateAttribs = aggregateAttribs.concat(optimizedPaging)
    }

    let pageInfo = {
        hasNextPage: (paging.limit + paging?.offset) < auditCount, 
        hasPreviousPage: paging.offset ? paging.offset > 0 : false
    }
    
    const nodes = await Audit.aggregate(aggregateAttribs);
    const totalCount = nodes.length;

    return {nodes, totalCount: auditCount, pageInfo};
}

export async function findAudit(id) {
    return await Audit.findById(id);
}

export async function findAuditByTargetId(targetId) {
    return await Audit.findOne({ targetId : mongoose.Schema.ObjectId(targetId) })
}

// Mutations

// CREATE
export async function createOneAudit(
    audit,
) {
    const newAudit = Audit.create({
        ...audit,
        createdAt: new Date(),
        updatedAt: new Date(), 
    });

    return await newAudit;
}

export async function createManyAudits(
    audits,
) {
    const newAudits = audits.map(async(audit) => await createOneAudit(
        audit,
    ))
    return newAudits;
}

// UPDATE
export async function updateOneAudit(id, update){
    Object.keys(update).forEach((k) => update[k] == '' && delete update[k]);
    const audit = Audit.findByIdAndUpdate(id, {...update, updatedAt: new Date()});
    return await audit;
}

export async function updateManyAudits(filter, update) {
    const updatedFilter = filterCheck(filter)
    const audits = await Audit.aggregate([{
        $match: updatedFilter
    }]);

    const updatedAudits = audits.map(async (audit) => await updateOneAudit(audit._id, update))

    return updatedAudits;
}

export async function updateAuditChange(id, change) {
    const audit = await Audit.findById(id);
    const changes = audit.changes.push(change)
    return await updateOneAudit(id, {changes});
}

// DELETE
export async function deleteOneAudit(id) {
    return await Audit.findByIdAndDelete(id);
}

export async function deleteManyAudits(filter) {
    const updatedFilter = filterCheck(filter);
    const audits = await Audit.aggregate([{
        $match: updatedFilter
    }]);

    audits.map(async (audit) => await deleteOneAudit(audit._id));

    return audits;
}
