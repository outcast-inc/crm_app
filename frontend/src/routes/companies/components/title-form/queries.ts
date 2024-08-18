import gql from "graphql-tag";

export const COMPANY_TITLE_FORM_MUTATION = gql`
    mutation CompanyTitleForm($input: UpdateOneCompanyInput!) {
        updateOneCompany(input: $input) {
            _id
            name
            avatarUrl
            salesOwner {
                _id
                name
                avatarUrl
            }
        }
    }
`;

export const COMPANY_TITLE_QUERY = gql`
    query CompanyTitle($id: ID!) {
        company(id: $id) {
            _id
            name
            createdAt
            avatarUrl
            salesOwner {
                _id
                name
                avatarUrl
            }
        }
    }
`;