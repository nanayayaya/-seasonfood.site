/**
 * 区域性春季美食智能图片匹配脚本
 * 负责初始化世界各地区域性美食图片的智能匹配
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检查依赖项是否加载
    if (!window.PexelsImageFetcher || !window.SmartImageMatcher) {
        console.error('缺少必要的依赖项，请确保已加载pexels-api.js和smart-image-matcher.js');
        return;
    }
    
    // 初始化智能图片匹配器，使用优化的关键词配置
    const regionalMatcher = new SmartImageMatcher('NCD0WC5TmoqFUhfgeW2zKpA60KkWL8nnXkdFWIMMwb2dSQt02S9OuOg2', {
        // 区域性食物匹配的优化配置
        minKeywordLength: 3,
        maxKeywords: 5,
        imageCount: 1, // 每个区域容器只显示一张主图
        defaultKeywords: ['seasonal food', 'spring cuisine', 'traditional food'],
        priorityKeywords: [
            'cherry blossom', 'sakura', 'japan', 'hanami',  // 日本相关
            'mediterranean', 'artichoke', 'asparagus',      // 地中海相关
            'southeast asia', 'humidity', 'soup',           // 东南亚相关
            'nordic', 'birch sap', 'scandinavia'            // 北欧相关
        ],
        // 忽略一些常见但与食物无关的词
        ignoredWords: ['season', 'during', 'become', 'drawing', 'high', 'end', 'like']
    });
    
    // 为每个区域定义特定的关键词增强，确保获取到相关图片
    const regionKeywordEnhancers = {
        'japan-content': ['cherry blossom japan', 'sakura food', 'hanami', 'japanese spring'],
        'mediterranean-content': ['mediterranean cuisine', 'fresh artichokes', 'wild asparagus', 'spring vegetables'],
        'southeast-asia-content': ['southeast asian food', 'asian soup', 'spring humidity', 'traditional asian cuisine'],
        'nordic-content': ['nordic cuisine', 'birch sap', 'scandinavian food', 'nordic spring']
    };
    
    // 为每个区域设置专属的关键词增强函数
    const enhanceRegionKeywords = function(elementId, keywords) {
        // 检查是否有这个区域的专属关键词
        const regionId = elementId.replace('#', '');
        if (regionKeywordEnhancers[regionId]) {
            // 合并自动提取的关键词和预定义的增强关键词
            const enhancedKeywords = [...regionKeywordEnhancers[regionId], ...keywords];
            // 去重
            return [...new Set(enhancedKeywords)].slice(0, 5);
        }
        return keywords;
    };
    
    // 获取所有区域图片容器
    const regionImages = document.querySelectorAll('.region-image[data-smart-image]');
    
    // 为每个区域初始化智能图片
    regionImages.forEach(async (container) => {
        // 获取内容源选择器
        const contentSelector = container.getAttribute('data-content-source');
        if (!contentSelector) return;
        
        try {
            // 提取内容文本
            const contentText = regionalMatcher.extractTextFromElement(contentSelector);
            
            // 分析提取关键词
            let keywords = regionalMatcher.extractKeywords(contentText);
            
            // 应用区域特定的关键词增强
            keywords = enhanceRegionKeywords(contentSelector, keywords);
            console.log(`区域 ${contentSelector} 的关键词:`, keywords);
            
            // 获取匹配图片
            const images = await regionalMatcher.getMatchingImages(keywords);
            
            // 获取布局选项
            const layout = container.getAttribute('data-layout') || 'grid';
            const showPhotographer = container.getAttribute('data-show-photographer') !== 'false';
            
            // 显示图片
            regionalMatcher.displayImages(container, images, {
                layout: layout,
                animation: 'fade',
                showPhotographer: showPhotographer,
                showAttribution: true
            });
        } catch (error) {
            console.error(`处理区域 ${contentSelector} 时出错:`, error);
            
            // 失败时使用默认图片
            const defaultImages = await regionalMatcher.getMatchingImages(['regional food', 'spring cuisine']);
            regionalMatcher.displayImages(container, defaultImages, {
                layout: 'grid',
                animation: 'none'
            });
        }
    });
}); 