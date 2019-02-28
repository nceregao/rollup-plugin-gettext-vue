#!/bin/sh

cd `dirname $0`;

if [ $# -lt 2 ] ; then
    echo "No arguments supplied.\nUse $0 namespace ru_UA.UTF-8|ru_RU.UTF-8|...\nExample: $0 wucmf uk_UA"
    exit
fi

if [ ! -f "$1.pot" ]; then
    echo "Error: $1.pot is not exists"
    exit
fi


if [ ! -d "$2" ]; then
    mkdir -p $2/LC_MESSAGES
    ln -s . $2/C
elif [ ! -h "$2/C" ]; then
    ln -s . $2/C
fi

msginit --input="$1.pot" --no-translator --locale=$2 --output-file=$2/LC_MESSAGES/$1.po
