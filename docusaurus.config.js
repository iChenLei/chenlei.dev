const path = require('path');

module.exports = {
  title: '雷先生',
  tagline: '雷先生是一个喜欢学习的程序员，在这里与你分享我觉得值得分享的事情！',
  url: 'https://www.chenlei.dev',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'pinduoduo', // Usually your GitHub org/user name.
  projectName: 'chenlei.dev', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: '雷先生',
      logo: {
        alt: '雷先生写字的地方',
        src: 'img/logo.png',
      },
      links: [
        {to: 'blog', label: '博客', position: 'left'},
        {
          href: 'https://github.com/iChenLei',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '项目',
          items: [
            {
              label: 'effective-dart',
              href: 'https://github.com/cdartlang/effective-dart',
            },
            {
              label: 'weex-demo',
              href: 'https://github.com/iChenLei/weex-android-joke',
            },
          ],
        },
        {
          title: '拼多多招聘',
          items: [
            {
              label: 'Social hire',
              href: 'https://www.pinduoduo.com/home/recruit',
            },
            {
              label: 'Campus Hire',
              href: 'https://www.pinduoduo.com/home/campus',
            },
          ],
        },
        {
          title: '联系方式',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/iChenLei',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/S_chenlei',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ChenLei.dev, Pinduoduo Inc. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        }
      },
    ],
  ],
  plugins: [path.resolve(__dirname, 'src/baiduGAPlugin')]
};
