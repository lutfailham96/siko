from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired


class UserForm(FlaskForm):
    category_code = StringField(validators=[DataRequired()])
    category_name = StringField(validators=[DataRequired()])
