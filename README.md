# Holy State
> Hook-based state management library for [React](https://github.com/facebook/react) applications.

<br/>
<br/>
<div align="center">
  <img src="./holy-cow.png" width="20%"/>
</div>
<br/>
<br/>
<br/>

## State on hooks
No observables, no subscribes, no connectors, no providers, no boilerplate but hooks.

```js
import {createState} from '@holycow/state'


const useAuth = createState({
  token: ``,
  error: ``,
  loading: false,
  isTokenValid: state => isValid(state.token), // 👈 computed value
  login: set => formData => { // 👈 action
    set(`error`, ``)
    set(`loading`, true)
    fetch(`/api/login`, {method: `POST`, body: formData})
      .then(res => res.json())
      .then(set(`token`)) // 👈 set is curried function
      .catch(set(`error`))
      .then(() => set(`loading`, false))
  }
})

// hooks can be used out of components 👇 
const onSubmit = event => {
  const {login} = useAuth()
  login(new FormData(event.target))
  event.preventDefault()
}

const Login = () => {
  const {loading, error} = useAuth()
  const text = loading ? `Submitting` : `Login`

  return (
    <form onSubmit={onSubmit}>
      <input name='email' type='text'/>
      <input name='password' type='password'/>
      <p>{error}</p>

      <button type='submit' disabled={loading}>
        {text}
      </button>
    </form>
  )
}
```

## Why to use it?
- Fast to learn, simple to use, easy to extend
- Smart re-renders, only imported values trigger rendering component
- Reactive computed values
- Handy selectors & setters
- It can be used out of components
- Strongly typed (TypeScript)
- Friendly with functional programming
- Small library size 84 lines of code!
