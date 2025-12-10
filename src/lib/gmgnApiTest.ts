// GMGN API 测试工具
// 用于测试和调试 GMGN API 调用

import * as gmgnApi from './gmgnApi';
import * as gmgnApiDirect from './gmgnApiDirect';

/**
 * 测试所有 GMGN API 端点
 */
export async function testAllGMGNApis() {
  console.log('🧪 Testing GMGN APIs...\n');
  
  const results: Record<string, { success: boolean; data?: any; error?: string }> = {};

  // 测试1: 获取热门代币
  console.log('1. Testing getGMGNTrendingTokens...');
  try {
    const tokens = await gmgnApi.getGMGNTrendingTokens(5);
    results.trendingTokens = { success: true, data: tokens };
    console.log('✅ Success:', tokens.length, 'tokens');
    if (tokens.length > 0) {
      console.log('   First token:', tokens[0]);
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    results.trendingTokens = { success: false, error: errMsg };
    console.log('❌ Failed:', errMsg);
  }

  // 测试2: 直接 API 调用
  console.log('\n2. Testing getGMGNTrendingTokensDirect...');
  try {
    const tokens = await gmgnApiDirect.getGMGNTrendingTokensDirect(5);
    results.trendingTokensDirect = { success: true, data: tokens };
    console.log('✅ Success:', tokens.length, 'tokens');
    if (tokens.length > 0) {
      console.log('   First token:', tokens[0]);
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    results.trendingTokensDirect = { success: false, error: errMsg };
    console.log('❌ Failed:', errMsg);
  }

  // 测试3: 获取热门钱包
  console.log('\n3. Testing getGMGNTrendingWallets...');
  try {
    const wallets = await gmgnApi.getGMGNTrendingWallets(5);
    results.trendingWallets = { success: true, data: wallets };
    console.log('✅ Success:', wallets.length, 'wallets');
    if (wallets.length > 0) {
      console.log('   First wallet:', wallets[0]);
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    results.trendingWallets = { success: false, error: errMsg };
    console.log('❌ Failed:', errMsg);
  }

  // 测试4: 搜索代币
  console.log('\n4. Testing searchGMGNTokens...');
  try {
    const results_search = await gmgnApi.searchGMGNTokens('SOL');
    results.search = { success: true, data: results_search };
    console.log('✅ Success:', results_search.length, 'results');
    if (results_search.length > 0) {
      console.log('   First result:', results_search[0]);
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    results.search = { success: false, error: errMsg };
    console.log('❌ Failed:', errMsg);
  }

  // 测试5: 检查 API 可用性
  console.log('\n5. Testing checkGMGNApiAvailable...');
  try {
    const available = await gmgnApi.checkGMGNApiAvailable();
    results.available = { success: available, data: { available } };
    console.log(available ? '✅ GMGN website is accessible' : '❌ GMGN website is not accessible');
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    results.available = { success: false, error: errMsg };
    console.log('❌ Failed:', errMsg);
  }

  console.log('\n📊 Test Results Summary:');
  Object.entries(results).forEach(([key, result]) => {
    console.log(`${key}:`, result.success ? '✅' : '❌', result.error || '');
  });

  return results;
}

/**
 * 分析 GMGN 网站的实际 API 端点
 * 这个方法会尝试访问 GMGN 网站并分析网络请求
 */
export async function analyzeGMGNApiEndpoints() {
  console.log('🔍 Analyzing GMGN API endpoints...\n');
  console.log('To find the actual API endpoints:');
  console.log('1. Open https://gmgn.ai in your browser');
  console.log('2. Open Developer Tools (F12)');
  console.log('3. Go to Network tab');
  console.log('4. Filter by XHR/Fetch');
  console.log('5. Interact with the website (scroll, click, search)');
  console.log('6. Look for API requests and note the endpoints\n');
  
  // 尝试一些常见的端点模式
  const commonPatterns = [
    '/api/v1/tokens/trending',
    '/api/v1/sol/tokens/trending',
    '/api/v1/wallets/trending',
    '/api/v1/pairs/new',
    '/graphql',
    '/api/search',
  ];

  console.log('Testing common endpoint patterns:');
  for (const pattern of commonPatterns) {
    try {
      const url = `https://gmgn.ai${pattern}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://gmgn.ai/',
        },
      });
      console.log(`${pattern}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`${pattern}: Error - ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// 如果在浏览器环境中，将测试函数挂载到 window 对象
if (typeof window !== 'undefined') {
  (window as any).testGMGNApis = testAllGMGNApis;
  (window as any).analyzeGMGNApi = analyzeGMGNApiEndpoints;
  console.log('💡 GMGN API test functions available:');
  console.log('   - window.testGMGNApis() - Test all GMGN APIs');
  console.log('   - window.analyzeGMGNApi() - Analyze GMGN API endpoints');
}

