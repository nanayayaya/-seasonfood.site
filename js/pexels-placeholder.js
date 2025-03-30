/**
 * 临时占位图片生成器
 * 当Pexels API不可用时生成带有文字的占位图片
 */

// 创建一个临时canvas元素以生成占位图片
function createPlaceholderImage(width, height, text, backgroundColor = '#e9f5f0', textColor = '#27ae60') {
    // 创建canvas元素
    const canvas = document.createElement('canvas');
    canvas.width = width || 800;
    canvas.height = height || 600;
    
    // 获取绘图上下文
    const ctx = canvas.getContext('2d');
    
    // 填充背景
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制纹理图案
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < canvas.width; i += 20) {
        for (let j = 0; j < canvas.height; j += 20) {
            if ((i + j) % 40 === 0) {
                ctx.fillRect(i, j, 10, 10);
            }
        }
    }
    
    // 添加文字
    ctx.fillStyle = textColor;
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 若未提供文字，使用默认文字
    const displayText = text || 'SeasonFood.site 占位图片';
    
    // 绘制文字（添加阴影使文字更清晰）
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);
    
    // 添加边框标记
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 8;
    
    // 左上角标记
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(20, 60);
    ctx.moveTo(20, 20);
    ctx.lineTo(60, 20);
    ctx.stroke();
    
    // 右上角标记
    ctx.beginPath();
    ctx.moveTo(canvas.width - 20, 20);
    ctx.lineTo(canvas.width - 60, 20);
    ctx.moveTo(canvas.width - 20, 20);
    ctx.lineTo(canvas.width - 20, 60);
    ctx.stroke();
    
    // 左下角标记
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 20);
    ctx.lineTo(20, canvas.height - 60);
    ctx.moveTo(20, canvas.height - 20);
    ctx.lineTo(60, canvas.height - 20);
    ctx.stroke();
    
    // 右下角标记
    ctx.beginPath();
    ctx.moveTo(canvas.width - 20, canvas.height - 20);
    ctx.lineTo(canvas.width - 60, canvas.height - 20);
    ctx.moveTo(canvas.width - 20, canvas.height - 20);
    ctx.lineTo(canvas.width - 20, canvas.height - 60);
    ctx.stroke();
    
    // 添加尺寸信息
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText(`${canvas.width} x ${canvas.height}`, canvas.width / 2, canvas.height / 2 + 40);
    
    // 返回数据URL
    return canvas.toDataURL('image/jpeg', 0.8);
}

// 在window对象上添加这个函数，以便全局访问
window.createPlaceholderImage = createPlaceholderImage;

// 当页面加载完成时，创建占位图片
document.addEventListener('DOMContentLoaded', function() {
    // 在images目录中创建一个默认占位图片，用于应急情况
    if (!window.placeholderImageCreated) {
        // 使用blob将图片写入内存，可用于各种场景
        const dataUrl = createPlaceholderImage(800, 600, 'Pexels 图片占位符');
        
        // 转换为Blob对象
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeString });
        
        // 创建一个ObjectURL，可用于实际场景中
        window.pexelsPlaceholderUrl = URL.createObjectURL(blob);
        window.placeholderImageCreated = true;
        
        console.log('创建了Pexels占位图片');
    }
}); 