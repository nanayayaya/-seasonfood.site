/**
 * 季节性食物日历
 * 展示每周处于最佳新鲜度的春季食材
 */

document.addEventListener('DOMContentLoaded', function() {
    // 当前日期和月份
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();
    
    // 定义季节 (北半球)
    const seasons = {
        spring: [2, 3, 4], // 3-5月
        summer: [5, 6, 7], // 6-8月
        fall: [8, 9, 10],  // 9-11月
        winter: [11, 0, 1] // 12-2月
    };
    
    // 确定当前季节
    let currentSeason = '';
    for (const season in seasons) {
        if (seasons[season].includes(currentMonth)) {
            currentSeason = season;
            break;
        }
    }
    
    // 春季应季食材数据库（按周排列）
    const springFoods = {
        march: {
            week1: {
                vegetables: ['菠菜', '韭菜', '荠菜', '香椿', '豌豆苗'],
                fruits: ['草莓', '樱桃'],
                others: ['春笋', '香椿']
            },
            week2: {
                vegetables: ['菠菜', '韭菜', '荠菜', '香椿', '豌豆苗', '芦笋'],
                fruits: ['草莓', '樱桃'],
                others: ['春笋', '蕨菜']
            },
            week3: {
                vegetables: ['菠菜', '韭菜', '荠菜', '芦笋', '豌豆苗'],
                fruits: ['草莓', '樱桃'],
                others: ['春笋', '蕨菜', '香椿']
            },
            week4: {
                vegetables: ['菠菜', '韭菜', '荠菜', '芦笋', '豌豆苗', '油麦菜'],
                fruits: ['草莓', '樱桃'],
                others: ['春笋', '蕨菜']
            }
        },
        april: {
            week1: {
                vegetables: ['芦笋', '菠菜', '荠菜', '油麦菜', '生菜'],
                fruits: ['草莓', '樱桃', '杨梅'],
                others: ['春笋', '香椿']
            },
            week2: {
                vegetables: ['芦笋', '菠菜', '莴笋', '油麦菜', '生菜'],
                fruits: ['草莓', '樱桃', '杨梅'],
                others: ['蕨菜']
            },
            week3: {
                vegetables: ['芦笋', '菠菜', '莴笋', '油麦菜', '生菜', '豆角'],
                fruits: ['草莓', '樱桃', '杨梅', '枇杷'],
                others: ['竹笋']
            },
            week4: {
                vegetables: ['芦笋', '莴笋', '油麦菜', '生菜', '豆角', '茭白'],
                fruits: ['草莓', '杨梅', '枇杷'],
                others: ['竹笋']
            }
        },
        may: {
            week1: {
                vegetables: ['芦笋', '莴笋', '生菜', '豆角', '茭白', '黄瓜'],
                fruits: ['杨梅', '枇杷', '桑葚'],
                others: ['竹笋', '新鲜香菇']
            },
            week2: {
                vegetables: ['豆角', '茭白', '黄瓜', '茄子', '西红柿'],
                fruits: ['杨梅', '枇杷', '桑葚', '樱桃'],
                others: ['新鲜香菇']
            },
            week3: {
                vegetables: ['豆角', '茭白', '黄瓜', '茄子', '西红柿', '丝瓜'],
                fruits: ['杨梅', '桑葚', '樱桃', '西瓜'],
                others: ['新鲜香菇']
            },
            week4: {
                vegetables: ['豆角', '茭白', '黄瓜', '茄子', '西红柿', '丝瓜', '苦瓜'],
                fruits: ['杨梅', '樱桃', '西瓜', '桃子'],
                others: ['新鲜香菇']
            }
        }
    };
    
    // 生成当前月份和周次
    const getMonthAndWeek = () => {
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const month = monthNames[currentMonth];
        
        // 计算当前是本月第几周
        const weekOfMonth = Math.ceil(currentDate / 7);
        const week = `week${weekOfMonth <= 4 ? weekOfMonth : 4}`; // 第5周归入第4周
        
        return { month, week };
    };
    
    // 获取当前月份和周次的应季食材
    const getCurrentSeasonalFoods = () => {
        const { month, week } = getMonthAndWeek();
        
        // 如果是春季，直接从数据中获取
        if (currentSeason === 'spring' && springFoods[month] && springFoods[month][week]) {
            return springFoods[month][week];
        }
        
        // 其他季节暂时返回空数据
        return {
            vegetables: [],
            fruits: [],
            others: []
        };
    };
    
    // 显示食物日历
    const renderFoodCalendar = () => {
        const calendarContainer = document.getElementById('seasonal-food-calendar');
        if (!calendarContainer) return;
        
        const { month, week } = getMonthAndWeek();
        const monthName = month.charAt(0).toUpperCase() + month.slice(1);
        const weekNumber = week.replace('week', '');
        
        // 获取当前应季食材
        const foods = getCurrentSeasonalFoods();
        
        // 构建HTML内容
        let html = `
            <div class="calendar-header">
                <h2>本周应季食材</h2>
                <p class="current-date">${monthName} 第${weekNumber}周</p>
            </div>
            <div class="foods-container">
        `;
        
        // 蔬菜部分
        html += `
            <div class="food-category">
                <h3>蔬菜</h3>
                <div class="food-items">
        `;
        
        if (foods.vegetables.length > 0) {
            foods.vegetables.forEach(vegetable => {
                html += `<span class="food-tag">${vegetable}</span>`;
            });
        } else {
            html += `<p class="no-data">当前季节暂无数据</p>`;
        }
        
        html += `
                </div>
            </div>
        `;
        
        // 水果部分
        html += `
            <div class="food-category">
                <h3>水果</h3>
                <div class="food-items">
        `;
        
        if (foods.fruits.length > 0) {
            foods.fruits.forEach(fruit => {
                html += `<span class="food-tag">${fruit}</span>`;
            });
        } else {
            html += `<p class="no-data">当前季节暂无数据</p>`;
        }
        
        html += `
                </div>
            </div>
        `;
        
        // 其他食材部分
        html += `
            <div class="food-category">
                <h3>其他</h3>
                <div class="food-items">
        `;
        
        if (foods.others.length > 0) {
            foods.others.forEach(other => {
                html += `<span class="food-tag">${other}</span>`;
            });
        } else {
            html += `<p class="no-data">当前季节暂无数据</p>`;
        }
        
        html += `
                </div>
            </div>
        `;
        
        // 月历查看按钮
        html += `
            <div class="calendar-actions">
                <button id="view-month-calendar" class="calendar-btn">查看月历</button>
                <button id="view-next-week" class="calendar-btn">下一周</button>
            </div>
        `;
        
        html += `</div>`;
        
        // 输出HTML内容
        calendarContainer.innerHTML = html;
        
        // 添加月历查看按钮事件
        document.getElementById('view-month-calendar').addEventListener('click', showMonthCalendar);
        document.getElementById('view-next-week').addEventListener('click', showNextWeek);
    };
    
    // 显示月度日历
    const showMonthCalendar = () => {
        const calendarContainer = document.getElementById('seasonal-food-calendar');
        if (!calendarContainer) return;
        
        const { month } = getMonthAndWeek();
        const monthName = month.charAt(0).toUpperCase() + month.slice(1);
        
        // 获取整月的食材数据
        const monthData = springFoods[month];
        
        if (!monthData) {
            calendarContainer.innerHTML = `
                <div class="calendar-header">
                    <h2>${monthName}月应季食材</h2>
                    <p class="error-message">当前季节暂无数据</p>
                </div>
                <button id="back-to-week" class="calendar-btn">返回周视图</button>
            `;
            
            document.getElementById('back-to-week').addEventListener('click', renderFoodCalendar);
            return;
        }
        
        // 构建月度视图HTML
        let html = `
            <div class="calendar-header">
                <h2>${monthName}月应季食材</h2>
            </div>
            <div class="month-calendar">
        `;
        
        // 生成每周的数据
        for (let i = 1; i <= 4; i++) {
            const weekKey = `week${i}`;
            const weekData = monthData[weekKey];
            
            html += `
                <div class="week-container ${weekKey}">
                    <h3>第${i}周</h3>
                    <div class="week-foods">
            `;
            
            // 汇总所有食材
            const allFoods = [
                ...weekData.vegetables.map(item => ({ type: '蔬菜', name: item })),
                ...weekData.fruits.map(item => ({ type: '水果', name: item })),
                ...weekData.others.map(item => ({ type: '其他', name: item }))
            ];
            
            allFoods.forEach(food => {
                html += `<span class="food-tag" title="${food.type}">${food.name}</span>`;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
        
        html += `
            </div>
            <div class="calendar-actions">
                <button id="back-to-week" class="calendar-btn">返回周视图</button>
            </div>
        `;
        
        // 输出HTML内容
        calendarContainer.innerHTML = html;
        
        // 添加返回按钮事件
        document.getElementById('back-to-week').addEventListener('click', renderFoodCalendar);
    };
    
    // 显示下一周食材
    const showNextWeek = () => {
        const { month, week } = getMonthAndWeek();
        const weekNumber = parseInt(week.replace('week', ''));
        
        // 如果是本月最后一周，切换到下个月第一周
        if (weekNumber >= 4) {
            // 暂时仅支持在spring内切换
            const monthNames = ['march', 'april', 'may'];
            const currentMonthIndex = monthNames.indexOf(month);
            
            if (currentMonthIndex < monthNames.length - 1) {
                const nextMonth = monthNames[currentMonthIndex + 1];
                
                // 模拟指定日期，以显示下个月第一周
                const now = new Date();
                now.setMonth(monthNames.indexOf(nextMonth) + 2); // 月份索引从0开始，所以+2
                now.setDate(1); // 下个月1号
                
                // 显示下个月第一周内容
                renderCustomWeek(nextMonth, 'week1');
                return;
            }
        } else {
            // 显示本月下一周
            const nextWeek = `week${weekNumber + 1}`;
            renderCustomWeek(month, nextWeek);
        }
    };
    
    // 渲染指定的周
    const renderCustomWeek = (month, week) => {
        const calendarContainer = document.getElementById('seasonal-food-calendar');
        if (!calendarContainer) return;
        
        // 确保数据存在
        if (!springFoods[month] || !springFoods[month][week]) {
            calendarContainer.innerHTML = `
                <div class="calendar-header">
                    <h2>应季食材</h2>
                    <p class="error-message">所选时间段暂无数据</p>
                </div>
                <button id="back-to-current" class="calendar-btn">返回当前</button>
            `;
            
            document.getElementById('back-to-current').addEventListener('click', renderFoodCalendar);
            return;
        }
        
        const monthName = month.charAt(0).toUpperCase() + month.slice(1);
        const weekNumber = week.replace('week', '');
        const foods = springFoods[month][week];
        
        // 构建HTML内容
        let html = `
            <div class="calendar-header">
                <h2>${monthName} 第${weekNumber}周应季食材</h2>
            </div>
            <div class="foods-container">
        `;
        
        // 蔬菜部分
        html += `
            <div class="food-category">
                <h3>蔬菜</h3>
                <div class="food-items">
        `;
        
        if (foods.vegetables.length > 0) {
            foods.vegetables.forEach(vegetable => {
                html += `<span class="food-tag">${vegetable}</span>`;
            });
        } else {
            html += `<p class="no-data">当前周暂无数据</p>`;
        }
        
        html += `
                </div>
            </div>
        `;
        
        // 水果部分
        html += `
            <div class="food-category">
                <h3>水果</h3>
                <div class="food-items">
        `;
        
        if (foods.fruits.length > 0) {
            foods.fruits.forEach(fruit => {
                html += `<span class="food-tag">${fruit}</span>`;
            });
        } else {
            html += `<p class="no-data">当前周暂无数据</p>`;
        }
        
        html += `
                </div>
            </div>
        `;
        
        // 其他食材部分
        html += `
            <div class="food-category">
                <h3>其他</h3>
                <div class="food-items">
        `;
        
        if (foods.others.length > 0) {
            foods.others.forEach(other => {
                html += `<span class="food-tag">${other}</span>`;
            });
        } else {
            html += `<p class="no-data">当前周暂无数据</p>`;
        }
        
        html += `
                </div>
            </div>
        `;
        
        // 操作按钮
        html += `
            <div class="calendar-actions">
                <button id="back-to-current" class="calendar-btn">返回当前</button>
                <button id="view-month-calendar" class="calendar-btn">查看月历</button>
                <button id="view-next-week" class="calendar-btn">下一周</button>
            </div>
        `;
        
        html += `</div>`;
        
        // 输出HTML内容
        calendarContainer.innerHTML = html;
        
        // 添加按钮事件
        document.getElementById('back-to-current').addEventListener('click', renderFoodCalendar);
        document.getElementById('view-month-calendar').addEventListener('click', showMonthCalendar);
        document.getElementById('view-next-week').addEventListener('click', showNextWeek);
    };
    
    // 初始化"查看日历"按钮事件
    const initCalendarButton = () => {
        const viewCalendarBtn = document.getElementById('view-calendar-btn');
        if (viewCalendarBtn) {
            viewCalendarBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'seasonal-calendar.html';
            });
        }
    };
    
    // 初始化食物日历
    const initFoodCalendar = () => {
        if (document.getElementById('seasonal-food-calendar')) {
            renderFoodCalendar();
        } else {
            initCalendarButton();
        }
    };
    
    // 执行初始化
    initFoodCalendar();
}); 