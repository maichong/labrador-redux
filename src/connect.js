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
    if (!!component.prototype._onStateChange && typeof component.prototype._onStateChange === 'function') {
      changeFunc = component.prototype._onStateChange;
    } else if (!!component.prototype._onStateChange) {
      console.error(`变量名冲突：在"${component.name}.js"中已存在onStateChange方法！`);
    }
    component.prototype._onStateChange = function () {
      if (!this.__unSubscribe || !this.state) {
        return;
      }
      let preState:$DataMap = mapState(this.state);
      let state:$DataMap = mapState(getStore().getState());
      if (shallowEqual(state, preState)) {
        console.log('a====a');
        return;
      }
      console.log('a!===a');
      let nextProps:$DataMap;
      if (this.props && this.props.merge) {
        nextProps = this.props.merge(state);
      } else {
        nextProps = Object.assign({}, this.props, state);
      }
      if (this.onUpdate) {
        this.onUpdate(nextProps);
      }
      this.props = nextProps;
      if (!!changeFunc) {
        changeFunc(...arguments);
      }
    };
    let func:Function = component.prototype.onLoad;
    component.prototype.onLoad = function () {
      let store:$DataMap = getStore();
      if (!store) {
        console.error('store对象不存在,请前往"app.js"文件中使用"redux"创建store,并传参到"labrador-redux"的setStore()方法中');
      }
      if (shouldSubscribe) {
        this.__unSubscribe = store.subscribe(this._onStateChange.bind(this));
        this._onStateChange.apply(this);
      }
      if(!!func){
        func.apply(this, arguments);
      }
    };

    return component;
  }
}
;
