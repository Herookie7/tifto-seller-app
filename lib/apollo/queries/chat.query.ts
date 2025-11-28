import { gql } from "@apollo/client";

export const CHAT = gql`
  query Chat($order: String!) {
    chat(order: $order) {
      id
      orderId
      message
      createdAt
      user {
        _id
        name
      }
    }
  }
`;


