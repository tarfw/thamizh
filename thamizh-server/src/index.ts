import { schema, t, table, SenderError } from "spacetimedb/server";

const user = table(
  { name: "user", public: true },
  {
    identity: t.identity().primaryKey(),
    displayName: t.string(),
    handle: t.string(),
    avatarUrl: t.string().optional(),
    online: t.bool(),
    lastSeen: t.timestamp(),
  }
);

const message = table(
  { name: "message", public: true },
  {
    sender: t.identity(),
    roomType: t.string(),
    roomId: t.string(),
    body: t.string(),
    sent: t.timestamp(),
    parentId: t.u64().optional(),
  }
);

const reaction = table(
  { name: "reaction", public: true },
  {
    messageSent: t.timestamp(),
    messageSender: t.identity(),
    sender: t.identity(),
    emoji: t.string(),
  }
);

const privateChat = table(
  { name: "private_chat", public: true },
  {
    roomId: t.string().primaryKey(),
    participantA: t.identity(),
    participantB: t.identity(),
    lastMessageAt: t.timestamp(),
  }
);

const groupChat = table(
  { name: "group_chat", public: true },
  {
    id: t.u64().primaryKey(),
    name: t.string(),
    createdBy: t.identity(),
    createdAt: t.timestamp(),
  }
);

const groupMember = table(
  { name: "group_member", public: true },
  {
    groupId: t.u64(),
    memberId: t.identity(),
  }
);

function validateMessage(text: string) {
  if (!text) throw new SenderError("Message must not be empty");
  if (text.length > 2000) throw new SenderError("Message too long (max 2000 chars)");
}

function validateName(name: string) {
  if (!name) throw new SenderError("Name must not be empty");
  if (name.length > 50) throw new SenderError("Name too long (max 50 chars)");
}

const spacetimedb = schema({
  user,
  message,
  reaction,
  privateChat,
  groupChat,
  groupMember,
});

export const set_display_name = spacetimedb.reducer(
  { displayName: t.string(), handle: t.string() },
  (ctx, { displayName, handle }) => {
    validateName(displayName);
    const existing = ctx.db.user.identity.find(ctx.sender);
    if (!existing) throw new SenderError("User not found");
    ctx.db.user.identity.update({ ...existing, displayName, handle });
  }
);

export const set_avatar_url = spacetimedb.reducer(
  { avatarUrl: t.string() },
  (ctx, { avatarUrl }) => {
    const existing = ctx.db.user.identity.find(ctx.sender);
    if (!existing) throw new SenderError("User not found");
    ctx.db.user.identity.update({ ...existing, avatarUrl });
  }
);

export const send_message = spacetimedb.reducer(
  { roomType: t.string(), roomId: t.string(), body: t.string(), parentId: t.u64().optional() },
  (ctx, { roomType, roomId, body, parentId }) => {
    validateMessage(body);
    ctx.db.message.insert({
      sender: ctx.sender,
      roomType,
      roomId,
      body,
      sent: ctx.timestamp,
      parentId: parentId ?? undefined,
    });
  }
);

export const edit_message = spacetimedb.reducer(
  { sent: t.timestamp(), body: t.string() },
  (ctx, { sent, body }) => {
    validateMessage(body);
    for (const msg of ctx.db.message.iter()) {
      if (msg.sender === ctx.sender && msg.sent === sent) {
        ctx.db.message.delete(msg);
        ctx.db.message.insert({ ...msg, body });
        return;
      }
    }
    throw new SenderError("Message not found");
  }
);

export const delete_message = spacetimedb.reducer(
  { sent: t.timestamp() },
  (ctx, { sent }) => {
    for (const msg of ctx.db.message.iter()) {
      if (msg.sender === ctx.sender && msg.sent === sent) {
        ctx.db.message.delete(msg);
        return;
      }
    }
    throw new SenderError("Message not found");
  }
);

export const add_reaction = spacetimedb.reducer(
  { messageSent: t.timestamp(), messageSender: t.identity(), emoji: t.string() },
  (ctx, { messageSent, messageSender, emoji }) => {
    if (!emoji) throw new SenderError("Emoji must not be empty");
    ctx.db.reaction.insert({ messageSent, messageSender, sender: ctx.sender, emoji });
  }
);

export const remove_reaction = spacetimedb.reducer(
  { messageSent: t.timestamp(), messageSender: t.identity(), emoji: t.string() },
  (ctx, { messageSent, messageSender, emoji }) => {
    for (const r of ctx.db.reaction.iter()) {
      if (r.messageSent === messageSent && r.messageSender === messageSender && r.sender === ctx.sender && r.emoji === emoji) {
        ctx.db.reaction.delete(r);
        break;
      }
    }
  }
);

export const create_private_chat = spacetimedb.reducer(
  { participantB: t.identity() },
  (ctx, { participantB }) => {
    const aHex = ctx.sender.toHexString();
    const bHex = participantB.toHexString();
    const roomId = aHex < bHex ? `${aHex}_${bHex}` : `${bHex}_${aHex}`;
    const existing = ctx.db.privateChat.roomId.find(roomId);
    if (existing) return roomId;
    ctx.db.privateChat.insert({ roomId, participantA: ctx.sender, participantB, lastMessageAt: ctx.timestamp });
    return roomId;
  }
);

export const create_group = spacetimedb.reducer(
  { name: t.string() },
  (ctx, { name }) => {
    validateName(name);
    const id = BigInt(Date.now());
    ctx.db.groupChat.insert({ id, name, createdBy: ctx.sender, createdAt: ctx.timestamp });
    ctx.db.groupMember.insert({ groupId: id, memberId: ctx.sender });
    return id;
  }
);

export const join_group = spacetimedb.reducer(
  { groupId: t.u64() },
  (ctx, { groupId }) => {
    const group = ctx.db.groupChat.id.find(groupId);
    if (!group) throw new SenderError("Group not found");
    for (const m of ctx.db.groupMember.iter()) {
      if (m.groupId === groupId && m.memberId === ctx.sender) return;
    }
    ctx.db.groupMember.insert({ groupId, memberId: ctx.sender });
  }
);

export const leave_group = spacetimedb.reducer(
  { groupId: t.u64() },
  (ctx, { groupId }) => {
    for (const m of ctx.db.groupMember.iter()) {
      if (m.groupId === groupId && m.memberId === ctx.sender) {
        ctx.db.groupMember.delete(m);
        break;
      }
    }
  }
);

export const init = spacetimedb.init((_ctx) => {});

export const onConnect = spacetimedb.clientConnected((ctx) => {
  const existing = ctx.db.user.identity.find(ctx.sender);
  if (existing) {
    ctx.db.user.identity.update({ ...existing, online: true, lastSeen: ctx.timestamp });
  } else {
    ctx.db.user.insert({
      identity: ctx.sender,
      displayName: `User_${ctx.sender.toHexString().slice(0, 6)}`,
      handle: "",
      avatarUrl: undefined,
      online: true,
      lastSeen: ctx.timestamp,
    });
  }
});

export const onDisconnect = spacetimedb.clientDisconnected((ctx) => {
  const existing = ctx.db.user.identity.find(ctx.sender);
  if (existing) {
    ctx.db.user.identity.update({ ...existing, online: false, lastSeen: ctx.timestamp });
  }
});

export default spacetimedb;
