from flask import abort, render_template, redirect, request, session, url_for
from flask_wtf import Form
from wtforms import IntegerField, HiddenField, TextField, TextAreaField
from wtforms import PasswordField
from wtforms.ext.sqlalchemy.fields import QuerySelectMultipleField
from wtforms.validators import DataRequired

from recipelister import app, db
from recipelister.models import Recipe, Label


@app.route("/")
def index():
    #TODO: implement search
    recipes = Recipe.query.all()

    return render_template('index.html', recipes=recipes)


@app.route("/recipe/<recipe_id>")
def view_recipe(recipe_id):
    recipe = Recipe.query.get(recipe_id)
    if recipe is None:
        abort(404)
    return render_template('recipe.html', recipe=recipe)


@app.route("/recipe/add", methods=['GET', 'POST'])
def add_recipe():
    form = AddRecipeForm()
    del form.recipe_id

    if not form.validate_on_submit():
        return render_template('add_recipe.html', form=form)

    recipe = Recipe(
        title=form.title.data,
        total_time=form.total_time.data,
        active_time=form.active_time.data,
        recipe_body=form.recipe_body.data)

    for label in form.labels.data:
        recipe.labels.append(label)

    db.session.add(recipe)
    db.session.commit()

    return redirect(url_for('view_recipe', recipe_id=recipe.recipe_id))


@app.route("/recipe/edit/<recipe_id>", methods=['GET', 'POST'])
def edit_recipe(recipe_id):
    recipe = Recipe.query.get(recipe_id)
    form = AddRecipeForm(request.form, recipe)

    if recipe is None:
        abort(404)
    else:
        all_labels = Label.query.all()
        form.labels.query = [l for l in all_labels if l not in recipe.labels]

    if not form.validate_on_submit():
        return render_template(
            'edit_recipe.html',
            form=form,
            existing_labels=recipe.labels)

    # FIXME: If we get the label widget working nicely, this can use:
    # form.populate_obj(recipe) instead.
    recipe.title = form.title.data
    recipe.total_time = form.total_time.data
    recipe.active_time = form.active_time.data
    recipe.recipe_body = form.recipe_body.data

    for label in form.labels.data:
        recipe.labels.append(label)

    db.session.add(recipe)
    db.session.commit()

    return redirect(url_for('view_recipe', recipe_id=recipe.recipe_id))


@app.route("/remove_label/recipe/<recipe_id>/label/<label_id>")
def remove_label_from_recipe(recipe_id, label_id):
    recipe = Recipe.query.get(recipe_id)
    label = Label.query.get(label_id)

    if recipe and label and label in recipe.labels:
        recipe.labels.remove(label)
        db.session.add(recipe)
        db.session.commit()
    return redirect(url_for('show_edit_recipe', recipe_id=recipe.recipe_id))


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm(request.form)

    if not form.validate_on_submit():
        return render_template('login.html', form=form)

    if request.method == 'POST':
        if form.username.data != app.config['USERNAME']:
            form.username.errors.append(u'Invalid username')
        elif form.password.data != app.config['PASSWORD']:
            form.password.errors.append(u'Invalid password')
        else:
            session['logged_in'] = True
            return redirect(url_for('index'))
    return render_template('login.html', form=form)


@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('index'))


@app.errorhandler(404)
def page_not_found(error):
    return render_template('page_not_found.html'), 404


#TODO: Set up validators
class AddRecipeForm(Form):
    recipe_id = HiddenField('Recipe ID')
    title = TextField('Title', validators=[DataRequired()])
    recipe_body = TextAreaField('Recipe', validators=[DataRequired()])
    total_time = IntegerField('Total Time')
    active_time = IntegerField('Active Time')
    labels = QuerySelectMultipleField(query_factory=lambda: Label.query.all())


class LoginForm(Form):
    username = TextField('Name', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
