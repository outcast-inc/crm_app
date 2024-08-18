import { EventCategory } from "../schema/eventCategorySchema.js"
import { filterCheck, pagingFormat, sortFormat } from "../utils.js";
import { createOneAudit } from "./audit.js";



// Queries

export async function countEventCategories() {
    return await EventCategory.countDocuments();
}

export async function filterCount(filter) {
    return await EventCategory.aggregate([{ $match: filter }]).count("title")
}

export async function findEventCategories(paging, filter, sorting) {
    const optimizedFilter = filter ? filterCheck(filter) : {}
    const optimizedPaging = paging ? pagingFormat(paging) : []
    const optimizedSort = sorting ? sortFormat(sorting) : {}

    let eventCategoryCount = 0

    let aggregateAttribs = []
    if(optimizedFilter){
        aggregateAttribs.push({$match: optimizedFilter})
        eventCategoryCount = await filterCount(optimizedFilter)
        eventCategoryCount = eventCategoryCount.length > 0 ? eventCategoryCount[0].title : 0;
    } else {
        eventCategoryCount = await countEventCategories();
    }
    if(Object.keys(optimizedSort).length > 0) {
        aggregateAttribs.push({$sort: optimizedSort})
    }
    if(optimizedPaging) {
        aggregateAttribs = aggregateAttribs.concat(optimizedPaging)
    }

    let pageInfo = {
        hasNextPage: (paging.limit + paging?.offset) < eventCategoryCount, 
        hasPreviousPage: paging.offset ? paging.offset > 0 : false
    }
    
    const nodes = await EventCategory.aggregate(aggregateAttribs);
    const totalCount = nodes.length;

    return {nodes, totalCount, pageInfo};
}

export async function findEventCategory(id) {
    return await EventCategory.findById(id);
}

// Mutations

// CREATE
export async function createOneEventCategory(
    eventCategory,
    createdById
) {
    const newEventCategory = await EventCategory.create({
        ...eventCategory,
        createdById,
        createdAt: new Date(),
        updatedAt: new Date(), 
    });

    let auditChanges = []
    Object.entries(eventCategory).forEach((value) => auditChanges.push({
        field: value[0],
        to: value[1]
    }))

    await createOneAudit(
        {
            targetEntity: "EventCategory",
            targetId: newEventCategory._id,
            changes: auditChanges,
            userId: createdById,
            action: "CREATE"
        }
    )

    return newEventCategory;
}

export async function createManyEventCategories(
    eventCategories,
    createdById
) {
    const newEventCategories = eventCategories.map(async(eventCategory) => await createOneEventCategory(
        eventCategory,
        createdById,
    ))
    return newEventCategories;
}

// UPDATE
export async function updateOneEventCategory(id, update, updatedById){
    Object.keys(update).forEach((k) => update[k] == '' && delete update[k]);
    const oldValues = await EventCategory.findById(id);
    const eventCategory = EventCategory.findByIdAndUpdate(id, {...update, updatedById, updatedAt: new Date()});
    
    let auditChanges = []
    Object.entries(update).forEach((value) => auditChanges.push({
        field: value[0],
        from: oldValues[value[1]],
        to: value[1]
    }))

    await createOneAudit(
        {
            targetEntity: "EventCategory",
            targetId: id,
            changes: auditChanges,
            userId: updatedById,
            action: "UPDATE"
        }
    )
    
    return await eventCategory;
}

export async function updateManyEventCategories(filter, update, updatedById) {
    const updatedFilter = filterCheck(filter)
    const eventCategories = await EventCategory.aggregate([{
        $match: updatedFilter
    }]);

    const updatedEventCategories = eventCategories.map(async (eventCategory) => await updateOneEventCategory(eventCategory._id, update, updatedById))

    return updatedEventCategories;
}

// DELETE
export async function deleteOneEventCategory(id) {
    return await EventCategory.findByIdAndDelete(id);
}

export async function deleteManyEventCategories(filter) {
    const updatedFilter = filterCheck(filter);
    const eventCategories = await EventCategory.aggregate([{
        $match: updatedFilter
    }]);

    eventCategories.map(async (eventCategory) => await deleteOneEventCategory(eventCategory._id));

    return eventCategories;
}
