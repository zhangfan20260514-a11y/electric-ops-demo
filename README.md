# 电能智能运维交互 Demo

直接双击 `index.html` 即可运行；也可以在当前目录启动任意静态文件服务器。

推荐：`python3 -m http.server 4173`，然后访问 `http://localhost:4173/`。

## 故障一点通 GIS 地图（#/panorama/emergency/process）

右侧 GIS 地图采用「底图 + 独立标签层」的结构，底图放大时标签不随之放大：

- **底图**：`assets/panorama-screen/map-base-clean.png`（已抹除原图中烧录的站名、车间、工区标签，仅保留地形、线路、站点圆点、图例与页脚说明）。
  原始带标签版本仍保留为 `assets/panorama-screen/map-stations-v2.png`，供「全景可视」等其他页面使用。
- **放大倍数**：`emergency-process.js` 中的 `MAP_ZOOM`（当前 `2`，即底图放大 2 倍，视野以当前处置车站为中心）。
- **标签层**：`emergency-process.js` 中的 `MAP_LABELS`（车站 / 车间 / 工区 / 城市四类，坐标为底图百分比），
  由 DOM 绘制，尺寸固定不随底图缩放，因此放大后文字与图标仍保持原字号。
- **定位终端**：`TRACKED_TERMINALS`，同样绘制在标签层，尺寸恒定。
- **样式**：`corrections.css` 中「故障一点通 GIS」区块（`.ep-map-stage` / `.ep-map-marks` / `.ep-map-mark` 等）。

调整标签位置只需修改 `MAP_LABELS` 里的 `x` / `y`（相对 1672×941 底图的百分比）。

### 车辆导航线

`emergency-process.js` 的 `layoutRoutes()` 负责绘制每台车的导航线：

- **实线**（`.rt-done`）：已驶过的路径，沿路径渐变加亮，靠近车辆处最亮。
- **虚线**（`.rt-todo`）：尚未驶达的路径，`stroke-dasharray` + 流动动画。
- 线型全部为直角折线（出发地 → 途经点 → 停靠位），不做圆角/样条平滑。
- 车辆标签的锚点即车辆当前位置（落在线段上），落位会自动避开卡片边缘、底部说明条和其他标签。
- `TRACKED_TERMINALS` 中 `dynamic:true` 表示在途（有虚线），`etaMin` 控制行程总时长、`departMin` 控制已出发时长，
  两者决定实线／虚线的分界位置。

## 发布到 GitHub

### 方式一：网页上传（最简单）

1. 新建一个空仓库（不要勾选 README / .gitignore）。
2. 解压 `electric-ops-demo-local.zip`。
3. 打开仓库页面 → **Add file → Upload files**，把**解压后文件夹里的所有内容**（`index.html`、各种 `.js`/`.css`、`assets` 等）拖进去。
   注意不要把外层 `electric-ops-demo` 文件夹本身拖进去，否则会多一层路径。
4. 提交后到 **Settings → Pages**，Source 选 `Deploy from a branch`，分支 `main`、目录 `/ (root)`，保存。
5. 大约一分钟后访问 `https://<你的用户名>.github.io/<仓库名>/`。

### 方式二：命令行推送

macOS / Linux：

```bash
cd electric-ops-demo
./push-to-github.sh
```

Windows：双击 `push-to-github.bat`，按提示粘贴仓库地址。

也可以手动执行：

```bash
git init -b main
git add .
git commit -m "chore: electric-ops demo"
git remote add origin https://github.com/<用户名>/<仓库名>.git
git push -u origin main
```

> 推送时密码处需填写 **Personal Access Token**（GitHub → Settings → Developer settings → Personal access tokens），
> 账号密码已不再支持。
