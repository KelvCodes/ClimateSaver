
    // Animate tab content
    anime({
        targets: `#${tabName}`,
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 500,
        easing: 'easeOutQuad'
    });
}

// Scroll to Main Content
function scrollToMain() {
    document.querySelector('header').scrollIntoView({ behavior: 'smooth' });
}

// Climate Data
async function fetchClimateData() {
    document.getElementById('co2Level').classList.remove('loading');
    document.getElementById('tempAnomaly').classList.remove('loading');
    document.getElementById('co2Level').innerHTML = '';
    document.getElementById('tempAnomaly').innerHTML = '';
    
    const currentCO2 = 420 + (Math.random() * 0.5 - 0.25);
    document.getElementById('co2Level').textContent = currentCO2.toFixed(1);
    
    const tempAnomaly = 1.1 + (Math.random() * 0.1 - 0.05);
    document.getElementById('tempAnomaly').textContent = tempAnomaly.toFixed(2);
    
    const progressPercent = (tempAnomaly / 1.5) * 100;
    document.getElementById('climateProgress').style.width = `${progressPercent}%`;
    
    if (tempAnomaly > 1.5) {
        document.getElementById('climateProgress').style.background = 'var(--danger)';
    }
    
    // Animate data display
    anime({
        targets: ['#co2Level', '#tempAnomaly'],
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutQuad'
    });
}

function refreshClimateData() {
    document.getElementById('co2Level').innerHTML = '<span>Loading</span><span class="spinner"></span>';
    document.getElementById('tempAnomaly').innerHTML = '<span>Loading</span><span class="spinner"></span>';
    document.getElementById('co2Level').classList.add('loading');
    document.getElementById('tempAnomaly').classList.add('loading');
    setTimeout(fetchClimateData, 1200);
}

// Carbon Footprint Calculator
let footprintChart = null;
function calculateFootprint() {
    const transportKm = parseFloat(document.getElementById('transport').value) || 0;
    const electricityKwh = parseFloat(document.getElementById('electricity').value) || 0;
    const diet = document.getElementById('diet').value;
    
    const transportEmissions = transportKm * 0.12;
    const electricityEmissions = electricityKwh * 0.4;
    
    let dietEmissions;
    switch(diet) {
        case 'meatDaily': dietEmissions = 200; break;
        case 'meatWeekly': dietEmissions = 120; break;
        case 'vegetarian': dietEmissions = 80; break;
        case 'vegan': dietEmissions = 50; break;
        default: dietEmissions = 150;
    }
    
    const totalEmissions = transportEmissions + electricityEmissions + dietEmissions;
    
    document.getElementById('footprintResult').style.display = 'block';
    animateValue('carbonValue', 0, totalEmissions, 800);
    
    const progressPercent = Math.min(100, (totalEmissions / 2000) * 100);
    setTimeout(() => {
        document.getElementById('carbonProgress').style.width = `${progressPercent}%`;
    }, 800);
    
    let message;
    let progressColor;
    if (totalEmissions < 1000) {
        message = "Great job! Your footprint is well below average.";
        progressColor = 'var(--primary)';
    } else if (totalEmissions < 1500) {
        message = "Good start! There's still room for improvement.";
        progressColor = 'var(--secondary)';
    } else if (totalEmissions < 2000) {
        message = "Consider making some changes to reduce your impact.";
        progressColor = 'var(--warning)';
    } else {
        message = "Your footprint is above average. Try our tips!";
        progressColor = 'var(--danger)';
    }
    document.getElementById('carbonMessage').textContent = message;
    document.getElementById('carbonProgress').style.background = progressColor;
    
    // Update Chart
    if (footprintChart) footprintChart.destroy();
    const ctx = document.getElementById('footprintChart').getContext('2d');
    footprintChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Your Footprint', 'Global Average', 'Sustainable Target'],
            datasets: [{
                label: 'CO2 Emissions (kg/month)',
                data: [totalEmissions, 1500, 1000],
                backgroundColor: [progressColor, '#6b7280', '#10b981'],
                borderRadius: 8
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
                        text: 'kg CO2/month'
                    }
                }
            },
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: 'Carbon Footprint Comparison'
                }
            }
        }
    });
    
    // Animate chart
    anime({
        targets: '#footprintChart',
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 600,
        easing: 'easeOutQuad'
    });
}

// Energy Simulator
function runEnergySimulation() {
    const homeSize = parseFloat(document.getElementById('homeSize').value) || 100;
    const location = document.getElementById('location').value;
    
    const panelArea = homeSize * 0.3;
    
    let productionFactor;
    switch(location) {
        case 'sunny': productionFactor = 20; break;
        case 'moderate': productionFactor = 15; break;
        case 'cloudy': productionFactor = 10; break;
        default: productionFactor = 15;
    }
    
    const energyProduced = panelArea * productionFactor;
    
    document.getElementById('simulatorResult').style.display = 'block';
    document.getElementById('panelArea').textContent = panelArea.toFixed(1);
    animateValue('energyProduced', 0, energyProduced, 800);
    
    const progressPercent = Math.min(100, (energyProduced / 900) * 100);
    setTimeout(() => {
        document.getElementById('energyProgress').style.width = `${progressPercent}%`;
    }, 800);
    
    let message;
    let progressColor;
    if (energyProduced > 700) {
        message = "You could potentially go completely solar!";
        progressColor = 'var(--primary)';
    } else if (energyProduced > 400) {
        message = "You could significantly reduce your grid dependence.";
        progressColor = 'var(--secondary)';
    } else {
        message = "Every bit helps! This would reduce your carbon footprint.";
        progressColor = 'var(--warning)';
    }
    document.getElementById('energyMessage').textContent = message;
    document.getElementById('energyProgress').style.background = progressColor;
    
    // Animate result
    anime({
        targets: '#simulatorResult',
        opacity: [0, 1],
        translateX: [15, 0],
        duration: 600,
        easing: 'easeOutQuad'
    });
}

// Recipe Generator
const recipes = [
    {
        name: "Lentil & Vegetable Curry",
        ingredients: ["lentils", "tomatoes", "onions", "garlic", "spinach"],
        dietary: ["vegan", "glutenFree"],
        carbonScore: "Low",
        prepTime: "30 mins",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        instructions: "1. Sauté onions and garlic. 2. Add lentils and tomatoes. 3. Simmer for 20 mins. 4. Add spinach at the end."
    },
    {
        name: "Chickpea Salad Wrap",
        ingredients: ["chickpeas", "lettuce", "tomatoes", "avocado", "tortilla"],
        dietary: ["vegan"],
        carbonScore: "Very Low",
        prepTime: "15 mins",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        instructions: "1. Mash chickpeas. 2. Mix with chopped veggies. 3. Spread on tortilla and wrap."
    },
    {
        name: "Vegetable Stir Fry",
        ingredients: ["rice", "broccoli", "carrots", "bell peppers", "soy sauce"],
        dietary: ["vegan", "glutenFree"],
        carbonScore: "Low",
        prepTime: "20 mins",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        instructions: "1. Cook rice. 2. Stir-fry veggies. 3. Add soy sauce. 4. Serve over rice."
    },
    {
        name: "Quinoa Power Bowl",
        ingredients: ["quinoa", "kale", "sweet potato", "avocado", "tahini"],
        dietary: ["vegan", "glutenFree"],
        carbonScore: "Very Low",
        prepTime: "25 mins",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        instructions: "1. Roast sweet potato. 2. Cook quinoa. 3. Massage kale. 4. Assemble bowl and drizzle with tahini."
    },
    {
        name: "Mushroom Risotto",
        ingredients: ["arborio rice", "mushrooms", "onions", "garlic", "vegetable broth"],
        dietary: ["vegetarian"],
        carbonScore: "Low",
        prepTime: "40 mins",
        image: "https://images.unsplash.com/photo-1476124369491-5634c36a1f91?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
        instructions: "1. Sauté onions and garlic. 2. Add rice and mushrooms. 3. Gradually add broth, stirring until creamy."
    }
];

function generateRecipe() {
    const userIngredients = document.getElementById('ingredients').value.toLowerCase().split(',').map(i => i.trim());
    const dietaryPreference = document.getElementById('dietary').value;
    
    let matchedRecipes = recipes.filter(recipe => {
        const matchesIngredients = userIngredients.length === 0 || recipe.ingredients.some(ingredient => 
            userIngredients.some(userIng => ingredient.includes(userIng))
        );
        const matchesDietary = dietaryPreference === 'all' || recipe.dietary.includes(dietaryPreference);
        return matchesIngredients && matchesDietary;
    });
    
    const resultsContainer = document.getElementById('recipeResults');
    resultsContainer.innerHTML = '';
    
    if (matchedRecipes.length === 0) {
        resultsContainer.innerHTML = '<div class="tip-card">No recipes found. Try different ingredients or dietary preferences!</div>';
        return;
    }
    
    matchedRecipes.forEach((recipe, index) => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.name}" loading="lazy">
            <h3>${recipe.name}</h3>
            <p><strong>Carbon Score:</strong> ${recipe.carbonScore} | <strong>Prep Time:</strong> ${recipe.prepTime}</p>
            <p><strong>Dietary:</strong> ${recipe.dietary.join(', ')}</p>
            <p><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
            <p><strong>Instructions:</strong> ${recipe.instructions}</p>
        `;
        resultsContainer.appendChild(recipeCard);
        
        // Animate recipe cards
        anime({
            targets: recipeCard,
            opacity: [0, 1],
            translateY: [20, 0],
            delay: index * 150,
            duration: 600,
            easing: 'easeOutQuad'
        });
    });
}

// Action Challenges
let currentChallenge = null;
let challengeDaysCompleted = 0;

function startChallenge() {
    currentChallenge = document.getElementById('challengeSelect').value;
    challengeDaysCompleted = 1;
    
    document.getElementById('challengeTracker').style.display = 'block';
    updateChallengeUI();
    showNotification('Challenge started! Let’s make a difference together!');
}

function updateChallengeUI() {
    document.getElementById('challengeProgress').style.width = `${(challengeDaysCompleted / 30) * 100}%`;
    document.getElementById('challengeStatus').textContent = `Day ${challengeDaysCompleted} of 30`;
    
    const actionsContainer = document.getElementById('challengeActions');
    actionsContainer.innerHTML = '';
    
    let actionText = '';
    switch(currentChallenge) {
        case 'meatFree':
            actionText = '<p>Today\'s action: Choose a plant-based meal instead of meat.</p>';
            break;
        case 'zeroWaste':
            actionText = '<p>Today\'s action: Avoid single-use plastics and recycle properly.</p>';
            break;
        case 'energySave':
            actionText = '<p>Today\'s action: Turn off lights when not in use and unplug devices.</p>';
            break;
        case 'treePlant':
            actionText = '<p>Today\'s action: Plant a tree or donate to a tree-planting organization.</p>';
            break;
    }
    
    actionsContainer.innerHTML = actionText;
    
    if (challengeDaysCompleted < 30) {
        actionsContainer.innerHTML += `
            <button onclick="completeDay()" style="margin-top: 0.8rem;">
                Complete Day ${challengeDaysCompleted}
            </button>
        `;
    } else {
        actionsContainer.innerHTML += `
            <div class="tip-card" style="margin-top: 0.8rem; background-color: rgba(230,250,235,0.8);">
                <h3><i class="fas fa-trophy"></i> Challenge Complete!</h3>
                <p>Congratulations on completing your 30-day challenge!</p>
            </div>
        `;
        updateLeaderboard();
    }
    
    // Animate tracker
    anime({
        targets: '#challengeTracker',
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 600,
        easing: 'easeOutQuad'
    });
}

function completeDay() {
    challengeDaysCompleted++;
    updateChallengeUI();
    
    const encouragements = [
        "Great job! Keep it up!",
        "Every small action makes a difference!",
        "You're helping create a better future!",
        "Proud of your commitment to sustainability!"
    ];
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    showNotification(randomEncouragement);
}

// Local Events Finder
const mockEvents = [
    { location: "new york", name: "Central Park Tree Planting", date: "2025-05-10", type: "Tree Planting" },
    { location: "new york", name: "Brooklyn Cleanup Drive", date: "2025-05-15", type: "Cleanup" },
    { location: "san francisco", name: "Golden Gate Park Restoration", date: "2025-05-12", type: "Tree Planting" },
    { location: "san francisco", name: "Beach Cleanup", date: "2025-05-20", type: "Cleanup" }
];

function findLocalEvents() {
    const location = document.getElementById('eventLocation').value.toLowerCase();
    const resultsContainer = document.getElementById('eventResults');
    resultsContainer.innerHTML = '';
    
    const matchedEvents = mockEvents.filter(event => event.location.includes(location));
    
    if (matchedEvents.length === 0) {
        resultsContainer.innerHTML = '<div class="tip-card">No events found for this location. Try another city!</div>';
        return;
    }
    
    matchedEvents.forEach((event, index) => {
        const eventCard = document.createElement('div');
        eventCard.className = 'tip-card';
        eventCard.innerHTML = `
            <h3><i class="fas fa-${event.type === 'Tree Planting' ? 'tree' : 'trash-restore'}"></i> ${event.name}</h3>
            <p><strong>Date:</strong> ${event.date}</p>
            <p><strong>Type:</strong> ${event.type}</p>
        `;
        resultsContainer.appendChild(eventCard);
        
        // Animate event cards
        anime({
            targets: eventCard,
            opacity: [0, 1],
            translateX: [20, 0],
            delay: index * 150,
            duration: 600,
            easing: 'easeOutQuad'
        });
    });
}

// Community Leaderboard
let leaderboard = [
    { name: "EcoWarrior123", score: 1500 },
    { name: "GreenGuru", score: 1200 },
    { name: "SustainaStar", score: 1000 }
];

function updateLeaderboard() {
    const container = document.getElementById('leaderboard');
    container.innerHTML = '';
    
    leaderboard.sort((a, b) => b.score - a.score);
    
    leaderboard.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'tip-card';
        entryDiv.style.backgroundColor = index < 3 ? 'rgba(230,250,235,0.8)' : 'rgba(255,255,255,0.8)';
        entryDiv.innerHTML = `
            <h3><i class="fas fa-${index === 0 ? 'trophy' : 'medal'}"></i> #${index + 1} ${entry.name}</h3>
            <p>Score: ${entry.score} eco-points</p>
        `;
        container.appendChild(entryDiv);
        
        // Animate leaderboard entries
        anime({
            targets: entryDiv,
            opacity: [0, 1],
            translateY: [15, 0],
            delay: index * 120,
            duration: 600,
            easing: 'easeOutQuad'
        });
    });
}

function joinLeaderboard() {
    const name = prompt("Enter your nickname:");
    if (name) {
        leaderboard.push({ name, score: challengeDaysCompleted * 50 });
        updateLeaderboard();
        showNotification(`Welcome to the leaderboard, ${name}!`);
    }
}

// Action Tips
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
    }
];

function generateNewTip() {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    const newTip = document.createElement('div');
    newTip.className = 'tip-card';
    newTip.innerHTML = `
        <h3>${randomTip.title}</h3>
        <p>${randomTip.content}</p>
    `;
    
    const container = document.getElementById('tipsContainer');
    container.insertBefore(newTip, container.firstChild);
    
    if (container.children.length > 5) {
        container.removeChild(container.lastChild);
    }
    
    // Animate new tip
    anime({
        targets: newTip,
        opacity: [0, 1],
        translateX: [20, 0],
        duration: 600,
        easing: 'easeOutQuad'
    });
}

// Notification System
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease forwards';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Helper function for number animations
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        obj.textContent = value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchClimateData();
    updateLeaderboard();
    
    // Set default values for demo
    document.getElementById('transport').value = '300';
    document.getElementById('electricity').value = '200';
    generateNewTip();
    
    // Periodic tip notifications
    setInterval(() => {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        showNotification(randomTip.title + ": " + randomTip.content);
    }, 60000); // Every minute
    
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
});
