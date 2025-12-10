// API 测试工具
// 用于测试 DexScreener 和其他 API 是否正常工作

import * as realApi from './realApi';

/**
 * 测试 DexScreener API
 */
export async function testDexScreener() {
  console.log('🧪 Testing DexScreener API...');
  
  try {
    // 测试1: 获取 SOL 价格
    console.log('1. Testing SOL price...');
    const solPrice = await realApi.getSOLPrice();
    console.log('✅ SOL Price:', solPrice, 'USD');
    
    // 测试2: 获取热门代币列表
    console.log('2. Testing trending tokens...');
    const tokens = await realApi.getTrendingTokens(5);
    console.log('✅ Trending tokens:', tokens.length);
    tokens.forEach((token, i) => {
      console.log(`   ${i + 1}. ${token.name} (${token.symbol}) - $${token.price}`);
    });
    
    // 测试3: 搜索代币（使用一个已知的 Solana 代币地址）
    console.log('3. Testing token search...');
    const searchResults = await realApi.searchTokens('SOL');
    console.log('✅ Search results:', searchResults.length);
    if (searchResults.length > 0) {
      console.log('   First result:', searchResults[0]);
    }
    
    // 测试4: 获取特定代币价格（使用 SOL 地址）
    console.log('4. Testing token price...');
    const solAddress = 'So11111111111111111111111111111111111111112';
    const price = await realApi.getTokenPrice(solAddress);
    console.log('✅ SOL token price:', price, 'USD');
    
    console.log('✅ All DexScreener tests passed!');
    return { success: true, data: { solPrice, tokens, searchResults, price } };
  } catch (error) {
    console.error('❌ DexScreener test failed:', error);
    return { success: false, error };
  }
}

/**
 * 测试所有 API
 */
export async function testAllApis() {
  console.log('🚀 Starting API tests...\n');
  
  const results = {
    dexscreener: await testDexScreener(),
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('DexScreener:', results.dexscreener.success ? '✅ Pass' : '❌ Fail');
  
  return results;
}

// 如果在浏览器环境中，将测试函数挂载到 window 对象
if (typeof window !== 'undefined') {
  (window as any).testApis = testAllApis;
  (window as any).testDexScreener = testDexScreener;
  console.log('💡 API test functions available: window.testApis() or window.testDexScreener()');
}

