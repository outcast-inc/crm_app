import gql from "graphql-tag";

const EVENT_FRAGMENT = gql`
    fragment EventFragment on Event {
        _id
        title
        description
        startDate
        endDate
        color
        createdAt
        createdBy {
            _id
            name
        }
        category {
            _id
            title
        }
        participants {
            _id
            name
        }
    }
`;

export const CALENDAR_UPDATE_EVENT_MUTATION = gql`
    mutation UpdateEvent($input: UpdateOneEventInput!) {
        updateOneEvent(input: $input) {
            ...EventFragment
        }
    }
    ${EVENT_FRAGMENT}
`;

export const CALENDAR_GET_EVENT_QUERY = gql`
    query GetEvent($id: ID!) {
        event(id: $id) {
            ...EventFragment
        }
    }
    ${EVENT_FRAGMENT}
`;