import mongoose from "mongoose";
import { Contact } from "../schema/contactSchema.js"
import { filterCheck, pagingFormat, sortFormat } from "../utils.js";
import { createOneAudit } from "./audit.js";


// Queries

export async function countContacts() {
    return await Contact.countDocuments();
}

export async function filterCount(filter) {
    return await Contact.aggregate([{ $match: filter }]).count("name")
}

export async function findContacts(paging, filter, sorting) {
    const optimizedFilter = filter ? filterCheck(filter) : {}
    const optimizedPaging = paging ? pagingFormat(paging) : []
    const optimizedSort = sorting ? sortFormat(sorting) : {}

    let contactCount = 0

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

    if(optimizedFilter){
        aggregateAttribs.push({$match: optimizedFilter})
        contactCount = await filterCount(optimizedFilter)
        contactCount = contactCount.length > 0 ? contactCount[0].name : 0
    } else {
        contactCount = await countContacts();
    }

    if(Object.keys(optimizedSort).length > 0) {
        aggregateAttribs.push({$sort: optimizedSort})
    }
    if(optimizedPaging) {
        aggregateAttribs = aggregateAttribs.concat(optimizedPaging)
    }

    let pageInfo = {
        hasNextPage: (paging.limit + paging?.offset) < contactCount, 
        hasPreviousPage: paging.offset ? paging.offset > 0 : false
    }
    
    const nodes = await Contact.aggregate(aggregateAttribs);

    return {nodes, totalCount: contactCount, pageInfo};
}

export async function findContact(id) {
    
    // return await Contact.findById(id);
    const contacts = await Contact.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        { 
            $lookup: {
                from: "companies",
                localField: "companyId",
                foreignField: "_id",
                as: "company"
            },
        },
        {
            $set: { company: {$first: "$company"} }
        },
        {
            $lookup: {
                from: "users",
                localField: "salesOwnerId",
                foreignField: "_id",
                as: "salesOwner"
            },
        },
        {
            $set: { salesOwner: { $first: "$salesOwner" } }
        }
    ])

    if(contacts) {
        return contacts[0]
    }
    return null
}

// Mutations

// CREATE
export async function createOneContact(
    contact,
    createdById
) {
    const newContact = await Contact.create({
        ...contact,
        createdById,
        stage: "LEAD",
        status: "NEW",
        createdAt: new Date(),
        updatedAt: new Date(), 
    });

    let auditChanges = [{field: "stage", to: "LEAD"}, {field: "status", to: "NEW"}]
    Object.entries(contact).forEach((value) => auditChanges.push({
        field: value[0],
        to: value[1]
    }));
    

    const audit = await createOneAudit(
        {
            targetEntity: "Contact",
            targetId: newContact._id,
            changes: auditChanges,
            userId: createdById,
            action: "CREATE"
        }
    )

    return newContact;
}

export async function createManyContacts(
    contacts,
    createdById
) {
    const newContacts = contacts.map(async(contact) => await createOneContact(
        contact,
        createdById,
    ))
    return newContacts;
}

// UPDATE
export async function updateOneContact(id, update, updatedById){
    Object.keys(update).forEach((k) => update[k] == '' && delete update[k]);
    const oldValues = await Contact.findById(id);
    const contact = Contact.findByIdAndUpdate(id, {...update, updatedById, updatedAt: new Date()});

    let auditChanges = []
    Object.entries(update).forEach((value) => auditChanges.push({
        field: value[0],
        from: oldValues[value[0]],
        to: value[1]
    }));
    

    const audit = await createOneAudit(
        {
            targetEntity: "Contact",
            targetId: id,
            changes: auditChanges,
            userId: updatedById,
            action: "UPDATE"
        }
    )

    return await contact;
}

export async function updateManyContacts(filter, update, updatedById) {
    const updatedFilter = filterCheck(filter)
    const contacts = await Contact.aggregate([{
        $match: updatedFilter
    }]);

    const updatedContacts = contacts.map(async (contact) => await updateOneContact(contact._id, update, updatedById))

    return updatedContacts;
}

// DELETE
export async function deleteOneContact(id) {
    return await Contact.findByIdAndDelete(id);
}

export async function deleteManyContacts(filter) {
    const updatedFilter = filterCheck(filter);
    const contacts = await Contact.aggregate([{
        $match: updatedFilter
    }]);

    contacts.map(async (contact) => await deleteOneContact(contact._id));

    return contacts;
}
