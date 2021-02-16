import os
import sys


class Config(object):
    PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
    # required by pyinstaller
    if getattr(sys, 'frozen', False):
        PROJECT_DIR = os.path.dirname(sys.executable)
    elif __file__:
        PROJECT_DIR = os.path.dirname(__file__)
    SECRET_KEY = '&i(d:8ieB.(=c]&ifz;xp%<oJQWxC3-*'
    # MYSQL_HOST = 'localhost'
    # MYSQL_USER = 'root'
    # MYSQL_PASSWORD = 'toor'
    # MYSQL_DB = 'siko_dev'
    DATABASE_FILE = "sqlite:///{}".format(os.path.join(PROJECT_DIR, "app.db"))
    # SQLALCHEMY_DATABASE_URI = 'mysql://' + MYSQL_USER + ':' + MYSQL_PASSWORD + '@' + MYSQL_HOST + '/' + MYSQL_DB
    SQLALCHEMY_DATABASE_URI = DATABASE_FILE
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    BUILD_ENV = ['development', 'production']
    FLASK_ENV = BUILD_ENV[0]
    if FLASK_ENV == BUILD_ENV[0]:
        DEBUG = True
    else:
        DEBUG = False
