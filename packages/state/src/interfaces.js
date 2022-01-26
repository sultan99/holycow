/* eslint-disable */

export const authState = createState({
  user: {},
  login: action(),
  logout: action(),
})

const useAuth = createHook(authState)
const selectUser = extractStatic(useUser)


export const userState = createState({
  userId: 2,
  list: [],
  user: computed(({userId, users}) =>
    users.find(user => user.id === userId)
  ),
  userName: computed(({userId}, select) => {
    const users = select(`users`, useUsers)
    const user = users.find(user => user.id === userId)
    const [userId, userList] = select(`userId`, `list`).from(useUsers)
    const id = selectUser(`currentId`)

    return user.name
  }),
  addUser: actionAppend(`users`), // => users
  setUser: actionSet(`users`), // => users
  deleteUser: actionRemove(`users`), // => element => element.id === userId
  updateUser: actionUpdate(`users`), // => element => element.id === userId => value | (key, value) => payload | (id, payload)
})

authState.on(`logout`, users.reset)
authState.off(`logout`, users.reset)

authState.after(`logout`, users.reset)
authState.before(`logout`, users.reset)
authState.subscribe(`user`, appState.set(`user`))

const createUser = createEventHook()

on(createUser, payload => {
  appState.set(`user`, payload)
  authState.reset(payload)
  usersState.set(`current`, payload)
})

createUser({name: `Bob`, age: 21})

const {set, login, logout} = useAuth()
const useUsers = createHook(users)
const linkUsers = createLink(users)

export const postState = createState({
  author: linkUsers(`user`),
  loadPost: action(set => () => {
    const userId = users.id // subscribed to useUsers(`user.id`), check below
    set(`loading`, true)
    fetch(`/api/posts?userId=${userId}`)
      .then(toJson)
      .then(set(`posts`))
      .catch(set(`error`))
      .finally(() => set(`loading`, false))
  }),
})

export const usePost = createHook(postState)

users.subscribe(
  `id`, (id, prevValue) => {},
  `user.id`, usePost(`loadPost`),
  `user.id`, usePost(`fetchComments`),
)

chatState.subscribe(
  onUpdate(`rooms`, renderChatRoom),
  afterUpdate(`chatId`, changeChatRoom),
  beforeUpdate(`chatId`, (prevState, nextState) => {}),
)

const subscribeUser = users.subscribe
subscribeUser(`id`, fetchUser)
subscribeUser({
  id: fetchUser,
  name: usePost.set(`authorName`),
})

subscribeUser([`id`, `name`], devtools)

const onUpdateUser = useSubscription(users)

onUpdateUser([`id`, `postId`], fetchUser)

set(`id`, 1,)
set(`users[0].name`, `Ricky`)
set(`users?.0?.name`, `Ricky`, fallback) // ?
set(`users`, R.append({id: 1, name: `Ricky`}))
// atomic update
set({id: 1, name: `Ricky`})

action((set, state) => payload => {})
action((setters, state) => set(`userId`))
computed((trackState, state) => {})

// atomic update
action(({set, setId, setName}) => payload => {
  const rollbackId = setId(payload.id)
  const rollbackName = setName(payload.name)

  transaction(commit => {
    setId(payload.id)
    setName(payload.name)
    commit()
  })
})


const postId = useUsers.post.id
const [setId, userId, users] = useUsers(`setId`, `user.id`, `list`)
const {set, reset, subscribe, id} = useUsers
useUsers(`@user.id`, `@list`)

createState()
createStore()
createStateHook()
