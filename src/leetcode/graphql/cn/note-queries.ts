/**
 * GraphQL query for fetching user notes on LeetCode CN
 * This query allows retrieving notes with pagination, filtering, and sorting options
 *
 * @param orderBy - Optional sorting criteria for notes (e.g., "ASCENDING", "DESCENDING")
 */
export const NOTE_AGGREGATE_QUERY = `
query noteAggregateNote(
    $aggregateType: AggregateNoteEnum!
    $keyword: String
    $orderBy: AggregateNoteSortingOrderEnum
    $limit: Int = 100
    $skip: Int = 0
) {
    noteAggregateNote(
        aggregateType: $aggregateType
        keyword: $keyword
        orderBy: $orderBy
        limit: $limit
        skip: $skip
    ) {
        count
        userNotes {
            id
            summary
            content
            ... on NoteAggregateQuestionNoteNode {
                noteQuestion {
                    linkTemplate
                    questionId
                    title
                    translatedTitle
                }
            }
        }
    }
}`;

/**
 * GraphQL query for fetching user notes for a specific question ID on LeetCode CN
 */
export const NOTE_BY_QUESTION_ID_QUERY = `
query noteOneTargetCommonNote(
    $noteType: NoteCommonTypeEnum!
    $questionId: String!
    $limit: Int = 20
    $skip: Int = 0
) {
    noteOneTargetCommonNote(
        noteType: $noteType
        targetId: $questionId
        limit: $limit
        skip: $skip
    ) {
        count
        userNotes {
            id
            summary
            content
        }
    }
}`;
