import { http } from "../../constants/config";

// User endpoints
export const URL_GET_ME = "auth/me";
export const URL_UPDATE_PROFILE = "user/profile";

// CarT endpoints
export const URL_GET_CART = "cart";
export const URL_ADD_TO_CART = "cart";
export const URL_UPDATE_CART = "cart";
export const URL_DELETE_CART = "cart";

// Order endpoints
export const URL_GET_ORDERS = "orders";
export const URL_CREATE_ORDER = "orders";
export const URL_CANCEL_ORDER = "orders";

// Invoice endpoints
export const URL_CREATE_INVOICE = "invoices";
export const URL_CREATE_INVOICE_PAY = "invoices/pay";
export const URL_GET_PAYMENT_STATUS = "invoices/payment-status";

// Review endpoints
export const URL_GET_REVIEWS = "reviews";
export const URL_GET_REVIEW_BY_ID = "reviews";
export const URL_CREATE_REVIEW = "reviews";
export const URL_UPDATE_REVIEW = "reviews";
export const URL_DELETE_REVIEW = "reviews";

const userApi = {
  // User APIs
  getMe: function (access_token) {
    return http.get(URL_GET_ME, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
  updateProfile: function (access_token, body) {
    return http.post(URL_UPDATE_PROFILE, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },

  // CarT APIs
  getCart: function (access_token) {
    return http.get(URL_GET_CART, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },

  addToCart: function (access_token, body) {
    return http.post(URL_ADD_TO_CART, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
  updateCart: function (access_token, cartId, body) {
    return http.put(`${URL_UPDATE_CART}/${cartId}`, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
  deleteCart: function (access_token, cartId) {
    return http.delete(`${URL_DELETE_CART}/${cartId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },

  // Order APIs
  getOrders: function (access_token, params = {}) {
    return http.get(URL_GET_ORDERS, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      params,
    });
  },
  createOrder: function (access_token, body) {
    return http.post(URL_CREATE_ORDER, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },

  cancelOrder: function (access_token, orderId, reason) {
    return http.post(
      `${URL_CANCEL_ORDER}/${orderId}/cancel`,
      { cancellation_reason: reason },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
  },

  // Invoice APIs
  createInvoice: function (access_token, idOrder) {
    console.log(access_token, idOrder);
    return http.post(
      `${URL_CREATE_INVOICE}/${idOrder}`,
      {},
      {
        // Body rỗng
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
  },

  createInvoicePay: function (access_token, idInvoices) {
    return http.get(`${URL_CREATE_INVOICE_PAY}/${idInvoices}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
  getPaymenStatus: function (access_token, invoice_number) {
    return http.get(
      `${URL_GET_PAYMENT_STATUS}?invoice_number=${invoice_number}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
  },

  // Review APIs
  getReviews: function (access_token, params = {}) {
    return http.get(URL_GET_REVIEWS, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      params,
    });
  },
  getReviewsByProduct: function (idProduct) {
    return http.get(`products/${idProduct}/${URL_GET_REVIEWS}`, {});
  },
  createReview: function (access_token, body) {
    console.log(body);
    return http.post(URL_CREATE_REVIEW, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
  updateReview: function (access_token, reviewId, body) {
    return http.put(`${URL_UPDATE_REVIEW}/${reviewId}`, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
  deleteReview: function (access_token, reviewId) {
    return http.delete(`${URL_DELETE_REVIEW}/${reviewId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
};

export default userApi;
