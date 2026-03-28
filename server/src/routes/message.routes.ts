import express from "express";
import { authenticated } from "@/middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "@/middlewares/validate.middleware";
import * as messageController from "@/controllers/message.controller";
import {
  channelIdParamSchema,
  emojiParamSchema,
  messageIdParamSchema,
} from "@/validations/common";
import {
  sendMessageSchema,
  editMessageSchema,
  getMessagesSchema,
  reactionSchema,
} from "@/validations/message.validation";

const messageRouter = express.Router();

// ALL ROUTES REQUIRE AUTHENTICATION
messageRouter.use(authenticated);

// ─── Channel message routes

// Create a new message in a channel
messageRouter.post(
  "/channels/:channelId/messages",
  validateParams(channelIdParamSchema),
  validateBody(sendMessageSchema),
  messageController.createMessage,
);

// Get pinned messages — registered BEFORE /:channelId/messages to avoid
// "pinned" being captured as a pagination query on the general messages route
messageRouter.get(
  "/channels/:channelId/messages/pinned",
  validateParams(channelIdParamSchema),
  messageController.getPinnedMessages,
);

// Get messages from a channel (paginated)
// FIX: was validateParams(getMessagesSchema) — getMessagesSchema is a query
// schema (page, limit, before, after), not a params schema. Changed to validateQuery.
messageRouter.get(
  "/channels/:channelId/messages",
  validateParams(channelIdParamSchema),
  validateQuery(getMessagesSchema),
  messageController.getChannelMessages,
);

// ─── Single message routes

// Get a single message by ID
messageRouter.get(
  "/messages/:messageId",
  validateParams(messageIdParamSchema),
  messageController.getMessage,
);

// Update / Edit a message
messageRouter.patch(
  "/messages/:messageId",
  validateParams(messageIdParamSchema),
  validateBody(editMessageSchema),
  messageController.updateMessage,
);

// Delete a message
messageRouter.delete(
  "/messages/:messageId",
  validateParams(messageIdParamSchema),
  messageController.deleteMessage,
);

// Pin / Unpin a message
messageRouter.patch(
  "/messages/:messageId/pin",
  validateParams(messageIdParamSchema),
  messageController.togglePinMessage,
);

// ─── Reaction routes

// Add reaction to a message
messageRouter.post(
  "/messages/:messageId/reactions",
  validateParams(messageIdParamSchema),
  validateBody(reactionSchema),
  messageController.addReaction,
);

// Remove reaction from a message
messageRouter.delete(
  "/messages/:messageId/reactions/:emoji",
  validateParams(emojiParamSchema),
  messageController.removeReaction,
);

export { messageRouter };