import { User } from "../schema/userSchema.js";
import { filterCheck, pagingFormat, sortFormat } from "../utils.js";
import { createOneAudit } from "./audit.js";


// Query

export async function countUsers() {
    return await User.countDocuments();
}

export async function filterCount(filter) {
    return await User.aggregate([{ $match: filter }]).count("name")
}

export async function findUsers(paging, filter, sorting) {
    const optimizedFilter = filter ? filterCheck(filter) : {}
    const optimizedPaging = paging ? pagingFormat(paging) : []
    const optimizedSort = sorting ? sortFormat(sorting) : {}

    let userCount = 0

    let aggregateAttribs = []
    if(optimizedFilter){
        aggregateAttribs.push({$match: optimizedFilter})
        userCount = await filterCount(optimizedFilter)
        userCount = userCount.length > 0 ? userCount[0].name : 0
    } else {
        userCount = await countUsers();
    }
    if(Object.keys(optimizedSort).length > 0) {
        aggregateAttribs.push({$sort: optimizedSort})
    }
    if(optimizedPaging) {
        aggregateAttribs = aggregateAttribs.concat(optimizedPaging)
    }

    let pageInfo = {
        hasNextPage: (paging.limit + paging?.offset) < userCount, 
        hasPreviousPage: paging.offset ? paging.offset > 0 : false
    }
    
    const nodes = await User.aggregate(aggregateAttribs);
    const totalCount = nodes.length;

    return {nodes, totalCount, pageInfo};
}

export async function getUser(id) {
    return await User.findById(id);
}

// Mutations

// create a user
export async function createOneUser(name, email, password, phone, jobTitle, timezone, role, createdById) {
    const user = await User.create({
        name,
        email,
        password,
        phone,
        jobTitle,
        timezone,
        role,
        createdById,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    let auditChanges = []
    Object.entries({name, email, password, phone, jobTitle, timezone, role}).forEach((value) => auditChanges.push({
        field: value[0],
        to: value[1]
    }))

    await createOneAudit(
        {
            targetEntity: "User",
            targetId: id,
            changes: auditChanges,
            userId: updatedById,
            action: "CREATE"
        }
    )

    return user;
}

// create many users
export async function createManyUsers(users, createdById) {
    const newUsers = users.map(async(user) => await createOneUser(
        user.name,
        user.email,
        user.password,
        user.phone,
        user.jobTitle,
        user.timezone,
        user.role,
        createdById
    ));
    return newUsers;
}

// register User
export async function registerUser(email, password, createdById) {
    const user = User.create({
        name: "User",
        email, 
        password,
        role: "SALES_INTERN",
        createdById,
        createdAt: new Date(),
        updatedAt: new Date(),
    })

    return await user;
}


// Login User
export async function loginUser(email) {
    const user = User.findOne({email});
    return await user;
}

// Updating user
export async function updateOneUser(id, update){
    Object.keys(update).forEach((k) => update[k] == '' && delete update[k]);
    const oldValues = User.findById(id);
    const user = User.findByIdAndUpdate(id, {...update, updatedAt: new Date()});
    
    let auditChanges = []
    Object.entries(update).forEach((value) => auditChanges.push({
        field: value[0],
        from: oldValues[value[1]],
        to: value[1]
    }))

    await createOneAudit(
        {
            targetEntity: "User",
            targetId: id,
            changes: auditChanges,
            userId: updatedById,
            action: "UPDATE"
        }
    )
    
    return await user;
}

// Update multiple users
export async function updateManyUsers(filter, update) {
    const updatedFilter = filterCheck(filter)
    const users = await User.aggregate([{
        $match: updatedFilter
    }]);

    users.map(async (user) => await updateOneUser(user._id, update))

    return users;
}

// Delete user
export async function deleteOneUser(id) {
    return await User.findByIdAndDelete(id);
}

// Delete multiple User
export async function deleteManyUsers(filter) {
    const updatedFilter = filterCheck(filter);
    const users = await User.aggregate([{
        $match: updatedFilter
    }]);

    users.map(async (user) => await deleteOneUser(user._id));

    return users;
}

