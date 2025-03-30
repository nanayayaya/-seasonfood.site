/**
 * Pexels API 图片获取工具
 * 自动根据关键词获取相关的免费图片
 */

class PexelsImageFetcher {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.pexels.com/v1/';
    }

    /**
     * 根据关键词搜索图片
     * @param {string} query - 搜索关键词
     * @param {number} perPage - 每页图片数量
     * @param {number} page - 页码
     * @returns {Promise} - 返回图片数据的Promise对象
     */
    async searchPhotos(query, perPage = 10, page = 1) {
        try {
            const url = `${this.baseUrl}search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': this.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('获取图片时出错:', error);
            throw error;
        }
    }

    /**
     * 获取精选图片
     * @param {number} perPage - 每页图片数量
     * @param {number} page - 页码
     * @returns {Promise} - 返回图片数据的Promise对象
     */
    async getCuratedPhotos(perPage = 10, page = 1) {
        try {
            const url = `${this.baseUrl}curated?per_page=${perPage}&page=${page}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': this.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('获取精选图片时出错:', error);
            throw error;
        }
    }

    /**
     * 下载图片到服务器
     * @param {string} imageUrl - 图片URL
     * @param {string} filename - 保存的文件名
     * @returns {Promise} - 返回下载结果的Promise对象
     */
    async downloadImage(imageUrl, filename) {
        // 注意：这个方法需要在服务器端运行，浏览器中无法直接保存文件
        // 这里提供一个示例代码，实际使用时需要通过服务器端代码实现
        console.log(`下载图片: ${imageUrl} 到 ${filename}`);
        
        // 服务器端代码示例（需要在Node.js环境中运行）:
        /*
        const fs = require('fs');
        const https = require('https');
        const path = require('path');
        
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(path.join('images', filename));
            https.get(imageUrl, response => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(filename);
                });
            }).on('error', err => {
                fs.unlink(path.join('images', filename));
                reject(err);
            });
        });
        */
    }

    /**
     * 根据网站关键词自动获取相关图片
     * @param {Array} keywords - 关键词数组
     * @param {number} imagesPerKeyword - 每个关键词获取的图片数量
     * @returns {Promise} - 返回所有图片数据的Promise对象
     */
    async fetchImagesForWebsite(keywords, imagesPerKeyword = 5) {
        const results = {};
        
        for (const keyword of keywords) {
            try {
                console.log(`获取关键词"${keyword}"的图片...`);
                const data = await this.searchPhotos(keyword, imagesPerKeyword);
                results[keyword] = data.photos;
            } catch (error) {
                console.error(`获取关键词"${keyword}"的图片时出错:`, error);
                results[keyword] = [];
            }
        }
        
        return results;
    }

    /**
     * 将获取的图片展示在页面上
     * @param {string} containerId - 容器元素的ID
     * @param {Array} photos - 图片数据数组
     */
    displayImages(containerId, photos) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`未找到ID为"${containerId}"的容器元素`);
            return;
        }
        
        // 清空容器
        container.innerHTML = '';
        
        // 添加图片
        photos.forEach(photo => {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'pexels-image';
            
            const img = document.createElement('img');
            img.src = photo.src.medium;
            img.alt = photo.photographer;
            img.dataset.original = photo.src.original;
            
            const photographer = document.createElement('p');
            photographer.textContent = `摄影师: ${photo.photographer}`;
            
            const attribution = document.createElement('a');
            attribution.href = photo.url;
            attribution.target = '_blank';
            attribution.textContent = '查看Pexels';
            
            imageDiv.appendChild(img);
            imageDiv.appendChild(photographer);
            imageDiv.appendChild(attribution);
            container.appendChild(imageDiv);
        });
    }
}

// 网站关键词示例
const websiteKeywords = [
    'seasonal food', 
    'healthy eating', 
    'vegetables', 
    'fruits', 
    'whole grains',
    'nutrition',
    'cooking',
    'meal preparation',
    'organic food',
    'farm fresh'
];

// 初始化图片获取器
const pexelsFetcher = new PexelsImageFetcher('NCD0WC5TmoqFUhfgeW2zKpA60KkWL8nnXkdFWIMMwb2dSQt02S9OuOg2');

// 使用示例：在页面加载完成后获取图片
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 获取"seasonal food"相关的图片
        const data = await pexelsFetcher.searchPhotos('seasonal food', 9);
        
        // 如果页面上有图片展示区域，则显示图片
        if (document.getElementById('pexels-gallery')) {
            pexelsFetcher.displayImages('pexels-gallery', data.photos);
        }
        
        console.log('获取到的图片数据:', data);
    } catch (error) {
        console.error('获取图片失败:', error);
    }
});

// 导出图片获取器，供其他模块使用
window.PexelsImageFetcher = PexelsImageFetcher; 