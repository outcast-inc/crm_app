import mongoose from "mongoose";
import { Quote } from "../schema/quoteSchema.js";
import { filterCheck, pagingFormat, sortFormat } from "../utils.js"
import { createOneAudit } from "./audit.js";



// Queries

export async function countQuotes() {
    return await Quote.countDocuments();
}

export async function findQuote(id) {
    // return await Quote.findById(id);
    const quotes = await Quote.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        { 
            $lookup: {
                from: "companies",
                localField: "companyId",
                foreignField: "_id",
                as: "company"
            }
        },
        {
            $set: { company: {$first: "$company"} }
        },
        {
            $lookup: {
                from: "contacts",
                localField: "contactId",
                foreignField: "_id",
                as: "contact"
            }
        },
        {
            $set: { contact: { $first: "$contact" } }
        },
        {
            $lookup: {
                from: "users",
                localField: "salesOwnerId",
                foreignField: "_id",
                as: "salesOwner"
            }
        },
        {
            $set: { salesOwner: { $first: "$salesOwner" } }
        }
    ])

    if(quotes) {
        return quotes[0]
    }
    return null
}

export async function filterCount(filter) {
    return await Quote.aggregate([{ $match: filter }]).count("title")
}

export async function findQuotes(paging, filter, sorting) {
    const optimizedFilter = filter ? filterCheck(filter) : {}
    const optimizedPaging = paging ? pagingFormat(paging) : []
    const optimizedSort = sorting ? sortFormat(sorting) : {}

    let quoteCount = 0

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
            from: "contacts",
            localField: "contactId",
            foreignField: "_id",
            as: "contact"
        }
    })
    aggregateAttribs.push({
        $set: {
            contact: { $first: "$contact" }
        }
    })

    aggregateAttribs.push({
        $lookup: {
            from: "users",
            localField: "salesOwnerId",
            foreignField: "_id",
            as: "salesOwner"
        }
    })
    aggregateAttribs.push({
        $set: {
            salesOwner: { $first: "$salesOwner" }
        }
    })

    if(optimizedFilter){
        aggregateAttribs.push({$match: optimizedFilter})
        quoteCount = await filterCount(optimizedFilter)
        quoteCount = quoteCount.length > 0 ? quoteCount[0].title : 0
    } else {
        quoteCount = await countQuotes();
    }
    if(Object.keys(optimizedSort).length > 0) {
        aggregateAttribs.push({$sort: optimizedSort})
    }
    if(optimizedPaging) {
        aggregateAttribs = aggregateAttribs.concat(optimizedPaging)
    }

    let pageInfo = {
        hasNextPage: (paging.limit + paging?.offset) < quoteCount, 
        hasPreviousPage: paging.offset ? paging.offset > 0 : false
    }
    
    const nodes = await Quote.aggregate(aggregateAttribs);
    const totalCount = nodes.length;

    return {nodes, totalCount, pageInfo};
}

// Mutations

// CREATE
export async function createOneQuote(
    quote,
    createdById
) {
    const newQuote = await Quote.create({
        ...quote,
        total: 0,
        tax: 0,
        subTotal: 0,
        status: "DRAFT",
        createdById,
        createdAt: new Date(),
        updatedAt: new Date(), 
    });

    let auditChanges = [{ field: "total", to: 0 }, { field: "subTotal", to: 0 }, {field: "tax", to: 0}, { field: "status", to: "DRAFT" }]
    Object.entries(quote).forEach((value) => auditChanges.push({
        field: value[0],
        to: value[1]
    }));
    

    const audit = await createOneAudit(
        {
            targetEntity: "Quote",
            targetId: newQuote._id,
            changes: auditChanges,
            userId: createdById,
            action: "CREATE"
        }
    )

    return await findQuote(newQuote._id);
}

export async function createManyQuotes(
    quotes,
    createdById
) {
    const newQuotes = quotes.map(async(quote) => await createOneQuote(
        quote,
        createdById,
    ))
    return newQuotes;
}

// UPDATE
export async function updateOneQuote(id, update, updatedById){
    Object.keys(update).forEach((k) => update[k] == '' && delete update[k]);
    const oldValues = await Quote.findById(id);

    let subTotal = oldValues.subTotal
    
    if("items" in update){
        update.items.map((item, index) => {
            const itemTotal = update.items[index].unitPrice * update.items[index].quantity * ((100 - update.items[index].discount) / 100);
            update.items[index].totalPrice = itemTotal;
            subTotal += itemTotal
        })
        update.subTotal = subTotal
    }

    if ("tax" in update) {
        update.total = subTotal + (subTotal * (update.tax / 100));
    }
    
    
    const quote = await Quote.findByIdAndUpdate(id, {...update, updatedById, updatedAt: new Date()});
    
    let auditChanges = []
    Object.entries(update).forEach((value) => {
        if (value[0] === "items") {
            value[1].map((items) => Object.entries(items).forEach((item) => auditChanges.push({
                field: value[0] + item[0],
                to: item[1]
            })))
        } else {
            auditChanges.push({
                field: value[0],
                from: oldValues[value[0]],
                to: value[1]
            })
        }
    });
    

    const audit = await createOneAudit(
        {
            targetEntity: "Quote",
            targetId: id,
            changes: auditChanges,
            userId: updatedById,
            action: "UPDATE"
        }
    )
    
    return await findQuote(id);
}

export async function updateManyQuotes(filter, update, updatedById) {
    const updatedFilter = filterCheck(filter)
    const quotes = await Quote.aggregate([{
        $match: updatedFilter
    }]);

    const updatedQuotes = quotes.map(async (quote) => await updateOneQuote(quote._id, update, updatedById))

    return updatedQuotes;
}

// DELETE
export async function deleteOneQuote(id) {
    return await Quote.findByIdAndDelete(id);
}

export async function deleteManyQuotes(filter) {
    const updatedFilter = filterCheck(filter);
    const quotes = await Quote.aggregate([{
        $match: updatedFilter
    }]);

    quotes.map(async (quote) => await deleteOneQuote(quote._id));

    return quotes;
}
