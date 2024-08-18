import gql from "graphql-tag";

export const CONTACT_SHOW_QUERY = gql`
    query ContactShow($id: ID!) {
        contact(id: $id) {
            _id
            name
            email
            company {
                _id
                name
                avatarUrl
            }
            status
            jobTitle
            phone
            timezone
            avatarUrl
            salesOwner {
                _id
                name
                avatarUrl
            }
            createdAt
        }
    }
`;