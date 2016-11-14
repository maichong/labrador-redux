/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-09
 * @author Li <li@maichong.it>
 */
// @flow
import shallowEqual from './util/shallowEqual';
import {getStore} from './util/store';

const defaultMapStateToProps:Function = state =>({});

export default function connect(mapStateToProps) {
  const shouldSubscribe:Boolean = Boolean(mapStateToProps);
  const mapState:Function = mapStateToProps || defaultMapStateToProps;
  
  return function wrapWithConnect(component) {
    let changeFunc:Function;
    if(!!component.prototype.onStateChange && typeof component.prototype.onStateChange === 'function'){
      changeFunc = component.prototype.onStateChange;
    }else if(!!component.prototype.onStateChange){
      console.error(`变量名冲突：在"${component.name}.js"中已存在onStateChange方法！`);
    }
    component.prototype.onStateChange = function () {
      if (!this.unSubscribe || !this.state) {
        return;
      }
      let preState:$DataMap = mapState(this.state);
      let state:$DataMap = mapState(getStore().getState());
      if (shallowEqual(state, preState)) {
        return;
      }
      this.setState(state);
      if(!!changeFunc){
        changeFunc(...arguments);
      }
    };
    let func:Function = component.prototype.onLoad;
    component.prototype.onLoad = function () {
      let store:$DataMap = getStore();
      if(!store){
        console.error('store对象不存在,请前往"app.js"文件中使用"redux"创建store,并传参到"labrador-redux"的setStore()方法中');
      }
      if (shouldSubscribe) {
        this.unSubscribe = store.subscribe(this.onStateChange.bind(this));
        this.onStateChange.apply(this);
      }
      func.call(this,...arguments);
    };
    
    return component;
  }
}
;
