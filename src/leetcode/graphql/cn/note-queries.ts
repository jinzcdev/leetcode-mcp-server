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

/**
 * GraphQL mutation for creating a new note on LeetCode CN
 *
 * @param content - Content of the note
 * @param noteType - Type of note (e.g., "COMMON_QUESTION")
 * @param targetId - ID of the target object (e.g., question ID)
 * @param summary - Optional summary of the note
 */
export const NOTE_CREATE_MUTATION = `
mutation noteCreateCommonNote(
    $content: String!
    $noteType: NoteCommonTypeEnum!
    $targetId: String!
    $summary: String!
) {
    noteCreateCommonNote(
        content: $content
        noteType: $noteType
        targetId: $targetId
        summary: $summary
    ) {
        note {
            id
            content
            targetId
        }
        ok
    }
}`;

/**
 * GraphQL mutation for updating an existing note on LeetCode CN
 *
 * @param noteId - ID of the note to update
 * @param content - New content for the note
 * @param summary - Optional new summary for the note
 */
export const NOTE_UPDATE_MUTATION = `
mutation noteUpdateUserNote(
    $content: String!
    $noteId: ID!
    $summary: String!
) {
    noteUpdateUserNote(content: $content, noteId: $noteId, summary: $summary) {
        note {
            id
            content
            targetId
        }
        ok
    }
}`;
