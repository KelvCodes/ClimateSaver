
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '1'
    });

    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    const particleCount = window.innerWidth <= 768 ? 30 : 80;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: Math.random() * 1 - 0.5,
      speedY: Math.random() * 1 - 0.5,
      opacity: Math.random() * 0.6 + 0.2
    }));

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
        
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x < 0 || particle.x > canvas.width || 
            particle.y < 0 || particle.y > canvas.height) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
        }
      });
      
      requestAnimationFrame(animateParticles);
    };
    
    animateParticles();
    
    window.addEventListener('resize', () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    });
  }

  setupScrollAnimations() {
    gsap.to(".landing-content", {
      y: () => -ScrollTrigger.maxScroll(window) * 0.1,
      ease: "none",
      scrollTrigger: {
        trigger: ".landing",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
    
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

  initClimateData() {
    this.fetchRealClimateData();
    document.querySelector('.refresh-climate')?.addEventListener('click', () => {
      document.getElementById('co2Level').innerHTML = '<span>Loading</span><span class="spinner"></span>';
      document.getElementById('tempAnomaly').innerHTML = '<span>Loading</span><span class="spinner"></span>';
      gsap.to(".refresh-climate i", {
        rotation: 360,
        duration: 1,
        ease: "power2.out"
      });
      setTimeout(() => this.fetchRealClimateData(), 1200);
    });
  }

  async fetchRealClimateData() {
    try {
      const response = await fetch('https://global-warming.org/api/co2-api');
      if (response.ok) {
        const data = await response.json();
        const latestData = data.co2[data.co2.length - 1];
        this.updateClimateUI(latestData.trend, latestData.day);
        return;
      }
    } catch (e) {
      console.log("Using fallback climate data");
    }
    
    const currentCO2 = 420 + (Math.random() * 0.5 - 0.25);
    const tempAnomaly = 1.1 + (Math.random() * 0.1 - 0.05);
    this.updateClimateUI(currentCO2, tempAnomaly);
  }

  updateClimateUI(co2Level, tempAnomaly) {
    document.getElementById('co2Level').textContent = co2Level.toFixed(1);
    document.getElementById('tempAnomaly').textContent = tempAnomaly.toFixed(2);
    
    const progressPercent = (tempAnomaly / 1.5) * 100;
    gsap.to("#climateProgress", {
      width: `${progressPercent}%`,
      backgroundColor: tempAnomaly > 1.5 ? 'var(--danger)' : 'var(--warning)',
      duration: 1
    });
    
    gsap.from(["#co2Level", "#tempAnomaly"], {
      scale: 0.9,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "back.out(1.7)"
    });
  }

  initCarbonCalculator() {
    const form = document.getElementById('footprintForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.calculateFootprint();
    });
    
    document.querySelectorAll('#footprintForm input').forEach(input => {
      input.addEventListener('input', function() {
        if (this.value < 0) this.value = 0;
      });
    });
    
    const ctx = document.getElementById('footprintChart')?.getContext('2d');
    if (ctx) {
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
  }

  calculateFootprint() {
    const transportKm = parseFloat(document.getElementById('transport').value) || 0;
    const electricityKwh = parseFloat(document.getElementById('electricity').value) || 0;
    const diet = document.getElementById('diet').value;
    const shopping = parseFloat(document.getElementById('shopping').value) || 0;
    
    const transportEmissions = transportKm * 0.12 * (document.getElementById('transportType').value === 'electric' ? 0.5 : 1);
    const electricityEmissions = electricityKwh * (document.getElementById('energySource').value === 'renewable' ? 0.1 : 0.4);
    const shoppingEmissions = shopping * 5;
    
    const dietEmissions = {
      'meatDaily': 200,
      'meatWeekly': 120,
      'vegetarian': 80,
      'vegan': 50
    }[diet] || 150;
    
    const totalEmissions = transportEmissions + electricityEmissions + dietEmissions + shoppingEmissions;
    
    document.getElementById('footprintResult').style.display = 'block';
    
    gsap.from("#footprintResult", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out"
    });
    
    this.animateValue('carbonValue', 0, totalEmissions, 1000);
    
    const progressPercent = Math.min(100, (totalEmissions / 2000) * 100);
    gsap.to("#carbonProgress", {
      width: `${progressPercent}%`,
      backgroundColor: this.getProgressColor(totalEmissions),
      duration: 1
    });
    
    const messages = [
      { threshold: 1000, message: "Excellent! Your footprint is well below average.", icon: "fa-star" },
      { threshold: 1500, message: "Good job! You're doing better than most.", icon: "fa-thumbs-up" },
      { threshold: 2000, message: "Average footprint. Try our tips to improve!", icon: "fa-info-circle" },
      { threshold: Infinity, message: "Your footprint is above average. Check our tips!", icon: "fa-exclamation-triangle" }
    ];
    
    const { message, icon } = messages.find(m => totalEmissions < m.threshold);
    document.getElementById('carbonMessage').innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    
    this.updateFootprintChart([
      { name: 'Transport', value: transportEmissions },
      { name: 'Energy', value: electricityEmissions },
      { name: 'Diet', value: dietEmissions },
      { name: 'Shopping', value: shoppingEmissions }
    ], totalEmissions);
    
    this.showPersonalizedTips(totalEmissions, [
      { name: 'Transport', value: transportEmissions },
      { name: 'Diet', value: dietEmissions },
      { name: 'Energy', value: electricityEmissions }
    ]);
  }

  updateFootprintChart(breakdown, total) {
    const ctx = document.getElementById('footprintChart')?.getContext('2d');
    if (!ctx) return;
    
    if (window.footprintChart) {
      window.footprintChart.destroy();
    }
    
    breakdown.sort((a, b) => b.value - a.value);
    
    window.footprintChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: breakdown.map(item => item.name),
        datasets: [{
          data: breakdown.map(item => item.value),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
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

  showPersonalizedTips(totalEmissions, breakdown) {
    const tipsContainer = document.getElementById('personalizedTips');
    if (!tipsContainer) return;
    
    tipsContainer.innerHTML = '';
    const highestImpact = breakdown.sort((a, b) => b.value - a.value)[0].name;
    
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
    
    areaTips[highestImpact]?.forEach((tip, i) => {
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

  initEnergySimulator() {
    const form = document.getElementById('energySimulatorForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.runEnergySimulation();
    });
    
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

  runEnergySimulation() {
    const homeSize = parseFloat(document.getElementById('homeSize').value) || 100;
    const location = document.getElementById('location').value;
    const roofType = document.getElementById('roofType').value;
    const panelType = document.getElementById('panelType').value;
    
    const panelAreas = {
      'flat': homeSize * 0.4,
      'pitched': homeSize * 0.3,
      'large': homeSize * 0.5,
      'default': homeSize * 0.35
    };
    
    const efficiencies = {
      'mono': 1.2,
      'poly': 1.0,
      'thin': 0.8,
      'default': 1.0
    };
    
    const productionFactors = {
      'sunny': 20,
      'moderate': 15,
      'cloudy': 10,
      'default': 15
    };
    
    const panelArea = panelAreas[roofType] || panelAreas.default;
    const efficiency = efficiencies[panelType] || efficiencies.default;
    const productionFactor = productionFactors[location] || productionFactors.default;
    
    const energyProduced = panelArea * productionFactor * efficiency;
    const savingsPerYear = energyProduced * 0.12 * 12;
    
    document.getElementById('simulatorResult').style.display = 'block';
    document.getElementById('panelArea').textContent = panelArea.toFixed(1);
    document.getElementById('yearlySavings').textContent = savingsPerYear.toFixed(0);
    
    gsap.from("#simulatorResult", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out"
    });
    
    this.animateValue('energyProduced', 0, energyProduced, 1000);
    
    const progressPercent = Math.min(100, (energyProduced / 900) * 100);
    gsap.to("#energyProgress", {
      width: `${progressPercent}%`,
      backgroundColor: this.getEnergyProgressColor(energyProduced),
      duration: 1
    });
    
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
    this.updateSavingsChart(savingsPerYear);
  }

  updateSavingsChart(yearlySavings) {
    const ctx = document.getElementById('savingsChart')?.getContext('2d');
    if (!ctx) return;
    
    if (window.savingsChart) {
      window.savingsChart.destroy();
    }
    
    const years = Array.from({ length: 10 }, (_, i) => i + 1);
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

  initRecipeGenerator() {
    const form = document.getElementById('recipeForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.generateRecipe();
    });
    
    const ingredientInput = document.getElementById('ingredients');
    if (ingredientInput && typeof Awesomplete !== 'undefined') {
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

  generateRecipe() {
    const userIngredients = document.getElementById('ingredients').value.toLowerCase()
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);
    
    const dietaryPreference = document.getElementById('dietary').value;
    const cookingTime = document.getElementById('cookingTime').value;
    
    let matchedRecipes = this.recipes.filter(recipe => {
      const matchesIngredients = userIngredients.length === 0 || 
        userIngredients.some(userIng => 
          recipe.ingredients.some(ingredient => 
            ingredient.includes(userIng)
          ));
      
      const matchesDietary = dietaryPreference === 'all' || 
        recipe.dietary.includes(dietaryPreference);
      
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
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = '';
    
    if (matchedRecipes.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'tip-card';
      noResults.innerHTML = `
        <h3>No recipes found</h3>
        <p>Try different ingredients or broaden your dietary preferences.</p>
        <p>Here's a suggestion: <strong>${this.recipes[Math.floor(Math.random() * this.recipes.length)].name}</strong></p>
      `;
      resultsContainer.appendChild(noResults);
      return;
    }
    
    matchedRecipes.sort((a, b) => {
      const aMatches = a.ingredients.filter(i => 
        userIngredients.some(ui => i.includes(ui))).length;
      const bMatches = b.ingredients.filter(i => 
        userIngredients.some(ui => i.includes(ui))).length;
      return bMatches - aMatches;
    });
    
    matchedRecipes.forEach((recipe, index) => {
      const recipeCard = document.createElement('div');
      recipeCard.className = 'recipe-card';
      
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
      
      gsap.from(recipeCard, {
        opacity: 0,
        y: 30,
        delay: index * 0.1,
        duration: 0.5,
        ease: "power2.out"
      });
    });
    
    document.querySelectorAll('.save-recipe').forEach(btn => {
      btn.addEventListener('click', function() {
        const recipeId = this.getAttribute('data-id');
        this.saveRecipe(recipeId);
        this.innerHTML = '<i class="fas fa-check"></i> Saved';
        this.disabled = true;
      });
    });
  }

  saveRecipe(recipeId) {
    let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
    if (!savedRecipes.includes(recipeId)) {
      savedRecipes.push(recipeId);
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
      this.showNotification('Recipe saved to your collection!');
    }
  }

  initChallengeSystem() {
    const savedChallenge = localStorage.getItem('currentChallenge');
    if (savedChallenge) {
      this.currentChallenge = savedChallenge;
      this.challengeDaysCompleted = parseInt(localStorage.getItem('challengeDaysCompleted')) || 1;
      this.updateChallengeUI();
    }
    
    const challengeSelect = document.getElementById('challengeSelect');
    if (challengeSelect) {
      challengeSelect.addEventListener('change', function() {
        document.querySelector('.challenge-description').textContent = 
          this.getChallengeDescription(this.value);
      });
      
      document.querySelector('.challenge-description').textContent = 
        this.getChallengeDescription(challengeSelect.value);
    }
    
    document.getElementById('startChallenge')?.addEventListener('click', () => this.startChallenge());
  }

  getChallengeDescription(challenge) {
    const descriptions = {
      'meatFree': "Go meat-free for 30 days. Each day you'll get a new plant-based meal suggestion and nutrition tips.",
      'zeroWaste': "Reduce your waste to nearly zero. Daily tips on recycling, composting, and sustainable alternatives.",
      'energySave': "Cut your energy consumption. Learn about energy-saving habits and technologies each day.",
      'treePlant': "Help reforest the planet. Daily actions include planting, donating, or learning about trees."
    };
    return descriptions[challenge] || "Select a challenge to get started!";
  }

  startChallenge() {
    this.currentChallenge = document.getElementById('challengeSelect').value;
    this.challengeDaysCompleted = 1;
    
    localStorage.setItem('currentChallenge', this.currentChallenge);
    localStorage.setItem('challengeDaysCompleted', this.challengeDaysCompleted.toString());
    
    document.getElementById('challengeTracker').style.display = 'block';
    this.updateChallengeUI();
    
    const welcomeMessage = `
      <h3>Challenge Started!</h3>
      <p>You've begun the <strong>${document.getElementById('challengeSelect').selectedOptions[0].text}</strong> challenge.</p>
      <p>${this.getChallengeDescription(this.currentChallenge)}</p>
      <p>Check back daily for new actions and tips!</p>
    `;
    
    this.showModal('Challenge Started!', welcomeMessage);
    this.joinLeaderboard();
  }

  updateChallengeUI() {
    const progressPercent = (this.challengeDaysCompleted / 30) * 100;
    gsap.to("#challengeProgress", {
      width: `${progressPercent}%`,
      duration: 0.8,
      ease: "power2.out"
    });
    
    document.getElementById('challengeStatus').innerHTML = `
      <i class="fas fa-calendar-alt"></i> Day ${this.challengeDaysCompleted} of 30
    `;
    
    const actionsContainer = document.getElementById('challengeActions');
    if (!actionsContainer) return;
    
    actionsContainer.innerHTML = '';
    
    const { action, tip } = this.getDailyChallengeAction(this.currentChallenge, this.challengeDaysCompleted);
    
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
    
    if (this.challengeDaysCompleted < 30) {
      const completeBtn = document.createElement('button');
      completeBtn.className = 'complete-btn';
      completeBtn.innerHTML = `
        <i class="fas fa-check-circle"></i> Complete Day ${this.challengeDaysCompleted}
      `;
      completeBtn.addEventListener('click', () => this.completeDay());
      actionsContainer.appendChild(completeBtn);
    } else {
      const completeEl = document.createElement('div');
      completeEl.className = 'challenge-complete';
      completeEl.innerHTML = `
        <h3><i class="fas fa-trophy"></i> Challenge Complete!</h3>
        <p>Congratulations on completing your 30-day challenge!</p>
        <p>You've earned ${this.challengeDaysCompleted * 50} eco-points!</p>
      `;
      actionsContainer.appendChild(completeEl);
      this.showCelebration();
    }
    
    gsap.from([actionEl, actionsContainer.lastChild], {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6
    });
  }

  getDailyChallengeAction(challenge, day) {
    const actions = {
      'meatFree': [
        "Try a tofu scramble for breakfast instead of eggs.",
        "Make a lentil soup for lunch - high in protein and delicious!",
        "Experiment with a veggie burger for dinner tonight."
      ],
      'zeroWaste': [
        "Bring your own bags to the grocery store today.",
        "Use a reusable water bottle instead of disposable ones.",
        "Pack lunch in reusable containers instead of plastic wrap."
      ],
      'energySave': [
        "Turn off lights when leaving a room today.",
        "Unplug devices that aren't in use to prevent phantom load.",
        "Lower your thermostat by 1 degree and wear a sweater."
      ],
      'treePlant': [
        "Plant a tree in your yard or community space.",
        "Donate to a tree-planting organization.",
        "Learn about native tree species in your area."
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
    
    const actionIndex = (day - 1) % actions[challenge].length;
    const tipIndex = (day - 1) % tips[challenge].length;
    
    return {
      action: actions[challenge][actionIndex],
      tip: tips[challenge][tipIndex]
    };
  }

  completeDay() {
    this.challengeDaysCompleted++;
    localStorage.setItem('challengeDaysCompleted', this.challengeDaysCompleted.toString());
    this.updateChallengeUI();
    this.updateLeaderboard();
    
    const encouragements = [
      "Great job! Every action counts!",
      "You're making a difference! Keep it up!",
      "Proud of your commitment to sustainability!",
      "Imagine the impact if everyone took these small steps!",
      "Consistency is key - you're doing amazing!"
    ];
    
    this.showNotification(encouragements[Math.floor(Math.random() * encouragements.length)]);
    
    if (this.challengeDaysCompleted === 7) {
      this.showModal('One Week In!', 'You\'ve completed your first week! Keep up the great work!');
    } else if (this.challengeDaysCompleted === 15) {
      this.showModal('Halfway There!', 'You\'re halfway through the challenge! The planet thanks you!');
    }
  }

  initEventFinder() {
    const form = document.getElementById('eventFinderForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.findLocalEvents();
    });
    
    const locationInput = document.getElementById('eventLocation');
    if (locationInput && typeof Awesomplete !== 'undefined') {
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

  findLocalEvents() {
    const location = document.getElementById('eventLocation').value.toLowerCase();
    const eventType = document.getElementById('eventType').value;
    
    const matchedEvents = this.mockEvents.filter(event => 
      event.location.includes(location) && 
      (eventType === 'all' || event.type.toLowerCase() === eventType)
    );
    
    const resultsContainer = document.getElementById('eventResults');
    if (!resultsContainer) return;
    
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
      
      gsap.from(eventCard, {
        opacity: 0,
        y: 20,
        delay: index * 0.1,
        duration: 0.5,
        ease: "power2.out"
      });
    });
    
    document.querySelectorAll('.event-rsvp').forEach(btn => {
      btn.addEventListener('click', function() {
        const eventName = this.parentElement.querySelector('h3').textContent;
        this.showModal('RSVP Confirmation', `You've signed up for ${eventName}! We'll send you a reminder as the date approaches.`);
        this.innerHTML = '<i class="fas fa-check"></i> Registered';
        this.disabled = true;
      });
    });
  }

  initLeaderboard() {
    const savedLeaderboard = localStorage.getItem('communityLeaderboard');
    if (savedLeaderboard) {
      this.leaderboard = JSON.parse(savedLeaderboard);
    } else {
      this.leaderboard = [
        { name: "EcoWarrior123", score: 1500, avatar: "🌎" },
        { name: "GreenGuru", score: 1200, avatar: "🌱" },
        { name: "SustainaStar", score: 1000, avatar: "✨" },
        { name: "PlanetPal", score: 850, avatar: "💚" },
        { name: "EcoExplorer", score: 700, avatar: "🧭" }
      ];
    }
    
    this.updateLeaderboard();
    document.getElementById('joinLeaderboard')?.addEventListener('click', () => this.joinLeaderboard());
  }

  updateLeaderboard() {
    const container = document.getElementById('leaderboard');
    if (!container) return;
    
    container.innerHTML = '';
    this.leaderboard.sort((a, b) => b.score - a.score);
    
    const currentUser = localStorage.getItem('leaderboardName');
    if (currentUser && !this.leaderboard.some(user => user.name === currentUser)) {
      const currentChallenge = localStorage.getItem('currentChallenge');
      const challengeDays = parseInt(localStorage.getItem('challengeDaysCompleted')) || 0;
      
      if (currentChallenge && challengeDays > 0) {
        this.leaderboard.push({
          name: currentUser,
          score: challengeDays * 50,
          avatar: "👤"
        });
      }
    }
    
    if (this.leaderboard.length > 20) {
      this.leaderboard = this.leaderboard.slice(0, 20);
    }
    
    localStorage.setItem('communityLeaderboard', JSON.stringify(this.leaderboard));
    
    this.leaderboard.forEach((entry, index) => {
      const entryDiv = document.createElement('div');
      entryDiv.className = 'leaderboard-entry';
      
      if (index < 3) {
        entryDiv.classList.add(`top-${index + 1}`);
      }
      
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
      
      gsap.from(entryDiv, {
        opacity: 0,
        y: 20,
        delay: index * 0.05,
        duration: 0.4
      });
    });
  }

  joinLeaderboard() {
    const savedName = localStorage.getItem('leaderboardName');
    const name = savedName || prompt("Choose your leaderboard nickname (max 15 chars):");
    
    if (name) {
      const displayName = name.length > 15 ? name.substring(0, 15) + '...' : name;
      localStorage.setItem('leaderboardName', displayName);
      
      const emojis = ["🌎", "🌱", "🌞", "🌊", "🍃", "🌳", "♻️", "💧", "☀️", "🦋"];
      const avatar = emojis[displayName.length % emojis.length];
      
      this.leaderboard = this.leaderboard.filter(user => user.name !== displayName);
      
      const challengeDays = parseInt(localStorage.getItem('challengeDaysCompleted')) || 0;
      this.leaderboard.push({
        name: displayName,
        score: challengeDays * 50,
        avatar
      });
      
      this.updateLeaderboard();
      this.showNotification(`Welcome to the leaderboard, ${displayName}!`);
      
      if (!savedName) {
        this.showCelebration();
      }
    }
  }

  initTipsSystem() {
    const savedTips = localStorage.getItem('savedTips');
    if (savedTips) {
      document.getElementById('tipsContainer').innerHTML = savedTips;
    } else {
      for (let i = 0; i < 3; i++) {
        this.generateNewTip();
      }
    }
    
    document.getElementById('newTipBtn')?.addEventListener('click', () => this.generateNewTip());
    
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.generateNewTip();
      }
    }, 300000);
  }

  generateNewTip() {
    const randomTip = this.tips[Math.floor(Math.random() * this.tips.length)];
    
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
    if (!container) return;
    
    container.insertBefore(newTip, container.firstChild);
    
    newTip.querySelector('.save-tip-btn').addEventListener('click', function() {
      this.saveTipToProfile(randomTip);
      this.innerHTML = '<i class="fas fa-check"></i> Saved';
      this.disabled = true;
    });
    
    if (container.children.length > 5) {
      container.removeChild(container.lastChild);
    }
    
    localStorage.setItem('savedTips', container.innerHTML);
    
    gsap.from(newTip, {
      opacity: 0,
      x: 20,
      duration: 0.6,
      ease: "power2.out"
    });
  }

  saveTipToProfile(tip) {
    let savedTips = JSON.parse(localStorage.getItem('userSavedTips')) || [];
    
    if (!savedTips.some(t => t.title === tip.title)) {
      savedTips.unshift(tip);
      localStorage.setItem('userSavedTips', JSON.stringify(savedTips));
      this.showNotification('Tip saved to your profile!');
    }
  }

  initAccessibility() {
    document.querySelectorAll('.tab-btn').forEach((btn, index) => {
      btn.setAttribute('tabindex', 0);
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
    
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.prepend(skipLink);
    
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Tab') {
        document.documentElement.classList.add('keyboard-nav');
      }
    });
    
    document.addEventListener('mousedown', () => {
      document.documentElement.classList.remove('keyboard-nav');
    });
    
    document.querySelectorAll('[role="alert"]').forEach(alert => {
      alert.setAttribute('aria-live', 'polite');
    });
  }

  setupPeriodicUpdates() {
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.initClimateData();
      }
    }, 3600000);
    
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        const randomTip = this.tips[Math.floor(Math.random() * this.tips.length)];
        this.showNotification(`${randomTip.title}: ${randomTip.content}`);
      }
    }, 900000);
    
    setInterval(() => {
      const lastCompletion = localStorage.getItem('lastChallengeCompletion');
      if (lastCompletion) {
        const lastDate = new Date(lastCompletion);
        const today = new Date();
        
        if (today.getDate() !== lastDate.getDate() || 
            today.getMonth() !== lastDate.getMonth()) {
          this.showNotification("Don't forget to complete today's challenge action!");
        }
      }
    }, 86400000);
  }

  animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      obj.textContent = this.numberWithCommas(value);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  getProgressColor(value) {
    if (value < 1000) return 'var(--success)';
    if (value < 1500) return 'var(--primary)';
    if (value < 2000) return 'var(--warning)';
    return 'var(--danger)';
  }

  getEnergyProgressColor(value) {
    if (value > 700) return 'var(--success)';
    if (value > 400) return 'var(--primary)';
    return 'var(--warning)';
  }

  showNotification(message, duration = 3000) {
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
    
    gsap.from(notification, {
      y: 50,
      opacity: 0,
      duration: 0.3,
      ease: "power2.out"
    });
    
    setTimeout(() => {
      gsap.to(notification, {
        y: 50,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => notification.remove()
      });
    }, duration);
    
    notification.addEventListener('click', () => {
      gsap.to(notification, {
        y: 50,
        opacity: 0,
        duration: 0.2,
        onComplete: () => notification.remove()
      });
    });
  }

  showModal(title, content) {
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
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
      this.closeModal(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });
    
    gsap.from(modal.querySelector('.modal-content'), {
      y: 50,
      opacity: 0,
      duration: 0.3,
      ease: "back.out(1.7)"
    });
  }

  closeModal(modal) {
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

  showCelebration() {
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

  openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`button[onclick="openTab('${tabName}')"]`).classList.add('active');
    
    gsap.from(`#${tabName}`, {
      opacity: 0,
      y: 15,
      duration: 0.5,
      ease: "power2.out"
    });
  }

  scrollToMain() {
    document.querySelector('main').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// Initialize the application
const ecoApp = new EcoApp();
ecoApp.init();
