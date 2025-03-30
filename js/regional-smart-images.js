/**
 * 区域性春季美食智能图片匹配脚本
 * 负责初始化世界各地区域性美食图片的智能匹配
 */

// 确保脚本在页面完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('初始化区域智能图片匹配系统...');
    
    // 在全局对象上检查依赖项
    if (typeof window.PexelsImageFetcher !== 'function') {
        console.error('错误: PexelsImageFetcher类未找到!');
        initFallbackImages();
        return;
    }
    
    if (typeof window.SmartImageMatcher !== 'function') {
        console.error('错误: SmartImageMatcher类未找到!');
        initFallbackImages();
        return;
    }
    
    console.log('依赖项检查通过，开始初始化匹配器...');
    
    // 为区域内容定义固定的测试图片
    // 这些是为不同区域指定的静态图片，确保在API不可用时仍能显示内容
    const fallbackImages = {
        'japan-content': {
            imageUrl: 'https://images.pexels.com/photos/5700184/pexels-photo-5700184.jpeg',
            alt: '日本樱花季节食物',
            photographer: 'Charlotte May'
        },
        'mediterranean-content': {
            imageUrl: 'https://images.pexels.com/photos/7448993/pexels-photo-7448993.jpeg',
            alt: '地中海新鲜蔬菜和食材',
            photographer: 'Taryn Elliott'
        },
        'southeast-asia-content': {
            imageUrl: 'https://images.pexels.com/photos/1117493/pexels-photo-1117493.jpeg',
            alt: '东南亚美食汤',
            photographer: 'Dana Tentis'
        },
        'nordic-content': {
            imageUrl: 'https://images.pexels.com/photos/4091020/pexels-photo-4091020.jpeg', 
            alt: '北欧树汁和森林食物',
            photographer: 'Polina Kovaleva'
        }
    };
    
    // API请求模拟模式 - 当API不可用时使用这个模式
    const useSimulatedMode = true;  // 设置为true表示使用模拟数据而非实际API调用
    
    try {
        // 初始化智能图片匹配器，使用优化的关键词配置
        console.log('创建智能图片匹配器实例...');
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
        
        console.log('智能图片匹配器创建成功');
        
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
        
        // 模拟API响应的函数
        function simulateApiResponse(regionId) {
            const fallback = fallbackImages[regionId] || fallbackImages['japan-content'];
            
            return {
                photos: [{
                    id: Math.floor(Math.random() * 1000),
                    width: 800,
                    height: 600,
                    url: fallback.imageUrl,
                    photographer: fallback.photographer,
                    photographer_url: 'https://www.pexels.com',
                    src: {
                        original: fallback.imageUrl,
                        large2x: fallback.imageUrl,
                        large: fallback.imageUrl,
                        medium: fallback.imageUrl,
                        small: fallback.imageUrl,
                        portrait: fallback.imageUrl,
                        landscape: fallback.imageUrl,
                        tiny: fallback.imageUrl
                    },
                    alt: fallback.alt
                }]
            };
        }
        
        // 修改Pexels API调用功能，确保在API不可用时使用备用图片
        const originalSearchPhotos = regionalMatcher.pexelsApi.searchPhotos;
        regionalMatcher.pexelsApi.searchPhotos = async function(query, perPage = 10, page = 1, orientation = null, size = null, color = null) {
            console.log(`准备搜索图片: ${query}`);
            
            // 如果是模拟模式，返回预定义图片
            if (useSimulatedMode) {
                console.log('使用模拟模式，返回预定义图片');
                // 从查询中提取区域ID
                let regionId = null;
                for (const id in regionKeywordEnhancers) {
                    if (regionKeywordEnhancers[id].some(keyword => query.includes(keyword))) {
                        regionId = id;
                        break;
                    }
                }
                
                // 如果没有找到匹配的区域ID，使用默认值
                if (!regionId) {
                    // 找出查询词最匹配的区域
                    let bestMatchScore = 0;
                    let bestMatchRegion = 'japan-content';
                    
                    for (const id in regionKeywordEnhancers) {
                        const keywords = regionKeywordEnhancers[id];
                        let score = 0;
                        
                        keywords.forEach(keyword => {
                            if (query.includes(keyword)) {
                                score += 1;
                            }
                        });
                        
                        if (score > bestMatchScore) {
                            bestMatchScore = score;
                            bestMatchRegion = id;
                        }
                    }
                    
                    regionId = bestMatchRegion;
                }
                
                console.log(`使用区域 ${regionId} 的模拟图片`);
                return simulateApiResponse(regionId);
            }
            
            // 否则尝试实际API调用
            try {
                console.log('尝试实际API调用...');
                return await originalSearchPhotos.call(this, query, perPage, page, orientation, size, color);
            } catch (error) {
                console.error('API调用失败，使用备用图片:', error);
                return this.getFallbackPhotos(query, perPage);
            }
        };
        
        // 获取所有区域图片容器
        console.log('查找区域图片容器...');
        const regionImages = document.querySelectorAll('.region-image[data-smart-image]');
        console.log(`找到 ${regionImages.length} 个区域图片容器`);
        
        // 为每个区域初始化智能图片
        regionImages.forEach(async (container, index) => {
            // 获取内容源选择器
            const contentSelector = container.getAttribute('data-content-source');
            if (!contentSelector) {
                console.error('错误: 区域容器缺少data-content-source属性');
                return;
            }
            
            console.log(`处理区域 #${index + 1}: ${contentSelector}`);
            
            try {
                // 提取内容文本
                const contentText = regionalMatcher.extractTextFromElement(contentSelector);
                console.log(`提取的文本: "${contentText.substring(0, 50)}..."`);
                
                // 分析提取关键词
                let keywords = regionalMatcher.extractKeywords(contentText);
                console.log(`提取的关键词: ${keywords.join(', ')}`);
                
                // 应用区域特定的关键词增强
                keywords = enhanceRegionKeywords(contentSelector, keywords);
                console.log(`增强后的关键词: ${keywords.join(', ')}`);
                
                // 获取匹配图片
                console.log(`为区域 ${contentSelector} 获取图片...`);
                const images = await regionalMatcher.getMatchingImages(keywords);
                console.log(`获取到 ${images.length} 张图片`);
                
                // 获取布局选项
                const layout = container.getAttribute('data-layout') || 'grid';
                const showPhotographer = container.getAttribute('data-show-photographer') !== 'false';
                
                console.log(`显示图片: 布局=${layout}, 显示摄影师=${showPhotographer}`);
                
                // 显示图片
                regionalMatcher.displayImages(container, images, {
                    layout: layout,
                    animation: 'fade',
                    showPhotographer: showPhotographer,
                    showAttribution: true
                });
                
                console.log(`区域 ${contentSelector} 处理完成`);
            } catch (error) {
                console.error(`处理区域 ${contentSelector} 时出错:`, error);
                
                // 如果出错，显示区域的备用图片
                const regionId = contentSelector.replace('#', '');
                const fallback = fallbackImages[regionId];
                
                if (fallback) {
                    console.log(`使用 ${regionId} 的备用图片`);
                    
                    // 创建备用图片HTML
                    const fallbackHtml = `
                        <div class="smart-image-container">
                            <div class="smart-image-wrapper">
                                <img src="${fallback.imageUrl}" alt="${fallback.alt}" class="smart-image">
                                <div class="smart-image-info">
                                    <span class="smart-image-photographer">摄影: ${fallback.photographer}</span>
                                    <a href="https://www.pexels.com" class="smart-image-attribution" target="_blank">通过Pexels</a>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    container.innerHTML = fallbackHtml;
                } else {
                    // 创建一个通用占位图
                    const placeholderImageUrl = createPlaceholderImage(800, 600, `${regionId} 图片`);
                    const placeholderHtml = `
                        <div class="smart-image-container">
                            <div class="smart-image-wrapper">
                                <img src="${placeholderImageUrl}" alt="${regionId} 图片" class="smart-image">
                            </div>
                        </div>
                    `;
                    
                    container.innerHTML = placeholderHtml;
                }
            }
        });
        
    } catch (error) {
        console.error('初始化智能图片匹配系统时出错:', error);
        initFallbackImages();
    }
    
    // 全局回退函数，当系统无法正常工作时调用
    function initFallbackImages() {
        console.log('使用备用图片初始化所有区域...');
        
        const regionImages = document.querySelectorAll('.region-image[data-smart-image]');
        
        regionImages.forEach(container => {
            const contentSelector = container.getAttribute('data-content-source');
            if (!contentSelector) return;
            
            const regionId = contentSelector.replace('#', '');
            const fallback = fallbackImages[regionId];
            
            if (fallback) {
                // 创建备用图片HTML
                const fallbackHtml = `
                    <div class="smart-image-container">
                        <div class="smart-image-wrapper">
                            <img src="${fallback.imageUrl}" alt="${fallback.alt}" class="smart-image">
                            <div class="smart-image-info">
                                <span class="smart-image-photographer">摄影: ${fallback.photographer}</span>
                                <a href="https://www.pexels.com" class="smart-image-attribution" target="_blank">通过Pexels</a>
                            </div>
                        </div>
                    </div>
                `;
                
                container.innerHTML = fallbackHtml;
            } else {
                // 如果没有该区域的备用图片，使用占位图片
                const placeholderImageUrl = window.createPlaceholderImage ? 
                    window.createPlaceholderImage(800, 600, `${regionId} 图片`) :
                    '';
                    
                const placeholderHtml = `
                    <div class="smart-image-container">
                        <div class="smart-image-wrapper">
                            <img src="${placeholderImageUrl || 'images/pexels-placeholder.jpg'}" alt="${regionId} 图片" class="smart-image">
                        </div>
                    </div>
                `;
                
                container.innerHTML = placeholderHtml;
            }
        });
    }
}); 