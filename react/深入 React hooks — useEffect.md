## 前言
React Hooks的基本用法，[官方文档](https://react.docschina.org/docs/hooks-intro.html) 已经非常详细。本文的目的，是想通过一个简单的例子详细分析一些令人疑惑的问题及其背后的原因。这是系列的第二篇，主要讲解 useEffect。

**个人博客地址 [🍹🍰 fe-code](https://github.com/wuyawei/fe-code)**


## 类生命周期
官方文档中说，可以将 useEffect 的回调和清理副作用的机制，类比成 class 组件中的生命周期。不过，由于 class 组件和函数组件自身特性不同的原因，导致这种类比也容易使人迷惑。

> 如果你熟悉 React class 的生命周期函数，你可以把 useEffect Hook 看做 componentDidMount，componentDidUpdate 和 componentWillUnmount 这三个函数的组合。 --[使用 Effect Hook](https://react-1251415695.cos-website.ap-chengdu.myqcloud.com/docs/hooks-effect.html)

不过有时也容易出问题，就像我们一开始的定时器例子一样。

``` javascript
function Counter() {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const id = setInterval(() => {
            setCount(count + 1);
        }, 1000);
    }, []);

    return <h1>{count}</h1>;
}
```

我们的需求很明确，就是在 componentDidMount 的时候，设置一个定时器。并且保证不会每次更新（componentDidUpdate）都重新设置。所以我们把第二个参数设置成`[]`，来达到一样的效果。

当然这是有问题的，由于函数式组件执行方式的不同，我们在 useEffect 中拿到的 count 是闭包引用的，而每次更新又会是一个全新的执行上下文。这在上一篇文章中已经详细分析过。但是在 class 组件中，生命周期中的引用是这样的 `this.state.count`，而且不同于函数式，这种方式每次拿到的 count 都是最新的。

React Hooks 也提供了一个类似作用的 hook 来帮我们保存一些值 — [useRef](https://react-1251415695.cos-website.ap-chengdu.myqcloud.com/docs/hooks-reference.html#useref)，`它可以很方便地保存任何可变值，其类似于在 class 中使用实例字段的方式`。不过这里不太适用。

总的来说，useEffect 和真正的生命周期还是有些区别的，在使用的时候需要多加注意。

## 依赖
> 通过第一篇文章，我们已经了解了一些很重要的信息，比如：每次更新都是一次重新执行。这不仅仅是对于 useState 来说的，整个函数组件都是这样。不太了解的同学，可以先阅读一下 [深入 React hooks  —  useState](https://github.com/wuyawei/fe-code/blob/master/react/%E6%B7%B1%E5%85%A5%20React%20hooks%20%20%E2%80%94%203%20%E5%88%86%E9%92%9F%E7%90%86%E8%A7%A3%20useState.md)。

``` javascript
function Counter() {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const id = setInterval(() => {
            setCount(count + 1);
        }, 1000);
    }, []);

    return <h1>{count}</h1>;
}
```
我们知道 **每次更新都是一次重新执行**。我们给 useEffect 的第二个参数传的是 `[]`，所以可以达到回调只运行一次的效果（只设置一次定时器）。

但是我们更应该知道的是，回调函数只运行一次，并不代表 useEffect 只运行一次。在每次更新中，useEffect 依然会每次都执行，只不过因为传递给它的数组依赖项是空的，导致 React 每次检查的时候，都没有发现依赖的变化，所以不会重新执行回调。

**检查依赖，只是简单的比较了一下值或者引用是否相等**。

而且上面的写法，官方是不推荐的。我们应该确保 useEffect 中用到的状态（如：count ），都完整的添加到依赖数组中。 **不管引用的是基础类型值、还是对象甚至是函数**。

``` javascript
function Counter() {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const id = setInterval(() => {
            setCount(count + 1);
            // 不想用到外部状态可以用 setCount(count => count + 1);
        }, 1000);
    }, [count]); // 确保所有状态依赖都放在这里
    console.log(count);
    return <h1>{count}</h1>;
}
```

这样才能保证回调中可以每次拿到当前的 count 值。

## 副作用
咦！好像有什么奇怪的东西。

![hook.gif](https://user-gold-cdn.xitu.io/2019/10/4/16d95f548c398e25?w=529&h=448&f=gif&s=39359)

发生了什么不得了的事？？？

![994b6f2egy1g2b7msjhbyg207i07idi3.gif](https://user-gold-cdn.xitu.io/2019/10/4/16d95f548c543645?w=270&h=270&f=gif&s=93561)

现在想想我们都干了什么。

* useEffect 回调里放了个定时器。
* 依赖数组按要求写了 count。
* 每次 count 改变引起的更新也会同时运行 useEffect 的回调。
* 回调里的定时器也会重新设置。
* 嗯，好像发现问题了。

每次更新时，会重新运行 useEffect 的回调函数，也就会重新设置一个定时器。但是有一个问题是，我们上一次设置的定时器并没有清理掉，所以频繁的更新会导致越来越多的定时器同时在运行。
为了解决上面的问题，就需要用到 useEffect 的另一个特性：清除副作用。

``` javascript
function Counter() {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const id = setInterval(() => {
            setCount(count + 1);
        }, 1000);
        // 返回一个清理副作用的函数
        return () => {
            clearInterval(id);
        }
    }, [count]);
    console.log(count);
    return <h1>{count}</h1>;
}
```

ok，世界安静了。

那么，再思考个问题吧。useEffect 清理副作用的时机是什么时候？在下一次视图更新之前吗？

``` javascript
function Counter() {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const id = setInterval(() => {
            console.log(1, '我是定时器', count);
            setCount(count + 1);
        }, 1000);
        return () => {
            console.log(2, `我清理的是 ${count} 的副作用`);
            clearInterval(id);
        }
    }, [count]);
    console.log(3, '我是渲染', count);
    return <h1>{count}</h1>;
}
```
上面代码的打印顺序会是 1、2、3 吗？

![image.png](https://user-gold-cdn.xitu.io/2019/10/4/16d95f553cf424b7?w=328&h=264&f=png&s=32877)

显然不是，useEffect 在视图更新之后才清理上一次的副作用。这么处理其实也是和 useEffect 的特性相契合的。React 只会在浏览器绘制后运行 useEffect。所以 Effect 的清除同样被延迟了。上一次的 Effect 会在重新渲染后被清除。

## 小结
使用 useEffect 时，需要注意状态的引用，依赖的添加以及副作用的清除（没有就不用了）。很多时候还需要借助其他的 hook 才能完成这个工作，比如 useRef/useCallback等。

## 参考文章
* [useEffect 完整指南](https://overreacted.io/zh-hans/a-complete-guide-to-useeffect/)
* [使用 Effect Hook](https://react-1251415695.cos-website.ap-chengdu.myqcloud.com/docs/hooks-effect.html)

## 交流群

>微信群：扫码回复加群。

![mmqrcode1566432627920.png](https://user-gold-cdn.xitu.io/2019/9/15/16d3303fb5ae517d?w=200&h=200&f=jpeg&s=25608)

## 后记
  如果你看到了这里，且本文对你有一点帮助的话，希望你可以动动小手支持一下作者，感谢🍻。文中如有不对之处，也欢迎大家指出，共勉。好了，又耽误大家的时间了，感谢阅读，下次再见！

* **文章仓库** [🍹🍰fe-code](https://github.com/wuyawei/fe-code)

感兴趣的同学可以关注下我的公众号 **前端发动机**，好玩又有料。

![](https://user-gold-cdn.xitu.io/2019/7/21/16c14d1d0f3be11e?w=400&h=400&f=jpeg&s=34646)
