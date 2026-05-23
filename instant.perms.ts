// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react-native";

const rules = {
  profiles: {
    allow: {
      view: "true",
      create: "auth.id != null && auth.id in data.ref('user.id')",
      update: "auth.id != null && auth.id in data.ref('user.id')",
      delete: "false",
    },
  },
  constituencies: {
    allow: {
      view: "true",
      create: "false",
      update: "false",
      delete: "false",
    },
  },
  messages: {
    allow: {
      view: "auth.id != null",
      create: "auth.id != null && auth.id in data.ref('author.user.id')",
      update: "false",
      delete: "auth.id != null && auth.id in data.ref('author.user.id')",
    },
  },
} satisfies InstantRules;

export default rules;
