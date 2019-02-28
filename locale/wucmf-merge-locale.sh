#!/bin/sh

cd `dirname $0`;

if [ $# -lt 2 ] ; then
    echo "No arguments supplied.\nUse $0 namespace ru_UA|ru_RU|...\nExample: $0 wucmf uk_UA"
    exit
fi

if [ ! -f "$1.pot" ]; then
    echo "Error: $1.pot is not exists"
    exit
fi

if [ ! -f "$2/LC_MESSAGES/$1.po" ]; then
    echo "Error: $2/LC_MESSAGES/$1.po is not exists"
    exit
fi

STAMP=$(date +%s)

mv "$2/LC_MESSAGES/$1.po" "$2/LC_MESSAGES/$1.$STAMP.po"
msgmerge -o "$2/LC_MESSAGES/$1.po" "$2/LC_MESSAGES/$1.$STAMP.po" "$1.pot"

cmp -s "$2/LC_MESSAGES/$1.po" "$2/LC_MESSAGES/$1.$STAMP.po"

if [ $? -eq 0 ] ; then
    echo "Noting new to merge"
    rm -f "$2/LC_MESSAGES/$1.$STAMP.po"
else
    echo "Backup created into $2/LC_MESSAGES/$1.$STAMP.po"
fi
