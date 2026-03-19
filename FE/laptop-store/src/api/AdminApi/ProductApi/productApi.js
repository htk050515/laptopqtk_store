import { http } from "../../../constants/config";

export const URL_PRODUCT = "products";
export const URL_PRODUCT_SEARCH = "products/search";
export const URL_ADMIN_PRODUCT = "admin/product";
export const URL_ADMIN_PRODUCTS = "admin/products";
export const URL_PRODUCT_BY_CATEGORY = "products/category/slug"; // Sửa thành URL base, sẽ thêm /{slugCategory} sau

const productApi = {
  // 🔹 Tạo sản phẩm
  createProduct: function (access_token, body) {
    return http.post(URL_ADMIN_PRODUCT, body, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },

  // 🔹 Lấy danh sách sản phẩm
  getListProducts: function () {
    return http.get(URL_PRODUCT);
  },

  // 🔹 Lấy sản phẩm theo ID
  getProductById: function (idProduct) {
    return http.get(`${URL_PRODUCT}/${idProduct}`);
  },
  getProductByCategory: function (slugCategory) {
    return http.get(`${URL_PRODUCT_BY_CATEGORY}/${slugCategory}`);
  },

  // 🔹 Cập nhật sản phẩm
  updateProduct: function (access_token, idProduct, body) {
    return http.post(`${URL_ADMIN_PRODUCTS}/${idProduct}`, body, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },

  // 🔹 Xóa sản phẩm
  deleteProduct: function (access_token, idProduct) {
    return http.delete(`${URL_ADMIN_PRODUCTS}/${idProduct}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
  // 🔹 Tìm kiếm sản phẩm
  searchProducts: function (params = {}) {
    return http.get(URL_PRODUCT_SEARCH, {
      params: params,
    });
  },
};

export default productApi;
