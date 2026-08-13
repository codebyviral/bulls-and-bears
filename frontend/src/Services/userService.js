import { toast } from "react-toastify";
import api from "./apiClient";
import apiPublic from "./apiPublic";

export async function signinUser(email, password) {
  const response = await api.post(`/api/user/login`, {
    Email: email,
    Password: password,
  });
  return response.data;
}

export async function signupUser(fullName, email, password) {
  if (email.includes("pdpu")) {
    toast(`PDEU Email ID is disabled!`);
    return { status: 400, msg: "PDEU Account is not Allowed!" };
  }
  const response = await apiPublic.post(`/api/user/signup`, {
    fullName,
    Email: email,
    Password: password,
  });
  return response.data;
}

export async function getUser(userId) {
  const response = await api.get(`/api/user/me/${userId}`);
  return response.data;
}

export async function sendOTP(email) {
  const response = await apiPublic.post(`/api/user/otp-for-password`, {
    Email: email,
  });
  return response.data;
}

export async function verifyOTP(email, otp) {
  const response = await apiPublic.post(`/api/user/verify-email`, {
    Email: email,
    userOtp: otp,
  });
  console.log("🚀 ~ verifyOTP ~ response:", response);
  return response.json;
}

export async function resetPassword(email, password) {
  const response = await apiPublic.post(`/api/user/reset-password`, {
    Email: email,
    newPassword: password,
  });
  console.log("🚀 ~ resetPassword ~ response:", response);
  return response;
}

export async function resendOTP(email) {
  const response = await apiPublic.post(`/api/user/otp-for-password`, {
    Email: email,
  });
  console.log("🚀 ~ resendOTP ~ response:", response);
  return response;
}

export async function logout() {
  const response = await apiPublic.post(`/api/user/logout`);
  return response;
}
