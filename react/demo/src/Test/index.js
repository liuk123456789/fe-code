import React, { useState, useEffect, useRef } from 'react';
function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}
function Test() {
    let [count, setCount] = useState(0);
    const [name, setName] = useState('oh nanana');
    useEffect(() => {
        // Promise.resolve().then(() => {
        // })
        setName('hi');
        setCount(c => c+1);
    }, [])
    useEffect(() => {
        console.log(document.querySelector('h1'));
    }, [name])
    // const prevCount = usePrevious(count);
    // function handleClick() {
    //     setCount(count => count + 5); // 以最后一个为准, 因为setCount 不会立即触发
    //     // setName(name => name + ' nanana');
    //     setTimeout(() => {
    //         // setCount(count + 1);
    //         // setCount(count + 2);
    //         // setCount(count + 3);
    //         // setCount(count + 4);
    //         // setCount(count + 5); // 以最后一个为准, 因为setCount 不会立即触发
    //         // setName(name => name + ' nanana');
    //     }, 200)
    //     console(count)
    // }
    // useEffect(() => {
    //     document.querySelector('button').addEventListener('click', ()=> {
    //         setCount(count + 5); // 以最后一个为准, 因为setCount 不会立即触发
    //         setName(name => name + ' nanana');
    //     })
    //     console.log(count, name);
    // }, [count, name])
    // useEffect(() => {
    //     const id = setInterval(() => {
    //         // console.log(count)
    //         // setCount(++count);
    //         setCount(count + 1)
    //     }, 1000);
    // }, []);
    // console.log(count);
    // console.log('我是 num', num);
    // useEffect(() => {
    //     const id = setInterval(() => {
    //         console.log(1, '我是定时器', count);
    //         setCount(count + 1);
    //     }, 1000);
    //     return () => {
    //         console.log(2, `我清理的是 ${count} 的副作用`);
    //         clearInterval(id);
    //     }
    // }, [count]);
    // console.log(3, '我是渲染', count, name);
    // function onMouseOut(e) {} // 触发条件：移出父元素和移出每个子元素
    return (
        <div>
            {/* <h1>Now: {count}, before: {prevCount}</h1> */}
            {/* <button onClick={handleClick}>add</button> */}
            {count && <h1>{count}-----{name}</h1>}
        </div>
    )
}

export default Test;