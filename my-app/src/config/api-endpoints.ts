// API 端點配置

import { ApiEndpoint } from '@/services/api';

// 定義 API 端點類型
export interface ApiEndpointConfig {
  name: string;
  value: ApiEndpoint;
  description: string;
  defaultParams: string;
  method: 'GET' | 'POST';
  path: string;
  useJsonRpc: boolean;
  documentation?: string;
  network?: string;
}

// 定義所有可用的 API 端點
export const API_ENDPOINTS: ApiEndpointConfig[] = [
  {
    name: 'Get NFTs',
    value: ApiEndpoint.GET_NFTS,
    description: 'Retrieve NFTs owned by an address',
    method: 'GET',
    path: '/getNFTs',
    useJsonRpc: false,
    documentation: 'https://docs.alchemy.com/reference/getnfts',
    network: 'mainnet',
    defaultParams: `{
  "owner": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "pageSize": 10,
  "excludeFilters": ["SPAM"]
}`
  },
  {
    name: 'Get Asset Transfers',
    value: ApiEndpoint.GET_ASSET_TRANSFERS,
    description: 'Get transactions for an address',
    method: 'POST',
    path: '/',
    useJsonRpc: true,
    documentation: 'https://docs.alchemy.com/reference/alchemy-getassettransfers',
    network: 'mainnet',
    defaultParams: `{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "alchemy_getAssetTransfers",
  "params": [
    {
      "fromBlock": "0x0",
      "toBlock": "latest",
      "fromAddress": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "category": ["external", "internal", "erc20", "erc721", "erc1155"],
      "maxCount": "0x5"
    }
  ]
}`
  },
  {
    name: 'Get Token Balances',
    value: ApiEndpoint.GET_TOKEN_BALANCES,
    description: 'Get token balances for an address',
    method: 'POST',
    path: '/',
    useJsonRpc: true,
    documentation: 'https://docs.alchemy.com/reference/alchemy-gettokenbalances',
    network: 'mainnet',
    defaultParams: `{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "alchemy_getTokenBalances",
  "params": [
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "erc20"
  ]
}`
  },
  {
    name: 'Get Token Metadata',
    value: ApiEndpoint.GET_TOKEN_METADATA,
    description: 'Get metadata for a token contract',
    method: 'POST',
    path: '/',
    useJsonRpc: true,
    documentation: 'https://docs.alchemy.com/reference/alchemy-gettokenmetadata',
    network: 'mainnet',
    defaultParams: `{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "alchemy_getTokenMetadata",
  "params": [
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  ]
}`
  },
  {
    name: 'Get Transaction Receipt',
    value: ApiEndpoint.GET_TRANSACTION_RECEIPT,
    description: 'Get transaction receipt',
    method: 'POST',
    path: '/',
    useJsonRpc: true,
    documentation: 'https://docs.alchemy.com/reference/eth-gettransactionreceipt',
    network: 'mainnet',
    defaultParams: `{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "eth_getTransactionReceipt",
  "params": [
    "0x9a3dbe8e2a3c45d261b96e42a7d8e5e3f9e69efd5c7cf7a52c10c7968eae8e7b"
  ]
}`
  }
];
