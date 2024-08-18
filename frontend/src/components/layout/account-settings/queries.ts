import gql from "graphql-tag";

export const ACCOUNT_SETTINGS_GET_USER_QUERY = gql`
    query AccountSettingsGetUser($id: ID!) {
        user(id: $id) {
            _id
            name
            email
            avatarUrl
            jobTitle
            phone
            timezone
        }
    }
`;

export const ACCOUNT_SETTINGS_UPDATE_USER_MUTATION = gql`
    mutation AccountSettingsUpdateUser($input: UpdateOneUserInput!) {
        updateOneUser(input: $input) {
            _id
            name
            email
            avatarUrl
            jobTitle
            phone
            timezone
        }
    }
`;