# Pikora

Meta 生態系社群抽獎管理工具，整合 Facebook、Instagram、Threads，自動載入留言、彈性篩選參與者、密碼學安全抽獎，讓每場活動更省力、更公正。

---

## 平台支援狀態

| 平台      | 狀態     | 可用功能                                             |
| --------- | -------- | ---------------------------------------------------- |
| Facebook  | 正式開放 | 完整抽獎套件、貼文瀏覽、留言管理、通知發送、歷史紀錄 |
| Instagram | 即將推出 | 商業帳號整合                                         |
| Threads   | 即將推出 | 回覆管理                                             |

---

## 登入與授權

使用 Facebook 帳號登入，系統將要求授予以下權限：

- `pages_show_list` — 查看所管理的粉絲專頁列表
- `pages_read_engagement` — 讀取互動數據
- `pages_read_user_content` — 讀取貼文留言內容
- `pages_manage_posts` — 管理貼文
- `pages_manage_engagement` — 管理互動（用於留言回覆通知）

登入後可在左側邊欄切換要管理的粉絲專頁。同一帳號若管理多個粉絲專頁，可隨時切換，各頁面的黑名單與抽獎紀錄相互獨立。

---

## 功能概覽

### 內容管理

#### 貼文列表 `/facebook/content/posts`

以無限捲動圖片牆呈現粉絲專頁所有貼文。

- 點擊貼文：複製貼文連結至剪貼簿，並自動帶入抽獎頁面
- Ctrl/Cmd + 點擊：在新視窗開啟 Facebook 原始貼文
- 輪播貼文顯示多圖指示器與左右切換箭頭
- 影片貼文顯示播放圖示
- 卡片顯示：縮圖、發文時間、按讚 / 留言 / 分享數
- 捲動至底部自動載入更多（Intersection Observer）

#### 留言列表 `/facebook/content/comments`

輸入貼文網址後載入該貼文的所有頂層留言與巢狀回覆。

- 以 Facebook 風格呈現留言串（含縮排連接線）
- 顯示留言者頭像、姓名、留言內容、時間、附圖、按讚數
- 留言排序：最新、最舊、熱門（最多讚）
- 即時關鍵字搜尋
- 分頁瀏覽（每頁 20 則）

---

### 抽獎系統

#### 新增抽獎 `/facebook/engage/giveaway`

##### 獎項設定

- 新增多個獎項，各別設定名稱與數量
- 系統顯示目前獎位總數

##### 篩選條件

以下條件可單獨或組合使用：

| 篩選項目         | 說明                                   |
| ---------------- | -------------------------------------- |
| 時間範圍         | 僅納入指定時段內的留言                 |
| 關鍵字           | 留言內容須包含指定文字或符合正規表示式 |
| 最少 @mention 數 | 留言須標記至少 N 位用戶（0 = 不限制）  |
| 需按讚貼文       | 僅限有對貼文按讚或表情的留言者         |
| 允許重複參加     | 同一用戶的每則留言視為獨立參加資格     |
| 允許重複得獎     | 同一用戶可在不同獎項多次中獎           |

啟用「需按讚貼文」時，系統自動非同步載入按讚名單並顯示進度。

##### 參加資格池

篩選後即時顯示：

- 已載入留言總數
- 通過篩選的留言數
- 不重複的合格參加者人數（或允許重複參加時的總資格數）

可點開「查看名單」逐一檢視合格參加者，並直接將特定用戶加入黑名單。

##### 抽獎流程

1. 完成設定後按「開始抽獎」
2. 系統以 `crypto.getRandomValues()` + rejection sampling 確保均勻分佈
3. 各獎項依序抽出，已中獎者自動從後續獎項中排除
4. 結果頁籤顯示每位得獎者的頭像、姓名、原始留言與留言時間

##### 得獎者管理

- 點擊留言連結可在 Facebook 查看原始留言，手動驗證
- 對個別獎項重抽：保留其他獎項結果，僅該獎重新隨機
- 將得獎者加入黑名單（立即生效）
- 儲存至資料庫，產生永久抽獎紀錄（草稿或完成兩種狀態）

##### 黑名單

管理當前粉絲專頁的黑名單，以粉絲專頁為單位、跨活動持續生效。可隨時移除黑名單成員。

---

### 抽獎紀錄與通知

#### 得獎名單 `/facebook/engage/winners`

列出該粉絲專頁所有已儲存的抽獎活動，每筆紀錄可展開，內含兩個頁籤：

**中獎名單**

- 每筆紀錄顯示：活動名稱、建立日期、獎項數、得獎者數、通知狀態
- 依獎項分組顯示得獎者，含頭像、留言內容、留言時間與原文連結
- 匯出 Excel（`.xlsx`）：含樣式的得獎者試算表，支援超連結
- 刪除紀錄：含二次確認防止誤操作

**通知發送**

對中獎者發送通知，支援兩種方式：

- **留言回覆**：自動在原留言下回覆，可自訂模板（支援 `{{winnerName}}`、`{{prizeName}}` 變數），選擇性勾選通知對象，可清除個別記錄後重發
- **私訊草稿**：可自訂模板並一鍵複製個人化內容，支援變數 `{{winnerName}}`、`{{prizeName}}`、`{{activityName}}`、`{{postLink}}`、`{{contactFields}}`，可設定需提供的聯絡資訊欄位（電話、Email、收件地址、備註）

---

### 說明中心

#### 系統介紹 `/facebook/help/info`

功能總覽、平台限制說明、使用建議。

#### 使用指南 `/facebook/help/guide`

操作步驟說明，含常見使用情境的逐步流程。

#### 常見問題 `/facebook/help/faq`

針對操作疑問、API 限制、抽獎公正性的詳細解答。

---

## 抽獎公正性保障

| 機制               | 說明                                                         |
| ------------------ | ------------------------------------------------------------ |
| 密碼學隨機         | 使用 Web Crypto API (`crypto.getRandomValues()`)，非偽隨機   |
| Rejection sampling | 消除模數偏差，確保每位參加者被選中的機率完全相等             |
| ReDoS 防護         | 自定義 Regex 篩選條件進行安全驗證，防止惡意表達式拖慢系統    |
| 重抽隔離           | 重抽單一獎項時，其他獎項的得獎者不受影響且自動列入排除名單   |
| 冪等保護           | 資料庫層級以 `(giveawayId, comment_id)` 唯一索引防止重複得獎 |

---

## 資料儲存範圍

**系統儲存：**

- OAuth 存取權杖（用於呼叫 Meta Graph API）
- 抽獎紀錄（篩選條件、獎項設定、得獎者資訊、通知狀態）
- 黑名單（以粉絲專頁為單位）
- 基本帳號資訊（用戶 ID、電子郵件）

**系統不儲存：**

- 貼文內容或圖片
- 完整留言列表（僅在當次瀏覽 session 中暫存於前端）
- 按讚 / 表情詳細資料

**帳號移除：**

- 前往 Facebook 設定移除應用程式授權，可立即撤銷所有 OAuth 存取權杖
- Facebook 資料刪除 Callback 觸發時，系統自動清除帳號及所有相關紀錄

---

## Tech Stack

| 類別       | 技術                                                |
| ---------- | --------------------------------------------------- |
| Framework  | Next.js 16 (App Router), React 19, TypeScript 5.9   |
| Auth       | NextAuth.js v5, Facebook OAuth 2.0                  |
| Database   | PostgreSQL + Prisma 7 ORM (`@prisma/adapter-pg`)    |
| UI         | shadcn/ui (new-york), Radix UI, Tailwind CSS v4     |
| Animation  | Motion (Framer Motion v12), @formkit/auto-animate   |
| Icons      | lucide-react                                        |
| API        | Meta Graph API v22.0                                |
| Excel 匯出 | ExcelJS                                             |
| Testing    | Vitest + @testing-library/react                     |
| Linting    | ESLint 9, Prettier, husky + lint-staged, commitlint |

---

## 開發指令

```bash
# 安裝相依套件
npm install

# 本地開發
npm run dev

# 類型檢查
npm run typecheck

# 執行 Lint
npm run lint

# 執行測試
npm run test

# 建置（自動執行 prisma generate）
npm run build

# 資料庫工具
npm run db:generate   # 更新 Prisma Client
npm run db:push       # 同步 schema 至資料庫（無 migration）
npm run db:migrate    # 建立並套用 migration
npm run db:studio     # 開啟 Prisma Studio
```

## API 路由總覽

| 路由                                        | 說明                       |
| ------------------------------------------- | -------------------------- |
| `GET /api/facebook/posts`                   | 取得粉專貼文列表（分頁）   |
| `GET /api/facebook/comments`                | 取得貼文留言（含巢狀回覆） |
| `GET /api/facebook/reactions`               | 取得貼文按讚 / 表情名單    |
| `GET /api/facebook/pages`                   | 取得用戶管理的粉絲專頁列表 |
| `GET /api/facebook/picture`                 | 代理 Facebook 用戶頭像圖片 |
| `GET/POST /api/giveaway`                    | 抽獎紀錄列表 / 新增        |
| `GET/DELETE /api/giveaway/[id]`             | 取得 / 刪除單筆抽獎紀錄    |
| `GET/POST/DELETE /api/giveaway/[id]/notify` | 查詢 / 發送 / 清除通知     |
| `GET/POST/DELETE /api/giveaway/blacklist`   | 黑名單查詢 / 新增 / 刪除   |
| `GET /api/health`                           | 服務健康檢查               |
| `GET /api/user/me`                          | 當前用戶資訊               |
| `POST /api/facebook/deauthorize`            | Facebook 解除授權 Webhook  |
| `POST /api/facebook/data-deletion`          | Facebook 資料刪除 Callback |
