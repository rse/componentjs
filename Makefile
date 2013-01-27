##
##  ComponentJS -- Component System for JavaScript <http://componentjs.com>
##  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
##
##  This Source Code Form is subject to the terms of the Mozilla Public
##  License, v. 2.0. If a copy of the MPL was not distributed with this
##  file, You can obtain one at http://mozilla.org/MPL/2.0/.
##

PERL            = perl
SHTOOL          = shtool
CLOSURECOMPILER = closure-compiler \
	              --warning_level DEFAULT \
	              --compilation_level SIMPLE_OPTIMIZATIONS \
				  --language_in ECMASCRIPT5 \
				  --third_party
UGLIFYJS        = uglifyjs \
                  --no-dead-code \
				  --no-copyright \
				  --max-line-len 512
YUICOMPRESSOR   = yuicompressor \
                  --type js \
				  --line-break 512
GJSLINT         = gjslint
JSLINT          = jslint \
                  +indent=4 +maxerr=100 -anon +browser +continue \
				  +eqeq -evil +nomen +plusplus -passfail +regexp \
				  +unparam +sloppy +vars +white

VERSION_MAJOR   = 0
VERSION_MINOR   = 0
VERSION_MICRO   = 0
VERSION_DATE    = 00000000
VERSION         = $(VERSION_MAJOR).$(VERSION_MINOR).$(VERSION_MICRO)

SOURCE          = component.js \
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

TARGET          = build/component-$(VERSION).js \
                  build/component-$(VERSION).min.js

all: $(TARGET) lint1

build/component-$(VERSION).js: $(SOURCE)
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ assembling build/component-$(VERSION).js <- $(SOURCE) (Custom Build Tool)"; \
	$(PERL) build.pl build/component-$(VERSION).js component.js "$(VERSION_MAJOR)" "$(VERSION_MINOR)" "$(VERSION_MICRO)" "$(VERSION_DATE)"

build/component-$(VERSION).min.js: build/component-$(VERSION).js
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ compressing build/component-$(VERSION).min.js <- build/component-$(VERSION).js (Google Closure Compiler)"; \
	$(CLOSURECOMPILER) \
	    --js_output_file build/component-$(VERSION).min.js \
	    --js build/component-$(VERSION).js && \
	(sed -e '/(function/,$$d' component.js; cat build/component-$(VERSION).min.js) >build/.tmp && \
	cp build/.tmp build/component-$(VERSION).min.js && rm -f build/.tmp

build/component-$(VERSION).min-ug.js: build/component-$(VERSION).js
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ compressing build/component-$(VERSION).min-ug.js <- build/component-$(VERSION).js (UglifyJS)"; \
	$(UGLIFYJS) \
	    -o build/component-$(VERSION).min-ug.js \
	    build/component-$(VERSION).js && \
	(sed -e '/(function/,$$d' component.js; cat build/component-$(VERSION).min-ug.js) >build/.tmp && \
	cp build/.tmp build/component-$(VERSION).min-ug.js && rm -f build/.tmp

build/component-$(VERSION).min-yc.js: build/component-$(VERSION).js
	@$(SHTOOL) mkdir -f -p -m 755 build
	@echo "++ compressing build/component-$(VERSION).min-ug.js <- build/component-$(VERSION).js (Yahoo UI Compressor)"; \
	$(YUICOMPRESSOR) \
	    -o build/component-$(VERSION).min-yc.js \
	    build/component-$(VERSION).js && \
	(sed -e '/(function/,$$d' component.js; cat build/component-$(VERSION).min-yc.js) >build/.tmp && \
	cp build/.tmp build/component-$(VERSION).min-yc.js && rm -f build/.tmp

lint: lint1

lint1: build/component-$(VERSION).js
	@echo "++ linting build/component-$(VERSION).js (Google Closure Linter)"; \
	$(GJSLINT) build/component-$(VERSION).js |\
	egrep -v "E:(0001|0131|0110)" | grep -v "FILE  :" | sed -e '/^Found/,$$d'

lint2: build/component-$(VERSION).js
	@echo "++ linting build/component-$(VERSION).js (JSLint)"; \
	$(JSLINT) build/component-$(VERSION).js

clean:
	@echo "++ removing build/component-$(VERSION).js"; rm -f build/component-$(VERSION).js
	@echo "++ removing build/component-$(VERSION).min.js"; rm -f build/component-$(VERSION).min.js
	@echo "++ removing build/component-$(VERSION).min-ug.js"; rm -f build/component-$(VERSION).min-ug.js
	@echo "++ removing build/component-$(VERSION).min-yc.js"; rm -f build/component-$(VERSION).min-yc.js
	@echo "++ removing build"; rmdir build >/dev/null 2>&1 || true

