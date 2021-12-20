const Discord = require('discord.js');
const ms = require('ms');

require('dotenv').config();

const allowedRanks = process.env.allowedRanks
const banCoolDowns = new Set();

/**
* @param {Discord.Message} message
* @param {Discord.Client} client
* @param {String[]} args
*/

exports.run = async(message, client, args) => {

    if(banCoolDowns.has(message.author.id)) {
        return message.channel.send(client.embedMaker(message.author, "Cooldown", `You're on cooldown! Please try to use this command again after ${Number(process.env.cooldown)} seconds since the last successful attempt`));
    }

    let req = client.request;
    if(req !== "No request") {
        return message.channel.send(client.embedMaker(message.author, "In Use", `Please wait.`));
    }

    let isAllowed = false;
    for(let i = 0; i < allowedRanks.length; i++) {
        if(message.member.roles.cache.some(role => [allowedRanks[i]].includes(role.name))) {
            isAllowed = true;
        }
    }

    if(isAllowed == false) {
        return message.channel.send(client.embedMaker(message.author, "No Permission", "You don't have permission to run this command"));
    }

    let username = args[0];
    if(!username) {
        return message.channel.send(client.embedMaker(message.author, "No Username Supplied", "You didn't supply a username for me to ban from the game"));
    }

    let reason = args.splice(1).join(" ");
    if(!reason) {
        return message.channel.send(client.embedMaker(message.author, "No Reason Supplied", "You didn't supply a reason for me to ban this user with"));
    }

    let newRequest = {
        author: message.author.tag,
        usernameToBan: username,
        reason: reason,

        type: "Ban",
        channelID: message.channel.id,
        authorID: message.author.id
    }

    client.request = newRequest;

    message.channel.send(client.embedMaker(message.author, "Sent Request"));
    banCoolDowns.add(message.author.id);

    let timeString = `${process.env.cooldown}s`;
    setTimeout(() => {
        banCoolDowns.delete(message.author.id);
    }, ms(timeString));
}

exports.help = async() => {
    let name = `**gban <username> <reason>**`;
    let description = "Bans the username supplied from your game with the reason supplied";
    return `${name} - ${description}\n`;
}