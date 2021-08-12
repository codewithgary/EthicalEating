class BuildRecipeViewController {
  constructor() {
    this.recipe_ingredients = {};
  }

  pageDidLoad() {
    // Call the loadPageContent function when the DOM finishes loading
    document.addEventListener('DOMContentLoaded', this.loadPageContent.bind(this));

    // Bind the save button to the saveRecipe function
    // Explicitly bind the BuildRecipeViewController instance to the function call
    let save_button = document.getElementById('save_button');
    save_button.addEventListener('click', this.saveRecipe.bind(this));
  }

  loadPageContent() {

    let si = new ServerInteractor();

    si.getAllIngredients((ingredients) => {

      let ingredients_table_body = document.getElementById("ingredients-table-body");
      let tb = new TableBuilder(ingredients_table_body);

      for (let i = 0; i < ingredients.length; i++) {
        let row = tb.createRow();

        // Add the ID cell
        let ingredient_id = ingredients[i]['id'];
        tb.createTextOnlyCell(row, ingredient_id);

        // Add the name cell
        let ingredient_name = ingredients[i]['name'];
        tb.createTextOnlyCell(row, ingredient_name);

        // Add an "Add to recipe" button
        // Use the BuildRecipeFunctionFactory to create an add ingredient function
        // When user clicks on Add button, ingredient is added to the recipe
        let ff = new BuildRecipeFunctionFactory();
        let addFunction = ff.createAddIngredientFunction(ingredient_id, ingredient_name, this);
        let add_cell = tb.createButtonCell(row, "Add", addFunction);
        add_cell.children[0].setAttribute("id", "Add" + ingredient_id);

        // Add an "Info" button
        // When user clicks on Info button, ingredient info show ups asynchronously on page
        let infoFunction = ff.createInfoFunction(ingredient_id, ingredient_name);
        let info_cell = tb.createButtonCell(row, "Info", infoFunction);
        info_cell.children[0].setAttribute("id", "Info" + ingredient_id);
      }
    });

    // Get access to the recipeid parameters in the URL
    const url_params = new URLSearchParams(window.location.search);
    let recipe_id = url_params.get('recipeid');

    // If a recipe ID is passed in the URL, pre-populate the page with ingredients from that recipe
    if (recipe_id) {
      this.prepopulateWithRecipe(recipe_id);
    }
  }

  saveRecipe() {

    let name_field = document.getElementById("recipe_name");
    let name = name_field.value;

    // Test if the name field is empty
    if (name_field.value === "") {
      alert("Recipe name cannot be empty!");
      return;
    }

    // Test if the list of ingredients is empty
    if (Object.keys(this.recipe_ingredients).length === 0 && this.recipe_ingredients.constructor === Object) {
      alert("There is no ingredient in your recipe!");
      return;
    }

    // Save the recipe
    let si = new ServerInteractor();

    // Check if the user already has a recipe with the same name
    si.findPrivateRecipeWithName(name, (response) => {
      if (response.error) {
        alert(response.error);
      }
      // There was no error
      else {
        console.log(response);

        // If an recipe with the same name already exists
        if (response.length > 0) {
          let override = confirm("A recipe with the same name already exists. Are you sure you want to overwrite it?");

          // User does not want to overwrite, return
          if (!override) {
            return;
          }
          // User wants to overwrite
          else {
            let recipe_id = response[0].id;

            let si = new ServerInteractor();
            si.deleteRecipeWithId(recipe_id, (response) => {
              if (response[0].id === recipe_id) {
                console.log(`Recipe ${recipe_id} was deleted!`);
              }
            });
          }
        }

        // Save the recipe
        si.saveRecipe(name, this.recipe_ingredients, (response) => {
          if (response.error) {
            alert(response.error);
          }
          else {
            alert("Recipe was saved successfully!");
          }
        });
      }
    });
  }

  prepopulateWithRecipe(recipe_id) {
    let si = new ServerInteractor();
    let ff = new BuildRecipeFunctionFactory();

    si.getRecipeIngredients(recipe_id, (results) => {

      // Populate the recipe name field
      let recipe_name_field = document.getElementById("recipe_name");
      recipe_name_field.value = results[0].recipename;

      // Add the ingredients
      for (let i = 0; i < results.length; i++) {
        let ingredient_id = results[i].ingredientid;
        let ingredient_name = results[i].ingredientname;

        // Create a function for adding the ingredient and then call the function
        let addFunc = ff.createAddIngredientFunction(ingredient_id, ingredient_name, this);
        addFunc();
      }
    })
  }
}

let vc = new BuildRecipeViewController();
vc.pageDidLoad();