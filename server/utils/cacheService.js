import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

export const get = (key) => {
  return cache.get(key);
};

export const set = (key, val, ttl) => {
  return cache.set(key, val, ttl);
};

export const del = (keys) => {
  return cache.del(keys);
};

export const flush = () => {
  return cache.flushAll();
};

// export default cache;
