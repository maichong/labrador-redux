# labrador-redux
***
绑定[labrador](https://github.com/maichong/labrador)小程序开源框架和redux数据管理器，让数据管理与传输更方便。
### 安装
---
```
npm install labrador-redux --save
```
### 使用方式
---
* Store
Store是数据存储仓库，用来存储和管理项目中所有的数据，派发Action,有数据变化时把新数据传递到页面中。每一个项目建议`只创建一个Store`,统一数据管理，数据流向清晰明朗。
##### Store定义
```
//app.js
import { createStore } from 'redux';//创建store
import { setStore } from 'labrador-redux'; //代管store
import reducer from './utils/reducer';/
let store = createStore(reducer);
setStore(store);
//注：为了让store最先创建，以便页面文件中的数据处理，所以本示例把创建store写到了小程序的入口文件app.js的class类之外，如果有更好的方法请联系@email:li@maichong.it
```
* Reducer
Reducer是变更store仓库中数据的地方，当有`Action被派发`，Redux会把数据传递到Reducer中，进行最后的数据检查，改变相应的数据。
`reducer`方法名最终会被`combineReducers`当做一个属性写入到store，属性值就是该方法的返回值。
#####Reducer定义
```
import {combineReducers} from 'redux';//组合多个reducer方法
import {
  LIST_ADD,
  LIST_REMOVE
} from '../utils/contracts';//常量，用来区分数据的作用
//reducer方法，根据不同的 Action type 改变store中不同的分支数据
function list(state = [], action) {
  if (action.type === LIST_ADD || action.type === LIST_REMOVE) {
    return action.list;
  }
  return state;
}

const reducer = combineReducers({ list });
export default reducer;
```
* Action
Action是数据变更处理的地方，如需要对数据进行操作、从后台获取数据等，请在Action中进行。使用者在需要改变数据并传递到其他界面的时候需要调用Action中的方法。

##### Action定义
```
import {getStore} from 'labrador-redux';
import {
  LIST_ADD,
  LIST_REMOVE
} from './contracts'; //常量，用来区分数据的作用

const store = getStore(); //获取store，主要使用store的dispatch方法

//Action 用来添加一条记录
export function add(text) {
  let list = [].concat(store.getState().list);
  let id = 0;
  if (list.length > 0) {
    id = list[list.length - 1].id+1;
  }
  let item = { id, text };
  list.push(item);
  //数据处理请在该方法的本注释之前编写
  store.dispatch({
    type: LIST_ADD,
    list //list 为最终要存储到store中的数据
  });//派发数据，type为必写属性，用来区分数据的作用
}
export function remove(id){
  let list =[].concat(store.getState().list);
  list.forEach((item,index) => {
    if(item.id === id){
      list.splice(index,1);
    }
  });
  store.dispatch({
    type:LIST_REMOVE,
    list
  })
}

```
* 页面中使用
定义好了`Store`、`Action`、`Reducer`之后，就可以在页面中使用了，在页面中使用`connect`方法告诉`labrador-redux`本页面需要的数据，`当该数据有变化的时候`，会调用当前页面中的`onUpdate`方法。
##### 页面使用示例
```
import { Component, PropTypes } from 'labrador';
import { connect } from 'labrador-redux';

const { array } = PropTypes;

class Index extends Component {

  static propTypes = { //定义props中的数据类型
    list: array
  };

  constructor(props) {
    super(props);
    this.state = { //初始化state
      list: props.list || []
    };
  }
   onUpdate(props) { //当数据有变化时该方法会被触发
    this.setState({ list: props.list || [] });
  }
  
  ...  //页面中的其他逻辑
  ...
}
//list 为当前页面需要的数据，与reducer中的list方法名对应，
//contect参数请保持为一个方法，如例：
//({ dataA, dataB }) => ({ dataA, dataB });
//dataA 和dataB为reducer中对应的方法名，
//当数据改变时，会给onUpdate方法传入一个对象：{ dataA, dataB }
export default connect(({ list }) => ({ list }))(Index);
```
### 接口说明

---
|props    |type | Description|
|---------|:----|:-----------|
|getStore|Function|获取labrador-redux中存储的store,store可以用来存储数据，派发数据等。|
|setStore|Function|设置store,每一个项目建议`只创建一个Store`,统一数据管理，数据流向清晰明朗。|
|connect|Function|连接redux和labrador项目页面，实时更新数据|


---
#### 关于页面和组件间相互传值以及该组件所依赖的基础框架详见[labrador](https://github.com/maichong/labrador);
---
