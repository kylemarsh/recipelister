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
            print "Loading Labels"
            for record in csvreader:
                d = {x[0]: x[1] for x in zip(cols, record)}
                if not Label.query.filter_by(label=d['label']).first():
                    label = Label(**d)
                    db.session.add(label)

        print "Committing labels."
        db.session.commit()

        # Bootstrap Recipes
        with app.open_resource('bootstrapping/recipes.csv') as f:
            csvreader = csv.reader(f, delimiter=';', quotechar='"')
            cols = csvreader.next()  # First line is column names
            print "Loading Recipes:"
            for record in csvreader:
                d = {x[0]: x[1].decode('utf-8') for x in zip(cols, record)}
                if not Recipe.query.filter_by(recipe_body=d['recipe_body']).first():
                    print "\t%s: %s" % (d['recipe_id'], d['title'])
                    recipe = Recipe(**d)
                    db.session.add(recipe)

        print "Committing recipes."
        db.session.commit()

        ## Label Recipes
        with app.open_resource('bootstrapping/recipe-label.csv') as f:
            csvreader = csv.reader(f, delimiter=';', quotechar='"')
            cols = csvreader.next()  # First line is column names
            print "Labeling Recipes:"
            for record in csvreader:
                d = {x[0]: x[1] for x in zip(cols, record)}
                recipe = Recipe.query.filter_by(recipe_id=d['recipe_id']).first()
                label = Label.query.filter_by(label_id=d['label_id']).first()
                if recipe and label:
                    print '\t%s tagged as %s' % (recipe.title, label.label)
                    recipe.labels.append(label)

        db.session.commit()

import recipelister.models
import recipelister.views
