import axios from "axios";
import api from "./apiClient";
import apiPublic from "./apiPublic";

axios.defaults.withCredentials = true;

export async function getStockById(id) {
  const response = await api.get(`/api/share/candle-data/${id}`);
  return response;
}

export async function getRealizedPL(id) {
  if (id) {
    const response = await api.get(`/api/trade/realized/${id}`);
    return response;
  } else return;
}

export async function buyStock(userId, shareId, sharename, quantity, price) {
  const response = await api.post(`/api/trade/buy`, {
    userId,
    shareId,
    sharename,
    quantity,
    price,
  });
  return response;
}

export async function sellStock(userId, sharename, quantity, price) {
  const response = await api.post(`/api/trade/sell`, {
    userId,
    sharename,
    quantity,
    price,
  });
  return response;
}

export async function squareOffPositions(userId, sharename, price) {
  const response = await api.post(`/api/trade/squareoff`, {
    userId,
    sharename,
    price,
  });
  return response;
}

export async function shortSell(shareId,userId, sharename, quantity, price) {
  const response = await api.post(`/api/trade/short-sell`, {
    shareId,
    userId,
    sharename,
    quantity,
    price,
  });
  return response;
}

export async function shortCover(userId, sharename, buyPrice) {
  const response = await api.post(`/api/trade/cover-short`, {
    userId,
    sharename,
    buyPrice,
  });
  return response;
}

export async function getIpoStatus(userId) {
  const response = await api.get(`ipo/getAllocatedUser/${userId}`);
  return response;
}
