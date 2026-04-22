#!/bin/bash
# Postpack script to create a zip file from the npm package tarball
# This script is intended to be run on Linux using bash.
# It extracts the contents of the npm package tarball, creates a zip file from it, 
# and then cleans up the tarball.
echo "Running postpack script for Linux"
rm -f ${npm_package_name}-${npm_package_version}.zip 
tarball=${npm_package_name}-${npm_package_version}.tgz
tar -tf $tarball | sed 's/^package\///' | zip -@r ${npm_package_name}-${npm_package_version}.zip
rm $tarball