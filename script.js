// SeasonFood.site - JavaScript功能

// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', function() {
    // 移动端菜单切换
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // 切换图标
            const icon = mobileMenuBtn.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // 关闭移动菜单（如果打开）
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
                
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 固定导航栏效果
    const navbar = document.querySelector('.navbar');
    const header = document.querySelector('.header');
    
    if (navbar && header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > header.offsetHeight / 2) {
                navbar.classList.add('fixed-nav');
            } else {
                navbar.classList.remove('fixed-nav');
            }
        });
    }
    
    // 功能标签页切换
    const featureTabs = document.querySelectorAll('.feature-tab');
    const featurePanels = document.querySelectorAll('.feature-panel');
    
    if (featureTabs.length > 0 && featurePanels.length > 0) {
        featureTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // 移除所有标签的活动状态
                featureTabs.forEach(t => t.classList.remove('active'));
                // 设置当前标签为活动状态
                this.classList.add('active');
                
                // 获取目标面板ID
                const targetPanel = this.getAttribute('data-tab');
                
                // 隐藏所有面板
                featurePanels.forEach(panel => {
                    panel.classList.remove('active');
                });
                
                // 显示目标面板
                const activePanel = document.getElementById(targetPanel);
                if (activePanel) {
                    activePanel.classList.add('active');
                }
            });
        });
    }
    
    // 简单的图片懒加载
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // 表单提交事件
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email) {
                // 通常这里会有AJAX请求发送到服务器
                // 这里简单模拟
                alert('感谢订阅我们的时节食物通讯！');
                emailInput.value = '';
            }
        });
    }
    
    // 动画效果
    function fadeInElements() {
        const elements = document.querySelectorAll('.fade-in');
        
        elements.forEach(element => {
            const position = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (position < windowHeight * 0.9) {
                element.classList.add('visible');
            }
        });
    }
    
    // 添加fade-in类到需要动画的元素
    const animatedElements = document.querySelectorAll('.trend-card, .ingredient-item, .region-card, .recipe-card, .health-card, .visual-item, .feature-card');
    
    animatedElements.forEach(element => {
        element.classList.add('fade-in');
    });
    
    // 初始检查
    fadeInElements();
    
    // 滚动时检查
    window.addEventListener('scroll', fadeInElements);
}); 