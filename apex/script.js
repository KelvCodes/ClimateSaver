EventListener('DOMContentLoaded', () => {
    // Initialize all components
    initAnimations();
    initClimateData();
    initCarbonCalculator();
    initEnergySimulator();
    initRecipeGenerator();
    initChallengeSystem();
    initEventFinder();
    initLeaderboard();
    initTipsSystem();
    initAccessibility();
    
    // Set up periodic updates
    setupPeriodicUpdates();
});

// ======================
// INITIALIZATION FUNCTIONS
// ======================

function initAnimations() {
    // Enhanced landing page animations with GSAP for smoother performance
    gsap.registerPlugin(ScrollTrigger);
    
    // Split text for animation
    const title = document.querySelector('.landing h1');
    if (title) {
        title.innerHTML = title.textContent.replace(/\S/g, '<span class="letter">$&</span>');
        
        gsap.timeline({
            defaults: { ease: "power3.out" }
        })
        .from(".landing .letter", {
            y: 80,
            opacity: 0,
            duration: 1,
            stagger: 0.04
        })
        .from(".landing p", {
            y: 40,
            opacity: 0,
            duration: 0.8
        }, "-=0.6")
        .from(".cta-button", {
            scale: 0,
            opacity: 0,
            rotate: 10,
            duration: 0.6
        }, "-=0.4");
    }

    // Particle animation with canvas for better performance
    initParticleCanvas();
    
    // Parallax effect with scroll trigger
    gsap.to(".landing-content", {
        y: (i, target) => -ScrollTrigger.maxScroll(window) * 0.1,
        ease: "none",
        scrollTrigger: {
            trigger: ".landing",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });
    
    // Animate sections on scroll
    gsap.utils.toArray(".section").forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 1,
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none none"
            }
        });
    });
}

function initParticleCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    
    const container = document.querySelector('.landing');
    if (container) {
        container.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        const isMobile = window.innerWidth <= 768;
        const particleCount = isMobile ? 30 : 80;
        const particles = [];
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speedX: Math.random() * 1 - 0.5,
                speedY: Math.random() * 1 - 0.5,
                opacity: Math.random() * 0.6 + 0.2
            });
        }
        
        // Animation loop
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
                ctx.fill();
                
                // Update position
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                
                // Reset particles that go off screen
                if (particle.x < 0 || particle.x > canvas.width || 
                    particle.y < 0 || particle.y > canvas.height) {
                    particle.x = Math.random() * canvas.width;
                    particle.y = Math.random() * canvas.height;
                }
            });
            
            requestAnimationFrame(animateParticles);
        }
        
        animateParticles();
        
        // Handle resize
        window.addEventListener('resize', () => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        });
    }
}

function initClimateData() {
    // Fetch real climate data from API
    async function fetchRealClimateData() {
        try {
            // First try a real API
            const response = await fetch('https://global-warming.org/api/co2-api');
            if (response.ok) {
                const data = await response.json();
                const latestData = data.co2[data.co2.length - 1];
                updateClimateUI(latestData.trend, latestData.day);
                return;
            }
        } catch (e) {
            console.log("Using fallback climate data");
        }
        
        // Fallback to simulated data if API fails
        const currentCO2 = 420 + (Math.random() * 0.5 - 0.25);
        const tempAnomaly = 1.1 + (Math.random() * 0.1 - 0.05);
        updateClimateUI(currentCO2, tempAnomaly);
    }
    
    function updateClimateUI(co2Level, tempAnomaly) {
        document.getElementById('co2Level').textContent = co2Level.toFixed(1);
        document.getElementById('tempAnomaly').textContent = tempAnomaly.toFixed(2);
        
        const progressPercent = (tempAnomaly / 1.5) * 100;
        gsap.to("#climateProgress", {
            width: `${progressPercent}%`,
            backgroundColor: tempAnomaly > 1.5 ? 'var(--danger)' : 'var(--warning)',
            duration: 1
        });
        
        // Animate numbers
        gsap.from(["#co2Level", "#tempAnomaly"], {
            scale: 0.9,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.7)"
        });
    }
    
    // Initial load
    document.getElementById('co2Level').innerHTML = '<span>Loading</span><span class="spinner"></span>';
    document.getElementById('tempAnomaly').innerHTML = '<span>Loading</span><span class="spinner"></span>';
    fetchRealClimateData();
    
    // Set up refresh
    document.querySelector('.refresh-climate')?.addEventListener('click', () => {
        document.getElementById('co2Level').innerHTML = '<span>Loading</span><span class="spinner"></span>';
        document.getElementById('tempAnomaly').innerHTML = '<span>Loading</span><span class="spinner"></span>';
        gsap.to(".refresh-climate i", {
            rotation: 360,
            duration: 1,
            ease: "power2.out"
        });
        setTimeout(fetchRealClimateData, 1200);
    });
}

function initCarbonCalculator() {
    const form = document.getElementById('footprintForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateFootprint();
    });
    
    // Enhanced input validation
    document.querySelectorAll('#footprintForm input').forEach(input => {
        input.addEventListener('input', function() {
            if (this.value < 0) this.value = 0;
        });
    });
    
    // Initialize chart placeholder
    const ctx = document.getElementById('footprintChart').getContext('2d');
    window.footprintChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: [], datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function calculateFootprint() {
    const transportKm = parseFloat(document.getElementById('transport').value) || 0;
    const electricityKwh = parseFloat(document.getElementById('electricity').value) || 0;
    const diet = document.getElementById('diet').value;
    const shopping = parseFloat(document.getElementById('shopping').value) || 0;
    
    // Enhanced calculation with more factors
    const transportEmissions = transportKm * 0.12 * (document.getElementById('transportType').value === 'electric' ? 0.5 : 1);
    const electricityEmissions = electricityKwh * (document.getElementById('energySource').value === 'renewable' ? 0.1 : 0.4);
    const shoppingEmissions = shopping * 5; // Approx kg CO2 per $100 spent
    
    let dietEmissions;
    switch(diet) {
        case 'meatDaily': dietEmissions = 200; break;
        case 'meatWeekly': dietEmissions = 120; break;
        case 'vegetarian': dietEmissions = 80; break;
        case 'vegan': dietEmissions = 50; break;
        default: dietEmissions = 150;
    }
    
    const totalEmissions = transportEmissions + electricityEmissions + dietEmissions + shoppingEmissions;
    
    // Show result section
    document.getElementById('footprintResult').style.display = 'block';
    
    // Animate result display
    gsap.from("#footprintResult", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out"
    });
    
    // Animate number counting
    animateValue('carbonValue', 0, totalEmissions, 1000);
    
    // Update progress bar
    const progressPercent = Math.min(100, (totalEmissions / 2000) * 100);
    gsap.to("#carbonProgress", {
        width: `${progressPercent}%`,
        backgroundColor: getProgressColor(totalEmissions),
        duration: 1
    });
    
    // Set message based on result
    const messages = [
        { threshold: 1000, message: "Excellent! Your footprint is well below average.", icon: "fa-star" },
        { threshold: 1500, message: "Good job! You're doing better than most.", icon: "fa-thumbs-up" },
        { threshold: 2000, message: "Average footprint. Try our tips to improve!", icon: "fa-info-circle" },
        { threshold: Infinity, message: "Your footprint is above average. Check our tips!", icon: "fa-exclamation-triangle" }
    ];
    
    const { message, icon } = messages.find(m => totalEmissions < m.threshold);
    document.getElementById('carbonMessage').innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    
    // Update chart with detailed breakdown
    updateFootprintChart([
        { name: 'Transport', value: transportEmissions },
        { name: 'Energy', value: electricityEmissions },
        { name: 'Diet', value: dietEmissions },
        { name: 'Shopping', value: shoppingEmissions }
    ], totalEmissions);
    
    // Show personalized tips
    showPersonalizedTips(totalEmissions, [
        { name: 'Transport', value: transportEmissions },
        { name: 'Diet', value: dietEmissions },
        { name: 'Energy', value: electricityEmissions }
    ]);
}

function updateFootprintChart(breakdown, total) {
    const ctx = document.getElementById('footprintChart').getContext('2d');
    
    // Destroy previous chart if exists
    if (window.footprintChart) {
        window.footprintChart.destroy();
    }
    
    // Sort breakdown by highest impact
    breakdown.sort((a, b) => b.value - a.value);
    
    // Create new chart
    window.footprintChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: breakdown.map(item => item.name),
            datasets: [{
                data: breakdown.map(item => item.value),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 20,
                        font: {
                            family: "'Open Sans', sans-serif",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const percentage = Math.round((context.raw / total) * 100);
                            return `${context.label}: ${context.raw.toFixed(1)} kg (${percentage}%)`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Your Carbon Footprint Breakdown',
                    font: {
                        size: 16,
                        family: "'Open Sans', sans-serif"
                    },
                    padding: { top: 10, bottom: 20 }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

function showPersonalizedTips(totalEmissions, breakdown) {
    const tipsContainer = document.getElementById('personalizedTips');
    tipsContainer.innerHTML = '';
    
    // Sort by highest impact area
    const highestImpact = breakdown.sort((a, b) => b.value - a.value)[0].name;
    
    // Get tips for highest impact area
    const areaTips = {
        'Transport': [
            "🚗 Carpool or use public transport once a week",
            "🚲 Try biking or walking for short trips",
            "⚡ Consider an electric vehicle for your next car"
        ],
        'Diet': [
            "🌱 Try meatless Mondays",
            "🥦 Choose local and seasonal produce",
            "🍽️ Reduce food waste by planning meals"
        ],
        'Energy': [
            "💡 Switch to LED bulbs",
            "🌞 Use natural light when possible",
            "🏠 Improve home insulation"
        ]
    };
    
    // Create tips cards
    areaTips[highestImpact].forEach((tip, i) => {
        const tipEl = document.createElement('div');
        tipEl.className = 'tip-card';
        tipEl.innerHTML = `<p>${tip}</p>`;
        tipsContainer.appendChild(tipEl);
        
        gsap.from(tipEl, {
            opacity: 0,
            x: 20,
            delay: i * 0.1,
            duration: 0.5
        });
    });
    
    // Show general tips if footprint is high
    if (totalEmissions > 1500) {
        const generalTips = [
            "🛒 Buy second-hand when possible",
            "🚰 Reduce water usage with shorter showers",
            "✈️ Consider staycations instead of flights"
        ];
        
        generalTips.forEach((tip, i) => {
            const tipEl = document.createElement('div');
            tipEl.className = 'tip-card';
            tipEl.innerHTML = `<p>${tip}</p>`;
            tipsContainer.appendChild(tipEl);
            
            gsap.from(tipEl, {
                opacity: 0,
                x: 20,
                delay: (i + areaTips[highestImpact].length) * 0.1,
                duration: 0.5
            });
        });
    }
}

function initEnergySimulator() {
    const form = document.getElementById('energySimulatorForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        runEnergySimulation();
    });
    
    // Interactive location selector
    const locationInput = document.getElementById('location');
    if (locationInput) {
        locationInput.addEventListener('change', function() {
            const locationImages = {
                'sunny': 'url("https://images.unsplash.com/photo-1509316785289-025f5b8b7393")',
                'moderate': 'url("https://images.unsplash.com/photo-1515694346937-94d85e41e6f0")',
                'cloudy': 'url("https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5")'
            };
            
            document.querySelector('.simulator-visual').style.backgroundImage = 
                locationImages[this.value] || locationImages['moderate'];
        });
    }
}

function runEnergySimulation() {
    const homeSize = parseFloat(document.getElementById('homeSize').value) || 100;
    const location = document.getElementById('location').value;
    const roofType = document.getElementById('roofType').value;
    const panelType = document.getElementById('panelType').value;
    
    // More sophisticated calculation
    let panelArea;
    switch(roofType) {
        case 'flat': panelArea = homeSize * 0.4; break;
        case 'pitched': panelArea = homeSize * 0.3; break;
        case 'large': panelArea = homeSize * 0.5; break;
        default: panelArea = homeSize * 0.35;
    }
    
    let efficiency;
    switch(panelType) {
        case 'mono': efficiency = 1.2; break;
        case 'poly': efficiency = 1.0; break;
        case 'thin': efficiency = 0.8; break;
        default: efficiency = 1.0;
    }
    
    let productionFactor;
    switch(location) {
        case 'sunny': productionFactor = 20; break;
        case 'moderate': productionFactor = 15; break;
        case 'cloudy': productionFactor = 10; break;
        default: productionFactor = 15;
    }
    
    const energyProduced = panelArea * productionFactor * efficiency;
    const savingsPerYear = energyProduced * 0.12 * 12; // Average electricity price $0.12/kWh
    
    document.getElementById('simulatorResult').style.display = 'block';
    document.getElementById('panelArea').textContent = panelArea.toFixed(1);
    document.getElementById('yearlySavings').textContent = savingsPerYear.toFixed(0);
    
    // Animate results
    gsap.from("#simulatorResult", {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power2.out"
    });
    
    animateValue('energyProduced', 0, energyProduced, 1000);
    
    const progressPercent = Math.min(100, (energyProduced / 900) * 100);
    gsap.to("#energyProgress", {
        width: `${progressPercent}%`,
        backgroundColor: getEnergyProgressColor(energyProduced),
        duration: 1
    });
    
    // Set message based on result
    let message, icon;
    if (energyProduced > 700) {
        message = "You could potentially go completely solar!";
        icon = "fa-sun";
    } else if (energyProduced > 400) {
        message = "You could significantly reduce your grid dependence.";
        icon = "fa-bolt";
    } else {
        message = "Every bit helps! This would reduce your carbon footprint.";
        icon = "fa-leaf";
    }
    
    document.getElementById('energyMessage').innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    
    // Show estimated savings over time
    updateSavingsChart(savingsPerYear);
}

function updateSavingsChart(yearlySavings) {
    const ctx = document.getElementById('savingsChart').getContext('2d');
    
    if (window.savingsChart) {
        window.savingsChart.destroy();
    }
    
    const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const savingsData = years.map(year => yearlySavings * year);
    
    window.savingsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years.map(y => `Year ${y}`),
            datasets: [{
                label: 'Cumulative Savings ($)',
                data: savingsData,
                borderColor: '#4BC0C0',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Savings ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `$${context.raw.toFixed(0)} saved`;
                        }
                    }
                }
            }
        }
    });
}

function initRecipeGenerator() {
    const form = document.getElementById('recipeForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        generateRecipe();
    });
    
    // Initialize ingredient autocomplete
    const ingredientInput = document.getElementById('ingredients');
    if (ingredientInput) {
        new Awesomplete(ingredientInput, {
            list: [
                'lentils', 'tomatoes', 'onions', 'garlic', 'spinach', 
                'chickpeas', 'avocado', 'rice', 'broccoli', 'carrots',
                'bell peppers', 'quinoa', 'kale', 'sweet potato', 'mushrooms',
                'zucchini', 'eggplant', 'beans', 'tofu', 'tempeh'
            ],
            minChars: 1,
            maxItems: 5
        });
    }
}

function generateRecipe() {
    const userIngredients = document.getElementById('ingredients').value.toLowerCase()
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);
    
    const dietaryPreference = document.getElementById('dietary').value;
    const cookingTime = document.getElementById('cookingTime').value;
    
    let matchedRecipes = recipes.filter(recipe => {
        // Match ingredients
        const matchesIngredients = userIngredients.length === 0 || 
            userIngredients.some(userIng => 
                recipe.ingredients.some(ingredient => 
                    ingredient.includes(userIng)
            );
        
        // Match dietary
        const matchesDietary = dietaryPreference === 'all' || 
            recipe.dietary.includes(dietaryPreference);
        
        // Match cooking time
        let matchesTime = true;
        if (cookingTime !== 'any') {
            const recipeTime = parseInt(recipe.prepTime);
            if (cookingTime === 'quick' && recipeTime > 30) matchesTime = false;
            if (cookingTime === 'medium' && (recipeTime <= 15 || recipeTime > 45)) matchesTime = false;
            if (cookingTime === 'long' && recipeTime <= 30) matchesTime = false;
        }
        
        return matchesIngredients && matchesDietary && matchesTime;
    });
    
    const resultsContainer = document.getElementById('recipeResults');
    resultsContainer.innerHTML = '';
    
    if (matchedRecipes.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'tip-card';
        noResults.innerHTML = `
            <h3>No recipes found</h3>
            <p>Try different ingredients or broaden your dietary preferences.</p>
            <p>Here's a suggestion: <strong>${recipes[Math.floor(Math.random() * recipes.length)].name}</strong></p>
        `;
        resultsContainer.appendChild(noResults);
        return;
    }
    
    // Sort by most matching ingredients
    matchedRecipes.sort((a, b) => {
        const aMatches = a.ingredients.filter(i => 
            userIngredients.some(ui => i.includes(ui))).length;
        const bMatches = b.ingredients.filter(i => 
            userIngredients.some(ui => i.includes(ui))).length;
        return bMatches - aMatches;
    });
    
    // Display results
    matchedRecipes.forEach((recipe, index) => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        
        // Highlight matching ingredients
        const ingredientsList = recipe.ingredients.map(ing => {
            const isMatch = userIngredients.some(ui => ing.includes(ui));
            return isMatch ? `<strong>${ing}</strong>` : ing;
        }).join(', ');
        
        recipeCard.innerHTML = `
            <div class="recipe-image" style="background-image: url('${recipe.image}')">
                <div class="recipe-badge">${recipe.carbonScore} Carbon</div>
                <div class="recipe-time">${recipe.prepTime}</div>
            </div>
            <div class="recipe-content">
                <h3>${recipe.name}</h3>
                <p class="recipe-dietary">${recipe.dietary.map(d => 
                    `<span class="dietary-tag">${d}</span>`).join(' ')}</p>
                <p><strong>Ingredients:</strong> ${ingredientsList}</p>
                <div class="recipe-instructions">
                    <h4>Instructions</h4>
                    <p>${recipe.instructions}</p>
                </div>
                <button class="save-recipe" data-id="${index}">
                    <i class="far fa-bookmark"></i> Save
                </button>
            </div>
        `;
        
        resultsContainer.appendChild(recipeCard);
        
        // Animate cards
        gsap.from(recipeCard, {
            opacity: 0,
            y: 30,
            delay: index * 0.1,
            duration: 0.5,
            ease: "power2.out"
        });
    });
    
    // Add event listeners to save buttons
    document.querySelectorAll('.save-recipe').forEach(btn => {
        btn.addEventListener('click', function() {
            const recipeId = this.getAttribute('data-id');
            saveRecipe(recipeId);
            this.innerHTML = '<i class="fas fa-check"></i> Saved';
            this.disabled = true;
        });
    });
}

function saveRecipe(recipeId) {
    let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
    if (!savedRecipes.includes(recipeId)) {
        savedRecipes.push(recipeId);
        localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
        showNotification('Recipe saved to your collection!');
    }
}

function initChallengeSystem() {
    // Load saved challenge if exists
    const savedChallenge = localStorage.getItem('currentChallenge');
    if (savedChallenge) {
        currentChallenge = savedChallenge;
        challengeDaysCompleted = parseInt(localStorage.getItem('challengeDaysCompleted')) || 1;
        updateChallengeUI();
    }
    
    // Initialize challenge selector
    const challengeSelect = document.getElementById('challengeSelect');
    if (challengeSelect) {
        challengeSelect.addEventListener('change', function() {
            document.querySelector('.challenge-description').textContent = 
                getChallengeDescription(this.value);
        });
        
        // Set initial description
        document.querySelector('.challenge-description').textContent = 
            getChallengeDescription(challengeSelect.value);
    }
    
    // Initialize start button
    document.getElementById('startChallenge')?.addEventListener('click', startChallenge);
}

function getChallengeDescription(challenge) {
    const descriptions = {
        'meatFree': "Go meat-free for 30 days. Each day you'll get a new plant-based meal suggestion and nutrition tips.",
        'zeroWaste': "Reduce your waste to nearly zero. Daily tips on recycling, composting, and sustainable alternatives.",
        'energySave': "Cut your energy consumption. Learn about energy-saving habits and technologies each day.",
        'treePlant': "Help reforest the planet. Daily actions include planting, donating, or learning about trees."
    };
    return descriptions[challenge] || "Select a challenge to get started!";
}

function startChallenge() {
    currentChallenge = document.getElementById('challengeSelect').value;
    challengeDaysCompleted = 1;
    
    // Save to localStorage
    localStorage.setItem('currentChallenge', currentChallenge);
    localStorage.setItem('challengeDaysCompleted', challengeDaysCompleted.toString());
    
    document.getElementById('challengeTracker').style.display = 'block';
    updateChallengeUI();
    
    // Show welcome message with challenge info
    const welcomeMessage = `
        <h3>Challenge Started!</h3>
        <p>You've begun the <strong>${document.getElementById('challengeSelect').selectedOptions[0].text}</strong> challenge.</p>
        <p>${getChallengeDescription(currentChallenge)}</p>
        <p>Check back daily for new actions and tips!</p>
    `;
    
    showModal('Challenge Started!', welcomeMessage);
    
    // Add to leaderboard
    joinLeaderboard();
}

function updateChallengeUI() {
    const progressPercent = (challengeDaysCompleted / 30) * 100;
    gsap.to("#challengeProgress", {
        width: `${progressPercent}%`,
        duration: 0.8,
        ease: "power2.out"
    });
    
    document.getElementById('challengeStatus').innerHTML = `
        <i class="fas fa-calendar-alt"></i> Day ${challengeDaysCompleted} of 30
    `;
    
    const actionsContainer = document.getElementById('challengeActions');
    actionsContainer.innerHTML = '';
    
    // Get today's action and tip
    const { action, tip } = getDailyChallengeAction(currentChallenge, challengeDaysCompleted);
    
    const actionEl = document.createElement('div');
    actionEl.className = 'challenge-action';
    actionEl.innerHTML = `
        <h4><i class="fas fa-tasks"></i> Today's Action</h4>
        <p>${action}</p>
        <div class="challenge-tip">
            <h4><i class="fas fa-lightbulb"></i> Did You Know?</h4>
            <p>${tip}</p>
        </div>
    `;
    actionsContainer.appendChild(actionEl);
    
    // Add complete button if not finished
    if (challengeDaysCompleted < 30) {
        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-btn';
        completeBtn.innerHTML = `
            <i class="fas fa-check-circle"></i> Complete Day ${challengeDaysCompleted}
        `;
        completeBtn.addEventListener('click', completeDay);
        actionsContainer.appendChild(completeBtn);
    } else {
        const completeEl = document.createElement('div');
        completeEl.className = 'challenge-complete';
        completeEl.innerHTML = `
            <h3><i class="fas fa-trophy"></i> Challenge Complete!</h3>
            <p>Congratulations on completing your 30-day challenge!</p>
            <p>You've earned ${challengeDaysCompleted * 50} eco-points!</p>
        `;
        actionsContainer.appendChild(completeEl);
        
        // Show celebration
        showCelebration();
    }
    
    // Animate UI update
    gsap.from([actionEl, actionsContainer.lastChild], {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6
    });
}

function getDailyChallengeAction(challenge, day) {
    const actions = {
        'meatFree': [
            "Try a tofu scramble for breakfast instead of eggs.",
            "Make a lentil soup for lunch - high in protein and delicious!",
            "Experiment with a veggie burger for dinner tonight."
            // ... more actions for each day
        ],
        'zeroWaste': [
            "Bring your own bags to the grocery store today.",
            "Use a reusable water bottle instead of disposable ones.",
            "Pack lunch in reusable containers instead of plastic wrap."
            // ... more actions
        ],
        'energySave': [
            "Turn off lights when leaving a room today.",
            "Unplug devices that aren't in use to prevent phantom load.",
            "Lower your thermostat by 1 degree and wear a sweater."
            // ... more actions
        ],
        'treePlant': [
            "Plant a tree in your yard or community space.",
            "Donate to a tree-planting organization.",
            "Learn about native tree species in your area."
            // ... more actions
        ]
    };
    
    const tips = {
        'meatFree': [
            "Producing a pound of beef emits 20x more greenhouse gases than a pound of vegetables.",
            "If everyone in the U.S. ate no meat for just one day, it would save 100 billion gallons of water.",
            "A vegetarian diet requires 2.5 times less land than a meat-based diet."
        ],
        'zeroWaste': [
            "The average American produces 4.5 pounds of trash per day.",
            "Recycling one aluminum can saves enough energy to run a TV for 3 hours.",
            "Plastic bags can take up to 1,000 years to decompose in landfills."
        ],
        'energySave': [
            "LED bulbs use 75% less energy than incandescent lighting.",
            "A laptop uses 80% less electricity than a desktop computer.",
            "Unplugging unused electronics can save up to 10% on your energy bill."
        ],
        'treePlant': [
            "A single tree can absorb as much as 48 pounds of CO2 per year.",
            "Trees properly placed around buildings can reduce air conditioning needs by 30%.",
            "Over a 50-year lifetime, a tree generates $31,250 worth of oxygen."
        ]
    };
    
    // Cycle through tips and actions if we have more days than content
    const actionIndex = (day - 1) % actions[challenge].length;
    const tipIndex = (day - 1) % tips[challenge].length;
    
    return {
        action: actions[challenge][actionIndex],
        tip: tips[challenge][tipIndex]
    };
}

function completeDay() {
    challengeDaysCompleted++;
    localStorage.setItem('challengeDaysCompleted', challengeDaysCompleted.toString());
    updateChallengeUI();
    
    // Update leaderboard
    updateLeaderboard();
    
    // Show encouragement
    const encouragements = [
        "Great job! Every action counts!",
        "You're making a difference! Keep it up!",
        "Proud of your commitment to sustainability!",
        "Imagine the impact if everyone took these small steps!",
        "Consistency is key - you're doing amazing!"
    ];
    
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    showNotification(randomEncouragement);
    
    // Show occasional milestone messages
    if (challengeDaysCompleted === 7) {
        showModal('One Week In!', 'You\'ve completed your first week! Keep up the great work!');
    } else if (challengeDaysCompleted === 15) {
        showModal('Halfway There!', 'You\'re halfway through the challenge! The planet thanks you!');
    }
}

function initEventFinder() {
    const form = document.getElementById('eventFinderForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        findLocalEvents();
    });
    
    // Initialize location autocomplete
    const locationInput = document.getElementById('eventLocation');
    if (locationInput) {
        new Awesomplete(locationInput, {
            list: [
                'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
                'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Francisco',
                'Austin', 'Seattle', 'Denver', 'Boston', 'Washington'
            ],
            minChars: 1,
            maxItems: 5
        });
    }
}

function findLocalEvents() {
    const location = document.getElementById('eventLocation').value.toLowerCase();
    const eventType = document.getElementById('eventType').value;
    
    // In a real app, this would be an API call
    const matchedEvents = mockEvents.filter(event => 
        event.location.includes(location) && 
        (eventType === 'all' || event.type.toLowerCase() === eventType)
    );
    
    const resultsContainer = document.getElementById('eventResults');
    resultsContainer.innerHTML = '';
    
    if (matchedEvents.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'tip-card';
        noResults.innerHTML = `
            <h3>No events found</h3>
            <p>Try a different location or event type.</p>
            <p>You can also check online platforms like <a href="https://www.meetup.com/" target="_blank">Meetup</a> 
            or <a href="https://www.eventbrite.com/" target="_blank">Eventbrite</a> for more events.</p>
        `;
        resultsContainer.appendChild(noResults);
        return;
    }
    
    matchedEvents.forEach((event, index) => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        
        // Format date
        const eventDate = new Date(event.date);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = eventDate.toLocaleDateString('en-US', options);
        
        eventCard.innerHTML = `
            <div class="event-header">
                <h3>${event.name}</h3>
                <span class="event-type ${event.type.toLowerCase().replace(' ', '-')}">
                    ${event.type}
                </span>
            </div>
            <div class="event-details">
                <p><i class="fas fa-calendar-alt"></i> ${formattedDate}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${event.location.charAt(0).toUpperCase() + event.location.slice(1)}</p>
            </div>
            <button class="event-rsvp">
                <i class="fas fa-calendar-plus"></i> RSVP
            </button>
        `;
        
        resultsContainer.appendChild(eventCard);
        
        // Animate cards
        gsap.from(eventCard, {
            opacity: 0,
            y: 20,
            delay: index * 0.1,
            duration: 0.5,
            ease: "power2.out"
        });
    });
    
    // Add RSVP functionality
    document.querySelectorAll('.event-rsvp').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventName = this.parentElement.querySelector('h3').textContent;
            showModal('RSVP Confirmation', `You've signed up for ${eventName}! We'll send you a reminder as the date approaches.`);
            this.innerHTML = '<i class="fas fa-check"></i> Registered';
            this.disabled = true;
        });
    });
}

function initLeaderboard() {
    // Load leaderboard from localStorage
    const savedLeaderboard = localStorage.getItem('communityLeaderboard');
    if (savedLeaderboard) {
        leaderboard = JSON.parse(savedLeaderboard);
    } else {
        // Default leaderboard
        leaderboard = [
            { name: "EcoWarrior123", score: 1500, avatar: "🌎" },
            { name: "GreenGuru", score: 1200, avatar: "🌱" },
            { name: "SustainaStar", score: 1000, avatar: "✨" },
            { name: "PlanetPal", score: 850, avatar: "💚" },
            { name: "EcoExplorer", score: 700, avatar: "🧭" }
        ];
    }
    
    updateLeaderboard();
    
    // Initialize join button
    document.getElementById('joinLeaderboard')?.addEventListener('click', joinLeaderboard);
}

function updateLeaderboard() {
    const container = document.getElementById('leaderboard');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Sort by score
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Add current user if not already in leaderboard
    const currentUser = localStorage.getItem('leaderboardName');
    if (currentUser && !leaderboard.some(user => user.name === currentUser)) {
        const currentChallenge = localStorage.getItem('currentChallenge');
        const challengeDays = parseInt(localStorage.getItem('challengeDaysCompleted')) || 0;
        
        if (currentChallenge && challengeDays > 0) {
            leaderboard.push({
                name: currentUser,
                score: challengeDays * 50,
                avatar: "👤"
            });
        }
    }
    
    // Keep only top 20
    if (leaderboard.length > 20) {
        leaderboard = leaderboard.slice(0, 20);
    }
    
    // Save to localStorage
    localStorage.setItem('communityLeaderboard', JSON.stringify(leaderboard));
    
    // Display leaderboard
    leaderboard.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'leaderboard-entry';
        
        // Special styling for top 3
        if (index < 3) {
            entryDiv.classList.add(`top-${index + 1}`);
        }
        
        // Highlight current user
        const isCurrentUser = entry.name === localStorage.getItem('leaderboardName');
        if (isCurrentUser) {
            entryDiv.classList.add('current-user');
        }
        
        entryDiv.innerHTML = `
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-avatar">${entry.avatar || "👤"}</div>
            <div class="leaderboard-name">
                ${entry.name}
                ${isCurrentUser ? '<span class="you-badge">You</span>' : ''}
            </div>
            <div class="leaderboard-score">${entry.score} pts</div>
        `;
        
        container.appendChild(entryDiv);
        
        // Animate entries
        gsap.from(entryDiv, {
            opacity: 0,
            y: 20,
            delay: index * 0.05,
            duration: 0.4
        });
    });
}

function joinLeaderboard() {
    const savedName = localStorage.getItem('leaderboardName');
    const name = savedName || prompt("Choose your leaderboard nickname (max 15 chars):");
    
    if (name) {
        // Truncate if too long
        const displayName = name.length > 15 ? name.substring(0, 15) + '...' : name;
        
        localStorage.setItem('leaderboardName', displayName);
        
        // Add emoji avatar based on name
        const emojis = ["🌎", "🌱", "🌞", "🌊", "🍃", "🌳", "♻️", "💧", "☀️", "🦋"];
        const avatar = emojis[displayName.length % emojis.length];
        
        // Remove old entry if exists
        leaderboard = leaderboard.filter(user => user.name !== displayName);
        
        // Add with current challenge progress
        const challengeDays = parseInt(localStorage.getItem('challengeDaysCompleted')) || 0;
        leaderboard.push({
            name: displayName,
            score: challengeDays * 50,
            avatar
        });
        
        updateLeaderboard();
        showNotification(`Welcome to the leaderboard, ${displayName}!`);
        
        // Show celebration for new users
        if (!savedName) {
            showCelebration();
        }
    }
}

function initTipsSystem() {
    // Load saved tips
    const savedTips = localStorage.getItem('savedTips');
    if (savedTips) {
        document.getElementById('tipsContainer').innerHTML = savedTips;
    } else {
        // Generate initial tips
        for (let i = 0; i < 3; i++) {
            generateNewTip();
        }
    }
    
    // Set up new tip button
    document.getElementById('newTipBtn')?.addEventListener('click', generateNewTip);
    
    // Set up periodic tips
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            generateNewTip();
        }
    }, 300000); // Every 5 minutes
}

function generateNewTip() {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    const newTip = document.createElement('div');
    newTip.className = 'tip-card';
    newTip.innerHTML = `
        <h3>${randomTip.title}</h3>
        <p>${randomTip.content}</p>
        <button class="save-tip-btn">
            <i class="far fa-bookmark"></i> Save
        </button>
    `;
    
    const container = document.getElementById('tipsContainer');
    container.insertBefore(newTip, container.firstChild);
    
    // Add save functionality
    newTip.querySelector('.save-tip-btn').addEventListener('click', function() {
        saveTipToProfile(randomTip);
        this.innerHTML = '<i class="fas fa-check"></i> Saved';
        this.disabled = true;
    });
    
    // Limit to 5 tips
    if (container.children.length > 5) {
        container.removeChild(container.lastChild);
    }
    
    // Save to localStorage
    localStorage.setItem('savedTips', container.innerHTML);
    
    // Animate new tip
    gsap.from(newTip, {
        opacity: 0,
        x: 20,
        duration: 0.6,
        ease: "power2.out"
    });
}

function saveTipToProfile(tip) {
    let savedTips = JSON.parse(localStorage.getItem('userSavedTips')) || [];
    
    // Check if already saved
    if (!savedTips.some(t => t.title === tip.title)) {
        savedTips.unshift(tip); // Add to beginning
        localStorage.setItem('userSavedTips', JSON.stringify(savedTips));
        showNotification('Tip saved to your profile!');
    }
}

function initAccessibility() {
    // Keyboard navigation for tabs
    document.querySelectorAll('.tab-btn').forEach((btn, index) => {
        btn.setAttribute('tabindex', 0);
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
    
    // Skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.prepend(skipLink);
    
    // Focus styles for interactive elements
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Tab') {
            document.documentElement.classList.add('keyboard-nav');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.documentElement.classList.remove('keyboard-nav');
    });
    
    // ARIA attributes for dynamic content
    document.querySelectorAll('[role="alert"]').forEach(alert => {
        alert.setAttribute('aria-live', 'polite');
    });
}

function setupPeriodicUpdates() {
    // Update climate data every hour
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            initClimateData();
        }
    }, 3600000);
    
    // Show random tip every 15 minutes
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            showNotification(`${randomTip.title}: ${randomTip.content}`);
        }
    }, 900000);
    
    // Check for challenge updates daily
    setInterval(() => {
        const lastCompletion = localStorage.getItem('lastChallengeCompletion');
        if (lastCompletion) {
            const lastDate = new Date(lastCompletion);
            const today = new Date();
            
            if (today.getDate() !== lastDate.getDate() || 
                today.getMonth() !== lastDate.getMonth()) {
                showNotification("Don't forget to complete today's challenge action!");
            }
        }
    }, 86400000); // 24 hours
}

// ======================
// HELPER FUNCTIONS
// ======================

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        obj.textContent = numberWithCommas(value);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getProgressColor(value) {
    if (value < 1000) return 'var(--success)';
    if (value < 1500) return 'var(--primary)';
    if (value < 2000) return 'var(--warning)';
    return 'var(--danger)';
}

function getEnergyProgressColor(value) {
    if (value > 700) return 'var(--success)';
    if (value > 400) return 'var(--primary)';
    return 'var(--warning)';
}

function showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-info-circle"></i>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Animate in
    gsap.from(notification, {
        y: 50,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
    });
    
    // Auto-dismiss after duration
    setTimeout(() => {
        gsap.to(notification, {
            y: 50,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => notification.remove()
        });
    }, duration);
    
    // Allow manual dismiss
    notification.addEventListener('click', () => {
        gsap.to(notification, {
            y: 50,
            opacity: 0,
            duration: 0.2,
            onComplete: () => notification.remove()
        });
    });
}

function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <h2>${title}</h2>
            <div class="modal-body">${content}</div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    
    // Close button
    modal.querySelector('.modal-close').addEventListener('click', () => {
        closeModal(modal);
    });
    
    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
    
    // Animate in
    gsap.from(modal.querySelector('.modal-content'), {
        y: 50,
        opacity: 0,
        duration: 0.3,
        ease: "back.out(1.7)"
    });
}

function closeModal(modal) {
    gsap.to(modal.querySelector('.modal-content'), {
        y: 50,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
            modal.remove();
            document.body.classList.remove('modal-open');
        }
    });
}

function showCelebration() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
            return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        // Use confetti.js if available
        if (window.confetti) {
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }
    }, 250);
}

// Tab System
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`button[onclick="openTab('${tabName}')"]`).classList.add('active');
    
    // Animate tab content
    gsap.from(`#${tabName}`, {
        opacity: 0,
        y: 15,
        duration: 0.5,
        ease: "power2.out"
    });
}

// Scroll to Main Content
function scrollToMain() {
    document.querySelector('main').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Global variables
let currentChallenge = null;
let challengeDaysCompleted = 0;
let leaderboard = [];

const tips = [
    {
        title: "Unplug devices",
        content: "Phantom energy from devices on standby can account for 5-10% of home energy use."
    },
    {
        title: "Wash clothes in cold water",
        content: "About 90% of the energy used by washing machines goes to heating water."
    },
    {
        title: "Reduce food waste",
        content: "If food waste were a country, it would be the 3rd largest emitter of greenhouse gases."
    },
    {
        title: "Use a programmable thermostat",
        content: "Can save up to 10% on heating and cooling annually."
    },
    {
        title: "Plant a tree",
        content: "Over its lifetime, a single tree can absorb a ton of CO2."
    },
    {
        title: "Switch to LED bulbs",
        content: "LEDs use up to 80% less energy than traditional bulbs."
    },
    {
        title: "Shorter showers",
        content: "Reducing your shower time by 2 minutes can save 10 gallons of water."
    },
    {
        title: "Air dry clothes",
        content: "Clothes dryers account for 6% of household electricity use."
    }
];

const recipes = [
    {
        name: "Lentil & Vegetable Curry",
        ingredients: ["lentils", "tomatoes", "onions", "garlic", "spinach", "coconut milk"],
        dietary: ["vegan", "glutenFree"],
        carbonScore: "Low",
        prepTime: "30 mins",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        instructions: "1. Sauté onions and garlic. 2. Add lentils and tomatoes. 3. Simmer for 20 mins. 4. Add spinach and coconut milk at the end."
    },
    {
        name: "Chickpea Salad Wrap",
        ingredients: ["chickpeas", "lettuce", "tomatoes", "avocado", "tortilla", "lemon juice"],
        dietary: ["vegan"],
        carbonScore: "Very Low",
        prepTime: "15 mins",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        instructions: "1. Mash chickpeas with lemon juice. 2. Mix with chopped veggies. 3. Spread on tortilla and wrap."
    },
    {
        name: "Vegetable Stir Fry",
        ingredients: ["rice", "broccoli", "carrots", "bell peppers", "soy sauce", "ginger"],
        dietary: ["vegan", "glutenFree"],
        carbonScore: "Low",
        prepTime: "20 mins",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        instructions: "1. Cook rice. 2. Stir-fry veggies with ginger. 3. Add soy sauce. 4. Serve over rice."
    },
    {
        name: "Quinoa Power Bowl",
        ingredients: ["quinoa", "kale", "sweet potato", "avocado", "tahini", "lemon"],
        dietary: ["vegan", "glutenFree"],
        carbonScore: "Very Low",
        prepTime: "25 mins",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        instructions: "1. Roast sweet potato. 2. Cook quinoa. 3. Massage kale with lemon. 4. Assemble bowl and drizzle with tahini."
    },
    {
        name: "Mushroom Risotto",
        ingredients: ["arborio rice", "mushrooms", "onions", "garlic", "vegetable broth", "white wine"],
        dietary: ["vegetarian"],
        carbonScore: "Low",
        prepTime: "40 mins",
        image: "https://images.unsplash.com/photo-1476124369491-5634c36a1f91?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        instructions: "1. Sauté onions and garlic. 2. Add rice and mushrooms. 3. Deglaze with wine. 4. Gradually add broth, stirring until creamy."
    },
    {
        name: "Black Bean Tacos",
        ingredients: ["black beans", "corn tortillas", "avocado", "lime", "cilantro", "red onion"],
        dietary: ["vegan", "glutenFree"],
        carbonScore: "Very Low",
        prepTime: "15 mins",
        image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        instructions: "1. Warm beans with spices. 2. Chop veggies. 3. Assemble tacos with beans and toppings. 4. Squeeze lime on top."
    }
];

const mockEvents = [
    { location: "new york", name: "Central Park Tree Planting", date: "2025-05-10", type: "Tree Planting" },
    { location: "new york", name: "Brooklyn Cleanup Drive", date: "2025-05-15", type: "Cleanup" },
    { location: "san francisco", name: "Golden Gate Park Restoration", date: "2025-05-12", type: "Tree Planting" },
    { location: "san francisco", name: "Beach Cleanup", date: "2025-05-20", type: "Cleanup" },
    { location: "los angeles", name: "Urban Garden Workshop", date: "2025-05-18", type: "Workshop" },
    { location: "chicago", name: "Lakefront Recycling Drive", date: "2025-05-22", type: "Recycling" }
];
