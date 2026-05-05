import { http } from "../../../constants/config";

export const URL_ATTRIBUTE_VALUE = "admin/attribute-values";
export const URL_GET_ATTRIBUTE_VALUE = "attribute-values";

const attributeValueApi = {
  // 🔹 Tạo loại thuộc tính
  createAttributeValue: function (access_token, body) {
    return http.post(URL_ATTRIBUTE_VALUE, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },

  // 🔹 Lấy danh sách loại thuộc tính
  getListAttributeValues: function () {
    return http.get(URL_GET_ATTRIBUTE_VALUE, {});
  },

  // 🔹 Lấy loại thuộc tính theo ID
  getAttributeValueById: function (idAttributeValue) {
    return http.get(`${URL_GET_ATTRIBUTE_VALUE}/${idAttributeValue}`, {});
  },

  // 🔹 Cập nhật loại thuộc tính
  updateAttributeValue: function (access_token, idAttributeValue, body) {
    return http.put(`${URL_ATTRIBUTE_VALUE}/${idAttributeValue}`, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },

  // 🔹 Xóa loại thuộc tính
  deleteAttributeValue: function (access_token, idAttributeValue) {
    return http.delete(`${URL_ATTRIBUTE_VALUE}/${idAttributeValue}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
  // 🔍 Tìm kiếm loại thuộc tính
  searchAttributeValues: function (keyword) {
    return http.get(URL_GET_ATTRIBUTE_VALUE, {
      params: {
        search: keyword,
      },
    });
  },
};

export default attributeValueApi;
