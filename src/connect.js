/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-11-09
 * @author Li <li@maichong.it>
 */
// @flow

import type { Component } from 'labrador';
import * as utils from 'labrador/utils';
import { getStore } from './util/store';
import wrapActionCreators from './util/wrapActionCreators';

const defaultMapStateToProps: Function = () => ({});
const defaultMapDispatchToProps:Function = (dispatch) => ({dispatch});
const defaultMergeProps: Function = (stateProps, dispatchProps, parentProps) => ({
  ...parentProps,
  ...stateProps,
  ...dispatchProps
});

export default function connect(mapStateToProps: Function, mapDispatchToProps: Function | Object, mergeProps: Function) {
  const shouldSubscribe: boolean = !!mapStateToProps;
  mapStateToProps = mapStateToProps || defaultMapStateToProps;
  if (typeof mapDispatchToProps !== 'function') {
    if (mapDispatchToProps) {
      mapDispatchToProps = wrapActionCreators(mapDispatchToProps);
    } else {
      mapDispatchToProps = defaultMapStateToProps;
    }
  } 

  mergeProps = mergeProps || defaultMergeProps;

  return function wrapWithConnect(component: Component) {
    if (!shouldSubscribe && mapDispatchToProps === defaultMapStateToProps) {
      return component;
    }
    let unSubscribe: Function;
    let onLoad: Function = component.prototype.onLoad;
    let onUnload: Function = component.prototype.onUnload;
    let constructor: Function = component.prototype.constructor;
    let connected = false;

    function onStateChange() {
      const store = getStore();
      let mappedProps: $DataMap = mapStateToProps(store.getState());
      if (connected && !utils.shouldUpdate(this.props, mappedProps)) {
        return;
      }
      let dispatchProps = mapDispatchToProps(store.dispatch);
      let nextProps: $DataMap = mergeProps(mappedProps, dispatchProps, this.props);
      if (this.onUpdate) {
        this.onUpdate(nextProps);
        if (__DEV__) {
          // Development
          console.log('%c%s onUpdate(%o) Component:%o',
            'color:#2a8f99',
            this.id, utils.getDebugObject(nextProps),
            this
          );
        }
      }
      this.props = nextProps;
      this._update();
    }
    
    component.prototype.constructor = (props) => {
      let store: $DataMap = getStore();
      if (!store) {
        console.error('store对象不存在,请前往"app.js"文件中使用"redux"创建store,并传参到"labrador-redux"的setStore()方法中');
      }

      let mappedProps: $DataMap = mapStateToProps(store.getState());
      let dispatchProps = mapDispatchToProps(store.dispatch);
      let nextProps: $DataMap = mergeProps(mappedProps, dispatchProps, props);

      constructor.apply(this, nextProps);
    };

    component.prototype.onLoad = function (...args) {
      let store: $DataMap = getStore();
      if (!store) {
        console.error('store对象不存在,请前往"app.js"文件中使用"redux"创建store,并传参到"labrador-redux"的setStore()方法中');
      }
      if (shouldSubscribe) {
        // 如果指定了 mapDispatchToProps 参数才监听store
        unSubscribe = store.subscribe(onStateChange.bind(this));
      }
      onStateChange.call(this);
      if (onLoad) {
        onLoad.apply(this, args);
      }
    };

    component.prototype.onUnload = function () {
      if (unSubscribe) {
        unSubscribe();
      }
      if (onUnload) {
        onUnload.call(this);
      }
    };

    return component;
  };
}
