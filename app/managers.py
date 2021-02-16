from flask_login import LoginManager

login_manager = LoginManager()
login_manager.login_view = 'login'


def init_managers(app):
    login_manager.init_app(app)
