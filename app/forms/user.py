from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired


class UserForm(FlaskForm):
    fullname = StringField()
    username = StringField(validators=[DataRequired()])
    password = StringField(validators=[DataRequired()])
    password_confirmation = StringField()
