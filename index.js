import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import profileModel from './models/profileSchema.js';
import io from "socket.io-client";
const LAMPORTS_PER_SOL = 1000000000;

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const socket = io("wss://zfslil83jh.execute-api.us-east-1.amazonaws.com");

socket.on("connect", function () {
    console.log("Connected to websocket server");
});

socket.on("disconnect", function () {
    console.log("Disconnected from websocket server");
});

socket.on("listing", function (data) {

    const floor = (data.nft.floorPrice / LAMPORTS_PER_SOL).toFixed(2);
    const low = (data.nft.estimate.min / LAMPORTS_PER_SOL).toFixed(2);
    const high = (data.nft.estimate.max / LAMPORTS_PER_SOL).toFixed(2);

    const diff = data.price - data.nft.floorPrice;
    const message = `${data.nft.name} listed for ${(data.price / LAMPORTS_PER_SOL).toFixed(2)} SOL which is ${diff / LAMPORTS_PER_SOL} SOL above floor price of ${floor} SOL. Estimated value is between ${low} and ${high} SOL.`;
    const channelBad = client.channels.cache.get('1104738578925367296');
    const channelGood = client.channels.cache.get('1104154734195130458');
    const channel = diff < 1 ? channelGood : channelBad;
    const meLink = `https://magiceden.io/item-details/${data.nft.mint}`;
    console.log(message)
    // https://discordjs.guide/popular-topics/embeds.html#using-the-embed-constructor
    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(data.nft.name)
        .setDescription(message + '\n' + meLink)
        .setImage(data.nft.image)
        .setURL(meLink)
        .setTimestamp()
        .setFooter({ text: 'Go grab it at MagicEden', iconURL: 'https://magiceden.io/img/favicon/android-chrome-192x192.png' });

    channel.send({ embeds: [embed] });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // get user from db
    let profileData;
    try {
        profileData = await profileModel.findOne({ userID: interaction.user.id });
        if (!profileData) {
            let profile = await profileModel.create({
                userID: interaction.user.id,
                username: interaction.user.username,
                tag: interaction.user.tag,
                serverID: interaction.guild.id
            });
            profile.save();
        }

    } catch (err) {
        console.log(err);
    }
    if (interaction.commandName === 'ping') {
        console.log('ping received from', interaction.user.tag);
        await interaction.reply('Pong!');
    }


});
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err);
});


client.login(process.env.DISCORD_TOKEN);