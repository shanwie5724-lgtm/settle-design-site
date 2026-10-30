# SETTLE DESIGN｜網站正式製作版

這是 **可部署的網站程式**，不是已發布的網站。照片與案場資料尚待你從 Wix 取回，**不是原 Wix 的逐像素複製**。

### 1. 上線前需要你本人完成的帳號授權
- 在 https://github.com/new 建立私人 repo：`settle-design-site`（GitHub 無法從此聊天直接建立新的儲存庫）。
- 將此 ZIP 內容全部上傳到 repo 根目錄，**包括隱藏的 `.pages.yml`**。
- 在 https://dash.cloudflare.com/ → Workers & Pages → Create → Pages → Connect to Git，選取 repo。
- Production branch `main`，Framework `None`，Build command **留空**，Output directory `.`，Root directory 留空。
- 成功部署後，從 Cloudflare 取得實際 `*.pages.dev` URL。
- 到 https://app.pagescms.org/ 登入並授權 repo，選 `main`。

### 2. 立即測試的內容
- 首頁／品牌文字：上傳你自己的首頁作品照，儲存，確認新版自動部署。
- 作品集／照片與順序：新增第一個真實作品並上傳照片；確認卡片、相簿和手機版。

### 3. 其他文件
- `CONTENT-GUIDE.md`：後台日常操作。
- `.pages.yml`：Pages CMS 表單欄位設定。
- `data/site.json`：網站文案。
- `data/projects.json`：作品列表（初始為空陣列）。
- `assets/`：網站版型、互動程式。

**網站測試完成前，請保留 Wix，不要取消方案。**
