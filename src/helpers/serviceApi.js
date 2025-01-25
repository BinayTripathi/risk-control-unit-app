import axios from 'axios';

export const get = ({url, config}) => 
  axios.get(url, {...config, timeout: 20000});
export const post = ({url, config, data}) =>
  axios.post(url, data, {...config, timeout: 20000});
export const put = ({url, config, data}) =>
  axios.put(url, data, {...config, timeout: 20000});