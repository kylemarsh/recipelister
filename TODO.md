# TODO
This file contains feature or bugfix requests.

## Query Parameters for Filter State
Preserve filter/search state in URL query parameters (e.g.,
?search=chicken&tags=dinner&sort=newest) so direct links can include
search context. Should work alongside recipe routing.

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

## Fuzzy Search for Recipe Titles
Improve the recipe search to support fuzzy matching similar to Slack's emoji
search, where the search can match characters even if there are other characters
in between (e.g., searching "chkn" would match "chicken").

## Add "undo" option after deleting a recipe
Use the alert system (but change the background color from red to blue?) to
render a popup message giving the option to un-delete a recipe after deleting
a recipe. FIXME: I may need to create a new route in the DB for this

## Render markdown in the recipe pane
