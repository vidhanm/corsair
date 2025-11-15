import { z } from 'corsair'
import { procedure } from '../procedure'
import { SlackChannels } from 'corsair/plugins/types'
import { type Config } from '@/corsair.config'

export const sendSlackMessage = procedure
  .input(
    z.object({
      channel: z.string() as z.ZodType<SlackChannels<Config>>,
      message: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    // Use actual input values and await the async operation
    const result = await ctx.plugins.slack.sendMessage({
      channelId: input.channel,
      content: input.message,
    })

    return result
  })
