import { ContactNote } from "../schema/contactNoteSchema.js";
import { filterCheck, pagingFormat, sortFormat } from "../utils.js";
import { createOneAudit } from "./audit.js";

// Queries

export async function countContactNotes() {
    return await ContactNote.countDocuments();
}

export async function filterCount(filter) {
    return await ContactNote.aggregate([{ $match: filter }]).count("note")
}

export async function findContactNotes(paging, filter, sorting) {
    const optimizedFilter = filter ? filterCheck(filter) : {}
    const optimizedPaging = paging ? pagingFormat(paging) : []
    const optimizedSort = sorting ? sortFormat(sorting) : {}

    let contactNoteCount = 0

    let aggregateAttribs = []
    if(optimizedFilter){
        aggregateAttribs.push({$match: optimizedFilter})
        contactNoteCount = await filterCount(optimizedFilter)
        contactNoteCount = contactNoteCount.length > 0 ? contactNoteCount[0].note : 0
    } else {
        contactNoteCount = await countContactNotes();
    }
    if(Object.keys(optimizedSort).length > 0) {
        aggregateAttribs.push({$sort: optimizedSort})
    }
    if(optimizedPaging) {
        aggregateAttribs = aggregateAttribs.concat(optimizedPaging)
    }

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

    let pageInfo = {
        hasNextPage: (paging.limit + paging?.offset) < contactNoteCount, 
        hasPreviousPage: paging.offset ? paging.offset > 0 : false
    }
    
    const nodes = await ContactNote.aggregate(aggregateAttribs);
    const totalCount = nodes.length;

    return {nodes, totalCount, pageInfo};
}

export async function findContactNote(id) {
    return await ContactNote.findById(id);
}

// Mutations

// CREATE
export async function createOneContactNote(
    contactNote,
    createdById
) {
    const newContactNote = await ContactNote.create({
        ...contactNote,
        createdById,
        createdAt: new Date(),
        updatedAt: new Date(), 
    });

    let auditChanges = []
    Object.entries(contactNote).forEach((value) => auditChanges.push({
        field: value[0],
        to: value[1]
    }));
    

    const audit = await createOneAudit(
        {
            targetEntity: "ContactNote",
            targetId: newContactNote._id,
            changes: auditChanges,
            userId: createdById,
            action: "CREATE"
        }
    )

    return newContactNote;
}

export async function createManyContactNotes(
    contactNotes,
    createdById
) {
    const newContactNotes = contactNotes.map(async(contactNote) => await createOneContactNote(
        contactNote,
        createdById,
    ))
    return newContactNotes;
}

// UPDATE
export async function updateOneContactNote(id, update, updatedById){
    Object.keys(update).forEach((k) => update[k] == '' && delete update[k]);
    const oldValues = await ContactNote.findById(id);
    const contactNote = ContactNote.findByIdAndUpdate(id, {...update, updatedById, updatedAt: new Date()});
    
    let auditChanges = []
    Object.entries(update).forEach((value) => auditChanges.push({
        field: value[0],
        from: oldValues[value[0]],
        to: value[1]
    }));

    await createOneAudit(
        {
            targetEntity: "ContactNote",
            targetId: id,
            changes: auditChanges,
            userId: updatedById,
            action: "UPDATE"
        }
    )
    
    return await contactNote;
}

export async function updateManyContactNotes(filter, update, updatedById) {
    const updatedFilter = filterCheck(filter)
    const contactNotes = await ContactNote.aggregate([{
        $match: updatedFilter
    }]);

    const updatedContactNotes = contactNotes.map(async (contactNote) => await updateOneContactNote(contactNote._id, update, updatedById))

    return updatedContactNotes;
}

// DELETE
export async function deleteOneContactNote(id) {
    return await ContactNote.findByIdAndDelete(id);
}

export async function deleteManyContactNotes(filter) {
    const updatedFilter = filterCheck(filter);
    const contactNotes = await ContactNote.aggregate([{
        $match: updatedFilter
    }]);

    contactNotes.map(async (contactNote) => await deleteOneContactNote(contactNote._id));

    return contactNotes;
}
