import Search from './model/Search';
import Recipe from './model/Recipe';
import List from './model/List';
import * as searchView from './view/searchView';
import * as recipeView from './view/recipeView';
import { elements, renderLoader, clearLoader } from './view/base';

/* Global state of the app
* - Search objecb
* - Current recipes object 
* - Shopping list object
* - Liked recipes
* - 
*/
const state = {};

/*
* SEARCH CONTROLLER
*/
const controlSearch = async () => {
    // 1) Get query from view

    const query = searchView.getInput();

    if (query) {
        // 2) New search object and add state
        state.search = new Search(query);

        //3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try {
            // 4)Search for recipes
            await state.search.getResult();

            //5) Render result in UI
            clearLoader();
            searchView.renderResults(state.search.result);

        } catch (error) {
            alert('Something with wrong the search...');
            clearLoader();
        }

    }
}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})
/*
* RECIPE CONTROLLER
*/

const controlRecipe = async () => {
    // Get ID from url
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {
        // Prepare UI from changes
        recipeView.crearRecipe();
        renderLoader(elements.recipe);

        //Hightlight selected search item
        if (state.search)
            searchView.hightlightSelected(id);
        //Create new recipe object  
        state.recipe = new Recipe(id);
        try {
            //Get recipe data and parse ingredients
            await state.recipe.getRecipes();
            // console.log(state.recipe.ingredients);        
            state.recipe.parseIngredients();
            // Calculate serving and time
            state.recipe.caclTime();
            state.recipe.caclServing();  
            //Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);

        } catch (err) {
            console.log(err);
            alert('Error processing recipe!');
        }

    }
};

// window.addEventListener('hashchange',controlRecipe);
// window.addEventListener('load',controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/*
* LIST CONTROLLER
*/
const controlList = () =>{
    // Create new list IF there in none yet
    if(!state.list) state.list = newList();

    // Add each ingredient to the list
    state.recipe.ingredients.forEach(el => {
        state.list.addItem(el.count, el.unit, el.ingredient);
    })
}

// Handling recipe button click 
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        //Decrease buttion is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }else if(e.target.matches('.recipe__btn--add, recipe__btn--add *')){
        controlList
    }
    // console.log(state.recipe);
});


window.l = new List(); 
