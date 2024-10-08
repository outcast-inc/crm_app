import gql from "graphql-tag";

export const SALES_COMPANIES_SELECT_QUERY = gql`
    query SalesCompaniesSelect(
        $filter: CompanyFilter!
        $sorting: [CompanySort!]
        $paging: OffsetPaging!
    ) {
        companies(filter: $filter, sorting: $sorting, paging: $paging) {
            nodes {
                _id
                name
                avatarUrl
                contacts {
                    nodes {
                        name
                        _id
                        avatarUrl
                    }
                }
            }
        }
    }
`;

export const SALES_CREATE_DEAL_STAGE_MUTATION = gql`
    mutation SalesCreateDealStage($input: CreateOneDealStageInput!) {
        createOneDealStage(input: $input) {
            _id
        }
    }
`;

export const SALES_CREATE_CONTACT_MUTATION = gql`
    mutation SalesCreateContact($input: CreateOneContactInput!) {
        createOneContact(input: $input) {
            _id
        }
    }
`;

export const SALES_UPDATE_DEAL_STAGE_MUTATION = gql`
    mutation SalesUpdateDealStage($input: UpdateOneDealStageInput!) {
        updateOneDealStage(input: $input) {
            _id
            title
        }
    }
`;

export const SALES_UPDATE_DEAL_MUTATION = gql`
    mutation SalesUpdateDeal($input: UpdateOneDealInput!) {
        updateOneDeal(input: $input) {
            _id
            title
            stageId
            value
            dealOwnerId
            company {
                _id
                contacts {
                    nodes {
                        _id
                        name
                        avatarUrl
                    }
                }
            }
            dealContact {
                _id
            }
        }
    }
`;

export const SALES_FINALIZE_DEAL_MUTATION = gql`
    mutation SalesFinalizeDeal($input: UpdateOneDealInput!) {
        updateOneDeal(input: $input) {
            _id
            notes
            closeDateYear
            closeDateMonth
            closeDateDay
        }
    }
`;

export const SALES_DEAL_STAGES_QUERY = gql`
    query SalesDealStages(
        $filter: DealStageFilter!
        $sorting: [DealStageSort!]
        $paging: OffsetPaging
    ) {
        dealStages(filter: $filter, sorting: $sorting, paging: $paging) {
            nodes {
                _id
                title
                dealsAggregate {
                    sum {
                        value
                    }
                }
            }
            totalCount
        }
    }
`;

export const SALES_DEALS_QUERY = gql`
    query SalesDeals(
        $filter: DealFilter!
        $sorting: [DealSort!]
        $paging: OffsetPaging!
    ) {
        deals(filter: $filter, sorting: $sorting, paging: $paging) {
            nodes {
                _id
                title
                value
                createdAt
                stageId
                company {
                    _id
                    name
                    avatarUrl
                }
                dealOwner {
                    _id
                    name
                    avatarUrl
                }
            }
        }
    }
`;