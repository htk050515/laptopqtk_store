import { http } from "../../../constants/config";

export const URL_CATEGORY = "categories";
export const URL_CREATE_CATEGORY = "admin/categories";

const categoryApi = {
  // Get me
  createCategory: function (access_token, body) {
    return http.post(URL_CREATE_CATEGORY, body, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
  getListCategories: function () {
    return http.get(URL_CATEGORY, {});
  },
  searchCategories: function (searchTerm = "") {
    return http.get(
      `${URL_CATEGORY}?search=${encodeURIComponent(searchTerm)}`,
      {}
    );
  },

  getCategoryById: function (idCategory) {
    return http.get(`${URL_CATEGORY}/${idCategory}`, {});
  },
  updateCategory: function (access_token, idCategory, body) {
    console.log("FormData:", Object.fromEntries(body.entries()));

    // ✅ Thêm `_method=PUT` để Laravel nhận diện đây là PUT request
    body.append("_method", "PUT");

    return http.post(`${URL_CREATE_CATEGORY}/${idCategory}`, body, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },

  deleteCategory: function (access_token, idCategory) {
    return http.delete(`${URL_CREATE_CATEGORY}/${idCategory}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
};

export default categoryApi;
