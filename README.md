# Vela指数模糊 (Exponential Blur)

一个基于 Cairo Graphics 算法的模糊效果 Figma 插件。

A Figma plugin that provides advanced blur effects using the Cairo Graphics exponential blur algorithm.

## 功能特性 (Features)

### 核心功能 (Core Features)
- **指数模糊算法**: 直接移植自 Cairo Graphics 的 `_expblur` 函数
- **自定义精度控制**: 可调节 Alpha 精度 (8-24) 和状态精度 (4-12)
- **广范围模糊半径**: 支持 1-200 像素的模糊半径
- **性能缩放**: 可调节缩放因子 (0%-100%) 以优化低性能设备
- **实时预览**: 参数调整时的实时模糊效果预览
- **非破坏性工作流**: 创建新图层而不修改原始图层

### 用户界面 (User Interface)
- **参数控制**: 半径、Alpha 精度、状态精度和性能缩放的滑块控制
- **实时预览画布**: 200x150px 预览窗口，实时更新
- **参数显示**: 所有参数的实时数值显示
- **预览开关**: 可选择启用/禁用实时预览以优化性能
- **性能缩放控制**: 0%-100% 的缩放因子用于性能优化

### 技术实现 (Technical Implementation)
- **像素级处理**: 完整的图像导出和像素操作
- **Canvas 图像处理**: 在 UI 上下文中使用 HTML5 Canvas 进行图像处理
- **性能缩放**: 先缩放图像进行处理，然后拉伸回原始尺寸
- **优化的模糊半径**: 模糊半径自动缩放以匹配图像比例
- **防抖预览**: 100ms 延迟以防止过度处理
- **选择跟踪**: 选择更改时自动更新预览

## 安装使用 (Installation & Usage)

### 开发环境设置 (Development Setup)

1. **克隆项目**:
```bash
git clone [repository-url]
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

### 在 Figma 中安装 (Installing in Figma)

1. 打开 Figma Desktop 应用
2. 进入 Plugins > Development > Import plugin from manifest...
3. 选择项目中的 `manifest.json` 文件
4. 插件将出现在 Plugins 菜单中

### 使用方法 (How to Use)

1. 在 Figma 中选择要应用模糊效果的图像或形状
2. 运行 "Vela指数模糊" 插件
3. 调整参数：
   - **模糊半径**: 0-200 像素
   - **性能缩放**: 0%-100% (较低值可提高性能)
   - **Alpha 精度**: 8-24 (高级参数)
   - **状态精度**: 4-12 (高级参数)
4. 启用预览查看实时效果
5. 点击"应用模糊"创建模糊图层

## 项目结构 (Project Structure)

```
Cairo Graphics Blur Plugin/
├── code.ts              # 插件主逻辑 (TypeScript)
├── code.js              # 编译后的插件代码
├── ui.html              # 用户界面
├── manifest.json        # 插件配置文件
├── Cairo Graphics.cpp   # Cairo Graphics 算法实现
├── package.json         # 项目依赖
├── tsconfig.json        # TypeScript 配置
├── CLAUDE.md           # 项目开发指南
└── README.md           # 项目说明文档
```

## 开发命令 (Development Commands)

```bash
# 构建 TypeScript 到 JavaScript
npm run build

# 监视模式开发 (文件更改时自动重建)
npm run watch

# 检查代码格式
npm run lint

# 自动修复代码格式问题
npm run lint:fix
```

## 技术栈 (Tech Stack)

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: TypeScript, Figma Plugin API
- **图形处理**: Cairo Graphics 算法 (C++ 实现)
- **构建工具**: TypeScript Compiler
- **代码检查**: ESLint

## 算法实现 (Algorithm Implementation)

本插件实现了 Cairo Graphics 库中的指数模糊算法，具有以下特点：

- **双向指数冲激响应**: 使用两侧指数冲激响应实现模糊效果
- **原地图像处理**: 内存高效的图像处理方式
- **多种表面格式支持**: 支持 ARGB32、RGB24 和 A8 像素格式
- **基于半径的模糊**: 90% 核心覆盖的半径控制
- **图形上下文状态管理**: 支持推送/弹出操作

## 性能优化策略 (Performance Optimization)

- **缩放-模糊-拉伸**: 先将图像缩放到较小尺寸，应用模糊，然后拉伸回原始尺寸
- **比例化半径**: 模糊半径按比例缩减以保持视觉一致性
- **无图像平滑**: 禁用 `imageSmoothingEnabled` 以保持性能特性
- **内存高效**: 低分辨率处理减少内存使用和计算时间

## 贡献指南 (Contributing)

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证 (License)

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 致谢 (Acknowledgments)

- 基于 Cairo Graphics 库的指数模糊算法实现
- 感谢 Figma 团队提供的插件开发平台
- 感谢所有为项目做出贡献的开发者

## 联系方式 (Contact)

如果您有任何问题或建议，请通过以下方式联系：

- 创建 Issue
- 提交 Pull Request
- 发送邮件至 [your-email@example.com]

---

**注意**: 本插件仍在开发中，部分功能可能会发生变化。建议在生产环境中使用前进行充分测试。

**Note**: This plugin is still in development and some features may change. It is recommended to test thoroughly before using in production.