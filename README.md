# Vela指数模糊 (Exponential Blur)

一个基于 Cairo Graphics 算法的模糊效果 Figma 插件。

## 功能特性

### 核心功能
- **指数模糊算法**: 直接移植自 Cairo Graphics 的 `_expblur` 函数
- **实时预览**: 参数调整时的实时模糊效果预览
- **自定义精度控制**: 可调节 Alpha 精度 (8-24) 和状态精度 (4-12)
- **性能缩放**: 可调节缩放因子 (0%-100%) 以优化低性能设备

## 安装使用

### 开发环境设置

1. **克隆项目**:
```bash
git clone https://github.com/jadon7/Cairo-Graphics-Blur-Plugin.git
cd "Cairo Graphics Blur Plugin"
```

2. **安装依赖**:
```bash
npm install
```

3. **构建项目**:
```bash
npm run build
```

4. **开发模式**:
```bash
npm run watch
```

### 在 Figma 中安装

1. 打开 Figma Desktop 应用
2. 进入 Plugins > Development > Import plugin from manifest...
3. 选择项目中的 `manifest.json` 文件
4. 插件将出现在 Plugins 菜单中

## 项目结构

```
Cairo Graphics Blur Plugin/
├── code.ts              # 插件主逻辑 (TypeScript)
├── code.js              # 编译后的插件代码
├── ui.html              # 用户界面
├── manifest.json        # 插件配置文件
├── package.json         # 项目依赖
├── tsconfig.json        # TypeScript 配置
└── README.md           # 项目说明文档
```