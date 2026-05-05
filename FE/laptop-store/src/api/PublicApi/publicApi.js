import { http } from "../../constants/config";

export const URL_LOGIN = "auth/login";
export const URL_REGISTER = "auth/register";

const publicApi = {
  // Đăng ký tài khoản
  register: function (registerData) {
    const body = {
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      password_confirmation: registerData.password,
      phone: registerData.phone,
      address: registerData.address,
    };
    return http.post(URL_REGISTER, body);
  },

  // Đăng nhập
  login: function (loginData) {
    const email = loginData.email;
    const password = loginData.password;
    return http.post(URL_LOGIN, { email, password });
  },
};

export default publicApi;
