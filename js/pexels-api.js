/**
 * PexelsImageFetcher
 * 处理与Pexels图片API的通信，用于获取高质量免费图片
 */

class PexelsImageFetcher {
    /**
     * 初始化Pexels API客户端
     * @param {string} apiKey - Pexels API密钥
     */
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.pexels.com/v1';
        this.headers = {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json'
        };
    }

    /**
     * 搜索图片
     * @param {string} query - 搜索关键词
     * @param {number} perPage - 每页返回的图片数量，默认10张
     * @param {number} page - 页码，默认第1页
     * @param {string} orientation - 图片方向，可选：landscape, portrait, square
     * @param {string} size - 图片尺寸，可选：small, medium, large
     * @param {string} color - 图片主色调
     * @returns {Promise} - 返回搜索结果
     */
    async searchPhotos(query, perPage = 10, page = 1, orientation = null, size = null, color = null) {
        try {
            // 构建URL参数
            let url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`;
            
            // 添加可选参数
            if (orientation) url += `&orientation=${orientation}`;
            if (size) url += `&size=${size}`;
            if (color) url += `&color=${color}`;
            
            console.log(`搜索Pexels图片: ${query}`);
            
            // 执行请求
            const response = await this.fetchWithRetry(url);
            
            if (!response.ok) {
                throw new Error(`Pexels API请求错误: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`找到 ${data.photos.length} 张匹配图片`);
            
            // 如果没有找到图片，尝试更宽泛的搜索
            if (data.photos.length === 0 && query.includes(' ')) {
                // 取查询的第一个词
                const broaderQuery = query.split(' ')[0];
                console.log(`没有匹配的图片，尝试更宽泛的搜索: ${broaderQuery}`);
                return this.searchPhotos(broaderQuery, perPage, page, orientation, size, color);
            }
            
            return data;
        } catch (error) {
            console.error('Pexels API搜索失败:', error);
            
            // 返回空结果而不是抛出错误，以允许系统继续运行
            return { photos: [] };
        }
    }

    /**
     * 获取流行图片
     * @param {number} perPage - 每页返回的图片数量
     * @param {number} page - 页码
     * @returns {Promise} - 返回流行图片
     */
    async getCuratedPhotos(perPage = 10, page = 1) {
        try {
            const url = `${this.baseUrl}/curated?per_page=${perPage}&page=${page}`;
            const response = await this.fetchWithRetry(url);
            
            if (!response.ok) {
                throw new Error(`Pexels API请求错误: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('获取Pexels精选图片失败:', error);
            return { photos: [] };
        }
    }

    /**
     * 通过ID获取单张图片
     * @param {number} id - 图片ID
     * @returns {Promise} - 返回图片详情
     */
    async getPhoto(id) {
        try {
            const url = `${this.baseUrl}/photos/${id}`;
            const response = await this.fetchWithRetry(url);
            
            if (!response.ok) {
                throw new Error(`Pexels API请求错误: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`获取图片ID ${id} 失败:`, error);
            return null;
        }
    }

    /**
     * 带重试功能的fetch请求
     * @param {string} url - 请求URL
     * @param {number} retries - 重试次数
     * @returns {Promise} - fetch响应
     */
    async fetchWithRetry(url, retries = 3) {
        try {
            return await fetch(url, { headers: this.headers });
        } catch (err) {
            if (retries === 0) throw err;
            console.log(`Pexels API请求失败，${retries}秒后重试...`);
            
            // 等待一秒后重试
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.fetchWithRetry(url, retries - 1);
        }
    }

    /**
     * 获取随机关键词的图片
     * @param {number} count - 需要的图片数量
     * @returns {Promise} - 返回随机图片
     */
    async getRandomPhotos(count = 5) {
        const randomKeywords = [
            'nature', 'food', 'landscape', 'people', 'city', 'animals',
            'technology', 'business', 'health', 'travel', 'architecture'
        ];
        
        // 随机选择一个关键词
        const randomIndex = Math.floor(Math.random() * randomKeywords.length);
        const keyword = randomKeywords[randomIndex];
        
        return this.searchPhotos(keyword, count);
    }

    /**
     * 使用本地模拟数据（当API不可用时）
     * @param {string} query - 搜索关键词
     * @param {number} count - 需要的图片数量
     * @returns {Object} - 返回模拟的图片数据
     */
    getFallbackPhotos(query, count = 5) {
        console.log('使用备用图片数据');
        
        // 模拟图片数据
        const mockPhotos = [];
        
        for (let i = 0; i < count; i++) {
            mockPhotos.push({
                id: 1000 + i,
                width: 800,
                height: 600,
                url: '#',
                photographer: 'Pexels 摄影师',
                photographer_url: 'https://www.pexels.com',
                avg_color: '#4CAF50',
                src: {
                    original: 'images/pexels-placeholder.jpg',
                    large2x: 'images/pexels-placeholder.jpg',
                    large: 'images/pexels-placeholder.jpg',
                    medium: 'images/pexels-placeholder.jpg',
                    small: 'images/pexels-placeholder.jpg',
                    portrait: 'images/pexels-placeholder.jpg',
                    landscape: 'images/pexels-placeholder.jpg',
                    tiny: 'images/pexels-placeholder.jpg'
                },
                alt: `${query} 相关图片`
            });
        }
        
        return {
            page: 1,
            per_page: count,
            photos: mockPhotos,
            total_results: count
        };
    }
}

// 将类添加到全局作用域
window.PexelsImageFetcher = PexelsImageFetcher; 