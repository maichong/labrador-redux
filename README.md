# labrador-redux
***
绑定[labrador](https://github.com/maichong/labrador)和redux,提高性能和灵活性。
### 安装
---
```
npm install labrador-redux --save
```
### 要点
---
应用中所有的 state 都以一个对象树的形式储存在一个单一的 *store* 中。
惟一改变 state 的办法是触发* action*，一个描述发生什么的对象。
为了描述 action 如何改变 state 树，你需要编写 	*reducers*。

### Action
**Action** 是把数据从应用传到 store 的有效载荷。它是 store 数据的**唯一**来源。一般来说你会通过 ```store.dispatch()``` 将 action 传到 store。

添加新 todo 任务的 action 是这样的：
```
const ADD_TODO = 'ADD_TODO'
```
```
{
  type: ADD_TODO,
  text: 'Build my first labrador-redux app'
}
```
Action 本质上是 JavaScript 普通对象。我们约定，action 内必须使用一个字符串类型的 `type` 字段来表示将要执行的动作。多数情况下，`type` 会被定义成字符串常量。当应用规模越来越大时，建议使用单独的模块或文件来存放 action。
```
import { ADD_TODO, REMOVE_TODO } from '../actionTypes'
```
>样板文件使用提醒
>
>使用单独的模块或文件来定义 action type 常量并不是必须的，甚至根本不需要定义。对于小应用来说，使用字符串做 action type 更方便些。不过，在大型应用中把它们显式地定义成常量还是利大于弊的。参照 减少样板代码 获取更多保持代码简洁的实践经验。

除了` type` 字段外，action 对象的结构完全由你自己决定。参照 [Flux 标准 Action](https://github.com/acdlite/flux-standard-action) 获取关于如何构造 action 的建议。
**我们应该尽量减少在 action 中传递的数据。**
#### Action 创建函数
---
**Action 创建函数** 就是生成 action 的方法。“action” 和 “action 创建函数” 这两个概念很容易混在一起，使用时最好注意区分。

在 labrador-redux 中的 action 创建函数只是简单的返回一个 action:
```
function addTodo(text) {
  return {
    type: ADD_TODO,
    text
  }
}
```
或者创建一个 **被绑定的 action 创建函数** 来自动 dispatch：
```
const boundAddTodo = (text) => dispatch(addTodo(text))
const boundCompleteTodo = (index) => dispatch(completeTodo(index))
```
然后直接调用它们：
```
boundAddTodo(text);
boundCompleteTodo(index);
```
store 里能直接通过``` store.dispatch()``` 调用``` dispatch()``` 方法，但是多数情况下你会使用 labrador-redux 提供的 connect() 帮助器来调用。```bindActionCreators()```可以自动把多个 action 创建函数 绑定到 ```dispatch()``` 方法上。
#### Action源码
```
import {getStore} from 'labrador-redux';
import {
  LIST_ADD,
  LIST_REMOVE
} from './contracts'; 

const store = getStore(); 

export function add(text) {
  let list = [].concat(store.getState().list);
  let id = 0;
  if (list.length > 0) {
    id = list[list.length - 1].id+1;
  }
  let item = { id, text };
  list.push(item);
  store.dispatch({
    type: LIST_ADD,
    list 
  });
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
### Reducer
---
Action 只是描述了**有事情发生了**这一事实，并没有指明应用如何更新 state。而这正是 **reducer** 要做的事情。
#### 设计 State 结构
---
在 **labrador-redux** 应用中，所有的 state 都被保存在一个单一对象中。建议在写代码前先想一下这个对象的结构。如何才能以最简的形式把应用的 state 用对象描述出来？
>处理 Reducer 关系时的注意事项
>
>开发复杂的应用时，不可避免会有一些数据相互引用。建议你尽可能地把 state 范式化，不存在嵌套。把所有数据放到一个对象里，每个数据以 ID 为主键，不同实体或列表间通过 ID 相互引用数据。把应用的 state 想像成数据库。这种方法在 normalizr 文档里有详细阐述。例如，实际开发中，在 state 里同时存放 todosById: { id -> todo } 和 todos: array\<id\> 是比较好的方式，本文中为了保持示例简单没有这样处理。

#### Action 处理
---
现在我们已经确定了 state 对象的结构，就可以开始开发 reducer。reducer 就是一个纯函数，接收旧的 state 和 action，返回新的 state。
```
(previousState, action) => newState
```
之所以称作 reducer 是因为它将被传递给 ```Array.prototype.reduce(reducer, ?initialValue)``` 方法。保持 reducer 纯净非常重要。**永远不要**在 reducer 里做这些操作：

* 修改传入参数；
* 执行有副作用的操作，如 API 请求和路由跳转；
* 调用非纯函数，如` Date.now() `或 `Math.random()`。

**需要谨记 reducer 一定要保持纯净。只要传入参数相同，返回计算得到的下一个 state 就一定相同。没有特殊情况、没有副作用，没有 API 请求、没有变量修改，单纯执行计算。**

明白了这些之后，就可以开始编写 reducer，并让它来处理之前定义过的 action。

我们将以指定 state 的初始状态作为开始。labrador-redux 首次执行时，state 为 undefined，此时我们可借机设置并返回应用的初始 state。
```javascript
import {
  LIST_ADD,
  LIST_REMOVE
} from '../utils/contracts';
function list(state = [], action) {
  if (action.type === LIST_ADD || action.type === LIST_REMOVE) {
    return Object.assign({},...state,action.list);
  }
  return state;
}
```
这里一个技巧是使用 ES6 参数默认值语法 来精简代码。

注意:

* 不要修改 state。 使用 ```Object.assign() ```新建了一个副本。不能这样使用 ```Object.assign(state, { visibilityFilter: action.filter })```，因为它会改变第一个参数的值。你必须把第一个参数设置为空对象。你也可以开启对ES7提案对象展开运算符的支持, 从而使用``` { ...state, ...newState } ```达到相同的目的。

* 在`default` 情况下返回旧的 `state`。遇到未知的 action 时，一定要返回旧的 `state`。

> **Object.assign 须知**
>
>Object.assign() 是 ES6 特性，但多数浏览器并不支持。你要么使用 polyfill，Babel 插件，或者使用其它库如 _.assign() 提供的帮助方法。
>
>switch 和样板代码须知
>
>switch 语句并不是严格意义上的样板代码。Flux 中真实的样板代码是概念性的：更新必须要发送、Store 必须要注册到 Dispatcher、Store 必须是对象（开发同构应用时变得非常复杂）。为了解决这些问题，labrador-redux 放弃了 event emitters（事件发送器），转而使用纯 reducer。

随着应用的膨胀，我们还可以将不同的 `reducer` 放到不同的文件中, 以保持其独立性并用于专门处理不同的数据域。

最后，labrador-redux 提供了` combineReducers()` 方法，用于组合不同的reducer,
```javascript
import create from './createReducer';
import update from './updateReducer';
import list from './listReducer';
let reducer = combineReducers({
	create,
	update,
	list
});
```
你也可以给它们设置不同的 key，或者调用不同的函数。
```javascript
let reducer = combineReducers({
	a : create,
	b : update,
	c : list
});
```
```
function reducer(state = {}, action) {
  return {
    a: doSomethingWithA(state.a, action),
    b: processB(state.b, action),
    c: c(state.c, action)
  }
}
```
### Store
---
在前面，我们学会了使用 action 来描述“发生了什么”，和使用 reducers 来根据 action 更新 state 的用法。

**Store** 就是把它们联系到一起的对象。Store 有以下职责：

* 维持应用的 state；
* 提供` getState()` 方法获取 state；
* 提供 `dispatch(action)` 方法更新 state；
* 通过 `subscribe(listener)` 注册监听器;
* 通过 `subscribe(listener)` 返回的函数注销监听器。

再次强调一下 **labrador-redux 应用只有一个单一的 store**。当需要拆分数据处理逻辑时，你应该使用 reducer 组合 而不是创建多个 store。

根据已有的 reducer 来创建 store 是非常容易的。在前面，我们使用 	`combineReducers() `将多个 reducer 合并成为一个。现在我们将其导入，并传递 `createStore()`。
```
//app.js
import { createStore } from 'redux';
import { setStore } from 'labrador-redux'; 
import reducer from './utils/reducer';/
let store = createStore(reducer);
setStore(store);
```


### 页面中使用
---
定义好了**Store**、**Action**、**Reducer**之后，就可以在页面中使用了，在页面中使用`connect()`方法告诉 `labrador-redux` 本页面需要的数据，**当该数据有变化的时候**，会调用当前页面中的`onUpdate()`方法。
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
export default connect(({ list }) => ({ list }))(Index);
```
list 为当前页面需要的数据，与 `reducer` 中的list方法名对应，`contect()`方法的参数请保持为一个方法，
```
({ dataA, dataB }) => ({ dataA, dataB });
```
dataA 和dataB为 reducer 中对应的方法名，当数据改变时，会给`onUpdate()`方法传入一个对象：`{ dataA, dataB }`。
#### 关于页面和组件间相互传值以及该组件所依赖的基础框架详见[labrador](https://github.com/maichong/labrador);
---
