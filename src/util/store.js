/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-09
 * @author Li <li@maichong.it>
 */

let store;
function setStore(rStore) {
  store = rStore;
}
function getStore() {
  return store;
}
export {getStore, setStore};
