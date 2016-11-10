/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-09
 * @author Li <li@maichong.it>
 */

import invariant from 'invariant';
import shallowEqual from './shallowEqual';
import {getStore} from './setStore';
const defaultMapStateToProps = state =>({});
export default function connect(mapStateToProps) {
  const shouldSubscribe = Boolean(mapStateToProps);
  const mapState = mapStateToProps || defaultMapStateToProps;
  return function wrapWithConnect(component) {
    class ReduxComponent extends component {
      onLoad() {
        // this.__proto__ = component.prototype;
        let keys = Object.getOwnPropertyNames(component.prototype);
        keys.forEach((prop)=> {
          if (!this[prop]) {
            if (typeof component.prototype[prop] === 'function') {
              this[prop] = function () {
                component.prototype[prop].apply(this, arguments);
              }
            } else {
              this[prop] = component.prototype[prop];
            }
          }
        });
        let store = getStore();
        invariant(store, 'store对象不存在');
        if (shouldSubscribe) {
          this.unSubscribe = store.subscribe(this.onStateChange.bind(this));
          this.onStateChange.apply(this);
        }
        super.onLoad(...arguments);
      }

      onStateChange() {
        if (!this.unSubscribe || !this.data) {
          return;
        }
        let preState = mapState(this.data);
        let state = mapState(getStore().getState());
        if (shallowEqual(state, preState)) {
          return;
        }
        this.setData(state);
      }
    }
    return ReduxComponent;
  }
}
;
