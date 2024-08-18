import { CompanyNote } from "../schema/companyNoteSchema.js";
import { filterCheck, pagingFormat, sortFormat } from "../utils.js";
import { createOneAudit } from "./audit.js";


// Queries

export async function countCompanyNotes() {
    return await CompanyNote.countDocuments();
}

export async function filterCount(filter) {
    return await CompanyNote.aggregate([{ $match: filter }]).count("note")
}

export async function findCompanyNotes(paging, filter, sorting) {
    const optimizedFilter = filterCheck(filter)
    const optimizedPaging = pagingFormat(paging)
    const optimizedSort = sortFormat(sorting)

    let aggregateAttribs = []

    let companyNoteCount = 0

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
            from: "users",
            localField: "createdById",
            foreignField: "_id",
            as: "createdBy"
        }
    })
    aggregateAttribs.push({
        $set: {
            createdBy: { $first: "$createdBy" }
        }
    })

    if(optimizedFilter){
        aggregateAttribs.push({$match: optimizedFilter})
        companyNoteCount = await filterCount(optimizedFilter);
        companyNoteCount = companyNoteCount.length > 0 ? companyNoteCount[0].note : 0
    } else {
        companyNoteCount = await countCompanyNotes();
    }
    if(optimizedSort) {
        aggregateAttribs.push({$sort: optimizedSort})
    }
    if(optimizedPaging) {
        aggregateAttribs = aggregateAttribs.concat(optimizedPaging)
    }

    let pageInfo = {
        hasNextPage: (paging.limit + paging?.offset) < companyNoteCount, 
        hasPreviousPage: paging.offset ? paging.offset > 0 : false
    }
    
    const nodes = await CompanyNote.aggregate(aggregateAttribs);
    const totalCount = nodes.length;

    return {nodes, totalCount, pageInfo};
}

export async function findCompanyNote(id) {
    return await CompanyNote.findById(id);
}

// Mutations

// CREATE
export async function createOneCompanyNote(
    companyNote,
    createdById
) {
    const newCompanyNote = await CompanyNote.create({
        ...companyNote,
        createdById,
        createdAt: new Date(),
        updatedAt: new Date(), 
    });

    let auditChanges = []
    Object.entries(companyNote).forEach((value) => auditChanges.push({
        field: value[0],
        to: value[1]
    }))

    await createOneAudit(
        {
            targetEntity: "CompanyNote",
            targetId: newCompanyNote._id,
            changes: auditChanges,
            userId: createdById,
            action: "CREATE"
        }
    )

    return newCompanyNote;
}

export async function createManyCompanyNotes(
    companyNotes,
    createdById
) {
    const newCompanyNotes = companyNotes.map(async(companyNote) => await createOneCompanyNote(
        companyNote,
        createdById,
    ))
    return newCompanyNotes;
}

// UPDATE
export async function updateOneCompanyNote(id, update, updatedById){
    Object.keys(update).forEach((k) => update[k] == '' && delete update[k]);
    const oldValues = await CompanyNote.findById(id);
    const companyNote = CompanyNote.findByIdAndUpdate(id, {...update, updatedById, updatedAt: new Date()});

    let auditChanges = []
    Object.entries(update).forEach((value) => auditChanges.push({
        field: value[0],
        from: oldValues[value[1]],
        to: value[1]
    }))

    await createOneAudit(
        {
            targetEntity: "CompanyNote",
            targetId: id,
            changes: auditChanges,
            userId: updatedById,
            action: "UPDATE"
        }
    )

    return await companyNote;
}

export async function updateManyCompanyNotes(filter, update, updatedById) {
    const updatedFilter = filterCheck(filter)
    const companyNotes = await CompanyNote.aggregate([{
        $match: updatedFilter
    }]);

    const updatedCompanyNotes = companyNotes.map(async (companyNote) => await updateOneCompanyNote(companyNote._id, update, updatedById))

    return updatedCompanyNotes;
}

// DELETE
export async function deleteOneCompanyNote(id) {
    return await CompanyNote.findByIdAndDelete(id);
}

export async function deleteManyCompanyNotes(filter) {
    const updatedFilter = filterCheck(filter);
    const companyNotes = await CompanyNote.aggregate([{
        $match: updatedFilter
    }]);

    companyNotes.map(async (companyNote) => await deleteOneCompanyNote(companyNote._id));

    return companyNotes;
}
