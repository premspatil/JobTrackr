"""
JobTrackr project package.

We use PyMySQL as the MySQL driver because it is pure Python and installs on
Windows/Linux/macOS without needing a C compiler.
Django expects the "mysqlclient" driver, so we make PyMySQL pretend to be it.
"""
import pymysql

# Django checks the driver version; PyMySQL is compatible with the API
# that mysqlclient 2.2.1 provides, so we report that version.
pymysql.version_info = (2, 2, 1, "final", 0)
pymysql.install_as_MySQLdb()
