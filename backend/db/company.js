import mongoose from "mongoose";
import { Company } from "../schema/companySchema.js"
import { filterCheck, pagingFormat, sortFormat } from "../utils.js"
import { createOneAudit } from "./audit.js";
import { findContacts } from "./contact.js";


// Queries

export async function countCompanies() {
    return await Company.countDocuments();
}

export async function filterCount(filter) {
    return await Company.aggregate([{ $match: filter }]).count("name")
}

export async function findCompanies(paging, filter, sorting) {
    const optimizedFilter = filter ? filterCheck(filter) : {}
    const optimizedPaging = paging ? pagingFormat(paging) : []
    const optimizedSort = sorting ? sortFormat(sorting) : {}

    let companyCount = 0

    let aggregateAttribs = []

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

    aggregateAttribs.push({
        $lookup: {
            from: "contacts",
            localField: "_id",
            foreignField: "companyId",
            as: "contacts.nodes"
        }
    })

    aggregateAttribs.push({
        $lookup: {
            from: "deals",
            localField: "_id",
            foreignField: "companyId",
            as: "dealsAggregate"
        }
    })
    aggregateAttribs.push({
        $addFields: {
            "dealsAggregate.sum.value": {
                $cond: [
                    { $ne: ["$dealsAggregate", []] },
                    {$sum: "$dealsAggregate.value"},
                    0
                ]
            }
        }
    })

    if(optimizedFilter){
        aggregateAttribs.push({$match: optimizedFilter})
        companyCount = await filterCount(optimizedFilter)
        companyCount = companyCount.length > 0 ? companyCount[0].name : 0
    } else {
        companyCount = await countCompanies();
    }

    if(Object.keys(optimizedSort).length > 0) {
        aggregateAttribs.push({$sort: optimizedSort})
    }
    if(optimizedPaging) {
        aggregateAttribs = aggregateAttribs.concat(optimizedPaging)
    }

    let pageInfo = {
        hasNextPage: (paging.limit + paging?.offset) < companyCount, 
        hasPreviousPage: paging.offset ? paging.offset > 0 : false
    }

    const nodes = await Company.aggregate(aggregateAttribs);

    return {nodes, totalCount: companyCount, pageInfo};
}

export async function companyAggregate(filter) {
    const optimizedFilter = filterCheck(filter)

    const count = await Company.aggregate([
        { $match: optimizedFilter},
        {
            $group: {
                _id: "count",
                totalRevenue: {
                    $sum: {$cond: ["$totalRevenue", 1, 0]}
                },
                id: { $sum: {$cond: ["$_id", 1, 0]} },
                name: { $sum: {$cond: ["$name", 1, 0]} },
                companySize: { $sum: {$cond: ["$companySize", 1, 0]} },
                industry: { $sum: {$cond: ["$industry", 1, 0]} },
                businessType: { $sum: {$cond: ["$businessType", 1, 0]} },
                country: { $sum: {$cond: ["$country", 1, 0]} },
                website: { $sum: {$cond: ["$website", 1, 0]} },
                createdAt: { $sum: {$cond: ["$createdAt", 1, 0]} },
                updatedAt: { $sum: {$cond: ["$updatedAt", 1, 0]} },
            }
        }
    ])
    const sum = await Company.aggregate([
        { $match: optimizedFilter},
        {
            $group: {
                _id: "sum",
                totalRevenue: {
                    $sum: "$totalRevenue"
                },
                id: { $count: {} }
            }
        }
    ])
    const avg = await Company.aggregate([
        { $match: optimizedFilter},
        {
            $group: {
                _id: "avg",
                totalRevenue: {
                    $avg: "$totalRevenue"
                },
                id: { $avg: {$cond: ["$_id", 1, 0]} }
            }
        }
    ])
    const min = await Company.aggregate([
        { $match: optimizedFilter},
        {
            $group: {
                _id: "min",
                totalRevenue: {
                    $min: "$totalRevenue"
                },
                id: { $min: "$_id" },
                name: { $min: "$name" },
                companySize: { $max: "$companySize" },
                industry: { $min: "$industry" },
                businessType: { $min: "$businessType" },
                country: { $min: "$country" },
                website: { $min: "$website" },
                createdAt: { $min: "$createdAt" },
                updatedAt: { $min: "$updatedAt" },
            }
        }
    ])
    const max = await Company.aggregate([
        { $match: optimizedFilter},
        {
            $group: {
                _id: "max",
                totalRevenue: {
                    $max: "$totalRevenue"
                },
                id: { $max: "$_id" },
                name: { $max: "$name" },
                companySize: { $min: "$companySize" },
                industry: { $max: "$industry" },
                businessType: { $max: "$businessType" },
                country: { $max: "$country" },
                website: { $max: "$website" },
                createdAt: { $max: "$createdAt" },
                updatedAt: { $max: "$updatedAt" },
            }
        }
    ])
    
    console.log("nodes", sum);
    console.log("avg", avg)
    console.log("min", min)
    console.log("max", max)
    console.log("count", count)
}

export async function findCompany(id) {
    const company = await Company.aggregate([
        {$match: {_id: new mongoose.Types.ObjectId(id)}},
        {$lookup: {
            from: "users",
            localField: "salesOwnerId",
            foreignField: "_id",
            as: "salesOwner"
            }
        },
        {$set: {
            salesOwner: { $first: "$salesOwner" }
        }},
        {
            $lookup: {
                from: "deals",
                localField: "_id",
                foreignField: "companyId",
                as: "dealsAggregate"
            }
        },
        {
            $addFields: {
                "dealsAggregate.sum.value": {
                    $cond: [
                        { $ne: ["$dealsAggregate", []] },
                        {$sum: "$dealsAggregate.value"},
                        0
                    ]
                }
            }
        }
    ]);
    if(company) {
        return company[0]
    }
    return null
}

// Mutations

// CREATE
export async function createOneCompany(
    company,
    createdById
) {
    const newCompany = await Company.create({
        ...company,
        createdById,
        createdAt: new Date(),
        updatedAt: new Date(), 
    });

    let auditChanges = []
    Object.entries(company).forEach((value) => auditChanges.push({
        field: value[0],
        to: value[1]
    }));
    

    const audit = await createOneAudit(
        {
            targetEntity: "Company",
            targetId: newCompany._id,
            changes: auditChanges,
            userId: createdById,
            action: "CREATE"
        }
    )

    return await findCompany(newCompany._id);
}

export async function createManyCompanies(
    companies,
    createdById
) {
    const newCompanies = companies.map(async(company) => await createOneCompany(
        company,
        createdById,
    ))
    return newCompanies;
}

// UPDATE
export async function updateOneCompany(id, update, updatedById){
    Object.keys(update).forEach((k) => update[k] == '' && delete update[k]);
    const oldValues = await Company.findById(id);

    const company = Company.findByIdAndUpdate(id, {...update, updatedById, updatedAt: new Date()});

    let auditChanges = []
    Object.entries(update).forEach((value) => auditChanges.push({
        field: value[0],
        from: oldValues[value[1]],
        to: value[1]
    }))

    await createOneAudit(
        {
            targetEntity: "Company",
            targetId: id,
            changes: auditChanges,
            userId: updatedById,
            action: "UPDATE"
        }
    )

    return await company;
}

export async function updateManyCompanies(filter, update, updatedById) {
    const updatedFilter = filterCheck(filter)
    const companies = await Company.aggregate([{
        $match: updatedFilter
    }]);

    const updatedCompanies = companies.map(async (company) => await updateOneCompany(company._id, update, updatedById))

    return updatedCompanies;
}

// DELETE
export async function deleteOneCompany(id) {
    return await Company.findByIdAndDelete(id);
}

export async function deleteManyCompanies(filter) {
    const updatedFilter = filterCheck(filter);
    const companies = await Company.aggregate([{
        $match: updatedFilter
    }]);

    companies.map(async (company) => await deleteOneCompany(company._id));

    return companies;
}
