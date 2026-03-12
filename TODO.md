# TODO
This file contains feature or bugfix requests.

## Label List and Autocomplete in LinkTagForm
There is currently no indication of what labels already exist in the system
when you're tagging a recipe with the LinkTagForm. We should make a box that
drops down with all the labels in the system to be clicked or autocompleted

## More informative errors
Sometimes the API replies with more error detail than is included in the alert.
Specifically, when adding a new recipe, invalid values in the "Active Time" or
"Total Time" field results in an alert that just reads "error adding recipe"
but the actual message received from the API is "activeTime must be an
integer".  Include more detail in the error alerts

## Meta-Labels
Labels should have meta-information. For instance, the "main", "dessert",
"breakfast" labels are all dish types, while "asian", "mexican", "ethiopian"
are all cuisine cultures and "vegan", "vegetarian", "gluten free" are allergen
labels. We should have a way to identify the different kinds of labels.

NOTE: This requires coordination with the database and database's API first.

## Label Icons
Labels should have an "icon" field where we can choose an emoji to indicate
that label in a compact way (for instance the label "mexican" could use 🇲 and
the label "vegan" could use Ⓥ ).

NOTE: This requires coordination with the database and database's API first.

## Label Manager Interface
We should have an interface that, when active, replaces the List Pane and
Recipe Pane and instead shows all the labels in the system and allows us to
manage them. Management includes:
 - Renaming the label (assuming API support exists)
 - Associating a meta-label with the label (assuming API support exists)
 - Associating an icon with the label (assuming API support exists)
 - Deleting a label
 - Adding a new label
 - Viewing titles for all recipes tagged with a label, and unlinking them

## Guest Users
We should enable the concept of a "guest" user who can view but not edit the
database. Possible implementation details are:
 - Generate revokable tokens that allow viewing one specific recipe
 - Create non-administrator logins that can see all recipes
 - Provide a list of recipes a given non-administrator user can see
 - Provide an interface for an admin user to create a guest user or a sharable
 link

## Direct Links to Recipes
There's no URL routing currently, which means the entire application can
operate without reloading the page, but also means there's no way to link
directly to a specific recipe. We should add routing so that loading a recipe
populates the URL bar with a direct link to the recipe. The URL format should
be `.../{recipe-id}/{slug}` where the slug is a url-safe version of the recipe
title. Only the recipe-id should be required for routing.

## Better Icons/Buttons
Beautify the app's use of icons as buttons for actions.

### Style Recipe Action Buttons
The RecipeActions component (edit, delete, and close buttons in the Recipe Pane)
needs better styling. Currently uses plain Unicode characters for icons.

## More responsive UI
Currently there's no way to hide the list pane in desktop, and the Recipe Pane
can be too "squashed". We should find a better way to balance this.

## Development/deploy instructions for both frontend and api server
Create a document detailing the steps needed to develop and deploy both parts
of this application, the react frontend (this repository) and the database /
api server.

## Improve NewRecipeForm Widgets
The NewRecipeForm should support:
 - Adding labels to a recipe during creation (not just after)
   - Use a multiselect widget for the labels that allows selecting multiple
     labels from a dropdown list of all labels in the system that filters as you
     type.
  - Store chosen labels as strings, then submit them as part of the recipe
    creation API call (this will require an update to the recipe creation API)
 - Use a number picker for active time and total time fields that allows either
   typing or selecting from a dropdown of 5-minute increments (5, 10, 15, etc.)
   up to 180 minutes

## Auto-reset Tag Form State
The showTaggingForm state flag should automatically reset to false when the user
moves away from the tagging form, specifically:
 - When pressing Esc inside the form
 - When the form loses focus
If the tagging form is reactivated before the current recipe is deselected, the
form should present the value previously typed rather than resetting to blank.
Once the user moves away from the current recipe the form should reset to
blank.

Currently it is only hidden when you click the `X` button, and resets to blank
immediately.

## Tab Key Submission in Tag Form
When tagging recipes, the "Tab" keypress should submit the form and then reopen
the tag form for another label, automatically focusing the text input field
providing faster keyboard-based tagging workflow.

## Auto-focus Note and Tag Textarea
When the user clicks "+ Add Note", the textarea in the EditNoteForm should
automatically receive focus so they can start typing immediately without
needing to click again.

The tag form shoula sl also auto-focus the text area when opened (after
clicking the "+ add label" button).

## Fuzzy Search for Recipe Titles
Improve the recipe search to support fuzzy matching similar to Slack's emoji
search, where the search can match characters even if there are other characters
in between (e.g., searching "chkn" would match "chicken").
