# 滚动位置缓存功能

## 功能说明

项目已集成滚动位置缓存功能，支持在页面切换时自动保存和恢复每个页面的滚动位置。

## 特性

- ✅ 自动保存滚动位置（防抖150ms）
- ✅ 页面切换时无缝恢复滚动位置
- ✅ 多页面独立缓存，互不影响
- ✅ 缓存持久化存储（localStorage）
- ✅ 24小时自动过期清理
- ✅ 完全无感知的用户体验

## 使用方法

### 在路由中使用

```tsx
import { createFileRoute } from '@tanstack/react-router'
import KeepAlivePage from '../components/KeepAlivePage'
import ScrollRestoreContainer from '../components/ScrollRestoreContainer'
import YourPage from '../pages/YourPage'

export const Route = createFileRoute('/your-page')({
  component: () => (
    <KeepAlivePage name="your-page" enableScrollRestore={false}>
      <ScrollRestoreContainer pageKey="your-page" className="h-screen overflow-auto">
        <YourPage />
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
})
```

### 组件参数

#### ScrollRestoreContainer

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| pageKey | string | - | 页面唯一标识符，用于区分不同页面的缓存 |
| className | string | "h-full overflow-auto" | 容器样式类 |
| children | ReactNode | - | 子组件内容 |

#### KeepAlivePage

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| name | string | - | 页面缓存名称 |
| enableScrollRestore | boolean | true | 建议设为 false，使用 ScrollRestoreContainer 处理 |

## 技术实现

- **存储方式**：localStorage，键名 `page-scroll-positions`
- **数据格式**：`{ pageKey: { x: number, y: number, timestamp: number } }`
- **防抖延迟**：150ms，避免频繁保存
- **恢复机制**：使用 `react-activation` 的 `useActivate` hook
- **视觉优化**：短暂隐藏内容避免滚动闪烁

## 注意事项

1. **pageKey 唯一性**：确保每个页面使用不同的 pageKey
2. **容器高度**：ScrollRestoreContainer 需要明确的高度约束
3. **页面缓存**：配合 KeepAlivePage 使用以保持页面状态
4. **性能考虑**：大量内容的页面建议使用虚拟滚动

## 故障排除

### 滚动位置没有恢复
- 检查 pageKey 是否唯一
- 确认容器有正确的高度设置
- 查看浏览器控制台是否有错误日志

### 缓存占用过多空间
- 缓存会在24小时后自动过期
- 可以手动清理：`localStorage.removeItem('page-scroll-positions')`

## 已集成页面

- 首页 (/)
- 搜索页 (/search)
- 热门页 (/trending)
- 收藏页 (/saved)
- 点赞页 (/likes)
- 个人页 (/profile)

所有页面都已配置好滚动位置缓存功能，无需额外配置即可使用。

之前我在vue项目里通过mapbox实现了"轨迹"这个,板块，我希望你在现在的这个react项目复刻这个功能
1.调用的接口是(userid是登录的用户id)/api/topic?page=1&size=100&userId=1&exif=true ,数据结构是data.json
2.vue版本的实现文件也给你了，可以作为参考
3.图片预览还是采用viewer-pro
4.包管理器还是pnpm