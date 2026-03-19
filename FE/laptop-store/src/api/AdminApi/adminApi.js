import { http } from "../../constants/config";
export const URL_DASHBOARD = "admin/dashboard";
export const URL_MANAGE_USER = "admin/users";
export const URL_MANAGE_ORDER = "admin/orders";
export const URL_GET_REVIEWS = "admin/reviews";
export const URL_UPDATE_REVIEW_STATUS = "admin/reviews"; // Sửa thành URL base, sẽ thêm /{id}/status sau
export const URL_REPLY_REVIEWS = "admin/reviews"; // Sửa thành URL base, sẽ thêm /{review_id}/reply sau
export const URL_MANAGE_REPLIES = "admin/reviews/replies"; // URL base cho quản lý replies

const adminApi = {
  getDashboard: function (access_token) {
    return http.get(`${URL_DASHBOARD}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
  // Quản lý ng dùng
  getListUser: function (access_token) {
    return http.get(`${URL_MANAGE_USER}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
  createUser: function (data, token) {
    return http.post(URL_MANAGE_USER, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  editUser: function (id, data, token) {
    return http.put(`${URL_MANAGE_USER}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  deleteUser: function (id, token) {
    return http.delete(`${URL_MANAGE_USER}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  searchUsers: function (keyword, token) {
    return http.get(`${URL_MANAGE_USER}?search=${keyword}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getListOrder: function (access_token) {
    return http.get(`${URL_MANAGE_ORDER}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },

  // Mới thêm: Lấy chi tiết của một đơn hàng
  getOrderDetail: function (access_token, orderId) {
    return http.get(`${URL_MANAGE_ORDER}/${orderId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },

  // Mới thêm: Cập nhật trạng thái đơn hàng
  updateOrderStatus: function (access_token, orderId, status, notes = null) {
    return http.patch(
      `${URL_MANAGE_ORDER}/${orderId}/status`,
      { status, notes },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
  },

  // Mới thêm: Cập nhật thông tin đơn hàng
  updateOrder: function (access_token, orderId, orderData) {
    return http.put(`${URL_MANAGE_ORDER}/${orderId}`, orderData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },

  // Mới thêm: Xóa đơn hàng
  deleteOrder: function (access_token, orderId) {
    return http.delete(`${URL_MANAGE_ORDER}/${orderId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },

  // Mới thêm: Tìm kiếm đơn hàng với các bộ lọc
  searchOrders: function (access_token, filters = {}) {
    // Chuyển đổi filters thành query params
    const queryParams = new URLSearchParams();
    if (filters.keyword) queryParams.append("keyword", filters.keyword);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.date_from) queryParams.append("date_from", filters.date_from);
    if (filters.date_to) queryParams.append("date_to", filters.date_to);
    if (filters.order_number)
      queryParams.append("order_number", filters.order_number);

    const url = queryParams.toString()
      ? `${URL_MANAGE_ORDER}/search?${queryParams.toString()}`
      : `${URL_MANAGE_ORDER}/search`;

    return http.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },

  // Lấy tất cả đánh giá với tùy chọn lọc
  getReviews: function (access_token, filters = {}) {
    // Chuyển đổi filters thành query params
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.product_id)
      queryParams.append("product_id", filters.product_id);

    const url = queryParams.toString()
      ? `${URL_GET_REVIEWS}?${queryParams.toString()}`
      : URL_GET_REVIEWS;

    return http.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },

  // Cập nhật trạng thái đánh giá (approved, rejected)
  updateReviewStatus: function (access_token, reviewId, status) {
    return http.patch(
      `${URL_UPDATE_REVIEW_STATUS}/${reviewId}/status`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
  },

  // Trả lời đánh giá
  replyToReview: function (access_token, reviewId, content) {
    return http.post(
      `${URL_REPLY_REVIEWS}/${reviewId}/reply`,
      { content },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
  },

  // Cập nhật phản hồi
  updateReply: function (access_token, replyId, content) {
    return http.put(
      `${URL_MANAGE_REPLIES}/${replyId}`,
      { content },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
  },

  // Xóa phản hồi
  deleteReply: function (access_token, replyId) {
    return http.delete(`${URL_MANAGE_REPLIES}/${replyId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
};

export default adminApi;
