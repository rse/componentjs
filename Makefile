##
##  ComponentJS -- Component System for JavaScript <http://componentjs.com>
##  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
##
##  This Source Code Form is subject to the terms of the Mozilla Public
##  License, v. 2.0. If a copy of the MPL was not distributed with this
##  file, You can obtain one at http://mozilla.org/MPL/2.0/.
##

#   tools mandatory for stage1
PERL            = perl
SHTOOL          = shtool
CLOSURECOMPILER = closure-compiler \
	              --warning_level DEFAULT \
	              --compilation_level SIMPLE_OPTIMIZATIONS \
				  --language_in ECMASCRIPT5 \
				  --third_party

#   tools mandatory for stage2
GJSLINT         = gjslint
JSHINT          = jshint \
                  +maxerr=200 +bitwise -camelcase -curly +eqeqeq \
                  -forin +immed +latedef -newcap -noarg -noempty +nonew -plusplus \
                  +quotmark=double -regexp +undef +unused -strict +trailing \
                  +maxparams=9 +maxdepth=4 +maxstatements=120 +maxlen=150 \
                  +loopfunc +browser +node

#   tools optional for stage2
UGLIFYJS        = uglifyjs \
                  --no-dead-code \
				  --no-copyright \
				  --max-line-len 512
YUICOMPRESSOR   = yuicompressor \
                  --type js \
				  --line-break 512

#   tools mandatory for stage3
PRINCE          = prince

#   current version
VERSION_MAJOR   = 0
VERSION_MINOR   = 0
VERSION_MICRO   = 0
VERSION_DATE    = 19700101
VERSION         = $(VERSION_MAJOR).$(VERSION_MINOR).$(VERSION_MICRO)

#   list of all library files
LIB_SRC         = component.js \
                  component-0-glob-0-ns.js \
                  component-0-glob-1-version.js \
                  component-1-util-0-runtime.js \
                  component-1-util-1-object.js \
                  component-1-util-2-array.js \
                  component-1-util-3-params.js \
                  component-1-util-4-encoding.js \
                  component-1-util-5-identifier.js \
                  component-1-util-6-proxy.js \
                  component-1-util-7-attribute.js \
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
                  component-4-comp-1-singleton.js \
                  component-4-comp-2-lookup.js \
                  component-4-comp-3-manage.js \
                  component-4-comp-4-states.js \
                  component-5-dbgr-0-jquery.js \
                  component-5-dbgr-1-view.js \
                  component-6-glob-0-export.js
LIB_BLD         = build/component-$(VERSION).js \
                  build/component-$(VERSION).min.js \

#   list of all linting files
LNT_SRC         = build/component-$(VERSION).js
LNT_BLD         = build/.linted.gcl \
                  build/.linted.jshint

#   list of all api files
API_SRC         = component-api.tmpl \
                  component-api.txt
API_BLD         = build/component-$(VERSION)-api.screen.html \
				  build/component-$(VERSION)-api.print-us.pdf \
				  build/component-$(VERSION)-api.print-a4.pdf

#   standard targets
all:   stage1 stage2 stage3
build: stage1 stage3
lint:  stage2

#   standard stages
stage1: $(LIB_BLD)
stage2: $(LNT_BLD)
stage3: $(API_BLD)

#   assemble the JavaScript library
build/component-$(VERSION).js: $(LIB_SRC)
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ assembling build/component-$(VERSION).js <- $(LIB_SRC) (Custom Build Tool)"; \
	$(PERL) build-src.pl build/component-$(VERSION).js component.js \
	    "$(VERSION_MAJOR)" "$(VERSION_MINOR)" "$(VERSION_MICRO)" "$(VERSION_DATE)"

#   minify/compress the JavaScript library (with Google Closure Compiler)
build/component-$(VERSION).min.js: build/component-$(VERSION).js
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ compressing build/component-$(VERSION).min.js <- build/component-$(VERSION).js (Google Closure Compiler)"; \
	$(CLOSURECOMPILER) \
	    --js_output_file build/component-$(VERSION).min.js \
	    --js build/component-$(VERSION).js && \
	(sed -e '/(function/,$$d' component.js; cat build/component-$(VERSION).min.js) >build/.tmp && \
	cp build/.tmp build/component-$(VERSION).min.js && rm -f build/.tmp

#   minify/compress the JavaScript library (with UglifyJS)
build/component-$(VERSION).min-ug.js: build/component-$(VERSION).js
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ compressing build/component-$(VERSION).min-ug.js <- build/component-$(VERSION).js (UglifyJS)"; \
	$(UGLIFYJS) \
	    -o build/component-$(VERSION).min-ug.js \
	    build/component-$(VERSION).js && \
	(sed -e '/(function/,$$d' component.js; cat build/component-$(VERSION).min-ug.js) >build/.tmp && \
	cp build/.tmp build/component-$(VERSION).min-ug.js && rm -f build/.tmp

#   minify/compress the JavaScript library (with Yahoo Compressor)
build/component-$(VERSION).min-yc.js: build/component-$(VERSION).js
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ compressing build/component-$(VERSION).min-ug.js <- build/component-$(VERSION).js (Yahoo UI Compressor)"; \
	$(YUICOMPRESSOR) \
	    -o build/component-$(VERSION).min-yc.js \
	    build/component-$(VERSION).js && \
	(sed -e '/(function/,$$d' component.js; cat build/component-$(VERSION).min-yc.js) >build/.tmp && \
	cp build/.tmp build/component-$(VERSION).min-yc.js && rm -f build/.tmp

#   lint assembled JavaScript library (Google Closure Linter)
build/.linted.gcl: build/component-$(VERSION).js
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ linting build/component-$(VERSION).js (Google Closure Linter)"; \
	$(GJSLINT) build/component-$(VERSION).js | \
	egrep -v "E:(0001|0131|0110)" | grep -v "FILE  :" | sed -e '/^Found/,$$d'; \
	touch build/.linted.gcl

#   lint assembled JavaScript library (JSHint)
build/.linted.jshint: build/component-$(VERSION).js
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ linting build/component-$(VERSION).js (JSHint)"; \
	$(JSHINT) build/component-$(VERSION).js; \
	touch build/.linted.jshint

#   build API documentation in screen HTML format
build/component-$(VERSION)-api.screen.html: component-api.txt component-api.tmpl
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ generating build/component-$(VERSION)-api.screen.html <- component-api.txt component-api.tmpl (Custom Build Tool)"; \
	$(PERL) build-api.pl component-api.txt component-api.tmpl build/component-$(VERSION)-api.screen.html

#   build API documentation in print PDF (A4 paper) format
build/component-$(VERSION)-api.print-a4.pdf: build/component-$(VERSION)-api.screen.html
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ generating build/component-$(VERSION)-api.print-a4.pdf <- build/component-$(VERSION)-api.screen.html (PrinceXML)"; \
    echo "@media print { @page { size: A4 !important; } }" >build/component-api.paper.css; \
	$(PRINCE) --style build/component-api.paper.css -o build/component-$(VERSION)-api.print-a4.pdf build/component-$(VERSION)-api.screen.html; \
	rm -f build/component-api.paper.css

#   build API documentation in print PDF (US paper) format
build/component-$(VERSION)-api.print-us.pdf: build/component-$(VERSION)-api.screen.html
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ generating build/component-$(VERSION)-api.print-us.pdf <- build/component-$(VERSION)-api.screen.html (PrinceXML)"; \
    echo "@media print { @page { size: US-Letter !important; } }" >build/component-api.paper.css; \
	$(PRINCE) --style build/component-api.paper.css -o build/component-$(VERSION)-api.print-us.pdf build/component-$(VERSION)-api.screen.html; \
	rm -f build/component-api.paper.css

#   remove all target/build files
clean:
	@echo "++ removing build/component-$(VERSION).js"; rm -f build/component-$(VERSION).js
	@echo "++ removing build/component-$(VERSION).min.js"; rm -f build/component-$(VERSION).min.js
	@echo "++ removing build/component-$(VERSION).min-ug.js"; rm -f build/component-$(VERSION).min-ug.js
	@echo "++ removing build/component-$(VERSION).min-yc.js"; rm -f build/component-$(VERSION).min-yc.js
	@echo "++ removing build/component-$(VERSION)-api.screen.html"; rm -f build/component-$(VERSION)-api.screen.html
	@echo "++ removing build/component-$(VERSION)-api.print-us.pdf"; rm -f build/component-$(VERSION)-api.print-us.pdf
	@echo "++ removing build/component-$(VERSION)-api.print-a4.pdf"; rm -f build/component-$(VERSION)-api.print-a4.pdf
	@rm -f build/.linted.* >/dev/null 2>&1 || true
	@rmdir build >/dev/null 2>&1 || true

#   create a release distribution
release: build
	$(SHTOOL) tarball -c "gzip -9" -e "componentjs-*,.git,.gitignore" -o componentjs-$(VERSION).tar.gz .

