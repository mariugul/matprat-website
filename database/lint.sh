#!/bin/sh
#
# This script lints all of the SQL files with the tool sqlfluff using the
# configurations defined in .sqlfluff.
sqlfluff lint --ignore parsing -v 