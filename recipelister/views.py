from flask import flash, render_template, redirect, request, url_for

from recipelister import app, db
from recipelister.models import Recipe, Label


@app.route("/")
def index():
    recipes = Recipe.query.all()

    return render_template('index.html', recipes=recipes)


@app.route("/recipe/<recipe_id>")
def view_recipe(recipe_id):
    recipe = Recipe.query.get(recipe_id)
    if recipe is None:
        return redirect(url_for('index'))
    return render_template('recipe.html', recipe=recipe)


@app.errorhandler(404)
def page_not_found(error):
    return render_template('page_not_found.html'), 404
