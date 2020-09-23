数学

## 进制转换
```js

function transNum(n, th, limit) {
  let [int, dec] = `${n}`.split('.')
  int = parseIntPart(int, th)
  dec = dec ? parseDecimalPart(+`0.${dec}`, th, limit) : ''
  return `${int || 0}` + (dec ? `.${dec}` : '')
}

/**
 * 整数10进制转换其他进制的
 * 整数不断处于其他进制的数，直到除完为止
 *      余
 * 9/2  1
 * 4/2  0
 * 2/2  0
 * 1/2  1
 * 则为二进制 1001
 * @param {*} n 10进制数
 * @param {*} th 目标进制
 */
function parseIntPart(n, th = 16) {
  if (!n) {
    return ''
  }
  n = +n
  let y = n % th
  let temp = [y]
  n = parseInt(n / th)
  while (n !== 0) {
    y = n % th
    n = parseInt(n / th)
    temp.unshift(y)
  }
  return format(temp)
}

/**
 * 进制小数部分转换其他进制
 * 不断乘以其他进制，取整数部分作为值，小数部分继续乘直到达到保留小数部分位数为止
 * @param {*} n
 * @param {*} th
 * @param {*} limit
 */
function parseDecimalPart(n, th = 16, limit = 10) {
  if (!n) {
    return ''
  }
  let temp = []
  while (limit > 0) {
    n = n * th
    const int = parseInt(n)
    temp.push(int)
    n = n - int
    limit--
  }
  return format(temp)
}

function format(temp) {
  return temp.reduce((str, num) => (str += num > 9 ? String.fromCharCode(97 + num - 10) : num), '')
}

```