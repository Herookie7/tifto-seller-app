import { gql } from "@apollo/client";

export const GET_ORDERS = gql`
  query Orders {
    restaurantOrders {
      _id
      orderId
      restaurant {
        _id
        name
        image
        address
        location {
          coordinates
        }
      }
      deliveryAddress {
        location {
          coordinates
        }
        deliveryAddress
        details
        label
      }
      items {
        _id
        title
        description
        image
        quantity
        specialInstructions

        variation {
          _id
          title
          price
          discounted
        }
        addons {
          _id
          options {
            _id
            title
            description
            price
          }
          description
          title
          quantityMinimum
          quantityMaximum
        }
        specialInstructions
        isActive
        createdAt
        updatedAt
      }
      user {
        _id
        name
        phone
        email
      }
      paymentMethod
      paidAmount
      orderAmount
      orderStatus
      tipping
      taxationAmount
      status
      paymentStatus
      reason
      isActive
      createdAt
      orderDate
      pickedAt
      deliveryCharges
      isPickedUp
      preparationTime
      acceptedAt
      isRinged
      instructions
      rider {
        _id
        name
        username
        available
      }
    }
  }
`;
