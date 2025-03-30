/**
 * 智能图片匹配系统演示文件
 * 展示如何在网站中使用智能图片匹配功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检查依赖项是否加载
    if (!window.PexelsImageFetcher || !window.SmartImageMatcher) {
        console.error('缺少必要的依赖项，请确保已加载pexels-api.js和smart-image-matcher.js');
        return;
    }
    
    // 初始化智能图片匹配器
    const smartMatcher = new SmartImageMatcher('NCD0WC5TmoqFUhfgeW2zKpA60KkWL8nnXkdFWIMMwb2dSQt02S9OuOg2', {
        // 自定义配置
        minKeywordLength: 4,
        maxKeywords: 6,
        imageCount: 4,
        defaultKeywords: ['seasonal food', 'healthy eating', 'organic', 'vegetables'],
        priorityKeywords: ['seasonal', 'food', 'vegetable', 'fruit', 'healthy', 'nutrition'],
        ignoredWords: ['page', 'website', 'click', 'view', 'menu']
    });
    
    // 自动初始化所有智能图片区域
    smartMatcher.initAllSmartImageAreas();
    
    // 为动态内容添加匹配功能
    const addSmartImageButton = document.getElementById('add-smart-image');
    if (addSmartImageButton) {
        addSmartImageButton.addEventListener('click', async function() {
            // 获取内容区域和图片容器
            const contentArea = document.getElementById('dynamic-content');
            const imageContainer = document.getElementById('dynamic-images');
            
            if (!contentArea || !imageContainer) {
                console.error('找不到动态内容区域或图片容器');
                return;
            }
            
            // 显示加载中
            imageContainer.innerHTML = '<div class="loading">正在分析内容并查找匹配图片...</div>';
            
            // 智能匹配并显示图片
            await smartMatcher.matchAndDisplayImages(
                contentArea,
                imageContainer,
                {
                    layout: 'masonry',
                    animation: 'slide'
                }
            );
        });
    }
    
    // 添加文章内容变化监听器
    const articleEditor = document.getElementById('article-editor');
    const articleImages = document.getElementById('article-images');
    
    if (articleEditor && articleImages) {
        // 防抖函数
        function debounce(func, delay) {
            let timer;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timer);
                timer = setTimeout(() => func.apply(context, args), delay);
            };
        }
        
        // 防抖处理内容变化
        const handleContentChange = debounce(async function() {
            const content = articleEditor.value;
            
            // 如果内容太少，不触发匹配
            if (content.length < 20) return;
            
            // 显示加载指示器
            articleImages.innerHTML = '<div class="loading">正在分析内容并匹配图片...</div>';
            
            // 提取关键词
            const keywords = smartMatcher.extractKeywords(content);
            console.log('从文章内容提取的关键词:', keywords);
            
            // 获取匹配图片
            const images = await smartMatcher.getMatchingImages(keywords);
            
            // 显示图片
            smartMatcher.displayImages(articleImages, images, {
                layout: 'grid',
                animation: 'fade'
            });
        }, 1000); // 1秒延迟
        
        // 监听内容变化
        articleEditor.addEventListener('input', handleContentChange);
    }
    
    // 演示不同布局类型
    const layoutSelector = document.getElementById('layout-selector');
    const demoImageContainer = document.getElementById('demo-images');
    
    if (layoutSelector && demoImageContainer) {
        layoutSelector.addEventListener('change', async function() {
            const selectedLayout = this.value;
            
            // 获取演示图片
            const demoKeywords = ['seasonal food', 'healthy eating'];
            const images = await smartMatcher.getMatchingImages(demoKeywords);
            
            // 使用选定的布局显示图片
            smartMatcher.displayImages(demoImageContainer, images, {
                layout: selectedLayout,
                animation: 'fade'
            });
        });
        
        // 初始加载
        layoutSelector.dispatchEvent(new Event('change'));
    }
    
    // 为区域内容元素创建悬浮提示
    document.querySelectorAll('[data-smart-image]').forEach(container => {
        const contentSelector = container.getAttribute('data-content-source');
        if (contentSelector) {
            const contentElement = document.querySelector(contentSelector);
            if (contentElement) {
                // 创建提示元素
                const tooltip = document.createElement('div');
                tooltip.className = 'smart-image-tooltip';
                tooltip.innerHTML = '这个区域使用智能图片匹配';
                
                // 添加到内容元素
                contentElement.style.position = 'relative';
                contentElement.appendChild(tooltip);
                
                // 鼠标悬停显示提示
                contentElement.addEventListener('mouseenter', () => {
                    tooltip.style.opacity = '1';
                });
                
                contentElement.addEventListener('mouseleave', () => {
                    tooltip.style.opacity = '0';
                });
            }
        }
    });
    
    // 添加关键词提取演示功能
    const keywordExtractButton = document.getElementById('extract-keywords');
    const textInput = document.getElementById('text-input');
    const keywordsOutput = document.getElementById('keywords-output');
    
    if (keywordExtractButton && textInput && keywordsOutput) {
        keywordExtractButton.addEventListener('click', function() {
            const text = textInput.value;
            if (text.length < 10) {
                keywordsOutput.innerHTML = '<p class="error">请输入更多文本以提取关键词</p>';
                return;
            }
            
            const keywords = smartMatcher.extractKeywords(text);
            
            // 显示关键词
            keywordsOutput.innerHTML = '';
            keywords.forEach(keyword => {
                const keywordSpan = document.createElement('span');
                keywordSpan.className = 'keyword-tag';
                keywordSpan.textContent = keyword;
                keywordsOutput.appendChild(keywordSpan);
            });
        });
    }
}); 