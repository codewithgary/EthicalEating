class BuildRecipeNotificationManager {
    constructor() {};

    /* This function removes the notification after 8 seconds. */
    deleteNotification(alert) {
        setTimeout(() => {
            alert.remove();
        }, 8000);
    }

    /* This function creates a notification when an ingredient was successfully added to the recipe. */
    createSuccessNotification(ingredient_name) {
        let alertDiv = document.getElementById("alert-div");
        let alert = document.createElement("div");
        alert.classList.add("alert");
        let alertString = `${ingredient_name} was added to the recipe.`;

        alert.textContent = alertString;
        alertDiv.prepend(alert);
        this.deleteNotification(alert);   
    }

    /* This function creates a notification when an ingredient is already in the recipe. */
    createErrorNotification(ingredient_name) {
        let alertDiv = document.getElementById("alert-div");
        let alert = document.createElement("div");
        alert.classList.add("alert", "add-error");
        let alertString = `${ingredient_name} is already in the recipe.`;

        alert.textContent = alertString;
        alertDiv.prepend(alert);
        this.deleteNotification(alert);
    }

    /* This function creates a notfication when an ingredient is removed from the recipe. */
    createRemoveNotification(ingredient_name) {
        let alertDiv = document.getElementById("alert-div");
        let alert = document.createElement("div");
        alert.classList.add("alert", "remove-success");
        let alertString = `${ingredient_name} was removed from the recipe.`;

        alert.textContent = alertString;
        alertDiv.prepend(alert);
        this.deleteNotification(alert);
    }
}