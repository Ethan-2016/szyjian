/**
 * Created by sushi@szyjian.com
 */
import Cookies from 'js-cookie';

const TOKEN_KEY = 'yijian-token';

export function getToken() {
  return Cookies.get(TOKEN_KEY);
}

export function setToken(token) {
  return Cookies.set(TOKEN_KEY, token);
}

export function removeToken() {
  return Cookies.remove(TOKEN_KEY);
}