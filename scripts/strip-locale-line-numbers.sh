#!/bin/bash

set -euo pipefail

# Until we use lingui 3 that has the option to remove the origin
# from messages, we use this to remove the origin. This is so that
# we do not have too many changes in locales files when only the origin
# has changed
sed -i'.bak' 's/^\(#:.*\):.*/\1/' app/locales/**/messages.po
rm app/locales/**/messages*.bak
echo "Removed line numbers from locales"

