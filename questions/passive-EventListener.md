# Touchmove 禁止默认滚动带来的思考

## 前言
分享一些实际开发过程中遇到的问题和解决方案，文中如有不对之处，也欢迎大家指出，共勉。！

**个人博客地址 [🍹🍰 fe-code](https://github.com/wuyawei/fe-code)**

## 背景
源于最近的一个移动端走马灯需求，使用 touchmove 事件，来触发走马灯的动画。但是在实际运行时发现，滑动走马灯的时候很容易触发页面自身垂直方向的滚动，如下图

> 注：这里用 `overflow: auto` 模拟走马灯，只做 touchmove 的测试。

![](https://i.loli.net/2019/08/05/HvAeykDIGW5fc8S.gif)

可以看出，在滑动过程中，滑动方向一旦偏向垂直方向，就会触发页面的垂直滚动。

## 方案
### Passive event listeners
因为是 touchmove 事件触发的垂直滚动，所以很容易就想到了通过 `e.preventDefault()` 来禁用事件的默认行为，又很容易就改了代码。

``` javascript
function Touch() {
    const startTouchRef = useRef({x: 0, y: 0});
    // 保存初始位置
    function onTouchStart(e) {
        startTouchRef.current = { x: e.touches[0].pageX, y: e.touches[0].pageY };
    }
    // 限制垂直方向上的滚动
    function onTouchMove(e) {
        const y = Math.abs(e.touches[0].pageY - startTouchRef.current.y);
        const x = Math.abs(e.touches[0].pageX - startTouchRef.current.x);
        // 简单判断滑动方向是倾向于 y 还是 x
        // 禁止 x 方向的默认滚动，因为 x 方向的滚动会通过 Touchmove 或者 css 动画 实现
        if (y < x) {
            e.preventDefault();
        }
    }
    return (
        <div onTouchStart={onTouchStart}
             onTouchMove={onTouchMove}>
            // ...
        </div>
    )
}
```

最后很容易得到了一个报错。

![image.png](https://i.loli.net/2019/08/05/5kL679RbMyixpoh.png)

真是人性化的报错，让我们去查看 [https://www.chromestatus.com/features/5093566007214080](https://www.chromestatus.com/features/5093566007214080) 这个 url。

![image.png](https://i.loli.net/2019/08/05/5kL679RbMyixpoh.png)

大意是说：addEventListener 有一个参数 passive 默认是 false，但是在 Chrome 56 的时候 把 touchstart 和 touchmove 的改成了默认 `passive: true`。这样，touchmove 事件就不会阻塞页面的滚动。因为在 `passive: false` 的状态下，不管是否需要调用 `e.preventDefault()` 来阻止页面滚动，都需要等到 touchmove 函数执行完毕，页面才会做出反应。

做一个简单的测试。

``` javascript
// 没有阻止页面滚动，仅仅是增加了事件处理的时间
function Touch() {
    const ref = useRef(null);
    function onTouchMove(e) {
        console.time();
        let index = 0;
        for (let i = 0; i< 1000000000; i++) {
            index++;
        }
        console.timeEnd();
    }
    useEffect(() => {
        ref.current.addEventListener('touchmove', onTouchMove, { passive: false });
        return () => {
            ref.current.removeEventListener('touchmove', onTouchMove, { passive: false });
        };
    }, []);
    return (
        <div >
            // ...
        </div>
    )
}
```

![112.gif](https://i.loli.net/2019/08/05/ijDVrJRpq5hfPM2.gif)

每次滑动后页面的响应明显卡顿，因为浏览器需要等 touchmove 执行完才知道是否需要禁止默认滚动。而将 passive 设为 true 后，浏览器将不考虑禁用默认行为的可能性，会立即触发页面行为。

当然，如果确实要阻止默认行为，就像我之前的那个需求一样，就需要手动设置 passive 是 false，然后正常使用 preventDefault 就好。不过，不管是哪种方式，我们都需要优化自己的执行代码，尽量减少时间代码运行时间。否则，还会看到以下警告：

![image.png](https://i.loli.net/2019/08/05/YXlOpWCcg4tPLIj.png)

关于被动事件监听，更多的优化是在移动端，pc 端貌似较少处理。我这里只测试了 mousewheel，在 pc 的 Chrome 74 下，尽管设置成了 `passive: true`，也没有优先触发页面的滚动行为。但是，在移动端模式下，是可以的。大家有兴趣的也可以自己测试一下。

因为 Chrome 56以上才支持 passive，所以在使用时可能需要做一下兼容性测试。代码来自 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)。

``` javascript
// 如果触发对 options 取值 passive 的情况，说明支持 passive 属性
var passiveSupported = false;

try {
  var options = Object.defineProperty({}, "passive", {
    get: function() {
      passiveSupported = true;
    }
  });

  window.addEventListener("test", null, options);
} catch(err) {}

someElement.addEventListener("mouseup", handleMouseUp, passiveSupported
                               ? { passive: true } : false);
```
### touch-action