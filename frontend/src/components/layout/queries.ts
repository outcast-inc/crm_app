import gql from "graphql-tag";

export const NOTIFICATIONS_QUERY = gql`
    query Notifications(
        $paging: OffsetPaging!
        $filter: AuditFilter!
        $sorting: [AuditSort!]
    ) {
        audits(paging: $paging, filter: $filter, sorting: $sorting) {
            nodes {
                _id
                action
                targetEntity
                targetId
                createdAt
                user {
                    _id
                    name
                    avatarUrl
                }
            }
            totalCount
        }
    }
`;

export const NOTIFICATIONS_DEALS_QUERY = gql`
    query NotificationsDeals($filter: DealFilter!) {
        deals(filter: $filter) {
            nodes {
                _id
                title
                stage {
                    _id
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