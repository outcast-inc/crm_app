import gql from "graphql-tag";

export const CONTACTS_CREATE_CONTACT_NOTE_MUTATION = gql`
    mutation ContactsCreateContactNote($input: CreateOneContactNoteInput!) {
        createOneContactNote(input: $input) {
            _id
            note
        }
    }
`;

export const CONTACTS_UPDATE_CONTACT_NOTE_MUTATION = gql`
    mutation ContactsUpdateContactNote($input: UpdateOneContactNoteInput!) {
        updateOneContactNote(input: $input) {
            _id
            note
        }
    }
`;

export const CONTACTS_CONTACT_NOTES_LIST_QUERY = gql`
    query ContactsContactNotesList(
        $filter: ContactNoteFilter!
        $sorting: [ContactNoteSort!]
        $paging: OffsetPaging!
    ) {
        contactNotes(filter: $filter, sorting: $sorting, paging: $paging) {
            totalCount
            nodes {
                _id
                note
                createdAt
                createdBy {
                    _id
                    name
                    avatarUrl
                }
            }
        }
    }
`;