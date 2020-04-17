import Search from './model/Search';
import Recipe from './model/Recipe';
import List from './model/List';
import Likes from './model/Likes';
import * as searchView from './view/searchView';
import * as recipeView from './view/recipeView';
import * as listView from './view/listView';
import * as likesView from './view/likesView';
import { elements, renderLoader, clearLoader } from './view/base';


/* Global state of the app
* - Search objecb
* - Current recipes object 
* - Shopping list object
* - Liked recipes
* - 
*/
const state = {};
window.state = state;
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
            recipeView.renderRecipe(state.recipe,state.likes.isLiked(id));

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
    if(!state.list) state.list = new List();

    // Add each ingredient to the list and UI 
    state.recipe.ingredients.forEach(el => {
       const item = state.list.addItem(el.count, el.unit, el.ingredient);
       listView.renderItem(item);
    })
}

//Handle delete and update list item events
elements.shopping.addEventListener('click', e=>{
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle the delete 
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        //Delete state 
        state.list.deleteItem(id);
        // Delete from UI
        listView.deleteItem(id);
        //Handle the count update 
    }else if (e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
})

/*
* LIKE CONTROLLER
*/

//TEST TING
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());

const controlLike = ()=>{
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id; 

    // User has not yet liked current recipe
    if(!state.likes.isLiked(currentID)){
        // Add like to the state 
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to the UI
        likesView.renderLike(newLike);
        

    // User has liked current recipe
    }else {
        // Remove like from the state 
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);
        // Remove like from the UI
        likesView.deleteLike(currentID);

    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

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
        // Add ingredients to shopping list
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *' )){
        // Like controller 
        controlLike();
    }
    // console.log(state.recipe);
});


window.l = new List(); 
