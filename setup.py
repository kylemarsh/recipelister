#!/usr/bin/env python

PROJECT = 'recipelister'
VERSION = '0.2'

from setuptools import setup, find_packages


long_description = ''

setup(
    name=PROJECT,
    version=VERSION,
    description='flask webapp for organizing and searching recipes',
    long_description=long_description,
    author='Kyle Marsh',
    author_email='kyle.marsh@quixoticflame.net',
    url='...',
    download_url='...',
    scripts=[],
    provides=[],
    install_requires=['flask', 'flask-sqlalchemy', 'flask-login',
        'flask-wtf', 'mysql-python', 'sqlalchemy', 'WTForms'],
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    )
