// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react-native";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    profiles: i.entity({
      displayName: i.string(),
      createdAt: i.number().indexed(),
      bio: i.string().optional(),
      handle: i.string().optional(),
    }),
    constituencies: i.entity({
      code: i.string().unique().indexed(),
      slug: i.string().unique().indexed(),
      nameEn: i.string().indexed(),
      nameTa: i.string(),
      district: i.string().indexed(),
      number: i.number().indexed(),
      reservation: i.string().optional(),
    }),
    messages: i.entity({
      body: i.string(),
      createdAt: i.number().indexed(),
    }),
  },
  rooms: {},
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    profileUser: {
      forward: { on: "profiles", has: "one", label: "user" },
      reverse: { on: "$users", has: "one", label: "profile" },
    },
    profileConstituency: {
      forward: { on: "profiles", has: "one", label: "constituency" },
      reverse: { on: "constituencies", has: "many", label: "members" },
    },
    messageAuthor: {
      forward: { on: "messages", has: "one", label: "author", required: true },
      reverse: { on: "profiles", has: "many", label: "messages" },
    },
    messageConstituency: {
      forward: {
        on: "messages",
        has: "one",
        label: "constituency",
        required: true,
      },
      reverse: { on: "constituencies", has: "many", label: "messages" },
    },
  },
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
