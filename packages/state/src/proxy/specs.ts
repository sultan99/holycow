import {createProxy, getTrackedProps} from '..'
import {postState} from '../test-utils/posts'

describe(`🎭 Proxy`, () => {
  it(`should accept string or symbol properties`, () => {
    const isHidden = Symbol(`is-hidden`)
    const proxy = createProxy({
      name: `James Bond`,
      [isHidden]: true,
    })

    expect(proxy.name).toBe(`James Bond`)
    expect(proxy[isHidden]).toBeTruthy()
  })

  it(`should not track properties if no options were passed`, () => {
    const proxy = createProxy(postState)
    expect(proxy.posts[0].title).toBe(`React Hooks`)

    const touchedProps = getTrackedProps(proxy)
    expect(touchedProps).toEqual([])
  })

  it(`should track used properties`, () => {
    const proxy = createProxy(postState, {trackProps: true})
    expect(proxy.posts[2].title).toBe(`TDD Changed My Life`) // tracking does not go deep in array
    expect(proxy?.post?.title).toBe(`React Hooks`)

    const touchedProps = getTrackedProps(proxy)
    expect(touchedProps).toEqual([`posts`, `post.title`])
  })
})
