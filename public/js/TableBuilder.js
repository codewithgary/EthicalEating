class TableBuilder {
  constructor(body) {
    this.body = body;
  }

  createRow() {
    let row = document.createElement('tr');
    this.body.appendChild(row);
    return row;
  }

  createTextOnlyCell(row, textContent) {
    let cell = document.createElement('td');
    cell.textContent = textContent;
    row.appendChild(cell);
    return cell;
  }

  createButtonCell(row, buttonText, buttonFunction) {
    let cell = document.createElement('td');
    row.appendChild(cell);

    let button = document.createElement('button');
    cell.appendChild(button);
    button.textContent = buttonText;
    button.addEventListener('click', buttonFunction);
    return cell;
  }

  /* This function creates a button that refers to another existing button. */
  createReferenceButtonCell(row, buttonText, id) {
    let cell = document.createElement('td');
    row.appendChild(cell);

    let button = document.createElement('button');
    cell.appendChild(button);
    button.textContent = buttonText;

    button.addEventListener('click', function() {
      document.getElementById(buttonText + id).click();
    })
    return cell;
  }

  createReplaceButtonCell(row, ingredient_id, alt_id) {
    let cell = document.createElement("td");
    row.appendChild(cell);

    let button = document.createElement("button");
    cell.appendChild(button);
    button.textContent = "Replace";

    button.addEventListener("click", function() {
      let removeButton = document.getElementById("Remove" + ingredient_id);
      if (removeButton) {
        removeButton.click();
      }
      document.getElementById("Add" + alt_id).click();
    })
    return cell;
  }
}