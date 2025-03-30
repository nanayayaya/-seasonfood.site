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
            {
                id: 2,
                name: "Blueberry Flaxseed Muffins",
                description: "Healthy muffins with blueberries and flaxseed, rich in antioxidants",
                image: "images/Berries.jpg",
                mealType: "breakfast",
                allergens: ["gluten", "eggs"],
                suitableFor: ["dairy", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegetarian", "High Fiber"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: true,
                lowfodmap: false,
                lowcarb: false,
                lowsugar: false,
                lowsodium: true,
                keto: false,
                paleo: false
            },
            {
                id: 3,
                name: "Coconut Milk Chia Pudding",
                description: "Chia seed pudding made with coconut milk, topped with fresh fruit",
                image: "images/HealthyFats.jpg",
                mealType: "breakfast",
                allergens: [],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegan", "Gluten-Free"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: true,
                lowcarb: false,
                lowsugar: false,
                lowsodium: true,
                keto: true,
                paleo: true
            },
            {
                id: 4,
                name: "Avocado Toast with Microgreens",
                description: "Whole grain toast topped with avocado, microgreens, and lemon zest",
                image: "images/avocado.jpg",
                mealType: "breakfast",
                allergens: ["gluten"],
                suitableFor: ["dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegetarian", "Healthy Fats"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: false,
                lowsugar: true,
                lowsodium: true,
                keto: false,
                paleo: false
            },
            {
                id: 5,
                name: "Gluten-Free Banana Pancakes",
                description: "Fluffy banana pancakes made with almond flour and topped with maple syrup",
                image: "images/WholeGrains.jpg",
                mealType: "breakfast",
                allergens: ["tree-nuts"],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "fish", "shellfish"],
                dietLabels: ["Gluten-Free", "High Fiber"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: true,
                lowfodmap: false,
                lowcarb: false,
                lowsugar: false,
                lowsodium: true,
                keto: false,
                paleo: true
            },
            {
                id: 6,
                name: "Spring Vegetable Frittata",
                description: "Fluffy egg frittata with spring asparagus, peas, and fresh herbs",
                image: "images/asparagus.jpg",
                mealType: "breakfast",
                allergens: ["eggs"],
                suitableFor: ["gluten", "dairy", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Keto", "High Protein"],
                containsMeat: false,
                containsDairy: true,
                containsEggs: true,
                lowfodmap: true,
                lowcarb: true,
                lowsugar: true,
                lowsodium: true,
                keto: true,
                paleo: true
            },
            {
                id: 7,
                name: "Tofu Scramble with Spring Greens",
                description: "Savory tofu scramble with spring onions, tomatoes and leafy greens",
                image: "images/Sprouts.jpg",
                mealType: "breakfast",
                allergens: ["soy"],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegan", "High Protein"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: true,
                lowsugar: true,
                lowsodium: true,
                keto: true,
                paleo: false
            },
            {
                id: 8,
                name: "Keto Breakfast Bowl",
                description: "Low-carb bowl with eggs, avocado, spinach and cherry tomatoes",
                image: "images/avocado.jpg",
                mealType: "breakfast",
                allergens: ["eggs"],
                suitableFor: ["gluten", "dairy", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Keto", "High Protein"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: true,
                lowfodmap: true,
                lowcarb: true,
                lowsugar: true,
                lowsodium: true,
                keto: true,
                paleo: true
            },
            {
                id: 9,
                name: "Apple Cinnamon Quinoa Bowl",
                description: "Warm quinoa breakfast bowl with diced apples, cinnamon and maple syrup",
                image: "images/WholeGrains.jpg",
                mealType: "breakfast",
                allergens: [],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegan", "High Fiber"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: false,
                lowsugar: false,
                lowsodium: true,
                keto: false,
                paleo: false
            },
            
            // 午餐食谱 - 至少9种选择
            {
                id: 10,
                name: "Spring Vegetable Salad",
                description: "Fresh spring salad with asparagus, radishes, and tender spinach",
                image: "images/asparagus.jpg",
                mealType: "lunch",
                allergens: [],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegetarian", "High Fiber"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: true,
                lowcarb: true,
                lowsugar: true,
                lowsodium: true,
                keto: false,
                paleo: true
            },
            {
                id: 11,
                name: "Vegetarian Spring Soup",
                description: "Light vegetable soup with spring beans and fresh herbs",
                image: "images/asparagus.jpg",
                mealType: "lunch",
                allergens: ["onions"],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegan", "Low Calorie"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: false,
                lowsugar: true,
                lowsodium: false,
                keto: false,
                paleo: true
            },
            {
                id: 12,
                name: "Spring Bean Salad",
                description: "Fresh spring bean salad with olive oil and lemon dressing",
                image: "images/Sprouts.jpg",
                mealType: "lunch",
                allergens: [],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegan", "High Fiber"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: false,
                lowsugar: true,
                lowsodium: true,
                keto: false,
                paleo: true
            },
            {
                id: 13,
                name: "Roasted Chicken Lettuce Wraps",
                description: "Low-carb spring lettuce wraps with roasted chicken and yogurt sauce",
                image: "images/QualityProteins.jpg",
                mealType: "lunch",
                allergens: ["dairy"],
                suitableFor: ["gluten", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Low Carb", "High Protein"],
                containsMeat: true,
                containsDairy: true,
                containsEggs: false,
                lowfodmap: true,
                lowcarb: true,
                lowsugar: true,
                lowsodium: true,
                keto: true,
                paleo: false
            },
            {
                id: 14,
                name: "Miso Spring Vegetable Soup",
                description: "Light miso soup with spring vegetables and tofu",
                image: "images/Sprouts.jpg",
                mealType: "lunch",
                allergens: ["soy"],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegetarian", "Low Calorie"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: true,
                lowsugar: true,
                lowsodium: false,
                keto: false,
                paleo: false
            },
            {
                id: 15,
                name: "Quinoa Bowl with Roasted Vegetables",
                description: "Protein-rich quinoa bowl with spring roasted vegetables and tahini dressing",
                image: "images/WholeGrains.jpg",
                mealType: "lunch",
                allergens: ["sesame"],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegan", "High Protein"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: false,
                lowsugar: true,
                lowsodium: true,
                keto: false,
                paleo: false
            },
            {
                id: 16,
                name: "Tuna and White Bean Salad",
                description: "Light spring salad with tuna, white beans, and lemon-herb dressing",
                image: "images/QualityProteins.jpg",
                mealType: "lunch",
                allergens: ["fish"],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "shellfish"],
                dietLabels: ["High Protein", "Low Carb"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: true,
                lowcarb: true,
                lowsugar: true,
                lowsodium: false,
                keto: true,
                paleo: true
            },
            {
                id: 17,
                name: "Mediterranean Chickpea Salad",
                description: "Refreshing salad with chickpeas, cucumber, tomatoes and feta cheese",
                image: "images/Sprouts.jpg",
                mealType: "lunch",
                allergens: ["dairy"],
                suitableFor: ["gluten", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegetarian", "High Fiber"],
                containsMeat: false,
                containsDairy: true,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: false,
                lowsugar: true,
                lowsodium: false,
                keto: false,
                paleo: false
            },
            {
                id: 18,
                name: "Spring Rice Paper Rolls",
                description: "Fresh rice paper rolls with spring vegetables and peanut dipping sauce",
                image: "images/Bitterleafygreenvegetable.jpg",
                mealType: "lunch",
                allergens: ["peanuts"],
                suitableFor: ["gluten", "dairy", "eggs", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegan", "Low Calorie"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: false,
                lowsugar: true,
                lowsodium: false,
                keto: false,
                paleo: false
            },
            
            // 晚餐食谱 - 至少9种选择
            {
                id: 19,
                name: "Lemon Herb Chicken",
                description: "Refreshing lemon and spring herb roasted chicken breast",
                image: "images/QualityProteins.jpg",
                mealType: "dinner",
                allergens: [],
                suitableFor: ["gluten", "dairy", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["High Protein", "Low Carb"],
                containsMeat: true,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: true,
                lowcarb: true,
                lowsugar: true,
                lowsodium: true,
                keto: true,
                paleo: true
            },
            {
                id: 20,
                name: "Spring Mushroom Quinoa",
                description: "Nutritious quinoa with spring mushrooms and herbs",
                image: "images/Mushrooms.jpg",
                mealType: "dinner",
                allergens: ["mushrooms"],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegan", "High Protein"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: false,
                lowsugar: true,
                lowsodium: true,
                keto: false,
                paleo: false
            },
            {
                id: 21,
                name: "Herb Salmon with Asparagus",
                description: "Baked salmon fillets with asparagus and lemon butter sauce",
                image: "images/asparagus.jpg",
                mealType: "dinner",
                allergens: ["fish", "dairy"],
                suitableFor: ["gluten", "eggs", "peanuts", "tree-nuts", "shellfish"],
                dietLabels: ["Keto", "High Protein"],
                containsMeat: false,
                containsDairy: true,
                containsEggs: false,
                lowfodmap: true,
                lowcarb: true,
                lowsugar: true,
                lowsodium: true,
                keto: true,
                paleo: true
            },
            {
                id: 22,
                name: "Grilled Spring Vegetables",
                description: "Seasonal vegetables grilled to perfection with herb infused olive oil",
                image: "images/asparagus.jpg",
                mealType: "dinner",
                allergens: [],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegan", "Low Calorie"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: true,
                lowsugar: true,
                lowsodium: true,
                keto: true,
                paleo: true
            },
            {
                id: 23,
                name: "Gluten-Free Pasta Primavera",
                description: "Gluten-free pasta with fresh spring vegetables and olive oil",
                image: "images/pexels-mali-64208.jpg",
                mealType: "dinner",
                allergens: [],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegan", "Gluten-Free"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: false,
                lowsugar: true,
                lowsodium: true,
                keto: false,
                paleo: false
            },
            {
                id: 24,
                name: "Spring Vegetable Risotto",
                description: "Creamy risotto with asparagus, peas and lemon zest",
                image: "images/WholeGrains.jpg",
                mealType: "dinner",
                allergens: ["dairy"],
                suitableFor: ["gluten", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegetarian", "Heart Healthy"],
                containsMeat: false,
                containsDairy: true,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: false,
                lowsugar: true,
                lowsodium: true,
                keto: false,
                paleo: false
            },
            {
                id: 25,
                name: "Turkey Meatballs with Spring Greens",
                description: "Lean turkey meatballs served with sautéed spring greens",
                image: "images/QualityProteins.jpg",
                mealType: "dinner",
                allergens: ["eggs", "gluten"],
                suitableFor: ["dairy", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["High Protein", "Low Fat"],
                containsMeat: true,
                containsDairy: false,
                containsEggs: true,
                lowfodmap: true,
                lowcarb: true,
                lowsugar: true,
                lowsodium: true,
                keto: true,
                paleo: false
            },
            {
                id: 26,
                name: "Zucchini Noodles with Pesto",
                description: "Low-carb zucchini noodles with fresh basil pesto and cherry tomatoes",
                image: "images/pexels-mali-64208.jpg",
                mealType: "dinner",
                allergens: ["tree-nuts"],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "fish", "shellfish"],
                dietLabels: ["Low Carb", "Keto"],
                containsMeat: false,
                containsDairy: true,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: true,
                lowsugar: true,
                lowsodium: true,
                keto: true,
                paleo: true
            },
            {
                id: 27,
                name: "Stuffed Bell Peppers",
                description: "Bell peppers stuffed with quinoa, black beans and spring vegetables",
                image: "images/Bitterleafygreenvegetable.jpg",
                mealType: "dinner",
                allergens: [],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegan", "High Fiber"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: false,
                lowsugar: true,
                lowsodium: true,
                keto: false,
                paleo: false
            },
            
            // 零食食谱 - 至少6种选择
            {
                id: 28,
                name: "Citrus Energy Bars",
                description: "Homemade energy bars with citrus zest and nuts",
                image: "images/Lemons.jpg",
                mealType: "snack",
                allergens: ["tree-nuts", "citrus"],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "fish", "shellfish"],
                dietLabels: ["Vegan", "No Added Sugar"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: false,
                lowsugar: true,
                lowsodium: true,
                keto: false,
                paleo: true
            },
            {
                id: 29,
                name: "Green Tea Blueberry Smoothie",
                description: "Refreshing green tea with blueberries, rich in antioxidants",
                image: "images/Berries.jpg",
                mealType: "snack",
                allergens: [],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegan", "Antioxidant-Rich"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: true,
                lowcarb: false,
                lowsugar: false,
                lowsodium: true,
                keto: false,
                paleo: true
            },
            {
                id: 30,
                name: "Honey Roasted Almonds",
                description: "Crunchy honey roasted almonds, perfect for snacking",
                image: "images/HealthyFats.jpg",
                mealType: "snack",
                allergens: ["tree-nuts"],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "fish", "shellfish"],
                dietLabels: ["Vegetarian", "High Protein"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: true,
                lowcarb: true,
                lowsugar: false,
                lowsodium: true,
                keto: true,
                paleo: true
            },
            {
                id: 31,
                name: "Veggie Sticks with Hummus",
                description: "Fresh spring vegetable sticks with homemade chickpea hummus",
                image: "images/asparagus.jpg",
                mealType: "snack",
                allergens: ["sesame"],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegan", "High Fiber"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: true,
                lowsugar: true,
                lowsodium: false,
                keto: false,
                paleo: false
            },
            {
                id: 32,
                name: "Strawberry Coconut Yogurt",
                description: "Dairy-free coconut yogurt topped with fresh spring strawberries",
                image: "images/Berries.jpg",
                mealType: "snack",
                allergens: [],
                suitableFor: ["gluten", "dairy", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Vegan", "Probiotic"],
                containsMeat: false,
                containsDairy: false,
                containsEggs: false,
                lowfodmap: false,
                lowcarb: true,
                lowsugar: false,
                lowsodium: true,
                keto: true,
                paleo: true
            },
            {
                id: 33,
                name: "Keto Cheese Crisps",
                description: "Crunchy baked cheese crisps with herbs and spices",
                image: "images/HealthyFats.jpg",
                mealType: "snack",
                allergens: ["dairy"],
                suitableFor: ["gluten", "eggs", "peanuts", "tree-nuts", "fish", "shellfish"],
                dietLabels: ["Keto", "High Protein"],
                containsMeat: false,
                containsDairy: true,
                containsEggs: false,
                lowfodmap: true,
                lowcarb: true,
                lowsugar: true,
                lowsodium: false,
                keto: true,
                paleo: true
            }
        ];
    }

    // 初始化 - 显示第一个问题并更新按钮状态
    showQuestion(0);
    updateButtonStates();
}); 