// This file is auto-generated by @hey-api/openapi-ts

export type ChatMessageRecord = {
    type?: ChatMessageType;
    text?: string;
    timestamp?: Instant;
    modelProvider?: ChatModelProvider;
    modelName?: string;
};

export type ChatMessageType = 'SYSTEM' | 'USER' | 'AI' | 'TOOL_EXECUTION_RESULT' | 'CUSTOM';

export type ChatModelContainer = {
    uid?: string;
    label?: string;
    description?: string;
    provider?: ChatModelProvider;
};

export type ChatModelProvider = 'AZURE' | 'OLLAMA' | 'OPENAI';

export type ChatResponseDto = {
    response?: string;
    sources?: Array<SourceRecord>;
};

export type InfoDto = {
    security?: SecurityInfoDto;
    oidc?: OidcInfoDto;
    imprintLink?: string;
    privacyPolicyLink?: string;
};

export type IngestionStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED';

export type Instant = string;

export type Knowledge = {
    id?: Uuid;
    type?: KnowledgeType;
    checksum?: string;
    ingestionStatus?: IngestionStatus;
    createdAt?: Instant;
    lastUpdatedAt?: Instant;
    source?: string;
    contentType?: string;
    permissions?: {
        [key: string]: Permission;
    };
    label?: string;
    tags?: Array<string>;
};

export type KnowledgeType = 'FILE' | 'WEBLINK';

export type OidcInfoDto = {
    authServerUrl?: string;
    clientId?: string;
    authorizationPath?: string;
    logoutPath?: string;
    tokenPath?: string;
};

export type Permission = 'OWNER' | 'READWRITE' | 'READONLY' | 'NONE';

export type SecurityInfoDto = {
    anonymousUserEnabled?: boolean;
    anonymousUserSessionTimeout?: number;
};

export type Session = {
    id?: Uuid;
    createdAt?: Instant;
    label?: string;
};

export type SourceRecord = {
    knowledgeId?: Uuid;
    content?: string;
};

export type Uuid = string;

export type UserInfoDto = {
    username?: string;
    roles?: Array<string>;
    anonymous?: boolean;
    name?: string;
};

export type ConfigurationData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/rest';
};

export type ConfigurationResponses = {
    /**
     * OK
     */
    200: InfoDto;
};

export type ConfigurationResponse = ConfigurationResponses[keyof ConfigurationResponses];

export type GetModelsData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/rest/chat/models';
};

export type GetModelsErrors = {
    /**
     * Bad Request, usually returned when an operation is requested before the user has logged in.
     */
    400: unknown;
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
};

export type GetModelsResponses = {
    /**
     * OK
     */
    200: Array<ChatModelContainer>;
};

export type GetModelsResponse = GetModelsResponses[keyof GetModelsResponses];

export type PromptData = {
    body: string;
    path?: never;
    query: {
        /**
         * ID of the session to use
         */
        sessionId: Uuid;
        /**
         * UID of the chat model to use
         */
        uid: string;
    };
    url: '/rest/chat/prompt';
};

export type PromptErrors = {
    /**
     * Bad Request, usually returned when an operation is requested before the user has logged in.
     */
    400: unknown;
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
    /**
     * No chat model or no session with given ID found.
     */
    404: unknown;
};

export type PromptResponses = {
    /**
     * OK
     */
    200: ChatResponseDto;
};

export type PromptResponse = PromptResponses[keyof PromptResponses];

export type GetSessionsData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/rest/chat/sessions';
};

export type GetSessionsErrors = {
    /**
     * Bad Request, usually returned when an operation is requested before the user has logged in.
     */
    400: unknown;
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
};

export type GetSessionsResponses = {
    /**
     * OK
     */
    200: Array<Session>;
};

export type GetSessionsResponse = GetSessionsResponses[keyof GetSessionsResponses];

export type CreateSessionData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/rest/chat/sessions/create';
};

export type CreateSessionErrors = {
    /**
     * Bad Request, usually returned when an operation is requested before the user has logged in.
     */
    400: unknown;
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
};

export type CreateSessionResponses = {
    /**
     * Created
     */
    201: Session;
};

export type CreateSessionResponse = CreateSessionResponses[keyof CreateSessionResponses];

export type DeleteSessionData = {
    body?: never;
    path: {
        sessionId: Uuid;
    };
    query?: never;
    url: '/rest/chat/sessions/{sessionId}';
};

export type DeleteSessionErrors = {
    /**
     * Bad Request, usually returned when an operation is requested before the user has logged in.
     */
    400: unknown;
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
    /**
     * No session with the given ID found.
     */
    404: unknown;
};

export type DeleteSessionResponses = {
    /**
     * OK
     */
    200: unknown;
};

export type GetHistoryData = {
    body?: never;
    path: {
        /**
         * UID of the chat history to get
         */
        sessionId: Uuid;
    };
    query?: never;
    url: '/rest/chat/sessions/{sessionId}/history';
};

export type GetHistoryErrors = {
    /**
     * Bad Request, usually returned when an operation is requested before the user has logged in.
     */
    400: unknown;
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
    /**
     * No session with the given ID found.
     */
    404: unknown;
};

export type GetHistoryResponses = {
    /**
     * OK
     */
    200: Array<ChatMessageRecord>;
};

export type GetHistoryResponse = GetHistoryResponses[keyof GetHistoryResponses];

export type KeepAliveAnonymousSessionData = {
    body?: never;
    path: {
        /**
         * UID of the session to keep alive
         */
        sessionId: Uuid;
    };
    query?: never;
    url: '/rest/chat/sessions/{sessionId}/keep-alive';
};

export type KeepAliveAnonymousSessionErrors = {
    /**
     * Bad Request, usually returned when an operation is requested before the user has logged in.
     */
    400: unknown;
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
    /**
     * No session with the given ID found.
     */
    404: unknown;
};

export type KeepAliveAnonymousSessionResponses = {
    /**
     * OK
     */
    200: unknown;
};

export type SetSessionLabelData = {
    body?: never;
    path: {
        /**
         * UID of the session to set the label for
         */
        sessionId: Uuid;
    };
    query: {
        /**
         * session label to set
         */
        label: string;
    };
    url: '/rest/chat/sessions/{sessionId}/label';
};

export type SetSessionLabelErrors = {
    /**
     * Bad Request, usually returned when an operation is requested before the user has logged in.
     */
    400: unknown;
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
    /**
     * No session with the given ID found.
     */
    404: unknown;
};

export type SetSessionLabelResponses = {
    /**
     * OK
     */
    200: unknown;
};

export type GetAllKnowledgeData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/rest/knowledge';
};

export type GetAllKnowledgeErrors = {
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
};

export type GetAllKnowledgeResponses = {
    /**
     * OK
     */
    200: Array<Knowledge>;
};

export type GetAllKnowledgeResponse = GetAllKnowledgeResponses[keyof GetAllKnowledgeResponses];

export type AddFileSourceData = {
    body: {
        files?: Array<Blob | File>;
    };
    path?: never;
    query?: never;
    url: '/rest/knowledge/add/file';
};

export type AddFileSourceErrors = {
    /**
     * File upload is invalid.
     */
    400: unknown;
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
};

export type AddFileSourceResponses = {
    /**
     * OK. Returns the ids of the added knowledge.
     */
    201: Array<Uuid>;
};

export type AddFileSourceResponse = AddFileSourceResponses[keyof AddFileSourceResponses];

export type RetryFailedIngestionData = {
    body?: never;
    path: {
        /**
         * UID of the knowledge to retry the ingestion for
         */
        id: Uuid;
    };
    query?: never;
    url: '/rest/knowledge/retry/{id}/ingestion';
};

export type RetryFailedIngestionErrors = {
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
    /**
     * No knowledge with the given id found.
     */
    404: unknown;
};

export type RetryFailedIngestionResponses = {
    /**
     * OK.
     */
    200: unknown;
};

export type UpdateFileSourceData = {
    body: {
        file?: Blob | File;
    };
    path: {
        /**
         * UID of the knowledge to update
         */
        id: Uuid;
    };
    query?: never;
    url: '/rest/knowledge/update/{id}/file';
};

export type UpdateFileSourceErrors = {
    /**
     * File upload is invalid.
     */
    400: unknown;
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
    /**
     * No knowledge with the given id found.
     */
    404: unknown;
};

export type UpdateFileSourceResponses = {
    /**
     * OK.
     */
    200: unknown;
};

export type DeleteKnowledgeData = {
    body?: never;
    path: {
        /**
         * UID of the knowledge to delete
         */
        id: Uuid;
    };
    query?: never;
    url: '/rest/knowledge/{id}';
};

export type DeleteKnowledgeErrors = {
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
    /**
     * No knowledge with the given id found.
     */
    404: unknown;
};

export type DeleteKnowledgeResponses = {
    /**
     * OK
     */
    200: unknown;
};

export type GetKnowledgeData = {
    body?: never;
    path: {
        /**
         * UID of the knowledge to get
         */
        id: Uuid;
    };
    query?: never;
    url: '/rest/knowledge/{id}';
};

export type GetKnowledgeErrors = {
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
    /**
     * No knowledge with the given id found.
     */
    404: unknown;
};

export type GetKnowledgeResponses = {
    /**
     * OK
     */
    200: Knowledge;
};

export type GetKnowledgeResponse = GetKnowledgeResponses[keyof GetKnowledgeResponses];

export type GetKnowledgeFileData = {
    body?: never;
    path: {
        /**
         * UID of the knowledge to get the source file of
         */
        id: Uuid;
    };
    query?: never;
    url: '/rest/knowledge/{id}/file';
};

export type GetKnowledgeFileErrors = {
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
    /**
     * No knowledge with the given id found.
     */
    404: unknown;
};

export type GetKnowledgeFileResponses = {
    /**
     * OK
     */
    200: Blob | File;
};

export type GetKnowledgeFileResponse = GetKnowledgeFileResponses[keyof GetKnowledgeFileResponses];

export type SetKnowledgeLabelData = {
    body?: never;
    path: {
        /**
         * UID of the knowledge to set the label for
         */
        id: Uuid;
    };
    query: {
        /**
         * the knowledge label to set
         */
        label: string;
    };
    url: '/rest/knowledge/{id}/label';
};

export type SetKnowledgeLabelErrors = {
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
    /**
     * No knowledge with the given id found.
     */
    404: unknown;
};

export type SetKnowledgeLabelResponses = {
    /**
     * OK
     */
    200: unknown;
};

export type RemoveKnowledgePermissionData = {
    body?: never;
    path: {
        /**
         * UID of the knowledge to remove the permission from
         */
        id: Uuid;
        /**
         * name of user to remove permission for
         */
        username: string;
    };
    query?: never;
    url: '/rest/knowledge/{id}/permission/{username}';
};

export type RemoveKnowledgePermissionErrors = {
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
    /**
     * No knowledge with the given id found or no user with the given username found.
     */
    404: unknown;
};

export type RemoveKnowledgePermissionResponses = {
    /**
     * OK
     */
    200: unknown;
};

export type SetKnowledgePermissionData = {
    /**
     * permission to set
     */
    body: 'READWRITE' | 'READONLY';
    path: {
        /**
         * UID of the knowledge set permission for
         */
        id: Uuid;
        /**
         * name of user to set permission for
         */
        username: string;
    };
    query?: never;
    url: '/rest/knowledge/{id}/permission/{username}';
};

export type SetKnowledgePermissionErrors = {
    /**
     * Illegal permission modification
     */
    400: unknown;
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
    /**
     * No knowledge with the given id found or no user with the given username found.
     */
    404: unknown;
};

export type SetKnowledgePermissionResponses = {
    /**
     * OK
     */
    200: unknown;
};

export type RemoveKnowledgeTagData = {
    body?: never;
    path: {
        /**
         * UID of the knowledge to which the tag should be removed
         */
        id: Uuid;
    };
    query: {
        /**
         * tag to remove
         */
        tag: string;
    };
    url: '/rest/knowledge/{id}/tag';
};

export type RemoveKnowledgeTagErrors = {
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
    /**
     * No knowledge with the given id found.
     */
    404: unknown;
};

export type RemoveKnowledgeTagResponses = {
    /**
     * OK
     */
    200: unknown;
};

export type AddKnowledgeTagData = {
    body?: never;
    path: {
        /**
         * UID of the knowledge to which the tag should be added
         */
        id: Uuid;
    };
    query: {
        /**
         * tag to add
         */
        tag: string;
    };
    url: '/rest/knowledge/{id}/tag';
};

export type AddKnowledgeTagErrors = {
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
    /**
     * No knowledge with the given id found.
     */
    404: unknown;
};

export type AddKnowledgeTagResponses = {
    /**
     * OK
     */
    200: unknown;
};

export type DeleteUserDataData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/rest/user';
};

export type DeleteUserDataErrors = {
    /**
     * Bad Request. Returned when an operation is requested before the user is logged in.
     */
    400: unknown;
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
};

export type DeleteUserDataResponses = {
    /**
     * OK
     */
    200: unknown;
};

export type LoginData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/rest/user';
};

export type LoginErrors = {
    /**
     * Not Authorized
     */
    401: unknown;
    /**
     * Not Allowed
     */
    403: unknown;
};

export type LoginResponses = {
    /**
     * OK
     */
    200: UserInfoDto;
};

export type LoginResponse = LoginResponses[keyof LoginResponses];