import mongoose from "mongoose";

export const filterCheck = (filter) => {
    let updatedFilter = {};
    let multiFilter = []
    let combName = "$and"
    Object.entries(filter).forEach((column_name, _) => {
        if(['and', 'or'].includes(column_name[0])) {
            combName = `$${column_name[0]}`
            column_name[1].map((childFilter) => multiFilter.push(filterCheck(childFilter)));
        } else {
            Object.entries(column_name[1]).forEach((k) => {
                const attr = column_name[0]
                const child_value = Object.values(k)[1]
                if (typeof child_value === "object" && !Array.isArray(child_value)) {
                    Object.entries(k[1]).forEach((i) => {
                        const attr = `${column_name[0] + "." + k[0]}`
                        const newFilter = filterFormat(attr, i)
                        if (newFilter) {
                            multiFilter.push(newFilter)
                        }
                    })
                } else {
                    const newFilter = filterFormat(attr, k)
                    if (newFilter) {
                        multiFilter.push(newFilter)
                    }
                }
            });
        }
    });
    if(multiFilter.length > 0){
        return Object.assign({}, updatedFilter, { [combName]: multiFilter})
    }
    return updatedFilter;
}


export const filterFormat = (_attrib, k) => {
    let valueName = null
    const defaultDates = ["createdAt", "updatedAt"]
    if(_attrib.split(".").includes("id")) {
        _attrib = _attrib.replaceAll("id", "_id");
    }
    if(typeof k[1] === "string") {
        valueName = _attrib.includes("_id") ? new mongoose.Types.ObjectId(k[1]) : k[1]
    } else {
        valueName = _attrib.includes("_id") ? k[1].map((v) => v && new mongoose.Types.ObjectId(v)) : k[1]
    }
    if(defaultDates.includes(_attrib) || _attrib.toLowerCase().includes("date")) {
        valueName = new Date(k[1]);
    }

    if(valueName.length === 0 || (valueName.length === 1 && valueName[0].length === 0)) {
        return {};
    }

    switch (k[0]) {
        case 'is':
            return { [_attrib]:{ $exists: valueName} }
        case 'isNot':
            return { [_attrib]:{ $exists: !valueName} }
        case 'eq':
            return {[_attrib]: { $eq: valueName}}
        case 'neq':
            return {[_attrib]: { $ne: valueName}}
        case 'gt':
            return {[_attrib]: { $gt: valueName }}
        case 'gte':
            return {[_attrib]: { $gte: valueName }}
        case 'lt':
            return {[_attrib]: { $lt: valueName }}
        case 'lte':
            return {[_attrib]: { $lte: valueName }}
        case 'like':
            return { [_attrib] : { $regex: k[1].replaceAll("%", "") } }
        case 'notLike':
            return { [_attrib] : {$not: { $regex: k[1].replaceAll("%", "") }} }
        case 'iLike':
            if (k[1] === "%%") return {}
            return { [_attrib]: { $regex : k[1].replaceAll("%", ""), $options: 'i' } }
        case 'notILike':
            return { [_attrib]: { $not: { $regex : k[1].replaceAll("%", ""), $options: 'i' } } }
        case 'in':
            return {[_attrib]: { $in: valueName }}
        case 'notIn':
            return { [_attrib]: { $nin: valueName } }
        case 'between':
            return { [_attrib]: {$lte: k[1][0], $gte: k[1][1]} }
        case 'notBetween':
            return { [_attrib]: {$not: {$lte: k[1][0], $gte: k[1][1]} } }
        default:
            return {};
    }
}

export const pagingFormat = (paging) => {
    let updatedPaging = []
    if(paging?.offset) {
        updatedPaging.push({$skip: paging.offset})
    }
    if(paging?.limit) {
        updatedPaging.push({$limit: (
            paging.limit + (paging?.offset || 0)
        )})
    }
    return updatedPaging;
}

export const sortFormat = (sorting) => {
    let updatedSort = {}
    if(!sorting) return null
    sorting.map((sort) => {
        updatedSort[sort.field] = sort.direction === "ASC" ? 1 : -1
    })
    return updatedSort;
}