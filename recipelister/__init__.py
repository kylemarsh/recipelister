from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_pyfile('recipelister.cfg')

db = SQLAlchemy(app)


def init_db():
    db.create_all()
    from recipelister.models import Label, Recipe
    with app.open_resource('base_labels.txt') as f:
        for line in f:
            line = line.strip().lower()
            if not Label.query.filter_by(label=line).first():
                db.session.add(Label(label=line))
                db.session.commit()

    if app.debug is True:
        db.session.add(Recipe(
            title='Test Recipe 1',
            recipe='This is the recipe'))
        db.session.commit()

import recipelister.models
import recipelister.views
