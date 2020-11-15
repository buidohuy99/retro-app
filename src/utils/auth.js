import { createContext, useContext } from 'react';
import axios from 'axios';

export const accesstoken_keyname = process.env.REACT_APP_ACCESSTOKEN_KEYNAME;
export const refreshtoken_keyname = process.env.REACT_APP_REFRESHTOKEN_KEYNAME;

const AuthAxios = axios.create({
  validateStatus : (status) => {
    return (status >= 200 && status < 300) || (status === 304);
  }
});

const default_request_interceptor = AuthAxios.interceptors.request.use(
  config => {
    const { origin } = new URL(config.url);
    const allowedOrigins = [process.env.REACT_APP_API_URL];
    const access_token = localStorage.getItem(accesstoken_keyname);
    if (allowedOrigins.includes(origin) && access_token && access_token !== 'null') {
      config.headers['Authorization'] = `${access_token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

const setAccessToken = (data) => {
  localStorage.setItem(accesstoken_keyname, data);
}

const updateAccessToken = async () => {
  const refresh_token = localStorage.getItem(refreshtoken_keyname);
  if(!refresh_token || refresh_token === 'null') return null;
  try{
    const {access_token} = (await AuthAxios.post(process.env.REACT_APP_API_URL + '/users/refresh-token', {refreshToken: refresh_token})).data;
    setAccessToken(access_token);
    return access_token;
  }catch(e){
    setAccessToken(null);
    return null;
  }
}

const isUnAuthorizedError = (error) => {
  return error.config && error.response && error.response.status === 401;
}

const shouldRetry = (config) => {
  return config.retries.count < 3;
}

const default_response_interceptor = AuthAxios.interceptors.response.use(
  (res) => {
    return res;
  },
  async (error) => {
  error.config.retries = error.config.retries || { count: 0,};
  if (isUnAuthorizedError(error) && shouldRetry(error.config)) {
    const new_access = await updateAccessToken(); // refresh the access token
    error.config.retries.count++;
    
    if(new_access){
      error.config.headers['Authorization'] = `${new_access}`;
    }

    return AuthAxios.request(error.config); // if succeed in getting a new access token, re-fetch the original request with the updated accessToken
  }else if(isUnAuthorizedError(error) && !shouldRetry(error.config)){
    localStorage.removeItem(refreshtoken_keyname, null);
    localStorage.removeItem(accesstoken_keyname, null);
  }
  return Promise.reject(error);
});

export {AuthAxios};

export const removeInterceptorForeverFromAxios = () => {
  AuthAxios.interceptors.request.eject(default_request_interceptor);
  AuthAxios.interceptors.response.eject(default_response_interceptor);
}

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}