##
##  ComponentJS -- Component System for JavaScript <http://componentjs.com>
##  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
##
##  This Source Code Form is subject to the terms of the Mozilla Public
##  License, v. 2.0. If a copy of the MPL was not distributed with this
##  file, You can obtain one at http://mozilla.org/MPL/2.0/.
##

#   tools mandatory for stage0
PERL            = perl
SHTOOL          = shtool

#   tools mandatory for stage1
CLOSURECOMPILER = closure-compiler \
                  --warning_level DEFAULT \
                  --compilation_level SIMPLE_OPTIMIZATIONS \
                  --language_in ECMASCRIPT5 \
                  --third_party

#   tools mandatory for stage2
GJSLINT         = gjslint
JSHINT          = jshint \
                  --config jshint.json

#   tools optional for stage2
UGLIFYJS        = uglifyjs \
                  --mangle \
                  --compress
YUICOMPRESSOR   = yuicompressor \
                  --type js \
                  --line-break 512

#   tools mandatory for stage3
W3M             = w3m
PRINCE          = prince

#   current version
VERSION_MAJOR   = 0
VERSION_MINOR   = 9
VERSION_MICRO   = 9
VERSION_DATE    = 20130510
VERSION         = $(VERSION_MAJOR).$(VERSION_MINOR).$(VERSION_MICRO)

#   make plugin (stage 0)
MAKE_PLUGIN_STAGE0 = \
                  echo "++ assembling build/component.plugin.$$NAME.js <- component.plugin.$$NAME.js (Custom Build Tool)"; \
                  $(SHTOOL) mkdir -f -p -m 755 build; \
                  $(PERL) build-src.pl build/component.plugin.$$NAME.js component.plugin.$$NAME.js \
                      "$(VERSION_MAJOR)" "$(VERSION_MINOR)" "$(VERSION_MICRO)" "$(VERSION_DATE)"; \

#   make plugin (stage 1)
MAKE_PLUGIN_STAGE1 = \
                  echo "++ linting build/component.plugin.$$NAME.js (Google Closure Linter)"; \
                  $(GJSLINT) build/component.plugin.$$NAME.js | \
                  egrep -v "E:(0001|0131|0110)" | grep -v "FILE  :" | sed -e '/^Found/,$$d'; \
                  echo "++ linting build/component.plugin.$$NAME.js (JSHint)"; \
                  $(JSHINT) build/component.plugin.$$NAME.js; \
                  echo "++ compressing build/component.plugin.$$NAME.min.js <- build/component.plugin.$$NAME.js (Google Closure Compiler)"; \
                  $(CLOSURECOMPILER) \
                  --js_output_file build/component.plugin.$$NAME.min.js \
                  --js build/component.plugin.$$NAME.js && \
                  (sed -e '/^$$/,$$d' component.plugin.$$NAME.js; echo ""; cat build/component.plugin.$$NAME.min.js) >build/.tmp && \
                  cp build/.tmp build/component.plugin.$$NAME.min.js && rm -f build/.tmp

#   list of all library files
LIB_SRC         = component.js \
                  component-0-glob-0-ns.js \
                  component-0-glob-1-version.js \
                  component-1-util-0-runtime.js \
                  component-1-util-1-object.js \
                  component-1-util-2-array.js \
                  component-1-util-3-token.js \
                  component-1-util-4-validate.js \
                  component-1-util-5-params.js \
                  component-1-util-6-encoding.js \
                  component-1-util-7-identifier.js \
                  component-1-util-8-proxy.js \
                  component-1-util-9-attribute.js \
                  component-1-util-A-hook.js \
                  component-2-clzz-0-common.js \
                  component-2-clzz-1-api.js \
                  component-3-patt-0-base.js \
                  component-3-patt-1-tree.js \
                  component-3-patt-2-config.js \
                  component-3-patt-3-spool.js \
                  component-3-patt-4-property.js \
                  component-3-patt-5-spec.js \
                  component-3-patt-6-observable.js \
                  component-3-patt-7-event.js \
                  component-3-patt-8-cmd.js \
                  component-3-patt-9-state.js \
                  component-3-patt-A-service.js \
                  component-3-patt-B-shadow.js \
                  component-3-patt-C-socket.js \
                  component-3-patt-D-hook.js \
                  component-3-patt-E-marker.js \
                  component-3-patt-F-store.js \
                  component-3-patt-G-model.js \
                  component-4-comp-0-define.js \
                  component-4-comp-1-bootstrap.js \
                  component-4-comp-2-lookup.js \
                  component-4-comp-3-manage.js \
                  component-4-comp-4-states.js \
                  component-5-glob-0-export.js \
                  component-5-glob-1-plugin.js
LIB_BLD         = build/component.js
LIB_MIN         = build/component.min.js

#   list of all plugin files
PLG_SRC         = component.plugin.debugger.js \
                  component.plugin.jquery.js \
                  component.plugin.extjs.js
PLG_BLD         = build/component.plugin.debugger.js \
                  build/component.plugin.jquery.js \
                  build/component.plugin.extjs.js \
                  build/component.plugin.localstorage.js \
                  build/component.plugin.values.js
PLG_MIN         = build/component.plugin.debugger.min.js \
                  build/component.plugin.jquery.min.js \
                  build/component.plugin.extjs.min.js \
                  build/component.plugin.localstorage.min.js \
                  build/component.plugin.values.min.js

#   list of all linting files
LNT_SRC         = build/component.js
LNT_BLD         = build/.linted.gcl \
                  build/.linted.jshint

#   list of all api files
API_SRC         = component-api.tmpl \
                  component-api.txt
API_BLD         = build/component-api.screen.html \
                  build/component-api.screen.txt \
                  build/component-api.print-us.pdf \
                  build/component-api.print-a4.pdf

#   standard targets
all:   stage1 stage2 stage3
build: stage1        stage3
lint:  stage2

#   standard stages
stage0: $(LIB_BLD) $(PLG_BLD)
stage1: $(LIB_MIN) $(PLG_MIN)
stage2: $(LNT_BLD)
stage3: $(API_BLD)

#   assemble the JavaScript library
build/component.js: $(LIB_SRC)
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ assembling build/component.js <- $(LIB_SRC) (Custom Build Tool)"; \
	$(PERL) build-src.pl build/component.js component.js \
	    "$(VERSION_MAJOR)" "$(VERSION_MINOR)" "$(VERSION_MICRO)" "$(VERSION_DATE)"

#   minify/compress the JavaScript library (with Google Closure Compiler)
build/component.min.js: build/component.js
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ compressing build/component.min.js <- build/component.js (Google Closure Compiler)"; \
	$(CLOSURECOMPILER) \
	    --js_output_file build/component.min.js \
	    --js build/component.js && \
	(sed -e '/(function/,$$d' component.js; cat build/component.min.js) >build/.tmp && \
	cp build/.tmp build/component.min.js && rm -f build/.tmp

#   minify/compress the JavaScript library (with UglifyJS)
build/component.min-ug.js: build/component.js
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ compressing build/component.min-ug.js <- build/component.js (UglifyJS)"; \
	$(UGLIFYJS) \
	    -o build/component.min-ug.js \
	    build/component.js && \
	(sed -e '/(function/,$$d' component.js; cat build/component.min-ug.js) >build/.tmp && \
	cp build/.tmp build/component.min-ug.js && rm -f build/.tmp

#   minify/compress the JavaScript library (with Yahoo Compressor)
build/component.min-yc.js: build/component.js
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ compressing build/component.min-ug.js <- build/component.js (Yahoo UI Compressor)"; \
	$(YUICOMPRESSOR) \
	    -o build/component.min-yc.js \
	    build/component.js && \
	(sed -e '/(function/,$$d' component.js; cat build/component.min-yc.js) >build/.tmp && \
	cp build/.tmp build/component.min-yc.js && rm -f build/.tmp

#   lint assembled JavaScript library (Google Closure Linter)
build/.linted.gcl: build/component.js
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ linting build/component.js (Google Closure Linter)"; \
	$(GJSLINT) build/component.js | \
	egrep -v "E:(0001|0131|0110)" | grep -v "FILE  :" | sed -e '/^Found/,$$d'; \
	touch build/.linted.gcl

#   lint assembled JavaScript library (JSHint)
build/.linted.jshint: build/component.js
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ linting build/component.js (JSHint)"; \
	$(JSHINT) build/component.js; \
	touch build/.linted.jshint

#   plugins
build/component.plugin.debugger.js: component.plugin.debugger.js \
    component.plugin.debugger-hooks.js component.plugin.debugger-logbook.js \
	component.plugin.debugger-infobox.js component.plugin.debugger-jquery.js \
    component.plugin.debugger-view.js component.plugin.debugger-window.js \
    component.plugin.debugger-render.js
	@NAME="debugger"; $(MAKE_PLUGIN_STAGE0)
build/component.plugin.debugger.min.js: build/component.plugin.debugger.js
	@NAME="debugger"; $(MAKE_PLUGIN_STAGE1)
build/component.plugin.jquery.js: component.plugin.jquery.js
	@NAME="jquery"; $(MAKE_PLUGIN_STAGE0)
build/component.plugin.jquery.min.js: build/component.plugin.jquery.js
	@NAME="jquery"; $(MAKE_PLUGIN_STAGE1)
build/component.plugin.extjs.js: component.plugin.extjs.js
	@NAME="extjs"; $(MAKE_PLUGIN_STAGE0)
build/component.plugin.extjs.min.js: build/component.plugin.extjs.js
	@NAME="extjs"; $(MAKE_PLUGIN_STAGE1)
build/component.plugin.localstorage.js: component.plugin.localstorage.js
	@NAME="localstorage"; $(MAKE_PLUGIN_STAGE0)
build/component.plugin.localstorage.min.js: build/component.plugin.localstorage.js
	@NAME="localstorage"; $(MAKE_PLUGIN_STAGE1)
build/component.plugin.values.js: component.plugin.values.js
	@NAME="values"; $(MAKE_PLUGIN_STAGE0)
build/component.plugin.values.min.js: build/component.plugin.values.js
	@NAME="values"; $(MAKE_PLUGIN_STAGE1)

#   build API documentation in screen HTML format
build/component-api.screen.html: component-api.txt component-api.tmpl
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ generating build/component-api.screen.html <- component-api.txt component-api.tmpl (Custom Build Tool)"; \
	$(PERL) build-api.pl component-api.txt component-api.tmpl build/component-api.screen.html "$(VERSION)"

#   build API documentation in screen TXT format
build/component-api.screen.txt: build/component-api.screen.html
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ generating build/component-api.screen.txt <- build/component-api.screen.html (W3M)"; \
	$(W3M) -dump build/component-api.screen.html >build/component-api.screen.txt

#   build API documentation in print PDF (A4 paper) format
build/component-api.print-a4.pdf: build/component-api.screen.html
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ generating build/component-api.print-a4.pdf <- build/component-api.screen.html (PrinceXML)"; \
    echo "@media print { @page { size: A4 !important; } }" >build/component-api.paper.css; \
	$(PRINCE) --style build/component-api.paper.css -o build/component-api.print-a4.pdf build/component-api.screen.html; \
	rm -f build/component-api.paper.css

#   build API documentation in print PDF (US paper) format
build/component-api.print-us.pdf: build/component-api.screen.html
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ generating build/component-api.print-us.pdf <- build/component-api.screen.html (PrinceXML)"; \
    echo "@media print { @page { size: US-Letter !important; } }" >build/component-api.paper.css; \
	$(PRINCE) --style build/component-api.paper.css -o build/component-api.print-us.pdf build/component-api.screen.html; \
	rm -f build/component-api.paper.css

#   remove all target/build files
clean:
	@echo "++ removing build/component.js"; rm -f build/component.js
	@echo "++ removing build/component.min.js"; rm -f build/component.min.js
	@echo "++ removing build/component.min-ug.js"; rm -f build/component.min-ug.js
	@echo "++ removing build/component.min-yc.js"; rm -f build/component.min-yc.js
	@echo "++ removing build/component-api.screen.html"; rm -f build/component-api.screen.html
	@echo "++ removing build/component-api.screen.txt"; rm -f build/component-api.screen.txt
	@echo "++ removing build/component-api.print-us.pdf"; rm -f build/component-api.print-us.pdf
	@echo "++ removing build/component-api.print-a4.pdf"; rm -f build/component-api.print-a4.pdf
	@echo "++ removing build/component.plugin.*.js"; rm -f build/component.plugin.*.js
	@rm -f build/.linted.* >/dev/null 2>&1 || true
	@rmdir build >/dev/null 2>&1 || true

#   create a release distribution
release: stage1 stage2 stage3 stage4
	@echo "++ rolling release tarball ComponentJS-$(VERSION).tar.gz"; \
	$(SHTOOL) tarball -c "gzip -9" -e "ComponentJS-*,.git,.gitignore,build/.linted*" -o ComponentJS-$(VERSION).tar.gz .; \
	ls -l ComponentJS-$(VERSION).tar.gz

#   create a snapshot distribution
snapshot: stage1 stage2 stage3 stage4
	@echo "++ rolling snapshot tarball ComponentJS-SNAPSHOT.tar.gz"; \
	$(SHTOOL) tarball -c "gzip -9" -e "ComponentJS-*,.git,.gitignore,build/.linted*" -o ComponentJS-SNAPSHOT.tar.gz .; \
	ls -l ComponentJS-SNAPSHOT.tar.gz

