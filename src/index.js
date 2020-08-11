import "./styles.css";

var currentHoverTargetRow = false;
var previousHoverTargetRow = false;
var hoverTargetChanged = false;
var subActionDropArea = false;

function boolify(value) {
  return [true, 1, "TRUE", "true", "True"].includes(value);
}

function addClass(element, className) {
  var classNames = element.className.split(" ");
  if (classNames.indexOf(className) === -1) {
    classNames.push(className);
  }
  element.className = classNames.join(" ");
  return element;
}

function removeClass(element, className) {
  var classNames = element.className.split(" ").filter(function (cn) {
    return cn !== className;
  });
  element.className = classNames.join(" ");
  return element;
}

// when sub-action is target of dragging then add drop-area above for submitting the action to be placed as a parent action
function handleSubActionDragStart(e) {
  subActionDropArea = e.target.parentNode.parentNode
    .closest("td")
    .querySelector("[id$=':drop']");
  // addClass(subActionDropArea, 'show-hidden');
}

//Function handleDragStart(), Its purpose is to store the id of the draggable element.
function handleDragStart(e) {
  if (
    e.target.nodeType === 3 ||
    !e.target.parentNode.parentNode.draggable ||
    e.target.querySelector("[id$='handle']")
  ) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  e.stopPropagation();
  var dragData = e.target.parentNode.parentNode.id;
  e.dataTransfer.setData("Text", dragData);
  var isSubAction = /:sub/.test(e.target.id);
  if (isSubAction) {
    handleSubActionDragStart(e);
  }
} //end function

function isHoveringOverEnabledDropArea(e) {
  var isHoveringOverRow =
    e.target.nodeName === "TD" && e.target.parentNode.nodeName === "TR";
  var isHoveringOverSubActionDropArea =
    e.target.nodeName === "DIV" &&
    e.target.className.split(" ").includes("sub-action-drop-zone");
  var isDropAllowed = isHoveringOverRow
    ? boolify(e.target.parentNode.dataset.dropTarget)
    : boolify(e.target.dataset.dropTarget);

  if (!isDropAllowed) {
    return false;
  }

  if (
    !currentHoverTargetRow || isHoveringOverRow
      ? currentHoverTargetRow.id !== e.target.parentNode.id
      : currentHoverTargetRow.id !== e.target.id
  ) {
    previousHoverTargetRow = currentHoverTargetRow || false;
    currentHoverTargetRow = isHoveringOverRow ? e.target.parentNode : e.target;
    hoverTargetChanged = true;
  }

  return isHoveringOverRow || isHoveringOverSubActionDropArea;
}

function handleDragEnter(e) {
  if (isHoveringOverEnabledDropArea(e)) {
    if (hoverTargetChanged) {
      addClass(currentHoverTargetRow, "drag-enter");
      if (previousHoverTargetRow) {
        removeClass(previousHoverTargetRow, "drag-enter");
      }
      hoverTargetChanged = false;
    }
  }
}

//Function handles dragover event eg.. moving your source div over the target div element.
//If drop event occurs, the function retrieves the draggable element’s id from the DataTransfer object.
function handleOverDrop(e) {
  e.preventDefault();
  //Depending on the browser in use, not using the preventDefault() could cause any number of strange default behaviours to occur.
  if (e.type !== "drop") {
    return; //Means function will exit if no "drop" event is fired.
  }
  //Stores dragged elements ID in var draggedId
  var draggedId = e.dataTransfer.getData("text");
  //Stores referrence to element being dragged in var draggedEl

  if (subActionDropArea) {
    // removeClass(subActionDropArea, 'show-hidden');
    subActionDropArea = false;
  }

  var draggedEl = document.getElementById(draggedId);

  //if the event "drop" is fired on the dragged elements original drop target e.i..  it's current parentNode,
  //then set it's css class to ="" which will remove dotted lines around the drop target and exit the function.
  if (!draggedEl || draggedEl.parentNode === this) {
    return; //note: when a return is reached a function exits.
  }
  //Otherwise if the event "drop" is fired from a different target element, detach the dragged element node from it's
  //current drop target (i.e current perantNode) and append it to the new target element. Also remove dotted css class.
  // draggedEl.parentNode.removeChild(draggedEl);
  if (previousHoverTargetRow) {
    removeClass(previousHoverTargetRow, "drag-enter");
    }
  if (currentHoverTargetRow) {
    removeClass(currentHoverTargetRow, "drag-enter"); 
    }
  
  currentHoverTargetRow = false;
  previousHoverTargetRow = false;

  ///////////////////
  // TODO @jev: Here is where You should call Your API's
  ///////////////////

  // this.appendChild(draggedEl); //Note: "this" references to the current target div that is firing the "drop" event.
  // this.className = "";
} //end Function

function initDragAndDrop() {
  //Retrieve two groups of elements, those that are draggable and those that are drop targets:
  var draggable = document.querySelectorAll("[draggable]");

  var targets = document.querySelectorAll("[data-drop-target]");
  //Note: using the document.querySelectorAll() will aquire every element that is using the attribute defind in the (..)

  //Register event listeners for the"dragstart" event on the draggable elements:
  for (var i = 0; i < draggable.length; i++) {
    if (draggable[i].draggable) {
      draggable[i].addEventListener("dragstart", handleDragStart);
    } else {
      draggable[i].addEventListener("dragstart", function (e) {
        e.preventDefault();
        return false;
      });
    }
  }

  //Register event listeners for "dragover", "drop", "dragenter" & "dragleave" events on the drop target elements.
  for (var j = 0; j < targets.length; j++) {
    if (targets[j].dataset.dropTarget) {
      targets[j].addEventListener("dragover", handleOverDrop);
      targets[j].addEventListener("drop", handleOverDrop);
      targets[j].addEventListener("dragenter", handleDragEnter);
    }
  }
}

initDragAndDrop();
