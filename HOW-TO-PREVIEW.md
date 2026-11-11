# 如何本地预览

这是纯静态单页应用，**无需安装依赖、无需构建**。

## 方式一：一键启动（推荐）

| 系统 | 操作 |
|---|---|
| Windows | 双击 `start-preview.bat`，会自动开服务并打开浏览器 |
| macOS | 双击 `start-preview.command`（首次可能需在「系统设置 → 隐私与安全性」允许运行） |
| Linux / 命令行 | `bash start-preview.command` |

启动后访问：

```
http://localhost:4173/index.html#/panorama/emergency/process
```

关闭终端窗口 / 按 Ctrl+C 即停止服务。

## 方式二：手动起服务

```bash
cd electric-ops-demo
python3 -m http.server 4173
```

浏览器打开 `http://localhost:4173/index.html#/panorama/emergency/process`

## 方式三：直接双击打开

双击 `index.html` 也能用（本工程无 fetch 请求，不依赖服务器）。但部分浏览器对 `file://` 下的 hash 路由兼容性不佳，若页面空白，请改用方式一 / 二。

## 目标页面

| 页面 | 地址 |
|---|---|
| 应急流程（本次改动页） | `index.html#/panorama/emergency/process` |
| 首页 / 工作台 | `index.html#/` |

## 本次改动要点

- **GIS 地图放大 2 倍**：`emergency-process.js` 中 `MAP_ZOOM = 2`（改为 1 即还原）。
- **车站/车间/工区标签缩小且不随地图放大**：标签从位图中剥离，改为独立 DOM 图层 `.ep-map-marks`，字号固定。
- **底图换为无标签版本**：`assets/panorama-screen/map-base-clean.png`；原带标签图 `map-stations-v2.png` 仍保留给其他页面使用。
- **切换聚焦车站**：浏览器控制台执行 `sessionStorage.setItem('emergency-station','铜梁')` 后刷新即可。
- **当前处置车站标识**：不再是悬在地图上的空心圆环，改为站名标签本身高亮（青色描边 + 呼吸光圈），并与底图站点坐标严格对齐。
- **底图已二次清理**：抹除了原标签遗留的 Y 形青色引线与两处落点光斑，地形纹理由 LaMa 修复，站点光点/橙色线路/图例全部保留。
- **站点标记改为矢量绘制**：每个车站在底图坐标处叠加 `radial-gradient` 标记（白心 + 橙环 + 外发光），不再依赖位图中放大后发虚的光斑；当前站标记转青色并带脉冲环。
- **车辆导航线（新增）**：每台定位终端都会画出从出发地到处置车站的路线。
  已驶过的部分为**青色实线**（出发端淡入、临近车辆处最亮），未驶到的部分为**白色流动虚线**（终点处有虚线小圈表示预定停靠位）。
  行进进度由「已用时间 ÷ 预计行程」实时计算，页面每秒刷新一次，在途车辆会沿路线推进。
  相关数据在 `emergency-process.js` 顶部 `TRACKED_TERMINALS`：`from` 出发地、`via` 途经点（均为底图百分比坐标），`etaMin` 可单独指定行程分钟数。
- **车辆停靠位自动分配**：已抵达的车辆不会堆在同一点，而是沿「自身来向」由近及远试探空位（`PARK_RADII` / `PARK_TILT`），
  避开站名标签、车间/工区标签与站点标记；四个方向都放不下时退化为重叠面积最小的位置。车辆标签贴边会自动翻转到另一侧。
- **站名紧贴标记且不遮标记**：站名标签左边缘距标记中心 16px（当前处置车站 22px，给脉冲光圈留位），
  翻转与间距全部用 `transform:translate(var(--pin-gap))` 实现，不再用 margin（margin 与 translate(-100%) 会互相抵消，曾导致标签压住标记）；
  是否翻转由 `pinX ± (gap + 标签实测宽度)` 与卡片宽度的纯几何比较决定（`layoutMap`），不受首帧布局时机影响；
  标记点 `z-index:6` 高于标签 `z-index:4`，即使极端情况也保证标记完整可见。
  调整间距：改 `corrections.css` 里 `.ep-mark-pin` 的 `--pin-gap`（默认 16px）。
