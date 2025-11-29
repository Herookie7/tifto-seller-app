import { gql } from "@apollo/client";

export const SEND_CHAT_MESSAGE = gql`
  mutation SendChatMessage($orderId: ID!, $messageInput: ChatMessageInput!) {
    sendChatMessage(message: $messageInput, orderId: $orderId) {
      success
      message
      data {
        _id
        message
        user {
          _id
          name
        }
        createdAt
      }
    }
  }
`;
