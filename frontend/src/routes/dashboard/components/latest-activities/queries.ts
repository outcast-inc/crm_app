import gql from "graphql-tag";

export const DEALS_QUERY = gql`
    query LatestActivitiesDeals(
        $filter: DealFilter!
        $sorting: [DealSort!]!
        $paging: OffsetPaging!
    ) {
        deals(filter: $filter, sorting: $sorting, paging: $paging) {
            nodes {
                _id
                title
                stage {
                    id
                    title
                }
                company {
                    _id
                    name
                    avatarUrl
                }
            }
        }
    }
`;

export const AUDITS_QUERY = gql`
    query LatestActivitiesAudits(
        $filter: AuditFilter!
        $sorting: [AuditSort!]!
        $paging: OffsetPaging!
    ) {
        audits(filter: $filter, sorting: $sorting, paging: $paging) {
            nodes {
                _id
                action
                targetEntity
                targetId
                createdAt
                changes {
                    field
                    from
                    to
                }
                user {
                    _id
                    name
                    avatarUrl
                }
            }
        }
    }
`;