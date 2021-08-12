class BuildRecipeFunctionFactory {
  constructor() {};

  /*
  The createAddIngredientFunction function takes an ingredient's ID and name as the first two parameters.
  The third parameter is an instance of the BuildRecipeViewController class.
  It returns a function that will add the ingredient to the recipe-table-body and the recipe_ingredients object.
   */
  createAddIngredientFunction(ingredient_id, ingredient_name, brvc) {
    return function () {
      let nm = new BuildRecipeNotificationManager();
      let recipe_table_body = document.getElementById("recipe-table-body");
      let tb = new TableBuilder(recipe_table_body);

      if (ingredient_id in brvc.recipe_ingredients) {
        nm.createErrorNotification(ingredient_name);
      }
      else { 
        let row = tb.createRow();
        row.setAttribute("id", ingredient_id);

        tb.createTextOnlyCell(row, ingredient_id);
        tb.createTextOnlyCell(row, ingredient_name);

        let removeFunction = function() {
          recipe_table_body.removeChild(row);
          delete brvc.recipe_ingredients[ingredient_id];
          nm.createRemoveNotification(ingredient_name);
        }

        let remove_cell = tb.createButtonCell(row, "Remove", removeFunction);
        remove_cell.children[0].setAttribute("id", "Remove" + ingredient_id);

        tb.createReferenceButtonCell(row, "Info", ingredient_id);

        recipe_table_body.appendChild(row);
        brvc.recipe_ingredients[ingredient_id] = ingredient_name;
        nm.createSuccessNotification(ingredient_name);
      }
    };
  }

  /* This function returns a function that asynchronously displays info of a given ingredient ID. */
  createInfoFunction(ingredient_id, ingredient_name) {
    return function () {
      let si = new ServerInteractor();
      
      si.getIngredientInfo(ingredient_id, (result) => {    
        // Update Ingredient Info box on page asynchronously
        let ingTable = document.getElementById("ing-name-table");
        ingTable.innerHTML = "";

        let tb = new TableBuilder(ingTable);
        let ingRow = tb.createRow();
        tb.createTextOnlyCell(ingRow, ingredient_name);
        tb.createReferenceButtonCell(ingRow, "Add", ingredient_id);

        document.getElementById("ingredient-ethics").textContent = result.problem;
        document.getElementById("ethic-information").textContent = result.description;

        // Populate alternatives table with names and buttons
        let altTable = document.getElementById("alt-table");
        altTable.innerHTML = "";
        if (result.alternative[0] != "None") {
          let altTb = new TableBuilder(altTable);
          for (let i = 0; i < result.alternative.length; i++) {
            let altRow = altTb.createRow();
            altTb.createTextOnlyCell(altRow, result.alternative[i]);
            altTb.createReferenceButtonCell(altRow, "Add", result.alternative_id[i])
            altTb.createReplaceButtonCell(altRow, ingredient_id, result.alternative_id[i]);
          }
        } else {
          altTable.innerHTML = "None";
        }
      });
    }
  } 
} 


