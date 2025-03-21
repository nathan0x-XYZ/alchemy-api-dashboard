# Alchemy API Debug Console 還原點

## 版本: AlchemyDC-2025.03.2-Stable
## 日期: 2025-03-20

這個還原點記錄了 Alchemy API Debug Console 的穩定版本，所有功能都已經測試並正常工作。

### 主要功能
- 支持 REST API 和 JSON-RPC 格式的請求
- 支持 getNFTs, getTokenBalances, getTokenMetadata 等 Alchemy API 端點
- JSON 格式化和自動修復功能
- API 金鑰管理和驗證

### 主要文件
- `src/services/api.ts`: API 服務核心功能
- `src/components/debug-console/index.tsx`: Debug Console UI 組件
- `src/config/api-endpoints.ts`: API 端點配置

### 還原說明
如果需要還原到這個版本，請確保以下文件的完整性：
1. `src/services/api.ts`
2. `src/components/debug-console/index.tsx`
3. `src/config/api-endpoints.ts`

這些文件包含了 API 服務和 Debug Console 的核心功能。
