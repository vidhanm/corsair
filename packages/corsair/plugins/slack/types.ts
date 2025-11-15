import { BaseConfig } from '../../config'

export interface SlackPlugin {
  /**
   * Slack API token
   */
  token: string
  /**
   * All channels.
   * `[{
   *   'name-of-channel': 'id-of-channel'
   * }]`
   */
  channels?: Record<string, string>

  /**
   * People
   * `[{
   *   'name-of-person': 'id-of-person'
   * }]`
   */
  members?: Record<string, string>
}

export type SlackChannels<T extends BaseConfig> = keyof NonNullable<
  T['plugins']
>['slack']['channels'] &
  string

export type SlackMembers<T extends BaseConfig> = keyof NonNullable<
  T['plugins']
>['slack']['members'] &
  string

// Message timestamp type (Slack uses this for message IDs)
export type MessageTs = string

// Emoji name type
export type EmojiName = string

// Response type for sendMessage, replyToThread, and updateMessage operations
export interface MessageResponse {
  success: boolean
  data?: {
    messageId: MessageTs
    channel: string
    timestamp: MessageTs
  }
  error?: string
}

// Response type for getMessages operation
export interface MessagesResponse {
  success: boolean
  data?: {
    messages: Array<{
      type: string
      user?: string
      text: string
      ts: MessageTs
      thread_ts?: MessageTs
    }>
    hasMore: boolean
    nextCursor?: string
  }
  error?: string
}

// Response type for addReaction operation
export interface ReactionResponse {
  success: boolean
  data?: {
    ok: boolean
  }
  error?: string
}

// Response type for getChannels operation
export interface ChannelsResponse {
  success: boolean
  data?: {
    channels: Array<{
      id: string
      name: string
      is_private: boolean
      is_archived: boolean
    }>
    hasMore: boolean
    nextCursor?: string
  }
  error?: string
}
