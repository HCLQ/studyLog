# 易用node工具

## 命令行
#### commander 解析命令行参数
[参考](https://github.com/tj/commander.js#readme)
```js
npm install commander
// 使用
const { Command } = require('commander');
const program = new Command();
program
  .option('-y, --yes', 'run default action')
  .option('-f, --force', 'force all the question');
  
/**
 * 可以通过判断，当用户输入了对应的这些参数时,
 * 我们可以做一些操作:
 */
if (program.force) {
    // do something..
}
```

#### inquirer 命令行交互，多选。单选，输入，confirm
[参考](https://www.npmjs.com/package/inquirer)

#### ora 命令行loading
[参考](https://www.npmjs.com/package/ora)
```js
npm install ora
```

#### chalk 控制台染色
[参考](https://www.npmjs.com/package/chalk)
```js
npm i chalk
```

## 文件处理
#### fs-extra 本地文件处理
[参考](https://www.npmjs.com/package/fs-extra)

#### download-git-repo 拉取远程Git仓库代码 
[参考](https://gitlab.com/flippidippi/download-git-repo#readme)
```js
const path = require('path');
const downloadRepo = require('download-git-repo');

  // 下载repo资源
  downloadRepo() {
    // 菊花转起来～
    this.spinner.start('正在拉取项目模板...');
    const { repo, temp } = this.RepoMaps
    return new Promise(async (resolve, reject) =#### {
      // 如果本地临时文件夹存在，则先删除临时文件夹
      await fs.removeSync(temp);
      /**
       * 第一个参数为远程仓库地址，注意是类型:作者/库
       * 第二个参数为下载到的本地地址，
       * 后面还可以继续加一个配置参数对象，最后一个是回调函数，
       */
      download(repo, temp, async err =#### {
        if (err) return reject(err);
        // 菊花变成对勾
        this.spinner.succeed('模版下载成功');
        return resolve()
      })
    })
  }

```

## 数据校验
#### JSON Schmea
[参考](https://github.com/ajv-validator/ajv)
#### Joi
[参考](https://joi.dev/api/)