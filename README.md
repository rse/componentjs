ComponentJS -- Component System for JavaScript <http://componentjs.com>
Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>

License
=======

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.

Elevator Pitch
==============

ComponentJS is a stand-alone MPL-licensed Open Source library
for JavaScript, providing a powerful Component System for
hierarchically structuring the User-Interface (UI) dialogs of
complex HTML5-based Rich Clients (aka Single-Page-Apps) — under
maximum applied Separation of Concerns (SoC) architecture principle,
through optional Model, View and Controller component roles, with
sophisticated hierarchical Event, Service, Hook, Model, Socket and
Property mechanisms, and fully independent and agnostic of the
particular UI widget toolkit.

Building
========

The ComponentJS build process is split into three stages. The
following Unix tools have to be installed. The ComponentJS author
uses an OpenPKG-based software-stack for this. The Unix program
names which have to be in $PATH are given brackets. The OpenPKG
package names which have to be installed are given in parenthesis.

Common (mandatory)
------------------

- OpenPKG
  http://www.openpkg.org/
  (OpenPKG "openpkg")

- GNU Make [make]
  http://www.gnu.org/software/make/
  (OpenPKG "make")

- GNU Portable Shell Tool [shtool]
  http://www.gnu.org/software/shtool/
  (OpenPKG "shtool")

Stage 1 (mandatory)
-------------------

- Perl [perl]
  http://www.perl.org/
  (OpenPKG "perl")

- Google Closure Compiler [closure-compiler]
  http://code.google.com/closure/compiler/
  (OpenPKG "closurecompiler")

Stage 1 (optional)
------------------

- UglifyJS [uglifyjs]
  https://github.com/mishoo/UglifyJS
  (OpenPKG "uglifyjs")

- Yahoo! UI Compressor [yuicompressor]
  http://developer.yahoo.com/yui/compressor/
  (OpenPKG "yuicompressor")

Stage 2 (mandatory)
-------------------

- Google Closure Linter [gjslint]
  http://code.google.com/p/closure-linter/
  (OpenPKG "closurelinter")

- JSHint [jshint]
  http://www.jshint.com/
  (OpenPKG "jshint")

Stage 3 (mandatory)
-------------------

- Perl [perl]
  http://www.perl.org/
  (OpenPKG "perl")

- W3M [w3m]
  http://w3m.sourceforge.net/
  (OpenPKG "w3m")

- PrinceXML [prince]
  http://www.princexml.com/
  (OpenPKG "prince")

