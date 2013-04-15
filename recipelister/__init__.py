import warnings
warnings.simplefilter('error')

from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_pyfile('recipelister.cfg')

db = SQLAlchemy(app)


def init_db(bootstrap=app.debug):
    db.create_all()

    from recipelister.models import Label, Recipe
    import csv

    if bootstrap:
        # Bootstrap Labels
        with app.open_resource('bootstrapping/labels.csv') as f:
            csvreader = csv.reader(f, delimiter=';', quotechar='"')
            cols = csvreader.next()  # First line is column names
            for record in csvreader:
                label = Label(**{x[0]: x[1] for x in zip(cols, record)})
                db.session.add(label)

        # Bootstrap Recipes
        with app.open_resource('bootstrapping/recipes.csv') as f:
            csvreader = csv.reader(f, delimiter=';', quotechar='"')
            cols = csvreader.next()  # First line is column names
            for record in csvreader:
                recipe = Recipe(**{x[0]: x[1] for x in zip(cols, record)})
                db.session.add(recipe)

        db.session.commit()

        # Label Recipes
        with app.open_resource('bootstrapping/recipe-label.csv') as f:
            csvreader = csv.reader(f, delimiter=';', quotechar='"')
            cols = csvreader.next()  # First line is column names
            for record in csvreader:
                d = {x[0]: x[1] for x in zip(cols, record)}
                recipe = Recipe.query.filter_by(id=d['recipe_id']).first()
                recipe.labels.append(d['label_id'])

        db.session.commit()

import recipelister.models
import recipelister.views
