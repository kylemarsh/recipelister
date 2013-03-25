from recipelister import db


recipe_label = db.Table('recipe_label',
    db.Column('recipe_id', db.Integer, db.ForeignKey('recipe.id')),
    db.Column('label_id', db.Integer, db.ForeignKey('label.id'))
)


class Recipe(db.Model):
    __tablename__ = 'recipe'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255))
    recipe = db.Column(db.Text)
    labels = db.relationship('Label', secondary=recipe_label,
            backref=db.backref('recipes', lazy='dynamic'))

    def __init__(self, title, recipe):
        self.title = title
        self.recipe = recipe

    def __repr__(self):
        return "<Recipe(%s, %s)>" % (self.title, self.recipe)

    def __str__(self):
        return "%s:\n\n%s" % (self.title, self.recipe)


class Label(db.Model):
    __tablename__ = 'label'

    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(255), nullable=False, unique=True)

    def __init__(self, label):
        self.label = label

    def __str__(self):
        return self.label
