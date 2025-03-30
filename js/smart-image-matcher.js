/**
 * 智能图片匹配系统
 * 实现网站内容与Pexels图片的智能匹配
 * 功能：语义分析、自动API调用、自适应展示
 */

class SmartImageMatcher {
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey;
        this.pexelsApi = new PexelsImageFetcher(apiKey);
        
        // 默认配置
        this.options = {
            minKeywordLength: 3,           // 最小关键词长度
            maxKeywords: 5,                // 最大关键词数量
            minKeywordFrequency: 2,        // 最小关键词频率
            ignoredWords: [],              // 忽略的常见词
            priorityKeywords: [],          // 优先考虑的关键词
            imageCount: 3,                 // 每个区域显示的图片数量
            defaultKeywords: ['seasonal', 'food', 'healthy'], // 默认关键词
            cacheDuration: 24 * 60 * 60 * 1000, // 缓存时间（24小时）
            ...options
        };
        
        // 常见的停用词（不作为关键词）
        this.stopWords = new Set([
            'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
            'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
            'to', 'from', 'by', 'for', 'with', 'about', 'as', 'in', 'on', 'at',
            'of', 'that', 'this', 'these', 'those', 'it', 'its', 'they', 'them',
            'their', 'there', 'here', 'some', 'any', 'all', 'not', 'no', 'yes',
            '的', '了', '和', '与', '或', '在', '是', '有', '这', '那', '他们',
            '我们', '你们', '它', '其', '可以', '就是', '也是', '都是', '还是'
        ]);
        
        // 添加用户定义的忽略词
        if (this.options.ignoredWords && Array.isArray(this.options.ignoredWords)) {
            this.options.ignoredWords.forEach(word => this.stopWords.add(word.toLowerCase()));
        }
        
        // 图片缓存
        this.imageCache = new Map();
        this.initFromLocalStorage();
    }
    
    /**
     * 从localStorage初始化缓存
     */
    initFromLocalStorage() {
        try {
            const cachedData = localStorage.getItem('pexelsImageCache');
            if (cachedData) {
                const data = JSON.parse(cachedData);
                // 检查缓存是否过期
                Object.keys(data).forEach(key => {
                    const item = data[key];
                    if (Date.now() - item.timestamp < this.options.cacheDuration) {
                        this.imageCache.set(key, item.data);
                    }
                });
            }
        } catch (error) {
            console.error('从缓存加载图片数据失败:', error);
        }
    }
    
    /**
     * 保存数据到缓存
     */
    saveToCache(key, data) {
        this.imageCache.set(key, data);
        
        try {
            const cacheData = {};
            this.imageCache.forEach((value, k) => {
                cacheData[k] = {
                    timestamp: Date.now(),
                    data: value
                };
            });
            localStorage.setItem('pexelsImageCache', JSON.stringify(cacheData));
        } catch (error) {
            console.error('保存图片数据到缓存失败:', error);
        }
    }
    
    /**
     * 分析文本内容提取关键词
     * @param {string} text - 要分析的文本
     * @returns {Array} - 提取的关键词数组
     */
    extractKeywords(text) {
        if (!text || typeof text !== 'string') {
            return this.options.defaultKeywords;
        }
        
        // 预处理文本
        const cleanText = text.toLowerCase()
            .replace(/[,.?!;:()"'\-_]/g, ' ')  // 去除标点符号
            .replace(/\s+/g, ' ')              // 多个空格替换为单个
            .trim();
            
        // 分词
        const words = cleanText.split(' ');
        
        // 统计词频
        const wordFrequency = {};
        words.forEach(word => {
            // 忽略太短的词和停用词
            if (word.length < this.options.minKeywordLength || this.stopWords.has(word)) {
                return;
            }
            
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
        
        // 根据词频排序
        const sortedWords = Object.keys(wordFrequency)
            .filter(word => wordFrequency[word] >= this.options.minKeywordFrequency)
            .sort((a, b) => {
                // 优先考虑用户定义的优先关键词
                const aPriority = this.options.priorityKeywords.includes(a);
                const bPriority = this.options.priorityKeywords.includes(b);
                
                if (aPriority && !bPriority) return -1;
                if (!aPriority && bPriority) return 1;
                
                // 然后按词频排序
                return wordFrequency[b] - wordFrequency[a];
            });
        
        // 取前N个关键词
        const keywords = sortedWords.slice(0, this.options.maxKeywords);
        
        // 如果没有提取到足够的关键词，使用默认关键词补充
        if (keywords.length < this.options.maxKeywords) {
            this.options.defaultKeywords.forEach(keyword => {
                if (keywords.length < this.options.maxKeywords && !keywords.includes(keyword)) {
                    keywords.push(keyword);
                }
            });
        }
        
        return keywords;
    }
    
    /**
     * 从页面元素中提取文本用于分析
     * @param {HTMLElement|string} element - 页面元素或选择器
     * @returns {string} - 提取的文本
     */
    extractTextFromElement(element) {
        let targetElement;
        
        if (typeof element === 'string') {
            targetElement = document.querySelector(element);
        } else if (element instanceof HTMLElement) {
            targetElement = element;
        } else {
            return '';
        }
        
        if (!targetElement) {
            return '';
        }
        
        // 提取元素和其子元素的文本内容
        const extractTexts = (elem) => {
            let texts = [];
            
            // 提取标题、段落、列表等重要内容
            const importantContent = elem.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li');
            importantContent.forEach(node => {
                texts.push(node.textContent);
            });
            
            // 如果没有找到重要内容，使用元素的所有文本
            if (texts.length === 0) {
                texts.push(elem.textContent);
            }
            
            return texts.join(' ');
        };
        
        return extractTexts(targetElement);
    }
    
    /**
     * 基于提取的关键词获取匹配图片
     * @param {Array} keywords - 关键词数组
     * @returns {Promise} - 图片数据的Promise
     */
    async getMatchingImages(keywords) {
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
            keywords = this.options.defaultKeywords;
        }
        
        // 构建主要查询词
        const primaryQuery = keywords.slice(0, 2).join(' ');
        
        // 检查缓存
        const cacheKey = primaryQuery;
        if (this.imageCache.has(cacheKey)) {
            console.log(`从缓存获取图片: ${cacheKey}`);
            return this.imageCache.get(cacheKey);
        }
        
        try {
            console.log(`正在搜索图片: ${primaryQuery}`);
            const response = await this.pexelsApi.searchPhotos(primaryQuery, this.options.imageCount * 2);
            
            // 过滤并优化结果
            let optimizedResults = this.optimizeImageResults(response.photos, keywords);
            
            // 保存到缓存
            this.saveToCache(cacheKey, optimizedResults);
            
            return optimizedResults;
        } catch (error) {
            console.error('获取匹配图片失败:', error);
            throw error;
        }
    }
    
    /**
     * 优化图片结果，确保与关键词最匹配
     * @param {Array} photos - Pexels API返回的图片数组
     * @param {Array} keywords - 关键词数组
     * @returns {Array} - 优化后的图片数组
     */
    optimizeImageResults(photos, keywords) {
        if (!photos || photos.length === 0) return [];
        
        // 基于关键词匹配度对图片进行评分
        const scoredPhotos = photos.map(photo => {
            let score = 0;
            
            // 检查图片标题、描述和标签是否包含关键词
            const photoText = [
                photo.photographer.toLowerCase(),
                photo.alt ? photo.alt.toLowerCase() : '',
                photo.url.toLowerCase()
            ].join(' ');
            
            // 计算每个关键词的匹配分数
            keywords.forEach((keyword, index) => {
                // 关键词权重随位置递减
                const weight = 1 - (index * 0.15);
                
                if (photoText.includes(keyword.toLowerCase())) {
                    score += weight * 10;
                }
            });
            
            // 优先考虑横向图片（适合网页展示）
            if (photo.width > photo.height) {
                score += 5;
            }
            
            // 优先考虑颜色丰富的图片
            if (photo.avg_color && photo.avg_color !== '#000000' && photo.avg_color !== '#ffffff') {
                score += 3;
            }
            
            return {
                photo,
                score
            };
        });
        
        // 按分数排序
        scoredPhotos.sort((a, b) => b.score - a.score);
        
        // 返回分数最高的图片
        return scoredPhotos.slice(0, this.options.imageCount).map(item => item.photo);
    }
    
    /**
     * 智能匹配并显示图片
     * @param {string} elementSelector - 内容元素选择器
     * @param {string} targetSelector - 图片容器选择器
     * @param {Object} displayOptions - 显示选项
     */
    async matchAndDisplayImages(elementSelector, targetSelector, displayOptions = {}) {
        try {
            // 1. 提取内容文本
            const contentText = this.extractTextFromElement(elementSelector);
            
            // 2. 分析提取关键词
            const keywords = this.extractKeywords(contentText);
            console.log('提取的关键词:', keywords);
            
            // 3. 获取匹配图片
            const images = await this.getMatchingImages(keywords);
            
            // 4. 显示图片
            this.displayImages(targetSelector, images, displayOptions);
            
            return {
                keywords,
                images
            };
        } catch (error) {
            console.error('图片匹配失败:', error);
            
            // 如果失败，尝试使用默认关键词
            const defaultImages = await this.getMatchingImages(this.options.defaultKeywords);
            this.displayImages(targetSelector, defaultImages, displayOptions);
            
            return {
                keywords: this.options.defaultKeywords,
                images: defaultImages
            };
        }
    }
    
    /**
     * 显示图片到指定容器
     * @param {string} targetSelector - 目标容器选择器
     * @param {Array} images - 图片数据数组
     * @param {Object} options - 显示选项
     */
    displayImages(targetSelector, images, options = {}) {
        const container = document.querySelector(targetSelector);
        if (!container) {
            console.error(`未找到目标容器: ${targetSelector}`);
            return;
        }
        
        // 默认显示选项
        const displayOptions = {
            layout: 'grid',           // grid, slider, masonry
            showPhotographer: true,   // 显示摄影师信息
            showAttribution: true,    // 显示Pexels归属信息
            lazyLoad: true,           // 延迟加载
            responsiveSizes: true,    // 响应式尺寸
            animation: 'fade',        // 动画效果: fade, slide, none
            className: 'smart-image', // 图片类名
            ...options
        };
        
        // 清空容器
        container.innerHTML = '';
        container.className = `smart-image-container ${displayOptions.layout}`;
        
        // 如果没有图片，显示占位符
        if (!images || images.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'smart-image-placeholder';
            placeholder.innerHTML = `
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM13.96 12.29L11.21 15.83L9.25 13.47L6.5 17H17.5L13.96 12.29Z" fill="#cccccc"/>
                </svg>
                <p>暂无匹配图片</p>
            `;
            container.appendChild(placeholder);
            return;
        }
        
        // 创建图片元素并添加到容器
        images.forEach((image, index) => {
            const imageWrapper = document.createElement('div');
            imageWrapper.className = `${displayOptions.className}-wrapper`;
            
            // 添加动画类
            if (displayOptions.animation !== 'none') {
                imageWrapper.classList.add(`animation-${displayOptions.animation}`);
                imageWrapper.style.animationDelay = `${index * 0.15}s`;
            }
            
            // 创建图片元素
            const img = document.createElement('img');
            
            // 设置响应式尺寸属性
            if (displayOptions.responsiveSizes) {
                // 使用srcset提供不同尺寸选项
                img.srcset = `
                    ${image.src.medium} 400w,
                    ${image.src.large} 800w,
                    ${image.src.large2x} 1600w
                `;
                img.sizes = '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw';
            }
            
            // 主图片源
            img.src = image.src.medium;
            img.alt = image.alt || '季节性食物图片';
            img.className = displayOptions.className;
            
            // 懒加载设置
            if (displayOptions.lazyLoad) {
                img.loading = 'lazy';
            }
            
            // 添加点击放大功能
            img.addEventListener('click', () => {
                this.showLightbox(image);
            });
            
            // 创建图片信息元素
            if (displayOptions.showPhotographer || displayOptions.showAttribution) {
                const imageInfo = document.createElement('div');
                imageInfo.className = `${displayOptions.className}-info`;
                
                if (displayOptions.showPhotographer) {
                    const photographer = document.createElement('span');
                    photographer.className = `${displayOptions.className}-photographer`;
                    photographer.textContent = `摄影: ${image.photographer}`;
                    imageInfo.appendChild(photographer);
                }
                
                if (displayOptions.showAttribution) {
                    const attribution = document.createElement('a');
                    attribution.className = `${displayOptions.className}-attribution`;
                    attribution.href = image.url;
                    attribution.target = '_blank';
                    attribution.rel = 'noopener noreferrer';
                    attribution.textContent = '通过Pexels';
                    imageInfo.appendChild(attribution);
                }
                
                imageWrapper.appendChild(imageInfo);
            }
            
            // 添加到容器
            imageWrapper.appendChild(img);
            container.appendChild(imageWrapper);
        });
    }
    
    /**
     * 显示图片灯箱
     * @param {Object} image - 图片数据
     */
    showLightbox(image) {
        // 创建灯箱元素
        const lightbox = document.createElement('div');
        lightbox.className = 'smart-image-lightbox';
        
        // 创建灯箱内容
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <img src="${image.src.large2x}" alt="${image.alt || '季节性食物图片'}">
                <div class="lightbox-info">
                    <p>摄影: ${image.photographer}</p>
                    <a href="${image.url}" target="_blank" rel="noopener noreferrer">在Pexels上查看</a>
                </div>
                <button class="lightbox-close">&times;</button>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(lightbox);
        
        // 防止页面滚动
        document.body.style.overflow = 'hidden';
        
        // 添加关闭功能
        const closeBtn = lightbox.querySelector('.lightbox-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(lightbox);
            document.body.style.overflow = '';
        });
        
        // 点击灯箱背景关闭
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                document.body.removeChild(lightbox);
                document.body.style.overflow = '';
            }
        });
    }
    
    /**
     * 初始化页面所有智能图片区域
     * 会查找页面上所有带有data-smart-image属性的元素
     */
    initAllSmartImageAreas() {
        // 查找所有智能图片容器
        const smartImageAreas = document.querySelectorAll('[data-smart-image]');
        
        smartImageAreas.forEach(async (container) => {
            // 获取配置
            const contentSelector = container.getAttribute('data-content-source');
            const options = {
                layout: container.getAttribute('data-layout') || 'grid',
                showPhotographer: container.getAttribute('data-show-photographer') !== 'false',
                showAttribution: container.getAttribute('data-show-attribution') !== 'false',
                lazyLoad: container.getAttribute('data-lazy-load') !== 'false',
                animation: container.getAttribute('data-animation') || 'fade'
            };
            
            // 如果没有指定内容源，使用容器的上一个兄弟元素
            const sourceElement = contentSelector 
                ? document.querySelector(contentSelector) 
                : container.previousElementSibling;
            
            if (sourceElement) {
                // 匹配并显示图片
                await this.matchAndDisplayImages(sourceElement, container, options);
            } else {
                console.warn(`未找到图片内容源: ${container.id || container.className}`);
                // 使用默认关键词
                const images = await this.getMatchingImages(this.options.defaultKeywords);
                this.displayImages(container, images, options);
            }
        });
    }
}

// 添加必要的CSS样式
const addSmartImageStyles = () => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* 智能图片容器样式 */
        .smart-image-container {
            margin: 20px 0;
            width: 100%;
        }
        
        /* 网格布局 */
        .smart-image-container.grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
        }
        
        /* 瀑布流布局 */
        .smart-image-container.masonry {
            columns: 3;
            column-gap: 20px;
        }
        
        .smart-image-container.masonry .smart-image-wrapper {
            margin-bottom: 20px;
            break-inside: avoid;
        }
        
        /* 幻灯片布局 */
        .smart-image-container.slider {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 10px;
        }
        
        .smart-image-container.slider .smart-image-wrapper {
            flex: 0 0 auto;
            width: 300px;
            margin-right: 20px;
            scroll-snap-align: start;
        }
        
        /* 图片包装器 */
        .smart-image-wrapper {
            position: relative;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }
        
        .smart-image-wrapper:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        
        /* 图片样式 */
        .smart-image {
            width: 100%;
            height: 250px;
            object-fit: cover;
            display: block;
            transition: transform 0.5s ease;
        }
        
        .smart-image-wrapper:hover .smart-image {
            transform: scale(1.05);
        }
        
        /* 图片信息 */
        .smart-image-info {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            padding: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .smart-image-wrapper:hover .smart-image-info {
            opacity: 1;
        }
        
        .smart-image-photographer {
            margin-right: auto;
        }
        
        .smart-image-attribution {
            color: #ffffff;
            text-decoration: none;
            background: rgba(46, 204, 113, 0.8);
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 10px;
            transition: background-color 0.3s ease;
        }
        
        .smart-image-attribution:hover {
            background: rgba(46, 204, 113, 1);
        }
        
        /* 动画效果 */
        .animation-fade {
            opacity: 0;
            animation: fadeIn 0.6s forwards;
        }
        
        .animation-slide {
            opacity: 0;
            transform: translateY(20px);
            animation: slideUp 0.6s forwards;
        }
        
        @keyframes fadeIn {
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* 灯箱样式 */
        .smart-image-lightbox {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }
        
        .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
        }
        
        .lightbox-content img {
            max-width: 100%;
            max-height: 80vh;
            object-fit: contain;
            border-radius: 5px;
        }
        
        .lightbox-info {
            position: absolute;
            bottom: -40px;
            left: 0;
            right: 0;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .lightbox-info a {
            color: white;
            background: rgba(46, 204, 113, 0.8);
            padding: 5px 10px;
            border-radius: 3px;
            text-decoration: none;
        }
        
        .lightbox-close {
            position: absolute;
            top: -40px;
            right: 0;
            background: none;
            border: none;
            color: white;
            font-size: 30px;
            cursor: pointer;
        }
        
        /* 占位符样式 */
        .smart-image-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 200px;
            background: #f5f5f5;
            border-radius: 8px;
            padding: 20px;
            color: #999;
        }
        
        /* 响应式调整 */
        @media (max-width: 768px) {
            .smart-image-container.grid {
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            }
            
            .smart-image-container.masonry {
                columns: 2;
            }
        }
        
        @media (max-width: 480px) {
            .smart-image-container.grid {
                grid-template-columns: 1fr;
            }
            
            .smart-image-container.masonry {
                columns: 1;
            }
            
            .smart-image {
                height: 200px;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
};

// 页面加载时添加样式
document.addEventListener('DOMContentLoaded', addSmartImageStyles);

// 导出类，供其他模块使用
window.SmartImageMatcher = SmartImageMatcher; 