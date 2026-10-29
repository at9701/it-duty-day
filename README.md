# 當你在抱怨資訊單位的時候，請來體驗看看——當一個資訊單位人員的一天

像素風模擬遊戲：醫院資訊單位人員的一天——值班人員、專責工程師（網路／資安／資料庫／系統／程式／PACS）、主任三種角色。給新人練判斷與底線，給主管看人力配置的差異。單一 HTML，無後端。

## 部署到 GitHub Pages
1. 建一個 repo（例如 `it-duty-day`），把 `index.html` 放在根目錄
2. Settings → Pages → Source 選 `Deploy from a branch`，Branch 選 `main` / `(root)`
3. 幾分鐘後網址是 `https://<你的帳號>.github.io/it-duty-day/`

## 改內容
- 事件腳本：`EV`（白班）、`EV_EVE`、`EV_NIGHT`、`EV_HOL`、`SPEC_EV`（各專責）
- 做法選單：`PROC`（每類問題的決策樹）、`DEEPEN` / `DEEPEN2`（補充選項）
- 電話教：`GUIDE`；釐清題：`TRIAGE`；後果：`CONSEQ`；壞結局：`ENDINGS`
- 樓層與單位：`BLUEPRINT`（四個難度）、`UNIT`、`TPL`（額外單位的工單模板）
- 小七／美食街菜單：`MENU`；專長與特質：`SKILLS`、`TRAITS`

字型來自 Google Fonts（Press Start 2P），離線時會退回系統等寬字。
