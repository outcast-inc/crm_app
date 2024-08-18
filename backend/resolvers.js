import { loginCallback, refreshAuthToken } from "./auth.js";
import { findAudit, findAudits } from "./db/audit.js";
import { createManyCompanies, createOneCompany, deleteOneCompany, deleteManyCompanies, updateManyCompanies, updateOneCompany, findCompany, findCompanies, companyAggregate } from "./db/company.js";
import { createManyCompanyNotes, createOneCompanyNote, deleteManyCompanyNotes, deleteOneCompanyNote, findCompanyNote, findCompanyNotes, updateManyCompanyNotes, updateOneCompanyNote } from "./db/companyNote.js";
import { createManyContacts, createOneContact, deleteManyContacts, deleteOneContact, findContact, findContacts, updateManyContacts, updateOneContact } from "./db/contact.js";
import { createManyContactNotes, createOneContactNote, deleteManyContactNotes, deleteOneContactNote, findContactNote, findContactNotes, updateManyContactNotes, updateOneContactNote } from "./db/contactNote.js";
import { createManyDeals, createOneDeal, deleteManyDeals, deleteOneDeal, findDeal, findDeals, updateManyDeals, updateOneDeal } from "./db/deal.js";
import { createManyDealStages, createOneDealStage, deleteManyDealStages, deleteOneDealStage, findDealStage, findDealStages, updateManyDealStages, updateOneDealStage } from "./db/dealStage.js";
import { createManyEvents, createOneEvent, deleteManyEvents, deleteOneEvent, findEvent, findEvents, updateManyEvents, updateOneEvent } from "./db/event.js"
import { createManyEventCategories, createOneEventCategory, deleteManyEventCategories, deleteOneEventCategory, findEventCategories, findEventCategory, updateManyEventCategories, updateOneEventCategory } from "./db/eventCategory.js";
import { createManyQuotes, createOneQuote, deleteManyQuotes, deleteOneQuote, findQuote, findQuotes, updateManyQuotes, updateOneQuote } from "./db/quote.js";
import { createManyTasks, createOneTask, deleteManyTasks, deleteOneTask, findTask, findTasks, updateManyTasks, updateOneTask } from "./db/task.js";
import { createManyTaskComments, createOneTaskComment, deleteManyTaskComments, deleteOneTaskComment, findTaskComment, findTaskComments, updateManyTaskComments, updateOneTaskComment } from "./db/taskComment.js";
import { createManyTaskStages, createOneTaskStage, deleteManyTaskStages, deleteOneTaskStage, findTaskStage, findTaskStages, updateManyTaskStages, updateOneTaskStage } from "./db/taskStage.js";
import { createManyUsers, createOneUser, deleteManyUsers, deleteOneUser, findUsers, getUser, registerUser, updateManyUsers, updateOneUser } from "./db/user.js"

export const resolvers = {
    Query: {
        me: async(_root, {}, context) => {
            if(!context || !context.user)
                return null
            return context.user;
        },
        user: async(_root, {id}) => {
            return await getUser(id);
        },
        users: async(_root, {paging, filter, sorting}) => {
            const users = await findUsers(paging, filter, sorting);
            return users;
        },
        companyAggregate: async(_root, {filter}) => {
            await companyAggregate(filter);
        },
        company: async(_root, {id}) => {
            return await findCompany(id);
        },
        companies: async(_root, {paging, filter, sorting}) => {
            return await findCompanies(paging, filter, sorting);
        },
        contact: async(_root, {id}) => {
            return await findContact(id);
        },
        contacts: async(_root, {paging, filter, sorting}) => {
            return await findContacts(paging, filter, sorting);
        },
        eventCategory: async(_root, {id}) => {
            return await findEventCategory(id);
        },
        eventCategories: async(_root, {paging, filter, sorting}) => {
            return await findEventCategories(paging, filter, sorting);
        },
        event: async(_root, {id}) => {
            return await findEvent(id);
        },
        events: async(_root, {paging, filter, sorting}) => {
            return await findEvents(paging, filter, sorting)
        },
        taskAggregate: async(_root, {filter}) => {

        },
        task: async(_root, {id}) => {
            return await findTask(id);
        },
        tasks: async(_root, {paging, filter, sorting}) => {
            return await findTasks(paging, filter, sorting);
        },
        taskComment: async(_root, {id}) => {
            return await findTaskComment(id);
        },
        taskComments: async(_root, {paging, filter, sorting}) => {
            return await findTaskComments(paging, filter, sorting);
        },
        taskStageAggregate: async(_root, {filter}) => {

        },
        taskStage: async(_root, {id}) => {
            return await findTaskStage(id);
        },
        taskStages: async(_root, {paging, filter, sorting}) => {
            return await findTaskStages(paging, filter, sorting);
        },
        companyNote: async(_root, {id}) => {
            return await findCompanyNote(id);
        },
        companyNotes: async(_root, {paging, filter, sorting}) => {
            return await findCompanyNotes(paging, filter, sorting)
        },
        contactNote: async(_root, {id}) => {
            return await findContactNote(id)
        },
        contactNotes: async(_root, {paging, filter, sorting}) => {
            return await findContactNotes(paging, filter, sorting)
        },
        dealStage: async(_root, {id}) => {
            return await findDealStage(id);
        },
        dealStages: async(_root, {paging, filter, sorting}) => {
            return await findDealStages(paging, filter, sorting)
        },
        dealAggregate: async(_root, {filter}) => {

        },
        deal: async(_root, {id}) => {
            return await findDeal(id);
        },
        deals: async(_root, {paging, filter, sorting}) => {
            return await findDeals(paging, filter, sorting)
        },
        quote: async(_root, {id}) => {
            return await findQuote(id);
        },
        quotes: async(_root, {paging, filter, sorting}) => {
            return await findQuotes(paging, filter, sorting);
        },
        audit: async(_root, {id}) => {
            return await findAudit(id);
        },
        audits: async(_root, {paging, filter, sorting}) => {
            return await findAudits(paging, filter, sorting);
        },
    },
    Mutation: {
        login: async(_root, {loginInput : { email, password }}) => {
            return await loginCallback(email, password)
        },
        refreshToken: async(_root, {refresh_token}, context) => {
            const value = await refreshAuthToken(refresh_token);
            return value;
        },
        register: async(_root, {registerInput: { email, password }}, context) => {
            if(!context || !context.user)
                return null
            const user = registerUser(email, password, context.user.id);
            return await user;
        },
        createOneUser: async(_root, {input : { user: { name, email, password, phone, jobTitle, timezone, role } }}, context) => {
            if(!context || !context.user)
                return null
            const user = createOneUser(name, email, password, phone, jobTitle, timezone, role, context.user.id);
            return await user;  
        },
        createManyUsers: async(_root, {input : { users }}, context) => {
            if(!context || !context.user)
                return null
            const newUsers = createManyUsers(users, context.user.id);
            return await newUsers;
        },
        updateOneUser: async(_root, {input : { id, update }}, context) => {
            return await updateOneUser(id, update);
        },
        updateManyUsers: async(_root, {input: { filter, update }}, context) => {
            const val = await updateManyUsers(filter, update);
            const updatedCount = val.length
            return {updatedCount}
        },
        deleteOneUser: async(_root, {input: { id }}, context) => {
            return await deleteOneUser(id);
        },
        deleteManyUsers: async(_root, {input: { filter }}, context) => {
            const deleteUsers = await deleteManyUsers(filter);
            const deletedCount = deleteUsers.length
            return {deletedCount}
        },

        createOneCompany: async(_root, {input: {company}}, context) => {
            if(!context || !context.user)
                return null
            const newCompany = await createOneCompany(company, context.user.id);
            return newCompany;
        },
        createManyCompanies: async(_root, {input: { companies }}, context) => {
            if(!context || !context.user)
                return null
            const newCompanies = await createManyCompanies(companies, context.user.id);
            return newCompanies;
        },
        updateOneCompany: async(_root, {input : { id, update }}, context) => {
            if(!context || !context.user)
                return null
            return await updateOneCompany(id, update, context.user.id);
        },
        updateManyCompanies: async(_root, {input : { filter, update }}, context) => {
            if(!context || !context.user)
                return null
            const val = await updateManyCompanies(filter, update, context.user.id);
            const updatedCount = val.length
            return {updatedCount}
        },
        deleteOneCompany: async(_root, {input : { id }}) => {
            return await deleteOneCompany(id);
        },
        deleteManyCompanies: async(_root, {input : { filter }}) => {
            const deleteCompanies = await deleteManyCompanies(filter);
            const deletedCount = deleteCompanies.length
            return {deletedCount}
        },

        createOneContact: async(_root, {input : { contact }}, context) => {
            if(!context || !context.user)
                return null
            const newContact = await createOneContact(contact, context.user.id);
            return newContact;
        },
        createManyContacts: async(_root, {input: { contacts }}, context) => {
            if(!context || !context.user)
                return null
            const newContacts = await createManyContacts(contacts, context.user.id);
            return newContacts;
        },
        updateOneContact: async(_root, {input : { id, update }}, context) => {
            if(!context || !context.user)
                return null
            return await updateOneContact(id, update, context.user.id);
        },
        updateManyContacts: async(_root, {input : { filter, update }}, context) => {
            if(!context || !context.user)
                return null
            const val = await updateManyContacts(filter, update, context.user.id);
            const updatedCount = val.length
            return {updatedCount}
        },
        deleteOneContact: async(_root, {input : { id }}) => {
            return await deleteOneContact(id);
        },
        deleteManyContacts: async(_root, {input : { filter }}) => {
            const deleteContacts = await deleteManyContacts(filter);
            const deletedCount = deleteContacts.length
            return {deletedCount}
        },

        createOneEventCategory: async(_root, {input : { eventCategory }}, context) => {
            if(!context || !context.user)
                return null
            const newEventCategory = await createOneEventCategory(eventCategory, context.user.id);
            return newEventCategory;
        },
        createManyEventCategories: async(_root, {input : { eventCategories }}, context) => {
            if(!context || !context.user)
                return null
            const newEventCategories = await createManyEventCategories(eventCategories, context.user.id);
            return newEventCategories;
        },
        updateOneEventCategory: async(_root, {input : { id, update }}, context) => {
            if(!context || !context.user)
                return null
            return await updateOneEventCategory(id, update, context.user.id);
        },
        updateManyEventCategories: async(_root, {input: { filter, update }}, context) => {
            if(!context || !context.user)
                return null
            const val = await updateManyEventCategories(filter, update, context.user.id);
            const updatedCount = val.length
            return {updatedCount}
        },
        deleteOneEventCategory: async(_root, {input : { id }}) => {
            return await deleteOneEventCategory(id);
        },
        deleteManyEventCategories: async(_root, {input : { filter }}) => {
            const deleteEventCategories = await deleteManyEventCategories(filter);
            const deletedCount = deleteEventCategories.length
            return {deletedCount}
        },

        createOneEvent: async(_root, {input : { event }}, context) => {
            if(!context || !context.user)
                return null
            const newEvent = await createOneEvent(event, context.user.id);
            return newEvent;
        },
        createManyEvents: async(_root, {input : { events }}, context) => {
            if(!context || !context.user)
                return null
            const newEvents = await createManyEvents(events, context.user.id);
            return newEvents;
        },
        updateOneEvent: async(_root, {input : { id, update }}, context) => {
            if(!context || !context.user)
                return null
            return await updateOneEvent(id, update, context.user.id);
        },
        updateManyEvents: async(_root, {input: { filter, update }}, context) => {
            if(!context || !context.user)
                return null
            const val = await updateManyEvents(filter, update, context.user.id);
            const updatedCount = val.length
            return {updatedCount}
        },
        deleteOneEvent: async(_root, {input : { id }}) => {
            return await deleteOneEvent(id);
        },
        deleteManyEvents: async(_root, {input: { filter }}) => {
            const deleteEvents = await deleteManyEvents(filter);
            const deletedCount = deleteEvents.length
            return {deletedCount}
        },

        createOneTask: async(_root, {input : { task }}, context) => {
            if(!context || !context.user)
                return null
            const newTask = await createOneTask(task, context.user.id);
            return newTask;
        },
        createManyTasks: async(_root, {input : { tasks }}, context) => {
            if(!context || !context.user)
                return null
            const newTasks = await createManyTasks(tasks, context.user.id);
            return newTasks;
        },
        updateOneTask: async(_root, {input : { id, update }}, context) => {
            if(!context || !context.user)
                return null
            return await updateOneTask(id, update, context.user.id);
        },
        updateManyTasks: async(_root, {input : { filter, update }}, context) => {
            if(!context || !context.user)
                return null
            const val = await updateManyTasks(filter, update, context.user.id);
            const updatedCount = val.length
            return {updatedCount}
        },
        deleteOneTask: async(_root, {input : { id }}) => {
            return await deleteOneTask(id);
        },
        deleteManyTasks: async(_root, {input : { filter }}) => {
            const deleteTasks = await deleteManyTasks(filter);
            const deletedCount = deleteTasks.length
            return {deletedCount}
        },

        createOneTaskComment: async(_root, {input : { taskComment }}, context) => {
            if(!context || !context.user)
                return null
            const newTaskComment = await createOneTaskComment(taskComment, context.user.id);
            return newTaskComment;
        },
        createManyTaskComments: async(_root, {input : { taskComments }}, context) => {
            if(!context || !context.user)
                return null
            const newTaskComments = await createManyTaskComments(taskComments, context.user.id);
            return newTaskComments;
        },
        updateOneTaskComment: async(_root, {input : { id, update }}, context) => {
            if(!context || !context.user)
                return null
            return await updateOneTaskComment(id, update, context.user.id);
        },
        updateManyTaskComments: async(_root, {input : { filter, update }}, context) => {
            if(!context || !context.user)
                return null
            const val = await updateManyTaskComments(filter, update, context.user.id);
            const updatedCount = val.length
            return {updatedCount}
        },
        deleteOneTaskComment: async(_root, {input : { id }}) => {
            return await deleteOneTaskComment(id);
        },
        deleteManyTaskComments: async(_root, {input : { filter }}) => {
            const deleteTaskComments = await deleteManyTaskComments(filter);
            const deletedCount = deleteTaskComments.length
            return {deletedCount}
        },

        createOneTaskStage: async(_root, {input : { taskStage }}, context) => {
            if(!context || !context.user)
                return null
            const newTaskStage = await createOneTaskStage(taskStage, context.user.id);
            return newTaskStage;
        },
        createManyTaskStages: async(_root, {input : { taskStages }}, context) => {
            if(!context || !context.user)
                return null
            const newTaskStages = await createManyTaskStages(taskStages, context.user.id);
            return newTaskStages;
        },
        updateOneTaskStage: async(_root, {input : { id, update }}, context) => {
            if(!context || !context.user)
                return null
            return await updateOneTaskStage(id, update, context.user.id);
        },
        updateManyTaskStages: async(_root, {input : { filter, update }}, context) => {
            if(!context || !context.user)
                return null
            const val = await updateManyTaskStages(filter, update, context.user.id);
            const updatedCount = val.length
            return {updatedCount}
        },
        deleteOneTaskStage: async(_root, {input : { id }}) => {
            return await deleteOneTaskStage(id);
        },
        deleteManyTaskStages: async(_root, {input : { filter }}) => {
            const deleteTaskStages = await deleteManyTaskStages(filter);
            const deletedCount = deleteTaskStages.length
            return {deletedCount}
        },

        createOneCompanyNote: async(_root, {input : { companyNote }}, context) => {
            if(!context || !context.user)
                return null
            const newCompanyNote = await createOneCompanyNote(companyNote, context.user.id);
            return newCompanyNote;
        },
        createManyCompanyNotes: async(_root, {input : { companyNotes }}, context) => {
            if(!context || !context.user)
                return null
            const newCompanyNotes = await createManyCompanyNotes(companyNotes, context.user.id);
            return newCompanyNotes;
        },
        updateOneCompanyNote: async(_root, {input : { id, update }}, context) => {
            if(!context || !context.user)
                return null
            return await updateOneCompanyNote(id, update, context.user.id);
        },
        updateManyCompanyNotes: async(_root, {input : { filter, update }}, context) => {
            if(!context || !context.user)
                return null
            const val = await updateManyCompanyNotes(filter, update, context.user.id);
            const updatedCount = val.length
            return {updatedCount}
        },
        deleteOneCompanyNote: async(_root, {input : { id }}) => {
            return await deleteOneCompanyNote(id);
        },
        deleteManyCompanyNotes: async(_root, {input : { filter }}) => {
            const deleteCompanyNotes = await deleteManyCompanyNotes(filter);
            const deletedCount = deleteCompanyNotes.length
            return {deletedCount}
        },

        createOneContactNote: async(_root, {input : { contactNote }}, context) => {
            if(!context || !context.user)
                return null
            const newContactNote = await createOneContactNote(contactNote, context.user.id);
            return newContactNote;
        },
        createManyContactNotes: async(_root, {input : { contactNotes }}, context) => {
            if(!context || !context.user)
                return null
            const newContactNotes = await createManyContactNotes(contactNotes, context.user.id);
            return newContactNotes;
        },
        updateOneContactNote: async(_root, {input : { id, update }}, context) => {
            if(!context || !context.user)
                return null
            return await updateOneContactNote(id, update, context.user.id);
        },
        updateManyContactNotes: async(_root, {input : { filter, update }}, context) => {
            if(!context || !context.user)
                return null
            const val = await updateManyContactNotes(filter, update, context.user.id);
            const updatedCount = val.length
            return {updatedCount}
        },
        deleteOneContactNote: async(_root, {input : { id }}) => {
            return await deleteOneContactNote(id);
        },
        deleteManyContactNotes: async(_root, {input : { filter }}) => {
            const deleteContactNotes = await deleteManyContactNotes(filter);
            const deletedCount = deleteContactNotes.length
            return {deletedCount}
        },

        createOneDealStage: async(_root, {input : { dealStage }}, context) => {
            if(!context || !context.user)
                return null
            const newDealStage = await createOneDealStage(dealStage, context.user.id);
            return newDealStage;
        },
        createManyDealStages: async(_root, {input : { dealStages }}, context) => {
            if(!context || !context.user)
                return null
            const newDealStages = await createManyDealStages(dealStages, context.user.id);
            return newDealStages;
        },
        updateOneDealStage: async(_root, {input : { id, update }}, context) => {
            if(!context || !context.user)
                return null
            return await updateOneDealStage(id, update, context.user.id);
        },
        updateManyDealStages: async(_root, {input : { filter, update }}, context) => {
            if(!context || !context.user)
                return null
            const val = await updateManyDealStages(filter, update, context.user.id);
            const updatedCount = val.length
            return {updatedCount}
        },
        deleteOneDealStage: async(_root, {input : { id }}) => {
            return await deleteOneDealStage(id);
        },
        deleteManyDealStages: async(_root, {input : { filter }}) => {
            const deleteDealStages = await deleteManyDealStages(filter);
            const deletedCount = deleteDealStages.length
            return {deletedCount}
        },

        createOneDeal: async(_root, {input : { deal }}, context) => {
            if(!context || !context.user)
                return null
            const newDeal = await createOneDeal(deal, context.user.id);
            return newDeal;
        },
        createManyDeals: async(_root, {input : { deals }}, context) => {
            if(!context || !context.user)
                return null
            const newDeals = await createManyDeals(deals, context.user.id);
            return newDeals;
        },
        updateOneDeal: async(_root, {input : { id, update }}, context) => {
            if(!context || !context.user)
                return null
            return await updateOneDeal(id, update, context.user.id);
        },
        updateManyDeals: async(_root, {input : { filter, update }}, context) => {
            if(!context || !context.user)
                return null
            const val = await updateManyDeals(filter, update, context.user.id);
            const updatedCount = val.length
            return {updatedCount}
        },
        deleteOneDeal: async(_root, {input : { id }}) => {
            return await deleteOneDeal(id);
        },
        deleteManyDeals: async(_root, {input : { filter }}) => {
            const deleteDeals = await deleteManyDeals(filter);
            const deletedCount = deleteDeals.length
            return {deletedCount}
        },

        createOneQuote: async(_root, {input : { quote }}, context) => {
            if(!context || !context.user)
                return null
            const newQuote = await createOneQuote(quote, context.user.id);
            return newQuote;
        },
        createManyQuotes: async(_root, {input : { quotes }}, context) => {
            if(!context || !context.user)
                return null
            const newQuotes = await createManyQuotes(quotes, context.user.id);
            return newQuotes;
        },
        updateOneQuote: async(_root, {input : { id, update }}, context) => {
            if(!context || !context.user)
                return null
            return await updateOneQuote(id, update, context.user.id);
        },
        updateManyQuotes: async(_root, {input : { filter, update }}, context) => {
            if(!context || !context.user)
                return null
            const val = await updateManyQuotes(filter, update, context.user.id);
            const updatedCount = val.length
            return {updatedCount}
        },
        deleteOneQuote: async(_root, {input : { id }}) => {
            return await deleteOneQuote(id);
        },
        deleteManyQuotes: async(_root, {input : { filter }}) => {
            const deleteQuotes = await deleteManyQuotes(filter);
            const deletedCount = deleteQuotes.length
            return {deletedCount}
        },
    }
}