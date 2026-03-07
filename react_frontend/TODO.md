# TODO
This file contains feature or bugfix requests.

## Label List and Autocomplete in LinkTagForm
There is currently no indication of what labels already exist in the system
when you're tagging a recipe with the LinkTagForm. We should make a box that
drops down with all the labels in the system to be clicked or autocompleted

## Sort Recipe List
We should be able to sort the recipe list in different ways:
 - Alphabetic (using recipe's title as the sort key)
 - Most recently added (using recipe's ID as the sort key)

## Group Recipe List By Label
We should be able to show recipes grouped under specific labels by default.
Group by the following labels, and display the groups in this order:
 - Main
 - Dessert
 - Breakfast
 - Side
 - Appetizer
 - Drink

Recipes tagged with more than one of these labels should appear once in each
group they're tagged in.

Label groups should be collapsible in the recipe list.

## More informative errors
Sometimes the API replies with more error detail than is included in the alert.
Specifically, when adding a new recipe, invalid values in the "Active Time" or
"Total Time" field results in an alert that just reads "error adding recipe"
but the actual message received from the API is "activeTime must be an
integer".  Include more detail in the error alerts

## Auto-dismiss alerts
Automatically dismiss alerts when they are stale. For instance, providing an
incorrect username/password causes an alert with the message "error logging
in". This alert should clear upon successful login. Similarly, when creating
a new recipe, invalid values in the "Active Time" or "Total Time" field results
in an alert "error adding recipe". This alert should clear upon successful
submission of the new recipe.

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

## Indicate Labels on Recipe List
The recipe list should use label icons after the recipe title to indicate what
labels the recipe is tagged with. Hovering over a label (or tapping on mobile)
should pop up a tooltip with the label name.

If we don't have database support for label
icons yet, use the following to begin:
 - Beef: 🐄
 - Chicken: 🐓
 - Pork: 🐖
 - Fish: 🐟
 - Lamb: 🐑
 - Vegetarian: 🥦
 - Vegan: Ⓥ
 - SoupStew: 🍜
 - soup: 🍜
 - Salad: 🥬
 - Mexican: 🇲
 - Asian: 🥟
 - MiddleEast: 🫓
 - Dessert: 🍦
 - Bread: 🍞
 - Cake: 🎂
 - Fruit: 🍏
 - GlutenFree: 🅶
 - Spicy: 🌶️
 - Quick: ⏱️
 - Main: 🍽️

Logic to choose Label icons should not be add added to the recipe list
component, but rather the icons should be passed in as part of the Labels so
that it's easy to update a label icon in just a single place and have that
updated everywhere.

## Direct Links to Recipes
There's no URL routing currently, which means the entire application can
operate without reloading the page, but also means there's no way to link
directly to a specific recipe. We should add routing so that loading a recipe
populates the URL bar with a direct link to the recipe. The URL format should
be `.../{recipe-id}/{slug}` where the slug is a url-safe version of the recipe
title. Only the recipe-id should be required for routing.

## Better Icons/Buttons
Beautify the app's use of icons as buttons for actions.

## More responsive UI
Currently there's no way to hide the list pane in desktop, and the Recipe Pane
can be too "squashed". We should find a better way to balance this.

## Development/deploy instructions for both frontend and api server
Create a document detailing the steps needed to develop and deploy both parts
of this application, the react frontend (this repository) and the database /
api server.
