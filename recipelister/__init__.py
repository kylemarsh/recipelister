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
                d = {x[0]: x[1] for x in zip(cols, record)}
                #d = {x[0]: x[1].decode('utf-8') for x in zip(cols, record)}
                print "\t%s: %s" % (d['id'], d['title'])
                recipe = Recipe(**d)
                db.session.add(recipe)

        print "Committing recipes."
        #import pdb
        #pdb.set_trace()
        db.session.commit()

        ## Label Recipes
        #with app.open_resource('bootstrapping/recipe-label.csv') as f:
            #csvreader = csv.reader(f, delimiter=';', quotechar='"')
            #cols = csvreader.next()  # First line is column names
            #print "Labeling Recipes:"
            #for record in csvreader:
                #print '\t%s' % record
                #d = {x[0]: x[1] for x in zip(cols, record)}
                #recipe = Recipe.query.filter_by(id=d['recipe_id']).first()
                #recipe.labels.append(d['label_id'])

        #db.session.commit()

import recipelister.models
import recipelister.views
