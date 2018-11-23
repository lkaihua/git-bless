const store = {};
export function hash(key, len = 6) {

  function random(l) {
    const chars = 'abcdef0123456789'.split('');
    const results = [];
    for (let i = 0; i < l; i += 1) {
      results.push(chars[Math.floor(Math.random() * chars.length)])
    }
    return results.join("")
  }

  let result;

  if (store[key]) {
    result = store[key];
  } else {
    result = random(len);
    store[key] = result;
  }

  return result;
}