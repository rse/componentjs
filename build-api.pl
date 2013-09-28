##
##  ComponentJS -- Component System for JavaScript <http://componentjs.com>
##  Copyright (c) 2009-2013 Ralf S. Engelschall <http://engelschall.com>
##
##  This Source Code Form is subject to the terms of the Mozilla Public
##  License, v. 2.0. If a copy of the MPL was not distributed with this
##  file, You can obtain one at http://mozilla.org/MPL/2.0/.
##

use IO::File;

#   command-line arguments
my ($filename_txt, $filename_tmpl, $filename_html, $version) = @ARGV;

#   read textual description and template
my $fp = new IO::File "<$filename_txt"; $txt = ""; $txt .= $_ while (<$fp>); $fp->close();
$fp = new IO::File "<$filename_tmpl"; $tmpl = ""; $tmpl .= $_ while (<$fp>); $fp->close();

#   replace version information
$tmpl =~ s/0\.0\.0/$version/s;

#   start generating
my $html_spec = "";
my $html_navi = "";

#   duplication removal cache
my $cache = {};
my $defined = {};

#   remove comments
$txt =~ s/^#.*$//mg;

#   parse first-level structure
$txt =~ s/
    (?<=\n)([A-Z][^\n]+)\n  # headline
    ---+[ \t]*\n            # underlining
    (.+?\n)                 # body
    (?= [A-Z][^\n]+?\n      # following headline
        ---+[ \t]*\n        # corresponding underlining
    |   $             )     # or at end file
/
    parse2($1, $2), ''
/sgex;

#   process first-level structure
sub parse2 {
    my ($title, $body) = @_;

    #   generate body headline
    $html_spec .= "<h2>" . mklink(1, $title) . "</h2>\n";

    #   start navigation entry
    $html_navi .= "<h2>" . mklink(0, $title) . "</h2>\n";
    $html_navi .= "<ul>\n";

    #   parse second-level structure (part 1)
    $body =~ s/
        ^(.+?\n)           # intro paragraph
        (?=\n-[ \t]+\S+)   # start of first function
    /
        $html_spec .= "<div class=\"intro\">" . addpara(conv(0, $1)) . "<\/div>", ''
    /sex;
    sub addpara {
        my ($txt) = @_;
        $txt =~ s/(\n).[ \t]+([^\n]*(?:\n[ \t]+[^\n]+)*)/$1<li>$2<\/li>/sg;
        $txt =~ s/(\n\n)(<li>)/$1<ul>$2/sg;
        $txt =~ s/(<\/li>)(\n\n)/$1<\/ul>$2/sg;
        $txt =~ s/\n{2,}/<p\/>\n/sg;
        return $txt;
    }

    #   parse second-level structure (part 2)
    $body =~ s/
        (?<= \n)
        -[ \t]+(\S+.+?)    # function start
        (?= -[ \t]+\S+     # start of next function
        |   $         )    # or end of file
    /
        parse3($title, $1), ''
    /sgex;

    #   process third-level structure
    sub parse3 {
        my ($title, $body) = @_;

        $html_spec .= "<ul>\n";

        #   parse forth-level structure
        $body =~ s/
            ^
            (.+?)\n   #  synopsis
            \n        #  blank line
            (.+)      #  body
            $
        /
            parse4($title, $1, $2), ''
        /sex;

        #   process forth-level structure
        sub parse4 {
            my ($title, $synopsis, $body) = @_;

            $html_spec .= "<li>";

            #   parse fifth-level structure (part 1)
            my $txt = $synopsis;
            $txt =~ s/
                M<(.+?)>
            /
                parse5a($title, $1), ''
            /sgex;

            #   process fifth-level structure
            sub parse5a {
                my ($title, $txt) = @_;

                if (not exists $cache->{$title . ":" . $txt}) {
                    $html_navi .= "<li>" . mklink(0, $txt) . "<\/li>";
                    $cache->{$title . ":" . $txt} = 1;
                }
            }

            $html_spec .= "<div class=\"synopsis\">";
            $synopsis =~ s/[ \t]{2,}/ /sg;
            $synopsis = conv(1, $synopsis);
            $synopsis =~ s/(\[|\]|:|\s+=\s+)/<span class=\"meta\">$1<\/span>/sg;
            $synopsis =~ s/;/<\/div><div class="synopsis">/sg;
            $synopsis =~ s/\(\s+/(/sg;
            $synopsis =~ s/\s+\)/)/sg;
            $html_spec .= "$synopsis\n";
            $html_spec .= "</div>";

            #   parse fifth-level structure (part 2)
            my $txt = $body;
            $txt =~ s/
                (.+?\n)
                (?= \n | $ )
            /
                parse5b($1), ''
            /sgex;

            #   process fifth-level structure
            sub parse5b {
                my ($txt) = @_;

                if ($txt =~ m/^\s*\|\s/s) {
                    $txt =~ s/^\s*\|\s//mg;
                    $txt = conv(0, $txt);
                    $txt =~ s/\n+$//s;
                    $txt =~ s/^\s+//s;
                    $html_spec .= "<div class=\"example\">";
                    $html_spec .= "$txt\n";
                    $html_spec .= "</div>";
                }
                elsif ($txt =~ m/^\s*\.\s/s) {
                    $txt =~ s/([ \t]+)\.([ \t]+)(.+?\n(?:\1 \2.*?\n)*)/<li>$3<\/li>/sg;
                    $txt = conv(0, $txt);
                    $html_spec .= "<ul class=\"list\">";
                    $html_spec .= "$txt\n";
                    $html_spec .= "</ul>";
                }
                elsif ($txt =~ m/^\s*\+\s/s) {
                    $txt =~ s/^\s*\+\s//mg;
                    $txt = conv(0, $txt);
                    $txt =~ s/^(.*)$/<tr><td>$1<\/td><\/tr>/mg;
                    $txt =~ s/(\s+)\+(\s+)/<\/td><td>/sg;
                    $html_spec .= "<table class=\"tabular\">";
                    $html_spec .= "$txt\n";
                    $html_spec .= "</table>";
                }
                else {
                    $txt = conv(0, $txt);
                    $txt =~ s/[ \t]{2,}/ /sg;
                    $html_spec .= "<div class=\"desc\">";
                    $html_spec .= "$txt\n";
                    $html_spec .= "</div>";
                }
            }

            $html_spec .= "</li>";
        }

        $html_spec .= "</ul>\n";
    }

    #   finish navigation entry
    $html_navi .= "</ul>\n";
}

#   create an id suitable for HTML anchors/hyperlinks
sub mkid {
    my ($id) = @_;
    $id = lc($id);
    $id =~ s/\s+/_/sg;
    $id =~ s/-/_/sg;
    return $id;
}

#   convert text (either with anchors or hyperlinks)
sub conv {
    my ($anchor, $txt) = @_;

    #   convert types
    $txt =~ s/R<([^\/].*?)>/"<span class=\"R\">" . mklink($anchor, $1) . "<\/span>"/sge;
    $txt =~ s/M<([^\/].*?)>/"<span class=\"M\">" . mklink($anchor, $1) . "<\/span>"/sge;
    $txt =~ s/P<([^\/].*?)>/<span class="P">$1<\/span>/sg;
    $txt =~ s/F<([^\/].*?)>/<span class="F">$1<\/span>/sg;
    $txt =~ s/T<([^\/].*?)>/<span class="T">$1<\/span>/sg;
    $txt =~ s/O<([^\/].*?)>/<span class="O">$1<\/span>/sg;
    $txt =~ s/C<([^\/].*?)>/<code>$1<\/code>/sg;
    $txt =~ s/I<([^\/].*?):(\d+)>/<img style="float: right;" src="$1" width="$2"\/>/sg;

    #   convert typography aspects
    $txt =~ s/->/&rarr;/sg;
    $txt =~ s/<-/&larr;/sg;
    $txt =~ s/--/&mdash;/sg;
    $txt =~ s/(FIXME|TODO)/<span class="$1">$1<\/span>/sg;

    #   convert double-type
    sub mklink {
        my ($anchor, $name) = @_;
        my $id = mkid($name);
        if ($anchor) {
            if (not exists $defined->{$id}) {
                $defined->{$id} = 1;
                return "<a name=\"$id\">$name</a>";
            }
            else {
                return "$name";
            }
        }
        else {
            return "<a href=\"#$id\">$name</a>";
        }
    }

    return $txt;
}

#   finish generating
$tmpl =~ s/\@SPEC\@/$html_spec/s;
$tmpl =~ s/\@NAVI\@/$html_navi/s;

#   write result document
$fp = new IO::File ">$filename_html";
$fp->print($tmpl);
$fp->close();

