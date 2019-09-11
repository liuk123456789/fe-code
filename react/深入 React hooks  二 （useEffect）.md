## 前言
React Hooks的基本用法，[官方文档](https://react.docschina.org/docs/hooks-intro.html) 已经非常详细。本文的目的，是想通过一个简单的例子详细分析一些令人疑惑的问题及其背后的原因。这是系列的第二篇，主要讲解 useEffect。

**个人博客地址 [🍹🍰 fe-code](https://github.com/wuyawei/fe-code)**

## 疑惑
> 通过第一篇文章，我们已经了解一些很重要的信息，比如：每次更新都是一次重新执行。这不仅仅是对于 useState 来说的，整个函数组件都是这样。建议不太了解的同学，先阅读一下 [深入 React hooks  一（useState）]()。

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