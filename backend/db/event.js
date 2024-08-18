import mongoose from "mongoose";
import { Event } from "../schema/eventSchema.js"
import { filterCheck, pagingFormat, sortFormat } from "../utils.js";
import { createOneAudit } from "./audit.js";


// Queries

export async function countEvents() {
    return await Event.countDocuments();
}

export async function filterCount(filter) {
    return await Event.aggregate([{ $match: filter }]).count("title")
}

export async function findEvents(paging, filter, sorting) {
    const optimizedFilter = filterCheck(filter)
    const optimizedPaging = pagingFormat(paging)
    const optimizedSort = sortFormat(sorting)

    let eventCount = 0
    let aggregateAttribs = []

    aggregateAttribs.push({
        $lookup: {
            from: "eventcategories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category"
        }
    });

    aggregateAttribs.push({
        $set: {
            category: { $first: "$category" }
        }
    })

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
        eventCount = await filterCount(optimizedFilter)
        eventCount = eventCount.length > 0 ? eventCount[0].title : 0;
    } else {
        eventCount = await countEvents();
    }
    if(Object.keys(optimizedSort).length > 0) {
        aggregateAttribs.push({$sort: optimizedSort})
    }
    if(optimizedPaging) {
        aggregateAttribs = aggregateAttribs.concat(optimizedPaging)
    }

    let pageInfo = {
        hasNextPage: (paging.limit + paging?.offset) < eventCount, 
        hasPreviousPage: paging.offset ? paging.offset > 0 : false
    }
    
    const nodes = await Event.aggregate(aggregateAttribs);
    const totalCount = nodes.length;

    return {nodes, totalCount, pageInfo};
}

export async function findEvent(id) {
    const event = await Event.aggregate([
        {
            $match: { _id: { $eq: new mongoose.Types.ObjectId(id) } }
        },
        {
            $lookup: {
                from: "eventcategories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category"
            }
        },
        {
            $set: {
                category: { $first: "$category" }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "createdById",
                foreignField: "_id",
                as: "createdBy"
            }
        },
        {
            $set: {
                createdBy: { $first: "$createdBy" }
            }
        },
        {
            $lookup: {
                from: "users",
                as: "participants",
                let: {participant_ids: "$participantIds"},
                pipeline: [
                    { $match: { $expr : { $in: ["$_id", "$$participant_ids"] } } }
                ]
            }
        }
    ]);

    if(event) {
        return event[0]
    }
    return null;
}

// Mutations

// CREATE
export async function createOneEvent(
    event,
    createdById
) {
    const newEvent = await Event.create({
        ...event,
        createdById,
        createdAt: new Date(),
        updatedAt: new Date(), 
    });

    let auditChanges = []
    Object.entries(event).forEach((value) => {
        let v = value[1]
        if(value[0] === "participantIds") {
            v = value[1].join(",")
        }
        auditChanges.push({
            field: value[0],
            to: v
        })
    })

    await createOneAudit(
        {
            targetEntity: "Event",
            targetId: newEvent._id,
            changes: auditChanges,
            userId: createdById,
            action: "CREATE"
        }
    )

    return newEvent;
}

export async function createManyEvents(
    events,
    createdById
) {
    const newEvents = events.map(async(event) => await createOneEvent(
        event,
        createdById,
    ))
    return newEvents;
}

// UPDATE
export async function updateOneEvent(id, update, updatedById){
    Object.keys(update).forEach((k) => update[k] == '' && delete update[k]);
    const oldValues = await Event.findById(id);
    const event = await Event.findByIdAndUpdate(id, {...update, updatedById, updatedAt: new Date()});
    
    let auditChanges = []
    Object.entries(update).forEach((value) => {
        let v = value[1]
        if(value[0] === "participantIds") {
            v = value[1].join(",")
        }
        auditChanges.push({
            field: value[0],
            from: oldValues[value[1]],
            to: v
        })
    })

    await createOneAudit(
        {
            targetEntity: "Event",
            targetId: id,
            changes: auditChanges,
            userId: updatedById,
            action: "UPDATE"
        }
    )
    
    return await findEvent(id);
}

export async function updateManyEvents(filter, update, updatedById) {
    const updatedFilter = filterCheck(filter)
    const events = await Event.aggregate([{
        $match: updatedFilter
    }]);

    const updatedEvents = events.map(async (event) => await updateOneEvent(event._id, update, updatedById))

    return updatedEvents;
}

// DELETE
export async function deleteOneEvent(id) {
    return await Event.findByIdAndDelete(id);
}

export async function deleteManyEvents(filter) {
    const updatedFilter = filterCheck(filter);
    const events = await Event.aggregate([{
        $match: updatedFilter
    }]);

    events.map(async (event) => await deleteOneEvent(event._id));

    return events;
}
