from flask import flash, render_template, redirect, request, url_for

from recipelister import app, db
from recipelister.models import Recipe, Label


@app.route("/")
def index():
    recipes = Recipe.query.all()

    return render_template('index.html', recipes=recipes)


@app.errorhandler(404)
def page_not_found(error):
    return render_template('page_not_found.html'), 404
