from recipelister import db


recipe_label = db.Table(
    'recipe_label',
    db.Column('recipe_id', db.Integer, db.ForeignKey('recipe.recipe_id')),
    db.Column('label_id', db.Integer, db.ForeignKey('label.label_id')))


class Recipe(db.Model):
    __tablename__ = 'recipe'

    recipe_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255))
    recipe_body = db.Column(db.Text)
    total_time = db.Column(db.Integer)
    active_time = db.Column(db.Integer)
    labels = db.relationship(
        'Label',
        secondary=recipe_label,
        backref=db.backref('recipes', lazy='dynamic'))

    def __repr__(self):
        return "<Recipe(%r, %r)>" % (self.title, self.recipe)

    def __str__(self):
        return "Recipe for %s" % (self.title)


class Label(db.Model):
    __tablename__ = 'label'

    label_id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(255), nullable=False, unique=True)

    #def __init__(self, label):
        #self.label = label

    def __str__(self):
        return self.label
