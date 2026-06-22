Prerequisites
==============

.. toctree::
   :maxdepth: 1
   :hidden:

   Resource: Project <project>
   Resource: API Gateway <apigateway>


Samples are written in Node.JS 20.15.1.

Prerequisites
-----------------

Linux
""""""""""

To install in Node.JS on Linux, follow following steps:

1. Install nvm

    .. code-block:: bash

        # install curl if not available:
        sudo apt install curl
        # remove old versions of nodejs and npm
        sudo apt remove nodejs npm
        # get install scripts and install
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
        # load nvm to be present in current session
        source \~/.nvm/nvm.sh

2. Install node

    .. code-block:: bash

        # install Node.JS version 20.15.1 using nvm
        nvm install 20.15.1

        # select version 20.15.1 for usage
        nvm use 20.15.1

        # check version of node
        node -v
        # check version of npm
        npm -v


3. npm pack makes use of script file npm-scripts/postpack.sh, this file must be executable:

    .. code-block:: bash

        chmod +x npm-scripts/postpack.sh


Windows
""""""""""

To install Node.JS on Windows, follow following steps:

1. Install nvm as described in `[NVM Install <https://www.nvmnode.com/guide/installation.html>`_

2. After installation open a Command shell and execute following:

    .. code-block:: ps1

        # install Node.JS version 20.15.1 using nvm
        nvm install 20.15.1

        # select version 20.15.1 for usage
        nvm use 20.15.1

        # check version of node
        node -v
        # check version of npm
        npm -v


Proxy configurations
""""""""""""""""""""""""""""""

In case you are behind a proxy, set proxy as follows:

.. code-block:: bash

    # set proxy for nvm
    nvm proxy http://PROXY-HOST:PROXY-PORT

    # set proxy for npm
    npm config set proxy http://PROXY-HOST:PROXY-PORT

GitHub Access
""""""""""""""""""""""""""""""

Some npm packages are hosted on GitHub packages.
To install npm packages from there, a personal access token (PAT) is necessary.
See `[Installing a package <https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package>`_ on GitHub.

In file 

.. literalinclude:: ../../../.npmrc
   :caption: .npmrc
   :language: ini

uncomment the line

.. code-block:: ini

   #//npm.pkg.github.com/:_authToken=TOKEN

by removing `#` and replace `TOKEN` with your PAT.
