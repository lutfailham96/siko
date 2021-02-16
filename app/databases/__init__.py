from app.databases.db_sql import db_sql, db_migrate


def init_databases(app):
    db_sql.init_app(app)
    db_migrate.init_app(app)
