# Alchemy API Debug Console Changelog

## AlchemyDC-2025.03.2-Stable (2025-03-20)

### 功能改進
- 修復了 getTokenMetadata 端點的問題，使用 JSON-RPC 格式發送請求
- 特殊處理 getTokenBalances 和 getTokenMetadata 端點的參數格式
- 在 Debug Console 組件底部顯示版本號

### API 服務改進
- 支持 REST API 和 JSON-RPC 格式的請求
- 改進參數處理邏輯，特別是對數組和嵌套對象的處理
- 增強錯誤處理和日誌記錄

### API 端點配置
- 更新 getTokenBalances 和 getTokenMetadata 端點配置，使用 JSON-RPC 格式
- 確保方法和路徑正確

### 已知問題
- 無

### 下一步計劃
- 添加更多 Alchemy API 端點支持
- 改進 UI/UX 設計
- 添加更多測試用例
