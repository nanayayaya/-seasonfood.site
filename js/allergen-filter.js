/**
 * Allergen Filter JavaScript
 * Provides interactive functionality for the allergen filtering tool
 */

document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const allergenForm = document.getElementById('allergen-form');
    const resultsContainer = document.getElementById('results-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const currentQuestionSpan = document.getElementById('current-question');
    const progressFill = document.querySelector('.progress-fill');
    const retakeBtn = document.getElementById('retake-btn');
    const printRecipesBtn = document.getElementById('print-recipes-btn');
    const emailRecipesBtn = document.getElementById('email-recipes-btn');
    const questionContainers = document.querySelectorAll('.question-container');
    const recipeTabs = document.querySelectorAll('.rec-tab');
    const recipePanels = document.querySelectorAll('.rec-panel');
    const noRecipesMessage = document.querySelector('.no-recipes');

    // 当前问题索引
    let currentQuestionIndex = 0;
    const totalQuestions = questionContainers.length;

    // 初始化选项事件
    initOptions();
    
    // 初始化选项卡
    initRecipeTabs();

    // 为单选按钮和复选框添加事件监听
    function initOptions() {
        // 处理单选选项
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', function(event) {
                const radio = this.querySelector('input[type="radio"]');
                const checkbox = this.querySelector('input[type="checkbox"]');
                
                // 如果是单选按钮
                if (radio) {
                    // 移除同组中所有选项的选中状态
                    document.querySelectorAll(`input[name="${radio.name}"]`).forEach(r => {
                        r.closest('.option').classList.remove('selected');
                    });
                    
                    // 强制选中当前选项和单选按钮
                    radio.checked = true;
                    this.classList.add('selected');
                    
                    // 手动触发change事件
                    const event = new Event('change');
                    radio.dispatchEvent(event);
                }
                
                // 如果是复选框且点击的不是input本身
                if (checkbox && event.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    
                    // 更新样式
                    if (checkbox.checked) {
                        this.classList.add('selected');
                    } else {
                        this.classList.remove('selected');
                    }
                    
                    // 手动触发change事件
                    const changeEvent = new Event('change');
                    checkbox.dispatchEvent(changeEvent);
                }
                
                // 更新按钮状态
                updateButtonStates();
            });
        });
        
        // 为复选框添加change事件监听器
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const option = this.closest('.option');
                if (option) {
                    if (this.checked) {
                        option.classList.add('selected');
                    } else {
                        option.classList.remove('selected');
                    }
                }
                
                // 更新按钮状态
                updateButtonStates();
            });
            
            // 设置初始状态
            if (checkbox.checked) {
                const option = checkbox.closest('.option');
                if (option) {
                    option.classList.add('selected');
                }
            }
        });
        
        // 为单选按钮添加change事件监听器
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    const option = this.closest('.option');
                    if (option) {
                        // 移除同组中所有选项的选中状态
                        document.querySelectorAll(`input[name="${this.name}"]`).forEach(r => {
                            if (r !== this && r.closest('.option')) {
                                r.closest('.option').classList.remove('selected');
                            }
                        });
                        
                        // 添加选中状态
                        option.classList.add('selected');
                    }
                }
                
                // 更新按钮状态
                updateButtonStates();
            });
        });
    }

    // 初始化配方选项卡
    function initRecipeTabs() {
        recipeTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // 移除所有标签和面板的活动状态
                recipeTabs.forEach(t => t.classList.remove('active'));
                recipePanels.forEach(p => p.classList.remove('active'));
                
                // 添加活动状态到当前标签
                this.classList.add('active');
                
                // 显示对应面板
                const panelId = this.getAttribute('data-panel');
                document.getElementById(panelId).classList.add('active');
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
            // 检查是否有必须回答的问题（如单选题）
            const currentQuestion = questionContainers[currentQuestionIndex];
            const radioInputs = currentQuestion.querySelectorAll('input[type="radio"]');
            
            if (radioInputs.length > 0) {
                // 检查是否有任何单选按钮被选中
                let answered = false;
                radioInputs.forEach(radio => {
                    if (radio.checked) {
                        answered = true;
                    }
                });
                
                if (!answered) {
                    // 添加未回答提示，然后在短暂时间后移除
                    currentQuestion.classList.add('unanswered');
                    setTimeout(() => {
                        currentQuestion.classList.remove('unanswered');
                    }, 800);
                    return;
                }
            }
            
            showQuestion(currentQuestionIndex + 1);
        }
    });

    // 提交按钮事件
    submitBtn.addEventListener('click', function() {
        // 收集用户选择并生成过滤后的食谱
        filterRecipes();
        
        // 隐藏表单，显示结果
        allergenForm.style.display = 'none';
        resultsContainer.style.display = 'block';
        
        // 滚动到页面顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 重新设置按钮事件
    retakeBtn.addEventListener('click', function() {
        resetFilter();
        allergenForm.style.display = 'block';
        resultsContainer.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 打印配方按钮
    if (printRecipesBtn) {
        printRecipesBtn.addEventListener('click', function() {
            window.print();
        });
    }
    
    // 电子邮件配方按钮
    if (emailRecipesBtn) {
        emailRecipesBtn.addEventListener('click', function() {
            const email = prompt('Please enter your email address:');
            if (email && validateEmail(email)) {
                alert(`Your filtered recipes will be sent to ${email}. Thank you!`);
                // 实际项目中应该有一个AJAX请求
            } else if (email) {
                alert('Please enter a valid email address.');
            }
        });
    }

    // 显示特定问题
    function showQuestion(index) {
        if (index >= 0 && index < totalQuestions) {
            // 隐藏所有问题
            questionContainers.forEach(q => q.classList.remove('active'));
            
            // 显示目标问题
            currentQuestionIndex = index;
            questionContainers[currentQuestionIndex].classList.add('active');
            
            // 更新进度
            updateProgress();
            
            // 更新按钮状态
            updateButtonStates();
            
            // 滚动到顶部
            const assessmentSection = document.querySelector('.assessment-section');
            if (assessmentSection) {
                assessmentSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    // 更新进度
    function updateProgress() {
        // 更新问题编号显示
        if (currentQuestionSpan) {
            currentQuestionSpan.textContent = currentQuestionIndex + 1;
        }
        
        // 更新进度条
        if (progressFill) {
            const progressPercentage = (currentQuestionIndex / (totalQuestions - 1)) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
    }

    // 更新按钮状态
    function updateButtonStates() {
        // 显示/隐藏上一步按钮
        if (prevBtn) {
            prevBtn.style.visibility = currentQuestionIndex === 0 ? 'hidden' : 'visible';
        }
        
        // 最后一个问题时显示提交按钮而不是下一步按钮
        if (nextBtn && submitBtn) {
            if (currentQuestionIndex === totalQuestions - 1) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'inline-block';
                
                // 如果选择了饮食类型，则高亮提交按钮
                const dietType = document.querySelector('input[name="dietType"]:checked');
                if (dietType) {
                    submitBtn.classList.add('highlight');
                } else {
                    submitBtn.classList.remove('highlight');
                }
            } else {
                nextBtn.style.display = 'inline-block';
                submitBtn.style.display = 'none';
                
                // 为第一步添加高亮条件
                if (currentQuestionIndex === 0) {
                    const hasSelection = document.querySelectorAll('input[name="allergens"]:checked').length > 0;
                    if (hasSelection) {
                        nextBtn.classList.add('highlight');
                    } else {
                        nextBtn.classList.remove('highlight');
                    }
                }
            }
        }
    }

    // 重置过滤器
    function resetFilter() {
        // 清除所有选择
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
            const option = checkbox.closest('.option');
            if (option) {
                option.classList.remove('selected');
            }
        });
        
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
            if (radio.closest('.option')) {
                radio.closest('.option').classList.remove('selected');
            }
        });
        
        // 返回第一个问题
        showQuestion(0);
    }

    // 验证电子邮件格式
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // 过滤食谱并显示结果
    function filterRecipes() {
        // 收集所选过敏原
        const selectedAllergens = Array.from(document.querySelectorAll('input[name="allergens"]:checked')).map(el => el.value);
        
        // 收集额外的饮食限制
        const dietaryRestrictions = Array.from(document.querySelectorAll('input[name="dietary"]:checked')).map(el => el.value);
        
        // 获取饮食类型
        const dietType = document.querySelector('input[name="dietType"]:checked')?.value || 'omnivore';

        // 从食谱数据库中筛选符合条件的食谱
        const filteredRecipes = filterRecipeDatabase(selectedAllergens, dietaryRestrictions, dietType);
        
        // 在页面上显示过滤后的食谱
        displayFilteredRecipes(filteredRecipes);
    }

    // 从食谱数据库中筛选食谱的函数
    function filterRecipeDatabase(allergens, restrictions, dietType) {
        // 这里使用我们预定义的春季食谱数据
        const allRecipes = getSpringRecipes();
        
        // 根据过敏原、饮食限制和饮食类型过滤
        return allRecipes.filter(recipe => {
            // 检查过敏原
            for (const allergen of allergens) {
                if (recipe.allergens.includes(allergen)) {
                    return false;
                }
            }
            
            // 检查饮食类型
            if (dietType === 'vegetarian' && recipe.containsMeat) {
                return false;
            }
            
            if (dietType === 'vegan' && (recipe.containsMeat || recipe.containsDairy || recipe.containsEggs)) {
                return false;
            }
            
            // 检查额外的饮食限制
            for (const restriction of restrictions) {
                const restrictionKey = restriction.replace('-', '');
                if (!recipe[restrictionKey]) {
                    return false;
                }
            }
            
            return true;
        });
    }

    // 在页面上显示过滤后的食谱
    function displayFilteredRecipes(recipes) {
        // 根据餐点类型分类食谱
        const breakfastRecipes = recipes.filter(r => r.mealType === 'breakfast');
        const lunchRecipes = recipes.filter(r => r.mealType === 'lunch');
        const dinnerRecipes = recipes.filter(r => r.mealType === 'dinner');
        const snackRecipes = recipes.filter(r => r.mealType === 'snack');
        
        // 清空现有食谱
        document.getElementById('breakfast-recipes').innerHTML = '';
        document.getElementById('lunch-recipes').innerHTML = '';
        document.getElementById('dinner-recipes').innerHTML = '';
        document.getElementById('snacks-recipes').innerHTML = '';
        
        // 生成食谱HTML并添加到相应的容器
        if (breakfastRecipes.length > 0) {
            document.getElementById('breakfast-recipes').innerHTML = generateRecipeCards(breakfastRecipes);
        }
        
        if (lunchRecipes.length > 0) {
            document.getElementById('lunch-recipes').innerHTML = generateRecipeCards(lunchRecipes);
        }
        
        if (dinnerRecipes.length > 0) {
            document.getElementById('dinner-recipes').innerHTML = generateRecipeCards(dinnerRecipes);
        }
        
        if (snackRecipes.length > 0) {
            document.getElementById('snacks-recipes').innerHTML = generateRecipeCards(snackRecipes);
        }
        
        // 如果没有匹配的食谱，显示提示信息
        if (recipes.length === 0) {
            noRecipesMessage.style.display = 'block';
        } else {
            noRecipesMessage.style.display = 'none';
        }
    }

    // 生成食谱卡片的HTML
    function generateRecipeCards(recipes) {
        let html = '';
        
        recipes.forEach(recipe => {
            const allergensHTML = recipe.suitableFor.map(allergen => 
                `<span class="recipe-tag allergen-free">${formatAllergenName(allergen)} Free</span>`
            ).join('');
            
            const dietLabelsHTML = recipe.dietLabels.map(label => 
                `<span class="recipe-tag">${label}</span>`
            ).join('');
            
            html += `
            <div class="food-item">
                <img src="${recipe.image}" alt="${recipe.name}">
                <h4>${recipe.name}</h4>
                <p>${recipe.description}</p>
                <div class="food-recipe">
                    <i class="fas fa-leaf"></i> ${allergensHTML} ${dietLabelsHTML}
                </div>
            </div>
            `;
        });
        
        return html;
    }

    // 格式化过敏原名称以便显示
    function formatAllergenName(allergen) {
        const formatted = allergen.charAt(0).toUpperCase() + allergen.slice(1);
        return formatted.replace('-', ' ');
    }

    // 获取春季食谱数据
    function getSpringRecipes() {
        return [
            // 早餐食谱 - 至少9种选择
            {
                id: 1,
                name: "Strawberry Oatmeal",
                description: "Warm oatmeal with fresh strawberries and honey",
                image: "images/WholeGrains.jpg",
                mealType: "breakfast",
                allergens: ["dairy"],
                suitableFor: ["gluten", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegetarian", "High Fiber"],
                containsMeat: false,
                containsDairy: true,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: false,
                lowsugar: false,
                lowsodium: true,
                keto: false,
                paleo: false
            },
            // ... 其余配方数据 ...
        ];
    }

    // 初始化 - 显示第一个问题并更新按钮状态
    showQuestion(0);
    updateButtonStates();
}); 