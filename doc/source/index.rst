fg-voting-app-nodejs documentation
===============================================

.. toctree::
   :maxdepth: 10
   :hidden:

   Prerequisites <prerequisites/_index>   
   backend_obs <backend_obs/_index>
   VoteApp <VoteApp/_index>
   ShowResult <ShowResult/_index>
   QRCode <QRCode/_index>
   Terraform <terraform/_index>


A simple example application demonstrating usage of
FunctionGraph functions written in Node.JS on T Cloud Public.

 .. thumbnail:: ../../overview.drawio.svg
    :width: 600px
    :alt: Architecture diagram
    :title: Architecture diagram


What will be demonstrated
--------------------------

- creating FunctionGraph **HTTP function**
- creating FunctionGraph **Event function**
- FunctionGraph functions using **APIG triggers**
- calling FunctionGraph function using **signed requests** with:

  - **SecurityAccessKey**
  - **SecuritySecretKey**
  - **SecurityToken**

- calling FunctionGraph function using **Token**
- accessing **OBS buckets**
- packaging functions for deployment
- deploying using **terraform scripts**


Source Code
-----------

For source code, see :github_repo_master:`fg-voting-app-nodejs<>` on GitHub.


Documentation from source
-----------------------------------

This documentation is written using `Sphinx <https://www.sphinx-doc.org/en/master/index.html>`_
and `reStructuredText <https://www.sphinx-doc.org/en/master/usage/restructuredtext/index.html>`_.

.. note::

  To run documentation from source,
  install ``tox`` using `tox installation guide <https://tox.wiki/en/4.26.0/installation.html>`_
  and execute in root folder:

  .. code-block:: shell

     tox -e docs-auto

Warranty Disclaimer
---------------------

.. note:: 

    THE OPEN SOURCE SOFTWARE IN THIS PRODUCT IS DISTRIBUTED IN THE HOPE THAT IT
    WILL BE USEFUL,BUT WITHOUT ANY WARRANTY; WITHOUT EVEN THE IMPLIED WARRANTY
    OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.

    SEE THE APPLICABLE LICENSES FOR MORE DETAILS.
