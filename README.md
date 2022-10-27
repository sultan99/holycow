# Holy State
> Hook-based state management library for [React](https://github.com/facebook/react) applications.

<br/>
<br/>
<div align="center">
  <img src="./holy-cow.png" width="160px">
</div>
<br/>
<br/>
<br/>

## Quick intro
Holy moly, you are here! You're more than welcome!

So, it is all about state management handled by hooks. Think of it as a utility for creating hooks that can store a global state across the entire application. The coolest part is that it works without context providers, observables, selectors, or HOC connectors. No boilerplate code but hooks.

### 🦄 Main features
- The library is tree-shakeable with no external dependency. Gzip size: ~1.2kb. 
- The state hooks can be used outside of the React tree.
- Greedy rendering. Only updated values trigger component rendering.
- Computed values with caching and hook nesting.
- Actions, setter, and selectors.
- Subscription to the state changes.
- Friendly with functional programming.
- Strongly typed with TypeScript.

<br/>
<div align="center">
  <img src="./wrong-marketing.png">
</div>
<br/>

### 🚀 Getting started
- 📖 [Online documentation](https://holy-cow.gitbook.io/holy-state/)
- 🍿 [Online demo](https://codesandbox.io/s/github/sultan99/cards/tree/main)
- 🐙 [Demo code source](https://github.com/sultan99/cards)

```sh
npm install @holycow/state
```

```jsx
import {createState} from '@holycow/state'

// 👇 your store is a hook!
const useUser = createState({
  id: 1,
  name: 'Homer Simpson',
  address: {
    house: 742,
    street: 'Evergreen Terrace',
  },
})

const UserName = () => {
  const {name} = useUser() // 👈 value from the state
  return <div>{name}</div>
}

const {id, name, address} = useUser 
// any values 👆 from the hook can be used outside of components
```

### 🍃 State update
It is quite simple to modify state values with the built-in `set` function.

```js
const {set} = useUser()

set('name', 'Ovuvuevuevue') // key & value
set('id',  prevId => prevId + 1) // key & function
set('address.street', 'rue de Beggen') // path & value, no spreading objects

// atomic updates: multiple values at the same time
set(state => ({
  ...state,
  id: state.id + 1,
  name: 'Ovuvuevuevue',
}))
// or object as updating input
set({
  id: prevId => prevId + 1,
  name: 'Ovuvuevuevue',
})
```

The `set` function is not only overloaded but curried as well. We can apply parameters to it partially one by one:

```js
const setId = set('id') // returns function which will update 'id'
setId(2) // actual updates with a value
setId(prevId => prevId + 1) // or using function

fetch('/api/users/1/address')
  .then(res => res.json())
  .then(set('address')) // equals 👉 .then(data => set('address', data))
```

### 🎬 Actions
An action is any piece of code that modifies the state and targets some specific task, unlike the `set` function, which is more generic and used for a simple value update. It is a good place to move business logic like validation or network operations. 

Action expects a curried function as a parameter. The first function provides the state — the second one handles the action payload.

```js
import {createState, action} from '@holycow/state'

const useAuth = createState({
  token: '',
  error: '',
  loading: false, // 👇 state         👇 payload
  login: action(({set, loading}) => formData => {
    if (loading) return
    set('error', '') // 👈 the state can be updated directly from the action
    set('loading', true})
    fetch('/api/login', {method: 'POST', body: formData})
      .then(res => res.json())
      .then(set('token'))
      .catch(set('error'))
      .finally(() => set('loading', false))
  }),
})

// ⚡ handler is created outside of the component, +1 performance
const handleSubmit = event => {
  event.preventDefault()
  useAuth.login(new FormData(event.target))
}

const Login = () => {
  const {loading, error} = useAuth()
  return (
    <form onSubmit={handleSubmit}>
      <input name='email' type='text'/>
      <input name='password' type='password'/>
      <p>{error}</p>

      <button type='submit' disabled={loading}>
        {loading ? 'Submitting' : 'Login'}
      </button>
    </form>
  )
}
```

### 🧠 Smart rendering
Unlike other state management, the holy state library does not require memoized selectors or further optimization to avoid unnecessary rerenders. Instead, it comes with a state tracking feature out of the box. Only components with altered values get rerendered.

```jsx
const Street = () => {
  const {address} = useUser() 
  return <div>{address.street}</div> // Evergreen Terrace
}

// 💤 no render even the address object was updated, +1 performance
useUser.set('address.house', 10)
// 💤 no render, equal value applied, +1 performance
useUser.set('address.street', `Evergreen Terrace`)
// 🏃‍♂️ now it will be rendered
useUser.set('address.street', `Spooner`)
```

### 🧮 Computed values
A computed value is a value returned by a specified function. The function's input can be a state value or any other hook. To avoid unnecessary computations, the computed value is cached and recomputed only when the current dependency has changed. Conceptually, computed values are similar to spreadsheets' formulas or Redux memoized selectors.

```js
import {createState, computed} from '@holycow/state'

const useUser = createState({
  name: 'Peter',
  birthDate: {
    day: 8,
    month: 12,
    year: 1979,
  },
  // 🦥 lazy evaluation, function will be called when the value is used
  age: computed(state =>
    new Date().getFullYear() - state.birthDate.year
  ), 
})

// usage
const UserAge = () => {
  const {name, age} = useUser()
  // here 'age' 👆 value is calculated and cached
  return <div>{name} is {age} years old guy.</div>
}

const homerAge = userUser.age // 👈 value from the cache, +1 performance
```

In the example above, the computed value age will be recalculated if the year of birthDate is modified. Otherwise, it will use the cached value.

What if we want to keep our `age` value updated when the year is changed? Let's assume our hard-working QA engineer opens our app on 31 December at 11:58! 

We could use the  [useCurrentYear](https://gist.github.com/sultan99/8ad653259263e052951f9d961d5d982e) hook to keep the value updated, respectively. Then we should wrap the hook with the side effect function.

```js
const useUser = createState({
  name: 'Peter',
  birthDate: {
    day: 8,
    month: 12,
    year: 1979,
  }, // side effect function 👇
  age: computed((state, sideEffect) =>
    sideEffect(useCurrentYear) - state.birthDate.year
    // when it's required to pass a parameter 👇
    // sideEffect(() => useCurrentYear('some-params'))
  ),
})
```

We should remember by using side effects, we lose the benefit of caching.

### 🤹 Selectors
Selectors are designed for convenient state access. The selector retrieves a value from the state at a given path. If we query more than one value, the selector will return an array with the requested values.

```jsx
const useMessages = createState({
  author: {
    id: 1,
    name: 'Peter',
  },
  messages: [
    {id: 10, text: 'Hello'},
    {id: 20, text: 'World!'},
  ]
})

// single value
const authorName = useMessages('author.name')
// 👆 equivalent 👇
const {author} = useMessages()
const authorName = author.name

// multiple values
const [authorName, firstMessage] = useMessages('author.name', 'messages.0.text')
// 👆 equivalent 👇
const {author, messages} = useMessages()
const authorName = author.name
const firstMessage = messages[0].text

// one line component with a selector 👇
const UserName = () => <div>useUser('name')</div>
```

The same trick we can do with actions or `set` functions:
```js
const setUser = useUser('set')
const setMessage = useMessages('set')
// 👆 equivalent 👇
const {set: setUser} = useUser()
const {set: setMessage} = useMessages()
```

### 📬 State subscriptions
We can subscribe to the state changes and get notified when the state is updated. The `subscribe` function accepts a callback function as a parameter and returns another function for unsubscription.

```js
// subscription to the whole state     👇
const unsubscribe = useUser.subscribe(state => {
  localStorage.setItem('user', JSON.stringify(state))
})

unsubscribe() // canceling subscription 👆

// subscription to specific 👇 value
useUser.subscribe('address.street' => {
  console.log('User street was changed!')
})
```

### 🧩 Utility functions
All functions are curried and pure by default.

#### Compose & curry
```js
import {compose, curry} from '@holycow/state'

// 🧂 functions can be curried for a next function composition
const add = curry((a, b) => a + b)
const divide = curry((a, b) => a / b)
const multiply = curry((a, b) => a * b)

multiply(1, 5)
// 👆 equivalent 👇
multiply(1)(5)

// order of execution starts from bottom to top (from right to left)
const compute = compose(
  divide(4),
  multiply(2),
  add(5)
)
// 👆 equivalent 👇
const compute = x => divide(4, multiply(2 * add(5, x))))

const result = compute(3) // 👉 (3 + 5) * 2 / 4 = 4
```

#### Compose & pick
```js
import {compose, pick} from '@holycow/state'

const handleChange = compose(
  useUser.set('name'), // 👈 2. sets the value to user name
  pick('target.value'), // 👈 1. picks the value
)
// 👆 equivalent 👇
const handleChange = event => {
  const {value} = event.target
  useUser.set('name', value)
}
```

#### Append
```js
import {append} from '@holycow/state'

const setMessage = useMessages.set('messages')

setMessage(append({id: 30, text: 'Hello World!'}))
// 👆 equivalent 👇
setMessage(messages => [...messages, id: 30, text: 'Hello World!'}])
```

#### Update
```js
import {update} from '@holycow/state'

const user = {
  name: 'Peter',
  address: {
    house: 31,
    street: 'Evergreen Terrace',
  }
}

const newUser = update('address.street', 'Spooner', user)
// 👆 equivalent 👇
const newUser = {
  ...user,
  address: {
    ...user.address,
    street: 'Spooner',
  }
}
```

### 📎 TypeScript
The state typing is designed to be seamless. Once it is typed, it should provide the correct types everywhere.

```tsx
import type {Action, Computed, Computed} from '@holycow/state'
import {createState} from '@holycow/state'

type Todo = {
  id: number
  checked: boolean
  description: string
}
/**
 * Computed<StateType, ReturnType>
 * Action<StateType> action with no payload
 * Action<StateType, [PayloadType1, PayloadType2 ...PayloadTypeN]>
 */
type TodosState = {
  filter: 'all' | 'completed' | 'uncompleted'
  todos: Todo[]
  filteredTodos: Computed<TodosState, Todo[]> // 👈 computing function returns Todo[]
  addTodo: ActionPayload<TodosState, [string, boolean | undefined]> // 👈 action with payloads
  clearTodos: Action<TodosState> // 👈 action without payload
}
// 👆 TypeScript zone, it can even be in a separate file.
const useTodos = createState<TodosState>({
// 👇 below like a normal JS code
  filter: 'all',
  todos: [
    {id: 1, checked: true, description: 'Buy milk'},
    {id: 2, checked: false, description: 'Clean room'},
  ],
  filteredTodos: computed(state => {
    const {filter, todos} = state 
    const isAll = filter === 'all'
    const isCompleted = filter === 'completed'
  
    return isAll ? todos : todos.filter(
      ({checked}) => checked === isCompleted
    )
  }),
  addTodo: action(state => (description, checked = false) => {
    const {set, todos} = state
    const id = todos.reduce((acc, {id}) => Math.max(id + 1, acc), 0)
    const newTodo = {id, description, checked}

    set('todos', [...todos, newTodo])
  }),
  clearTodos: action(({set}) => () => {
    set('todos', [])
  })
})

const [addTodo, set, todo] = useTodos(`addTodo`, `set`, `todos.0`)  // ✅ all good
const [addTodo, set, todo] = useTodos(`addtodo`, `set`, `todos.0`)  // ❌ type error
                                      // 👆 typos

todo?.description // ✅ all good
todo.description  // ❌ type error, it might be undefined

addTodo('Buy milk') // ✅ all good
addTodo(123) // ❌ type error

set(`filter`, 'completed') // ✅ all good
set(`filter`, 'new') // ❌ type error

const setFilter = set(`filter`) // curried function
setFilter('completed') // ✅ all good
setFilter('new') // ❌ type error
```
