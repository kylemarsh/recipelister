from flask import abort, render_template, redirect, request, session, url_for
from flask_wtf import Form
from sqlalchemy import and_, or_
from wtforms import IntegerField, HiddenField, TextField, TextAreaField, BooleanField
from wtforms import PasswordField
from wtforms.ext.sqlalchemy.fields import QuerySelectMultipleField
from wtforms.validators import DataRequired, Optional

from recipelister import app, db
from recipelister.models import Recipe, Label
from recipelister.helpers import admin_login_required, login_required, get_labels
from recipelister.helpers import is_safe_url, get_redirect_target


@app.route("/recipe/all")
def show_all():
    return render_template('list.html', recipes=Recipe.query.all())


@app.route("/recipe/<recipe_id>")
@login_required
def view_recipe(recipe_id):
    recipe = Recipe.query.get(recipe_id)
    if recipe is None:
        abort(404)
    return render_template('recipe.html', recipe=recipe)


@app.route("/recipe/add", methods=['GET', 'POST'])
@admin_login_required
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
@admin_login_required
def edit_recipe(recipe_id):
    recipe = Recipe.query.get(recipe_id)
    form = AddRecipeForm(request.form, recipe)

    if recipe is None:
        abort(404)

    if not form.validate_on_submit():
        return render_template('edit_recipe.html', form=form)

    form.populate_obj(recipe)
    db.session.add(recipe)
    db.session.commit()

    return redirect(url_for('view_recipe', recipe_id=recipe.recipe_id))


@app.route("/remove_label/recipe/<recipe_id>/label/<label_id>")
@admin_login_required
def remove_label_from_recipe(recipe_id, label_id):
    recipe = Recipe.query.get(recipe_id)
    label = Label.query.get(label_id)

    if recipe and label and label in recipe.labels:
        recipe.labels.remove(label)
        db.session.add(recipe)
        db.session.commit()
    return redirect(url_for('edit_recipe', recipe_id=recipe.recipe_id))


@app.route("/")
@app.route("/index")
@app.route("/search")
def search():
    form = SearchForm(request.args)
    del form.csrf_token

    if not form.validate_on_submit():
        return render_template('search.html', form=form)

    max_active_time = form.max_active_time.data
    max_total_time = form.max_total_time.data
    fragments = form.title_fragments.data.split()
    included_labels = form.included_labels.data
    excluded_labels = form.excluded_labels.data
    randomize = form.randomize.data

    query = Recipe.query
    if max_active_time is not None:
        query = query.filter(Recipe.active_time <= max_active_time)
    if max_total_time is not None:
        query = query.filter(Recipe.total_time <= max_total_time)
    if fragments is not None:
        query = query.filter(
            or_(*[Recipe.title.contains(x) for x in fragments]))
    if included_labels is not None:
        query = query.filter(and_(
            *[Recipe.labels.contains(l) for l in included_labels]))
    for label in excluded_labels:
        query = query.filter(~Recipe.labels.contains(label))

    results = query.all()
    if randomize is not None:
        import random
        random.shuffle(results)

    return render_template('list.html', recipes=results)


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm(request.form)

    if not form.validate_on_submit():
        return render_template('login.html', form=form)

    if request.method == 'POST':
        un = form.username.data
        pw = form.password.data
        if un == app.config['USERNAME'] and pw == app.config['PASSWORD']:
            session['admin_logged_in'] = True
            session['logged_in'] = True
            return form.redirect('search')
        elif un == app.config['GUEST_UN'] and pw == app.config['GUEST_PW']:
            session['logged_in'] = True
            return form.redirect('search')

        if un not in (app.config['USERNAME'], app.config['GUEST_UN']):
            form.username.errors.append(u'Invalid username')
        else:
            form.password.errors.append(u'Invalid password')

    return render_template('login.html', form=form)


@app.route('/logout')
def logout():
    session.pop('admin_logged_in', None)
    session.pop('logged_in', None)
    return redirect(url_for('search'))


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
    labels = QuerySelectMultipleField(query_factory=get_labels)


class SearchForm(Form):
    title_fragments = TextField('Title Contains', validators=[Optional()])
    max_active_time = IntegerField(
        'Maximum Active Time (min)',
        validators=[Optional()])
    max_total_time = IntegerField(
        'Maximum Total Time (min)',
        validators=[Optional()])
    included_labels = QuerySelectMultipleField(
        'Including',
        validators=[Optional()],
        query_factory=get_labels)
    excluded_labels = QuerySelectMultipleField(
        'Excluding',
        validators=[Optional()],
        query_factory=get_labels)
    randomize = BooleanField("Randomize Results", validators=[Optional()])

    def is_submitted(self):
        return request and bool(request.args)


class RedirectingForm(Form):
    forward_to = HiddenField()

    def __init__(self, *args, **kwargs):
        Form.__init__(self, *args, **kwargs)
        if not self.forward_to.data:
            self.forward_to.data = get_redirect_target() or ''

    def redirect(self, endpoint='search', **values):

        if is_safe_url(self.forward_to.data):
            return redirect(self.forward_to.data)
        target = get_redirect_target()
        return redirect(target or url_for(endpoint, **values))


class LoginForm(RedirectingForm):
    username = TextField('Name', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
