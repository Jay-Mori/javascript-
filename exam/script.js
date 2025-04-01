document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    let recipeForm = document.getElementById('recipeForm');
    let titleInput = document.getElementById('title');
    let ingredientsInput = document.getElementById('ingredients');
    let instructionsInput = document.getElementById('instructions');
    let cuisineInput = document.getElementById('cuisine');
    let submitBtn = document.getElementById('submitBtn');
    let cancelBtn = document.getElementById('cancelBtn');
    let recipeIdInput = document.getElementById('recipeId');
    let recipesList = document.getElementById('recipesList');
    let basicSearch = document.getElementById('basicSearch');
    let filterCuisine = document.getElementById('filterCuisine');
    let advancedSearchBtn = document.getElementById('advancedSearchBtn');
    let advancedSearch = document.getElementById('advancedSearch');
    let searchTitle = document.getElementById('searchTitle');
    let searchIngredient = document.getElementById('searchIngredient');
    let searchCuisine = document.getElementById('searchCuisine');
    let advancedSearchSubmit = document.getElementById('advancedSearchSubmit');
    let resetSearch = document.getElementById('resetSearch');

    // State variables
    let recipes = [];
    let isEditing = false;
    let currentSearchTerm = '';
    let currentFilterCuisine = '';
    let currentAdvancedSearch = {
        title: '',
        ingredient: '',
        cuisine: ''
    };

    // Initialize the app
    init();

    function init() {
        loadRecipes();
        displayRecipes();
        setupEventListeners();
    }

    function setupEventListeners() {
        // Form submission
        recipeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (isEditing) {
                updateRecipe();
            } else {
                addRecipe();
            }
        });

        // Cancel edit
        cancelBtn.addEventListener('click', cancelEdit);

        // Basic search
        basicSearch.addEventListener('input', function(e) {
            currentSearchTerm = e.target.value.toLowerCase();
            displayRecipes();
        });

        // Cuisine filter
        filterCuisine.addEventListener('change', function(e) {
            currentFilterCuisine = e.target.value;
            displayRecipes();
        });

        // Advanced search toggle
        advancedSearchBtn.addEventListener('click', function() {
            advancedSearch.classList.toggle('hidden');
        });

        // Advanced search submission
        advancedSearchSubmit.addEventListener('click', function() {
            currentAdvancedSearch = {
                title: searchTitle.value.toLowerCase(),
                ingredient: searchIngredient.value.toLowerCase(),
                cuisine: searchCuisine.value
            };
            displayRecipes();
        });

        // Reset search
        resetSearch.addEventListener('click', function() {
            searchTitle.value = '';
            searchIngredient.value = '';
            searchCuisine.value = '';
            currentAdvancedSearch = {
                title: '',
                ingredient: '',
                cuisine: ''
            };
            basicSearch.value = '';
            currentSearchTerm = '';
            filterCuisine.value = '';
            currentFilterCuisine = '';
            displayRecipes();
        });
    }

    // Load recipes from local storage
    function loadRecipes() {
        const storedRecipes = localStorage.getItem('recipes');
        if (storedRecipes) {
            recipes = JSON.parse(storedRecipes);
        }
    }

    // Save recipes to local storage
    function saveRecipes() {
        localStorage.setItem('recipes', JSON.stringify(recipes));
    }

    // Add a new recipe
    function addRecipe() {
        const title = titleInput.value.trim();
        const ingredients = ingredientsInput.value.trim();
        
        // Validate required fields
        if (!title || !ingredients) {
            alert('Please provide at least a title and ingredients for the recipe.');
            return;
        }
        
        const newRecipe = {
            id: Date.now().toString(),
            title: title,
            ingredients: ingredients.split('\n').filter(i => i.trim()),
            instructions: instructionsInput.value.trim(),
            cuisine: cuisineInput.value
        };
        
        recipes.push(newRecipe);
        saveRecipes();
        resetForm();
        displayRecipes();
    }

    // Edit a recipe
    function editRecipe(id) {
        const recipe = recipes.find(r => r.id === id);
        if (!recipe) return;
        
        isEditing = true;
        recipeIdInput.value = recipe.id;
        titleInput.value = recipe.title;
        ingredientsInput.value = recipe.ingredients.join('\n');
        instructionsInput.value = recipe.instructions || '';
        cuisineInput.value = recipe.cuisine || '';
        
        submitBtn.textContent = 'Update Recipe';
        cancelBtn.classList.remove('hidden');
        
        // Scroll to form
        recipeForm.scrollIntoView({ behavior: 'smooth' });
    }

    // Update an existing recipe
    function updateRecipe() {
        const id = recipeIdInput.value;
        const title = titleInput.value.trim();
        const ingredients = ingredientsInput.value.trim();
        
        // Validate required fields
        if (!title || !ingredients) {
            alert('Please provide at least a title and ingredients for the recipe.');
            return;
        }
        
        const index = recipes.findIndex(r => r.id === id);
        if (index !== -1) {
            recipes[index] = {
                id: id,
                title: title,
                ingredients: ingredients.split('\n').filter(i => i.trim()),
                instructions: instructionsInput.value.trim(),
                cuisine: cuisineInput.value
            };
            
            saveRecipes();
            resetForm();
            displayRecipes();
        }
    }

    // Cancel editing
    function cancelEdit() {
        resetForm();
    }

    // Delete a recipe
    function deleteRecipe(id) {
        if (confirm('Are you sure you want to delete this recipe?')) {
            recipes = recipes.filter(r => r.id !== id);
            saveRecipes();
            displayRecipes();
            
            // If we were editing this recipe, cancel edit
            if (recipeIdInput.value === id) {
                resetForm();
            }
        }
    }

    // Reset the form
    function resetForm() {
        recipeForm.reset();
        recipeIdInput.value = '';
        isEditing = false;
        submitBtn.textContent = 'Add Recipe';
        cancelBtn.classList.add('hidden');
    }

    // Display recipes with search and filtering
    function displayRecipes() {
        recipesList.innerHTML = '';
        
        if (recipes.length === 0) {
            recipesList.innerHTML = '<div class="no-recipes">No recipes found. Add your first recipe above!</div>';
            return;
        }
        
        let filteredRecipes = [...recipes];
        
        // Apply basic search filter
        if (currentSearchTerm) {
            filteredRecipes = filteredRecipes.filter(recipe => {
                const titleMatch = recipe.title.toLowerCase().includes(currentSearchTerm);
                const ingredientsMatch = recipe.ingredients.some(ing => 
                    ing.toLowerCase().includes(currentSearchTerm)
                );
                return titleMatch || ingredientsMatch;
            });
        }
        
        // Apply cuisine filter
        if (currentFilterCuisine) {
            filteredRecipes = filteredRecipes.filter(recipe => 
                recipe.cuisine === currentFilterCuisine
            );
        }
        
        // Apply advanced search filters
        if (currentAdvancedSearch.title || currentAdvancedSearch.ingredient || currentAdvancedSearch.cuisine) {
            filteredRecipes = filteredRecipes.filter(recipe => {
                const titleMatch = currentAdvancedSearch.title ? 
                    recipe.title.toLowerCase().includes(currentAdvancedSearch.title) : true;
                const cuisineMatch = currentAdvancedSearch.cuisine ? 
                    recipe.cuisine === currentAdvancedSearch.cuisine : true;
                
                return titleMatch && ingredientMatch && cuisineMatch;
            });
        }
        
        if (filteredRecipes.length === 0) {
            recipesList.innerHTML = '<div class="no-recipes">No recipes match your search criteria.</div>';
            return;
        }
        
        filteredRecipes.forEach(recipe => {
            const recipeEl = document.createElement('div');
            recipeEl.className = 'recipe';
            recipeEl.innerHTML = `
                <h3>${recipe.title}</h3>
                ${recipe.cuisine ? `<p><strong>Cuisine:</strong> ${recipe.cuisine}</p>` : ''}
                <p><strong>Ingredients:</strong></p>
                <ul>${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}</ul>
                ${recipe.instructions ? `<p><strong>Instructions:</strong> ${recipe.instructions}</p>` : ''}
                <div class="recipe-actions">
                    <button class="edit-btn" onclick="editRecipe('${recipe.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteRecipe('${recipe.id}')">Delete</button>
                </div>
            `;
            recipesList.appendChild(recipeEl);
        });
    }

    // Make functions available globally for inline event handlers
    window.editRecipe = editRecipe;
    window.deleteRecipe = deleteRecipe;
});