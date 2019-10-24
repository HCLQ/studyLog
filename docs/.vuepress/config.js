module.exports = {
  base: '/',
  title: 'hcl-log',
  description: '个人的学习的笔记',
  serviceWorker: {},
  themeConfig: {
    repo: 'https://github.com/HCLQ/studyLog',
    repoLabel: 'GitLab',
    lastUpdated: 'Last Updated',
    editLinks: false,
    docsDir: 'docs',
    serviceWorker: {
      updatePopup: {
        message: '发现可更新内容',
        buttonText: '更新'
      }
    },

    sidebar: {
      '/study/': ['vue-next', 'vue-cli-plugin']
    }
  }
}
