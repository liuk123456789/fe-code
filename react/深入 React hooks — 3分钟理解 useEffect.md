## 前言
React Hooks的基本用法，[官方文档](https://react.docschina.org/docs/hooks-intro.html) 已经非常详细。本文的目的，是想通过一个简单的例子详细分析一些令人疑惑的问题及其背后的原因。这是系列的第二篇，主要讲解 useEffect。

**个人博客地址 [🍹🍰 fe-code](https://github.com/wuyawei/fe-code)**

## 依赖
> 通过第一篇文章，我们已经了解了一些很重要的信息，比如：每次更新都是一次重新执行。这不仅仅是对于 useState 来说的，整个函数组件都是这样。不太了解的同学，可以先阅读一下 [深入 React hooks  — 3 分钟搞定 useState](https://github.com/wuyawei/fe-code/blob/master/react/%E6%B7%B1%E5%85%A5%20React%20hooks%20%20%E2%80%94%203%20%E5%88%86%E9%92%9F%E7%90%86%E8%A7%A3%20useState.md)。

继续上一篇的例子，这次我们来看看 useEffect 的不同之处。

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

而且上面的写法，官方是不推荐的。我们应该确保 useEffect 中用到的状态（如：count ），都完整的添加到依赖数组中。

**不管引用的是基础类型值、还是对象甚至是函数**。

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

![hook.gif](https://i.loli.net/2019/09/15/NrKyJDa9MCP5FAR.gif)

发生了什么不得了的事？？？

![994b6f2egy1g2b7msjhbyg207i07idi3.gif](https://i.loli.net/2019/09/15/CtbglXGMZjzTE3y.gif)

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

![image.png](https://i.loli.net/2019/09/15/FoIC4w2qfMQGvap.png)

显然不是，useEffect 在视图更新之后才清理上一次的副作用。这么处理其实也是和 useEffect 的特性相契合的。React 只会在浏览器绘制后运行 useEffect。所以 Effect 的清除同样被延迟了。上一次的 Effect 会在重新渲染后被清除。

## 类生命周期
官方文档中说，可以将 useEffect 的回调和清理副作用的机制，类比成 class 组件中的生命周期。不过，由于 class 组件和函数组件自身特性不同的原因，导致这种类比也容易使人迷惑。

> 如果你熟悉 React class 的生命周期函数，你可以把 useEffect Hook 看做 componentDidMount，componentDidUpdate 和 componentWillUnmount 这三个函数的组合。 --[使用 Effect Hook](https://react-1251415695.cos-website.ap-chengdu.myqcloud.com/docs/hooks-effect.html)

我们经常想把第二个参数设置成`[]`，来达到和 componentDidMount 一样的效果。但是往往也最容易出问题，就像我们一开始的定时器例子一样。
