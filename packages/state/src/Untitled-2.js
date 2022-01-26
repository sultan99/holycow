import {createState, action, computed} from './state'

export const postsState = createState({
  comments: [],
  isLoading: false,
  postId: 1,
  status: computed(({comments, isLoading, postId}) => isLoading
    ? `Loading post...`
    : `Post ${postId} has ${comments.length} comments`
  ),
  loadComments: action((set, {postId}) => () => {
    const url = `posts/${postId}/comments`
    const base = `https://jsonplaceholder.typicode.com`
    set(`isLoading`, true)
    fetch(`${base}/${url}`)
      .then(res => res.json())
      .then(data => set({
        comments: data,
        isLoading: false
      }))
  }),
  nextPost: action((set, {loadComments}) => () => {
    set(`postId`, postId => postId + 1)
    loadComments()
  }),
})

postsState.subscribe(`status`, console.info)

console.info(postsState.status)
// => Post 1 has 0 comments

postsState.nextPost()

// => Loading post...
// => Post 2 has 5 comments

/**
 import {createEvent, createStore, createEffect, sample} from 'effector'

const nextPost = createEvent()

const getCommentsFx = createEffect(async postId => {
  const url = `posts/${postId}/comments`
  const base = 'https://jsonplaceholder.typicode.com'
  const req = await fetch(`${base}/${url}`)
  return req.json()
})

const $postComments = createStore([])
  .on(getCommentsFx.doneData, (_, comments) => comments)

const $currentPost = createStore(1)
  .on(getCommentsFx.done, (_, {params: postId}) => postId)

const $status = combine(
  $currentPost, $postComments, getCommentsFx.pending,
  (postId, comments, isLoading) => isLoading
    ? 'Loading post...'
    : `Post ${postId} has ${comments.length} comments`
)

sample({
  source: $currentPost,
  clock: nextPost,
  fn: postId => postId + 1,
  target: getCommentsFx,
})

$status.watch(status => {
  console.log(status)
})
// => Post 1 has 0 comments

nextPost()

// => Loading post...
// => Post 2 has 5 comments

 */
