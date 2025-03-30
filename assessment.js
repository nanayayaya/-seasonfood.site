/**
 * Body Type Assessment JavaScript
 * 为体质评估工具提供交互功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const assessmentForm = document.getElementById('assessment-form');
    const resultsContainer = document.getElementById('results-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const currentQuestionSpan = document.getElementById('current-question');
    const progressFill = document.querySelector('.progress-fill');
    const retakeBtn = document.getElementById('retake-btn');
    const saveResultsBtn = document.getElementById('save-results-btn');
    const questionContainers = document.querySelectorAll('.question-container');
    const recTabs = document.querySelectorAll('.rec-tab');
    const recPanels = document.querySelectorAll('.rec-panel');

    // 当前问题索引
    let currentQuestionIndex = 0;
    const totalQuestions = questionContainers.length;

    // 初始化选项选择事件
    initOptions();

    // 为所有单选按钮添加事件监听
    function initOptions() {
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', function() {
                // 获取单选按钮和当前问题编号
                const radio = this.querySelector('input[type="radio"]');
                const questionNum = this.closest('.question-container').dataset.question;
                
                // 移除同组中所有选项的选中状态
                document.querySelectorAll(`input[name="${radio.name}"]`).forEach(r => {
                    r.closest('.option').classList.remove('selected');
                });
                
                // 选中当前选项
                radio.checked = true;
                this.classList.add('selected');
                
                // 检查是否可以继续到下一题
                updateButtonStates();
            });
        });
    }

    // 上一题按钮事件
    prevBtn.addEventListener('click', function() {
        if (currentQuestionIndex > 0) {
            showQuestion(currentQuestionIndex - 1);
        }
    });

    // 下一题按钮事件
    nextBtn.addEventListener('click', function() {
        if (currentQuestionIndex < totalQuestions - 1) {
            // 检查当前问题是否已回答
            const currentQuestion = questionContainers[currentQuestionIndex];
            const radioName = `q${currentQuestionIndex + 1}`;
            const answered = document.querySelector(`input[name="${radioName}"]:checked`);
            
            if (answered) {
                showQuestion(currentQuestionIndex + 1);
            } else {
                // 如果未回答，添加视觉提示
                currentQuestion.classList.add('unanswered');
                setTimeout(() => currentQuestion.classList.remove('unanswered'), 500);
            }
        }
    });

    // 提交按钮事件
    submitBtn.addEventListener('click', function() {
        const lastRadioName = `q${totalQuestions}`;
        const lastAnswered = document.querySelector(`input[name="${lastRadioName}"]:checked`);
        
        if (lastAnswered) {
            calculateResults();
            assessmentForm.style.display = 'none';
            resultsContainer.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // 重新测试按钮事件
    retakeBtn.addEventListener('click', function() {
        resetAssessment();
        assessmentForm.style.display = 'block';
        resultsContainer.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 保存结果按钮事件
    saveResultsBtn.addEventListener('click', function() {
        const bodyType = document.getElementById('body-type').textContent;
        const description = document.getElementById('type-description').textContent;
        
        // 生成分享卡片
        generateShareCard(bodyType, description);
    });

    // 生成分享卡片
    function generateShareCard(bodyType, description) {
        // 隐藏结果区域其他内容，显示分享部分
        const resultsHeader = document.querySelector('.results-header');
        const recommendations = document.querySelector('.recommendations');
        const resultsCta = document.querySelector('.results-cta');
        
        // 检查是否已存在分享部分
        let shareSection = document.querySelector('.share-section');
        if (shareSection) {
            // 如果已经存在，则显示它
            shareSection.style.display = 'block';
            return;
        }
        
        // 创建分享部分
        shareSection = document.createElement('div');
        shareSection.className = 'share-section';
        shareSection.innerHTML = `
            <h2>Share Your Body Type Assessment Results</h2>
            <p>Save the image below or share directly to social media</p>
            
            <div class="share-preview">
                <div id="share-card-container">
                    <canvas id="share-card" width="1000" height="1200"></canvas>
                </div>
            </div>
            
            <div class="share-options">
                <button class="share-btn tooltip" id="copy-link-btn">
                    <i class="fas fa-link"></i> Copy Link
                    <span class="tooltiptext">Copy result link</span>
                </button>
                <button class="share-btn tooltip" id="share-to-twitter">
                    <i class="fab fa-twitter"></i> Twitter
                    <span class="tooltiptext">Share to Twitter</span>
                </button>
                <button class="share-btn tooltip" id="share-to-facebook">
                    <i class="fab fa-facebook"></i> Facebook
                    <span class="tooltiptext">Share to Facebook</span>
                </button>
                <button class="share-btn tooltip" id="share-to-weibo">
                    <i class="fab fa-weibo"></i> Weibo
                    <span class="tooltiptext">Share to Weibo</span>
                </button>
            </div>
            
            <a href="#" download="my-body-type.png" id="download-share-btn" class="download-share-btn">
                <i class="fas fa-download"></i> Download Share Card
            </a>
            
            <button id="back-to-results-btn" class="btn secondary-btn" style="margin-top: 2rem;">
                Back to Detailed Results
            </button>
        `;
        
        // 插入到结果容器中
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.appendChild(shareSection);
        
        // 隐藏原有内容
        resultsHeader.style.display = 'none';
        recommendations.style.display = 'none';
        resultsCta.style.display = 'none';
        
        // 添加返回按钮事件
        const backToResultsBtn = document.getElementById('back-to-results-btn');
        backToResultsBtn.addEventListener('click', function() {
            shareSection.style.display = 'none';
            resultsHeader.style.display = 'block';
            recommendations.style.display = 'block';
            resultsCta.style.display = 'block';
        });
        
        // 绘制分享卡片
        drawShareCard(bodyType, description);
        
        // 复制链接按钮
        const copyLinkBtn = document.getElementById('copy-link-btn');
        copyLinkBtn.addEventListener('click', function() {
            // 创建一个带有体质类型参数的URL
            const shareUrl = `${window.location.origin}${window.location.pathname}?type=${encodeURIComponent(bodyType)}`;
            
            navigator.clipboard.writeText(shareUrl).then(function() {
                const tooltip = copyLinkBtn.querySelector('.tooltiptext');
                tooltip.textContent = 'Copied!';
                setTimeout(function() {
                    tooltip.textContent = 'Copy result link';
                }, 2000);
            });
        });
        
        // 社交媒体分享按钮
        document.getElementById('share-to-twitter').addEventListener('click', function() {
            const shareText = `My spring dietary body type is: ${bodyType}. Learn more about seasonal eating: `;
            const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent('https://seasonfood.site')}`;
            window.open(shareUrl, '_blank');
        });
        
        document.getElementById('share-to-facebook').addEventListener('click', function() {
            const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://seasonfood.site')}`;
            window.open(shareUrl, '_blank');
        });
        
        document.getElementById('share-to-weibo').addEventListener('click', function() {
            const shareText = `My spring dietary body type is: ${bodyType}. Learn more about seasonal eating: https://seasonfood.site`;
            const shareUrl = `http://service.weibo.com/share/share.php?url=${encodeURIComponent('https://seasonfood.site')}&title=${encodeURIComponent(shareText)}`;
            window.open(shareUrl, '_blank');
        });
        
        // 设置下载按钮
        const downloadBtn = document.getElementById('download-share-btn');
        const canvas = document.getElementById('share-card');
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const dataUrl = canvas.toDataURL('image/png');
            downloadBtn.href = dataUrl;
            downloadBtn.download = `SeasonFood-${bodyType}-BodyType.png`;
            
            // 为了在点击时触发下载
            const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            downloadBtn.dispatchEvent(event);
        });
    }

    // 绘制分享卡片
    function drawShareCard(bodyType, description) {
        const canvas = document.getElementById('share-card');
        const ctx = canvas.getContext('2d');
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 背景
        ctx.fillStyle = '#f9f9f9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 顶部绿色装饰条
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(0, 0, canvas.width, 15);
        
        // 顶部设计元素 - 波浪图案
        const gradient = ctx.createLinearGradient(0, 15, 0, 200);
        gradient.addColorStop(0, 'rgba(76, 175, 80, 0.2)');
        gradient.addColorStop(1, 'rgba(76, 175, 80, 0)');
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.moveTo(0, 15);
        
        // 创建波浪效果
        for (let i = 0; i < canvas.width; i += 20) {
            ctx.quadraticCurveTo(i + 10, 15 + 10, i + 20, 15);
        }
        
        ctx.lineTo(canvas.width, 200);
        ctx.lineTo(0, 200);
        ctx.closePath();
        ctx.fill();
        
        // 添加网站Logo
        ctx.fillStyle = '#333';
        ctx.font = 'bold 32px Playfair Display, serif';
        ctx.textAlign = 'center';
        ctx.fillText('SeasonFood', canvas.width / 2, 70);
        
        ctx.fillStyle = '#4caf50';
        ctx.font = 'bold 32px Playfair Display, serif';
        ctx.fillText('.site', canvas.width / 2 + 90, 70);
        
        // 副标题
        ctx.fillStyle = '#666';
        ctx.font = '20px Source Sans Pro, sans-serif';
        ctx.fillText('Spring Body Type Assessment', canvas.width / 2, 110);
        
        // 分割线
        ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 150, 140);
        ctx.lineTo(canvas.width / 2 + 150, 140);
        ctx.stroke();
        
        // 体质类型图标和名称
        let iconClass = '';
        let iconColor = '';
        
        switch(bodyType) {
            case 'Warm-Dry':
                iconClass = 'fire';
                iconColor = '#e67e22';
                break;
            case 'Warm-Damp':
                iconClass = 'cloud-sun';
                iconColor = '#f39c12';
                break;
            case 'Cool-Dry':
                iconClass = 'snowflake';
                iconColor = '#3498db';
                break;
            case 'Cool-Damp':
                iconClass = 'cloud-rain';
                iconColor = '#2980b9';
                break;
        }
        
        // 添加体质图标
        drawIcon(ctx, iconClass, canvas.width / 2, 210, 40, iconColor);
        
        // 体质名称
        ctx.fillStyle = '#333';
        ctx.font = 'bold 40px Playfair Display, serif';
        ctx.fillText(`${bodyType} Type`, canvas.width / 2, 290);
        
        // 体质描述
        ctx.fillStyle = '#666';
        ctx.font = '22px Source Sans Pro, sans-serif';
        ctx.textAlign = 'center';
        
        // 将描述文本拆分为多行
        const words = description.split(' ');
        let line = '';
        let lines = [];
        const maxWidth = canvas.width - 100;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth) {
                lines.push(line);
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line); // 添加最后一行
        
        // 绘制描述文本
        let y = 350;
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], canvas.width / 2, y);
            y += 30;
        }
        
        // 添加推荐食物标题
        y += 30;
        ctx.fillStyle = '#4caf50';
        ctx.font = 'bold 30px Playfair Display, serif';
        ctx.fillText('Recommended Spring Foods', canvas.width / 2, y);
        
        // 获取体质相关的推荐食物
        const recommendations = getBodyTypeRecommendations(bodyType);
        
        // 绘制食物推荐
        y += 50;
        const columnWidth = canvas.width / 2;
        let leftX = 100;
        let rightX = canvas.width / 2 + 50;
        let currentY = y;
        
        ctx.font = 'bold 22px Source Sans Pro, sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'left';
        
        // 推荐食用
        for (let i = 0; i < Math.min(recommendations.eat.length, 4); i++) {
            const food = recommendations.eat[i];
            if (i < 2) {
                // 左列
                drawFoodItem(ctx, food.name, food.description, leftX, currentY, '#4caf50');
                currentY += 70;
            } else if (i === 2) {
                // 右列第一项
                currentY = y;
                drawFoodItem(ctx, food.name, food.description, rightX, currentY, '#4caf50');
                currentY += 70;
            } else {
                // 右列其他项
                drawFoodItem(ctx, food.name, food.description, rightX, currentY, '#4caf50');
                currentY += 70;
            }
        }
        
        // 添加限制食物标题
        y += 160;
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 26px Playfair Display, serif';
        ctx.textAlign = 'center';
        ctx.fillText('Foods to Limit', canvas.width / 2, y);
        
        // 绘制限制食物
        y += 40;
        leftX = 100;
        rightX = canvas.width / 2 + 50;
        currentY = y;
        
        ctx.font = 'bold 22px Source Sans Pro, sans-serif';
        ctx.textAlign = 'left';
        
        for (let i = 0; i < Math.min(recommendations.limit.length, 4); i++) {
            const food = recommendations.limit[i];
            if (i < 2) {
                // 左列
                drawFoodItem(ctx, food.name, food.description, leftX, currentY, '#e74c3c');
                currentY += 70;
            } else if (i === 2) {
                // 右列第一项
                currentY = y;
                drawFoodItem(ctx, food.name, food.description, rightX, currentY, '#e74c3c');
                currentY += 70;
            } else {
                // 右列其他项
                drawFoodItem(ctx, food.name, food.description, rightX, currentY, '#e74c3c');
                currentY += 70;
            }
        }
        
        // 底部网站信息
        ctx.fillStyle = '#333';
        ctx.font = '18px Source Sans Pro, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Get your personalized seasonal diet plan at', canvas.width / 2, 1120);
        
        ctx.fillStyle = '#4caf50';
        ctx.font = 'bold 24px Source Sans Pro, sans-serif';
        ctx.fillText('www.seasonfood.site', canvas.width / 2, 1150);
        
        // 二维码区域提示
        ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(canvas.width - 150, canvas.height - 150, 100, 100);
        ctx.stroke();
        
        ctx.fillStyle = '#666';
        ctx.font = '16px Source Sans Pro, sans-serif';
        ctx.fillText('Scan for', canvas.width - 100, canvas.height - 110);
        ctx.fillText('more info', canvas.width - 100, canvas.height - 90);
    }

    // 绘制食物项目
    function drawFoodItem(ctx, name, description, x, y, color) {
        // 食物名称前的圆点
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x - 15, y - 10, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // 食物名称
        ctx.fillStyle = color;
        ctx.font = 'bold 22px Source Sans Pro, sans-serif';
        ctx.fillText(name, x, y);
        
        // 食物描述
        ctx.fillStyle = '#666';
        ctx.font = '18px Source Sans Pro, sans-serif';
        
        // 截断描述文本以适应空间
        const maxWidth = 350;
        let truncated = description;
        if (ctx.measureText(description).width > maxWidth) {
            truncated = description.substring(0, 45) + '...';
        }
        
        ctx.fillText(truncated, x + 10, y + 25);
    }

    // 绘制Font Awesome风格的图标
    function drawIcon(ctx, iconName, x, y, size, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        
        // 简单绘制基本图形来表示不同图标
        switch(iconName) {
            case 'fire':
                // 火焰图标
                ctx.beginPath();
                ctx.moveTo(x, y - size/2);
                ctx.quadraticCurveTo(x - size/3, y - size/4, x - size/4, y);
                ctx.quadraticCurveTo(x - size/3, y + size/4, x, y + size/2);
                ctx.quadraticCurveTo(x + size/3, y + size/4, x + size/4, y);
                ctx.quadraticCurveTo(x + size/3, y - size/4, x, y - size/2);
                ctx.fill();
                break;
                
            case 'cloud-sun':
                // 云太阳图标
                // 太阳
                ctx.beginPath();
                ctx.arc(x - size/4, y - size/4, size/3, 0, Math.PI * 2);
                ctx.fill();
                
                // 云
                ctx.beginPath();
                ctx.arc(x - size/4, y + size/4, size/4, 0, Math.PI * 2);
                ctx.arc(x, y + size/4, size/4, 0, Math.PI * 2);
                ctx.arc(x + size/4, y + size/4, size/4, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'snowflake':
                // 雪花图标
                for (let i = 0; i < 6; i++) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(i * Math.PI / 3);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, size/2);
                    ctx.lineWidth = size/12;
                    ctx.strokeStyle = color;
                    ctx.stroke();
                    
                    // 雪花分支
                    ctx.beginPath();
                    ctx.moveTo(0, size/3);
                    ctx.lineTo(size/6, size/2);
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.moveTo(0, size/3);
                    ctx.lineTo(-size/6, size/2);
                    ctx.stroke();
                    ctx.restore();
                }
                break;
                
            case 'cloud-rain':
                // 雨云图标
                // 云
                ctx.beginPath();
                ctx.arc(x - size/4, y - size/6, size/4, 0, Math.PI * 2);
                ctx.arc(x, y - size/6, size/4, 0, Math.PI * 2);
                ctx.arc(x + size/4, y - size/6, size/4, 0, Math.PI * 2);
                ctx.fill();
                
                // 雨滴
                for (let i = -1; i <= 1; i++) {
                    ctx.beginPath();
                    ctx.moveTo(x + i * size/4, y + size/6);
                    ctx.lineTo(x + i * size/4, y + size/2);
                    ctx.lineWidth = size/12;
                    ctx.strokeStyle = color;
                    ctx.stroke();
                }
                break;
        }
    }

    // 获取体质相关的推荐食物
    function getBodyTypeRecommendations(bodyType) {
        // 简化版数据库，用于分享卡片
        const recommendationsData = {
            'Warm-Dry': {
                eat: [
                    { name: 'Cucumber', description: 'Cool and watery properties help balance warm-dry constitution' },
                    { name: 'Avocado', description: 'Rich in healthy fats and moisture, provides moisturizing effects' },
                    { name: 'Spinach', description: 'Rich in minerals and moisture, helps with hydration' },
                    { name: 'Watermelon', description: 'Highly hydrating and cooling, ideal for late spring and early summer' }
                ],
                limit: [
                    { name: 'Chili Peppers', description: 'Overheats the constitution, increases dryness' },
                    { name: 'Alcohol', description: 'Has drying and heating effects, worsens constitutional imbalance' },
                    { name: 'Black Pepper', description: 'Strong heating spice that increases warmth and dryness' },
                    { name: 'Coffee', description: 'Stimulating and has drying effects' }
                ]
            },
            'Warm-Damp': {
                eat: [
                    { name: 'Bitter Leafy Greens', description: 'Helps clear damp heat and cool the constitution' },
                    { name: 'Asparagus', description: 'Natural diuretic effect, helps clear excess water' },
                    { name: 'Green Tea', description: 'Promotes metabolism, helps eliminate dampness' },
                    { name: 'Buckwheat', description: 'Drying and cooling grain that reduces humidity' }
                ],
                limit: [
                    { name: 'Dairy Products', description: 'Increases dampness, worsens constitutional discomfort' },
                    { name: 'Refined Sugar', description: 'Promotes dampness accumulation, causes inflammation' },
                    { name: 'Fried Foods', description: 'Heavy and produces dampness, difficult to digest' },
                    { name: 'Bananas', description: 'May increase dampness, especially when digestion is weak' }
                ]
            },
            'Cool-Dry': {
                eat: [
                    { name: 'Sweet Potato', description: 'Gently warming and moisturizing, provides sustained energy' },
                    { name: 'Clarified Butter', description: 'Warming healthy fat that warms the constitution' },
                    { name: 'Jujube Dates', description: 'Natural sweetness and moisturizing effect, nourishes blood' },
                    { name: 'Fresh Ginger', description: 'Warming effect, improves circulation' }
                ],
                limit: [
                    { name: 'Raw Vegetables', description: 'Too cooling for your system, difficult to digest' },
                    { name: 'Ice Water', description: 'Suppresses digestive fire, causes indigestion' },
                    { name: 'Frozen Foods', description: 'Too cooling and difficult to digest' },
                    { name: 'Carbonated Drinks', description: 'Cooling and disrupts digestive system balance' }
                ]
            },
            'Cool-Damp': {
                eat: [
                    { name: 'Quinoa', description: 'Warming and easy to digest, provides quality protein' },
                    { name: 'Ginger', description: 'Warming and drying effect, promotes digestion' },
                    { name: 'Garlic', description: 'Antibacterial and warming effect, strengthens immunity' },
                    { name: 'Pumpkin Seeds', description: 'Drying and nutritious, rich in minerals' },
                    { name: 'Mustard Greens', description: 'Spicy and drying, promotes metabolism' },
                    { name: 'Chickpeas', description: 'Warming and fiber-rich, helps eliminate dampness' },
                    { name: 'Chinese Yam', description: 'Strengthens spleen-qi, aids digestion without harming stomach' },
                    { name: 'Bitter Melon', description: 'Removes damp heat, has cooling and detoxifying properties' }
                ],
                limit: [
                    { name: 'Dairy Products', description: 'Increases dampness, especially cold dairy' },
                    { name: 'White Bread', description: 'Creates dampness stagnation, difficult to digest' },
                    { name: 'Ice Cream', description: 'Cold and produces dampness, increases phlegm' },
                    { name: 'Wheat Products', description: 'Can increase dampness, highly sticky' },
                    { name: 'Fruit Smoothies', description: 'Too cold, increases internal dampness' },
                    { name: 'Raw Cold Salads', description: 'Cold enters stomach, worsens spleen-stomach dampness and cold' }
                ]
            }
        };
        
        return recommendationsData[bodyType];
    }

    // 显示特定问题
    function showQuestion(index) {
        // 隐藏所有问题
        questionContainers.forEach(container => {
            container.classList.remove('active');
        });
        
        // 显示当前问题
        questionContainers[index].classList.add('active');
        currentQuestionIndex = index;
        
        // 更新问题计数和进度条
        currentQuestionSpan.textContent = index + 1;
        const progressPercentage = ((index + 1) / totalQuestions) * 100;
        progressFill.style.width = `${progressPercentage}%`;
        
        // 更新按钮状态
        updateButtonStates();
    }

    // 更新按钮状态
    function updateButtonStates() {
        // 如果是第一题，禁用上一题按钮
        prevBtn.disabled = currentQuestionIndex === 0;
        
        // 如果是最后一题，显示提交按钮而不是下一题按钮
        if (currentQuestionIndex === totalQuestions - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }

    // 重置评估
    function resetAssessment() {
        // 清除所有选择
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
            radio.closest('.option').classList.remove('selected');
        });
        
        // 重置到第一题
        showQuestion(0);
    }

    // 计算结果
    function calculateResults() {
        // 收集所有回答
        const answers = {};
        document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            answers[radio.name] = radio.value;
        });
        
        // 计算分数
        const scores = {
            warm: 0,
            cool: 0,
            dry: 0,
            damp: 0
        };
        
        // 基于选项增加分数
        // 温度
        if (answers.q1 === 'warm') scores.warm += 2;
        if (answers.q1 === 'cool') scores.cool += 2;
        
        // 皮肤
        if (answers.q2 === 'dry') scores.dry += 2;
        if (answers.q2 === 'oily') scores.damp += 2;
        
        // 消化
        if (answers.q3 === 'fast') scores.warm += 1;
        if (answers.q3 === 'slow') {
            scores.cool += 1;
            scores.damp += 1;
        }
        
        // 水分潴留
        if (answers.q4 === 'often') scores.damp += 2;
        if (answers.q4 === 'rarely') scores.dry += 1;
        
        // 能量水平
        if (answers.q5 === 'high') scores.warm += 1;
        if (answers.q5 === 'low') scores.cool += 1;
        
        // 体重倾向
        if (answers.q6 === 'difficult-gain') scores.dry += 1;
        if (answers.q6 === 'gain-easily') scores.damp += 1;
        
        // 春季反应
        if (answers.q7 === 'allergies') scores.damp += 1;
        if (answers.q7 === 'energized') scores.warm += 1;
        
        // 食物偏好
        if (answers.q8 === 'warm-heavy') scores.cool += 1;
        if (answers.q8 === 'cool-light') scores.warm += 1;
        if (answers.q8 === 'spicy-flavorful') scores.dry += 1;
        
        // 睡眠模式
        if (answers.q9 === 'light') {
            scores.warm += 1;
            scores.dry += 1;
        }
        if (answers.q9 === 'heavy') {
            scores.cool += 1;
            scores.damp += 1;
        }
        
        // 湿度反应
        if (answers.q10 === 'uncomfortable') scores.damp += 2;
        if (answers.q10 === 'like-dry') scores.dry += 1;
        
        // 心理倾向
        if (answers.q11 === 'active') scores.warm += 1;
        if (answers.q11 === 'calm') scores.cool += 1;
        
        // 断食反应
        if (answers.q12 === 'irritable') scores.warm += 1;
        if (answers.q12 === 'fine') scores.cool += 1;
        
        // 确定主导体质类型
        const dominantType = getDominantType(scores);
        
        // 显示结果
        displayResults(dominantType, scores);
        
        // 加载食物推荐
        loadFoodRecommendations(dominantType);
    }

    // 获取主导体质类型
    function getDominantType(scores) {
        // 确定温度和湿度得分
        const temperatureType = scores.warm > scores.cool ? 'warm' : 'cool';
        const moistureType = scores.dry > scores.damp ? 'dry' : 'damp';
        
        // 四种组合体质类型
        if (temperatureType === 'warm' && moistureType === 'dry') {
            return 'Warm-Dry';
        } else if (temperatureType === 'warm' && moistureType === 'damp') {
            return 'Warm-Damp';
        } else if (temperatureType === 'cool' && moistureType === 'dry') {
            return 'Cool-Dry';
        } else {
            return 'Cool-Damp';
        }
    }

    // 显示结果
    function displayResults(bodyType, scores) {
        const bodyTypeElem = document.getElementById('body-type');
        const typeDescriptionElem = document.getElementById('type-description');
        const resultIcon = document.getElementById('result-icon');
        
        // 设置体质类型
        bodyTypeElem.textContent = bodyType;
        
        // 设置体质描述和图标
        switch(bodyType) {
            case 'Warm-Dry':
                typeDescriptionElem.textContent = 'Your body tends to run warm and may be prone to dryness. In spring, you need foods that are cooling and moistening to maintain balance.';
                resultIcon.className = 'fas fa-fire';
                break;
            case 'Warm-Damp':
                typeDescriptionElem.textContent = 'Your body tends to run warm and may retain moisture. In spring, you need foods that are cooling and drying to maintain balance.';
                resultIcon.className = 'fas fa-cloud-sun';
                break;
            case 'Cool-Dry':
                typeDescriptionElem.textContent = 'Your body tends to run cool and may be prone to dryness. In spring, you need warming and moistening foods to maintain balance.';
                resultIcon.className = 'fas fa-snowflake';
                break;
            case 'Cool-Damp':
                typeDescriptionElem.textContent = 'Your body tends to run cool and may retain moisture. In spring, you need warming and drying foods to maintain balance.';
                resultIcon.className = 'fas fa-cloud-rain';
                break;
        }
    }

    // 加载食物推荐
    function loadFoodRecommendations(bodyType) {
        // 食物数据库 - 扩展版
        const foodRecommendations = {
            'Warm-Dry': {
                eat: [
                    { name: 'Cucumber', description: 'Cool and watery properties help balance warm-dry constitution', image: 'images/pexels-mali-64208.jpg', recipe: 'Cucumber Mint Cold Soup: Blend cucumber, mint, yogurt and a little olive oil, serve chilled' },
                    { name: 'Avocado', description: 'Rich in healthy fats and moisture, provides moisturizing effects', image: 'images/pexels-wendywei-1656666.jpg', recipe: 'Avocado Smoothie: A moisturizing drink made with avocado, banana, coconut milk and honey' },
                    { name: 'Spinach', description: 'Rich in minerals and moisture, helps with hydration', image: 'images/pexels-ella-olsson-572949-1640773.jpg', recipe: 'Spinach Quinoa Salad: Mix cooked quinoa with fresh spinach, olive oil and lemon juice' },
                    { name: 'Watermelon', description: 'Highly hydrating and cooling, ideal for late spring and early summer', image: 'images/pexels-pixabay-326281.jpg', recipe: 'Watermelon Mint Slush: Blend watermelon chunks, mint leaves and a little honey' },
                    { name: 'Coconut', description: 'Has tropical cooling effects and rich moisture content', image: 'images/pexels-cottonbro-3297882.jpg', recipe: 'Coconut Juice Marinated Fish: Marinate white fish in coconut juice, lime and herbs, lightly pan-fry' },
                    { name: 'Yogurt', description: 'Probiotic food with cooling properties', image: 'images/pexels-vanessa-loring-5082954.jpg', recipe: 'Yogurt Fruit Cup: Organic yogurt mixed with seasonal fruits and a touch of honey' },
                    { name: 'Tofu', description: 'Cooling food rich in protein and easy to digest', image: 'images/pexels-ella-olsson-572949-1640770.jpg', recipe: 'Cold Tofu Salad: Cubed tofu with cucumber strips, carrot julienne and sesame dressing' },
                    { name: 'Mushrooms', description: 'Neutral mild food suitable for warm-dry constitutions', image: 'images/Mushrooms.jpg', recipe: 'Mushroom Pasta: Light pasta with mushrooms, garlic and a little olive oil' }
                ],
                limit: [
                    { name: 'Chili Peppers', description: 'Overheats the constitution, increases dryness', image: 'images/Chipotle.jpg', alternative: 'Use small amounts of black pepper or herbs for flavor' },
                    { name: 'Alcohol', description: 'Has drying and heating effects, worsens constitutional imbalance', image: 'images/pexels-antonmislawsky-246747.jpg', alternative: 'Choose coconut water or herbal teas instead' },
                    { name: 'Black Pepper', description: 'Strong heating spice that increases warmth and dryness', image: 'images/pexels-pixabay-36438.jpg', alternative: 'Use small amounts of cumin or herbs for seasoning' },
                    { name: 'Coffee', description: 'Stimulating and has drying effects', image: 'images/greentea.jpg', alternative: 'Try chrysanthemum or mint tea' },
                    { name: 'Roasted Meats', description: 'High heating intensity and drying', image: 'images/pexels-pixabay-361184.jpg', alternative: 'Choose boiled or steamed cooking methods' },
                    { name: 'Fried Foods', description: 'Increases internal heat and difficult to digest', image: 'images/pexels-cottonbro-3338542.jpg', alternative: 'Try air frying or baking as alternative cooking methods' }
                ],
                herbs: [
                    { name: 'Mint', description: 'Cooling and refreshing effects, can relieve heat symptoms', image: 'images/pexels-mali-64208.jpg', usage: 'Make tea, cool drinks or add to fruit salads' },
                    { name: 'Cilantro', description: 'Detoxifying and cooling effects, balances warm-dry constitution', image: 'images/pexels-pixabay-326281.jpg', usage: 'Add to salads, soups or rice for fresh flavor' },
                    { name: 'Rose', description: 'Cooling and moisturizing effects, relieves dryness', image: 'images/pexels-pixabay-262967.jpg', usage: 'Make rose tea or add to desserts' },
                    { name: 'Licorice', description: 'Sweet and moisturizing, has anti-inflammatory effects', image: 'images/pexels-pixabay-327098.jpg', usage: 'Brew tea with other herbs, or make licorice tea' },
                    { name: 'Aloe', description: 'Strong moisturizing and repairing effects', image: 'images/pexels-cottonbro-3297882.jpg', usage: 'Can be made into aloe drinks or consume aloe gel directly' },
                    { name: 'Chamomile', description: 'Soothing and cooling properties, helps relaxation', image: 'images/pexels-mali-64208.jpg', usage: 'Drink chamomile tea before bed, or add to bath' }
                ]
            },
            'Warm-Damp': {
                eat: [
                    { name: 'Bitter Leafy Greens', description: 'Helps clear damp heat and cool the constitution', image: 'images/Bitterleafygreenvegetable.jpg', recipe: 'Bitter Greens Salad: Fresh bitter greens with olive oil, lemon juice and a little salt' },
                    { name: 'Asparagus', description: 'Natural diuretic effect, helps clear excess water', image: 'images/asparagus.jpg', recipe: 'Roasted Asparagus: Brush with olive oil and a little salt, roast and finish with lemon juice' },
                    { name: 'Green Tea', description: 'Promotes metabolism, helps eliminate dampness', image: 'images/greentea.jpg', recipe: 'Cold-Brewed Green Tea: Green tea cold brewed with lemon slices and mint leaves' },
                    { name: 'Buckwheat', description: 'Drying and cooling grain that reduces humidity', image: 'images/Buckwheat.jpg', recipe: 'Buckwheat Noodles: Cooked buckwheat noodles with fresh vegetables and a little soy sauce' },
                    { name: 'Radish', description: 'Clears damp heat, promotes digestion', image: 'images/radish.jpg', recipe: 'Radish Pickles: Thinly sliced radish marinated with vinegar, ginger and a little sea salt' },
                    { name: 'Celery', description: 'Natural diuretic, helps eliminate excess water', image: 'images/celery.jpg', recipe: 'Celery Juice: Celery, cucumber and a little ginger blended together' },
                    { name: "Job's Tears", description: 'Strengthens spleen and eliminates dampness gently', image: 'images/Job\'stearssoup.jpeg', recipe: 'Job\'s Tears and Red Bean Porridge: Cook Job\'s tears with red beans, add a little honey to taste' },
                    { name: 'Winter Melon', description: 'Clears heat and promotes urination, eliminates edema', image: 'images/waxgourd.jpg', recipe: 'Winter Melon Soup: Winter melon with a little lean meat and ginger in a clear soup' }
                ],
                limit: [
                    { name: 'Dairy Products', description: 'Increases dampness, worsens constitutional discomfort', image: 'images/pexels-ella-olsson-572949-1640772.jpg', alternative: 'Try almond milk or coconut milk instead' },
                    { name: 'Refined Sugar', description: 'Promotes dampness accumulation, causes inflammation', image: 'images/pexels-antonmislawsky-246747.jpg', alternative: 'Small amounts of honey or maple syrup as substitutes' },
                    { name: 'Fried Foods', description: 'Heavy and produces dampness, difficult to digest', image: 'images/pexels-cottonbro-3338542.jpg', alternative: 'Choose baked or steamed cooking methods' },
                    { name: 'Bananas', description: 'May increase dampness, especially when digestion is weak', image: 'images/pexels-brigitte-tohm-36757-239581.jpg', alternative: 'Choose pears or apples, which are drier fruits' },
                    { name: 'Concentrated Fruit Juices', description: 'High in sugar and cool, increases dampness', image: 'images/pexels-pixabay-326281.jpg', alternative: 'Choose fresh vegetable juices with ginger or mint added' },
                    { name: 'Peanut Butter', description: 'Highly sticky, can increase dampness', image: 'images/pexels-cottonbro-3297882.jpg', alternative: 'Try sesame paste or almond butter instead' }
                ],
                herbs: [
                    { name: 'Dandelion', description: 'Natural diuretic, helps eliminate dampness', image: 'images/pexels-pixabay-361184.jpg', usage: 'Make dandelion root tea or add leaves to salads' },
                    { name: 'Cardamom', description: 'Helps digest dampness, strengthens spleen and stomach function', image: 'images/pexels-pixabay-326281.jpg', usage: 'Add to curries, soups or tea for flavor' },
                    { name: 'Fennel Seeds', description: 'Drying and mild warming effect', image: 'images/pexels-pixabay-36438.jpg', usage: 'Grind and sprinkle on vegetables or fish for cooking' },
                    { name: 'Cinnamon', description: 'Warming but not too hot, promotes blood circulation', image: 'images/pexels-pixabay-262967.jpg', usage: 'Add to oatmeal, tea or fruit desserts' },
                    { name: 'Agastache', description: 'Aromatic herb that transforms dampness, benefits stomach', image: 'images/pexels-pixabay-327098.jpg', usage: 'Make agastache tea or use for seasoning meat and soups' },
                    { name: 'Patchouli', description: 'Clears summer heat, aromatic transforms dampness', image: 'images/pexels-mali-64208.jpg', usage: 'Brew with green tea or make patchouli porridge' }
                ]
            },
            'Cool-Dry': {
                eat: [
                    { name: 'Sweet Potato', description: 'Gently warming and moisturizing, provides sustained energy', image: 'images/sweetpotato.jpg', recipe: 'Mashed Sweet Potato: Baked sweet potato mashed with a little cinnamon and coconut oil' },
                    { name: 'Clarified Butter', description: 'Warming healthy fat that warms the constitution', image: 'images/butter.jpg', recipe: 'Turmeric Ghee: Clarified butter infused with turmeric and black pepper for flavoring dishes' },
                    { name: 'Jujube Dates', description: 'Natural sweetness and moisturizing effect, nourishes blood', image: 'images/jujube.jpg', recipe: 'Date and Walnut Porridge: Red dates, walnuts and brown rice cooked into breakfast porridge' },
                    { name: 'Fresh Ginger', description: 'Warming effect, improves circulation', image: 'images/freshginger.jpg', recipe: 'Ginger Tea: Fresh ginger slices steeped with lemon and honey' },
                    { name: 'Mutton', description: 'Warming protein source (for non-vegetarians)', image: 'images/mutton.jpg', recipe: 'Moroccan Lamb Stew: Lamb stewed with carrots, onions and warming spices' },
                    { name: 'Almonds', description: 'Healthy fats and nutrition, mild properties', image: 'images/almond.jpg', recipe: 'Almond Paste: Ground almonds mixed with warm water, cinnamon and honey' },
                    { name: 'Oats', description: 'Warming and moisturizing, provides stable energy', image: 'images/oat.jpg', recipe: 'Cinnamon Almond Oatmeal: Oats cooked with cinnamon, almonds and honey for a warming breakfast' },
                    { name: 'Pumpkin', description: 'Sweet and mild, nourishes yin', image: 'images/pumpkin.jpg', recipe: 'Ginger Pumpkin Soup: Pumpkin soup with ginger, onion and coconut milk' }
                ],
                limit: [
                    { name: 'Raw Vegetables', description: 'Too cooling for your system, difficult to digest', image: 'images/pexels-mali-64208.jpg', alternative: 'Choose lightly sautéed or steamed vegetables, add warming spices' },
                    { name: 'Ice Water', description: 'Suppresses digestive fire, causes indigestion', image: 'images/Chipotle.jpg', alternative: 'Drink room temperature water or warm water with ginger' },
                    { name: 'Frozen Foods', description: 'Too cooling and difficult to digest', image: 'images/pexels-cottonbro-3297882.jpg', alternative: 'Choose fresh ingredients, add warming spices when cooking' },
                    { name: 'Carbonated Drinks', description: 'Cooling and disrupts digestive system balance', image: 'images/greentea.jpg', alternative: 'Try ginger tea or warm herbal teas' },
                    { name: 'Cold Salads', description: 'Especially in cold weather, increases cold in the body', image: 'images/pexels-ella-olsson-572949-1640770.jpg', alternative: 'Warm Salads: Slightly warm grains and lightly cooked vegetables' },
                    { name: 'Ice Cream', description: 'Extremely cold, damages spleen-stomach yang energy', image: 'images/pexels-ella-olsson-572949-1640772.jpg', alternative: 'Warm fruit desserts or warm ginger milk pudding' }
                ],
                herbs: [
                    { name: 'Cinnamon', description: 'Warming and improves blood circulation, dispels cold', image: 'images/pexels-pixabay-262967.jpg', usage: 'Add to coffee, oatmeal or baked goods' },
                    { name: 'Ginger', description: 'Classic warming herb, promotes digestion', image: 'images/freshginger.jpg', usage: 'Make ginger tea or add to various dishes' },
                    { name: 'Cardamom', description: 'Warming and aromatic, has appetite-stimulating effects', image: 'images/pexels-mali-64208.jpg', usage: 'Use in curries, rice or Middle Eastern desserts' },
                    { name: 'Black Pepper', description: 'Mildly heating herb, promotes absorption', image: 'images/pexels-pixabay-36438.jpg', usage: 'Freshly ground for various dishes for seasoning' },
                    { name: 'Cloves', description: 'Strong warming effect, promotes blood circulation', image: 'images/pexels-pixabay-361184.jpg', usage: 'Use small amounts for meat marinades or hot drinks' },
                    { name: 'Nutmeg', description: 'Warms digestive system, boosts digestive fire', image: 'images/pexels-brigitte-tohm-36757-239581.jpg', usage: 'Use small amounts in rice, dairy products or baked goods' }
                ]
            },
            'Cool-Damp': {
                eat: [
                    { name: 'Quinoa', description: 'Warming and easy to digest, provides quality protein', image: 'images/pexels-ella-olsson-572949-1640770.jpg', recipe: 'Spiced Quinoa: Quinoa cooked with ginger, cloves and cinnamon, add nuts and dried fruits' },
                    { name: 'Ginger', description: 'Warming and drying effect, promotes digestion', image: 'images/freshginger.jpg', recipe: 'Ginger Scallion Fried Rice: Cooked brown rice stir-fried with plenty of ginger, scallions and a little olive oil' },
                    { name: 'Garlic', description: 'Antibacterial and warming effect, strengthens immunity', image: 'images/garlic.jpg', recipe: 'Roasted Garlic: Whole garlic head brushed with olive oil and roasted until soft, spread on whole grain bread' },
                    { name: 'Pumpkin Seeds', description: 'Drying and nutritious, rich in minerals', image: 'images/seeds.jpeg', recipe: 'Spiced Roasted Pumpkin Seeds: Pumpkin seeds mixed with turmeric, cumin and sea salt, then roasted' },
                    { name: 'Mustard Greens', description: 'Spicy and drying, promotes metabolism', image: 'images/pexels-ella-olsson-572949-1640773.jpg', recipe: 'Garlic Mustard Greens: Mustard greens quickly stir-fried with garlic and red chili' },
                    { name: 'Chickpeas', description: 'Warming and fiber-rich, helps eliminate dampness', image: 'images/pexels-wendywei-1656666.jpg', recipe: 'Spiced Roasted Chickpeas: Chickpeas roasted with cumin, chili powder and olive oil until crispy' },
                    { name: 'Chinese Yam', description: 'Strengthens spleen-qi, aids digestion without harming stomach', image: 'images/pexels-mali-64208.jpg', recipe: 'Chinese Yam and Goji Berry Porridge: Chinese yam with goji berries, red dates and a little astragalus cooked into porridge' },
                    { name: 'Bitter Melon', description: 'Removes damp heat, has cooling and detoxifying properties', image: 'images/pexels-pixabay-262967.jpg', recipe: 'Bitter Melon and Egg Stir-Fry: Bitter melon stir-fried with eggs, garlic and a little soy sauce' }
                ],
                limit: [
                    { name: 'Dairy Products', description: 'Increases dampness, especially cold dairy', image: 'images/pexels-ella-olsson-572949-1640772.jpg', alternative: 'Try warm plant milks or soy milk' },
                    { name: 'White Bread', description: 'Creates dampness stagnation, difficult to digest', image: 'images/pexels-cottonbro-3297882.jpg', alternative: 'Choose whole wheat bread or fermented bread' },
                    { name: 'Ice Cream', description: 'Cold and produces dampness, increases phlegm', image: 'images/greentea.jpg', alternative: 'Warm fruit desserts, such as baked apples or pears' },
                    { name: 'Wheat Products', description: 'Can increase dampness, highly sticky', image: 'images/pexels-brigitte-tohm-36757-239581.jpg', alternative: 'Choose oats, quinoa or brown rice as alternative grains' },
                    { name: 'Fruit Smoothies', description: 'Too cold, increases internal dampness', image: 'images/pexels-ella-olsson-572949-1640770.jpg', alternative: 'Warm fruit purees, add ginger or cinnamon' },
                    { name: 'Raw Cold Salads', description: 'Cold enters stomach, worsens spleen-stomach dampness and cold', image: 'images/pexels-mali-64208.jpg', alternative: 'Warm salads, such as warm quinoa vegetable salad' }
                ],
                herbs: [
                    { name: 'Turmeric', description: 'Anti-inflammatory and warming, promotes circulation', image: 'images/pexels-pixabay-361184.jpg', usage: 'Add to curries, soups or turmeric lattes' },
                    { name: 'Black Pepper', description: 'Enhances blood circulation, warms constitution', image: 'images/pexels-pixabay-36438.jpg', usage: 'Freshly ground for various dishes to add warmth' },
                    { name: 'Rosemary', description: 'Drying and stimulating effect, enhances memory', image: 'images/pexels-mali-64208.jpg', usage: 'Use for roasted meats, roasted vegetables or make rosemary tea' },
                    { name: 'Thyme', description: 'Warming and antibacterial, supports respiratory system', image: 'images/pexels-pixabay-262967.jpg', usage: 'Use for stews, soups or meat cooking' },
                    { name: 'Fennel Seeds', description: 'Warms stomach and disperses cold, regulates qi', image: 'images/pexels-pixabay-326281.jpg', usage: 'Grind and use for fish, soups or bread seasoning' },
                    { name: 'Anise', description: 'Warms middle-jiao, disperses cold, regulates qi', image: 'images/pexels-pixabay-36438.jpg', usage: 'Mix with other warming spices for meat marinades' }
                ]
            }
        };

        // 填充推荐食物
        const foodsToEat = document.getElementById('foods-to-eat');
        const foodsToLimit = document.getElementById('foods-to-limit');
        const beneficialHerbs = document.getElementById('beneficial-herbs');
        
        // 清空现有内容
        foodsToEat.innerHTML = '';
        foodsToLimit.innerHTML = '';
        beneficialHerbs.innerHTML = '';
        
        // 填充推荐食用食物
        foodRecommendations[bodyType].eat.forEach(food => {
            foodsToEat.innerHTML += createFoodItem(food, true);
        });
        
        // 填充限制食物
        foodRecommendations[bodyType].limit.forEach(food => {
            foodsToLimit.innerHTML += createLimitFoodItem(food);
        });
        
        // 填充有益草药
        foodRecommendations[bodyType].herbs.forEach(herb => {
            beneficialHerbs.innerHTML += createHerbItem(herb);
        });
    }

    // 创建推荐食物项目HTML
    function createFoodItem(food, showRecipe = false) {
        let recipeHtml = '';
        if (showRecipe && food.recipe) {
            recipeHtml = `<div class="food-recipe"><i class="fas fa-utensils"></i> ${food.recipe}</div>`;
        }
        
        return `
            <div class="food-item">
                <img src="${food.image}" alt="${food.name}">
                <h4>${food.name}</h4>
                <p>${food.description}</p>
                ${recipeHtml}
            </div>
        `;
    }

    // 创建限制食物项目HTML
    function createLimitFoodItem(food) {
        let alternativeHtml = '';
        if (food.alternative) {
            alternativeHtml = `<div class="food-alternative"><i class="fas fa-exchange-alt"></i> ${food.alternative}</div>`;
        }
        
        return `
            <div class="food-item limit-item">
                <img src="${food.image}" alt="${food.name}">
                <h4>${food.name}</h4>
                <p>${food.description}</p>
                ${alternativeHtml}
            </div>
        `;
    }

    // 创建草药项目HTML
    function createHerbItem(herb) {
        let usageHtml = '';
        if (herb.usage) {
            usageHtml = `<div class="herb-usage"><i class="fas fa-mortar-pestle"></i> ${herb.usage}</div>`;
        }
        
        return `
            <div class="food-item herb-item">
                <img src="${herb.image}" alt="${herb.name}">
                <h4>${herb.name}</h4>
                <p>${herb.description}</p>
                ${usageHtml}
            </div>
        `;
    }
}); 