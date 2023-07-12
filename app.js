import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import { Client, Partials, GatewayIntentBits } from 'discord.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

const client = new Client({
  // intents: ['GUILD_PRESENCES', 'GUILD_MEMBERS', Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
  intents: [
    1, 2, 512, 32768,
    // GatewayIntentBits.Guilds,
    // GatewayIntentBits.GuildMembers,
    // GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const TOKEN = process.env.DISCORD_TOKEN;
const test1_channel = 1127861311867469856;
const sui_community_channel = 1128216639893147668;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
  console.log('interactionCreate');
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  console.log('messageCreate author', message.author, 'content', message.content);
  const channel = message.channel;
  if (message.content === 'aaa') {
    message.author.send("Hi! What's your name?")
      .then((start) => {
        console.log('in send response start ', start);
      });
  }
  const channel1 = await client.channels.fetch(test1_channel);
  const channel2 = await client.channels.cache.get(test1_channel);
  const channel3 = await client.channels.cache.find(channel => {
    console.log('channel id', channel.id);
  });
  console.log('channel1.name', channel1.name, 'channel2.name', channel2.name);

  // message.channel
  //   .awaitMessages({ true , max: 1, time: 50000, errors: ['time'] })
  //   .then((name) => {
  //     message.author.send(`Pleased to meet you, ${name}!`);
  //   })
  //   .catch((err) => message.author.send("There's been an error or you've timed out! Try again with `start dialogue`!"));
});
client.on('message', async (message) => {
  console.log('@@@ message @@@');
});

client.login(TOKEN);

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;
  console.log('type', type, 'id', id, 'data', data);

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: 'hello world sdfsdf' + getRandomEmoji(),
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
