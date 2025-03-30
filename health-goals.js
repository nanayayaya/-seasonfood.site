/**
 * Health Goal Planner JavaScript
 * Provides interactive functionality for the health goal planning tool
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
    const printPlanBtn = document.getElementById('printPlanBtn');
    const emailPlanBtn = document.getElementById('emailPlanBtn');
    const questionContainers = document.querySelectorAll('.question-container');
    const recTabs = document.querySelectorAll('.rec-tab');
    const recPanels = document.querySelectorAll('.rec-panel');

    // 当前问题索引
    let currentQuestionIndex = 0;
    const totalQuestions = questionContainers.length;

    // 初始化选项选择事件
    initOptions();

    // 初始化推荐标签
    initRecommendationTabs();

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
                
                // 强制选中当前选项和单选按钮
                radio.checked = true;
                this.classList.add('selected');
                
                // 手动触发change事件
                const event = new Event('change');
                radio.dispatchEvent(event);
                
                // 如果是最后一题，则显示提交按钮
                const currentContainer = this.closest('.question-container');
                const currentIndex = parseInt(currentContainer.dataset.question) - 1;
                if (currentIndex === totalQuestions - 1) {
                    nextBtn.style.display = 'none';
                    submitBtn.style.display = 'inline-block';
                }
                
                // 检查是否可以继续到下一题
                updateButtonStates();
            });
        });
        
        // 确保radio按钮的点击也能正确处理
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
                        
                        // 更新按钮状态
                        updateButtonStates();
                    }
                }
            });
        });
    }

    // 初始化推荐标签
    function initRecommendationTabs() {
        recTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // 移除所有标签和面板的活动状态
                recTabs.forEach(t => t.classList.remove('active'));
                recPanels.forEach(p => p.classList.remove('active'));
                
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
            // 检查当前问题是否已回答
            const currentQuestion = questionContainers[currentQuestionIndex];
            const radioInputs = currentQuestion.querySelectorAll('input[type="radio"]');
            const radioName = radioInputs.length > 0 ? radioInputs[0].name : null;
            
            if (radioName) {
                const answered = document.querySelector(`input[name="${radioName}"]:checked`);
                
                if (answered) {
                    showQuestion(currentQuestionIndex + 1);
                } else {
                    // 如果未回答，添加视觉提示
                    currentQuestion.classList.add('unanswered');
                    setTimeout(() => currentQuestion.classList.remove('unanswered'), 800);
                }
            } else {
                // 如果找不到radio输入，直接前进到下一题
                showQuestion(currentQuestionIndex + 1);
            }
        }
    });

    // 提交按钮事件
    submitBtn.addEventListener('click', function() {
        const lastQuestion = questionContainers[totalQuestions - 1];
        const lastRadioName = lastQuestion.querySelector('input[type="radio"]').name;
        const lastAnswered = document.querySelector(`input[name="${lastRadioName}"]:checked`);
        
        if (lastAnswered) {
            generatePlan();
            assessmentForm.style.display = 'none';
            resultsContainer.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // 如果未回答，添加视觉提示
            lastQuestion.classList.add('unanswered');
            setTimeout(() => lastQuestion.classList.remove('unanswered'), 500);
        }
    });

    // 重新测试按钮事件
    retakeBtn.addEventListener('click', function() {
        resetAssessment();
        assessmentForm.style.display = 'block';
        resultsContainer.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 打印计划按钮
    if (printPlanBtn) {
        printPlanBtn.addEventListener('click', function() {
            window.print();
        });
    }
    
    // 电子邮件计划按钮
    if (emailPlanBtn) {
        emailPlanBtn.addEventListener('click', function() {
            const email = prompt('Please enter your email address:');
            if (email && validateEmail(email)) {
                alert(`Your plan will be sent to ${email}. Thank you!`);
                // 实际项目中这里应该有一个AJAX请求
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
            } else {
                nextBtn.style.display = 'inline-block';
                submitBtn.style.display = 'none';
            }
        }
        
        // 检查当前题目是否已回答，若已回答则高亮下一步按钮
        const currentQuestion = questionContainers[currentQuestionIndex];
        const radioInputs = currentQuestion.querySelectorAll('input[type="radio"]');
        if (radioInputs.length > 0) {
            const radioName = radioInputs[0].name;
            const answered = document.querySelector(`input[name="${radioName}"]:checked`);
            
            if (answered && nextBtn) {
                nextBtn.classList.add('highlight');
            } else if (nextBtn) {
                nextBtn.classList.remove('highlight');
            }
        }
    }

    // 重置评估
    function resetAssessment() {
        // 清除所有选择
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

    // 初始化 - 显示第一个问题和更新按钮状态
    showQuestion(0);
    updateButtonStates();
    
    // 生成个性化健康计划
    function generatePlan() {
        // 收集所有回答
        const userData = {};
        document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
            userData[input.name] = input.value;
        });
        
        // 获取主要健康目标
        const primaryGoal = userData.primaryGoal;
        
        // 获取DOM元素以填充内容
        const planSummary = document.getElementById('planSummary');
        const foodRecommendations = document.getElementById('foodRecommendations');
        const mealPlan = document.getElementById('mealPlan');
        const supplementRecommendations = document.getElementById('supplementRecommendations');
        const lifestyleRecommendations = document.getElementById('lifestyleRecommendations');
        
        // 设置用户称谓
        let userTitle = '';
        if (userData.gender === 'male') {
            userTitle = 'Mr.';
        } else if (userData.gender === 'female') {
            userTitle = 'Ms.';
        } else {
            userTitle = '';
        }
        
        // 设置内容变量
        let summaryText = '';
        let foodsHtml = '';
        let mealsHtml = '';
        let supplementsHtml = '';
        let lifestyleHtml = '';
        
        // 根据主要目标生成内容
        switch (primaryGoal) {
            case 'immunity':
                summaryText = `
                <div class="body-type-result">
                    <div class="type-icon"><i class="fas fa-shield-virus"></i></div>
                    <div class="type-details">
                        <h3>Your Primary Goal: <span id="body-type">Immunity Boost</span></h3>
                        <p id="type-description">Based on your assessment, we've designed this spring eating plan focused on <strong>boosting immunity</strong>. Spring is a time when your immune system needs special attention, and by consuming foods rich in antioxidants and vitamins, you can help your body better resist seasonal illnesses.</p>
                        <p>This plan considers your ${userData.dietType === 'vegetarian' ? 'vegetarian' : userData.dietType === 'vegan' ? 'vegan' : 'dietary'} preferences and ${userData.activityLevel === 'active' ? 'high' : userData.activityLevel === 'moderate' ? 'moderate' : 'lower'} activity level.</p>
                    </div>
                </div>
                `;
                
                // 创建免疫力食物项目
                foodsHtml = createFoodItemsHtml([
                    {
                        name: "Leafy Greens",
                        description: "Spinach, kale, and spring asparagus are rich in immune-boosting vitamins and minerals.",
                        image: "images/asparagus.jpg",
                        recipe: "Try them in salads, soups, or lightly steamed as side dishes."
                    },
                    {
                        name: "Berries",
                        description: "Blueberries, strawberries, and raspberries are packed with antioxidants that support immune function.",
                        image: "images/Berries.jpg",
                        recipe: "Add to oatmeal, yogurt, or enjoy as a refreshing snack."
                    },
                    {
                        name: "Citrus Fruits",
                        description: "Oranges, lemons, and grapefruits provide vitamin C, essential for immune health.",
                        image: "images/Lemons.jpg",
                        recipe: "Use in dressings, drink as fresh juice, or add to water for flavor."
                    },
                    {
                        name: "Garlic & Onions",
                        description: "Contain antibacterial and antiviral compounds that help fight infections.",
                        image: "images/garlic.jpg",
                        recipe: "Add to soups, stir-fries, and roasted vegetables for flavor and benefits."
                    },
                    {
                        name: "Ginger & Turmeric",
                        description: "Powerful anti-inflammatory properties that support overall immune function.",
                        image: "images/freshginger.jpg",
                        recipe: "Use in teas, curries, smoothies, or make golden milk with turmeric."
                    },
                    {
                        name: "Mushrooms",
                        description: "Shiitake and maitake varieties enhance immune cell activity.",
                        image: "images/Mushrooms.jpg",
                        recipe: "Sauté with garlic and herbs, add to soups, or use in grain bowls."
                    }
                ]);
                
                mealsHtml = `
                <h4>Weekday Meal Plan</h4>
                <div class="meal-day">
                    <div class="meal-item">
                        <span class="meal-time"><strong>Breakfast</strong></span>
                        <span class="meal-desc">Berry oatmeal with almonds and honey</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Lunch</strong></span>
                        <span class="meal-desc">Spring vegetable salad with citrus vinaigrette</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Dinner</strong></span>
                        <span class="meal-desc">Turmeric-roasted chicken with asparagus and brown rice (or tofu substitute)</span>
                    </div>
                </div>
                
                <h4>Weekend Meal Plan</h4>
                <div class="meal-day">
                    <div class="meal-item">
                        <span class="meal-time"><strong>Breakfast</strong></span>
                        <span class="meal-desc">Spinach mushroom omelet (or tofu scramble)</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Lunch</strong></span>
                        <span class="meal-desc">Turmeric coconut soup with mushrooms and spring vegetables</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Dinner</strong></span>
                        <span class="meal-desc">Baked salmon with lemon and spring vegetables (or roasted tofu alternative)</span>
                    </div>
                </div>
                `;
                
                supplementsHtml = `
                <h4>Recommended Supplements</h4>
                <ul class="supplement-list">
                    <li><strong>Vitamin D:</strong> Late winter and early spring remain high-risk periods for vitamin D deficiency</li>
                    <li><strong>Vitamin C:</strong> May help reduce cold symptoms and duration</li>
                    <li><strong>Zinc:</strong> Plays a key role in immune function</li>
                    <li><strong>Probiotics:</strong> Support gut health and immune function</li>
                </ul>
                <p class="supplement-note">Note: Please consult with a healthcare professional before starting any supplement regimen.</p>
                `;
                
                lifestyleHtml = `
                <h4>Lifestyle Recommendations</h4>
                <ul class="lifestyle-list">
                    <li><strong>Adequate Sleep:</strong> Aim for 7-8 hours of quality sleep each night</li>
                    <li><strong>Regular Exercise:</strong> At least 150 minutes of moderate activity per week</li>
                    <li><strong>Stress Management:</strong> Try meditation, deep breathing, or yoga for stress reduction</li>
                    <li><strong>Hydration:</strong> Drink plenty of water daily (at least 8 cups)</li>
                    <li><strong>Limit Alcohol:</strong> Excessive alcohol consumption can weaken the immune system</li>
                </ul>
                `;
                break;
                
            case 'detox':
                summaryText = `
                <div class="body-type-result">
                    <div class="type-icon"><i class="fas fa-seedling"></i></div>
                    <div class="type-details">
                        <h3>Your Primary Goal: <span id="body-type">Spring Detoxification</span></h3>
                        <p id="type-description">Based on your assessment, we've designed this spring eating plan focused on <strong>detoxification</strong>. Spring is the ideal time for natural body cleansing, and by choosing the right food combinations, you can support your liver and kidney detox functions to help your body eliminate toxins accumulated during winter.</p>
                        <p>This plan considers your ${userData.dietType === 'vegetarian' ? 'vegetarian' : userData.dietType === 'vegan' ? 'vegan' : 'dietary'} preferences and focuses on foods that support your body's natural detoxification processes.</p>
                    </div>
                </div>
                `;
                
                // 创建排毒食物项目
                foodsHtml = createFoodItemsHtml([
                    {
                        name: "Green Vegetables",
                        description: "Asparagus, dandelion greens, spinach, and kale support liver function.",
                        image: "images/Bitterleafygreenvegetable.jpg",
                        recipe: "Use in salads, green juices, or lightly steamed with lemon."
                    },
                    {
                        name: "Fresh Herbs",
                        description: "Cilantro, parsley, and mint help bind and eliminate toxins.",
                        image: "images/pexels-mali-64208.jpg",
                        recipe: "Add to salads, smoothies, or make detox teas and infusions."
                    },
                    {
                        name: "Lemons",
                        description: "Morning warm lemon water helps stimulate liver detoxification enzymes.",
                        image: "images/Lemons.jpg",
                        recipe: "Drink warm water with lemon on an empty stomach each morning."
                    },
                    {
                        name: "Spring Radishes",
                        description: "Rich in enzymes that cleanse the liver and gallbladder.",
                        image: "images/radish.jpg",
                        recipe: "Add to salads, slice thin for sandwiches, or quick-pickle them."
                    },
                    {
                        name: "Sprouts & Microgreens",
                        description: "Rich in enzymes and amino acids that support detoxification.",
                        image: "images/Sprouts.jpg",
                        recipe: "Top salads, sandwiches, or grain bowls with fresh sprouts."
                    },
                    {
                        name: "Green Tea",
                        description: "Loaded with antioxidants that support liver function.",
                        image: "images/greentea.jpg",
                        recipe: "Drink 2-3 cups daily, hot or cold, without sweeteners."
                    }
                ]);
                
                mealsHtml = `
                <h4>Weekday Meal Plan</h4>
                <div class="meal-day">
                    <div class="meal-item">
                        <span class="meal-time"><strong>Breakfast</strong></span>
                        <span class="meal-desc">Green detox smoothie (spinach, apple, lemon, ginger)</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Lunch</strong></span>
                        <span class="meal-desc">Spring detox salad (sprouts, radishes, asparagus)</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Dinner</strong></span>
                        <span class="meal-desc">Lemongrass soup with seaweed and tofu</span>
                    </div>
                </div>
                
                <h4>Weekend Meal Plan</h4>
                <div class="meal-day">
                    <div class="meal-item">
                        <span class="meal-time"><strong>Breakfast</strong></span>
                        <span class="meal-desc">Chia seed pudding with fresh berries</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Lunch</strong></span>
                        <span class="meal-desc">Quinoa salad with spring vegetables and lemon juice</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Dinner</strong></span>
                        <span class="meal-desc">Roasted spring vegetables with mint sauce</span>
                    </div>
                </div>
                `;
                
                supplementsHtml = `
                <h4>Recommended Supplements</h4>
                <ul class="supplement-list">
                    <li><strong>Milk Thistle:</strong> Supports liver detoxification and protects liver cells</li>
                    <li><strong>Dandelion Root:</strong> Traditional herb used to support liver function</li>
                    <li><strong>Chlorella:</strong> Helps bind heavy metals and provides nutritional support</li>
                    <li><strong>Activated Charcoal:</strong> Can help absorb toxins in the digestive tract</li>
                </ul>
                <p class="supplement-note">Note: Detox supplements should be used under medical supervision. Please consult with a healthcare professional.</p>
                `;
                
                lifestyleHtml = `
                <h4>Lifestyle Recommendations</h4>
                <ul class="lifestyle-list">
                    <li><strong>Morning Lemon Water:</strong> Drink a cup of warm lemon water each morning on an empty stomach</li>
                    <li><strong>Increased Hydration:</strong> Aim for 10-12 cups of water daily</li>
                    <li><strong>Dry Brushing:</strong> Use a dry brush to stimulate lymphatic drainage</li>
                    <li><strong>Sauna Sessions:</strong> If available, regular sauna use can promote detoxification through the skin</li>
                    <li><strong>Reduce Processed Foods:</strong> Avoid artificial additives, pesticides, and other chemicals</li>
                </ul>
                `;
                break;
                
            case 'energy':
                summaryText = `
                <div class="body-type-result">
                    <div class="type-icon"><i class="fas fa-bolt"></i></div>
                    <div class="type-details">
                        <h3>Your Primary Goal: <span id="body-type">Energy Enhancement</span></h3>
                        <p id="type-description">Based on your assessment, we've designed this spring eating plan focused on <strong>increasing energy levels</strong>. Spring is a time of energy renewal, and through nutritious food combinations and strategic meal timing, you can overcome spring fatigue and maintain vibrant energy throughout the day.</p>
                        <p>This plan considers your ${userData.activityLevel === 'active' ? 'high' : userData.activityLevel === 'moderate' ? 'moderate' : 'lower'} activity level, providing a balanced intake of carbohydrates, quality proteins, and healthy fats.</p>
                    </div>
                </div>
                `;
                
                // 创建能量食物项目
                foodsHtml = createFoodItemsHtml([
                    {
                        name: "Whole Grains",
                        description: "Oats, quinoa, and brown rice provide sustained energy.",
                        image: "images/WholeGrains.jpg",
                        recipe: "Use as base for breakfast bowls, salads, or side dishes."
                    },
                    {
                        name: "Healthy Fats",
                        description: "Avocados, olive oil, nuts, and seeds for sustained energy.",
                        image: "images/HealthyFats.jpg",
                        recipe: "Add avocado to toast, use olive oil in dressings, snack on nuts."
                    },
                    {
                        name: "Quality Proteins",
                        description: "Legumes, eggs, lean meats, fish (based on dietary preference).",
                        image: "images/QualityProteins.jpg",
                        recipe: "Include a protein source with each meal for sustained energy."
                    },
                    {
                        name: "Iron-Rich Foods",
                        description: "Spinach, lentils, beans to prevent fatigue.",
                        image: "images/Iron-Rich Foods.jpg",
                        recipe: "Pair with vitamin C foods to enhance absorption."
                    },
                    {
                        name: "B-Vitamin Foods",
                        description: "Whole grains, leafy greens, legumes for energy metabolism.",
                        image: "images/asparagus.jpg",
                        recipe: "Create grain bowls with leafy greens and a variety of vegetables."
                    },
                    {
                        name: "Potassium-Rich Fruits",
                        description: "Bananas, oranges for electrolyte balance and energy.",
                        image: "images/Potassium-Rich Fruits.jpg",
                        recipe: "Add to smoothies, oatmeal, or enjoy as snacks."
                    }
                ]);
                
                mealsHtml = `
                <h4>Weekday Meal Plan</h4>
                <div class="meal-day">
                    <div class="meal-item">
                        <span class="meal-time"><strong>Breakfast</strong></span>
                        <span class="meal-desc">Oatmeal with banana, nuts, and a touch of honey</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Mid-Morning Snack</strong></span>
                        <span class="meal-desc">Handful of mixed nuts and dried fruits</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Lunch</strong></span>
                        <span class="meal-desc">Energy bowl: quinoa, chickpeas, avocado, and spring vegetables</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Afternoon Snack</strong></span>
                        <span class="meal-desc">Greek yogurt with berries</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Dinner</strong></span>
                        <span class="meal-desc">Salmon with sweet potatoes and spring vegetables (or lentil alternative)</span>
                    </div>
                </div>
                
                <h4>Weekend Meal Plan</h4>
                <div class="meal-day">
                    <div class="meal-item">
                        <span class="meal-time"><strong>Breakfast</strong></span>
                        <span class="meal-desc">Whole grain toast with eggs and avocado (or mushroom sauté)</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Lunch</strong></span>
                        <span class="meal-desc">Mediterranean-style salad: chickpeas, olives, and vegetables</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Dinner</strong></span>
                        <span class="meal-desc">Brown rice with lentils and roasted spring vegetables</span>
                    </div>
                </div>
                `;
                
                supplementsHtml = `
                <h4>Recommended Supplements</h4>
                <ul class="supplement-list">
                    <li><strong>B-Complex:</strong> Supports energy metabolism and nervous system function</li>
                    <li><strong>Iron:</strong> Critical for energy production and oxygen transport (if deficient)</li>
                    <li><strong>Coenzyme Q10:</strong> Supports cellular energy production</li>
                    <li><strong>Magnesium:</strong> Involved in energy production and muscle function</li>
                </ul>
                <p class="supplement-note">Note: Before adding any supplements, it's advisable to consult with a healthcare professional.</p>
                `;
                
                lifestyleHtml = `
                <h4>Lifestyle Recommendations</h4>
                <ul class="lifestyle-list">
                    <li><strong>Regular Meal Timing:</strong> Eat every 3-4 hours to maintain stable blood sugar levels</li>
                    <li><strong>Morning Exercise:</strong> Light morning exercise can boost energy levels for the day</li>
                    <li><strong>Power Naps:</strong> Short 10-20 minute naps when possible</li>
                    <li><strong>Consistent Sleep Schedule:</strong> Maintain a regular sleep-wake cycle</li>
                    <li><strong>Moderate Caffeine:</strong> Limit to mornings and early afternoon</li>
                </ul>
                `;
                break;
                
            default:
                // 默认内容或其他健康目标
                summaryText = `
                <div class="body-type-result">
                    <div class="type-icon"><i class="fas fa-leaf"></i></div>
                    <div class="type-details">
                        <h3>Your Personalized <span id="body-type">Spring Wellness</span> Plan</h3>
                        <p id="type-description">Based on your assessment, we've designed this personalized spring eating plan. This plan integrates seasonal ingredients and nutritional science to meet your health needs and taste preferences.</p>
                        <p>As spring arrives, it's time to infuse your body with new vitality. Our recommendations blend traditional wisdom and modern nutrition to help you achieve optimal wellness.</p>
                    </div>
                </div>
                `;
                
                // 创建默认食物项目
                foodsHtml = createFoodItemsHtml([
                    {
                        name: "Spring Greens",
                        description: "Asparagus, spinach, spring peas, and bamboo shoots are nutrient-dense seasonal options.",
                        image: "images/asparagus.jpg",
                        recipe: "Lightly steam or use in fresh salads to preserve nutrients."
                    },
                    {
                        name: "Fresh Berries",
                        description: "Strawberries and early berries provide antioxidants and natural sweetness.",
                        image: "images/Berries.jpg",
                        recipe: "Enjoy fresh as snacks or add to breakfasts and desserts."
                    },
                    {
                        name: "Whole Grains",
                        description: "Provide sustained energy and essential fiber.",
                        image: "images/WholeGrains.jpg",
                        recipe: "Use as the foundation for balanced meals and energy bowls."
                    },
                    {
                        name: "Quality Proteins",
                        description: "Choose based on your dietary preferences.",
                        image: "images/QualityProteins.jpg",
                        recipe: "Include a portion with each meal for satiety and nutrition."
                    },
                    {
                        name: "Healthy Fats",
                        description: "Olive oil, nuts, seeds, and avocados provide essential fatty acids.",
                        image: "images/HealthyFats.jpg",
                        recipe: "Add to salads, use in cooking, or enjoy as nutrient-dense snacks."
                    },
                    {
                        name: "Fresh Herbs",
                        description: "Rosemary, mint, parsley, and cilantro add flavor and nutrients.",
                        image: "images/pexels-mali-64208.jpg",
                        recipe: "Use liberally in cooking to enhance flavor without added salt."
                    }
                ]);
                
                mealsHtml = `
                <h4>Daily Meal Recommendations</h4>
                <div class="meal-day">
                    <div class="meal-item">
                        <span class="meal-time"><strong>Breakfast</strong></span>
                        <span class="meal-desc">Protein-rich breakfast with complex carbohydrates</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Lunch</strong></span>
                        <span class="meal-desc">Large vegetable salad with adequate protein and whole grains</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Dinner</strong></span>
                        <span class="meal-desc">Light, easily digestible meal featuring spring vegetables</span>
                    </div>
                    <div class="meal-item">
                        <span class="meal-time"><strong>Snacks</strong></span>
                        <span class="meal-desc">Seasonal fruits, nuts, or yogurt</span>
                    </div>
                </div>
                `;
                
                supplementsHtml = `
                <h4>Supplement Recommendations</h4>
                <p>Based on your specific health goals, certain nutritional supplements may be beneficial. We recommend consulting with a nutrition expert or healthcare professional for personalized advice.</p>
                <p>Many spring foods are naturally rich in essential nutrients, so focus on a varied, seasonal diet before considering supplements.</p>
                `;
                
                lifestyleHtml = `
                <h4>Lifestyle Recommendations</h4>
                <ul class="lifestyle-list">
                    <li><strong>Stay Hydrated:</strong> Drink plenty of water throughout the day</li>
                    <li><strong>Enjoy Outdoor Activities:</strong> Spring is an ideal time to increase outdoor time</li>
                    <li><strong>Maintain Regular Sleep Patterns:</strong> Keep a healthy sleep-wake cycle</li>
                    <li><strong>Practice Mindful Eating:</strong> Eat slowly and pay attention to fullness cues</li>
                </ul>
                `;
                break;
        }
        
        // 填充页面内容
        planSummary.innerHTML = summaryText;
        foodRecommendations.innerHTML = foodsHtml;
        mealPlan.innerHTML = mealsHtml;
        supplementRecommendations.innerHTML = supplementsHtml;
        lifestyleRecommendations.innerHTML = lifestyleHtml;
    }
    
    // 创建食物项目HTML的辅助函数
    function createFoodItemsHtml(foodItems) {
        let html = '';
        
        foodItems.forEach(food => {
            html += `
            <div class="food-item">
                <img src="${food.image}" alt="${food.name}">
                <h4>${food.name}</h4>
                <p>${food.description}</p>
                ${food.recipe ? `<div class="food-recipe"><i class="fas fa-utensils"></i> ${food.recipe}</div>` : ''}
            </div>
            `;
        });
        
        return html;
    }
}); 